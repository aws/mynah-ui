/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { ChatItem, ChatItemType, MynahEventNames } from '../../static';
import { Card } from '../card/card';
import { CardBody } from '../card/card-body';
import { Icon, MynahIcons } from '../icon';
import { ChatItemFollowUpContainer } from './chat-item-followup';
import { ChatItemSourceLinksContainer } from './chat-item-source-links';
import { ChatItemRelevanceVote } from './chat-item-relevance-vote';
import { ChatItemTreeViewWrapper } from './chat-item-tree-view-wrapper';
import { Config } from '../../helper/config';
import { generateUID } from '../../helper/guid';

const TYPEWRITER_STACK_TIME = 500;
export interface ChatItemCardProps {
  tabId: string;
  chatItem: ChatItem;
}
export class ChatItemCard {
  readonly props: ChatItemCardProps;
  render: ExtendedHTMLElement;
  contentBody: CardBody;
  chatAvatar: ExtendedHTMLElement;
  updateStack: Array<Partial<ChatItem>> = [];
  typewriterItemIndex: number = 0;
  previousTypewriterItemIndex: number = 0;
  typewriterId: string;
  private updateTimer: ReturnType<typeof setTimeout> | undefined;
  constructor (props: ChatItemCardProps) {
    this.props = props;
    this.chatAvatar = this.getChatAvatar();
    MynahUITabsStore.getInstance()
      .getTabDataStore(this.props.tabId)
      .subscribe('showChatAvatars', (value: boolean) => {
        if (value) {
          this.chatAvatar = this.getChatAvatar();
          this.render.insertChild('afterbegin', this.chatAvatar);
        } else {
          this.chatAvatar.remove();
        }
      });
    this.render = this.generateCard();
  }

  private readonly generateCard = (): ExtendedHTMLElement => {
    const generatedCard = DomBuilder.getInstance().build({
      type: 'div',
      classNames: this.getCardClasses(),
      attributes: {
        messageId: this.props.chatItem.messageId ?? 'unknown',
      },
      children: [
        ...(this.props.chatItem.type === ChatItemType.ANSWER_STREAM
          ? [
              // Create an empty card with its child set to the loading spinner
              new Card({
                children: [
                  DomBuilder.getInstance().build({
                    type: 'div',
                    persistent: true,
                    classNames: [ 'mynah-chat-items-spinner' ],
                    children: [ { type: 'span' }, { type: 'div', children: [ Config.getInstance().config.texts.spinnerText ] } ],
                  }),
                ]
              }).render,
            ]
          : [ ...this.getCardContent() ]),
      ],
    });

    setTimeout(() => {
      generatedCard.addClass('reveal');
    }, this.props.chatItem.type === ChatItemType.PROMPT ? 10 : 200);

    return generatedCard;
  };

  private readonly getCardClasses = (): string[] => {
    const emptyCheckDom = DomBuilder.getInstance().build({
      type: 'span',
      innerHTML: typeof this.props.chatItem.body === 'string' ? this.props.chatItem.body : '',
    });
    const isChatItemEmpty = emptyCheckDom.innerText.trim() === '';
    const isNoContent =
      isChatItemEmpty &&
      this.props.chatItem.followUp === undefined &&
      this.props.chatItem.relatedContent === undefined &&
      this.props.chatItem.type === ChatItemType.ANSWER;
    return [
      'mynah-chat-item-card',
      `mynah-chat-item-${this.props.chatItem.type ?? ChatItemType.ANSWER}`,
      ...(isChatItemEmpty ? [ 'mynah-chat-item-empty' ] : []),
      ...(isNoContent ? [ 'mynah-chat-item-no-content' ] : []),
    ];
  };

