/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { MynahUIGlobalEvents } from '../helper/events';
import { MynahEventNames } from '../static';
import { ChatItem } from '../static';
import { Button } from './button';
import { Icon } from './icon';
import testIds from '../helper/test-ids';

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
  private trackedFiles: Map<string, { path: string; type: string; fullPath?: string; toolUseId?: string }> = new Map();
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

    this.updateContent();
  }

  private updateContent (): void {
    const contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
    if (contentWrapper) {
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

  private createFilePills () {
    const fileRows: any[] = [];
    
    this.trackedFiles.forEach((file) => {
      const fileName = file.path.split('/').pop() ?? file.path;
      const isDeleted = file.type === 'deleted';
      
      fileRows.push({
        type: 'div',
        classNames: [ 'mynah-modified-files-row' ],
        events: {
          click: (event: Event) => {
            event.stopPropagation();
          }
        },
        children: [
          {
            type: 'span',
            classNames: [ 'mynah-modified-files-filename' ],
            children: [ fileName ],
            events: {
              click: (event: Event) => {
                event.stopPropagation();
                if (this.props.onFileClick) {
                  this.props.onFileClick(file.path);
                } else {
                  MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_CLICK, {
                    tabId: this.props.tabId,
                    messageId: 'modified-files-tracker',
                    filePath: file.path,
                    deleted: isDeleted
                  });
                }
              }
            }
          },
          new Button({
            icon: new Icon({ icon: 'undo' }).render,
            status: 'clear',
            primary: false,
            classNames: [ 'mynah-modified-files-undo-button' ],
            onClick: () => {
              if (this.props.onUndoFile) {
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
    this.props.chatItem = chatItem;
    this.updateContent();
  }

  public setVisible (visible: boolean): void {
    if (visible) {
      this.render.removeClass('hidden');
    } else {
      this.render.addClass('hidden');
    }
  }

  public addFile (filePath: string, fileType: string = 'modified', fullPath?: string, toolUseId?: string): void {
    console.log('[ModifiedFilesTracker] addFile called:', { filePath, fileType, fullPath, toolUseId });
    
    this.trackedFiles.set(filePath, {
      path: filePath,
      type: fileType,
      fullPath,
      toolUseId
    });
    
    console.log('[ModifiedFilesTracker] trackedFiles after add:', Array.from(this.trackedFiles.entries()));
    this.updateContent();
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

  public getTrackedFiles (): Array<{ path: string; type: string; fullPath?: string; toolUseId?: string }> {
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
    
    if (this.collapsibleContent.updateTitle) {
      this.collapsibleContent.updateTitle(this.workInProgress ? `${title} - Working...` : title);
    }
  }
}