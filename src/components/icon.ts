/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIIconImporter } from './icon/icon-importer';

export enum MynahIcons {
  MYNAH = 'mynah',
  MENU = 'menu',
  MINUS = 'minus',
  SEARCH = 'search',
  PLUS = 'plus',
  CHAT = 'chat',
  LINK = 'link',
  EXTERNAL = 'external',
  CANCEL = 'cancel',
  CALENDAR = 'calendar',
  MEGAPHONE = 'megaphone',
  NOTIFICATION = 'notification',
  EYE = 'eye',
  ELLIPSIS = 'ellipsis',
  OK = 'ok',
  UP_OPEN = 'up-open',
  DOWN_OPEN = 'down-open',
  RIGHT_OPEN = 'right-open',
  LEFT_OPEN = 'left-open',
  RESIZE_FULL = 'resize-full',
  RESIZE_SMALL = 'resize-small',
  BLOCK = 'block',
  OK_CIRCLED = 'ok-circled',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  THUMBS_UP = 'thumbs-up',
  THUMBS_DOWN = 'thumbs-down',
  STAR = 'star',
  LIGHT_BULB = 'light-bulb',
  ENVELOPE_SEND = 'envelope-send',
  REFRESH = 'refresh',
  USER = 'user',
  PLAY = 'play',
  PAUSE = 'pause',
  CODE_BLOCK = 'code-block',
  COPY = 'copy',
  CURSOR_INSERT = 'cursor-insert',
  TEXT_SELECT = 'text-select',
  REVERT = 'revert',
}

export interface IconProps {
  icon: MynahIcons;
  classNames?: string[];
}
export class Icon {
  render: ExtendedHTMLElement;
  constructor (props: IconProps) {
    MynahUIIconImporter.getInstance();
    this.render = DomBuilder.getInstance().build({
      type: 'i',
      classNames: [
        'mynah-ui-icon',
                `mynah-ui-icon-${props.icon}`,
                ...(props.classNames !== undefined ? props.classNames : []),
      ],
    });
  }
}
