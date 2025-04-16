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
import { ChatItemButtonsWrapper, ChatItemButtonsWrapperProps } from './chat-item-buttons';
import { cleanHtml } from '../../helper/sanitize';
import { chatItemHasContent } from '../../helper/chat-item';
import { Card } from '../card/card';
import { ChatItemCardContent, ChatItemCardContentProps } from './chat-item-card-content';
import testIds from '../../helper/test-ids';
import { ChatItemInformationCard } from './chat-item-information-card';
import { ChatItemTabbedCard } from './chat-item-tabbed-card';
import { Spinner } from '../spinner/spinner';
import { MoreContentIndicator } from '../more-content-indicator';
import { Button } from '../button';

export interface ChatItemCardProps {
  tabId: string;
  chatItem: ChatItem;
  inline?: boolean;
  small?: boolean;
  onAnimationStateChange?: (isAnimating: boolean) => void;
}
export class ChatItemCard {
  readonly props: ChatItemCardProps;
  render: ExtendedHTMLElement;
  private readonly card: Card | null = null;
  private readonly updateStack: Array<Partial<ChatItem>> = [];
  private readonly initialSpinner: ExtendedHTMLElement[] | null = null;
  private cardFooter: ExtendedHTMLElement | null = null;
  private cardHeader: ExtendedHTMLElement | null = null;
  private cardTitle: ExtendedHTMLElement | null = null;
  private informationCard: ChatItemInformationCard | null = null;
  private tabbedCard: ChatItemTabbedCard | null = null;
  private cardIcon: Icon | null = null;
  private contentBody: ChatItemCardContent | null = null;
  private chatAvatar: ExtendedHTMLElement;
  private chatFormItems: ChatItemFormItemsWrapper | null = null;
  private customRendererWrapper: CardBody | null = null;
  private chatButtonsInside: ChatItemButtonsWrapper | null = null;
  private chatButtonsOutside: ChatItemButtonsWrapper | null = null;
  private fileTreeWrapper: ChatItemTreeViewWrapper | null = null;
  private followUps: ChatItemFollowUpContainer | null = null;
  private readonly moreContentIndicator: MoreContentIndicator | null = null;
  private isMoreContentExpanded: boolean = false;
  private votes: ChatItemRelevanceVote | null = null;
  private footer: ChatItemCard | null = null;
  private header: ChatItemCard | null = null;
  constructor (props: ChatItemCardProps) {
    this.props = {
      ...props,
      chatItem: {
        ...props.chatItem,
        fullWidth: props.chatItem.fullWidth != null ? props.chatItem.fullWidth : (props.chatItem.type === ChatItemType.DIRECTIVE),
        padding: props.chatItem.padding != null ? props.chatItem.padding : (props.chatItem.type !== ChatItemType.DIRECTIVE),
      }
    };
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
      this.initialSpinner = [
        DomBuilder.getInstance().build({
          type: 'div',
          persistent: true,
          classNames: [ 'mynah-chat-items-spinner' ],
          children: [ new Spinner().render, { type: 'div', children: [ Config.getInstance().config.texts.spinnerText ] } ],
        }),

      ];
    }

    // this.props.chatItem.type === ChatItemType.ANSWER || this.props.chatItem.type === ChatItemType.ANSWER_STREAM
    this.cardTitle = this.getCardTitle();
    this.cardHeader = this.getCardHeader();
    this.cardFooter = this.getCardFooter();
    this.card = new Card({
      testId: testIds.chatItem.card,
      children: this.initialSpinner ?? [],
      background: this.props.inline !== true && this.props.chatItem.type !== ChatItemType.DIRECTIVE && !(this.props.chatItem.fullWidth !== true && (this.props.chatItem.type === ChatItemType.ANSWER || this.props.chatItem.type === ChatItemType.ANSWER_STREAM)),
      border: this.props.inline !== true && this.props.chatItem.type !== ChatItemType.DIRECTIVE && !(this.props.chatItem.fullWidth !== true && (this.props.chatItem.type === ChatItemType.ANSWER || this.props.chatItem.type === ChatItemType.ANSWER_STREAM)),
      padding: this.props.inline === true || this.props.chatItem.padding === false || (this.props.chatItem.fullWidth !== true && (this.props.chatItem.type === ChatItemType.ANSWER || this.props.chatItem.type === ChatItemType.ANSWER_STREAM)) ? 'none' : undefined,
    });
    this.updateCardContent();
    this.render = this.generateCard();

