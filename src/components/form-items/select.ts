/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { Icon, MynahIcons } from '../icon';
import '../../styles/components/_form-input.scss';

interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  classNames?: string[];
  attributes?: Record<string, string>;
  icon?: MynahIcons;
  label?: HTMLElement | ExtendedHTMLElement | string;
  description?: ExtendedHTMLElement;
  value?: string;
  optional?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  wrapperTestId?: string;
  optionTestId?: string;
}

export abstract class SelectAbstract {
  render: ExtendedHTMLElement;
  setValue = (value: string): void => {};
  getValue = (): string => '';
  setEnabled = (enabled: boolean): void => {};
}

export class SelectInternal {
  private readonly selectElement: ExtendedHTMLElement;
  render: ExtendedHTMLElement;
  constructor (props: SelectProps) {
    this.selectElement = DomBuilder.getInstance().build({
      type: 'select',
      testId: props.wrapperTestId,
      classNames: [ 'mynah-form-input', ...(props.classNames ?? []) ],
      events: {
        change: (e) => {
          if (props.onChange !== undefined) {
            props.onChange((e.currentTarget as HTMLSelectElement).value);
          }
        }
      },
      children:
        [ ...(props.optional === true
          ? [ {
              label: props.placeholder ?? '...',
              value: ''
            } ]
          : []), ...props.options ?? [] ].map(option => ({
          type: 'option',
          testId: props.optionTestId,
          classNames: option.value === '' ? [ 'empty-option' ] : [],
          attributes: { value: option.value },
          children: [ option.label ]
        })) as DomBuilderObject[]
    });
    if (props.value !== undefined) {
      this.selectElement.value = props.value;
    }
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
            this.selectElement,
            new Icon({ icon: props.icon ?? MynahIcons.DOWN_OPEN, classNames: [ 'mynah-select-handle' ] }).render ]
        },
        ...[ props.description !== undefined ? props.description : '' ]
      ]
    });
  }

  setValue = (value: string): void => {
    this.selectElement.value = value;
  };

  getValue = (): string => {
    return this.selectElement.value;
  };

  setEnabled = (enabled: boolean): void => {
    if (enabled) {
      this.selectElement.removeAttribute('disabled');
    } else {
      this.selectElement.setAttribute('disabled', 'disabled');
    }
  };
}

export class Select extends SelectAbstract {
  render: ExtendedHTMLElement;

  constructor (props: SelectProps) {
    super();
    return new (Config.getInstance().config.componentClasses.Select ?? SelectInternal)(props);
  }

  setValue = (value: string): void => {};
  getValue = (): string => '';
  setEnabled = (enabled: boolean): void => {};
}
