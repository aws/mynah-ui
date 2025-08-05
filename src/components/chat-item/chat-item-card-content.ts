/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement, getTypewriterPartsCss } from '../../helper/dom';
import { CardRenderDetails, ChatItem, CodeBlockActions, OnCodeBlockActionFunction, OnCopiedToClipboardFunction, ReferenceTrackerInformation } from '../../static';
import { CardBody } from '../card/card-body';
import { generateUID } from '../../helper/guid';

const TYPEWRITER_STACK_TIME = 500;
export interface ChatItemCardContentProps {
  body?: string | null;
  editable?: boolean;
  testId?: string;
  renderAsStream?: boolean;
  classNames?: string[];
  unlimitedCodeBlockHeight?: boolean;
  hideCodeBlockLanguage?: boolean;
  wrapCode?: boolean;
  codeReference?: ReferenceTrackerInformation[] | null;
  onAnimationStateChange?: (isAnimating: boolean) => void;
  onEditModeChange?: (isInEditMode: boolean) => void;
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
  private readonly updateStack: Array<Partial<ChatItem>> = [];
  private typewriterItemIndex: number = 0;
  private readonly typewriterId: string = `typewriter-card-${generateUID()}`;
  private lastAnimationDuration: number = 0;
  private updateTimer: ReturnType<typeof setTimeout> | undefined;
  private textareaEl?: HTMLTextAreaElement;
  private originalCommand: string = '';
  private isOnEdit: boolean = false;
  constructor (props: ChatItemCardContentProps) {
    this.props = props;
    this.originalCommand = this.extractTextFromBody(this.props.body);
        this.isOnEdit = false;
    this.contentBody = this.getCardContent();
    this.render = this.contentBody.render;

    if ((this.props.renderAsStream ?? false) && (this.props.body ?? '').trim() !== '' && this.props.editable !== true) {
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
    // Create a wrapper container with the form input styles
    const container = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-form-input-container', ...(this.props.classNames ?? []) ],
      children: [{
        type: 'textarea',
        classNames: [ 'mynah-shell-command-input' ],
        attributes: {
          rows: '1',
          spellcheck: 'false',
          value: this.originalCommand,
          'aria-label': 'Edit shell command',
          'role': 'textbox',
          'aria-multiline': 'false'
        },
        events: {
          focus: (e) => {
            // Auto-select all text when focusing
            (e.target as HTMLTextAreaElement).select();
          }
        }
      }]
    });

    this.textareaEl = container.querySelector('.mynah-shell-command-input') as HTMLTextAreaElement;
    this.textareaEl.value = this.originalCommand;

    // Auto-focus and select after DOM insertion
    setTimeout(() => {
      if (this.textareaEl) {
        this.textareaEl.focus();
        this.textareaEl.select();
      }
    }, 0);

