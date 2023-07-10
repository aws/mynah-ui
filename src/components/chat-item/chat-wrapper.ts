/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIDataStore } from '../../helper/store';
import { ChatItem } from '../../static';
import { ChatItemCard } from './chat-item-card';
import { ChatPromptInput } from './chat-prompt-input';

export class ChatWrapper {
  private readonly chatItemsContainer: ExtendedHTMLElement;
  private readonly spinner: ExtendedHTMLElement;
  private readonly promptInput: ExtendedHTMLElement;
  render: ExtendedHTMLElement;
  constructor () {
    const initChatItems = MynahUIDataStore.getInstance().getValue('chatItems');
    if (initChatItems.length > 0) {
      initChatItems.forEach((chatItem: ChatItem) => this.insertChatItem(chatItem));
    }
    MynahUIDataStore.getInstance().subscribe('chatItems', (chatItems) => {
      if (this.chatItemsContainer.children.length === chatItems.length) {
        const lastItem = this.chatItemsContainer.children.item(0);
        if (lastItem !== null) {
          lastItem.innerHTML = new ChatItemCard({ chatItem: chatItems[chatItems.length - 1] }).render.innerHTML;
        }
      } else if (chatItems.length > 0) {
        this.insertChatItem(chatItems[chatItems.length - 1]);
      } else {
        this.chatItemsContainer.clear(true);
      }
    });
    MynahUIDataStore.getInstance().subscribe('loadingChat', (loadingChat) => {
      if (loadingChat === true) {
        this.spinner.addClass('loading');
      } else {
        this.spinner.removeClass('loading');
      }
    });

    this.promptInput = new ChatPromptInput().render;
    this.chatItemsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-items-container' ],
      persistent: true,
      children: [ ]
    });
    this.spinner = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-items-spinner' ],
      persistent: true,
      children: [
        { type: 'span' },
        { type: 'span' },
        { type: 'span' },
      ]
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-wrapper' ],
      persistent: true,
      children: [ this.chatItemsContainer, this.spinner, this.promptInput ]
    });
  }

  private readonly insertChatItem = (chatItem: ChatItem): void => {
    this.chatItemsContainer.insertChild('afterbegin', new ChatItemCard({ chatItem }).render);
  };
}
