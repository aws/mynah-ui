/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';

export interface TextInputProps {
  classNames?: string[];
  attributes?: Record<string, string>;
  label?: HTMLElement | ExtendedHTMLElement | string;
  placeholder?: string;
  type?: 'text' | 'number' | 'email';
  value?: string;
  onChange?: (value: string) => void;
}

export abstract class TextInputAbstract {
  render: ExtendedHTMLElement;
  setValue = (value: string): void => {};
  getValue = (): string => '';
  setEnabled = (enabled: boolean): void => {};
}

export class TextInputInternal extends TextInputAbstract {
  private readonly inputElement: ExtendedHTMLElement;
  render: ExtendedHTMLElement;
  constructor (props: TextInputProps) {
    super();
    this.inputElement = DomBuilder.getInstance().build({
      type: 'input',
      classNames: [ 'mynah-form-input', ...(props.classNames ?? []) ],
      attributes: {
        type: props.type ?? 'text',
        ...(props.placeholder !== undefined
          ? {
              placeholder: props.placeholder
            }
          : {})
      },
      events: {
        keyup: (e) => {
          if (props.onChange !== undefined) {
            props.onChange((e.currentTarget as HTMLSelectElement).value);
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
        }
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
}