  private readonly getCardContent = (): Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject> => {
    if (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId) === undefined) {
      return [];
    }
    return [
      ...(MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('showChatAvatars') === true ? [ this.chatAvatar ] : []),
      ...(this.props.chatItem.body !== undefined || this.props.chatItem.fileList !== undefined
        ? [
            new Card({
              onCardEngaged: engagement => {
                MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CHAT_ITEM_ENGAGEMENT, {
                  engagement,
                  messageId: this.props.chatItem.messageId,
                });
              },
              children: [
                ((): ExtendedHTMLElement => {
                  const commonBodyProps = {
                    body: this.props.chatItem.body ?? '',
                    onLinkClick: (url: string, e: MouseEvent) => {
                      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.LINK_CLICK, {
                        messageId: this.props.chatItem.messageId,
                        link: url,
                        event: e,
                      });
                    }
                  };
                  if (this.props.chatItem.type === ChatItemType.CODE_RESULT && this.props.chatItem.fileList !== undefined) {
                    const { filePaths = [], deletedFiles = [] } = this.props.chatItem.fileList;
                    const referenceSuggestionLabel = this.props.chatItem.body ?? '';
                    this.contentBody = new CardBody({
                      ...commonBodyProps,
                      ...{
                        body: '' // Reset the body, since the tree view has the fully rendered element
                      },
                      children: [
                        new ChatItemTreeViewWrapper({
                          tabId: this.props.tabId,
                          messageId: this.props.chatItem.messageId ?? '',
                          files: filePaths,
                          deletedFiles,
                          references: this.props.chatItem.codeReference ?? [],
                          referenceSuggestionLabel
                        }).render
                      ],
                    });
                  } else {
                    this.contentBody = new CardBody({
                      ...commonBodyProps,
                      useParts: this.props.chatItem.type === ChatItemType.ANSWER_STREAM,
                      highlightRangeWithTooltip: this.props.chatItem.codeReference,
                      children: this.props.chatItem.relatedContent !== undefined
                        ? [
                            new ChatItemSourceLinksContainer({
                              messageId: this.props.chatItem.messageId ?? 'unknown',
                              tabId: this.props.tabId,
                              relatedContent: this.props.chatItem.relatedContent?.content,
                              title: this.props.chatItem.relatedContent?.title,
                            }).render,
                          ]
                        : [],
                      onCopiedToClipboard: (type, text, referenceTrackerInformation) => {
                        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.COPY_CODE_TO_CLIPBOARD, {
                          messageId: this.props.chatItem.messageId,
                          type,
                          text,
                          referenceTrackerInformation,
                        });
                      },
                      onInsertToCursorPosition: (type, text, referenceTrackerInformation) => {
                        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.INSERT_CODE_TO_CURSOR_POSITION, {
                          messageId: this.props.chatItem.messageId,
                          type,
                          text,
                          referenceTrackerInformation,
                        });
                      },
                    });
                  }
                  return this.contentBody.render;
                })(),
                ...(this.props.chatItem.canBeVoted === true && this.props.chatItem.messageId !== undefined
                  ? [ new ChatItemRelevanceVote({ tabId: this.props.tabId, messageId: this.props.chatItem.messageId }).render ]
                  : []),
              ],
            }).render,
          ]
        : ''),
      this.props.chatItem.followUp?.text !== undefined ? new ChatItemFollowUpContainer({ tabId: this.props.tabId, chatItem: this.props.chatItem }).render : '',
    ];
  };

  private readonly getChatAvatar = (): ExtendedHTMLElement =>
    DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card-icon-wrapper' ],
      children: [ new Icon({ icon: this.props.chatItem.type === ChatItemType.PROMPT ? MynahIcons.USER : MynahIcons.MYNAH }).render ],
    });

  private readonly getInsertedTypewriterPartsCss = (): ExtendedHTMLElement => DomBuilder.getInstance().build({
    type: 'style',
    attributes: {
      type: 'text/css'
    },
    persistent: true,
    innerHTML: `
    ${
      (new Array(this.typewriterItemIndex - this.previousTypewriterItemIndex).fill(null)).map((n, i) => {
        return `
        .${this.typewriterId} .typewriter-part[index="${i + this.previousTypewriterItemIndex}"] {
          animation: none !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        `;
      }).join('')
    }
    `
  });

  private readonly getInsertingTypewriterPartsCss = (
    newWordsCount: number,
    timeForEach: number): ExtendedHTMLElement => DomBuilder.getInstance().build({
    type: 'style',
    attributes: {
      type: 'text/css'
    },
    innerHTML: `
    ${
      (new Array(newWordsCount).fill(null)).map((n, i) => {
        return `
        .${this.typewriterId} span.typewriter-part[index="${i + this.typewriterItemIndex}"] {
          animation: typewriter 100ms ease-out forwards;
        }
        .${this.typewriterId} .mynah-syntax-highlighter.typewriter-part[index="${i + this.typewriterItemIndex}"] {
          animation: typewriter-visibility-only 0ms linear forwards;
        }
        .${this.typewriterId} .typewriter-part[index="${i + this.typewriterItemIndex}"] {
          animation-delay: ${i * timeForEach}ms !important;
        }

        `;
      }).join('')
    }
    `
  });

  public readonly updateCard = (): void => {
    if (this.updateTimer === undefined && this.updateCardStack.length > 0) {
      const updateWith: Partial<ChatItem> | undefined = this.updateStack.shift();
      if (updateWith !== undefined) {
        this.props.chatItem = {
          ...this.props.chatItem,
          ...updateWith,
        };

        const newCardContent = this.getCardContent();
        const upcomingWords = Array.from(this.contentBody.render.querySelectorAll('.typewriter-part'));
        for (let i = 0; i < upcomingWords.length; i++) {
          upcomingWords[i].setAttribute('index', i.toString());
        }
        if (this.typewriterId === undefined) {
          this.typewriterId = `typewriter-card-${generateUID()}`;
        }
        this.render.update({
          classNames: [ ...this.getCardClasses(), 'reveal', this.typewriterId, 'typewriter-animating' ],
          children: [
            ...newCardContent,
            this.getInsertedTypewriterPartsCss(),
          ],
        });

        // How many new words will be added
        const newWordsCount = upcomingWords.length - this.typewriterItemIndex;

        // For each stack, without exceeding 500ms in total
        // we're setting each words delay time according to the count of them.
        // Word appearence time cannot exceed 50ms
        // Stack's total appearence time cannot exceed 500ms
        const timeForEach = Math.min(50, Math.floor(TYPEWRITER_STACK_TIME / newWordsCount));

        // Generate animator style and inject into render
        // CSS animations ~100 times faster then js timeouts/intervals
        this.render.insertChild('beforeend', this.getInsertingTypewriterPartsCss(newWordsCount, timeForEach));

        // All the animator selectors injected
        // update the words count for a potential upcoming set
        this.previousTypewriterItemIndex = this.typewriterItemIndex;
        this.typewriterItemIndex = upcomingWords.length;

        // If there is another set
        // call the same function to check after current stack totally shown
        this.updateTimer = setTimeout(() => {
          this.render.removeClass('typewriter-animating');
          this.render.insertChild('beforeend', this.getInsertedTypewriterPartsCss());
          this.updateTimer = undefined;
          this.updateCard();
        }, timeForEach * newWordsCount);
      }
    }
  };

  public readonly updateCardStack = (updateWith: Partial<ChatItem>): void => {
    this.updateStack.push(updateWith);
    this.updateCard();
  };
}
