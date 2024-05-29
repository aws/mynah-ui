/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';

export interface TextAreaProps {
  classNames?: string[];
  attributes?: Record<string, string>;
  label?: HTMLElement | ExtendedHTMLElement | string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export abstract class TextAreaAbstract {
  render: ExtendedHTMLElement;
  setValue = (value: string): void => {};
  getValue = (): string => '';
  setEnabled = (enabled: boolean): void => {};
}
export class TextAreaInternal extends TextAreaAbstract {
  private readonly inputElement: ExtendedHTMLElement;
  render: ExtendedHTMLElement;
  constructor (props: TextAreaProps) {
    super();
    this.inputElement = DomBuilder.getInstance().build({
      type: 'textarea',
      classNames: [ 'mynah-form-input', ...(props.classNames ?? []) ],
      attributes: props.placeholder !== undefined
        ? {
            placeholder: props.placeholder
          }
        : {},
      events: {
        keyup: (e) => {
          if (props.onChange !== undefined) {
            props.onChange((e.currentTarget as HTMLSelectElement).value);
          }
        }
      },
    });
    this.inputElement.value = props.value ?? '';
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

export class TextArea extends TextAreaAbstract {
  render: ExtendedHTMLElement;

  constructor (props: TextAreaProps) {
    super();
    return new (Config.getInstance().config.componentClasses.TextArea ?? TextAreaInternal)(props);
  }

  setValue = (value: string): void => {};
  getValue = (): string => '';
  setEnabled = (enabled: boolean): void => {};
}
