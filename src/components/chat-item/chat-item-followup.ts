/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';
import { ChatItem, ChatItemType, MynahEventNames } from '../../static';

export interface ChatItemFollowUpProps {chatItem: ChatItem}
export class ChatItemFollowUpContainer {
  private readonly chatItem: ChatItem;
  render: ExtendedHTMLElement;
  constructor (props: ChatItemFollowUpProps) {
    this.chatItem = props.chatItem;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-followup-question' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-followup-question-text' ],
          children: [ this.chatItem.followUp?.text ?? '' ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-followup-question-options-wrapper' ],
          children: this.chatItem.followUp?.options?.map(followUpOption => (
            {
              type: 'div',
              classNames: [ 'mynah-chat-item-followup-question-option' ],
              children: [ followUpOption.pillText ],
              events: {
                click: (e) => {
                  if (followUpOption.prompt != null) {
                    MynahUIDataStore.getInstance().updateStore({
                      chatItems: [
                        ...MynahUIDataStore.getInstance().getValue('chatItems'),
                        {
                          type: ChatItemType.PROMPT,
                          body: `<span>${followUpOption.prompt}</span>`,
                        }
                      ]
                    });
                  }
                  MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FOLLOW_UP_CLICKED, followUpOption);

                  this.render.remove();
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
            suggestion: { id: url, url },
            event,
          });
      };
    });
  }
}
