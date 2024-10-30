/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { CardRenderDetails, ChatItem, ChatItemType, MynahEventNames } from '../../static';
import { CardBody, CardBodyProps } from '../card/card-body';
import { Icon, MynahIcons } from '../icon';
import { ChatItemFollowUpContainer } from './chat-item-followup';
import { ChatItemSourceLinksContainer } from './chat-item-source-links';
import { ChatItemRelevanceVote } from './chat-item-relevance-vote';
import { ChatItemTreeViewWrapper } from './chat-item-tree-view-wrapper';
import { Config } from '../../helper/config';
import { ChatItemFormItemsWrapper } from './chat-item-form-items';
import { ChatItemButtonsWrapper } from './chat-item-buttons';
import { cleanHtml } from '../../helper/sanitize';
import { CONTAINER_GAP } from './chat-wrapper';
import { chatItemHasContent, emptyChatItemContent } from '../../helper/chat-item';
import { Card } from '../card/card';
import { ChatItemCardContent, ChatItemCardContentProps } from './chat-item-card-content';
import testIds from '../../helper/test-ids';
import { ChatItemInformationCard } from './chat-item-information-card';
import { ChatItemTabbedCard } from './chat-item-tabbed-card';

export interface ChatItemCardProps {
  tabId: string;
  chatItem: ChatItem;
  inline?: boolean;
  small?: boolean;
}
export class ChatItemCard {
  readonly props: ChatItemCardProps;
  render: ExtendedHTMLElement;
  private readonly card: Card | null = null;
  private readonly updateStack: Array<Partial<ChatItem>> = [];
  private readonly initialSpinner: ExtendedHTMLElement[] | null = null;
  private cardFooter: ExtendedHTMLElement | null = null;
  private informationCard: ChatItemInformationCard | null = null;
  private tabbedCard: ChatItemTabbedCard | null = null;
  private cardIcon: Icon | null = null;
  private contentBody: ChatItemCardContent | null = null;
  private chatAvatar: ExtendedHTMLElement;
  private chatFormItems: ChatItemFormItemsWrapper | null = null;
  private customRendererWrapper: CardBody | null = null;
  private chatButtons: ChatItemButtonsWrapper | null = null;
  private fileTreeWrapper: ChatItemTreeViewWrapper | null = null;
  private followUps: ChatItemFollowUpContainer | null = null;
  private votes: ChatItemRelevanceVote | null = null;
  private footer: ChatItemCard | null = null;
  constructor (props: ChatItemCardProps) {
    this.props = props;
    this.chatAvatar = this.getChatAvatar();
    MynahUITabsStore.getInstance()
      .getTabDataStore(this.props.tabId)
      .subscribe('showChatAvatars', (value: boolean) => {
        if (value && this.canShowAvatar()) {
          this.chatAvatar = this.getChatAvatar();
          this.render.insertChild('afterbegin', this.chatAvatar);
        } else {
          this.chatAvatar.remove();
        }
      });
    if (this.props.chatItem.type === ChatItemType.ANSWER_STREAM) {
      this.initialSpinner = [ DomBuilder.getInstance().build({
        type: 'div',
        persistent: true,
        classNames: [ 'mynah-chat-items-spinner' ],
        children: [ { type: 'span' }, { type: 'div', children: [ Config.getInstance().config.texts.spinnerText ] } ],
      }) ];
    }
    this.cardFooter = this.getCardFooter();
    this.card = new Card({
      testId: testIds.chatItem.card,
      children: this.initialSpinner ?? [],
      background: this.props.inline !== true,
      border: this.props.inline !== true,
      padding: this.props.inline === true ? 'none' : undefined,
    });
    this.updateCardContent();
    this.render = this.generateCard();

    if (this.props.chatItem.type === ChatItemType.ANSWER_STREAM &&
      (this.props.chatItem.body ?? '').trim() !== '') {
      this.updateCardStack({});
    }
  }

