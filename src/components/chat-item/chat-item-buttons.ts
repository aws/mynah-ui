/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItemButton } from '../../static';
import { Button } from '../button';
import { ChatItemFollowUpOption } from './chat-item-followup-option';
import { ChatItemFormItemsWrapper } from './chat-item-form-items';

export interface ChatItemButtonsWrapperProps {
  tabId: string;
  buttons: ChatItemButton[];
  formItems: ChatItemFormItemsWrapper | null;
  useButtonComponent?: boolean;
  onActionClick: (action: ChatItemButton, e?: Event) => void;
}
export class ChatItemButtonsWrapper {
  private readonly props: ChatItemButtonsWrapperProps;
  private readonly actions: Record<string, {
    data: ChatItemButton;
    element: ChatItemFollowUpOption | Button;
  }> = {};

  render: ExtendedHTMLElement;
  constructor (props: ChatItemButtonsWrapperProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-buttons-container',
        props.useButtonComponent === true ? 'mynah-chat-item-buttons-container-use-real-buttons' : '' ],
      children: this.props.buttons.map(chatActionAction => {
        let actionItem;
        if (props.useButtonComponent !== true) {
          actionItem = new ChatItemFollowUpOption({
            followUpOption: {
              pillText: chatActionAction.text,
              disabled: chatActionAction.disabled,
              description: chatActionAction.description,
              status: chatActionAction.status,
              icon: chatActionAction.icon,
            },
            onClick: () => {
              if (props.formItems !== null) {
                props.formItems.disableAll();
              }
              this.disableAll();
              this.props.onActionClick(chatActionAction);
            }
          });
        } else {
          actionItem = new Button({
            /* followUpOption: {
              pillText: chatActionAction.text,
              disabled: chatActionAction.disabled,
              description: chatActionAction.description,
              status: chatActionAction.status,
              icon: chatActionAction.icon,
            }, */
            label: chatActionAction.text,
            icon: chatActionAction.icon,
            primary: chatActionAction.status !== undefined,
            onClick: (e) => {
              if (props.formItems !== null) {
                props.formItems.disableAll();
              }
              this.disableAll();
              this.props.onActionClick(chatActionAction, e);
            }
          });
          if (chatActionAction.disabled === true) {
            actionItem.setEnabled(false);
          }
        }
        this.actions[chatActionAction.id] = {
          data: chatActionAction,
          element: actionItem,
        };
        return actionItem.render;
      })
    });
    if (props.formItems !== null) {
      this.handleValidationChange(props.formItems.isFormValid());
      props.formItems.onValidationChange = (isValid) => {
        this.handleValidationChange(isValid);
      };
    }
  }

  private readonly handleValidationChange = (isFormValid: boolean): void => {
    Object.keys(this.actions).forEach(chatActionId => {
      if (this.actions[chatActionId].data.waitMandatoryFormItems !== false) {
        this.actions[chatActionId].element.setEnabled(isFormValid);
      }
    });
  };

  private readonly disableAll = (): void => {
    Object.keys(this.actions).forEach(chatActionId => this.actions[chatActionId].element.setEnabled(false));
  };
}
