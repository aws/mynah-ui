/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import {
  DomBuilder,
  DomBuilderEventHandler,
  DomBuilderEventHandlerWithOptions,
  DomBuilderObject,
  ExtendedHTMLElement,
  GenericEvents
} from '../helper/dom';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from './overlay';
import { Card } from './card/card';
import { CardBody } from './card/card-body';
import { Config } from '../helper/config';
import { cancelEvent } from '../helper/events';
import escapeHTML from 'escape-html';
import '../styles/components/_button.scss';
import unescapeHTML from 'unescape-html';
import { getBindableValue, isBindable, MakePropsBindable } from '../helper/bindable';

const TOOLTIP_DELAY = 350;

export type ButtonStatus = 'main' | 'primary' | 'info' | 'success' | 'warning' | 'error' | 'clear';
export type ButtonFillState = 'hover' | 'always';
export type ButtonEvents = Partial<Record<GenericEvents, DomBuilderEventHandler | DomBuilderEventHandlerWithOptions>>;

interface ButtonPropsBindable {
  classNames?: string[];
  attributes?: Record<string, string>;
  icon?: HTMLElement | ExtendedHTMLElement;
  testId?: string;
  label?: HTMLElement | ExtendedHTMLElement | string;
  tooltip?: string;
  tooltipVerticalDirection?: OverlayVerticalDirection;
  tooltipHorizontalDirection?: OverlayHorizontalDirection;
  children?: Array<HTMLElement | ExtendedHTMLElement | string>;
  disabled?: boolean;
  primary?: boolean;
  border?: boolean;
  status?: ButtonStatus;
  fillState?: ButtonFillState;
  additionalEvents?: ButtonEvents;
}

export interface ButtonProps extends MakePropsBindable<ButtonPropsBindable> {
  onClick: (e: Event) => void;
  onHover?: (e: Event) => void;
}

export abstract class ButtonAbstract {
  render: ExtendedHTMLElement;

  update = (newProps: Partial<ButtonProps>): void => {
  };

  hideTooltip = (): void => {
  };
}

