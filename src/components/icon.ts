/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, DomBuilderObjectFilled, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIIconImporter } from './icon/icon-importer';
import '../styles/components/_icon.scss';
import { getBindableValue, isBindable, MakePropsBindable } from '../helper/bindable';

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
  LIGHT_BULB = 'light-bulb',
  ENVELOPE_SEND = 'envelope-send',
  REFRESH = 'refresh',
  USER = 'user',
  PLAY = 'play',
  PENCIL = 'pencil',
  PAUSE = 'pause',
  CODE_BLOCK = 'code-block',
  COPY = 'copy',
  CURSOR_INSERT = 'cursor-insert',
  TEXT_SELECT = 'text-select',
  REVERT = 'revert',
  ROCKET = 'rocket',
  ASTERISK = 'asterisk',
  BUG = 'bug',
  CHECK_LIST = 'check-list',
  DEPLOY = 'deploy',
  HELP = 'help',
  MESSAGE = 'message',
  TRASH = 'trash',
  TRANSFORM = 'transform',
}

interface IconPropsBindable {
  icon: MynahIcons;
  classNames?: string[];
}

export interface IconProps extends MakePropsBindable<IconPropsBindable> {}

export class Icon {
  render: ExtendedHTMLElement;
  private props: IconProps;
  constructor (props: IconProps) {
    this.props = props;
    Object.entries(this.props).forEach(([ key, value ]) => {
      if (isBindable(value)) {
        value.subscribe((newVal) => {
          this.update({
            [key]: newVal
          });
        });
      }
    });

    MynahUIIconImporter.getInstance();
    this.render = DomBuilder.getInstance().build({
      type: 'i',
      ...this.getIconDomBuilderContent() as Partial<DomBuilderObject>
    });
  }

  private readonly getIconDomBuilderContent = (): DomBuilderObjectFilled => ({
    classNames: [
      'mynah-ui-icon',
      `mynah-ui-icon-${getBindableValue(this.props.icon) ?? ''}`,
      ...(getBindableValue(this.props.classNames) ?? []),
    ],
    children: [ {
      type: 'span',
      attributes: {
        'aria-hidden': 'true'
      },
      children: [ getBindableValue(this.props.icon) ?? '' ]
    } ]
  });

  public readonly update = (newProps: Partial<IconProps>): void => {
    this.props = {
      ...this.props,
      ...newProps
    };
    this.render.update({
      ...this.getIconDomBuilderContent()
    });
  };
}
