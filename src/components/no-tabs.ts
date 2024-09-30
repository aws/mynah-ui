/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import { Config } from '../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { cancelEvent } from '../helper/events';
import { MynahUITabsStore } from '../helper/tabs-store';
import { Button } from './button';
import { Icon, MynahIcons } from './icon';
import '../styles/components/_no-tabs.scss';
import testIds from '../helper/test-ids';

export class NoTabs {
  render: ExtendedHTMLElement;
  constructor () {
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.noTabs.wrapper,
      persistent: true,
      classNames: [ 'mynah-no-tabs-wrapper', ...(MynahUITabsStore.getInstance().tabsLength() > 0 ? [ 'hidden' ] : []) ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-no-tabs-icon-wrapper' ],
          children: [
            new Icon({ icon: MynahIcons.TABS }).render
          ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-no-tabs-info' ],
          innerHTML: marked(Config.getInstance().config.texts.noTabsOpen ?? '', { breaks: true }) as string
        },
        {
          type: 'div',
          classNames: [ 'mynah-no-tabs-buttons-wrapper' ],
          children: [
            new Button({
              testId: testIds.noTabs.newTabButton,
              onClick: (e) => {
                cancelEvent(e);
                if (MynahUITabsStore.getInstance().tabsLength() < Config.getInstance().config.maxTabs) {
                  MynahUITabsStore.getInstance().addTab();
                }
              },
              icon: new Icon({ icon: MynahIcons.PLUS }).render,
              label: Config.getInstance().config.texts.openNewTab
            }).render
          ]
        }
      ],
    });

    MynahUITabsStore.getInstance().addListener('add', () => {
      this.render.addClass('hidden');
    });

    MynahUITabsStore.getInstance().addListener('remove', () => {
      if (MynahUITabsStore.getInstance().tabsLength() === 0) {
        this.render.removeClass('hidden');
      }
    });
  }
}