class ButtonInternal extends ButtonAbstract {
  render: ExtendedHTMLElement;
  private props: ButtonProps;
  private tooltipOverlay: Overlay | null;
  private tooltipTimeout: ReturnType<typeof setTimeout>;
  private readonly iconWrapper: ExtendedHTMLElement;
  private readonly labelWrapper: ExtendedHTMLElement;
  private readonly childWrapper: ExtendedHTMLElement;
  constructor (props: ButtonProps) {
    super();
    this.props = props;
    Object.entries(this.props).forEach(([ key, value ]) => {
      if (isBindable(value)) {
        value.subscribe((newVal) => {
          this.update({
            [key]: value
          });
        });
      }
    });
    this.iconWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-button-icon-wrapper' ],
      children: [
        ...(this.props.icon != null ? [ getBindableValue(this.props.icon) ?? '' ] : []),
      ],
    });
    this.labelWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-button-label-wrapper' ],
      children: [
        ...(this.getButtonLabelDomBuilderObject(getBindableValue(this.props.label))),
      ],
    });
    this.childWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-button-child-wrapper' ],
      children: [
        ...(getBindableValue(this.props.children) ?? []),
      ],
    });
    this.render = DomBuilder.getInstance().build({
      type: 'button',
      classNames: this.getClassList(),
      testId: getBindableValue(this.props.testId),
      attributes: {
        ...(getBindableValue(this.props.disabled) === true ? { disabled: 'disabled' } : {}),
        tabindex: '0',
        ...(getBindableValue(this.props.attributes) ?? {}),
      },
      events: {
        ...props.additionalEvents,
        click: this.handleClick,
        mouseover: this.handleMouseOver,
        mouseleave: this.hideTooltip
      },
      children: [
        this.iconWrapper,
        this.labelWrapper,
        this.childWrapper
      ],
    });
  }

  private readonly getButtonLabelDomBuilderObject = (label?: HTMLElement | ExtendedHTMLElement | string): DomBuilderObject[] => {
    if (label !== undefined) {
      if (typeof label !== 'string') {
        return [ { type: 'span', classNames: [ 'mynah-button-label' ], children: [ label ] } ];
      } else {
        return [ { type: 'span', classNames: [ 'mynah-button-label' ], innerHTML: marked.parseInline(unescapeHTML(escapeHTML(label))) as string } ];
      }
    }
    return [];
  };

  private readonly handleClick = (e: MouseEvent): void => {
    this.hideTooltip();
    if (this.props.disabled !== true) {
      this.props.onClick(e);
    }
  };

  private readonly handleMouseOver = (e: MouseEvent): void => {
    cancelEvent(e);
    if (this.props.onHover != null) {
      this.props.onHover(e);
    }
    const textContentSpan: HTMLSpanElement | null = this.render.querySelector('.mynah-button-label');
    let tooltipText;
    const labelContent = getBindableValue(this.props.label);
    if (typeof labelContent === 'string' && textContentSpan != null && textContentSpan.offsetWidth < textContentSpan.scrollWidth) {
      tooltipText = marked(labelContent ?? '', { breaks: true }) as string;
    }
    if (this.props.tooltip !== undefined) {
      if (tooltipText != null) {
        tooltipText += '\n\n';
      } else {
        tooltipText = '';
      }
      tooltipText += marked(getBindableValue(this.props.tooltip) ?? '', { breaks: true }) as string;
    }
    if (tooltipText != null) {
      this.showTooltip(tooltipText);
    }
  };

  private readonly showTooltip = (content: string): void => {
    if (content.trim() !== undefined) {
      clearTimeout(this.tooltipTimeout);
      this.tooltipTimeout = setTimeout(() => {
        const elm: HTMLElement = this.render;
        this.tooltipOverlay = new Overlay({
          background: true,
          closeOnOutsideClick: false,
          referenceElement: elm,
          dimOutside: false,
          removeOtherOverlays: true,
          verticalDirection: this.props.tooltipVerticalDirection != null ? getBindableValue(this.props.tooltipVerticalDirection) : OverlayVerticalDirection.TO_TOP,
          horizontalDirection: this.props.tooltipHorizontalDirection != null ? getBindableValue(this.props.tooltipHorizontalDirection) : OverlayHorizontalDirection.START_TO_RIGHT,
          children: [
            new Card({
              border: false,
              children: [
                new CardBody({
                  body: content
                }).render
              ]
            }).render
          ],
        });
      }, TOOLTIP_DELAY);
    }
  };

  private readonly getClassList = (): string[] => [
    'mynah-button',
    ...(getBindableValue(this.props.primary) === false ? [ 'mynah-button-secondary' ] : []),
    ...(getBindableValue(this.props.border) === true ? [ 'mynah-button-border' ] : []),
    ...([ `fill-state-${getBindableValue(this.props.fillState) ?? 'always'}` ]),
    ...(this.props.status != null ? [ `status-${getBindableValue(this.props.status) ?? ''}` ] : []),
    ...(getBindableValue(this.props.classNames) ?? []),
  ];

  public readonly hideTooltip = (): void => {
    clearTimeout(this.tooltipTimeout);
    if (this.tooltipOverlay !== null) {
      this.tooltipOverlay?.close();
      this.tooltipOverlay = null;
    }
  };

  public readonly update = (newProps: Partial<ButtonProps>): void => {
    let updateClassList = false;
    Object.keys(newProps).forEach((propKey) => {
      const key = propKey as keyof ButtonProps;
      if (key === 'additionalEvents') {
        this.render.update({
          events: {
            ...(getBindableValue(newProps.additionalEvents) ?? {}),
            click: this.handleClick,
            mouseover: this.handleMouseOver,
            mouseleave: this.hideTooltip
          }
        });
      }

      if (key === 'attributes') {
        if (newProps.attributes != null) {
          this.render.update({
            attributes: getBindableValue(newProps.attributes)
          });
        } else if (this.props.attributes != null) {
          const resetAttributes = {};
          Object.assign(resetAttributes, Object.fromEntries(
            Object.keys(this.props.attributes).map(key => [ key, undefined ])
          ));
          this.render.update({
            attributes: resetAttributes
          });
        }
      }

      if (key === 'icon') {
        this.iconWrapper.clear();
        if (newProps.icon != null) {
          this.iconWrapper.update({
            children: [ getBindableValue(newProps.icon) ?? '' ]
          });
        }
      }

      if (key === 'testId') {
        this.render.update({ testId: getBindableValue(newProps.testId) });
      }

      if (key === 'label') {
        this.labelWrapper.clear();
        if (newProps.label != null) {
          this.labelWrapper.update({
            children: [
              ...(this.getButtonLabelDomBuilderObject(getBindableValue(newProps.label))),
            ],
          });
        }
      }

      if (key === 'children') {
        this.childWrapper.clear();
        if (newProps.children != null) {
          this.childWrapper.update({
            children: [
              ...(getBindableValue(newProps.children) ?? []),
            ],
          });
        }
      }

      if (key === 'disabled') {
        if (getBindableValue(newProps.disabled) === true) {
          this.render.setAttribute('disabled', 'disabled');
        } else {
          this.render.removeAttribute('disabled');
        }
      }

      if (key === 'primary' || key === 'border' || key === 'status' || key === 'fillState' || key === 'classNames') {
        updateClassList = true;
      }
    });

    this.props = {
      ...this.props,
      ...newProps
    };

    if (updateClassList) {
      this.render.update({
        classNames: this.getClassList(),
      });
    }
  };
}

export class Button extends ButtonAbstract {
  render: ExtendedHTMLElement;

  constructor (props: ButtonProps) {
    super();
    return (new (Config.getInstance().config.componentClasses.Button ?? ButtonInternal)(props));
  }

  update = (newProps: Partial<ButtonProps>): void => {
  };

  hideTooltip = (): void => {
  };
}
