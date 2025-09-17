/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { MynahUIGlobalEvents } from '../helper/events';
import { MynahEventNames, ChatItem } from '../static';
import { Button } from './button';
import { Icon } from './icon';
import testIds from '../helper/test-ids';
import { MynahUITabsStore } from '../helper/tabs-store';

export interface ModifiedFilesTrackerProps {
  tabId: string;
  visible?: boolean;
  chatItem?: ChatItem;
  onFileClick?: (filePath: string) => void;
  onUndoFile?: (filePath: string, toolUseId?: string) => void;
  onUndoAll?: () => void;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly collapsibleContent: CollapsibleContent;
  public titleText: string = 'Modified Files';
  private readonly trackedFiles: Map<string, { path: string; type: string; fullPath?: string; toolUseId?: string; label?: string; iconStatus?: string }> = new Map();
  private workInProgress: boolean = false;

  constructor (props: ModifiedFilesTrackerProps) {
    StyleLoader.getInstance().load('components/_modified-files-tracker.scss');
    this.props = { visible: true, ...props };

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

    // Subscribe to loading state like ChatItemCard does
    MynahUITabsStore.getInstance()
      .getTabDataStore(this.props.tabId)
      .subscribe('loadingChat', (isLoading: boolean) => {
        this.setWorkInProgress(isLoading);
      });

    // Subscribe to chat items updates like ChatItemCard does
    MynahUITabsStore.getInstance()
      .getTabDataStore(this.props.tabId)
      .subscribe('chatItems', (chatItems: ChatItem[]) => {
        this.processLatestChatItems(chatItems);
      });

    this.updateContent();
  }

