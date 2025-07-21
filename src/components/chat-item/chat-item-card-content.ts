/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement, getTypewriterPartsCss } from '../../helper/dom';
import { CardRenderDetails, CodeBlockActions, OnCodeBlockActionFunction, OnCopiedToClipboardFunction, ReferenceTrackerInformation } from '../../static';
import { CardBody } from '../card/card-body';
import { generateUID } from '../../helper/guid';

const TYPEWRITER_STACK_TIME = 500;
export interface ChatItemCardContentProps {
  body?: string | null;
  editable?: boolean;
  onEdit?: (newText: string) => void;
  testId?: string;
  renderAsStream?: boolean;
  classNames?: string[];
  unlimitedCodeBlockHeight?: boolean;
  hideCodeBlockLanguage?: boolean;
  wrapCode?: boolean;
  codeReference?: ReferenceTrackerInformation[] | null;
  onAnimationStateChange?: (isAnimating: boolean) => void;
  contentProperties?: {
    codeBlockActions?: CodeBlockActions;
    onLinkClick?: (url: string, e: MouseEvent) => void;
    onCopiedToClipboard?: OnCopiedToClipboardFunction;
    onCodeBlockAction?: OnCodeBlockActionFunction;
  };
  children?: Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject>;
}
export class ChatItemCardContent {
  private props: ChatItemCardContentProps;
  render: ExtendedHTMLElement;
  contentBody: CardBody | null = null;
  private readonly updateStack: Array<Partial<ChatItemCardContentProps>> = [];
  private typewriterItemIndex: number = 0;
  private readonly typewriterId: string = `typewriter-card-${generateUID()}`;
  private lastAnimationDuration: number = 0;
  private updateTimer: ReturnType<typeof setTimeout> | undefined;
  private textareaEl?: HTMLTextAreaElement;
  private isTransitioning: boolean = false;
  private pendingUpdates: Array<Partial<ChatItemCardContentProps>> = [];
  constructor (props: ChatItemCardContentProps) {
    this.props = props;

    if (props.editable === true) {
      this.contentBody = null;
      this.render = this.createEditableTextarea();
      return;
    }

    this.contentBody = this.getCardContent();
    this.render = this.contentBody.render;

    if (this.props.renderAsStream === true && (this.props.body ?? '').trim() !== '') {
      this.updateCardStack({});
    }
  }

  private extractTextFromBody (body?: string | null): string {
    if (body == null || body.trim() === '') {
      return '';
    }
    // Strip ```shell\n...\n``` if present
    const match = body.match(/```[^\n]*\n([\s\S]*?)```/);
    return (match != null) ? match[1].trim() : body.trim();
  }

  private createEditableTextarea (): ExtendedHTMLElement {
    const initialText = this.extractTextFromBody(this.props.body);

    const textarea = DomBuilder.getInstance().build({
      type: 'textarea',
      classNames: [ 'mynah-shell-command-input', ...(this.props.classNames ?? []) ],
      attributes: {
        rows: '1',
        spellcheck: 'false',
        value: initialText
      },
      events: {
        input: this.handleTextareaInput.bind(this),
        focus: this.handleTextareaFocus.bind(this)
      }
    });

    this.textareaEl = textarea as unknown as HTMLTextAreaElement;
    this.textareaEl.value = initialText;

    // Auto-resize after DOM insertion
    setTimeout(() => {
      if (this.textareaEl != null) {
        this.resizeTextarea(this.textareaEl);
      }
    }, 0);

    return textarea;
  }

  private handleTextareaInput (e: Event): void {
    const textarea = e.target as HTMLTextAreaElement;
    this.resizeTextarea(textarea);
    this.props.onEdit?.(textarea.value);
  }

  private handleTextareaFocus (e: Event): void {
    const textarea = e.target as HTMLTextAreaElement;
    this.resizeTextarea(textarea);
  }

