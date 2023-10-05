/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { ChatItem, ChatItemType, MynahEventNames } from '../../static';
import { MynahUITabsStore } from '../../helper/tabs-store';

export interface ChatItemFollowUpProps {tabId: string; chatItem: ChatItem}
export class ChatItemFollowUpContainer {
  private readonly props: ChatItemFollowUpProps;
  render: ExtendedHTMLElement;
  constructor (props: ChatItemFollowUpProps) {
    this.props = props;
    this.props.chatItem = props.chatItem;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-followup-question' ],
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
              classNames: [ 'mynah-chat-item-followup-question-option' ],
              children: [ followUpOption.pillText ],
              events: {
                click: (e) => {
                  if (followUpOption.prompt != null) {
                    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).updateStore({
                      chatItems: [
                        ...MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('chatItems'),
                        {
                          type: ChatItemType.PROMPT,
                          body: `<span>${followUpOption.prompt}</span>`,
                        }
                      ]
                    });
                  }
                  MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FOLLOW_UP_CLICKED, { tabId: this.props.tabId, followUpOption });

                  if ((this.render.parentNode as HTMLElement).classList.contains('mynah-chat-item-card-muted')) {
                    (this.render.parentNode as HTMLElement).remove();
                  } else {
                    this.render.remove();
                  }
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
