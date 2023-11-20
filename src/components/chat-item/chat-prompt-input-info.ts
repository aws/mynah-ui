/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUITabsStore } from '../../helper/tabs-store';

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
        innerHTML: marked.parse(newInfo, { breaks: true })
      });
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-chat-prompt-input-info' ],
      innerHTML: marked.parse(MynahUITabsStore.getInstance().getTabDataStore(props.tabId)?.getValue('promptInputInfo') ?? '', { breaks: true })
    });
  }
}
