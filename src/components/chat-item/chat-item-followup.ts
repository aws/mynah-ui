/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { ChatItem, MynahEventNames } from '../../static';
import { Icon } from '../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';

const PREVIEW_DELAY = 250;
const MAX_LENGTH = 40;
export interface ChatItemFollowUpProps {tabId: string; chatItem: ChatItem}
export class ChatItemFollowUpContainer {
  private readonly props: ChatItemFollowUpProps;
  render: ExtendedHTMLElement;
  private followupTooltip: Overlay | null;
  private followupTooltipTimeout: ReturnType<typeof setTimeout>;
  constructor (props: ChatItemFollowUpProps) {
    this.props = props;
    this.props.chatItem = props.chatItem;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-followup-question', 'mynah-chat-item-temporary-element' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-followup-question-text' ],
          children: [ this.props.chatItem.followUp?.text ?? '' ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-followup-question-options-wrapper' ],
          children: this.props.chatItem.followUp?.options?.map(followUpOption => (
            {
              type: 'div',
              classNames: [ 'mynah-chat-item-followup-question-option', `mynah-chat-item-followup-question-option-status-${followUpOption.status ?? 'default'}` ],
              children: [
                ...(followUpOption.icon !== undefined
                  ? [
                      new Icon({ icon: followUpOption.icon }).render
                    ]
                  : []),
                followUpOption.pillText.length > MAX_LENGTH ? `${followUpOption.pillText.substring(0, MAX_LENGTH - 3)}...` : followUpOption.pillText
              ],
              events: {
                click: (e) => {
                  this.hideCroppedFollowupText();
                  MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FOLLOW_UP_CLICKED, { tabId: this.props.tabId, followUpOption });
                  if ((this.render.parentElement as ExtendedHTMLElement)?.hasClass('mynah-chat-item-empty')) {
                    this.render.parentElement?.remove();
                  };
                },
                ...(followUpOption.pillText.length > MAX_LENGTH
                  ? {
                      mouseover: (e) => {
                        this.showCroppedFollowupText(e, followUpOption.pillText);
                      },
                      mouseleave: this.hideCroppedFollowupText
                    }
                  : {})
              }
            }
          )) as DomBuilderObject[]
        },
      ]
    });

    Array.from(this.render.getElementsByClassName('mynah-chat-item-followup-question-option')).forEach(option => {
      option.innerHTML = marked(option.innerHTML, { breaks: true }).replace('<p>', '').replace('</p>', '');
    });
    Array.from(this.render.getElementsByTagName('a')).forEach(a => {
      const url = a.href;

      a.onclick = (event?: MouseEvent) => {
        MynahUIGlobalEvents
          .getInstance()
          .dispatch(MynahEventNames.SUGGESTION_OPEN, {
            tabId: this.props.tabId,
            suggestion: { id: url, url },
            event,
          });
      };
    });
  }

  private readonly showCroppedFollowupText = (e: MouseEvent, content: string): void => {
    if (content.trim() !== undefined) {
      clearTimeout(this.followupTooltipTimeout);
      this.followupTooltipTimeout = setTimeout(() => {
        const elm: HTMLElement = e.target as HTMLElement;
        this.followupTooltip = new Overlay({
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
                {
                  type: 'div',
                  classNames: [ 'mynah-chat-related-content-preview-content' ],
                  innerHTML: marked(content, { breaks: true }).replace('<p>', '').replace('</p>', '')
                }
              ]
            }
          ],
        });
      }, PREVIEW_DELAY);
    }
  };

  private readonly hideCroppedFollowupText = (): void => {
    clearTimeout(this.followupTooltipTimeout);
    if (this.followupTooltip !== null) {
      this.followupTooltip?.close();
      this.followupTooltip = null;
    }
  };
}
