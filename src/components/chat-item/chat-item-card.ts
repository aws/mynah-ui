/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIDataStore } from '../../helper/store';
import { ChatItem, ChatItemType } from '../../static';
import { I18N } from '../../translations/i18n';
import { Icon, MynahIcons } from '../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';
import { SuggestionCard } from '../suggestion-card/suggestion-card';
import { SuggestionCardBody } from '../suggestion-card/suggestion-card-body';
import { ChatItemFollowUpContainer } from './chat-item-followup';

export interface ChatItemCardProps {chatItem: ChatItem}

export class ChatItemCard {
  private readonly chatItem: ChatItem;
  private readonly relatedContentWrapper: ExtendedHTMLElement | string;
  private relatedContentPreview: Overlay | null;
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
    this.relatedContentWrapper = this.chatItem.relatedContent !== undefined
      ? DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-item-card-related-content',
          this.chatItem.relatedContent.content !== undefined && this.chatItem.relatedContent.content.length < 3 ? 'expanded' : '' ],
        children: [
          ...(this.chatItem.relatedContent.title !== false
            ? [ {
                type: 'span',
                classNames: [ 'mynah-chat-item-card-related-content-title' ],
                children: [ typeof this.chatItem.relatedContent.title === 'string' ? this.chatItem.relatedContent.title : I18N.getInstance().texts.relatedContent ],
              } ]
            : []),
          ...this.chatItem.relatedContent.content.map(suggestion => DomBuilder.getInstance().build({
            type: 'div',
            classNames: [ 'mynah-chat-item-card-related-content-item' ],
            events: {
              mouseenter: (e) => {
                if (this.chatItem.type === ChatItemType.ANSWER || this.chatItem.type === ChatItemType.ANSWER_STREAM) {
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
                }
              },
              mouseleave: () => {
                if (this.relatedContentPreview !== null) {
                  this.relatedContentPreview?.close();
                  this.relatedContentPreview = null;
                }
              }
            },
            children: [
              new SuggestionCard({ suggestion, compact: true }).render
            ]
          })),
        ]
      })
      : '';
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-card', `mynah-chat-item-${this.chatItem.type ?? ChatItemType.ANSWER}` ],
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
                  this.suggestionCardBody = new SuggestionCardBody({ suggestion: { body: this.chatItem.body } });
                  return this.suggestionCardBody.render;
                })(),
              ],
            } ]
          : ''),
        this.relatedContentWrapper,
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-card-related-content-show-more' ],
          children: [
            this.get3rdRelatedContentTextForWidth(),
            new Icon({ icon: MynahIcons.DOWN_OPEN }).render
          ],
          events: {
            click: (e: MouseEvent) => {
              (this.relatedContentWrapper as HTMLElement).classList.add('expanded');
            }
          }
        },
        this.chatItem.followUp?.text !== undefined ? new ChatItemFollowUpContainer({ chatItem: this.chatItem }).render : '',
      ],
    });

    setTimeout(() => {
      this.render.addClass('reveal');
    }, 10);
  }

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
