/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
export interface CardProps extends Partial<DomBuilderObject> {
  border?: boolean;
  background?: boolean;
  padding?: 'small' | 'medium' | 'large' | 'none';
  children?: Array<HTMLElement | ExtendedHTMLElement | string>;
}
export class Card {
  render: ExtendedHTMLElement;
  constructor (props: CardProps) {
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-card',
        `padding-${props.padding ?? 'large'}`,
        props.border !== false ? 'border' : '',
        props.background !== false ? 'background' : '',
        ...(props.classNames ?? [])
      ],
      persistent: props.persistent,
      innerHTML: props.innerHTML,
      children: [
        ...(props.children ?? []),
      ],
      events: props.events,
      attributes: props.attributes
    });
  }
}