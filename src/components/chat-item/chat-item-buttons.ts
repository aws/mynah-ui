/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItem, ChatItemButton } from '../../static';
import { ChatItemFollowUpOption } from './chat-item-followup-option';

export interface ChatItemButtonsWrapperProps {
  tabId: string;
  chatItem: ChatItem;
  onActionClick: (action: ChatItemButton) => void;
}
export class ChatItemButtonsWrapper {
  private readonly props: ChatItemButtonsWrapperProps;
  private readonly actions: Record<string, ChatItemFollowUpOption> = {};
  render: ExtendedHTMLElement;
  constructor (props: ChatItemButtonsWrapperProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-buttons-container' ],
      children: this.props?.chatItem?.buttons?.map(chatActionAction => {
        const actionItem = new ChatItemFollowUpOption({
          followUpOption: {
            pillText: chatActionAction.text,
            disabled: chatActionAction.disabled,
            description: chatActionAction.description,
            status: chatActionAction.status,
            icon: chatActionAction.icon,
          },
          onClick: () => {
            this.disableAll();
            this.props.onActionClick(chatActionAction);
          }
        });
        this.actions[chatActionAction.id] = actionItem;
        return actionItem.render;
      })
    });
  }

  private readonly disableAll = (): void => {
    Object.keys(this.actions).forEach(chatActionId => this.actions[chatActionId].setEnabled(false));
  };
}
