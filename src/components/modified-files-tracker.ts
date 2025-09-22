/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { MynahUIGlobalEvents } from '../helper/events';
import { MynahEventNames, ChatItem } from '../static';
import { Icon } from './icon';
import testIds from '../helper/test-ids';
import { MynahUITabsStore } from '../helper/tabs-store';

export interface ModifiedFilesTrackerProps {
  tabId: string;
  visible?: boolean;
  chatItem?: ChatItem;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly collapsibleContent: CollapsibleContent;
  public titleText: string = 'Modified Files';
  private workInProgress: boolean = false;

  constructor(props: ModifiedFilesTrackerProps) {
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
      .subscribe('chatItems', () => {
        this.updateContent();
      });

    this.updateContent();
  }

  private updateContent(): void {
    const contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
    if (contentWrapper == null) return;

    contentWrapper.innerHTML = '';

    // Get all modified files from current chat items
    const chatItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('chatItems');
    const allModifiedFiles: Array<{ chatItem: ChatItem; filePath: string; details: any }> = [];

    chatItems.forEach((chatItem: ChatItem) => {
      if (chatItem.type !== 'answer-stream' && chatItem.messageId != null) {
        const fileList = chatItem.header?.fileList ?? chatItem.fileList;
        if (fileList?.filePaths != null) {
          fileList.filePaths.forEach((filePath: string) => {
            const details = fileList.details?.[filePath];
            // Only add files that have completed processing (have changes data)
            if (details?.changes != null) {
              allModifiedFiles.push({ chatItem, filePath, details });
            }
          });
        }
      }
    });

    if (allModifiedFiles.length === 0) {
      const emptyState = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-empty-state' ],
        children: [ 'No modified files' ]
      });
      contentWrapper.appendChild(emptyState);
    } else {
      // Create pills container with side-by-side layout
      const pillsContainer = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-pills-container' ],
        children: allModifiedFiles.map(({ chatItem, filePath, details }) => {
          const fileName = details?.visibleName ?? filePath;
          const isDeleted =
            chatItem.fileList?.deletedFiles?.includes(filePath) === true ||
            chatItem.header?.fileList?.deletedFiles?.includes(filePath) === true;
          const statusIcon = details?.icon ?? 'ok-circled';

          return {
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
                      deleted: isDeleted,
                      fileDetails: details
                    });
                  }
                }
              },
              {
                type: 'button',
                classNames: [ 'mynah-modified-files-undo-button', 'mynah-button', 'mynah-button-clear' ],
                children: [ new Icon({ icon: 'undo' }).render ],
                events: {
                  click: (event: Event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_ACTION_CLICK, {
                      tabId: this.props.tabId,
                      messageId: chatItem.messageId,
                      actionId: 'undo-changes',
                      actionText: 'Undo',
                      filePath,
                      toolUseId: details?.toolUseId
                    });
                  }
                }
              }
            ]
          };
        })
      });
      contentWrapper.appendChild(pillsContainer);

      // Add "Undo All" button if there are files
      if (allModifiedFiles.length > 0) {
        const undoAllButton = DomBuilder.getInstance().build({
          type: 'button',
          classNames: [ 'mynah-modified-files-undo-all-button', 'mynah-button', 'mynah-button-clear' ],
          children: [
            new Icon({ icon: 'undo' }).render,
            {
              type: 'span',
              children: [ 'Undo All' ],
              classNames: [ 'mynah-button-label' ]
            }
          ],
          events: {
            click: (event: Event) => {
              event.preventDefault();
              event.stopPropagation();
              MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
                tabId: this.props.tabId,
                actionId: 'undo-all-changes',
                actionText: 'Undo All'
              });
            }
          }
        });
        contentWrapper.appendChild(undoAllButton);
      }
    }

    this.updateTitle(allModifiedFiles.length);
  }

  public setVisible(visible: boolean): void {
    if (visible) {
      this.render.removeClass('hidden');
    } else {
      this.render.addClass('hidden');
    }
  }

  public setWorkInProgress(inProgress: boolean): void {
    this.workInProgress = inProgress;
    this.updateTitle(0);
  }

  private updateTitle(totalFiles: number): void {
    const title = totalFiles > 0 ? `(${totalFiles}) files modified!` : 'No Files Modified!';
    if ((this.collapsibleContent.updateTitle) != null) {
      this.collapsibleContent.updateTitle(this.workInProgress ? `${title} - Working...` : title);
    }
  }
}
