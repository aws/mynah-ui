/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { Icon, MynahIcons } from './icon';
import { Button } from './button';
import testIds from '../helper/test-ids';

export interface ModifiedFilesTrackerProps {
  tabId: string;
  visible?: boolean;
  onFileClick?: (filePath: string) => void;
  onAcceptFile?: (filePath: string) => void;
  onUndoFile?: (filePath: string) => void;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly modifiedFiles: Set<string> = new Set();
  private isWorkInProgress: boolean = false;
  private readonly collapsibleContent: CollapsibleContent;
  private readonly contentWrapper: ExtendedHTMLElement;
  private readonly logBuffer: string[] = [];

  private log (message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ModifiedFilesTracker(${this.props.tabId}): ${message}${data !== undefined ? ' - ' + JSON.stringify(data) : ''}`;

    // Store in localStorage for VS Code environment
    try {
      const existingLogs = localStorage.getItem('mynah-modified-files-logs') ?? '';
      const newLogs = existingLogs + logEntry + '\n';
      localStorage.setItem('mynah-modified-files-logs', newLogs);

      // Also add to DOM for visibility
      this.addLogToDOM(logEntry);
    } catch (error) {
      // Fallback to DOM only
      this.addLogToDOM(logEntry);
    }
  }

  private addLogToDOM (logEntry: string): void {
    let logContainer = document.getElementById('mynah-debug-logs');
    if (logContainer == null) {
      logContainer = document.createElement('div');
      logContainer.id = 'mynah-debug-logs';
      logContainer.style.cssText = 'position:fixed;top:10px;right:10px;width:400px;height:200px;background:black;color:lime;font-family:monospace;font-size:10px;overflow-y:scroll;z-index:9999;padding:5px;border:1px solid lime;';
      document.body.appendChild(logContainer);
    }

    const logLine = document.createElement('div');
    logLine.textContent = logEntry;
    logContainer.appendChild(logLine);
    logContainer.scrollTop = logContainer.scrollHeight;

    // Keep only last 50 entries
    while (logContainer.children.length > 50) {
      const firstChild = logContainer.firstChild;
      if (firstChild !== null) {
        logContainer.removeChild(firstChild);
      }
    }
  }

  constructor (props: ModifiedFilesTrackerProps) {
    StyleLoader.getInstance().load('components/_modified-files-tracker.scss');

    this.props = {
      visible: true,
      ...props
    };

    this.log('Constructor called', { props });

    this.contentWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-content' ],
      children: [ this.getEmptyStateContent() ]
    });

    this.collapsibleContent = new CollapsibleContent({
      title: this.getCollapsedTitle(),
      initialCollapsedState: false,
      children: [ this.contentWrapper ],
      classNames: [ 'mynah-modified-files-tracker' ],
      testId: testIds.modifiedFilesTracker.wrapper,
      onCollapseStateChange: (collapsed) => {
        if (!collapsed && this.modifiedFiles.size === 0) {
          this.updateContent();
        }
      }
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
  }

  private getCollapsedTitle (): string {
    if (this.modifiedFiles.size === 0) {
      return 'No files modified!';
    }

    const fileCount = this.modifiedFiles.size;
    const fileText = fileCount === 1 ? 'file' : 'files';
    const statusText = this.isWorkInProgress ? 'Work in progress...' : 'Work done!';

    return `${fileCount} ${fileText} modified so far. ${statusText}`;
  }

  private getEmptyStateContent (): ExtendedHTMLElement {
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-empty-state' ],
      testId: testIds.modifiedFilesTracker.emptyState,
      children: [ 'Modified files will be displayed here!' ]
    });
  }

  private getFileListContent (): ExtendedHTMLElement[] {
    if (this.modifiedFiles.size === 0) {
      return [ this.getEmptyStateContent() ];
    }

    return Array.from(this.modifiedFiles).map(filePath =>
      DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-item' ],
        testId: testIds.modifiedFilesTracker.fileItem,
        children: [
          new Icon({ icon: MynahIcons.FILE }).render,
          {
            type: 'span',
            classNames: [ 'mynah-modified-files-item-path' ],
            events: {
              click: () => {
                this.props.onFileClick?.(filePath);
              }
            },
            children: [ filePath ]
          },
          {
            type: 'span',
            classNames: [ 'mynah-modified-files-item-actions' ],
            children: [
              new Button({
                icon: new Icon({ icon: MynahIcons.OK }).render,
                onClick: () => {
                  this.props.onAcceptFile?.(filePath);
                },
                primary: false,
                status: 'clear',
                tooltip: 'Accept changes',
                testId: testIds.modifiedFilesTracker.fileItemAccept
              }).render,
              new Button({
                icon: new Icon({ icon: MynahIcons.UNDO }).render,
                onClick: () => {
                  this.props.onUndoFile?.(filePath);
                },
                primary: false,
                status: 'clear',
                tooltip: 'Undo changes',
                testId: testIds.modifiedFilesTracker.fileItemUndo
              }).render
            ]
          }
        ]
      })
    );
  }

  private updateContent (): void {
    this.contentWrapper.clear();
    this.contentWrapper.update({
      children: this.getFileListContent()
    });
  }

  private updateTitle (): void {
    const newTitle = this.getCollapsedTitle();
    const titleElement = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-title-text');
    if (titleElement != null) {
      titleElement.textContent = newTitle;
    }
  }

  public addModifiedFile (filePath: string): void {
    this.log('addModifiedFile called', { filePath, currentFiles: Array.from(this.modifiedFiles) });
    this.modifiedFiles.add(filePath);
    this.updateTitle();
    this.updateContent();
    this.log('addModifiedFile completed', { newFiles: Array.from(this.modifiedFiles) });
  }

  public removeModifiedFile (filePath: string): void {
    this.log('removeModifiedFile called', { filePath, currentFiles: Array.from(this.modifiedFiles) });
    this.modifiedFiles.delete(filePath);
    this.updateTitle();
    this.updateContent();
    this.log('removeModifiedFile completed', { newFiles: Array.from(this.modifiedFiles) });
  }

  public setWorkInProgress (inProgress: boolean): void {
    this.log('setWorkInProgress called', { inProgress, currentStatus: this.isWorkInProgress });
    this.isWorkInProgress = inProgress;
    this.updateTitle();
  }

  public clearModifiedFiles (): void {
    this.log('clearModifiedFiles called', { currentFiles: Array.from(this.modifiedFiles) });
    this.modifiedFiles.clear();
    this.isWorkInProgress = false;
    this.updateTitle();
    this.updateContent();
    this.log('clearModifiedFiles completed');
  }

  public getModifiedFiles (): string[] {
    return Array.from(this.modifiedFiles);
  }

  public setVisible (visible: boolean): void {
    this.log('setVisible called', { visible });
    if (visible) {
      this.render.removeClass('hidden');
    } else {
      this.render.addClass('hidden');
    }
  }
}
