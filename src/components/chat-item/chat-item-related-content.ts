/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahEventNames, Suggestion } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';
import { SuggestionCard } from '../suggestion-card/suggestion-card';
import { SuggestionCardBody } from '../suggestion-card/suggestion-card-body';

const PREVIEW_DELAY = 500;

export interface ChatItemRelatedContentProps {
  tabId: string;
  messageId: string;
  title?: string;
  relatedContent?: Suggestion[];
}
export class ChatItemRelatedContent {
  private readonly props: ChatItemRelatedContentProps;
  private readonly showMoreButtonBlock: Button;
  private relatedContentPreview: Overlay | null;
  private relatedContentPreviewTimeout: ReturnType<typeof setTimeout>;
  render: ExtendedHTMLElement;
  suggestionCardBody: SuggestionCardBody;
  chatAvatar: ExtendedHTMLElement;
  constructor (props: ChatItemRelatedContentProps) {
    this.props = props;
    this.showMoreButtonBlock = new Button({
      classNames: [ 'mynah-chat-item-card-related-content-show-more' ],
      primary: false,
      icon: new Icon({ icon: MynahIcons.DOWN_OPEN }).render,
      onClick: () => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SHOW_MORE_WEB_RESULTS_CLICK, { messageId: this.props.messageId });
        this.showMoreButtonBlock.render.remove();
        (this.render).addClass('expanded');
      },
      label: 'Show more',
    });

    this.render = this.props.relatedContent !== undefined
      ? DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-item-card-related-content',
          this.props.relatedContent !== undefined && this.props.relatedContent.length < 3 ? 'expanded' : '' ],
        children: [
          ...(this.props.title !== undefined
            ? [ {
                type: 'span',
                classNames: [ 'mynah-chat-item-card-related-content-title' ],
                children: [ this.props.title ],
              } ]
            : []),
          ...this.props.relatedContent.map(suggestion => DomBuilder.getInstance().build({
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
          this.showMoreButtonBlock.render
        ]
      })
      : DomBuilder.getInstance().build({ type: 'span', classNames: [ 'invisible' ] });
  }

  private readonly showLinkPreview = (e: MouseEvent, suggestion: Suggestion): void => {
    if (suggestion.body !== undefined) {
      clearTimeout(this.relatedContentPreviewTimeout);
      this.relatedContentPreviewTimeout = setTimeout(() => {
        const elm: HTMLElement = e.target as HTMLElement;
        this.relatedContentPreview = new Overlay({
          background: false,
          closeOnOutsideClick: false,
          referenceElement: elm,
          dimOutside: false,
          removeOtherOverlays: true,
          verticalDirection: OverlayVerticalDirection.TO_TOP,
          horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
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
}
