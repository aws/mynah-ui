/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { ChatItem, ChatItemType, Suggestion } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { ChatItemCard } from './chat-item-card';
import { ChatItemTreeViewWrapper } from './chat-item-tree-view-wrapper';
import { ChatPromptInput } from './chat-prompt-input';

export interface ChatWrapperProps {
  onStopChatResponse?: (tabId: string) => void;
  tabId: string;
}
export class ChatWrapper {
  private readonly props: ChatWrapperProps;
  private readonly chatItemsContainer: ExtendedHTMLElement;
  private readonly intermediateBlockContainer: ExtendedHTMLElement;
  private readonly promptInput: ExtendedHTMLElement;
  private lastChatItemCard: ChatItemCard | null;
  render: ExtendedHTMLElement;
  constructor (props: ChatWrapperProps) {
    this.props = props;
    const initChatItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('chatItems');
    if (initChatItems.length > 0) {
      initChatItems.forEach((chatItem: ChatItem) => this.insertChatItem(chatItem));
    }
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('chatItems', (chatItems: ChatItem[]) => {
      const chatItemToInsert: ChatItem = chatItems[chatItems.length - 1];
      if (this.chatItemsContainer.children.length === chatItems.length) {
        const lastItem = this.chatItemsContainer.children.item(0);
        if (lastItem !== null) {
          lastItem.innerHTML = new ChatItemCard({ tabId: this.props.tabId, chatItem: chatItemToInsert }).render.innerHTML;
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
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('loadingChat', (loadingChat: boolean) => {
      if (loadingChat) {
        this.render.addClass('loading');
      } else {
        this.render.removeClass('loading');
      }
    });

    this.promptInput = new ChatPromptInput({ tabId: this.props.tabId }).render;
    this.chatItemsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-items-container' ],
      persistent: true,
      children: [],
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
                  this.props?.onStopChatResponse(this.props.tabId);
                }
              },
            }).render ]
          : [])
      ]
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-wrapper' ],
      attributes: {
        'mynah-tab-id': this.props.tabId,
      },
      persistent: true,
      children: [
        {
          type: 'style',
          children: [ `
          .mynah-nav-tabs-wrapper[selected-tab="${this.props.tabId}"] + .mynah-ui-tab-contents-wrapper > .mynah-chat-wrapper[mynah-tab-id="${this.props.tabId}"]{
              display: flex;
            }
            .mynah-nav-tabs-wrapper[selected-tab="${this.props.tabId}"] + .mynah-ui-tab-contents-wrapper > .mynah-chat-wrapper:not([mynah-tab-id="${this.props.tabId}"]) * {
              pointer-events: none !important;
            }` ],
        },
        this.chatItemsContainer,
        this.intermediateBlockContainer,
        this.promptInput ]
    });
  }

  private readonly insertChatItem = (chatItem: ChatItem): void => {
    const chatItemCard = chatItem.type === ChatItemType.CODE_RESULT
      ? new ChatItemTreeViewWrapper({ files: chatItem.body as string[] })
      : new ChatItemCard({
        tabId: this.props.tabId,
        chatItem
      });
    if (chatItem.type === ChatItemType.ANSWER_STREAM) {
      this.lastChatItemCard = chatItemCard as ChatItemCard;
    } else {
      this.lastChatItemCard?.render.addClass('stream-ended');
      this.lastChatItemCard = null;
    }
    this.chatItemsContainer.insertChild('afterbegin', chatItemCard.render);
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

  public updateLastCharAnswerStream = (updateWith: string | {
    title: string | boolean;
    suggestions: Suggestion[];
  }): void => {
    if (this.lastChatItemCard !== null) {
      if (typeof updateWith === 'string') {
        this.lastChatItemCard.updateAnswerBody(updateWith);
      } else if (typeof updateWith === 'object' && updateWith.suggestions !== undefined) {
        this.lastChatItemCard.updateAnswerBody(
          new ChatItemCard({
            tabId: this.props.tabId,
            chatItem: {
              type: ChatItemType.ANSWER,
              suggestions: updateWith
            }
          }).render
        );
      }
    }
  };
}