    /**
     * Generate/update more content indicator if available
     */
    this.moreContentIndicator = new MoreContentIndicator({
      icon: MynahIcons.DOWN_OPEN,
      border: false,
      onClick: () => {
        if (this.isMoreContentExpanded) {
          this.isMoreContentExpanded = false;
          this.render.addClass('mynah-chat-item-collapsed');
          this.moreContentIndicator?.update({ icon: MynahIcons.DOWN_OPEN });
        } else {
          this.isMoreContentExpanded = true;
          this.render.removeClass('mynah-chat-item-collapsed');
          this.moreContentIndicator?.update({ icon: MynahIcons.UP_OPEN });
        }
      },
      testId: testIds.chatItem.moreContentIndicator
    });
    this.render.insertChild('beforeend', this.moreContentIndicator.render);

    if (this.props.chatItem.autoCollapse === true) {
      this.render.addClass('mynah-chat-item-collapsed');
    }

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

  private readonly getCardHeader = (): ExtendedHTMLElement => {
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card-header', 'mynah-card-inner-order-5' ]
    });
  };

  private readonly getCardTitle = (): ExtendedHTMLElement => {
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card-title', 'mynah-card-inner-order-3' ]
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
        ...(this.chatButtonsOutside != null ? [ this.chatButtonsOutside?.render ] : []),
        ...(this.props.chatItem.followUp?.text !== undefined ? [ new ChatItemFollowUpContainer({ tabId: this.props.tabId, chatItem: this.props.chatItem }).render ] : [])
      ],
    });

    setTimeout(
      () => {
        this.setMaxHeightClass(this.card?.render);
        generatedCard.addClass('reveal');
      },
      50
    );

    return generatedCard;
  };

  private readonly setMaxHeightClass = (elm?: ExtendedHTMLElement): void => {
    if (elm != null) {
      if (this.props.chatItem.autoCollapse === true && elm.scrollHeight > window.innerHeight / 4) {
        this.render?.addClass('mynah-chat-item-auto-collapse');
      } else {
        this.render?.removeClass('mynah-chat-item-auto-collapse');
      }
    }
  };

  private readonly getCardClasses = (): string[] => {
    return [
      ...(this.props.chatItem.hoverEffect !== undefined ? [ 'mynah-chat-item-hover-effect' ] : []),
      ...(this.props.chatItem.icon !== undefined ? [ 'mynah-chat-item-card-has-icon' ] : []),
      ...(this.props.chatItem.fullWidth === true || this.props.chatItem.type === ChatItemType.ANSWER || this.props.chatItem.type === ChatItemType.ANSWER_STREAM ? [ 'full-width' ] : []),
      ...(this.props.chatItem.padding === false ? [ 'no-padding' ] : []),
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

    // If no data is provided for the header
    // skip removing and checking it
    if (this.props.chatItem.canBeDismissed === true || this.props.chatItem.title != null) {
      if (this.cardTitle != null) {
        this.cardTitle.remove();
        this.cardTitle = null;
      }
      this.cardTitle = this.getCardTitle();
      if (this.props.chatItem.title != null) {
        this.cardTitle?.insertChild('beforeend', DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-chat-item-card-title-text' ],
          children: [ this.props.chatItem.title ]
        }));
      }

      if (this.props.chatItem.canBeDismissed === true) {
        this.cardTitle?.insertChild('beforeend', new Button({
          icon: new Icon({ icon: 'cancel' }).render,
          onClick: () => {
            this.render.remove();
            MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CARD_DISMISS, { tabId: this.props.tabId, messageId: this.props.chatItem.messageId });
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
          },
          primary: false,
          status: 'clear'
        }).render);
      }
      this.card?.render.insertChild('afterbegin', this.cardTitle);
    }

    // If no data is provided for the header
    // skip removing and checking it
    if (this.props.chatItem.header !== undefined) {
      if (this.cardHeader != null) {
        this.cardHeader.remove();
        this.cardHeader = null;
      }
      if (this.props.chatItem.header != null) {
        this.cardHeader = this.getCardHeader();
        this.card?.render.insertChild('beforeend', this.cardHeader);

        /**
         * Generate header if available
         */
        if (this.header != null) {
          this.header.render.remove();
          this.header = null;
        }
        if (this.props.chatItem.header != null) {
          this.header = new ChatItemCard({
            tabId: this.props.tabId,
            small: true,
            inline: true,
            chatItem: {
              ...this.props.chatItem.header,
              status: undefined,
              type: ChatItemType.ANSWER,
              messageId: this.props.chatItem.messageId,
            },
          });
          this.cardHeader.insertChild('beforeend', this.header.render);

          if (this.props.chatItem.header.status != null) {
            this.cardHeader.insertAdjacentElement('beforeend', DomBuilder.getInstance().build({
              type: 'span',
              classNames: [ 'mynah-chat-item-card-header-status', `status-${this.props.chatItem.header.status.status ?? 'default'}` ],
              children: [
                ...(this.props.chatItem.header.status.icon != null ? [ new Icon({ icon: this.props.chatItem.header.status.icon }).render ] : []),
                ...(this.props.chatItem.header.status.text != null ? [ { type: 'span', classNames: [ 'mynah-chat-item-card-header-status-text' ], children: [ this.props.chatItem.header.status.text ] } ] : []),
              ]
            }));
          }
        }
      }
    }

    /**
     * Generate card icon if available
     */
    if (this.props.chatItem.icon !== undefined) {
      if (this.cardIcon != null) {
        this.cardIcon.render.remove();
        this.cardIcon = null;
      } else {
        this.cardIcon = new Icon({ icon: this.props.chatItem.icon, status: this.props.chatItem.iconForegroundStatus, subtract: this.props.chatItem.iconStatus != null, classNames: [ 'mynah-chat-item-card-icon', 'mynah-card-inner-order-10', `icon-status-${this.props.chatItem.iconStatus ?? 'none'}` ] });
        this.card?.render.insertChild('beforeend', this.cardIcon.render);
      }
    }

    /**
     * Generate contentBody if available
    */
    if (this.props.chatItem.body != null && this.props.chatItem.body !== '') {
      const updatedCardContentBodyProps: ChatItemCardContentProps = {
        body: this.props.chatItem.body ?? '',
        hideCodeBlockLanguage: this.props.chatItem.padding === false,
        unlimitedCodeBlockHeight: this.props.chatItem.autoCollapse,
        classNames: [ 'mynah-card-inner-order-20' ],
        renderAsStream: this.props.chatItem.type === ChatItemType.ANSWER_STREAM,
        codeReference: this.props.chatItem.codeReference ?? undefined,
        onAnimationStateChange: (isAnimating) => {
          if (isAnimating) {
            this.render?.addClass('typewriter-animating');
          } else {
            this.render?.removeClass('typewriter-animating');
            this.props.onAnimationStateChange?.(isAnimating);
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
        chatItem: this.props.chatItem,
        onModifierEnterPress (formData, tabId) {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FORM_MODIFIER_ENTER_PRESS, { formData, tabId });
        },
        onTextualItemKeyPress (event, itemId, formData, tabId, disableAllCallback) {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FORM_TEXTUAL_ITEM_KEYPRESS, {
            event,
            formData,
            itemId,
            tabId,
            callback: (disableAll?: boolean) => {
              if (disableAll === true) {
                disableAllCallback();
              }
            }
          });
        },
        onFormChange (formData, isValid, tabId) {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FORM_CHANGE, { formData, isValid, tabId });
        },
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
      const { filePaths = [], deletedFiles = [], actions, details, flatList } = this.props.chatItem.fileList;
      const referenceSuggestionLabel = this.props.chatItem.body ?? '';
      this.fileTreeWrapper = new ChatItemTreeViewWrapper({
        tabId: this.props.tabId,
        classNames: [ 'mynah-card-inner-order-50' ],
        messageId: this.props.chatItem.messageId ?? '',
        cardTitle: this.props.chatItem.fileList.fileTreeTitle,
        rootTitle: this.props.chatItem.fileList.rootFolderTitle,
        folderIcon: this.props.chatItem.fileList.folderIcon,
        hideFileCount: this.props.chatItem.fileList.hideFileCount ?? false,
        collapsed: this.props.chatItem.fileList.collapsed ?? false,
        files: filePaths,
        deletedFiles,
        flatList,
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
        classNames: [ 'mynah-card-inner-order-55' ],
        informationCard: this.props.chatItem.informationCard ?? {}
      });
      this.card?.render.insertChild('beforeend', this.informationCard.render);
    }

    /**
     * Generate buttons if available
     */
    if (this.chatButtonsInside != null) {
      this.chatButtonsInside.render.remove();
      this.chatButtonsInside = null;
    }
    if (this.chatButtonsOutside != null) {
      this.chatButtonsOutside.render.remove();
      this.chatButtonsOutside = null;
    }
    if (this.props.chatItem.buttons != null) {
      const insideButtons = this.props.chatItem.buttons.filter((button) => button.position == null || button.position === 'inside');
      const outsideButtons = this.props.chatItem.buttons.filter((button) => button.position === 'outside');

      const chatButtonProps: ChatItemButtonsWrapperProps = {
        tabId: this.props.tabId,
        classNames: [ 'mynah-card-inner-order-60' ],
        formItems: this.chatFormItems,
        buttons: [],
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
      };

      if (insideButtons.length > 0) {
        this.chatButtonsInside = new ChatItemButtonsWrapper({ ...chatButtonProps, buttons: insideButtons });
        this.card?.render.insertChild('beforeend', this.chatButtonsInside.render);
      }
      if (outsideButtons.length > 0) {
        this.chatButtonsOutside = new ChatItemButtonsWrapper({ ...chatButtonProps, buttons: outsideButtons });
        this.render?.insertChild('beforeend', this.chatButtonsOutside.render);
      }
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
        tabbedCard: this.props.chatItem.tabbedContent,
        classNames: [ 'mynah-card-inner-order-55' ]
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

  public readonly updateCard = (): void => {
    if (this.updateStack.length > 0) {
      const updateWith: Partial<ChatItem> | undefined = this.updateStack.shift();
      if (updateWith !== undefined) {
        // Update item inside the store
        if (this.props.chatItem.messageId != null) {
          const currentTabChatItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId)?.getStore()?.chatItems;
          MynahUITabsStore.getInstance()
            .getTabDataStore(this.props.tabId)
            .updateStore(
              {
                chatItems: currentTabChatItems?.map((chatItem: ChatItem) => {
                  if (chatItem.messageId === this.props.chatItem.messageId) {
                    return {
                      ...this.props.chatItem,
                      ...updateWith
                    };
                  }
                  return chatItem;
                }),
              },
              true
            );
        }

        this.props.chatItem = {
          ...this.props.chatItem,
          ...updateWith,
        };

        this.render?.update({
          ...(this.props.chatItem.messageId != null
            ? {
                attributes: {
                  messageid: this.props.chatItem.messageId
                }
              }
            : {}),
          classNames: [ ...this.getCardClasses(), 'reveal', ...(this.isMoreContentExpanded ? [ ] : [ 'mynah-chat-item-collapsed' ]) ],
        });
        this.updateCardContent();
        this.updateCard();
        this.setMaxHeightClass(this.card?.render);
      }
    }
  };

  public readonly updateCardStack = (updateWith: Partial<ChatItem>): void => {
    this.updateStack.push(updateWith);
    this.updateCard();
  };

  public readonly clearContent = (): void => {
    this.cardHeader?.remove();
    this.cardHeader = null;

    this.contentBody?.render.remove();
    this.contentBody = null;

    this.chatButtonsInside?.render.remove();
    this.chatButtonsInside = null;

    this.customRendererWrapper?.render.remove();
    this.customRendererWrapper = null;

    this.fileTreeWrapper?.render.remove();
    this.fileTreeWrapper = null;

    this.followUps?.render.remove();
    this.followUps = null;

    this.cardFooter?.remove();
    this.cardFooter = null;

    this.chatFormItems?.render.remove();
    this.chatFormItems = null;

    this.informationCard?.render.remove();
    this.informationCard = null;

    this.tabbedCard?.render.remove();
    this.tabbedCard = null;
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
