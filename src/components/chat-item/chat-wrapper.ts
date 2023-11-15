/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { ChatItem, ChatItemType } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { ChatItemCard } from './chat-item-card';
import { ChatPromptInput } from './chat-prompt-input';
import { ChatPromptInputInfo } from './chat-prompt-input-info';

export interface ChatWrapperProps {
  onStopChatResponse?: (tabId: string) => void;
  tabId: string;
}
export class ChatWrapper {
  private readonly props: ChatWrapperProps;
  private readonly chatItemsContainer: ExtendedHTMLElement;
  private readonly intermediateBlockContainer: ExtendedHTMLElement;
  private readonly promptInputElement: ExtendedHTMLElement;
  private readonly promptInput: ChatPromptInput;
  private readonly promptInfo: ExtendedHTMLElement;
  private lastChatItemCard: ChatItemCard | null;
  render: ExtendedHTMLElement;
  constructor (props: ChatWrapperProps) {
    this.props = props;
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('chatItems', (chatItems: ChatItem[]) => {
      const chatItemToInsert: ChatItem = chatItems[chatItems.length - 1];
      if (this.chatItemsContainer.children.length === chatItems.length) {
        const lastItem = this.chatItemsContainer.children.item(0);
        if (lastItem !== null) {
          lastItem.innerHTML = new ChatItemCard({ tabId: this.props.tabId, chatItem: chatItemToInsert }).render.innerHTML;
        }
      } else if (chatItems.length > 0) {
        if (this.chatItemsContainer.children.length === 0) {
          chatItems.forEach(chatItem => {
            this.insertChatItem(chatItem);
          });
        } else {
          this.insertChatItem(chatItemToInsert);
        }
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

    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('cancelButtonWhenLoading', (showCancelButton: boolean) => {
      if (showCancelButton) {
        this.intermediateBlockContainer.removeClass('hidden');
      } else {
        this.intermediateBlockContainer.addClass('hidden');
      }
    });

    this.promptInput = new ChatPromptInput({ tabId: this.props.tabId });
    this.promptInputElement = this.promptInput.render;
    this.promptInfo = new ChatPromptInputInfo({ tabId: this.props.tabId }).render;
    this.chatItemsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-items-container' ],
      persistent: true,
      children: [],
    });

    this.intermediateBlockContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-overflowing-intermediate-block',
        ...(MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('cancelButtonWhenLoading') === false ? [ 'hidden' ] : []) ],
      children: [
        ...(this.props?.onStopChatResponse !== undefined
          ? [ new Button({
              classNames: [ 'mynah-chat-stop-chat-response-button' ],
              label: Config.getInstance().config.texts.stopGenerating,
              icon: new Icon({ icon: MynahIcons.BLOCK }).render,
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
        this.promptInputElement,
        this.promptInfo
      ]
    });

    const initChatItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('chatItems');
    if (initChatItems.length > 0) {
      initChatItems.forEach((chatItem: ChatItem) => this.insertChatItem(chatItem));
    }
  }

  private readonly insertChatItem = (chatItem: ChatItem): void => {
    const chatItemCard = new ChatItemCard({
      tabId: this.props.tabId,
      chatItem
    });
    if (chatItem.type === ChatItemType.ANSWER_STREAM) {
      this.lastChatItemCard?.render.addClass('stream-ended');
      this.lastChatItemCard = chatItemCard;
    } else if (
      (chatItem.type === ChatItemType.ANSWER ||
        chatItem.type === ChatItemType.PROMPT ||
        chatItem.type === ChatItemType.AI_PROMPT ||
        chatItem.type === ChatItemType.SYSTEM_PROMPT) && chatItem.body !== undefined) {
      this.lastChatItemCard?.render.addClass('stream-ended');
      this.lastChatItemCard = null;
    }
    this.chatItemsContainer.insertChild('afterbegin', chatItemCard.render);
    if (chatItem.type === ChatItemType.PROMPT || chatItem.type === ChatItemType.SYSTEM_PROMPT) {
      // Make sure we scroll the chat window to the bottom
      // Only if it is a PROMPT
      this.chatItemsContainer.scrollTop = this.chatItemsContainer.scrollHeight + 500;
    }
  };

  public updateLastChatAnswer = (updateWith: Partial<ChatItem>): void => {
    if (this.lastChatItemCard !== null) {
      this.lastChatItemCard.updateCard(updateWith);
    }
  };

  public addToPrompt = (textToAdd: string): void => {
    this.promptInput.addText(textToAdd);
  };
}
