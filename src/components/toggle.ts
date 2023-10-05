/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable @typescript-eslint/restrict-template-expressions
import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { Icon, MynahIcons } from './icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from './overlay/overlay';

export interface ToggleOption {
  label?: ExtendedHTMLElement | string | HTMLElement;
  color?: string;
  icon?: MynahIcons;
  disabled?: boolean;
  selected?: boolean;
  value: string;
  disabledTooltip?: string | ExtendedHTMLElement;
}
interface ToggleOptionRenderProps extends ToggleOption {
  name: string;
  onChange?: (selectedValue: string, selectedColor?: string) => void;
}
class ToggleOptionItem {
  render: ExtendedHTMLElement;
  private readonly props: ToggleOptionRenderProps;
  private disabledTooltip?: Overlay;
  private disabledTooltipTimer: ReturnType<typeof setTimeout>;
  constructor (props: ToggleOptionRenderProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'span',
      attributes: { key: `${this.props.name}-${this.props.value}` },
      events: {
        ...(this.props.disabled === true && this.props.disabledTooltip !== undefined
          ? {
              mouseenter: () => {
                this.disabledTooltipTimer = setTimeout(() => {
                  this.disabledTooltip = new Overlay({
                    children: [ {
                      type: 'span',
                      classNames: [ 'mynah-toggle-disabled-tooltip-container' ],
                      children: [ this.props.disabledTooltip ?? '' ]
                    } ],
                    closeOnOutsideClick: false,
                    dimOutside: false,
                    referenceElement: this.render,
                    horizontalDirection: OverlayHorizontalDirection.CENTER,
                    verticalDirection: OverlayVerticalDirection.TO_TOP
                  });
                }, 500);
              },
              mouseleave: () => {
                clearTimeout(this.disabledTooltipTimer);
                if (this.disabledTooltip !== undefined) {
                  this.disabledTooltip.close();
                  setTimeout(() => {
                    this.disabledTooltip = undefined;
                  }, 50);
                }
              }
            }
          : {})
      },
      children: [
        {
          type: 'input',
          classNames: [ 'mynah-toggle-option' ],
          attributes: {
            type: 'radio',
            id: `${this.props.name}-${this.props.value}`,
            value: this.props.value,
            name: this.props.name,
            ...(this.props.selected === true ? { checked: 'checked' } : {}),
            ...(this.props.disabled === true ? { disabled: 'disabled' } : {}),
          },
          events: {
            change: () => {
              if (this.props.onChange != null) {
                this.props.onChange(this.props.value, this.props.color);
              }
            }
          },
        },
        {
          type: 'label',
          classNames: [ 'mynah-toggle-option-label' ],
          attributes: {
            for: `${this.props.name}-${this.props.value}`,
            ...(this.props.color !== undefined ? { style: `background-color:${this.props.color}` } : {}),
          },
          children: [
            this.props.icon !== undefined ? new Icon({ icon: props.icon as MynahIcons }).render : '',
            this.props.label !== undefined
              ? {
                  type: 'span',
                  children: [ this.props.label ]
                }
              : ''
          ],
        },
      ],
    });
  }
}
export interface ToggleProps {
  options: ToggleOption[];
  type?: 'switch' | 'tabs';
  direction?: 'horizontal' | 'vertical';
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
    this.props = { type: 'switch', direction: 'horizontal', ...props };
    this.relocateTransitioner = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-toggle-indicator-transitioner' ],
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-toggle-container', `mynah-toggle-type-${this.props.type as string}`, `mynah-toggle-direction-${this.props.direction as string}` ],
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
      return new ToggleOptionItem({
        ...option,
        selected: value === option.value,
        name: this.props.name,
        onChange: this.updateSelectionRender
      }).render;
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
    }, 10);
  };

  setValue = (value: string): void => {
    // Since the html elements are not interactable when there is no user action
    // such as a real physical input event, we need to redraw the elements
    this.render.update({ children: this.getChildren(value) });
    this.setRelocatePosition(value);
  };

  getValue = (): string | undefined => this.currentValue;
}
