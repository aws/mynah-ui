/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItem, ChatItemFormItem } from '../../static';
import { RadioGroup } from '../form-items/radio-group';
import { Select } from '../form-items/select';
import { Stars } from '../form-items/stars';
import { TextArea } from '../form-items/text-area';
import { TextInput } from '../form-items/text-input';
import { Icon, MynahIcons } from '../icon';

export interface ChatItemFormItemsWrapperProps {
  tabId: string;
  chatItem: Partial<ChatItem>;
  classNames?: string[];
}
export class ChatItemFormItemsWrapper {
  private readonly props: ChatItemFormItemsWrapperProps;
  private readonly options: Record<string, Select | TextArea | TextInput | RadioGroup | Stars> = {};
  private readonly validationItems: Record<string, boolean> = {};
  private isValid: boolean = false;
  onValidationChange?: (isValid: boolean) => void;

  render: ExtendedHTMLElement;
  constructor (props: ChatItemFormItemsWrapperProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-form-items-container', ...(this.props.classNames ?? []) ],
      children: this.props.chatItem.formItems?.map(chatItemOption => {
        let chatOption;
        let label: ExtendedHTMLElement | string = `${chatItemOption.mandatory === true ? '* ' : ''}${chatItemOption.title ?? ''}`;
        if (chatItemOption.mandatory === true) {
          label = DomBuilder.getInstance().build({
            type: 'div',
            classNames: [ 'mynah-ui-form-item-mandatory-title' ],
            children: [
              new Icon({ icon: MynahIcons.ASTERISK }).render,
              chatItemOption.title ?? '',
            ]
          });
          // Since the field is mandatory, default the selected value to the first option
          if (chatItemOption.value === undefined) {
            chatItemOption.value = chatItemOption.options?.[0]?.value;
          }
        }
        const value = chatItemOption.value?.toString();
        switch (chatItemOption.type) {
          case 'select':
            chatOption = new Select({
              label,
              value,
              options: chatItemOption.options,
              optional: chatItemOption.mandatory !== true,
              placeholder: Config.getInstance().config.texts.pleaseSelect,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'radiogroup':
            chatOption = new RadioGroup({
              label,
              value,
              options: chatItemOption.options,
              optional: chatItemOption.mandatory !== true,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'textarea':
            chatOption = new TextArea({
              label,
              value,
              placeholder: chatItemOption.placeholder,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'textinput':
            chatOption = new TextInput({
              label,
              value,
              placeholder: chatItemOption.placeholder,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'numericinput':
            chatOption = new TextInput({
              label,
              value,
              type: 'number',
              placeholder: chatItemOption.placeholder,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'email':
            chatOption = new TextInput({
              label,
              value,
              type: 'email',
              placeholder: chatItemOption.placeholder,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'stars':
            chatOption = new Stars({
              label,
              value,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          default:
            break;
        }

        if (chatOption !== undefined) {
          this.options[chatItemOption.id] = chatOption;
          return chatOption.render;
        }
        return null;
      }) as ExtendedHTMLElement[]
    });
    this.isFormValid();
  }

  private readonly getValidationHandler = (chatItemOption: ChatItemFormItem): Object => {
    if (chatItemOption.mandatory === true) {
      this.validationItems[chatItemOption.id] = chatItemOption.value !== undefined && chatItemOption.value !== '';
      return {
        onChange: (value: string | number) => {
          this.validationItems[chatItemOption.id] = value !== undefined && value !== '';
          this.isFormValid();
        }
      };
    }
    return {};
  };

  isFormValid = (): boolean => {
    const currentValidationStatus = Object.keys(this.validationItems).reduce((prev, curr) => {
      return prev && this.validationItems[curr];
    }, true);

    if (this.isValid !== currentValidationStatus && this.onValidationChange !== undefined) {
      this.onValidationChange(currentValidationStatus);
    }
    this.isValid = currentValidationStatus;
    return currentValidationStatus;
  };

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
