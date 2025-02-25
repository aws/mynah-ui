/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { checkTextElementValidation } from '../../helper/validator';
import { ValidationPattern } from '../../static';
import '../../styles/components/_form-input.scss';

export interface TextInputProps {
  classNames?: string[];
  attributes?: Record<string, string>;
  label?: HTMLElement | ExtendedHTMLElement | string;
  description?: ExtendedHTMLElement;
  mandatory?: boolean;
  fireModifierAndEnterKeyPress?: () => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email';
  validationPatterns?: {
    operator?: 'and' | 'or';
    patterns: ValidationPattern[];
  };
  value?: string;
  onChange?: (value: string) => void;
  testId?: string;
}

export abstract class TextInputAbstract {
  render: ExtendedHTMLElement;
  setValue = (value: string): void => {};
  getValue = (): string => '';
  setEnabled = (enabled: boolean): void => {};
  checkValidation = (): void => {};
}
export class TextInputInternal extends TextInputAbstract {
  private readonly inputElement: ExtendedHTMLElement;
  private readonly validationErrorBlock: ExtendedHTMLElement;
  private readonly props: TextInputProps;
  private readyToValidate: boolean = false;
  render: ExtendedHTMLElement;
  constructor (props: TextInputProps) {
    super();
    this.props = props;
    this.validationErrorBlock = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-form-input-validation-error-block' ],
    });
    this.inputElement = DomBuilder.getInstance().build({
      type: 'input',
      testId: this.props.testId,
      classNames: [ 'mynah-form-input', ...(this.props.classNames ?? []) ],
      attributes: {
        type: props.type ?? 'text',
        ...(props.placeholder !== undefined
          ? {
              placeholder: props.placeholder
            }
          : {})
      },
      events: {
        blur: (e) => {
          this.readyToValidate = true;
          this.checkValidation();
        },
        keyup: (e) => {
          if (this.props.onChange !== undefined) {
            this.props.onChange((e.currentTarget as HTMLInputElement).value);
          }
          this.checkValidation();
        },
        keydown: (e: KeyboardEvent) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            this.props.fireModifierAndEnterKeyPress?.();
          }
        }
      },
    });
    this.inputElement.value = props.value?.toString() ?? '';
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-form-input-wrapper' ],
      children: [
        {
          type: 'span',
          classNames: [ 'mynah-form-input-label' ],
          children: [ ...(props.label !== undefined ? [ props.label ] : []) ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-form-input-container' ],
          ...(props.attributes !== undefined ? { attributes: props.attributes } : {}),
          children: [
            this.inputElement,
          ]
        },
        ...[ props.description !== undefined ? props.description : '' ],
        this.validationErrorBlock
      ]
    });
  }

  setValue = (value: string): void => {
    this.inputElement.value = value;
  };

  getValue = (): string => {
    return this.inputElement.value;
  };

  setEnabled = (enabled: boolean): void => {
    if (enabled) {
      this.inputElement.removeAttribute('disabled');
    } else {
      this.inputElement.setAttribute('disabled', 'disabled');
    }
  };

  checkValidation = (): void => checkTextElementValidation(this.inputElement, this.props.validationPatterns, this.validationErrorBlock, this.readyToValidate, this.props.mandatory);
}

export class TextInput extends TextInputAbstract {
  render: ExtendedHTMLElement;

  constructor (props: TextInputProps) {
    super();
    return new (Config.getInstance().config.componentClasses.TextInput ?? TextInputInternal)(props);
  }

  setValue = (value: string): void => {};
  getValue = (): string => '';
  setEnabled = (enabled: boolean): void => {};
  checkValidation = (): void => {};
}
