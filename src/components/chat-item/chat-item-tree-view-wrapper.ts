/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import testIds from '../../helper/test-ids';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { fileListToTree } from '../../helper/file-tree';
import { FileNodeAction, ReferenceTrackerInformation, TreeNodeDetails } from '../../static';
import { MynahIcons } from '../icon';
import { ChatItemTreeFile } from './chat-item-tree-file';
import { ChatItemTreeView } from './chat-item-tree-view';
import { ChatItemTreeViewLicense } from './chat-item-tree-view-license';

export interface ChatItemTreeViewWrapperProps {
  tabId: string;
  messageId: string;
  files: string[];
  cardTitle?: string;
  classNames?: string[];
  rootTitle?: string;
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

    const tree = props.files.length === 1 && props.rootTitle == null
      ? new ChatItemTreeFile({
        filePath: props.files[0],
        fileName: props.files[0],
        originalFilePath: props.files[0],
        tabId: props.tabId,
        messageId: props.messageId,
        deleted: props.deletedFiles.includes(props.files[0]),
        details: props.details != null ? props.details[props.files[0]] : undefined,
        actions: props.actions != null ? props.actions[props.files[0]] : undefined,
        icon: MynahIcons.PAPER_CLIP
      }).render
      : new ChatItemTreeView({
        messageId: props.messageId,
        tabId: props.tabId,
        node: fileListToTree(props.files, props.deletedFiles, props.actions, props.details, props.rootTitle),
      }).render;

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.chatItem.fileTree.wrapper,
      classNames: [ 'mynah-chat-item-tree-view-wrapper', ...(props.classNames ?? []) ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-tree-view-wrapper-container' ],
          children: [
            ...(props.cardTitle !== ''
              ? [ {
                  type: 'div',
                  testId: testIds.chatItem.fileTree.title,
                  classNames: [ 'mynah-chat-item-tree-view-wrapper-title' ],
                  children: [
                    {
                      type: 'h4',
                      children: [ `${props.cardTitle ?? Config.getInstance().config.texts.codeSuggestions}` ]
                    },
                    {
                      type: 'span',
                      children: [ `${(props.files?.length ?? 0) + (props.deletedFiles?.length ?? 0)} ${Config.getInstance().config.texts.files}` ]
                    },
                  ]
                } ]
              : []),
            license,
            tree,
          ]
        }
      ]
    });
  }
}
