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
  public titleText: string = 'No files modified!';
  private workInProgress: boolean = false;

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

    MynahUITabsStore.getInstance()
      .getTabDataStore(this.props.tabId)
      .subscribe('modifiedFilesTitle', (newTitle: string) => {
        if (newTitle !== '') {
          this.collapsibleContent.updateTitle(newTitle);
        }
      });

    this.updateContent();
  }

  private updateContent (): void {
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
              // Add undo button if present in chatItem.header.buttons
              ...(((chatItem.header?.buttons?.find((btn: any) => btn.id === 'undo-changes')) != null)
                ? [ {
                    type: 'button',
                    classNames: [ 'mynah-button', 'mynah-button-clear', 'mynah-icon-button' ],
                    children: [ new Icon({ icon: 'undo' }).render ],
                    events: {
                      click: (event: Event) => {
                        const button = event.currentTarget as HTMLButtonElement;
                        if (button.classList.contains('disabled')) return;

                        event.preventDefault();
                        event.stopPropagation();

                        // Replace icon with red cross and disable
                        const iconElement = button.querySelector('.mynah-icon');
                        if (iconElement != null) {
                          iconElement.className = 'mynah-icon codicon codicon-close';
                          iconElement.setAttribute('style', 'color: var(--mynah-color-status-error);');
                        }
                        button.classList.add('disabled');

                        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
                          tabId: this.props.tabId,
                          messageId: chatItem.messageId,
                          actionId: 'undo-changes',
                          actionText: 'Undo changes'
                        });
                      }
                    }
                  } ]
                : [])
            ]
          };
        })
      });
      contentWrapper.appendChild(pillsContainer);

      // Add "Undo All" button if present in any chatItem.header.buttons
      // Check both header.buttons and root buttons for undo-all-changes
      let undoAllButton = chatItems.find((chatItem: ChatItem) =>
        chatItem.header?.buttons?.some((btn: any) => btn.id === 'undo-all-changes')
      )?.header?.buttons?.find((btn: any) => btn.id === 'undo-all-changes');

      let undoAllChatItem = chatItems.find((chatItem: ChatItem) =>
        chatItem.header?.buttons?.some((btn: any) => btn.id === 'undo-all-changes')
      );

      // If not found in header.buttons, check root buttons
      if (undoAllButton === null || undoAllButton === undefined) {
        undoAllButton = chatItems.find((chatItem: ChatItem) =>
          chatItem.buttons?.some((btn: any) => btn.id === 'undo-all-changes')
        )?.buttons?.find((btn: any) => btn.id === 'undo-all-changes');

        undoAllChatItem = chatItems.find((chatItem: ChatItem) =>
          chatItem.buttons?.some((btn: any) => btn.id === 'undo-all-changes')
        );
      }

      if (undoAllButton != null) {
        const buttonsContainer = DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-modified-files-buttons-container' ],
          children: [ {
            type: 'button',
            classNames: [ 'mynah-button', 'mynah-button-clear' ],
            children: [
              new Icon({ icon: 'undo' }).render,
              {
                type: 'span',
                children: [ undoAllButton.text ?? 'Undo All' ],
                classNames: [ 'mynah-button-label' ]
              }
            ],
            events: {
              click: (event: Event) => {
                const button = event.currentTarget as HTMLButtonElement;
                if (button.classList.contains('disabled')) return;

                event.preventDefault();
                event.stopPropagation();

                // Replace icon with red cross and disable
                const iconElement = button.querySelector('.mynah-icon');
                if (iconElement != null) {
                  iconElement.className = 'mynah-icon codicon codicon-close';
                  iconElement.setAttribute('style', 'color: var(--mynah-color-status-error);');
                }
                button.classList.add('disabled');

                MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
                  tabId: this.props.tabId,
                  messageId: undoAllChatItem?.messageId,
                  actionId: undoAllButton.id,
                  actionText: undoAllButton.text
                });
              }
            }
          } ]
        });
        contentWrapper.appendChild(buttonsContainer);
      }
    }
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
  }
}
