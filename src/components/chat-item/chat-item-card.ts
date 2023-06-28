/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItem, ChatItemType } from '../../static';
import { Icon, MynahIcons } from '../icon';
import { SuggestionCardBody } from '../suggestion-card/suggestion-card-body';
import { ChatItemFollowUpContainer } from './chat-item-followup';

export interface ChatItemCardProps {chatItem: ChatItem}
export class ChatItemCard {
  private readonly chatItem: ChatItem;
  render: ExtendedHTMLElement;
  constructor (props: ChatItemCardProps) {
    this.chatItem = props.chatItem;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card', `mynah-chat-item-${this.chatItem.type ?? ChatItemType.ANSWER}` ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-card-icon-wrapper' ],
          children: [
            new Icon({ icon: this.chatItem.type === ChatItemType.PROMPT ? MynahIcons.USER : MynahIcons.MEGAPHONE }).render
          ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-card' ],
          children: [
            new SuggestionCardBody({ suggestion: { body: this.chatItem.body ?? '' } }).render,
          ],
        },
        (this.chatItem.followUp !== null) ? new ChatItemFollowUpContainer({ chatItem: this.chatItem }).render : ''
      ],
    });
  }
}
