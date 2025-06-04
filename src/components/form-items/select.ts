/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { StyleLoader } from '../../helper/style-loader';
import { Icon, MynahIcons, MynahIconsType } from '../icon';

interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  classNames?: string[];
  attributes?: Record<string, string>;
  handleIcon?: MynahIcons | MynahIconsType;
  border?: boolean;
  icon?: MynahIcons | MynahIconsType;
  label?: HTMLElement | ExtendedHTMLElement | string;
  description?: ExtendedHTMLElement;
  value?: string;
  optional?: boolean;
  autoWidth?: boolean;
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
  private readonly props: SelectProps;
  private readonly selectElement: ExtendedHTMLElement;
  private readonly autoWidthSizer: ExtendedHTMLElement;
  render: ExtendedHTMLElement;
  constructor (props: SelectProps) {
    this.props = props;
    StyleLoader.getInstance().load('components/_form-input.scss');
    this.autoWidthSizer = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'select-auto-width-sizer' ],
      children: [ this.props.options?.find(option => option.value === this.props.value)?.label ?? this.props.placeholder ?? '' ]
    });
    this.selectElement = DomBuilder.getInstance().build({
      type: 'select',
      testId: props.wrapperTestId,
      classNames: [ 'mynah-form-input', ...(props.classNames ?? []), ...(props.autoWidth === true ? [ 'auto-width' ] : []) ],
      events: {
        change: (e) => {
          const value = (e.currentTarget as HTMLSelectElement).value;
          if (props.onChange !== undefined) {
            props.onChange(value);
          }
          this.autoWidthSizer.update({
            children: [ this.props.options?.find(option => option.value === value)?.label ?? this.props.placeholder ?? '' ]
          });
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
        ...[ props.description !== undefined ? props.description : '' ],
        {
          type: 'div',
          classNames: [ 'mynah-form-input-container', ...(props.border === false ? [ 'no-border' ] : []) ],
          ...(props.attributes !== undefined ? { attributes: props.attributes } : {}),
          children: [
            ...(props.icon
              ? [ new Icon({ icon: props.icon, classNames: [ 'mynah-form-input-icon' ] }).render ]
              : []),
            ...(props.autoWidth !== undefined ? [ this.autoWidthSizer ] : []),
            this.selectElement,
            new Icon({ icon: props.handleIcon ?? MynahIcons.DOWN_OPEN, classNames: [ 'mynah-select-handle' ] }).render ]
        }
      ]
    });
  }

  setValue = (value: string): void => {
    this.selectElement.value = value;
    this.autoWidthSizer.update({
      children: [ this.props.options?.find(option => option.value === value)?.label ?? this.props.placeholder ?? '' ]
    });
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
