/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { ChatItemContent, MynahEventNames } from '../static';
import testIds from '../helper/test-ids';
import { MynahUITabsStore } from '../helper/tabs-store';
import { MynahUIGlobalEvents } from '../helper/events';
import { ChatItemTreeViewWrapper } from './chat-item/chat-item-tree-view-wrapper';
import { ChatItemButtonsWrapper } from './chat-item/chat-item-buttons';

export interface ModifiedFilesTrackerProps {
  tabId: string;
  visible?: boolean;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly collapsibleContent: CollapsibleContent;
  public titleText: string = 'No files modified!';

  constructor (props: ModifiedFilesTrackerProps) {
    StyleLoader.getInstance().load('components/_modified-files-tracker.scss');
    this.props = { visible: false, ...props };

    this.collapsibleContent = new CollapsibleContent({
      title: this.titleText,
      initialCollapsedState: true,
      children: [],
      classNames: [ 'mynah-modified-files-tracker' ],
      testId: testIds.modifiedFilesTracker.wrapper
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-modified-files-tracker-wrapper',
        ...(this.props.visible === true ? [] : [ 'hidden' ])
      ],
      testId: testIds.modifiedFilesTracker.container,
      children: [ this.collapsibleContent.render ]
    });

    const tabDataStore = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId);

    tabDataStore.subscribe('modifiedFilesList', (fileList: ChatItemContent['fileList'] | null) => {
      this.renderModifiedFiles(fileList);
    });

    tabDataStore.subscribe('newConversation', (newValue: boolean) => {
      if (newValue) {
        this.clearContent();
      }
    });

    tabDataStore.subscribe('modifiedFilesTitle', (newTitle: string) => {
      if (newTitle !== '') {
        this.collapsibleContent.updateTitle(newTitle);
      }
    });

    this.renderModifiedFiles(tabDataStore.getValue('modifiedFilesList'));
  }

  private clearContent (): void {
    const contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
    if (contentWrapper != null) {
      contentWrapper.innerHTML = '';
    }
  }

  private renderModifiedFiles (fileList: ChatItemContent['fileList'] | null): void {
    console.log('[ModifiedFilesTracker] 📥 Received fileList:', {
      filePaths: fileList?.filePaths,
      details: fileList?.details,
      hasDetails: !((fileList?.details) == null)
    });

    // Log each file's details to verify fullPath preservation
    if ((fileList?.details) != null) {
      Object.entries(fileList.details).forEach(([ filePath, details ]) => {
        console.log('[ModifiedFilesTracker] 🔍 File details - filePath:', filePath, 'fullPath:', details?.data?.fullPath, 'messageId:', details?.data?.messageId);
      });
    }

    const contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
    if (contentWrapper == null) return;

    contentWrapper.innerHTML = '';

    if ((fileList?.filePaths?.length ?? 0) > 0 && fileList != null) {
      this.renderFilePills(contentWrapper, fileList);
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

  private renderFilePills (contentWrapper: Element, fileList: NonNullable<ChatItemContent['fileList']>): void {
    // Use a default messageId for the wrapper, individual files will use their own messageIds from details
    const defaultMessageId = 'modified-files-tracker';

    console.log('[ModifiedFilesTracker] 🎯 Creating ChatItemTreeViewWrapper with:', {
      tabId: this.props.tabId,
      messageId: defaultMessageId,
      filesCount: fileList.filePaths?.length,
      detailsKeys: Object.keys(fileList.details ?? {}),
      actionsKeys: Object.keys(fileList.actions ?? {})
    });

    contentWrapper.appendChild(new ChatItemTreeViewWrapper({
      tabId: this.props.tabId,
      messageId: defaultMessageId,
      files: fileList.filePaths ?? [],
      cardTitle: '',
      rootTitle: fileList.rootFolderTitle,
      deletedFiles: fileList.deletedFiles ?? [],
      flatList: fileList.flatList ?? true,
      actions: fileList.actions,
      details: fileList.details ?? {},
      hideFileCount: fileList.hideFileCount ?? true,
      collapsed: fileList.collapsed ?? false,
      referenceSuggestionLabel: '',
      references: [],
      onRootCollapsedStateChange: () => {}
    }).render);

    const undoButtons = (fileList as { undoButtons?: Array<{ id: string; text: string; status?: string }> }).undoButtons;
    if ((undoButtons?.length ?? 0) > 0 && undoButtons != null) {
      // Extract the actual messageId from the first file's details for undo-all buttons
      const firstFileDetails = Object.values(fileList.details ?? {})[0];
      const actualMessageId = firstFileDetails?.data?.messageId ?? defaultMessageId;

      contentWrapper.appendChild(new ChatItemButtonsWrapper({
        tabId: this.props.tabId,
        buttons: undoButtons.map(button => ({
          id: button.id,
          text: button.text,
          status: (button.status ?? 'clear') as 'clear' | 'main' | 'primary' | 'dimmed-clear'
        })),
        onActionClick: (action) => {
          console.log('[ModifiedFilesTracker] Button clicked:', {
            tabId: this.props.tabId,
            messageId: actualMessageId,
            actionId: action.id,
            actionText: action.text
          });
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
            tabId: this.props.tabId,
            messageId: actualMessageId,
            actionId: action.id,
            actionText: action.text
          });
        }
      }).render);
    }
  }

  public setVisible (visible: boolean): void {
    if (visible) {
      this.render.removeClass('hidden');
    } else {
      this.render.addClass('hidden');
    }
  }
}
