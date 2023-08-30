/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIDataStore } from '../../helper/store';
import { ChatItem, ChatItemType, Suggestion } from '../../static';
import { I18N } from '../../translations/i18n';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';
import { SuggestionCard } from '../suggestion-card/suggestion-card';
import { SuggestionCardBody } from '../suggestion-card/suggestion-card-body';
import { ChatItemFollowUpContainer } from './chat-item-followup';

const PREVIEW_DELAY = 500;

export interface ChatItemCardProps {
  chatItem: ChatItem;
  onShowAllWebResultsClick?: () => void;
}
export class ChatItemCard {
  private readonly chatItem: ChatItem;
  private readonly relatedContentWrapper: ExtendedHTMLElement | string;
  private readonly referencesWrapper: ExtendedHTMLElement | string;
  private readonly showMoreButtonBlock: Button;
  private relatedContentPreview: Overlay | null;
  private relatedContentPreviewTimeout: ReturnType<typeof setTimeout>;
  render: ExtendedHTMLElement;
  suggestionCardBody: SuggestionCardBody;
  chatAvatar: ExtendedHTMLElement;
  constructor (props: ChatItemCardProps) {
    this.chatItem = props.chatItem;
    this.chatAvatar = this.getChatAvatar();
    MynahUIDataStore.getInstance().subscribe('showChatAvatars', (value: boolean) => {
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
        if ((this.relatedContentWrapper as ExtendedHTMLElement).hasClass('expanded')) {
          if (props.onShowAllWebResultsClick !== undefined) {
            props.onShowAllWebResultsClick();
          }
        } else {
          this.showMoreButtonBlock.updateLabel('Show all web results');
          (this.relatedContentWrapper as HTMLElement).classList.add('expanded');
        }
      },
      label: 'Show more',
    });

    this.relatedContentWrapper = this.chatItem.suggestions !== undefined
      ? DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-item-card-related-content',
          this.chatItem.suggestions.suggestions !== undefined && this.chatItem.suggestions.suggestions.length < 3 ? 'expanded' : '' ],
        children: [
          ...(this.chatItem.suggestions.title !== false
            ? [ {
                type: 'span',
                classNames: [ 'mynah-chat-item-card-related-content-title' ],
                children: [ typeof this.chatItem.suggestions.title === 'string' ? this.chatItem.suggestions.title : I18N.getInstance().texts.relatedContent ],
              } ]
            : []),
          ...this.chatItem.suggestions.suggestions.map(suggestion => DomBuilder.getInstance().build({
            type: 'div',
            classNames: [ 'mynah-chat-item-card-related-content-item' ],
            events: {
              mouseenter: (e) => {
                this.showLinkPreview(e, suggestion);
              },
              mouseleave: this.hideLinkPreview,
            },
            children: [
              new SuggestionCard({ suggestion, compact: 'withBody' }).render
            ]
          })),
        ]
      })
      : '';
    this.referencesWrapper = this.chatItem.relatedContent !== undefined
      ? DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-item-card-references-wrapper' ],
        children: [
          ...(this.chatItem.relatedContent.content.length > 2
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
          ...(this.chatItem.relatedContent.title !== false
            ? [ {
                type: 'span',
                classNames: [ 'mynah-chat-item-card-references-title' ],
                children: [ typeof this.chatItem.relatedContent.title === 'string' ? this.chatItem.relatedContent.title : I18N.getInstance().texts.relatedContent ],
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
            children: this.chatItem.relatedContent.content.map(suggestion => DomBuilder.getInstance().build({
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
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card', `mynah-chat-item-${this.chatItem.type ?? ChatItemType.ANSWER}`, ...(this.checkIsMuted() ? [ 'mynah-chat-item-card-muted' ] : []) ],
      children: [
        ...(MynahUIDataStore.getInstance().getValue('showChatAvatars') === true
          ? [ this.chatAvatar ]
          : []),
        ...(this.chatItem.body !== undefined
          ? [ {
              type: 'div',
              classNames: [ 'mynah-card' ],
              children: [
                ((): ExtendedHTMLElement => {
                  this.suggestionCardBody = new SuggestionCardBody({
                    suggestion: { body: this.chatItem.body },
                    onLinkMouseEnter: (e, url) => {
                      const matchingSuggestion = [ ...MynahUIDataStore.getInstance().getValue('chatItems').map(
                        (chatItem: ChatItem) => chatItem.relatedContent?.content)
                      ].flat().find((relatedContent?: Suggestion) => relatedContent?.url === url);
                      if (matchingSuggestion !== undefined) {
                        this.showLinkPreview(e, matchingSuggestion);
                      }
                    },
                    onLinkMouseLeave: this.hideLinkPreview
                  });
                  return this.suggestionCardBody.render;
                })(),
              ],
            } ]
          : ''),
        this.referencesWrapper,
        this.relatedContentWrapper,
        this.showMoreButtonBlock.render,
        this.chatItem.followUp?.text !== undefined ? new ChatItemFollowUpContainer({ chatItem: this.chatItem }).render : '',
      ],
    });

    setTimeout(() => {
      this.render.addClass('reveal');
    }, 10);
  }

  private readonly checkIsMuted = (): boolean => (this.chatItem.body === undefined &&
    ((this.chatItem.followUp?.options !== undefined && this.chatItem.followUp.options.length > 0) ||
      (this.chatItem.relatedContent !== undefined && this.chatItem.relatedContent?.content.length > 0) ||
      (this.chatItem.suggestions !== undefined && this.chatItem.suggestions?.suggestions.length > 0)));

  private readonly showLinkPreview = (e: MouseEvent, suggestion: Suggestion): void => {
    if (this.chatItem.type === ChatItemType.ANSWER || this.chatItem.type === ChatItemType.ANSWER_STREAM) {
      clearTimeout(this.relatedContentPreviewTimeout);
      this.relatedContentPreviewTimeout = setTimeout(() => {
        const elm: HTMLElement = e.target as HTMLElement;
        this.relatedContentPreview = new Overlay({
          background: false,
          closeOnOutsideClick: false,
          referenceElement: elm,
          dimOutside: false,
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

  private readonly get3rdRelatedContentTextForWidth = (): string => {
    if (this.chatItem.relatedContent?.content !== undefined && this.chatItem.relatedContent?.content.length > 2) {
      return (this.chatItem.relatedContent?.content[2].title +
        this.chatItem.relatedContent?.content[2].url.substring(this.chatItem.relatedContent?.content[2].title.length));
    }
    return '';
  };

  private readonly getChatAvatar = (): ExtendedHTMLElement => DomBuilder.getInstance().build({
    type: 'div',
    classNames: [ 'mynah-chat-item-card-icon-wrapper' ],
    children: [
      new Icon({ icon: this.chatItem.type === ChatItemType.PROMPT ? MynahIcons.USER : MynahIcons.MYNAH }).render
    ]
  });

  public readonly updateAnswerBody = (body: string): void => {
    this.suggestionCardBody.updateCardBody(body);
  };
}
