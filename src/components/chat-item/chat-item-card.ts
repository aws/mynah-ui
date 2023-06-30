/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIDataStore } from '../../helper/store';
import { ChatItem, ChatItemType } from '../../static';
import { I18N } from '../../translations/i18n';
import { Icon, MynahIcons } from '../icon';
import { SuggestionCard } from '../suggestion-card/suggestion-card';
import { SuggestionCardBody } from '../suggestion-card/suggestion-card-body';
import { ChatItemFollowUpContainer } from './chat-item-followup';

export interface ChatItemCardProps {chatItem: ChatItem}
export class ChatItemCard {
  private readonly chatItem: ChatItem;
  render: ExtendedHTMLElement;
  chatAvatar: ExtendedHTMLElement;
  constructor (props: ChatItemCardProps) {
    this.chatItem = props.chatItem;
    this.chatAvatar = this.getChatAvatar();
    MynahUIDataStore.getInstance().subscribe('showChatAvatars', (value: boolean) => {
      if (value) {
        this.chatAvatar = this.getChatAvatar();
        this.render.insertChild('afterbegin', this.chatAvatar);
      } else {
        this.chatAvatar.remove();
      }
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card', `mynah-chat-item-${this.chatItem.type ?? ChatItemType.ANSWER}` ],
      children: [
        ...(MynahUIDataStore.getInstance().getValue('showChatAvatars') === true
          ? [ this.chatAvatar ]
          : []),
        {
          type: 'div',
          classNames: [ 'mynah-card' ],
          children: [
            new SuggestionCardBody({ suggestion: { body: this.chatItem.body ?? '' } }).render,
          ],
        },
        (this.chatItem.relatedContent !== undefined
          ? DomBuilder.getInstance().build({
            type: 'div',
            classNames: [ 'mynah-chat-item-card-related-content' ],
            children: [
              ...(this.chatItem.relatedContent.title !== false
                ? [ {
                    type: 'span',
                    classNames: [ 'mynah-chat-item-card-related-content-title' ],
                    children: [ typeof this.chatItem.relatedContent.title === 'string' ? this.chatItem.relatedContent.title : I18N.getInstance().texts.relatedContent ],
                  } ]
                : []),
              ...this.chatItem.relatedContent.content.map(suggestion => new SuggestionCard({ suggestion, compact: true }).render)
            ]
          })
          : ''),
        this.chatItem.followUp?.text !== undefined ? new ChatItemFollowUpContainer({ chatItem: this.chatItem }).render : '',
      ],
    });

    setTimeout(() => {
      this.render.addClass('reveal');
    }, 10);
  }

  private readonly getChatAvatar = (): ExtendedHTMLElement => DomBuilder.getInstance().build({
    type: 'div',
    classNames: [ 'mynah-chat-item-card-icon-wrapper' ],
    children: [
      new Icon({ icon: this.chatItem.type === ChatItemType.PROMPT ? MynahIcons.USER : MynahIcons.MYNAH }).render
    ]
  });
}
