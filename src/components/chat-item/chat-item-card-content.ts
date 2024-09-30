/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilderObject, ExtendedHTMLElement, getTypewriterPartsCss } from '../../helper/dom';
import { CardRenderDetails, ChatItem, CodeBlockActions, OnCodeBlockActionFunction, OnCopiedToClipboardFunction, ReferenceTrackerInformation } from '../../static';
import { CardBody } from '../card/card-body';
import { generateUID } from '../../helper/guid';

const TYPEWRITER_STACK_TIME = 500;
export interface ChatItemCardContentProps {
  body?: string;
  testId?: string;
  renderAsStream?: boolean;
  classNames?: string[];
  codeReference?: ReferenceTrackerInformation[];
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
  private readonly updateStack: Array<Partial<ChatItem>> = [];
  private typewriterItemIndex: number = 0;
  private readonly typewriterId: string = `typewriter-card-${generateUID()}`;
  private lastAnimationDuration: number = 0;
  private updateTimer: ReturnType<typeof setTimeout> | undefined;
  constructor (props: ChatItemCardContentProps) {
    this.props = props;
    this.contentBody = this.getCardContent();
    this.render = this.contentBody.render;

    if ((this.props.renderAsStream ?? false) && (this.props.body ?? '').trim() !== '') {
      this.updateCardStack({});
    }
  }

  private readonly getCardContent = (): CardBody => {
    return new CardBody({
      body: this.props.body ?? '',
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
