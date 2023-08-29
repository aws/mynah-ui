/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';
import { ChatItem, ChatItemType, MynahEventNames } from '../../static';
import { ChatItemCard } from './chat-item-card';
import { ChatPromptInput } from './chat-prompt-input';

export interface ChatWrapperProps {
  onStopChatResponse?: () => void;
  onShowAllWebResultsClick?: () => void;
}
export class ChatWrapper {
  private readonly props?: ChatWrapperProps;
  private readonly chatItemsContainer: ExtendedHTMLElement;
  private readonly spinner: ExtendedHTMLElement;
  private readonly promptInput: ExtendedHTMLElement;
  private lastChatItemCard: ChatItemCard | null;
  render: ExtendedHTMLElement;
  constructor (props?: ChatWrapperProps) {
    this.props = props;
    const initChatItems = MynahUIDataStore.getInstance().getValue('chatItems');
    if (initChatItems.length > 0) {
      initChatItems.forEach((chatItem: ChatItem) => this.insertChatItem(chatItem));
    }
    MynahUIDataStore.getInstance().subscribe('chatItems', (chatItems) => {
      const chatItemToInsert: ChatItem = chatItems[chatItems.length - 1];
      if (this.chatItemsContainer.children.length === chatItems.length) {
        const lastItem = this.chatItemsContainer.children.item(0);
        if (lastItem !== null) {
          lastItem.innerHTML = new ChatItemCard({ chatItem: chatItemToInsert }).render.innerHTML;
        }
      } else if (chatItems.length > 0) {
        if (chatItemToInsert.type === ChatItemType.PROMPT || chatItemToInsert.type === ChatItemType.SYSTEM_PROMPT) {
          this.removeAllExceptAnswersAndPrompts().finally(() => {
            this.insertChatItem(chatItemToInsert);
          });
        } else {
          this.insertChatItem(chatItemToInsert);
        }
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
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.UPDATE_LAST_CHAT_ANSWER_STREAM, (body) => {
      if (this.lastChatItemCard !== null) {
        this.lastChatItemCard.updateAnswerBody(body);
      }
    });

    this.promptInput = new ChatPromptInput({
      onStopChatResponse: props?.onStopChatResponse
    }).render;
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
    const chatItemCard = new ChatItemCard({
      chatItem,
      onShowAllWebResultsClick: this.props?.onShowAllWebResultsClick
    });
    if (chatItem.type === ChatItemType.ANSWER_STREAM) {
      this.lastChatItemCard = chatItemCard;
    } else {
      this.lastChatItemCard = null;
    }
    this.chatItemsContainer.insertChild('beforeend', chatItemCard.render);
    if (chatItem.type === ChatItemType.PROMPT || chatItem.type === ChatItemType.SYSTEM_PROMPT) {
      setTimeout(() => {
        this.chatItemsContainer.scrollTop = chatItemCard.render.offsetTop - 30;
      }, 10);
    }
  };

  public removeLastShowAllWebResultsButton = (): void => {
    Array.from(this.render.querySelectorAll('.mynah-chat-item-card-related-content-show-all')).forEach((showAllResultsButton) => {
      showAllResultsButton.remove();
    });
  };

  public removeLastFollowUps = (): void => {
    Array.from(this.render.querySelectorAll('.mynah-chat-item-followup-question')).forEach((followUp) => {
      followUp.remove();
    });
  };

  public removeAllExceptAnswersAndPrompts = async (): Promise<boolean> => await new Promise((resolve) => {
    const itemsToRemove = Array.from(this.render.querySelectorAll('.mynah-chat-item-answer:not(:has(> .mynah-card)), .mynah-chat-item-answer-stream:not(:has(> .mynah-card))'));
    if (itemsToRemove.length === 0) {
      resolve(true);
    } else {
      itemsToRemove.forEach((itemToRemove, index) => {
        (itemToRemove as ExtendedHTMLElement)?.addClass('remove');
        setTimeout(() => {
          itemToRemove.remove();
          if (index === itemsToRemove.length - 1) {
            resolve(true);
          }
        }, 200);
      });
    }
  });
}
