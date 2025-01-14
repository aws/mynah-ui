/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilderObject, ExtendedHTMLElement, getTypewriterPartsCss } from '../../helper/dom';
import { CardRenderDetails, CodeBlockActions, OnCodeBlockActionFunction, OnCopiedToClipboardFunction, ReferenceTrackerInformation } from '../../static';
import { CardBody } from '../card/card-body';
import { generateUID } from '../../helper/guid';
import { getBindableValue, isBindable, MakePropsBindable } from '../../helper/bindable';

const TYPEWRITER_STACK_TIME = 500;
interface ChatItemCardContentPropsBindable {
  body?: string;
  testId?: string;
  renderAsStream?: boolean;
  classNames?: string[];
  codeReference?: ReferenceTrackerInformation[] | null;
  children?: Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject>;
  codeBlockActions?: CodeBlockActions;
}
export interface ChatItemCardContentProps extends MakePropsBindable<ChatItemCardContentPropsBindable>{
  onAnimationStateChange?: (isAnimating: boolean) => void;
  contentEvents?: {
    onLinkClick?: (url: string, e: MouseEvent) => void;
    onCopiedToClipboard?: OnCopiedToClipboardFunction;
    onCodeBlockAction?: OnCodeBlockActionFunction;
  };
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
  constructor (props: ChatItemCardContentProps) {
    this.props = props;
    Object.entries(this.props).forEach(([ key, value ]) => {
      if (isBindable(value)) {
        value.subscribe((newVal) => {
          this.update({
            [key]: newVal
          });
        });
      }
    });

    this.contentBody = this.getCardContent();
    this.render = this.contentBody.render;

    if ((getBindableValue(this.props.renderAsStream) ?? false) && (getBindableValue(this.props.body) ?? '').trim() !== '') {
      this.update({});
    }
  }

  private readonly getCardContent = (): CardBody => {
    return new CardBody({
      body: getBindableValue(this.props.body) ?? '',
      testId: getBindableValue(this.props.testId),
      useParts: getBindableValue(this.props.renderAsStream),
      classNames: [ this.typewriterId, ...(getBindableValue(this.props.classNames) ?? []) ],
      highlightRangeWithTooltip: getBindableValue(this.props.codeReference),
      children: getBindableValue(this.props.children),
      ...this.props.contentEvents,
      codeBlockActions: getBindableValue(this.props.codeBlockActions)
    });
  };

  private readonly updateCard = (): void => {
    if (this.updateTimer === undefined && this.updateStack.length > 0) {
      const updateWith: Partial<ChatItemCardContentProps> | undefined = this.updateStack.shift();
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
        this.contentBody = newCardContent;
        this.render.replaceWith(this.contentBody.render);
        this.render = this.contentBody.render;

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

  public readonly update = (newProps: Partial<ChatItemCardContentProps>): void => {
    this.updateStack.push(newProps);
    this.updateCard();
  };

  public readonly getRenderDetails = (): CardRenderDetails => {
    return {
      totalNumberOfCodeBlocks: (this.contentBody?.nextCodeBlockIndex ?? 0)
    };
  };
}
