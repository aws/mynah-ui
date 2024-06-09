/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from './overlay';
import { Card } from './card/card';
import { CardBody } from './card/card-body';
import { Config } from '../helper/config';

const PREVIEW_DELAY = 350;
export interface ButtonProps {
  classNames?: string[];
  attributes?: Record<string, string>;
  icon?: HTMLElement | ExtendedHTMLElement;
  label?: HTMLElement | ExtendedHTMLElement | string;
  tooltip?: string;
  tooltipVerticalDirection?: OverlayVerticalDirection;
  tooltipHorizontalDirection?: OverlayHorizontalDirection;
  children?: Array<HTMLElement | ExtendedHTMLElement | string>;
  primary?: boolean;
  additionalEvents?: Record<string, (event?: any) => any>;
  onClick: (e: Event) => void;
}
export abstract class ButtonAbstract {
  render: ExtendedHTMLElement;
  updateLabel = (label: HTMLElement | ExtendedHTMLElement | string): void => {
  };

  setEnabled = (enabled: boolean): void => {
  };
}

class ButtonInternal extends ButtonAbstract {
  render: ExtendedHTMLElement;
  private buttonTooltip: Overlay | null;
  private buttonTooltipTimeout: ReturnType<typeof setTimeout>;
  constructor (props: ButtonProps) {
    super();
    this.render = DomBuilder.getInstance().build({
      type: 'button',
      classNames: [
        'mynah-button',
        ...(props.primary === false ? [ 'mynah-button-secondary' ] : []),
        ...(props.classNames !== undefined ? props.classNames : []),
      ],
      attributes: { ...props.attributes },
      events: {
        ...props.additionalEvents,
        click: props.onClick,
        ...(props.tooltip != null
          ? {
              mouseover: (e) => {
                const tooltipText = marked(props.tooltip ?? '', { breaks: true }) as string;
                this.showButtonTooltip(tooltipText, props.tooltipVerticalDirection, props.tooltipHorizontalDirection);
              },
              mouseleave: this.hideButtonTooltip
            }
          : {})
      },
      children: [
        ...(props.icon !== undefined ? [ props.icon ] : []),
        ...(props.label !== undefined ? [ { type: 'span', classNames: [ 'mynah-button-label' ], children: [ props.label ] } ] : []),
        ...(props.children ?? []),
      ],
    });
  }

  private readonly showButtonTooltip = (content: string, vDir?: OverlayVerticalDirection, hDir?: OverlayHorizontalDirection): void => {
    if (content.trim() !== undefined) {
      clearTimeout(this.buttonTooltipTimeout);
      this.buttonTooltipTimeout = setTimeout(() => {
        this.buttonTooltip = new Overlay({
          background: true,
          closeOnOutsideClick: false,
          referenceElement: this.render,
          dimOutside: false,
          removeOtherOverlays: true,
          verticalDirection: vDir ?? OverlayVerticalDirection.TO_TOP,
          horizontalDirection: hDir ?? OverlayHorizontalDirection.CENTER,
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
      }, PREVIEW_DELAY);
    }
  };

  public readonly hideButtonTooltip = (): void => {
    clearTimeout(this.buttonTooltipTimeout);
    if (this.buttonTooltip !== null) {
      this.buttonTooltip?.close();
      this.buttonTooltip = null;
    }
  };

  updateLabel = (label: HTMLElement | ExtendedHTMLElement | string): void => {
    (this.render.querySelector('.mynah-button-label') as ExtendedHTMLElement).replaceWith(
      DomBuilder.getInstance().build({ type: 'span', classNames: [ 'mynah-button-label' ], children: [ label ] })
    );
  };

  setEnabled = (enabled: boolean): void => {
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
}
