/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { fileListToTree } from '../../helper/file-tree';
import { FileNodeAction, ReferenceTrackerInformation, TreeNodeDetails } from '../../static';
import { ChatItemTreeView } from './chat-item-tree-view';
import { ChatItemTreeViewLicense } from './chat-item-tree-view-license';

export interface ChatItemTreeViewWrapperProps {
  tabId: string;
  messageId: string;
  files: string[];
  deletedFiles: string[];
  actions?: Record<string, FileNodeAction[]>;
  details?: Record<string, TreeNodeDetails>;
  referenceSuggestionLabel: string;
  references: ReferenceTrackerInformation[];
}

export class ChatItemTreeViewWrapper {
  render: ExtendedHTMLElement;

  constructor (props: ChatItemTreeViewWrapperProps) {
    const license = new ChatItemTreeViewLicense({
      referenceSuggestionLabel: props.referenceSuggestionLabel,
      references: props.references
    }).render;

    const tree = new ChatItemTreeView({
      messageId: props.messageId,
      tabId: props.tabId,
      node: fileListToTree(props.files, props.deletedFiles, props.actions, props.details),
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
                  children: [ `${(props.files?.length ?? 0) + (props.deletedFiles?.length ?? 0)} ${Config.getInstance().config.texts.files}` ]
                },
              ]
            },
            license,
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
