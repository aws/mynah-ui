/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { generateUID } from '../../helper/guid';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { CardRenderDetails, ChatItem, ChatItemType, PromptAttachmentType } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { ChatItemCard } from './chat-item-card';
import { ChatPromptInput } from './chat-prompt-input';
import { ChatPromptInputInfo } from './chat-prompt-input-info';
import { ChatPromptInputStickyCard } from './chat-prompt-input-sticky-card';
import '../../styles/components/chat/_chat-wrapper.scss';

export const CONTAINER_GAP = 12;
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
  private readonly promptStickyCard: ExtendedHTMLElement;
  private lastStreamingChatItemCard: ChatItemCard | null;
  private lastStreamingChatItemMessageId: string | null;
  private allRenderedChatItems: Record<string, ChatItemCard> = {};
  render: ExtendedHTMLElement;
  constructor (props: ChatWrapperProps) {
    this.props = props;
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('chatItems', (chatItems: ChatItem[]) => {
      const chatItemToInsert: ChatItem = chatItems[chatItems.length - 1];
      if (this.chatItemsContainer.children.length === chatItems.length) {
        const lastItem = this.chatItemsContainer.children.item(0);
        if (lastItem !== null) {
          const newChatItemCard = new ChatItemCard({ tabId: this.props.tabId, chatItem: chatItemToInsert });
          if (chatItemToInsert.messageId !== undefined) {
            this.allRenderedChatItems[chatItemToInsert.messageId] = newChatItemCard;
          }
          lastItem.innerHTML = newChatItemCard.render.innerHTML;
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
        this.allRenderedChatItems = {};
      }
    });
    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'loadingChat', (loadingChat: boolean) => {
      if (loadingChat) {
        this.render.addClass('loading');
      } else {
        this.render.removeClass('loading');
      }
    });

    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'cancelButtonWhenLoading', (showCancelButton: boolean) => {
      if (showCancelButton) {
        this.intermediateBlockContainer.removeClass('hidden');
      } else {
        this.intermediateBlockContainer.addClass('hidden');
      }
    });

    this.chatItemsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-items-container' ],
      persistent: true,
      children: [],
    });

    this.promptInfo = new ChatPromptInputInfo({ tabId: this.props.tabId }).render;
    this.promptStickyCard = new ChatPromptInputStickyCard({ tabId: this.props.tabId }).render;
    this.intermediateBlockContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-overflowing-intermediate-block',
        ...(MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('cancelButtonWhenLoading') === false ? [ 'hidden' ] : []) ],
      children: [
        ...(this.props?.onStopChatResponse !== undefined
          ? [ new Button({
              classNames: [ 'mynah-chat-stop-chat-response-button' ],
              label: Config.getInstance().config.texts.stopGenerating,
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
    if (Config.getInstance().config.showPromptField) {
      this.promptInput = new ChatPromptInput({ tabId: this.props.tabId });
      this.promptInputElement = this.promptInput.render;
    }

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
          .mynah-nav-tabs-wrapper[selected-tab="${this.props.tabId}"] ~ .mynah-ui-tab-contents-wrapper > .mynah-chat-wrapper[mynah-tab-id="${this.props.tabId}"]{
              display: flex;
            }
            .mynah-nav-tabs-wrapper[selected-tab="${this.props.tabId}"] ~ .mynah-ui-tab-contents-wrapper > .mynah-chat-wrapper:not([mynah-tab-id="${this.props.tabId}"]) * {
              pointer-events: none !important;
            }` ],
        },
        this.chatItemsContainer,
        this.intermediateBlockContainer,
        this.promptStickyCard,
        this.promptInputElement,
        this.promptInfo
      ]
    });

    const initChatItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('chatItems');
    if (initChatItems.length > 0) {
      initChatItems.forEach((chatItem: ChatItem) => this.insertChatItem(chatItem));
    }
  }

  private readonly removeEmptyCardsAndFollowups = (): void => {
    Object.keys(this.allRenderedChatItems).forEach(messageId => {
      if (this.allRenderedChatItems[messageId].cleanFollowupsAndRemoveIfEmpty()) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.allRenderedChatItems[messageId];
      }
    });
  };

  private readonly insertChatItem = (chatItem: ChatItem): void => {
    this.removeEmptyCardsAndFollowups();
    const currentMessageId: string = (chatItem.messageId != null && chatItem.messageId !== '') ? chatItem.messageId : `TEMP_${generateUID()}`;
    const chatItemCard = new ChatItemCard({
      tabId: this.props.tabId,
      chatItem: {
        ...chatItem,
        messageId: currentMessageId
      }
    });

    // When a new card appears, we're cleaning the last streaming card vars, since it is not the last anymore
    if (this.lastStreamingChatItemMessageId != null) {
      this.endStreamWithMessageId(this.lastStreamingChatItemMessageId, {});
    }

    if (chatItem.type === ChatItemType.ANSWER_STREAM) {
      // Update the lastStreaming variables with the new one
      this.lastStreamingChatItemMessageId = currentMessageId;
      this.lastStreamingChatItemCard = chatItemCard;
    }

    // Add to render
    this.chatItemsContainer.insertChild('afterbegin', chatItemCard.render);

    // Add to all rendered chat items map
    this.allRenderedChatItems[currentMessageId] = chatItemCard;

    if (chatItem.type === ChatItemType.PROMPT || chatItem.type === ChatItemType.SYSTEM_PROMPT) {
      // Make sure we scroll the chat window to the bottom
      // Only if it is a PROMPT
      this.chatItemsContainer.scrollTop = this.chatItemsContainer.scrollHeight + 500;
    }
  };

  private readonly checkLastAnswerStreamChange = (updateWith: Partial<ChatItem>): void => {
    // If the new type is not a stream anymore
    // Clear lastStremingMessage variables.
    if (updateWith.type !== undefined &&
        updateWith.type !== null &&
        updateWith.type !== ChatItemType.ANSWER_STREAM &&
        updateWith.type !== ChatItemType.ANSWER_PART) {
      this.lastStreamingChatItemCard = null;
      this.lastStreamingChatItemMessageId = null;
    }
  };

  public updateLastChatAnswer = (updateWith: Partial<ChatItem>): void => {
    if (this.lastStreamingChatItemCard != null) {
      this.lastStreamingChatItemCard.updateCardStack(updateWith);
      if (updateWith.messageId != null && updateWith.messageId !== '') {
        if (this.lastStreamingChatItemMessageId != null && this.lastStreamingChatItemMessageId !== updateWith.messageId) {
          const renderChatItemInMap = this.allRenderedChatItems[this.lastStreamingChatItemMessageId];
          if (renderChatItemInMap != null) {
            this.allRenderedChatItems[updateWith.messageId] = renderChatItemInMap;
            if (this.lastStreamingChatItemMessageId != null) {
              // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
              delete this.allRenderedChatItems[this.lastStreamingChatItemMessageId];
            }
          }
        }
        this.lastStreamingChatItemMessageId = updateWith.messageId;
      }

      this.checkLastAnswerStreamChange(updateWith);
    }
  };

  public getLastStreamingMessageId = (): string | null => {
    return this.lastStreamingChatItemMessageId;
  };

  public getChatItem = (messageId: string): {
    chatItem: ChatItem;
    render: ExtendedHTMLElement | HTMLElement;
    renderDetails: CardRenderDetails;
  } | undefined => {
    if (this.allRenderedChatItems[messageId]?.render !== undefined) {
      return {
        chatItem: this.allRenderedChatItems[messageId].props.chatItem,
        render: this.allRenderedChatItems[messageId].render,
        renderDetails: this.allRenderedChatItems[messageId].getRenderDetails()
      };
    }
  };

  public endStreamWithMessageId = (messageId: string, updateWith: Partial<ChatItem>): void => {
    if (this.allRenderedChatItems[messageId]?.render !== undefined) {
      this.allRenderedChatItems[messageId].render.addClass('stream-ended');
      this.updateChatAnswerWithMessageId(messageId, updateWith);

      // If the last streaming chat answer is the same with the messageId
      if (this.lastStreamingChatItemMessageId === messageId) {
        this.lastStreamingChatItemCard = null;
        this.lastStreamingChatItemMessageId = null;
      }
    }
  };

  public updateChatAnswerWithMessageId = (messageId: string, updateWith: Partial<ChatItem>): void => {
    if (this.allRenderedChatItems[messageId]?.render !== undefined) {
      this.allRenderedChatItems[messageId].updateCardStack(updateWith);

      // If the last streaming chat answer is the same with the messageId
      if (this.lastStreamingChatItemMessageId === messageId) {
        this.checkLastAnswerStreamChange(updateWith);
      }
    }
  };

  public addAttachmentToPrompt = (textToAdd: string, type?: PromptAttachmentType): void => {
    this.promptInput.addAttachment(textToAdd, type);
  };
}
