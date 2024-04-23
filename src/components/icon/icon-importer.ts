/* eslint-disable @typescript-eslint/no-extraneous-class */
/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder } from '../../helper/dom';
import { MynahIcons } from '../icon';
// ICONS
import MYNAH from './icons/mynah.svg';
import MENU from './icons/menu.svg';
import MINUS from './icons/minus.svg';
import SEARCH from './icons/search.svg';
import PLUS from './icons/plus.svg';
import PAPER_CLIP from './icons/paper-clip.svg';
import LIST_ADD from './icons/list-add.svg';
import TABS from './icons/tabs.svg';
import PENCIL from './icons/pencil.svg';
import CHAT from './icons/chat.svg';
import COMMENT from './icons/comment.svg';
import LINK from './icons/link.svg';
import DOC from './icons/doc.svg';
import EXTERNAL from './icons/external.svg';
import CANCEL from './icons/cancel.svg';
import CANCEL_CIRCLE from './icons/cancel-circle.svg';
import CALENDAR from './icons/calendar.svg';
import MEGAPHONE from './icons/megaphone.svg';
import NOTIFICATION from './icons/notification.svg';
import EYE from './icons/eye.svg';
import ELLIPSIS from './icons/ellipsis.svg';
import OK from './icons/ok.svg';
import UP_OPEN from './icons/up-open.svg';
import DOWN_OPEN from './icons/down-open.svg';
import RIGHT_OPEN from './icons/right-open.svg';
import LEFT_OPEN from './icons/left-open.svg';
import RESIZE_FULL from './icons/resize-full.svg';
import RESIZE_SMALL from './icons/resize-small.svg';
import BLOCK from './icons/block.svg';
import OK_CIRCLED from './icons/ok-circled.svg';
import INFO from './icons/info.svg';
import WARNING from './icons/warning.svg';
import ERROR from './icons/error.svg';
import THUMBS_UP from './icons/thumbs-up.svg';
import THUMBS_DOWN from './icons/thumbs-down.svg';
import STAR from './icons/star.svg';
import LIGHT_BULB from './icons/light-bulb.svg';
import ENVELOPE_SEND from './icons/envelope-send.svg';
import REFRESH from './icons/refresh.svg';
import USER from './icons/user.svg';
import PLAY from './icons/play.svg';
import PAUSE from './icons/pause.svg';
import CODE_BLOCK from './icons/code-block.svg';
import COPY from './icons/copy.svg';
import CURSOR_INSERT from './icons/cursor-insert.svg';
import TEXT_SELECT from './icons/text-select.svg';
import REVERT from './icons/revert.svg';
import ASTERISK from './icons/asterisk.svg';

export class MynahUIIconImporter {
  private static instance: MynahUIIconImporter;
  private constructor () {
    const mynahIconMappings = {
      MYNAH,
      MENU,
      MINUS,
      SEARCH,
      PLUS,
      PAPER_CLIP,
      LIST_ADD,
      TABS,
      PENCIL,
      CHAT,
      LINK,
      DOC,
      EXTERNAL,
      CANCEL,
      CANCEL_CIRCLE,
      CALENDAR,
      COMMENT,
      MEGAPHONE,
      NOTIFICATION,
      EYE,
      ELLIPSIS,
      OK,
      UP_OPEN,
      DOWN_OPEN,
      RIGHT_OPEN,
      LEFT_OPEN,
      RESIZE_FULL,
      RESIZE_SMALL,
      BLOCK,
      OK_CIRCLED,
      INFO,
      WARNING,
      ERROR,
      THUMBS_UP,
      THUMBS_DOWN,
      STAR,
      LIGHT_BULB,
      ENVELOPE_SEND,
      REFRESH,
      USER,
      PLAY,
      PAUSE,
      CODE_BLOCK,
      COPY,
      CURSOR_INSERT,
      TEXT_SELECT,
      REVERT,
      ASTERISK
    };
    DomBuilder.getInstance().createPortal('mynah-ui-icons', {
      type: 'style',
      attributes: {
        type: 'text/css'
      },
      children: [ `
      ${Object.keys(MynahIcons).map(iconKey => {
        const iconName = MynahIcons[iconKey as keyof typeof MynahIcons];
        return `
        :root{
          --mynah-ui-icon-${iconName}: url(${mynahIconMappings[iconKey as keyof typeof mynahIconMappings]});
        }
        .mynah-ui-icon-${iconName} {
          -webkit-mask-image: var(--mynah-ui-icon-${iconName});
          mask-image: var(--mynah-ui-icon-${iconName});
        }`;
      }).join('')}
      ` ]
    }, 'beforebegin');
  }

  public static getInstance = (): MynahUIIconImporter => {
    if (MynahUIIconImporter.instance === undefined) {
      MynahUIIconImporter.instance = new MynahUIIconImporter();
    }

    return MynahUIIconImporter.instance;
  };
}
