/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable @typescript-eslint/restrict-template-expressions
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { Status } from '../static';
import { Icon, MynahIcons, MynahIconsType } from './icon';

interface TitleDescriptionWithIconProps {
  title?: string | ExtendedHTMLElement | HTMLElement | DomBuilderObject;
  description?: string | ExtendedHTMLElement | HTMLElement | DomBuilderObject;
  icon?: MynahIcons | MynahIconsType;
  status?: Status;
  testId?: string;
  classNames?: string[];
}
export class TitleDescriptionWithIcon {
  render: ExtendedHTMLElement;
  private readonly iconElement: ExtendedHTMLElement;
  private readonly props: TitleDescriptionWithIconProps;
  constructor (props: TitleDescriptionWithIconProps) {
    StyleLoader.getInstance().load('components/_title-description-icon.scss');
    this.props = props;

    this.iconElement = DomBuilder.getInstance().build({
      type: 'div',
      testId: `${props.testId ?? ''}-icon`,
      classNames: [ 'mynah-ui-title-description-icon-icon' ],
      children: [ new Icon({
        icon: this.props.icon ?? 'asterisk'
      }).render ]
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: props.testId,
      classNames: [ 'mynah-ui-title-description-icon-wrapper', ...(this.props.classNames ?? []) ],
      children: [
        ...(this.props.icon !== undefined
          ? [ this.iconElement ]
          : []),
        ...(this.props.title !== undefined
          ? [ {
              type: 'div',
              testId: `${props.testId ?? ''}-title`,
              classNames: [ 'mynah-ui-title-description-icon-title' ],
              children: [ this.props.title ]
            } ]
          : []),
        ...(this.props.description !== undefined
          ? [ {
              type: 'div',
              testId: `${props.testId ?? ''}-description`,
              classNames: [ 'mynah-ui-title-description-icon-description' ],
              children: [ this.props.description ]
            } ]
          : [])
      ]
    }); ;
  }

  public readonly update = (props: TitleDescriptionWithIconProps): void => {
    // TODO Add each element in the component to be udpated.
    if (props.icon != null) {
      this.iconElement.update({
        children: [ new Icon({
          icon: props.icon
        }).render ]
      });
    }
  };
}
