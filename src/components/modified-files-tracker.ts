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

    MynahUITabsStore.getInstance()
      .getTabDataStore(this.props.tabId)
      .subscribe('loadingChat', (isLoading: boolean) => {
        this.setWorkInProgress(isLoading);
      });

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
        classNames: [ 'mynah-modified-files-pills-container' ],
        children: this.createFilePills()
      });
      contentWrapper?.appendChild(filePillsContainer);
    }

    this.updateTitle();
  }

  private createFilePills (): any[] {
    const filePills: any[] = [];

    this.trackedFiles.forEach((file) => {
      const fileName = file.path.split('/').pop() ?? file.path;
      const isDeleted = file.type === 'deleted';

      filePills.push({
        type: 'span',
        classNames: [
          'mynah-chat-item-tree-file-pill',
          ...(isDeleted ? [ 'mynah-chat-item-tree-file-pill-deleted' ] : [])
        ],
        children: [
          {
            type: 'span',
            children: [ fileName ],
            events: {
              click: (event: Event) => {
                event.preventDefault();
                event.stopPropagation();
                MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_CLICK, {
                  tabId: this.props.tabId,
                  messageId: 'modified-files-tracker',
                  filePath: file.fullPath ?? file.path,
                  deleted: isDeleted
                });
              }
            }
          },
          new Button({
            icon: new Icon({ icon: 'undo' }).render,
            status: 'clear',
            primary: false,
            classNames: [ 'mynah-modified-files-undo-button' ],
            onClick: (event: Event) => {
              event.preventDefault();
              event.stopPropagation();
              if (this.props.onUndoFile != null) {
                this.props.onUndoFile(file.fullPath ?? file.path, file.toolUseId);
              } else {
                MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
                  tabId: this.props.tabId,
                  messageId: 'modified-files-tracker',
                  actionId: 'undo-file',
                  actionText: 'Undo',
                  filePath: file.fullPath ?? file.path,
                  toolUseId: file.toolUseId
                });
              }
            }
          }).render
        ]
      });
    });

    return filePills;
  }

  private processLatestChatItems (chatItems: ChatItem[]): void {
    const latestChatItem = chatItems
      .filter(item => item.type !== 'answer-stream' && (((item.header?.fileList) != null) || item.fileList))
      .pop();

    if (latestChatItem != null) {
      this.clearFiles();
      this.extractFilesFromChatItem(latestChatItem);
      this.updateContent();
    }
  }

  private extractFilesFromChatItem (chatItem: ChatItem): void {
    if ((chatItem.header?.fileList?.filePaths) != null) {
      chatItem.header.fileList.filePaths.forEach(filePath => {
        const details = chatItem.header?.fileList?.details?.[filePath];
        const status = details?.icon === 'progress'
          ? 'working'
          : details?.icon === 'ok-circled'
            ? 'done'
            : details?.icon === 'cancel-circle' ? 'failed' : 'modified';
        this.addFileWithDetails(filePath, status, details?.label, details?.iconForegroundStatus, details?.description);
      });
    }

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
        this.addFileWithDetails(filePath, status, details?.label, details?.iconForegroundStatus, details?.description);
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
    this.trackedFiles.set(filePath, { path: filePath, type: fileType, fullPath, toolUseId });
    this.updateContent();
  }

  private addFileWithDetails (filePath: string, status: string, label?: string, iconStatus?: string, fullPath?: string): void {
    this.trackedFiles.set(filePath, { path: filePath, type: status, label, iconStatus, fullPath });
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

  private updateTitle (): void {
    const fileCount = this.trackedFiles.size;
    const title = fileCount > 0 ? `Modified Files (${fileCount})` : 'Modified Files';
    if ((this.collapsibleContent.updateTitle) != null) {
      this.collapsibleContent.updateTitle(this.workInProgress ? `${title} - Working...` : title);
    }
  }
}
