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
  private currentChatItem: ChatItem | null = null;
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

    const filePills = this.createFilePills();
    if (filePills.length === 0) {
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
        children: filePills
      });
      contentWrapper?.appendChild(filePillsContainer);
    }

    this.updateTitle();
  }

  private createFilePills (): any[] {
    if (!this.currentChatItem) return [];

    const filePills: any[] = [];
    const fileList = this.currentChatItem.header?.fileList || this.currentChatItem.fileList;
    
    if (!fileList?.filePaths) return [];

    fileList.filePaths.forEach(filePath => {
      const details = fileList.details?.[filePath];
      const fileName = filePath.split('/').pop() ?? filePath;
      const isDeleted = fileList.deletedFiles?.includes(filePath) === true;
      const statusIcon = details?.icon === 'progress' ? 'progress' :
                        details?.icon === 'ok-circled' ? 'ok-circled' :
                        details?.icon === 'cancel-circle' ? 'cancel-circle' : null;

      filePills.push({
        type: 'span',
        classNames: [
          'mynah-chat-item-tree-file-pill',
          ...(isDeleted ? [ 'mynah-chat-item-tree-file-pill-deleted' ] : [])
        ],
        children: [
          ...(statusIcon ? [new Icon({ icon: statusIcon, status: details?.iconForegroundStatus }).render] : []),
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
                  messageId: this.currentChatItem?.messageId,
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
                  messageId: this.currentChatItem?.messageId,
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

    return filePills;
  }

  private processLatestChatItems (chatItems: ChatItem[]): void {
    const latestChatItem = chatItems
      .filter(item => item.type !== 'answer-stream' && (((item.header?.fileList) != null) || item.fileList))
      .pop();

    if (latestChatItem) {
      this.currentChatItem = latestChatItem;
      this.updateContent();
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
    this.updateTitle();
  }



  private updateTitle (): void {
    const fileCount = this.currentChatItem?.header?.fileList?.filePaths?.length || this.currentChatItem?.fileList?.filePaths?.length || 0;
    const title = fileCount > 0 ? `Modified Files (${fileCount})` : 'Modified Files';
    if ((this.collapsibleContent.updateTitle) != null) {
      this.collapsibleContent.updateTitle(this.workInProgress ? `${title} - Working...` : title);
    }
  }
}
