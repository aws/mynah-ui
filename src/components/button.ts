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

const TOOLTIP_DELAY = 350;
export interface ButtonProps {
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
  status?: 'main' | 'primary' | 'info' | 'success' | 'warning' | 'error' | 'clear';
  additionalEvents?: Partial<Record<GenericEvents, DomBuilderEventHandler | DomBuilderEventHandlerWithOptions>>;
  onClick: (e: Event) => void;
  onHover?: (e: Event) => void;
}
export abstract class ButtonAbstract {
  render: ExtendedHTMLElement;
  updateLabel = (label: HTMLElement | ExtendedHTMLElement | string): void => {
  };

  setEnabled = (enabled: boolean): void => {
  };

  hideTooltip = (): void => {
  };
}

class ButtonInternal extends ButtonAbstract {
  render: ExtendedHTMLElement;
  private readonly props: ButtonProps;
  private tooltipOverlay: Overlay | null;
  private tooltipTimeout: ReturnType<typeof setTimeout>;
  constructor (props: ButtonProps) {
    super();
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'button',
      classNames: [
        'mynah-button',
        ...(props.primary === false ? [ 'mynah-button-secondary' ] : []),
        ...(props.border === true ? [ 'mynah-button-border' ] : []),
        ...(props.status != null ? [ `status-${props.status}` ] : []),
        ...(props.classNames !== undefined ? props.classNames : []),
      ],
      testId: props.testId,
      attributes: {
        ...(props.disabled === true ? { disabled: 'disabled' } : {}),
        tabindex: '0',
        ...props.attributes,
      },
      events: {
        ...props.additionalEvents,
        click: (e) => {
          this.hideTooltip();
          if (this.props.disabled !== true) {
            props.onClick(e);
          }
        },
        mouseover: (e) => {
          cancelEvent(e);
          if (this.props.onHover != null) {
            this.props.onHover(e);
          }
          const textContentSpan: HTMLSpanElement | null = this.render.querySelector('.mynah-button-label');
          let tooltipText;
          if (props.label != null && typeof props.label === 'string' && textContentSpan != null && textContentSpan.offsetWidth < textContentSpan.scrollWidth) {
            tooltipText = marked(props.label ?? '', { breaks: true }) as string;
          }
          if (props.tooltip !== undefined) {
            if (tooltipText != null) {
              tooltipText += '\n\n';
            } else {
              tooltipText = '';
            }
            tooltipText += marked(props.tooltip ?? '', { breaks: true }) as string;
          }
          if (tooltipText != null) {
            this.showTooltip(tooltipText);
          }
        },
        mouseleave: this.hideTooltip
      },
      children: [
        ...(props.icon !== undefined ? [ props.icon ] : []),
        ...(this.getButtonLabelDomBuilderObject(props.label)),
        ...(props.children ?? []),
      ],
    });
  }

  private readonly getButtonLabelDomBuilderObject = (label?: HTMLElement | ExtendedHTMLElement | string): DomBuilderObject[] => {
    if (label !== undefined) {
      if (typeof label !== 'string') {
        return [ { type: 'span', classNames: [ 'mynah-button-label' ], children: [ label ] } ];
      } else {
        return [ { type: 'span', classNames: [ 'mynah-button-label' ], innerHTML: marked.parseInline(escapeHTML(label)) as string } ];
      }
    }
    return [];
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
          verticalDirection: this.props.tooltipVerticalDirection ?? OverlayVerticalDirection.TO_TOP,
          horizontalDirection: this.props.tooltipHorizontalDirection ?? OverlayHorizontalDirection.START_TO_RIGHT,
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

  public readonly hideTooltip = (): void => {
    clearTimeout(this.tooltipTimeout);
    if (this.tooltipOverlay !== null) {
      this.tooltipOverlay?.close();
      this.tooltipOverlay = null;
    }
  };

  public readonly updateLabel = (label: HTMLElement | ExtendedHTMLElement | string): void => {
    (this.render.querySelector('.mynah-button-label') as ExtendedHTMLElement).replaceWith(
      DomBuilder.getInstance().build(this.getButtonLabelDomBuilderObject(label)[0])
    );
  };

  public readonly setEnabled = (enabled: boolean): void => {
    this.props.disabled = !enabled;
    if (enabled) {
      this.render.removeAttribute('disabled');
    } else {
      this.render.setAttribute('disabled', 'disabled');
    }
  };
}

export class Button extends ButtonAbstract {
  render: ExtendedHTMLElement;

  constructor (props: ButtonProps) {
    super();
    return (new (Config.getInstance().config.componentClasses.Button ?? ButtonInternal)(props));
  }

  updateLabel = (label: HTMLElement | ExtendedHTMLElement | string): void => {
  };

  setEnabled = (enabled: boolean): void => {
  };

  hideTooltip = (): void => {
  };
}
