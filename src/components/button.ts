/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
export interface ButtonProps {
  classNames?: string[];
  attributes?: Record<string, string>;
  icon?: HTMLElement | ExtendedHTMLElement | string;
  label?: HTMLElement | ExtendedHTMLElement | string;
  children?: Array<HTMLElement | ExtendedHTMLElement | string>;
  primary?: boolean;
  additionalEvents?: Record<string, (event?: any) => any>;
  onClick: (e: Event) => void;
}
export class Button {
  render: ExtendedHTMLElement;
  constructor (props: ButtonProps) {
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
      },
      children: [
        ...(props.icon !== undefined ? [ props.icon ] : []),
        ...(props.label !== undefined ? [ { type: 'span', classNames: [ 'mynah-button-label' ], children: [ props.label ] } ] : []),
        ...(props.children ?? []),
      ],
    });
  }

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
