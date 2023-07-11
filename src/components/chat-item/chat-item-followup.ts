/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

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
              children: [ followUpOption.text ],
              events: {
                click: (e) => {
                  MynahUIDataStore.getInstance().updateStore({
                    chatItems: [
                      ...MynahUIDataStore.getInstance().getValue('chatItems'),
                      {
                        type: ChatItemType.PROMPT,
                        body: `<span>${followUpOption.prompt}</span>`,
                      }
                    ]
                  });
                  MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FOLLOW_UP_CLICKED, followUpOption.text);

                  this.render.remove();
                }
              }
            }
          )) as DomBuilderObject[]
        },
      ]
    });
  }
}
