/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { ChatItem, ChatItemType } from '../../static';
import { Icon, MynahIcons } from '../icon';
import { SuggestionCardBody } from '../suggestion-card/suggestion-card-body';
import { ChatItemFollowUpContainer } from './chat-item-followup';
import { ChatItemRelatedContent } from './chat-item-related-content';
import { ChatItemRelevanceVote } from './chat-item-relevance-vote';
import { ChatItemTreeViewWrapper } from './chat-item-tree-view-wrapper';

export interface ChatItemCardProps {
  tabId: string;
  chatItem: ChatItem;
}
export class ChatItemCard {
  readonly props: ChatItemCardProps;
  render: ExtendedHTMLElement;
  suggestionCardBody: SuggestionCardBody;
  chatAvatar: ExtendedHTMLElement;
  constructor (props: ChatItemCardProps) {
    this.props = props;
    this.chatAvatar = this.getChatAvatar();
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('showChatAvatars', (value: boolean) => {
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
      children: [
        ...this.getCardContent(),
        DomBuilder.getInstance().build({
          type: 'span',
          persistent: true,
          classNames: [ 'mynah-chat-item-spacer' ]
        }),
        ...(this.props.chatItem.type === ChatItemType.ANSWER_STREAM
          ? [ DomBuilder.getInstance().build({
              type: 'div',
              persistent: true,
              classNames: [ 'mynah-chat-items-spinner' ],
              children: [
                { type: 'span' },
                { type: 'span' },
                { type: 'span' },
              ]
            }) ]
          : [])
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
      innerHTML: typeof this.props.chatItem.body === 'string' ? this.props.chatItem.body : ''
    });
    const isChatItemEmpty = emptyCheckDom.innerText.trim() === '';
    const isNoContent = isChatItemEmpty && this.props.chatItem.followUp === undefined && this.props.chatItem.relatedContent === undefined && this.props.chatItem.type === ChatItemType.ANSWER;
    return [ 'mynah-chat-item-card', `mynah-chat-item-${this.props.chatItem.type ?? ChatItemType.ANSWER}`,
      ...(isChatItemEmpty ? [ 'mynah-chat-item-empty' ] : []),
      ...(isNoContent ? [ 'mynah-chat-item-no-content' ] : []),
    ];
  };

  private readonly getCardContent = (): Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject> => {
    return [
      ...(MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('showChatAvatars') === true
        ? [ this.chatAvatar ]
        : []),
      ...(this.props.chatItem.body !== undefined
        ? [ DomBuilder.getInstance().build({
            type: 'div',
            classNames: [ 'mynah-card' ],
            children: [
              ((): ExtendedHTMLElement => {
                let treeWrapper;
                if (this.props.chatItem.type === ChatItemType.CODE_RESULT) {
                  treeWrapper = new ChatItemTreeViewWrapper({ tabId: this.props.tabId, messageId: this.props.chatItem.messageId ?? '', files: this.props.chatItem.body as unknown as string[] });
                  this.props.chatItem.body = '';
                }
                this.suggestionCardBody = new SuggestionCardBody({
                  suggestion: { id: this.props.chatItem.messageId, body: this.props.chatItem.body as string },
                  highlightRangeWithTooltip: this.props.chatItem.codeReference,
                  children: this.props.chatItem.relatedContent !== undefined
                    ? [
                        new ChatItemRelatedContent({
                          messageId: this.props.chatItem.messageId ?? 'unknown',
                          tabId: this.props.tabId,
                          relatedContent: this.props.chatItem.relatedContent?.content,
                          title: this.props.chatItem.relatedContent?.title
                        }).render
                      ]
                    : []
                });
                if (treeWrapper !== undefined) {
                  this.suggestionCardBody.cardBody.update({ children: [ treeWrapper.render ] });
                }
                return this.suggestionCardBody.render;
              })(),
              ...(this.props.chatItem.canBeVoted === true && this.props.chatItem.messageId !== undefined ? [ new ChatItemRelevanceVote({ tabId: this.props.tabId, messageId: this.props.chatItem.messageId }).render ] : [])
            ],
          }) ]
        : ''),
      this.props.chatItem.followUp?.text !== undefined ? new ChatItemFollowUpContainer({ tabId: this.props.tabId, chatItem: this.props.chatItem }).render : ''
    ];
  };

  private readonly getChatAvatar = (): ExtendedHTMLElement => DomBuilder.getInstance().build({
    type: 'div',
    classNames: [ 'mynah-chat-item-card-icon-wrapper' ],
    children: [
      new Icon({ icon: this.props.chatItem.type === ChatItemType.PROMPT ? MynahIcons.USER : MynahIcons.MYNAH }).render
    ]
  });

  public readonly updateCard = (chatItemToUpdate: Partial<ChatItem>): void => {
    this.props.chatItem = {
      ...this.props.chatItem,
      ...chatItemToUpdate
    };
    this.render.update({
      classNames: [ ...this.getCardClasses(), 'reveal' ],
      children: this.getCardContent()
    });
  };
}
