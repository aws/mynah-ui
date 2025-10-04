/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIGlobalEvents } from '../helper/events';
import { MynahEventNames, TreeNodeDetails, ChatItemContent } from '../static';
import { CollapsibleContent } from './collapsible-content';
import { Icon, MynahIcons } from './icon';
import { Button } from './button';

export interface ModifiedFilesTrackerData extends Pick<ChatItemContent, 'fileList'> {
  title?: string | ExtendedHTMLElement;
  visible?: boolean;
  showUndoAll?: boolean;
  showFileCount?: boolean;
  initialCollapsed?: boolean;
}

export interface ModifiedFilesTrackerProps {
  tabId: string;
  modifiedFilesData: ModifiedFilesTrackerData;
  onFileUndo?: (filePath: string) => void;
  onUndoAll?: () => void;
  testId?: string;
  classNames?: string[];
  // Add these to match chat-item-card button handling
  onButtonClick?: (buttonId: string, messageId: string) => void;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private collapsibleContent: CollapsibleContent | null = null;
  private fileItemsContainer: ExtendedHTMLElement | null = null;

  constructor (props: ModifiedFilesTrackerProps) {
    this.props = {
      testId: 'mynah-modified-files-tracker',
      classNames: [],
      ...props,
      modifiedFilesData: {
        title: 'Modified Files',
        visible: true,
        showUndoAll: true,
        showFileCount: true,
        initialCollapsed: false,
        ...props.modifiedFilesData,
        fileList: {
          collapsed: false,
          hideFileCount: false,
          ...props.modifiedFilesData.fileList
        }
      }
    };

    this.render = this.buildCard();
    this.updateVisibility();
  }

  private buildCard (): ExtendedHTMLElement {
    const cardWrapper = DomBuilder.getInstance().build({
      type: 'div',
      testId: this.props.testId,
      classNames: [ 'mynah-modified-files-tracker', ...(this.props.classNames ?? []) ],
      children: []
    });

    if (this.getFileCount() > 0) {
      this.buildCollapsibleContent(cardWrapper);
    }

    return cardWrapper;
  }

