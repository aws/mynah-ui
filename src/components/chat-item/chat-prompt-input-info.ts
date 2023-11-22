/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { CardBody } from '../card/card-body';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahEventNames } from '../../static';

export interface ChatPromptInputInfoProps{
  tabId: string;
}
export class ChatPromptInputInfo {
  render: ExtendedHTMLElement;
  constructor (props: ChatPromptInputInfoProps) {
    // revert back if the extension is set before (because it only works globally)
    marked.use({
      extensions: [ {
        name: 'text',
        renderer: (token) => {
          return token.text;
        }
      } ]
    });
    MynahUITabsStore.getInstance().addListenerToDataStore(props.tabId, 'promptInputInfo', (newInfo) => {
      this.render.update({
        children: [
          new CardBody({
            onLinkClick: this.linkClick,
            body: MynahUITabsStore.getInstance().getTabDataStore(props.tabId)?.getValue('promptInputInfo') ?? ''
          }).render
        ]
      });
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-input-info' ],
      children: [
        new CardBody({
          onLinkClick: this.linkClick,
          body: MynahUITabsStore.getInstance().getTabDataStore(props.tabId)?.getValue('promptInputInfo') ?? ''
        }).render
      ]
    });
  }

  private readonly linkClick = (url: string, e: MouseEvent): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.INFO_LINK_CLICK, {
      link: url,
      event: e,
    });
  };
}