  private readonly getCardFooter = (): ExtendedHTMLElement => {
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card-footer', 'mynah-card-inner-order-70' ]
    });
  };

  private readonly generateCard = (): ExtendedHTMLElement => {
    const generatedCard = DomBuilder.getInstance().build({
      type: 'div',
      testId: `${testIds.chatItem.type.any}-${this.props.chatItem.type ?? ChatItemType.ANSWER}`,
      classNames: this.getCardClasses(),
      attributes: {
        messageId: this.props.chatItem.messageId ?? 'unknown',
      },
      children: [
        ...(this.canShowAvatar() && MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('showChatAvatars') === true ? [ this.chatAvatar ] : []),
        ...(this.card != null ? [ this.card?.render ] : []),
        ...(this.props.chatItem.followUp?.text !== undefined ? [ new ChatItemFollowUpContainer({ tabId: this.props.tabId, chatItem: this.props.chatItem }).render ] : [])
      ],
    });

    setTimeout(
      () => {
        generatedCard.addClass('reveal');
        this.checkCardSnap();
      },
      this.props.chatItem.type === ChatItemType.PROMPT ? 10 : 200
    );

    return generatedCard;
  };

  private readonly getCardClasses = (): string[] => {
    return [
      ...(this.props.chatItem.icon !== undefined ? [ 'mynah-chat-item-card-has-icon' ] : []),
      ...(this.props.inline === true ? [ 'mynah-ui-chat-item-inline-card' ] : []),
      ...(this.props.small === true ? [ 'mynah-ui-chat-item-small-card' ] : []),
      `mynah-chat-item-card-status-${this.props.chatItem.status ?? 'default'}`,
      'mynah-chat-item-card',
      `mynah-chat-item-${this.props.chatItem.type ?? ChatItemType.ANSWER}`,
      ...(!chatItemHasContent(this.props.chatItem) ? [ 'mynah-chat-item-empty' ] : []),
    ];
  };

  private readonly updateCardContent = (): void => {
    if (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId) === undefined) {
      return;
    }

    const bodyEvents: Partial<CardBodyProps> = {
      onLinkClick: (url: string, e: MouseEvent) => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.LINK_CLICK, {
          messageId: this.props.chatItem.messageId,
          link: url,
          event: e,
        });
      },
      onCopiedToClipboard: (type, text, referenceTrackerInformation, codeBlockIndex) => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.COPY_CODE_TO_CLIPBOARD, {
          messageId: this.props.chatItem.messageId,
          type,
          text,
          referenceTrackerInformation,
          codeBlockIndex,
          totalCodeBlocks: (this.contentBody?.getRenderDetails().totalNumberOfCodeBlocks ?? 0) + (this.customRendererWrapper?.nextCodeBlockIndex ?? 0),
        });
      },
      ...(Object.keys(Config.getInstance().config.codeBlockActions ?? {}).length > 0 || Object.keys(this.props.chatItem.codeBlockActions ?? {}).length > 0
        ? {
            codeBlockActions: {
              ...Config.getInstance().config.codeBlockActions,
              ...this.props.chatItem.codeBlockActions
            },
            onCodeBlockAction: (actionId, data, type, text, referenceTrackerInformation, codeBlockIndex) => {
              MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CODE_BLOCK_ACTION, {
                actionId,
                data,
                messageId: this.props.chatItem.messageId,
                type,
                text,
                referenceTrackerInformation,
                codeBlockIndex,
                totalCodeBlocks: (this.contentBody?.getRenderDetails().totalNumberOfCodeBlocks ?? 0) + (this.customRendererWrapper?.nextCodeBlockIndex ?? 0),
              });
            }
          }
        : {})
    };

    if (chatItemHasContent(this.props.chatItem)) {
      this.initialSpinner?.[0]?.remove();
    }

    /**
     * Generate card icon if available
     */
    if (this.props.chatItem.icon !== undefined) {
      if (this.cardIcon != null) {
        this.cardIcon.render.remove();
        this.cardIcon = null;
      } else {
        this.cardIcon = new Icon({ icon: this.props.chatItem.icon, classNames: [ 'mynah-chat-item-card-icon', 'mynah-card-inner-order-10' ] });
        this.card?.render.insertChild('beforeend', this.cardIcon.render);
      }
    }

    /**
     * Generate contentBody if available
    */
    if (this.props.chatItem.body != null && this.props.chatItem.body !== '') {
      const updatedCardContentBodyProps: ChatItemCardContentProps = {
        body: this.props.chatItem.body ?? '',
        classNames: [ 'mynah-card-inner-order-20' ],
        renderAsStream: this.props.chatItem.type === ChatItemType.ANSWER_STREAM,
        codeReference: this.props.chatItem.codeReference ?? undefined,
        onAnimationStateChange: (isAnimating) => {
          if (isAnimating) {
            this.render?.addClass('typewriter-animating');
          } else {
            this.render?.removeClass('typewriter-animating');
          }
        },
        children:
          this.props.chatItem.relatedContent !== undefined
            ? [
                new ChatItemSourceLinksContainer({
                  messageId: this.props.chatItem.messageId ?? 'unknown',
                  tabId: this.props.tabId,
                  relatedContent: this.props.chatItem.relatedContent?.content,
                  title: this.props.chatItem.relatedContent?.title,
                }).render,
              ]
            : [],
        contentProperties: bodyEvents,
      };
      if (this.contentBody != null) {
        this.contentBody.updateCardStack(updatedCardContentBodyProps);
      } else {
        this.contentBody = new ChatItemCardContent(updatedCardContentBodyProps);
        this.card?.render.insertChild('beforeend', this.contentBody.render);
      }
    }

    /**
     * Generate customRenderer if available
     */
    if (this.customRendererWrapper != null) {
      this.customRendererWrapper.render.remove();
      this.customRendererWrapper = null;
    }
    if (this.props.chatItem.customRenderer != null) {
      const customRendererContent: Partial<DomBuilderObject> = {};

      if (typeof this.props.chatItem.customRenderer === 'object') {
        customRendererContent.children = Array.isArray(this.props.chatItem.customRenderer) ? this.props.chatItem.customRenderer : [ this.props.chatItem.customRenderer ];
      } else if (typeof this.props.chatItem.customRenderer === 'string') {
        customRendererContent.innerHTML = cleanHtml(this.props.chatItem.customRenderer);
      }

      this.customRendererWrapper = new CardBody({
        body: customRendererContent.innerHTML,
        children: customRendererContent.children,
        classNames: [ 'mynah-card-inner-order-30' ],
        processChildren: true,
        useParts: true,
        codeBlockStartIndex: (this.contentBody?.getRenderDetails().totalNumberOfCodeBlocks ?? 0),
        ...bodyEvents,
      });

      this.card?.render.insertChild('beforeend', this.customRendererWrapper.render);
    }

    /**
       * Generate form items if available
      */
    if (this.chatFormItems != null) {
      this.chatFormItems.render.remove();
      this.chatFormItems = null;
    }
    if (this.props.chatItem.formItems != null) {
      this.chatFormItems = new ChatItemFormItemsWrapper({
        classNames: [ 'mynah-card-inner-order-40' ],
        tabId: this.props.tabId,
        chatItem: this.props.chatItem
      });
      this.card?.render.insertChild('beforeend', this.chatFormItems.render);
    }

    /**
     * Generate file tree if available
     */
    if (this.fileTreeWrapper != null) {
      this.fileTreeWrapper.render.remove();
      this.fileTreeWrapper = null;
    }
    if (this.props.chatItem.fileList != null) {
      const { filePaths = [], deletedFiles = [], actions, details } = this.props.chatItem.fileList;
      const referenceSuggestionLabel = this.props.chatItem.body ?? '';
      this.fileTreeWrapper = new ChatItemTreeViewWrapper({
        tabId: this.props.tabId,
        classNames: [ 'mynah-card-inner-order-50' ],
        messageId: this.props.chatItem.messageId ?? '',
        cardTitle: this.props.chatItem.fileList.fileTreeTitle,
        rootTitle: this.props.chatItem.fileList.rootFolderTitle,
        files: filePaths,
        deletedFiles,
        actions,
        details,
        references: this.props.chatItem.codeReference ?? [],
        referenceSuggestionLabel,
      });
      this.card?.render.insertChild('beforeend', this.fileTreeWrapper.render);
    }

    /**
     * Generate information card if available
     */
    if (this.informationCard != null) {
      this.informationCard.render.remove();
      this.informationCard = null;
    }
    if (this.props.chatItem.informationCard != null) {
      this.informationCard = new ChatItemInformationCard({
        tabId: this.props.tabId,
        messageId: this.props.chatItem.messageId,
        informationCard: this.props.chatItem.informationCard
      });
      this.card?.render.insertChild('beforeend', this.informationCard.render);
    }

    /**
     * Generate buttons if available
     */
    if (this.chatButtons != null) {
      this.chatButtons.render.remove();
      this.chatButtons = null;
    }
    if (this.props.chatItem.buttons != null) {
      this.chatButtons = new ChatItemButtonsWrapper({
        tabId: this.props.tabId,
        classNames: [ 'mynah-card-inner-order-60' ],
        formItems: this.chatFormItems,
        buttons: this.props.chatItem.buttons,
        onActionClick: action => {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
            tabId: this.props.tabId,
            messageId: this.props.chatItem.messageId,
            actionId: action.id,
            actionText: action.text,
            ...(this.chatFormItems !== null ? { formItemValues: this.chatFormItems.getAllValues() } : {}),
          });

          if (action.keepCardAfterClick === false) {
            this.render.remove();
            if (this.props.chatItem.messageId !== undefined) {
              const currentChatItems: ChatItem[] = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('chatItems');
              MynahUITabsStore.getInstance()
                .getTabDataStore(this.props.tabId)
                .updateStore(
                  {
                    chatItems: [ ...currentChatItems.map(chatItem => this.props.chatItem.messageId !== chatItem.messageId ? chatItem : { type: ChatItemType.ANSWER, messageId: chatItem.messageId }) ],
                  },
                  true
                );
            }
          }
        },
      });
      this.card?.render.insertChild('beforeend', this.chatButtons.render);
    }

    /**
     * Generate tabbed card if available
     */
    if (this.tabbedCard != null) {
      this.tabbedCard.render.remove();
      this.tabbedCard = null;
    }
    if (this.props.chatItem.tabbedContent != null) {
      this.tabbedCard = new ChatItemTabbedCard({
        tabId: this.props.tabId,
        messageId: this.props.chatItem.messageId,
        tabbedCard: this.props.chatItem.tabbedContent
      });
      this.card?.render.insertChild('beforeend', this.tabbedCard.render);
    }

    /**
     * Clear footer block
     */
    if (this.cardFooter != null) {
      this.cardFooter.remove();
      this.cardFooter = null;
    }
    if (this.props.chatItem.footer != null || this.props.chatItem.canBeVoted === true) {
      this.cardFooter = this.getCardFooter();
      this.card?.render.insertChild('beforeend', this.cardFooter);

      /**
       * Generate footer if available
       */
      if (this.footer != null) {
        this.footer.render.remove();
        this.footer = null;
      }
      if (this.props.chatItem.footer != null) {
        this.footer = new ChatItemCard({
          tabId: this.props.tabId,
          small: true,
          inline: true,
          chatItem: {
            ...this.props.chatItem.footer,
            type: ChatItemType.ANSWER,
            messageId: this.props.chatItem.messageId
          }
        });
        this.cardFooter.insertChild('beforeend', this.footer.render);
      }

      /**
     * Generate votes if available
     */
      if (this.votes !== null) {
        this.votes.render.remove();
        this.votes = null;
      }
      if (this.props.chatItem.canBeVoted === true && this.props.chatItem.messageId !== undefined) {
        this.votes = new ChatItemRelevanceVote({
          tabId: this.props.tabId,
          messageId: this.props.chatItem.messageId
        });
        this.cardFooter.insertChild('beforeend', this.votes.render);
      }
    }

    /**
     * Generate/update followups if available
     */
    if (this.followUps !== null) {
      this.followUps.render.remove();
      this.followUps = null;
    }
    if (this.props.chatItem.followUp != null) {
      this.followUps = new ChatItemFollowUpContainer({ tabId: this.props.tabId, chatItem: this.props.chatItem });
      this.render?.insertChild('beforeend', this.followUps.render);
    }
  };

  private readonly getChatAvatar = (): ExtendedHTMLElement =>
    DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card-icon-wrapper' ],
      children: [ new Icon({ icon: this.props.chatItem.type === ChatItemType.PROMPT ? MynahIcons.USER : MynahIcons.Q }).render ],
    });

  private readonly canShowAvatar = (): boolean => (this.props.chatItem.type === ChatItemType.ANSWER_STREAM || (this.props.inline !== true && chatItemHasContent({ ...this.props.chatItem, followUp: undefined })));

  private readonly checkCardSnap = (): void => {
    // If the chat item has snapToTop value as true, we'll snap the card to the container top
    if (this.render.offsetParent != null && this.props.chatItem.snapToTop === true) {
      this.render.offsetParent.scrollTop = this.render.offsetTop - CONTAINER_GAP - (this.render.offsetParent as HTMLElement).offsetTop;
    }
  };

  public readonly updateCard = (): void => {
    if (this.updateStack.length > 0) {
      const updateWith: Partial<ChatItem> | undefined = this.updateStack.shift();
      if (updateWith !== undefined) {
        this.props.chatItem = {
          ...this.props.chatItem,
          ...updateWith,
        };

        // Update item inside the store
        if (this.props.chatItem.messageId !== undefined) {
          const currentTabChatItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId)?.getStore()?.chatItems;
          MynahUITabsStore.getInstance()
            .getTabDataStore(this.props.tabId)
            .updateStore(
              {
                chatItems: currentTabChatItems?.map((chatItem: ChatItem) => {
                  if (chatItem.messageId === this.props.chatItem.messageId) {
                    return this.props.chatItem;
                  }
                  return chatItem;
                }),
              },
              true
            );
        }

        this.render?.update({
          ...(this.props.chatItem.messageId != null
            ? {
                attributes: {
                  messageid: this.props.chatItem.messageId
                }
              }
            : {}),
          classNames: [ ...this.getCardClasses(), 'reveal' ],
        });
        this.updateCardContent();
        this.updateCard();
      }
    } else {
      setTimeout(() => {
        this.checkCardSnap();
      }, 200);
    }
  };

  public readonly updateCardStack = (updateWith: Partial<ChatItem>): void => {
    this.updateStack.push(updateWith);
    this.updateCard();
  };

  public readonly reset = (): void => {
    this.updateCardStack({
      ...emptyChatItemContent,
    });
  };

  public readonly getRenderDetails = (): CardRenderDetails => {
    return {
      totalNumberOfCodeBlocks: (this.contentBody?.getRenderDetails().totalNumberOfCodeBlocks ?? 0) + (this.customRendererWrapper?.nextCodeBlockIndex ?? 0)
    };
  };

  public readonly cleanFollowupsAndRemoveIfEmpty = (): boolean => {
    this.followUps?.render?.remove();
    this.followUps = null;
    if (!chatItemHasContent({
      ...this.props.chatItem,
      followUp: undefined
    })) {
      this.render.remove();
      return true;
    }
    return false;
  };
}
