/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable @typescript-eslint/restrict-template-expressions
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../helper/dom';
import { Icon, MynahIcons } from './icon';
import '../styles/components/_title-description-icon.scss';

interface TitleDescriptionWithIconProps {
  title?: string | ExtendedHTMLElement | HTMLElement | DomBuilderObject;
  testIds?: {
    icon?: string;
    title?: string;
    description?: string;
  };
  description?: string | ExtendedHTMLElement | HTMLElement | DomBuilderObject;
  icon?: MynahIcons;
  testId?: string;
  classNames?: string[];
}
export class TitleDescriptionWithIcon {
  render: ExtendedHTMLElement;
  private readonly props: TitleDescriptionWithIconProps;
  constructor (props: TitleDescriptionWithIconProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: props.testId,
      classNames: [ 'mynah-ui-title-description-icon-wrapper', ...(this.props.classNames ?? []) ],
      children: [
        ...(this.props.icon !== undefined
          ? [ {
              type: 'div',
              testId: props.testIds?.icon,
              classNames: [ 'mynah-ui-title-description-icon-icon' ],
              children: [ new Icon({
                icon: this.props.icon
              }).render ]
            } ]
          : []),
        ...(this.props.title !== undefined
          ? [ {
              type: 'div',
              testId: props.testIds?.title,
              classNames: [ 'mynah-ui-title-description-icon-title' ],
              children: [ this.props.title ]
            } ]
          : []),
        ...(this.props.description !== undefined
          ? [ {
              type: 'div',
              testId: props.testIds?.description,
              classNames: [ 'mynah-ui-title-description-icon-description' ],
              children: [ this.props.description ]
            } ]
          : [])
      ]
    }); ;
  }
}