  private updateContent (): void {
    const contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
    if (contentWrapper != null) {
      contentWrapper.innerHTML = '';
    }

    if (this.trackedFiles.size === 0) {
      const emptyState = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-empty-state' ],
        children: [ 'No modified files' ]
      });
      contentWrapper?.appendChild(emptyState);
    } else {
      const filePillsContainer = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-list' ],
        events: {
          click: (event: Event) => {
            event.stopPropagation();
          }
        },
        children: this.createFilePills()
      });
      contentWrapper?.appendChild(filePillsContainer);
    }

    this.updateTitle();
  }

  private createFilePills (): any[] {
    const fileRows: any[] = [];

    this.trackedFiles.forEach((file) => {
      const fileName = file.path.split('/').pop() ?? file.path;

      // Get icon based on status like sampleProgressiveFileList
      let icon = 'file';
      let iconStatus = 'none';
      if (file.type === 'working') {
        icon = 'progress';
        iconStatus = 'info';
      } else if (file.type === 'done') {
        icon = 'ok-circled';
        iconStatus = 'success';
      } else if (file.type === 'failed') {
        icon = 'cancel-circle';
        iconStatus = 'error';
      }

      fileRows.push({
        type: 'div',
        classNames: [ 'mynah-modified-files-row' ],
        events: {
          click: (event: Event) => {
            event.stopPropagation();
          }
        },
        children: [
          new Icon({ icon, status: iconStatus }).render,
          {
            type: 'span',
            classNames: [ 'mynah-modified-files-filename' ],
            children: [ fileName ],
            events: {
              click: (event: Event) => {
                event.stopPropagation();
                if (this.props.onFileClick != null) {
                  this.props.onFileClick(file.path);
                } else {
                  MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_CLICK, {
                    tabId: this.props.tabId,
                    messageId: 'modified-files-tracker',
                    filePath: file.path,
                    deleted: file.type === 'deleted'
                  });
                }
              }
            }
          },
          {
            type: 'span',
            classNames: [ 'mynah-modified-files-status' ],
            children: [ file.label ?? file.type ]
          },
          new Button({
            icon: new Icon({ icon: 'undo' }).render,
            status: 'clear',
            primary: false,
            classNames: [ 'mynah-modified-files-undo-button' ],
            onClick: () => {
              if (this.props.onUndoFile != null) {
                this.props.onUndoFile(file.path, file.toolUseId);
              }
              this.removeFile(file.path);
            }
          }).render
        ]
      });
    });

    return fileRows;
  }

  public updateChatItem (chatItem: ChatItem): void {
    console.log('[ModifiedFilesTracker] updateChatItem called with:', chatItem);
    this.props.chatItem = chatItem;
    this.extractFilesFromChatItem(chatItem);
    this.updateContent();
  }

  private processLatestChatItems (chatItems: ChatItem[]): void {
    // Only process the latest non-streaming chat item with files
    const latestChatItem = chatItems
      .filter(item => item.type !== 'answer-stream' && (((item.header?.fileList) != null) || item.fileList))
      .pop();

    if (latestChatItem != null) {
      // Clear existing files and add new ones to prevent duplicates
      this.clearFiles();
      this.extractFilesFromChatItem(latestChatItem);
      this.updateContent();
    }
  }

  private extractFilesFromChatItem (chatItem: ChatItem): void {
    // Extract files from header.fileList (like ChatItemCard does)
    if ((chatItem.header?.fileList?.filePaths) != null) {
      chatItem.header.fileList.filePaths.forEach(filePath => {
        const details = chatItem.header?.fileList?.details?.[filePath];
        const status = details?.icon === 'progress'
          ? 'working'
          : details?.icon === 'ok-circled'
            ? 'done'
            : details?.icon === 'cancel-circle' ? 'failed' : 'modified';

        this.addFileWithDetails(filePath, status, details?.label, details?.iconForegroundStatus);
      });
    }

    // Extract files from main fileList (like ChatItemCard does)
    if ((chatItem.fileList?.filePaths) != null) {
      chatItem.fileList.filePaths.forEach(filePath => {
        const details = chatItem.fileList?.details?.[filePath];
        const status = details?.icon === 'progress'
          ? 'working'
          : details?.icon === 'ok-circled'
            ? 'done'
            : details?.icon === 'cancel-circle'
              ? 'failed'
              : (chatItem.fileList?.deletedFiles?.includes(filePath) === true) ? 'deleted' : 'modified';

        this.addFileWithDetails(filePath, status, details?.label, details?.iconForegroundStatus);
      });
    }
  }

  public setVisible (visible: boolean): void {
    if (visible) {
      this.render.removeClass('hidden');
    } else {
      this.render.addClass('hidden');
    }
  }

  public addFile (filePath: string, fileType: string = 'modified', fullPath?: string, toolUseId?: string): void {
    this.trackedFiles.set(filePath, {
      path: filePath,
      type: fileType,
      fullPath,
      toolUseId
    });
    this.updateContent();
  }

  private addFileWithDetails (filePath: string, status: string, label?: string, iconStatus?: string): void {
    this.trackedFiles.set(filePath, {
      path: filePath,
      type: status,
      label,
      iconStatus
    });
  }

  public removeFile (filePath: string): void {
    this.trackedFiles.delete(filePath);
    this.updateContent();
  }

  public setWorkInProgress (inProgress: boolean): void {
    this.workInProgress = inProgress;
    this.updateTitle();
  }

  public clearFiles (): void {
    this.trackedFiles.clear();
    this.updateContent();
  }

  public getTrackedFiles (): Array<{ path: string; type: string; fullPath?: string; toolUseId?: string; label?: string; iconStatus?: string }> {
    return Array.from(this.trackedFiles.values());
  }

  public getModifiedFiles (): string[] {
    return Array.from(this.trackedFiles.values())
      .filter(file => file.type !== 'deleted')
      .map(file => file.path);
  }

  private updateTitle (): void {
    const fileCount = this.trackedFiles.size;
    const title = fileCount > 0 ? `Modified Files (${fileCount})` : 'Modified Files';

    if (this.collapsibleContent.updateTitle != null) {
      this.collapsibleContent.updateTitle(this.workInProgress ? `${title} - Working...` : title);
    }
  }
}
