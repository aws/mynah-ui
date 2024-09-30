/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import testIds from '../../helper/test-ids';
import { ChatItemButton } from '../../static';
import { Button } from '../button';
import { Icon } from '../icon';
import { ChatItemFormItemsWrapper } from './chat-item-form-items';

export interface ChatItemButtonsWrapperProps {
  tabId: string;
  classNames?: string[];
  buttons: ChatItemButton[];
  formItems: ChatItemFormItemsWrapper | null;
  onActionClick: (action: ChatItemButton, e?: Event) => void;
}
export class ChatItemButtonsWrapper {
  private readonly props: ChatItemButtonsWrapperProps;
  private readonly actions: Record<string, {
    data: ChatItemButton;
    element: Button;
  }> = {};

  render: ExtendedHTMLElement;
  constructor (props: ChatItemButtonsWrapperProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.chatItem.buttons.wrapper,
      classNames: [ 'mynah-chat-item-buttons-container', ...(this.props.classNames ?? []) ],
      children: this.props.buttons.map(chatActionAction => {
        const actionItem = new Button({
          testId: testIds.chatItem.buttons.button,
          label: chatActionAction.text,
          icon: chatActionAction.icon != null ? new Icon({ icon: chatActionAction.icon }).render : undefined,
          primary: chatActionAction.status === 'primary',
          border: chatActionAction.status !== 'primary',
          attributes: {
            'action-id': chatActionAction.id
          },
          status: chatActionAction.status,
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
    Object.keys(this.actions).forEach(chatActionId => {
      if (this.actions[chatActionId].data.disabled !== false) {
        this.actions[chatActionId].element.setEnabled(false);
      }
    });
  };
}
