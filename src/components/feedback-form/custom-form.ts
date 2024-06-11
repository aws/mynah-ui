/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { ChatItem, MynahEventNames } from '../../static';
import { ChatItemFormItemsWrapper } from '../chat-item/chat-item-form-items';
import { ChatItemButtonsWrapper } from '../chat-item/chat-item-buttons';
import { CardBody } from '../card/card-body';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';

export interface CustomFormWrapperProps {
  tabId: string;
  chatItem: Partial<ChatItem>;
  title?: string;
  description?: string;
  onFormAction?: (actionName: string, formData: Record<string, string>) => void;
  onCloseButtonClick?: (e: Event) => void;
}
export class CustomFormWrapper {
  readonly props: CustomFormWrapperProps;
  render: ExtendedHTMLElement;
  chatFormItems: ChatItemFormItemsWrapper | null = null;
  chatButtons: ChatItemButtonsWrapper | null = null;
  constructor (props: CustomFormWrapperProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-feedback-form' ],
      events: { click: cancelEvent },
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-feedback-form-header' ],
          children: [
            ...(this.props.title !== undefined
              ? [ {
                  type: 'h4',
                  children: [ this.props.title ],
                } ]
              : []),
            new Button({
              primary: false,
              onClick: (e) => {
                if (this.props.onCloseButtonClick !== undefined) {
                  this.props.onCloseButtonClick(e);
                }
              },
              icon: new Icon({ icon: MynahIcons.CANCEL }).render
            }).render
          ]
        },
        ...(this.props.description !== undefined
          ? [ new CardBody({
              body: this.props.description
            }).render ]
          : []),
        ...this.getFormItems()
      ],
    });
  }

  private readonly getFormItems = (): Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject> => {
    if (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId) === undefined) {
      return [];
    }
    if (this.chatFormItems !== null) {
      this.chatFormItems.render.remove();
      this.chatFormItems = null;
    }
    if (this.props.chatItem.formItems !== undefined) {
      this.chatFormItems = new ChatItemFormItemsWrapper({ tabId: this.props.tabId, chatItem: this.props.chatItem });
    }

    if (this.chatButtons !== null) {
      this.chatButtons.render.remove();
      this.chatButtons = null;
    }
    if (this.props.chatItem.buttons !== undefined) {
      this.chatButtons = new ChatItemButtonsWrapper({
        tabId: this.props.tabId,
        formItems: this.chatFormItems,
        buttons: this.props.chatItem.buttons,
        onActionClick: (action, e) => {
          if (e !== undefined) {
            cancelEvent(e);
          }

          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CUSTOM_FORM_ACTION_CLICK, {
            tabId: this.props.tabId,
            id: action.id,
            text: action.text,
            ...(this.chatFormItems !== null ? { formItemValues: this.chatFormItems.getAllValues() } : {})
          });

          if (this.props.onFormAction !== undefined) {
            this.props.onFormAction(action.id, this.chatFormItems !== null ? this.chatFormItems.getAllValues() : {});
            this.render.remove();
          }
        }
      });
    }
    return [
      ...(this.chatFormItems !== null
        ? [ (this.chatFormItems).render ]
        : []),
      ...(this.chatButtons !== null
        ? [ (this.chatButtons).render ]
        : []),
    ];
  };
}
