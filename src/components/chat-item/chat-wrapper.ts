/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';
import { ChatItem, ChatItemType, MynahEventNames } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { ChatItemCard } from './chat-item-card';
import { ChatPromptInput } from './chat-prompt-input';

export interface ChatWrapperProps {
  onStopChatResponse?: () => void;
  onShowAllWebResultsClick?: () => void;
}
export class ChatWrapper {
  private readonly props?: ChatWrapperProps;
  private readonly chatItemsContainer: ExtendedHTMLElement;
  private readonly intermediateBlockContainer: ExtendedHTMLElement;
  private readonly promptInput: ExtendedHTMLElement;
  private lastChatItemCard: ChatItemCard | null;
  private containerScollState: 'idle' | 'streaming' | 'break';
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
          this.removeAllExceptAnswersAndPrompts();
        }
        this.insertChatItem(chatItemToInsert);
      } else {
        this.chatItemsContainer.clear(true);
      }
    });
    MynahUIDataStore.getInstance().subscribe('loadingChat', (loadingChat) => {
      if (loadingChat === true) {
        this.render.addClass('loading');
      } else {
        this.render.removeClass('loading');
      }
    });
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.UPDATE_LAST_CHAT_ANSWER_STREAM, (updateWith) => {
      if (this.lastChatItemCard !== null) {
        if (this.containerScollState !== 'break') {
          this.containerScollState = 'streaming';
          this.scrollToStreamingCardBottom();
        }
        if (typeof updateWith === 'string') {
          this.lastChatItemCard.updateAnswerBody(updateWith);
        } else if (typeof updateWith === 'object' && updateWith.suggestions !== undefined) {
          this.lastChatItemCard.updateAnswerBody(
            new ChatItemCard({
              chatItem: {
                type: ChatItemType.ANSWER,
                suggestions: updateWith
              }
            }).render
          );
        }
      }
    });

    this.promptInput = new ChatPromptInput().render;
    this.chatItemsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-items-container' ],
      persistent: true,
      children: [ ],
      events: {
        wheel: (e) => {
          if (this.containerScollState === 'streaming') {
            this.containerScollState = 'break';
          }
        }
      }
    });

    this.intermediateBlockContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-overflowing-intermediate-block' ],
      children: [
        ...(this.props?.onStopChatResponse !== undefined
          ? [ new Button({
              classNames: [ 'mynah-chat-stop-chat-response-button' ],
              label: 'Stop generating',
              icon: new Icon({ icon: MynahIcons.CANCEL }).render,
              onClick: () => {
                if ((this.props?.onStopChatResponse) !== undefined) {
                  this.props?.onStopChatResponse();
                }
              },
            }).render ]
          : [])
      ]
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-wrapper' ],
      persistent: true,
      children: [ this.chatItemsContainer, this.intermediateBlockContainer, this.promptInput ]
    });
  }

  private readonly insertChatItem = (chatItem: ChatItem): void => {
    this.containerScollState = 'idle';
    const chatItemCard = new ChatItemCard({
      chatItem,
      onShowAllWebResultsClick: this.props?.onShowAllWebResultsClick
    });
    if (chatItem.type === ChatItemType.ANSWER_STREAM) {
      this.lastChatItemCard = chatItemCard;
    } else {
      this.lastChatItemCard?.render.addClass('stream-ended');
      this.lastChatItemCard = null;
    }
    this.chatItemsContainer.insertChild('beforeend', chatItemCard.render);
    if (chatItem.type === ChatItemType.PROMPT) {
      setTimeout(() => {
        this.chatItemsContainer.scrollTop = chatItemCard.render.offsetTop - 30;
      }, 10);
    }
  };

  private readonly scrollToStreamingCardBottom = (): void => {
    if (this.containerScollState === 'streaming' && this.lastChatItemCard != null) {
      if ((this.lastChatItemCard.render.offsetHeight + this.lastChatItemCard.render.getBoundingClientRect().top) >= (this.chatItemsContainer.offsetHeight - 75)) {
        this.chatItemsContainer.scrollTop = this.lastChatItemCard.render.offsetTop + this.lastChatItemCard.render.offsetHeight - this.chatItemsContainer.offsetHeight + 75;
      }
    }
  };

  public removeAllExceptAnswersAndPrompts = (): void => {
    const itemsToRemove = Array.from(this.render.querySelectorAll(':scope > .mynah-chat-items-container > .mynah-chat-item-card-muted'));
    if (itemsToRemove.length === 0) {
      return;
    }
    itemsToRemove.forEach(itemToRemove => {
      itemToRemove.remove();
    });
  };
}
