/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { generateUID } from '../../helper/guid';
import { MynahUITabsStore } from '../../helper/tabs-store';
import {
  CardRenderDetails,
  ChatItem,
  ChatItemType,
  DetailedList,
  PromptAttachmentType,
  TabHeaderDetails,
  MynahEventNames,
  QuickActionCommandGroup,
  QuickActionCommand
} from '../../static';
import { ChatItemCard } from './chat-item-card';
import { ChatPromptInput } from './chat-prompt-input';
import { ChatPromptInputInfo } from './chat-prompt-input-info';
import { ChatPromptInputStickyCard } from './chat-prompt-input-sticky-card';
import testIds from '../../helper/test-ids';
import { TitleDescriptionWithIcon } from '../title-description-with-icon';
import { GradientBackground } from '../background';
import { MoreContentIndicator } from '../more-content-indicator';
import { StyleLoader } from '../../helper/style-loader';
import { Icon, MynahIcons } from '../icon';
import { cancelEvent, MynahUIGlobalEvents } from '../../helper/events';
import { TopBarButtonOverlayProps } from './prompt-input/prompt-top-bar/top-bar-button';

export const CONTAINER_GAP = 12;
export interface ChatWrapperProps {
  onStopChatResponse?: (tabId: string) => void;
  tabId: string;
}
export class ChatWrapper {
  private readonly props: ChatWrapperProps;
  private readonly chatItemsContainer: ExtendedHTMLElement;
  private readonly promptInputElement: ExtendedHTMLElement;
  private readonly promptInput: ChatPromptInput;
  private readonly footerSpacer: ExtendedHTMLElement;
  private readonly headerSpacer: ExtendedHTMLElement;
  private readonly promptInfo: ExtendedHTMLElement;
  private readonly promptStickyCard: ExtendedHTMLElement;
  private canObserveIntersection: boolean = false;
  private observer: IntersectionObserver | null;
  private activeConversationGroup: ExtendedHTMLElement;
  private tabHeaderDetails: ExtendedHTMLElement;
  private tabModeSwitchTimeout: ReturnType<typeof setTimeout> | null;
  private lastStreamingChatItemCard: ChatItemCard | null;
  private lastStreamingChatItemMessageId: string | null;
  private allRenderedChatItems: Record<string, ChatItemCard> = {};
  render: ExtendedHTMLElement;
  constructor (props: ChatWrapperProps) {
    StyleLoader.getInstance().load('components/chat/_chat-wrapper.scss');

    this.props = props;
    this.footerSpacer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-wrapper-footer-spacer' ]
    });
    this.headerSpacer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-wrapper-header-spacer' ]
    });
    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'chatItems', (chatItems: ChatItem[]) => {
      const chatItemToInsert: ChatItem = chatItems[chatItems.length - 1];
      if (Object.keys(this.allRenderedChatItems).length === chatItems.length) {
        const lastItem = this.chatItemsContainer.children.item(Array.from(this.chatItemsContainer.children).length - 1);
        if (lastItem != null && chatItemToInsert != null) {
          const newChatItemCard = new ChatItemCard({ tabId: this.props.tabId, chatItem: chatItemToInsert });
          if (chatItemToInsert.messageId !== undefined) {
            this.allRenderedChatItems[chatItemToInsert.messageId] = newChatItemCard;
          }
          lastItem.replaceWith(newChatItemCard.render);
        }
      } else if (chatItems.length > 0) {
        if (Object.keys(this.allRenderedChatItems).length === 0) {
          chatItems.forEach(chatItem => {
            this.insertChatItem(chatItem);
          });
        } else {
          this.insertChatItem(chatItemToInsert);
        }
      } else {
        this.chatItemsContainer.clear(true);
        this.chatItemsContainer.insertChild('beforeend', this.getNewConversationGroupElement());
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

    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'tabHeaderDetails', (tabHeaderDetails: TabHeaderDetails) => {
      this.render.addClass('tab-mode-switch-animation');
      if (this.tabModeSwitchTimeout != null) {
        clearTimeout(this.tabModeSwitchTimeout);
      }
      this.tabModeSwitchTimeout = setTimeout(() => {
        this.render.removeClass('tab-mode-switch-animation');
        this.tabModeSwitchTimeout = null;
        if (tabHeaderDetails == null) {
          this.tabHeaderDetails.clear();
        }
      }, 750);

      if (tabHeaderDetails != null) {
        // Update view
        const newDetails = new TitleDescriptionWithIcon({
          testId: testIds.chat.header,
          classNames: [ 'mynah-ui-tab-header-details' ],
          ...tabHeaderDetails
        }).render;
        if (this.tabHeaderDetails != null) {
          this.tabHeaderDetails.replaceWith(newDetails);
        } else {
          this.tabHeaderDetails = newDetails;
        }

        this.render.addClass('show-tab-header-details');
      } else {
        this.render.removeClass('show-tab-header-details');
      }
    });

    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'compactMode', (compactMode: boolean) => {
      this.render.addClass('tab-mode-switch-animation');
      if (this.tabModeSwitchTimeout != null) {
        clearTimeout(this.tabModeSwitchTimeout);
      }
      this.tabModeSwitchTimeout = setTimeout(() => {
        this.render.removeClass('tab-mode-switch-animation');
        this.tabModeSwitchTimeout = null;
      }, 750);

      if (compactMode) {
        this.render.addClass('compact-mode');
      } else {
        this.render.removeClass('compact-mode');
      }
    });

    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'tabBackground', (tabBackground: boolean) => {
      if (tabBackground) {
        this.render.addClass('with-background');
      } else {
        this.render.removeClass('with-background');
      }
    });

    this.chatItemsContainer = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.chat.chatItemsContainer,
      classNames: [ 'mynah-chat-items-container' ],
      persistent: true,
      children: [
        this.getNewConversationGroupElement()
      ],
    });

    this.tabHeaderDetails = new TitleDescriptionWithIcon({
      classNames: [ 'mynah-ui-tab-header-details' ],
      ...MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('tabHeaderDetails')
    }).render;

    this.promptInfo = new ChatPromptInputInfo({ tabId: this.props.tabId }).render;
    this.promptStickyCard = new ChatPromptInputStickyCard({ tabId: this.props.tabId }).render;
    if (Config.getInstance().config.showPromptField) {
      this.promptInput = new ChatPromptInput({ tabId: this.props.tabId, onStopChatResponse: this.props?.onStopChatResponse });
      this.promptInputElement = this.promptInput.render;
    }

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.chat.wrapper,
      classNames: [ 'mynah-chat-wrapper',
        MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('tabHeaderDetails') != null ? 'show-tab-header-details' : '',
        MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('compactMode') === true ? 'compact-mode' : '',
        MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('tabBackground') === true ? 'with-background' : ''
      ],
      attributes: {
        'mynah-tab-id': this.props.tabId,
      },
      persistent: true,
      events: {
        dragenter: (e: DragEvent) => {
          if (!this.hasImageContextCommand()) return;
          cancelEvent(e);
          if ((e.dataTransfer?.types.includes('Files')) === true) {
            this.render.addClass('drag-over');
            // Only create overlay if it doesn't already exist
            const existingOverlays = this.render.getElementsByClassName('mynah-drag-overlay-content');
            const existingBlurOverlays = this.render.getElementsByClassName('mynah-drag-blur-overlay');
            if (existingOverlays.length === 0) {
              // Create and show drag overlay content
              const dragOverlay = DomBuilder.getInstance().build({
                type: 'div',
                classNames: [ 'mynah-drag-overlay-content' ],
                children: [
                  new Icon({ icon: MynahIcons.IMAGE }).render,
                  { type: 'span', children: [ 'Add image to context' ] }
                ]
              });
              this.render.appendChild(dragOverlay);
            }
            if (existingBlurOverlays.length === 0) {
              // Create blur background overlay
              const blurOverlay = DomBuilder.getInstance().build({
                type: 'div',
                classNames: [ 'mynah-drag-blur-overlay' ]
              });
              this.render.appendChild(blurOverlay);
            }
          }
        },
        dragover: (e: DragEvent) => {
          if (!this.hasImageContextCommand()) return;
          cancelEvent(e);
        },
        dragleave: (e: DragEvent) => {
          if (!this.hasImageContextCommand()) return;
          cancelEvent(e);
          // Only remove if we're leaving the wrapper entirely (not just moving to a child element)
          if (e.relatedTarget === null || !this.render.contains(e.relatedTarget as Node)) {
            this.render.removeClass('drag-over');
            // Remove drag overlay content
            const dragOverlays = this.render.getElementsByClassName('mynah-drag-overlay-content');
            while (dragOverlays.length > 0) {
              dragOverlays[0].remove();
            }
            // Remove blur overlay
            const blurOverlays = this.render.getElementsByClassName('mynah-drag-blur-overlay');
            while (blurOverlays.length > 0) {
              blurOverlays[0].remove();
            }
          }
        },
        drop: (e: DragEvent) => {
          if (!this.hasImageContextCommand()) return;
          cancelEvent(e);
          this.render.removeClass('drag-over');
          // Remove drag overlay content
          const dragOverlays = this.render.getElementsByClassName('mynah-drag-overlay-content');
          while (dragOverlays.length > 0) {
            dragOverlays[0].remove();
          }
          // Remove blur overlay
          const blurOverlays = this.render.getElementsByClassName('mynah-drag-blur-overlay');
          while (blurOverlays.length > 0) {
            blurOverlays[0].remove();
          }

          const files = Array.from(e.dataTransfer?.files ?? []);
          files.filter(file => file.type.startsWith('image/'));
          // Get the current cursor position of prompt input
          const cursorPosition = this.getPromptInputCursorPosition();
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILES_DROPPED, {
            tabId: this.props.tabId,
            insertPosition: cursorPosition,
            files
          });
        }

      },
      children: [
        {
          type: 'style',
          children: [ `
          .mynah-nav-tabs-wrapper[selected-tab="${this.props.tabId}"] ~ .mynah-ui-tab-contents-wrapper > .mynah-chat-wrapper[mynah-tab-id="${this.props.tabId}"]{
              visibility: visible;
              position: relative;
              left: initial;
              opacity: 1;
            }
            .mynah-nav-tabs-wrapper[selected-tab="${this.props.tabId}"] ~ .mynah-ui-tab-contents-wrapper > .mynah-chat-wrapper:not([mynah-tab-id="${this.props.tabId}"]) * {
              pointer-events: none !important;
            }` ],
        },
        (new GradientBackground()).render,
        this.headerSpacer,
        this.tabHeaderDetails,
        this.chatItemsContainer,
        new MoreContentIndicator({
          border: false,
          onClick: () => {
            this.chatItemsContainer.scrollTop = this.chatItemsContainer.scrollHeight;
          }
        }).render,
        this.promptStickyCard,
        this.promptInputElement,
        this.footerSpacer,
        this.promptInfo
      ]
    });

    const initChatItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('chatItems');
    if (initChatItems.length > 0) {
      initChatItems.forEach((chatItem: ChatItem) => this.insertChatItem(chatItem));
    }
  }

  private readonly getNewConversationGroupElement = (): ExtendedHTMLElement => {
    this.activeConversationGroup?.querySelector('.intersection-observer')?.remove();
    this.activeConversationGroup = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.chat.conversationContainer,
      classNames: [ 'mynah-chat-items-conversation-container' ],
      children: [
        {
          type: 'span',
          classNames: [ 'intersection-observer' ]
        }
      ],
    });
    if (this.observer == null && IntersectionObserver != null) {
      this.observer = new IntersectionObserver((entries) => {
        if (this.canObserveIntersection) {
          if (!entries[0].isIntersecting) {
            this.render?.addClass('more-content');
          } else if (this.canObserveIntersection) {
            this.canObserveIntersection = false;
            this.render?.removeClass('more-content');
            const previousObserverElement = this.activeConversationGroup.querySelector('.intersection-observer');
            if (previousObserverElement != null) {
              this.observer?.unobserve(previousObserverElement);
            }
          }
        }
      });
    } else {
      const previousObserverElement = this.activeConversationGroup.querySelector('.intersection-observer');
      if (previousObserverElement != null) {
        this.observer?.unobserve(previousObserverElement);
      }
    }
    setTimeout(() => {
      this.canObserveIntersection = true;
    }, 500);
    this.canObserveIntersection = false;
    this.render?.removeClass('more-content');
    this.observer?.observe(this.activeConversationGroup.querySelector('.intersection-observer') as HTMLSpanElement);
    return this.activeConversationGroup;
  };

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

    if (chatItem.type === ChatItemType.PROMPT) {
      this.chatItemsContainer.insertChild('beforeend', this.getNewConversationGroupElement());
    }

    // Add to render
    this.activeConversationGroup.insertChild('beforeend', chatItemCard.render);

    // Add to all rendered chat items map
    this.allRenderedChatItems[currentMessageId] = chatItemCard;

    if (chatItem.type === ChatItemType.PROMPT || chatItem.type === ChatItemType.SYSTEM_PROMPT) {
      // Make sure we align to top when there is a new prompt.
      // Only if it is a PROMPT!
      // Check css application
      this.chatItemsContainer.addClass('set-scroll');
    }

    setTimeout(() => {
      // remove css class which allows us to snap automatically
      this.chatItemsContainer.removeClass('set-scroll');
    }, 100);
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

  public openTopBarButtonItemOverlay = (data: TopBarButtonOverlayProps): void => {
    this.promptInput.openTopBarButtonItemOverlay(data);
  };

  public updateTopBarButtonItemOverlay = (data: DetailedList): void => {
    this.promptInput.updateTopBarButtonItemOverlay(data);
  };

  public closeTopBarButtonItemOverlay = (): void => {
    this.promptInput.closeTopBarButtonItemOverlay();
  };

  public getPromptInputCursorPosition = (): number => {
    return this.promptInput.getCursorPosition();
  };

  /**
   * Returns true if the current tab has an image context command available.
   */
  private hasImageContextCommand (): boolean {
    const contextCommands = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('contextCommands') as QuickActionCommandGroup[] | undefined;
    return !((contextCommands?.some(group =>
      group.commands.some((cmd: QuickActionCommand) => cmd.command.toLowerCase() === 'image')
    )) === false);
  }

  public destroy = (): void => {
    if (this.observer != null) {
      this.observer.disconnect();
      this.observer = null;
    }
  };

  public getCurrentTriggerSource (): 'top-bar' | 'prompt-input' {
    return this.promptInput?.getCurrentTriggerSource?.() ?? 'prompt-input';
  }
}
