/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import testIds from '../../helper/test-ids';
import { isMandatoryItemValid, isTextualFormItemValid } from '../../helper/validator';
import { ChatItem, ChatItemFormItem, TextBasedFormItem } from '../../static';
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
      testId: testIds.chatItem.chatItemForm.wrapper,
      classNames: [ 'mynah-chat-item-form-items-container', ...(this.props.classNames ?? []) ],
      children: this.props.chatItem.formItems?.map(chatItemOption => {
        let chatOption;
        let label: ExtendedHTMLElement | string = `${chatItemOption.mandatory === true ? '* ' : ''}${chatItemOption.title ?? ''}`;
        if (chatItemOption.mandatory === true) {
          label = DomBuilder.getInstance().build({
            type: 'div',
            testId: testIds.chatItem.chatItemForm.title,
            classNames: [ 'mynah-ui-form-item-mandatory-title' ],
            children: [
              new Icon({ icon: MynahIcons.ASTERISK }).render,
              chatItemOption.title ?? '',
            ]
          });
          // Since the field is mandatory, default the selected value to the first option
          if (chatItemOption.type === 'select' && chatItemOption.value === undefined) {
            chatItemOption.value = chatItemOption.options?.[0]?.value;
          }
        }
        let description;
        if (chatItemOption.description !== undefined) {
          description = DomBuilder.getInstance().build({
            type: 'span',
            testId: testIds.chatItem.chatItemForm.description,
            classNames: [ 'mynah-ui-form-item-description' ],
            children: [
              chatItemOption.description,
            ]
          });
        }
        const value = chatItemOption.value?.toString();
        switch (chatItemOption.type) {
          case 'select':
            chatOption = new Select({
              wrapperTestId: testIds.chatItem.chatItemForm.itemSelectWrapper,
              optionTestId: testIds.chatItem.chatItemForm.itemSelect,
              label,
              description,
              value,
              options: chatItemOption.options,
              optional: chatItemOption.mandatory !== true,
              placeholder: Config.getInstance().config.texts.pleaseSelect,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'radiogroup':
            chatOption = new RadioGroup({
              wrapperTestId: testIds.chatItem.chatItemForm.itemRadioWrapper,
              optionTestId: testIds.chatItem.chatItemForm.itemRadio,
              label,
              description,
              value,
              options: chatItemOption.options,
              optional: chatItemOption.mandatory !== true,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'textarea':
            chatOption = new TextArea({
              testId: testIds.chatItem.chatItemForm.itemTextArea,
              label,
              description,
              value,
              validationPatterns: chatItemOption.validationPatterns,
              placeholder: chatItemOption.placeholder,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'textinput':
            chatOption = new TextInput({
              testId: testIds.chatItem.chatItemForm.itemInput,
              label,
              description,
              value,
              validationPatterns: chatItemOption.validationPatterns,
              placeholder: chatItemOption.placeholder,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'numericinput':
            chatOption = new TextInput({
              testId: testIds.chatItem.chatItemForm.itemInput,
              label,
              description,
              value,
              validationPatterns: chatItemOption.validationPatterns,
              type: 'number',
              placeholder: chatItemOption.placeholder,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'email':
            chatOption = new TextInput({
              testId: testIds.chatItem.chatItemForm.itemInput,
              label,
              description,
              value,
              validationPatterns: chatItemOption.validationPatterns,
              type: 'email',
              placeholder: chatItemOption.placeholder,
              ...(this.getValidationHandler(chatItemOption))
            });
            break;
          case 'stars':
            chatOption = new Stars({
              wrapperTestId: testIds.chatItem.chatItemForm.itemStarsWrapper,
              optionTestId: testIds.chatItem.chatItemForm.itemStars,
              label,
              description,
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
    if (chatItemOption.mandatory === true ||
      ([ 'textarea', 'textinput', 'numericinput', 'email' ].includes(chatItemOption.type) && (chatItemOption as TextBasedFormItem).validationPatterns != null)) {
      // Set initial validation status
      this.validationItems[chatItemOption.id] = this.isItemValid(chatItemOption.value ?? '', chatItemOption);
      return {
        onChange: (value: string | number) => {
          this.validationItems[chatItemOption.id] = this.isItemValid(value.toString(), chatItemOption);
          this.isFormValid();
        }
      };
    }
    return {};
  };

  private readonly isItemValid = (value: string, chatItemOption: ChatItemFormItem): boolean => {
    let validationState = true;
    if (chatItemOption.mandatory === true) {
      validationState = isMandatoryItemValid(value ?? '');
    }
    if (((chatItemOption.type === 'textarea' || chatItemOption.type === 'textinput') && chatItemOption.validationPatterns != null)) {
      validationState = validationState && isTextualFormItemValid(value ?? '', chatItemOption.validationPatterns ?? { patterns: [] }).isValid;
    }

    return validationState;
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
