/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { ChatItem, MynahEventNames } from '../../static';
import { Icon } from '../icon';

export interface ChatItemFollowUpProps {tabId: string; chatItem: ChatItem}
export class ChatItemFollowUpContainer {
  private readonly props: ChatItemFollowUpProps;
  render: ExtendedHTMLElement;
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
                followUpOption.pillText
              ],
              events: {
                click: (e) => {
                  MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FOLLOW_UP_CLICKED, { tabId: this.props.tabId, followUpOption });
                }
              }
            }
          )) as DomBuilderObject[]
        },
      ]
    });

    Array.from(this.render.getElementsByClassName('mynah-chat-item-followup-question-option')).forEach(option => {
      option.innerHTML = marked(option.innerHTML).replace('<p>', '').replace('</p>', '');
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
}
