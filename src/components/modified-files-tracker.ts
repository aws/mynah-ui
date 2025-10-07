/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { ChatItem, ChatItemContent, ChatItemButton, MynahEventNames } from '../static';
import testIds from '../helper/test-ids';
import { ChatItemTreeViewWrapper } from './chat-item/chat-item-tree-view-wrapper';
import { ChatItemButtonsWrapper } from './chat-item/chat-item-buttons';
import { MynahUIGlobalEvents } from '../helper/events';

export interface ModifiedFilesTrackerProps {
  tabId: string;
  chatItem?: ChatItem;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly collapsibleContent: CollapsibleContent;
  public titleText: string = 'No files modified!';
  private readonly allFiles: Map<string, { fileList: NonNullable<ChatItemContent['fileList']>; messageId: string }> = new Map();

  constructor (props: ModifiedFilesTrackerProps) {
    console.log('[ModifiedFilesTracker] Constructor called with props:', {
      tabId: props.tabId,
      hasChatItem: !(props.chatItem == null),
      chatItem: props.chatItem,
      fileList: props.chatItem?.header?.fileList
    });
    StyleLoader.getInstance().load('components/_modified-files-tracker.scss');
    this.props = props;

    this.collapsibleContent = new CollapsibleContent({
      title: this.titleText,
      initialCollapsedState: true,
      children: [],
      classNames: [ 'mynah-modified-files-tracker' ],
      testId: testIds.modifiedFilesTracker.wrapper
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-tracker-wrapper' ],
      testId: testIds.modifiedFilesTracker.container,
      children: [ this.collapsibleContent.render ],
      attributes: {
        style: 'display: block !important; visibility: visible !important;'
      }
    });

    console.log('[ModifiedFilesTracker] Render element created:', this.render);

    if ((this.props.chatItem?.header?.fileList) != null) {
      console.log('[ModifiedFilesTracker] Rendering modified files with fileList:', this.props.chatItem.header.fileList);
      this.renderModifiedFiles(this.props.chatItem.header.fileList, this.props.chatItem.messageId);
    } else {
      console.log('[ModifiedFilesTracker] No fileList found, rendering empty state');
      this.renderModifiedFiles(null);
    }
  }

  private renderModifiedFiles (fileList: ChatItemContent['fileList'] | null, chatItemMessageId?: string): void {
    const contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
    if (contentWrapper == null) return;

    // Add files to the collection if provided
    if (fileList != null && (fileList.filePaths?.length ?? 0) > 0) {
      const messageId = chatItemMessageId ?? `modified-files-tracker-${this.props.tabId}`;
      this.allFiles.set(messageId, { fileList, messageId });
    }

    // Clear and re-render all files
    contentWrapper.innerHTML = '';

    if (this.allFiles.size > 0) {
      this.renderAllFilePills(contentWrapper);
    } else {
      this.renderEmptyState(contentWrapper);
    }
  }

  private renderEmptyState (contentWrapper: Element): void {
    contentWrapper.appendChild(DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-empty-state' ],
      children: [ 'No modified files' ]
    }));
  }

  private renderAllFilePills (contentWrapper: Element): void {
    this.allFiles.forEach(({ fileList, messageId }) => {
      const { filePaths = [], deletedFiles = [], actions, details, flatList } = fileList;

      // Create a wrapper for each file group
      const fileGroupWrapper = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-group' ],
        children: []
      });

      // Render the file tree with actions and buttons as provided by the data
      fileGroupWrapper.appendChild(new ChatItemTreeViewWrapper({
        tabId: this.props.tabId,
        messageId,
        files: filePaths,
        cardTitle: '',
        rootTitle: fileList.rootFolderTitle,
        deletedFiles,
        flatList,
        actions,
        details,
        hideFileCount: fileList.hideFileCount ?? true,
        collapsed: fileList.collapsed ?? false,
        referenceSuggestionLabel: '',
        references: [],
        onRootCollapsedStateChange: () => {}
      }).render);

      // Render buttons if they exist
      const fileListWithButtons = fileList as ChatItemContent['fileList'] & { buttons?: ChatItemButton[] };
      const buttons: ChatItemButton[] | undefined = fileListWithButtons.buttons;
      if (Array.isArray(buttons) && buttons.length > 0) {
        const buttonsWrapper = new ChatItemButtonsWrapper({
          tabId: this.props.tabId,
          buttons,
          onActionClick: (action: ChatItemButton) => {
            MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
              tabId: this.props.tabId,
              messageId: (action as any).messageId != null ? (action as any).messageId : messageId,
              actionId: action.id,
              actionText: action.text
            });
          }
        });
        fileGroupWrapper.appendChild(buttonsWrapper.render);
      }

      contentWrapper.appendChild(fileGroupWrapper);
    });
  }

  public addChatItem (chatItem: ChatItem): void {
    if (chatItem.header?.fileList != null) {
      this.renderModifiedFiles(chatItem.header.fileList, chatItem.messageId);
    }
  }

  public setVisible (visible: boolean): void {
    // No-op: component is always visible
  }
}