    return container;
  }

  public onSaveClicked (): string {
    // Capture current text before any state changes
    let newCommand = '';
    if (this.textareaEl != null) {
      newCommand = this.textareaEl.value;
    } else {
      newCommand = this.originalCommand;
    }
    const capturedText = newCommand;
    
    // Update original command for future reference
    this.originalCommand = newCommand;
    // Update props.body with new command
    this.props.body = `\`\`\`shell\n${newCommand}\n\`\`\``;
    
    this.exitEditMode();
    
    return capturedText;
  }

  public onCancelClicked (): void {
    // Reset textarea to original command
    if (this.textareaEl) {
      this.textareaEl.value = this.originalCommand;
    }
    // Keep props.body as original command
    this.props.body = `\`\`\`shell\n${this.originalCommand}\n\`\`\``;
    
    this.exitEditMode();
  }

  /**
   * Switch from CardBody to textarea
   */
  private showTextarea(): void {
    if (this.props.editable === true && this.isOnEdit === true && this.contentBody != null) {
      // Force complete state reset before transitioning
      if (this.updateTimer !== undefined) {
        clearTimeout(this.updateTimer);
        this.updateTimer = undefined;
      }
      this.updateStack.length = 0;
      this.typewriterItemIndex = 0;
      this.lastAnimationDuration = 0;

      // Create textarea with current command
      const textarea = this.createEditableTextarea();

      // Replace the current render with textarea
      const parentNode = this.render?.parentNode;
      if (parentNode != null) {
        parentNode.replaceChild(
          textarea as unknown as Node,
          this.render as unknown as Node
        );

        // Update references
        this.render = textarea;
        this.contentBody = null;
      }
    }
  }

  /**
   * Switch from textarea to CardBody
   */
  private hideTextarea(): void {
    if (this.isOnEdit === false && this.textareaEl != null) {
      this.textareaEl = undefined;
      if (this.updateTimer !== undefined) {
        clearTimeout(this.updateTimer);
        this.updateTimer = undefined;
      }
      this.updateStack.length = 0;
      this.typewriterItemIndex = 0;
      this.lastAnimationDuration = 0;

      // Create new CardBody with updated content 
      // (this.props.body should now contain the new command)
      this.contentBody = this.getCardContent();

      const parentNode = this.render?.parentNode;
      if (parentNode != null) {
        parentNode.replaceChild(
          this.contentBody.render as unknown as Node,
          this.render as unknown as Node
        );

        // Update references
        this.render = this.contentBody.render;
      }

      // If we need to render as stream after switching back, trigger it
      if ((this.props.renderAsStream ?? false) && (this.props.body ?? '').trim() !== '') {
        setTimeout(() => this.updateCardStack({}), 0);
      }
    }
  }

  /**
   * Public method for ChatItemCard to call when modify button is clicked
   * This sets editable to true, which causes isOnEdit to become true
   */
  public enterEditMode(): void {
    // Directly trigger edit mode without going through updateCardStack
    // to avoid potential issues with the update mechanism
    if (!this.isOnEdit && this.props.editable === true) {
      this.isOnEdit = true;
      this.showTextarea();
      this.props.onEditModeChange?.(true);
    }
  }

  /**
   * Exit edit mode and return to view mode
   * This sets isOnEdit to false, which causes editable to become false
   */
  private exitEditMode(): void {
    // Step 1: Set isOnEdit to false
    this.isOnEdit = false;
    // Step 2: This will trigger hideTextarea() and set editable to false
    this.handleEditModeTransition();
  }


  /**
   * Handle the cascading state transitions according to specification
   */
  private handleEditModeTransition(): void {
    // When isOnEdit becomes false → hideTextarea() → editable should become false
    if (this.isOnEdit === false && this.textareaEl != null) {
      this.hideTextarea();
      // Notify parent that we exited edit mode
      this.props.onEditModeChange?.(false);
    }
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
      const chatItemUpdate: Partial<ChatItem> | undefined = this.updateStack.shift();
      if (chatItemUpdate !== undefined) {
        // Convert ChatItem fields to ChatItemCardContentProps
        const updateWith: Partial<ChatItemCardContentProps> = {};
        if (chatItemUpdate.body !== undefined) {
          updateWith.body = chatItemUpdate.body;
        }
        if (chatItemUpdate.editable !== undefined) {
          updateWith.editable = chatItemUpdate.editable;
        }
        if (chatItemUpdate.codeReference !== undefined) {
          updateWith.codeReference = chatItemUpdate.codeReference;
        }
        
        // Handle editable state changes (entering or exiting edit mode)
        const enteringEditMode = updateWith.editable === true && !this.props.editable;
        const exitingEditMode = updateWith.editable === false && this.props.editable === true;
        
        if (enteringEditMode || exitingEditMode) {
          // Update props first
          this.props = { ...this.props, ...updateWith };
          
          // Update original command if body changed
          if (updateWith.body !== undefined) {
            this.originalCommand = this.extractTextFromBody(updateWith.body);
          }
          
          // Handle edit mode transitions
          if (enteringEditMode) {
            this.isOnEdit = true;
            this.showTextarea();
            this.props.onEditModeChange?.(true);
          } else if (exitingEditMode) {
            if (this.isOnEdit) {
              // Exit edit mode
              this.isOnEdit = false;
              this.hideTextarea();
              this.props.onEditModeChange?.(false);
            } else {
              // Update displayed content if already exited edit mode locally
              if (this.contentBody) {
                this.contentBody = this.getCardContent();
                const parentNode = this.render?.parentNode;
                if (parentNode != null) {
                  parentNode.replaceChild(
                    this.contentBody.render as unknown as Node,
                    this.render as unknown as Node
                  );
                  this.render = this.contentBody.render;
                }
              }
            }
          }
          return;
        }

        // Skip normal updates while in edit mode to prevent conflicts
        if (this.isOnEdit) {
          return;
        }
        
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
    this.updateStack.push(updateWith);
    this.updateCard();
  };

  public readonly getRenderDetails = (): CardRenderDetails => {
    return {
      totalNumberOfCodeBlocks: (this.contentBody?.nextCodeBlockIndex ?? 0)
    };
  };
}
