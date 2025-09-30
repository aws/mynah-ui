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
import { MynahIcons } from './icon';

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
    console.log('[ModifiedFilesTracker] renderModifiedFiles called with:', JSON.stringify({
      hasFileList: !!fileList,
      filePathsCount: fileList?.filePaths?.length || 0,
      hasButtons: !!(fileList as any)?.buttons,
      buttonsCount: (fileList as any)?.buttons?.length || 0,
      buttons: (fileList as any)?.buttons?.map((b: any) => ({ id: b.id, text: b.text })) || []
    }, null, 2))

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
    const defaultMessageId = 'modified-files-tracker';
    
    // Render the file tree with actions and buttons as provided by the data
    contentWrapper.appendChild(new ChatItemTreeViewWrapper({
      tabId: this.props.tabId,
      messageId: defaultMessageId,
      files: fileList.filePaths ?? [],
      cardTitle: '',
      rootTitle: fileList.rootFolderTitle,
      deletedFiles: fileList.deletedFiles ?? [],
      flatList: fileList.flatList ?? true,
      actions: (fileList as any).actions ?? {},
      details: fileList.details ?? {},
      hideFileCount: fileList.hideFileCount ?? true,
      collapsed: fileList.collapsed ?? false,
      referenceSuggestionLabel: '',
      references: [],
      onRootCollapsedStateChange: () => {}
    }).render);
    
    // Render buttons if they exist
    const buttons = (fileList as any).buttons
    if (buttons && buttons.length > 0) {
      const buttonsWrapper = new ChatItemButtonsWrapper({
        tabId: this.props.tabId,
        buttons: buttons
      })
      contentWrapper.appendChild(buttonsWrapper.render)
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