  private buildCollapsibleContent (parent: ExtendedHTMLElement): void {
    this.fileItemsContainer = this.buildFileItems();

    const titleWithCount = this.buildTitleWithCount();

    this.collapsibleContent = new CollapsibleContent({
      title: titleWithCount,
      initialCollapsedState: this.props.modifiedFilesData.initialCollapsed ?? this.props.modifiedFilesData.fileList?.collapsed ?? false,
      testId: `${this.props.testId ?? 'mynah-modified-files-tracker'}-collapsible`,
      children: [ this.fileItemsContainer ],
      onCollapseStateChange: (collapsed) => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.MODIFIED_FILES_COLLAPSE_STATE_CHANGE, {
          tabId: this.props.tabId,
          collapsed
        });
      }
    });

    parent.insertChild('beforeend', this.collapsibleContent.render);
  }

  private buildTitleWithCount (): ExtendedHTMLElement {
    const fileCount = this.getFileCount();
    const title = this.props.modifiedFilesData.title ?? 'Modified Files';
    const showFileCount = this.props.modifiedFilesData.showFileCount !== false && !(this.props.modifiedFilesData.fileList?.hideFileCount ?? false);

    const titleContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-tracker-title-container' ],
      children: [
        {
          type: 'span',
          classNames: [ 'mynah-modified-files-tracker-title' ],
          children: typeof title === 'string' ? [ title ] : [ title ]
        },
        ...(showFileCount
          ? [ {
              type: 'span',
              classNames: [ 'mynah-modified-files-tracker-count' ],
              children: [ `(${fileCount.toString()})` ]
            } ]
          : [])
      ]
    });

    // Add undo all button if there are files, showUndoAll is enabled, and onUndoAll callback is provided
    if (fileCount > 0 && this.props.modifiedFilesData.showUndoAll === true && this.props.onUndoAll != null) {
      const undoAllButton = new Button({
        icon: new Icon({ icon: MynahIcons.UNDO }).render,
        label: 'Undo All',
        status: 'clear',
        onClick: () => {
          // Use the same button click pattern as ChatItemCard
          if (this.props.onButtonClick != null) {
            // Create a messageId that matches the pattern used for undo all
            const messageId = 'undo-all-changes';
            this.props.onButtonClick('undo-all-changes', messageId);
          }

          // Keep the original callback for backward compatibility
          this.props.onUndoAll?.();
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.MODIFIED_FILES_UNDO_ALL, {
            tabId: this.props.tabId
          });
        },
        testId: `${this.props.testId ?? 'mynah-modified-files-tracker'}-undo-all`
      });

      titleContainer.insertChild('beforeend', undoAllButton.render);
    }

    return titleContainer;
  }

  private buildFileItems (): ExtendedHTMLElement {
    const container = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-tracker-items' ],
      children: []
    });

    const fileList = this.props.modifiedFilesData.fileList;
    if (fileList == null) {
      return container;
    }

    const allFiles = [
      ...(fileList.filePaths ?? []),
      ...(fileList.deletedFiles ?? [])
    ];

    allFiles.forEach((filePath) => {
      const fileItem = this.buildFileItem(filePath);
      container.insertChild('beforeend', fileItem);
    });

    return container;
  }

  private buildFileItem (filePath: string): ExtendedHTMLElement {
    const fileList = this.props.modifiedFilesData.fileList;
    const isDeleted = fileList?.deletedFiles?.includes(filePath) ?? false;
    const details = fileList?.details?.[filePath];
    const displayName = details?.visibleName ?? filePath.split('/').pop() ?? filePath;
    const fileIcon = details?.icon ?? this.getDefaultIconForFile(filePath);
    const status = this.getFileStatus(filePath, isDeleted, details);

    const fileItem = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-modified-files-tracker-item',
        ...(status != null ? [ `mynah-modified-files-tracker-item-${status}` ] : [])
      ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-modified-files-tracker-item-content' ],
          children: [
            new Icon({
              icon: fileIcon,
              classNames: [ 'mynah-modified-files-tracker-item-icon' ],
              status: details?.iconForegroundStatus
            }).render,
            {
              type: 'span',
              classNames: [ 'mynah-modified-files-tracker-item-name' ],
              children: [ displayName ],
              attributes: {
                title: filePath
              }
            }
          ]
        }
      ]
    });

    // Add undo button if callback is provided
    if (this.props.onFileUndo != null) {
      const undoButton = new Button({
        icon: new Icon({ icon: MynahIcons.UNDO }).render,
        status: 'clear',
        onClick: () => {
          // Use the same button click pattern as ChatItemCard
          if (this.props.onButtonClick != null) {
            // Create a messageId that matches the pattern used in chat-item-card
            // This should match the toolUseId from the language server
            const messageId = `file-undo-${filePath}`;
            this.props.onButtonClick('undo-changes', messageId);
          }

          // Keep the original callback for backward compatibility
          this.props.onFileUndo?.(filePath);
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.MODIFIED_FILES_FILE_UNDO, {
            tabId: this.props.tabId,
            filePath
          });
        },
        testId: `${this.props.testId ?? 'mynah-modified-files-tracker'}-file-undo-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`
      });

      fileItem.insertChild('beforeend', undoButton.render);
    }

    return fileItem;
  }

  private getFileStatus (_filePath: string, isDeleted: boolean, details?: TreeNodeDetails): string | null {
    if (isDeleted) {
      return 'deleted';
    }

    // Use the status from details if available
    if (details?.status != null) {
      switch (details.status) {
        case 'success':
          return 'added';
        case 'warning':
          return 'modified';
        case 'error':
          return 'deleted';
        default:
          return 'modified';
      }
    }

    // Default to modified for non-deleted files
    return 'modified';
  }

  private getDefaultIconForFile (filePath: string): MynahIcons {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'html':
        return MynahIcons.CODE_BLOCK;
      default:
        return MynahIcons.FILE;
    }
  }

  private getFileCount (): number {
    const fileList = this.props.modifiedFilesData.fileList;
    if (fileList == null) {
      return 0;
    }

    const filePathsCount = fileList.filePaths?.length ?? 0;
    const deletedFilesCount = fileList.deletedFiles?.length ?? 0;
    return filePathsCount + deletedFilesCount;
  }

  private updateVisibility (): void {
    const shouldBeVisible = this.props.modifiedFilesData.visible !== false && this.getFileCount() > 0;
    if (shouldBeVisible) {
      this.render.removeClass('mynah-hidden');
    } else {
      this.render.addClass('mynah-hidden');
    }
  }

  // Public methods for updating the component
  public updateModifiedFilesData (newData: Partial<ModifiedFilesTrackerData>): void {
    this.props.modifiedFilesData = {
      ...this.props.modifiedFilesData,
      ...newData,
      fileList: {
        ...this.props.modifiedFilesData.fileList,
        ...newData.fileList
      }
    };

    // Rebuild the component
    this.render.innerHTML = '';
    if (this.getFileCount() > 0) {
      this.buildCollapsibleContent(this.render);
    }
    this.updateVisibility();
  }

  public getModifiedFilesData (): ModifiedFilesTrackerData {
    return { ...this.props.modifiedFilesData };
  }
}
