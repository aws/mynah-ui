/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { fileListToTree } from '../../helper/file-tree';
import { ChatItemTreeView } from './chat-item-tree-view';

export interface ChatItemTreeViewWrapperProps {
  tabId: string;
  messageId: string;
  files: string[];
}

export class ChatItemTreeViewWrapper {
  render: ExtendedHTMLElement;

  constructor (props: ChatItemTreeViewWrapperProps) {
    const tree = new ChatItemTreeView({
      messageId: props.messageId,
      tabId: props.tabId,
      node: fileListToTree(props.files),
    }).render;

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-tree-view-wrapper' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-tree-view-wrapper-container' ],
          children: [
            {
              type: 'div',
              classNames: [ 'mynah-chat-item-tree-view-wrapper-title' ],
              children: [
                {
                  type: 'h4',
                  children: [ `${Config.getInstance().config.texts.codeSuggestions}` ]
                },
                {
                  type: 'span',
                  children: [ `${props.files.length} ${Config.getInstance().config.texts.files}` ]
                },
              ]
            },
            tree,
          ]
        },
        {
          type: 'p',
          children: [ Config.getInstance().config.texts.clickFileToViewDiff ]
        }
      ]
    });
  }
}