  private resizeTextarea (textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(40, textarea.scrollHeight)}px`;
  }

  private readonly getCardContent = (): CardBody => {
    return new CardBody({
      body: this.props.body ?? '',
      hideCodeBlockLanguage: this.props.hideCodeBlockLanguage,
      wrapCode: this.props.wrapCode,
      unlimitedCodeBlockHeight: this.props.unlimitedCodeBlockHeight,
      testId: this.props.testId,
      useParts: this.props.renderAsStream,
      classNames: [ this.typewriterId, ...(this.props.classNames ?? []) ],
      highlightRangeWithTooltip: this.props.codeReference,
      children: this.props.children,
      ...this.props.contentProperties,
    });
  };

  private readonly updateCard = (): void => {
    if (this.updateTimer === undefined && this.updateStack.length > 0) {
      const updateWith = this.updateStack.shift();
      if (updateWith !== undefined) {
        this.props = {
          ...this.props,
          ...updateWith,
        };

        const newCardContent = this.getCardContent();
        const upcomingWords = Array.from(newCardContent.render.querySelectorAll('.typewriter-part') ?? []);
        for (let i = 0; i < upcomingWords.length; i++) {
          upcomingWords[i].setAttribute('index', i.toString());
        }
        // How many new words will be added
        const newWordsCount = upcomingWords.length - this.typewriterItemIndex;

        // For each stack, without exceeding 500ms in total
        // we're setting each words delay time according to the count of them.
        // Word appearance time cannot exceed 50ms
        // Stack's total appearance time cannot exceed 500ms
        const timeForEach = Math.min(50, Math.floor(TYPEWRITER_STACK_TIME / newWordsCount));

        // Generate animator style and inject into render
        // CSS animations ~100 times faster then js timeouts/intervals
        newCardContent.render.insertAdjacentElement('beforeend',
          getTypewriterPartsCss(this.typewriterId, this.typewriterItemIndex, upcomingWords.length, timeForEach));

        this.props.onAnimationStateChange?.(true);
        if (this.contentBody == null) {
          this.contentBody = newCardContent;
          this.render = this.contentBody.render;
        }
        Array.from(newCardContent.render.childNodes).forEach(node => {
          const newElm = node as HTMLElement;
          const currIndex = (node as HTMLElement).getAttribute('render-index');
          const oldElm = this.render.querySelector(`[render-index="${currIndex ?? ''}"]`);
          if (oldElm == null) {
            this.render.insertChild('beforeend', node as HTMLElement);
          } else if (newElm.innerHTML !== oldElm.innerHTML) {
            if (newElm.classList.contains('mynah-syntax-highlighter')) {
              const newPreElm = newElm.querySelector('pre');
              if (newPreElm?.childNodes != null) {
                const oldElmPre = oldElm.querySelector('pre');
                if (oldElmPre != null) {
                  oldElmPre.replaceChildren(...Array.from(newPreElm.childNodes));
                  if (!newElm.classList.contains('mynah-inline-code') && !newElm.classList.contains('no-max') && oldElmPre.scrollHeight > oldElmPre.clientHeight) {
                    oldElm.classList.add('max-height-exceed');
                  }
                }
              }
            } else {
              oldElm.replaceWith(newElm);
            }
          }
        });
        this.contentBody = newCardContent;
        this.lastAnimationDuration = timeForEach * newWordsCount;
        this.typewriterItemIndex = upcomingWords.length;

        // If there is another set
        // call the same function to check after current stack totally shown
        this.updateTimer = setTimeout(() => {
          this.updateTimer = undefined;
          this.props.onAnimationStateChange?.(false);
          this.updateCard();
        }, this.lastAnimationDuration);
      }
    }
  };

  public readonly updateCardStack = (updateWith: Partial<ChatItemCardContentProps>): void => {
    // Handle explicit editable state changes first
    if (Object.prototype.hasOwnProperty.call(updateWith, 'editable')) {
      const newEditableState = updateWith.editable;

        // Transition to editable mode
        if (newEditableState === true) {
        // Force complete state reset before transitioning
        if (this.updateTimer !== undefined) {
          clearTimeout(this.updateTimer);
          this.updateTimer = undefined;
        }
        this.updateStack.length = 0;
        this.typewriterItemIndex = 0;
        this.lastAnimationDuration = 0;

          // Update props
          this.props = { ...this.props, ...updateWith };

          const initialText = this.extractTextFromBody(this.props.body);

          // Build a textarea in-place, pre-filled with the old command
          const textarea = DomBuilder.getInstance().build({
            type: 'textarea',
            classNames: [ 'mynah-shell-command-input', ...(this.props.classNames ?? []) ],
            attributes: {
              spellcheck: 'false',
              value: initialText
            },
            events: {
              input: (e: Event) => {
                const ta = e.target as HTMLTextAreaElement;
                this.props.onEdit?.(ta.value);
                // auto-resize
                ta.style.height = 'auto';
                ta.style.height = `${Math.max(40, ta.scrollHeight)}px`;
              },
              focus: (e: Event) => {
                const ta = e.target as HTMLTextAreaElement;
                ta.style.height = 'auto';
                ta.style.height = `${Math.max(40, ta.scrollHeight)}px`;
              }
            }
          });

          // Replace the current render with textarea
          const parentNode = this.render?.parentNode;
          if (parentNode != null) {
            parentNode.replaceChild(
              textarea as unknown as Node,
              this.render as unknown as Node
            );

            // Update references
            this.textareaEl = textarea as unknown as HTMLTextAreaElement;
            this.render = textarea;
            this.contentBody = null; // Clear contentBody since we're now in editable mode

            // Auto-resize after DOM insertion
            setTimeout(() => {
              if (this.textareaEl != null) {
                const ta = this.textareaEl;
                ta.style.height = 'auto';
                ta.style.height = `${Math.max(40, ta.scrollHeight)}px`;
                ta.focus(); // Focus the textarea for better UX
              }
            }, 0);
          }
        return;
        }

        // Transition from editable to non-editable mode
      if (newEditableState === false) {
          // Update props first
          this.props = { ...this.props, ...updateWith };

        // Force complete state reset
          this.textareaEl = undefined;
        if (this.updateTimer !== undefined) {
          clearTimeout(this.updateTimer);
          this.updateTimer = undefined;
        }
        this.updateStack.length = 0;
        this.typewriterItemIndex = 0;
        this.lastAnimationDuration = 0;

          // Create new CardBody with updated content
          this.contentBody = this.getCardContent();

          // Replace the textarea with the new CardBody
          const parentNode = this.render?.parentNode;
          if (parentNode != null) {
            parentNode.replaceChild(
              this.contentBody.render as unknown as Node,
              this.render as unknown as Node
            );

            // Update render reference
            this.render = this.contentBody.render;

            // If we need to render as stream after switching back, trigger it
            if ((this.props.renderAsStream ?? false) && (this.props.body ?? '').trim() !== '') {
              setTimeout(() => this.updateCardStack({}), 0);
            }
          }
        return;
      }

      return;
    }

    // Handle other updates (like body content changes) only if not in editable mode
    if (this.props.editable !== true) {
      this.updateStack.push(updateWith);
      this.updateCard();
    }
  };

  public readonly getRenderDetails = (): CardRenderDetails => {
    return {
      totalNumberOfCodeBlocks: (this.contentBody?.nextCodeBlockIndex ?? 0)
    };
  };

}
