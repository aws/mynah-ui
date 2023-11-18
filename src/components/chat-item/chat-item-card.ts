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

const MAX_HEIGHT_TRESHOLD = 100;
export interface ChatItemCardProps {
  tabId: string;
  chatItem: ChatItem;
}
export class ChatItemCard {
  readonly props: ChatItemCardProps;
  render: ExtendedHTMLElement;
  contentBody: CardBody;
  chatAvatar: ExtendedHTMLElement;
  private updateTimer: ReturnType<typeof setTimeout>;
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
        DomBuilder.getInstance().build({
          type: 'span',
          persistent: true,
          classNames: [ 'mynah-chat-item-spacer' ],
        }),
      ],
    });

    setTimeout(() => {
      generatedCard.addClass('reveal');
    }, 10);

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
                      highlightRangeWithTooltip: this.props.chatItem.codeReference,
                      children:
                        this.props.chatItem.relatedContent !== undefined
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

  public readonly updateCard = (updateWith: Partial<ChatItem>): void => {
    this.props.chatItem = {
      ...this.props.chatItem,
      ...updateWith,
    };
    if (this.updateTimer !== undefined) {
      clearTimeout(this.updateTimer);
    }
    this.render.style.maxHeight = `${this.render.getBoundingClientRect().height + MAX_HEIGHT_TRESHOLD}px`;
    this.render.update({
      classNames: [ ...this.getCardClasses(), 'reveal' ],
      children: this.getCardContent(),
    });
    setTimeout(() => {
      this.render.style.maxHeight = `${
        (this.render.querySelector('.mynah-card-body') as HTMLElement).scrollHeight + MAX_HEIGHT_TRESHOLD
      }px`;
      this.updateTimer = setTimeout(() => {
        this.render.style.maxHeight = 'initial';
      }, 1000);
    }, 10);
  };
}
