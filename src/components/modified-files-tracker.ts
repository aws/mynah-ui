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
  private readonly chatFilePillContainers: ExtendedHTMLElement[] = [];
  private readonly processedMessageIds: Set<string> = new Set();
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
    if (contentWrapper == null) return;

    if (this.chatFilePillContainers.length === 0) {
      contentWrapper.innerHTML = '';
      const emptyState = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-empty-state' ],
        children: [ 'No modified files' ]
      });
      contentWrapper.appendChild(emptyState);
    }

    this.updateTitle();
  }

  private createChatFilePillContainer (chatItem: ChatItem): ExtendedHTMLElement | null {
    const fileList = chatItem.header?.fileList ?? chatItem.fileList;
    if (fileList?.filePaths == null || fileList.filePaths.length === 0) return null;

    const filePills: any[] = [];
    fileList.filePaths.forEach(filePath => {
      const details = fileList.details?.[filePath];

      // Only show files that have completed processing (have changes data)
      if ((details?.changes) == null) return;

      const fileName = filePath.split('/').pop() ?? filePath;
      const isDeleted = fileList.deletedFiles?.includes(filePath) === true;
      // Since icons are always null, we'll show a default success icon for completed files
      const statusIcon = 'ok-circled';

      filePills.push({
        type: 'span',
        classNames: [
          'mynah-chat-item-tree-file-pill',
          ...(isDeleted ? [ 'mynah-chat-item-tree-file-pill-deleted' ] : [])
        ],
        children: [
          ...(statusIcon != null ? [ new Icon({ icon: statusIcon, status: details?.iconForegroundStatus }).render ] : []),
          {
            type: 'span',
            children: [ fileName ],
            events: {
              click: (event: Event) => {
                if (details?.clickable === false) {
                  return;
                }
                event.preventDefault();
                event.stopPropagation();
                MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_CLICK, {
                  tabId: this.props.tabId,
                  messageId: chatItem.messageId,
                  filePath,
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
                this.props.onUndoFile(filePath, details?.toolUseId);
              } else {
                MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
                  tabId: this.props.tabId,
                  messageId: chatItem.messageId,
                  actionId: 'undo-file',
                  actionText: 'Undo',
                  filePath,
                  toolUseId: details?.toolUseId
                });
              }
            }
          }).render
        ]
      });
    });

    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-pills-container' ],
      children: filePills
    });
  }

  private processLatestChatItems (chatItems: ChatItem[]): void {
    const fileListItems = chatItems.filter(item =>
      item.type !== 'answer-stream' &&
      item.messageId != null &&
      !this.processedMessageIds.has(item.messageId) &&
      (((item.header?.fileList) != null) || item.fileList)
    );

    fileListItems.forEach(chatItem => {
      if (chatItem.messageId != null) {
        this.processedMessageIds.add(chatItem.messageId);
        const container = this.createChatFilePillContainer(chatItem);
        if (container != null) {
          this.chatFilePillContainers.push(container);
          const contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
          if (contentWrapper != null) {
            contentWrapper.querySelector('.mynah-modified-files-empty-state')?.remove();
            contentWrapper.appendChild(container);
          }
        }
      }
    });

    this.updateTitle();
  }

  public setVisible (visible: boolean): void {
    if (visible) {
      this.render.removeClass('hidden');
    } else {
      this.render.addClass('hidden');
    }
  }

  public setWorkInProgress (inProgress: boolean): void {
    this.workInProgress = inProgress;
    this.updateTitle();
  }

  private updateTitle (): void {
    const totalFiles = this.chatFilePillContainers.reduce((count, container) => {
      return count + container.querySelectorAll('.mynah-chat-item-tree-file-pill').length;
    }, 0);
    const title = totalFiles > 0 ? `(${totalFiles}) files modified!` : 'No Files Modified!';
    if ((this.collapsibleContent.updateTitle) != null) {
      this.collapsibleContent.updateTitle(this.workInProgress ? `${title} - Working...` : title);
    }
  }
}
