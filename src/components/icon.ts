/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIIconImporter } from './icon/icon-importer';
import '../styles/components/_icon.scss';
import { Status } from '../static';

export enum MynahIcons {
  Q = 'q',
  MENU = 'menu',
  MINUS = 'minus',
  SEARCH = 'search',
  PLUS = 'plus',
  PAPER_CLIP = 'paper-clip',
  LIST_ADD = 'list-add',
  TABS = 'tabs',
  CHAT = 'chat',
  LINK = 'link',
  FOLDER = 'folder',
  FILE = 'file',
  FLASH = 'flash',
  DOC = 'doc',
  EXTERNAL = 'external',
  CANCEL = 'cancel',
  CANCEL_CIRCLE = 'cancel-circle',
  CALENDAR = 'calendar',
  COMMENT = 'comment',
  MEGAPHONE = 'megaphone',
  MAGIC = 'magic',
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
  STACK = 'stack',
  LIGHT_BULB = 'light-bulb',
  ENVELOPE_SEND = 'envelope-send',
  ENTER = 'enter',
  REFRESH = 'refresh',
  PROGRESS = 'progress',
  SCROLL_DOWN = 'scroll-down',
  USER = 'user',
  PLAY = 'play',
  PAUSE = 'pause',
  STOP = 'stop',
  PENCIL = 'pencil',
  CODE_BLOCK = 'code-block',
  COPY = 'copy',
  CURSOR_INSERT = 'cursor-insert',
  TEXT_SELECT = 'text-select',
  REVERT = 'revert',
  UNDO = 'undo',
  ROCKET = 'rocket',
  ASTERISK = 'asterisk',
  BUG = 'bug',
  CHECK_LIST = 'check-list',
  DEPLOY = 'deploy',
  SHELL = 'shell',
  HELP = 'help',
  MESSAGE = 'message',
  TRASH = 'trash',
  TRANSFORM = 'transform',
  HISTORY = 'history'
}

export type MynahIconsType = `${MynahIcons}`;

export interface IconProps {
  icon: MynahIcons | MynahIconsType;
  subtract?: boolean;
  classNames?: string[];
  status?: Status;
}
export class Icon {
  render: ExtendedHTMLElement;
  constructor (props: IconProps) {
    MynahUIIconImporter.getInstance();
    this.render = DomBuilder.getInstance().build({
      type: 'i',
      classNames: [
        'mynah-ui-icon',
                `mynah-ui-icon-${props.icon}${props.subtract === true ? '-subtract' : ''}`,
                ...(props.status !== undefined ? [ `status-${props.status}` ] : []),
                ...(props.classNames !== undefined ? props.classNames : []),
      ]
    });
  }
}
