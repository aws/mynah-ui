/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable @typescript-eslint/restrict-template-expressions
import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';

export interface ToggleOption {
  label?: ExtendedHTMLElement | string | HTMLElement;
  color?: string;
  disabled?: boolean;
  selected?: boolean;
  value: string;
}
export interface ToggleProps {
  options: ToggleOption[];
  type?: 'switch' | 'tabs';
  value?: string | null;
  name: string;
  disabled?: boolean;
  onChange?: (selectedValue: string) => void;
}
export class Toggle {
  render: ExtendedHTMLElement;
  private readonly props: ToggleProps;
  private currentValue?: string;
  private readonly relocateTransitioner: ExtendedHTMLElement;

  constructor (props: ToggleProps) {
    this.props = { type: 'switch', ...props };
    this.relocateTransitioner = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-toggle-indicator-transitioner' ],
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-toggle-container', `mynah-toggle-type-${this.props.type as string}` ],
      attributes: { disabled: props.disabled === true ? 'disabled' : '' },
      children: this.getChildren(props.value),
    });

    if (typeof props.value === 'string') {
      this.setRelocatePosition(props.value);
    }
  }

  private readonly getChildren = (value?: string | null): any[] => [
    ...this.props.options.map(option => {
      if (option.value === value && option.color !== undefined) {
        this.relocateTransitioner.style.backgroundColor = option.color;
      }
      return DomBuilder.getInstance().build({
        type: 'span',
        attributes: { key: `${this.props.name}-${option.value}` },
        children: [
          {
            type: 'input',
            classNames: [ 'mynah-toggle-option' ],
            attributes: {
              type: 'radio',
              id: `${this.props.name}-${option.value}`,
              name: this.props.name,
              ...(value === option.value ? { checked: 'checked' } : {}),
              ...(option.disabled === true ? { disabled: 'disabled' } : {}),
            },
            events: {
              change: () => {
                this.updateSelectionRender(option.value, option.color);
              },
            },
          },
          {
            type: 'label',
            classNames: [ 'mynah-toggle-option-label' ],
            attributes: {
              for: `${this.props.name}-${option.value}`,
              ...(option.color !== undefined ? { style: `background-color:${option.color}` } : {}),
            },
            children: [ option.label ?? '' ],
          },
        ],
      });
    }),
    this.relocateTransitioner,
  ];

  private readonly setRelocatePosition = (value: string, color?: string): void => {
    this.currentValue = value;
    setTimeout(() => {
      const renderRect = this.render.getBoundingClientRect();
      const optionRender = this.render
        .querySelector(`label[for="${this.props.name}-${value}"]`) as HTMLElement;
      const rect = optionRender?.getBoundingClientRect() ?? {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      };

      if (this.props.type === 'switch') {
        this.relocateTransitioner.style.top = `${rect.top - renderRect.top}px`;
        this.relocateTransitioner.style.height = `${rect.height}px`;
      } else if (this.props.type === 'tabs') {
        this.relocateTransitioner.style.top = `${rect.height + rect.top - renderRect.top}px`;
      }
      this.relocateTransitioner.style.left = `${rect.left - renderRect.left}px`;
      this.relocateTransitioner.style.width = `${rect.width}px`;
      if (color !== undefined) {
        this.relocateTransitioner.style.backgroundColor = color;
        if (optionRender !== undefined) {
          optionRender.style.color = color;
        }
      }
    }, 5);
  };

  private readonly updateSelectionRender = (value: string, color?: string): void => {
    this.relocateTransitioner.removeClass('relocate');
    this.setRelocatePosition(value, color);

    setTimeout(() => {
      this.relocateTransitioner.addClass('relocate');
      if (this.props.onChange !== undefined) {
        this.props.onChange(value);
      }
    }, 200);
  };

  setValue = (value: string): void => {
    // Since the html elements are not interactable when there is no user action
    // such as a real physical input event, we need to redraw the elements
    this.render.update({ children: this.getChildren(value) });
    this.setRelocatePosition(value);
  };

  getValue = (): string | undefined => this.currentValue;
}
