/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItem } from '../../static';
import { Select } from '../select';
import { TextArea } from '../text-area';

export interface ChatItemFormItemsWrapperProps {tabId: string; chatItem: ChatItem}
export class ChatItemFormItemsWrapper {
  private readonly props: ChatItemFormItemsWrapperProps;
  private readonly options: Record<string, Select | TextArea> = {};
  render: ExtendedHTMLElement;
  constructor (props: ChatItemFormItemsWrapperProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-form-items-container' ],
      children: this.props.chatItem.formItems?.map(chatItemOption => {
        let chatOption;
        if (chatItemOption.options !== undefined) {
          chatOption = new Select({
            options: chatItemOption.options,
            label: chatItemOption.title,
          });
        } else if (chatItemOption.input !== undefined) {
          chatOption = new TextArea({
            label: chatItemOption.title,
            value: chatItemOption.input,
          });
        }
        if (chatOption !== undefined) {
          this.options[chatItemOption.id] = chatOption;
          return chatOption.render;
        }
        return null;
      }) as ExtendedHTMLElement[]
    });
  }

  disableAll = (): void => {
    Object.keys(this.options).forEach(chatOptionId => this.options[chatOptionId].setEnabled(false));
  };

  getAllValues = (): Record<string, string> => {
    const valueMap: Record<string, string> = {};
    Object.keys(this.options).forEach(chatOptionId => {
      valueMap[chatOptionId] = this.options[chatOptionId].getValue();
    });
    return valueMap;
  };
}
