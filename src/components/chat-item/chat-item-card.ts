/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { ChatItem, ChatItemType, MynahEventNames, Suggestion } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';
import { SuggestionCard } from '../suggestion-card/suggestion-card';
import { SuggestionCardBody } from '../suggestion-card/suggestion-card-body';
import { ChatItemFollowUpContainer } from './chat-item-followup';
import { ChatItemRelevanceVote } from './chat-item-relevance-vote';
import { ChatItemTreeViewWrapper } from './chat-item-tree-view-wrapper';

const PREVIEW_DELAY = 500;

export interface ChatItemCardProps {
  tabId: string;
  chatItem: ChatItem;
}
export class ChatItemCard {
  private readonly props: ChatItemCardProps;
  private readonly relatedContentWrapper: ExtendedHTMLElement;
  private readonly referencesWrapper: ExtendedHTMLElement | string;
  private readonly showMoreButtonBlock: Button;
  private relatedContentPreview: Overlay | null;
  private relatedContentPreviewTimeout: ReturnType<typeof setTimeout>;
  render: ExtendedHTMLElement;
  suggestionCardBody: SuggestionCardBody;
  chatAvatar: ExtendedHTMLElement;
  constructor (props: ChatItemCardProps) {
    this.props = props;
    this.chatAvatar = this.getChatAvatar();
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('showChatAvatars', (value: boolean) => {
      if (value) {
        this.chatAvatar = this.getChatAvatar();
        this.render.insertChild('afterbegin', this.chatAvatar);
      } else {
        this.chatAvatar.remove();
      }
    });

    this.showMoreButtonBlock = new Button({
      classNames: [ 'mynah-chat-item-card-related-content-show-more' ],
      onClick: () => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SHOW_MORE_WEB_RESULTS_CLICK, { messageId: this.props.chatItem.messageId });
        this.showMoreButtonBlock.render.remove();
        (this.relatedContentWrapper).addClass('expanded');
      },
      label: 'Show more',
    });

    this.relatedContentWrapper = this.props.chatItem.suggestions !== undefined
      ? DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-item-card-related-content',
          this.props.chatItem.suggestions.suggestions !== undefined && this.props.chatItem.suggestions.suggestions.length < 3 ? 'expanded' : '' ],
        children: [
          ...(this.props.chatItem.suggestions.title !== false
            ? [ {
                type: 'span',
                classNames: [ 'mynah-chat-item-card-related-content-title' ],
                children: [ typeof this.props.chatItem.suggestions.title === 'string' ? this.props.chatItem.suggestions.title : '' ],
              } ]
            : []),
          ...this.props.chatItem.suggestions.suggestions.map(suggestion => DomBuilder.getInstance().build({
            type: 'div',
            classNames: [ 'mynah-chat-item-card-related-content-item' ],
            events: {
              mouseenter: (e) => {
                this.showLinkPreview(e, suggestion);
              },
              mouseleave: this.hideLinkPreview,
            },
            children: [
              new SuggestionCard({ suggestion, compact: 'flat' }).render
            ]
          })),
        ]
      })
      : DomBuilder.getInstance().build({ type: 'span', classNames: [ 'invisible' ] });
    this.referencesWrapper = this.props.chatItem.relatedContent !== undefined
      ? DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-item-card-references-wrapper' ],
        children: [
          ...(this.props.chatItem.relatedContent.content.length > 2
            ? [
                new Button({
                  classNames: [ 'mynah-chat-item-card-references-left-scroll-button', 'hidden' ],
                  primary: false,
                  onClick: () => {
                    const container = (this.referencesWrapper as ExtendedHTMLElement).querySelector('.mynah-chat-item-card-references-container') as ExtendedHTMLElement;
                    container.scrollLeft = container.scrollLeft - container.clientWidth / 5 * 2;
                  },
                  icon: new Icon({ icon: MynahIcons.LEFT_OPEN }).render
                }).render,
                new Button({
                  classNames: [ 'mynah-chat-item-card-references-right-scroll-button' ],
                  primary: false,
                  onClick: () => {
                    const container = (this.referencesWrapper as ExtendedHTMLElement).querySelector('.mynah-chat-item-card-references-container') as ExtendedHTMLElement;
                    container.scrollLeft = container.scrollLeft + container.clientWidth / 5 * 2;
                  },
                  icon: new Icon({ icon: MynahIcons.RIGHT_OPEN }).render
                }).render
              ]
            : []),
          ...(this.props.chatItem.relatedContent.title !== false
            ? [ {
                type: 'span',
                classNames: [ 'mynah-chat-item-card-references-title' ],
                children: [ typeof this.props.chatItem.relatedContent.title === 'string' ? this.props.chatItem.relatedContent.title : '' ],
              } ]
            : []),
          {
            type: 'div',
            classNames: [ 'mynah-chat-item-card-references-container' ],
            events: {
              scroll: (e) => {
                const leftButton = (this.referencesWrapper as ExtendedHTMLElement).querySelector('.mynah-chat-item-card-references-left-scroll-button');
                const rightButton = (this.referencesWrapper as ExtendedHTMLElement).querySelector('.mynah-chat-item-card-references-right-scroll-button');
                const container = e.target as HTMLDivElement;
                const maxScrollAmount = container.scrollWidth - container.clientWidth - 30;
                if (container.scrollLeft > 0) {
                  leftButton?.classList.remove('hidden');
                } else {
                  leftButton?.classList.add('hidden');
                }

                if (container.scrollLeft >= maxScrollAmount) {
                  rightButton?.classList.add('hidden');
                } else {
                  rightButton?.classList.remove('hidden');
                }
              }
            },
            children: this.props.chatItem.relatedContent.content.map(suggestion => DomBuilder.getInstance().build({
              type: 'div',
              classNames: [ 'mynah-chat-item-card-reference-item' ],
              events: {
                mouseenter: (e) => {
                  this.showLinkPreview(e, suggestion);
                },
                mouseleave: this.hideLinkPreview,
              },
              children: [
                new SuggestionCard({ suggestion, compact: true }).render
              ]
            }))
          },
        ]
      })
      : '';
    const emptyCheckDom = DomBuilder.getInstance().build({
      type: 'span',
      innerHTML: typeof this.props.chatItem.body === 'string' ? this.props.chatItem.body : ''
    });
    const isChatItemEmpty = emptyCheckDom.innerText.trim() === '';

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card', `mynah-chat-item-${this.props.chatItem.type ?? ChatItemType.ANSWER}`, ...(this.checkIsMuted() ? [ 'mynah-chat-item-card-muted' ] : []), ...(isChatItemEmpty ? [ 'mynah-chat-item-empty' ] : []) ],
      children: [
        ...(MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('showChatAvatars') === true
          ? [ this.chatAvatar ]
          : []),
        ...(this.props.chatItem.body !== undefined
          ? [ {
              type: 'div',
              classNames: [ 'mynah-card' ],
              children: [
                ((): ExtendedHTMLElement => {
                  let treeWrapper;
                  if (this.props.chatItem.type === ChatItemType.CODE_RESULT) {
                    treeWrapper = new ChatItemTreeViewWrapper({ tabId: props.tabId, messageId: props.chatItem.messageId ?? '', files: this.props.chatItem.body as unknown as string[] });
                    this.props.chatItem.body = '';
                  }
                  this.suggestionCardBody = new SuggestionCardBody({
                    suggestion: { id: this.props.chatItem.messageId, body: this.props.chatItem.body as string },
                    onLinkMouseEnter: (e, url) => {
                      const matchingSuggestion = [ ...MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('chatItems').map(
                        (chatItem: ChatItem) => {
                          let mergedList: Suggestion[] = [];
                          if (chatItem.relatedContent?.content !== undefined &&
                            chatItem.relatedContent?.content.length > 0) {
                            mergedList = chatItem.relatedContent?.content;
                          }
                          if (chatItem.suggestions?.suggestions !== undefined &&
                            chatItem.suggestions?.suggestions.length > 0) {
                            mergedList = [ ...mergedList, ...chatItem.suggestions?.suggestions ];
                          }
                          return mergedList;
                        })
                      ].flat().find((relatedContent?: Suggestion) => relatedContent?.url === url);
                      if (matchingSuggestion !== undefined) {
                        this.showLinkPreview(e, matchingSuggestion);
                      }
                    },
                    onLinkMouseLeave: this.hideLinkPreview,
                  });
                  if (treeWrapper !== undefined) {
                    this.suggestionCardBody.addToCardBody(treeWrapper.render);
                  }
                  return this.suggestionCardBody.render;
                })(),
                ...(this.props.chatItem.canBeVoted === true && this.props.chatItem.messageId !== undefined ? [ new ChatItemRelevanceVote({ tabId: this.props.tabId, messageId: this.props.chatItem.messageId }).render ] : [])
              ],
            } ]
          : ''),
        this.referencesWrapper,
        this.relatedContentWrapper,
        ...(this.props.chatItem.type !== ChatItemType.CODE_RESULT ? [ this.showMoreButtonBlock.render ] : []),
        this.props.chatItem.followUp?.text !== undefined ? new ChatItemFollowUpContainer({ tabId: this.props.tabId, chatItem: this.props.chatItem }).render : '',
        ...(this.props.chatItem.type === ChatItemType.ANSWER_STREAM
          ? [ {
              type: 'div',
              classNames: [ 'mynah-chat-items-spinner' ],
              persistent: true,
              children: [
                { type: 'span' },
                { type: 'span' },
                { type: 'span' },
              ]
            } ]
          : [])
      ],
    });

    setTimeout(() => {
      this.render.addClass('reveal');
    }, 10);
  }

  private readonly checkIsMuted = (): boolean => (this.props.chatItem.type === ChatItemType.CODE_RESULT && this.props.chatItem.body === undefined &&
    ((this.props.chatItem.followUp?.options !== undefined && this.props.chatItem.followUp.options.length > 0) ||
      (this.props.chatItem.relatedContent !== undefined && this.props.chatItem.relatedContent?.content.length > 0) ||
      (this.props.chatItem.suggestions !== undefined && this.props.chatItem.suggestions?.suggestions.length > 0)));

  private readonly showLinkPreview = (e: MouseEvent, suggestion: Suggestion): void => {
    if ((this.props.chatItem.type === ChatItemType.ANSWER || this.props.chatItem.type === ChatItemType.ANSWER_STREAM) &&
    suggestion.body !== undefined) {
      clearTimeout(this.relatedContentPreviewTimeout);
      this.relatedContentPreviewTimeout = setTimeout(() => {
        const elm: HTMLElement = e.target as HTMLElement;
        this.relatedContentPreview = new Overlay({
          background: false,
          closeOnOutsideClick: false,
          referenceElement: elm,
          dimOutside: false,
          removeOtherOverlays: true,
          verticalDirection: OverlayVerticalDirection.END_TO_TOP,
          horizontalDirection: OverlayHorizontalDirection.TO_RIGHT,
          children: [
            {
              type: 'div',
              classNames: [ 'mynah-chat-related-content-preview-wrapper' ],
              children: [
                new SuggestionCard({ suggestion }).render
              ]
            }
          ],
        });
      }, PREVIEW_DELAY);
    }
  };

  private readonly hideLinkPreview = (): void => {
    clearTimeout(this.relatedContentPreviewTimeout);
    if (this.relatedContentPreview !== null) {
      this.relatedContentPreview?.close();
      this.relatedContentPreview = null;
    }
  };

  private readonly getChatAvatar = (): ExtendedHTMLElement => DomBuilder.getInstance().build({
    type: 'div',
    classNames: [ 'mynah-chat-item-card-icon-wrapper' ],
    children: [
      new Icon({ icon: this.props.chatItem.type === ChatItemType.PROMPT ? MynahIcons.USER : MynahIcons.MYNAH }).render
    ]
  });

  public readonly updateAnswerBody = (body: ExtendedHTMLElement | HTMLElement | string): void => {
    if (typeof body === 'string') {
      if (body.trim() !== '') {
        this.render.removeClass('mynah-chat-item-empty');
      }
      this.suggestionCardBody.updateCardBody(body);
    } else {
      this.suggestionCardBody.addToCardBody(body);
    }
  };
}
