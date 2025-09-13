/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { Icon, MynahIcons } from './icon';
import { ChatItemButton } from '../static';

import { Button } from './button';
import testIds from '../helper/test-ids';

export type FileChangeType = 'modified' | 'created' | 'deleted';

export interface TrackedFile {
  path: string;
  type: FileChangeType;
}

export interface ModifiedFilesTrackerProps {
  tabId: string;
  visible?: boolean;
  onFileClick?: (filePath: string, fileType?: FileChangeType) => void;
  onAcceptFile?: (filePath: string) => void;
  onUndoFile?: (filePath: string) => void;
  onAcceptAll?: () => void;
  onUndoAll?: () => void;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly modifiedFiles: Set<string> = new Set();
  private readonly trackedFiles: Map<string, FileChangeType> = new Map();
  private isWorkInProgress: boolean = false;
  private readonly collapsibleContent: CollapsibleContent;
  private readonly contentWrapper: ExtendedHTMLElement;

  constructor (props: ModifiedFilesTrackerProps) {
    StyleLoader.getInstance().load('components/_modified-files-tracker.scss');
    this.props = { visible: true, ...props };

    this.contentWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-content' ],
      children: [ this.getEmptyStateContent() ]
    });

    this.collapsibleContent = new CollapsibleContent({
      title: this.getTitleWithButtons(),
      initialCollapsedState: true,
      children: [ this.contentWrapper ],
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
  }

  private getTitleWithButtons (): ExtendedHTMLElement {
    const titleText = this.isWorkInProgress
      ? 'Working...'
      : this.trackedFiles.size === 0
        ? 'No files modified!'
        : 'Done!';
    console.log('[ModifiedFilesTracker] Title:', titleText, 'InProgress:', this.isWorkInProgress, 'FileCount:', this.trackedFiles.size);

    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-title-wrapper' ],
      children: [
        {
          type: 'span',
          classNames: [ 'mynah-modified-files-title-text' ],
          children: [ titleText ]
        },
        ...(this.trackedFiles.size > 0 && !this.isWorkInProgress
          ? [ {
              type: 'div',
              classNames: [ 'mynah-modified-files-title-actions' ],
              children: [
                new Button({ tooltip: 'Undo all', icon: new Icon({ icon: MynahIcons.UNDO }).render, primary: false, border: false, status: 'clear', onClick: () => { this.props.onUndoAll?.(); } }).render
              ]
            } ]
          : [ ])
      ]
    });
  }

  private getEmptyStateContent (): ExtendedHTMLElement {
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-empty-state' ],
      testId: testIds.modifiedFilesTracker.emptyState,
      children: [ 'Modified files will be displayed here!' ]
    });
  }

  private getFileActions (filePath: string): ChatItemButton[] {
    return [
      { id: 'undo-changes', icon: MynahIcons.UNDO, text: 'Undo', description: 'Undo changes', status: 'clear' }
    ];
  }

  private readonly handleFileAction = (action: ChatItemButton, filePath: string): void => {
    switch (action.id) {
      case 'undo-changes':
        this.props.onUndoFile?.(filePath);
        // Don't remove from tracker here - let the language server handle the actual undo
        break;
    }
  };

  private updateContent (): void {
    const fileItems = this.trackedFiles.size === 0
      ? [ this.getEmptyStateContent() ]
      : Array.from(this.trackedFiles.entries()).map(([ filePath, fileType ]) => {
        const iconColor = this.getFileIconColor(fileType);
        const iconType = this.getFileIcon(fileType);
        const iconElement = new Icon({ icon: iconType }).render;

        // Apply color styling to the icon
        iconElement.style.color = iconColor;

        return DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-modified-files-item', `mynah-modified-files-item-${fileType}` ],
          children: [
            iconElement,
            {
              type: 'div',
              classNames: [ 'mynah-modified-files-item-content' ],
              children: [
                {
                  type: 'span',
                  classNames: [ 'mynah-modified-files-item-path' ],
                  children: [ filePath ]
                }
              ],
              events: {
                click: (event: Event) => {
                  console.log('[ModifiedFilesTracker] File content clicked:', filePath);
                  event.stopPropagation();
                  this.props.onFileClick?.(filePath, fileType);
                }
              }
            },
            {
              type: 'div',
              classNames: [ 'mynah-modified-files-item-actions' ],
              children: this.getFileActions(filePath).map(action =>
                new Button({
                  icon: new Icon({ icon: action.icon ?? MynahIcons.DOT }).render,
                  tooltip: action.description,
                  primary: false,
                  border: false,
                  status: 'clear',
                  onClick: (event: Event) => {
                    event.stopPropagation();
                    this.handleFileAction(action, filePath);
                  }
                }).render
              )
            }
          ]
        });
      });

    this.contentWrapper.clear();
    this.contentWrapper.update({ children: fileItems });
  }

  private updateTitle (): void {
    const newTitle = this.getTitleWithButtons();
    this.collapsibleContent.updateTitle(newTitle);
  }

  // Enhanced API with file type support
  public addFile (filePath: string, fileType: FileChangeType = 'modified'): void {
    this.trackedFiles.set(filePath, fileType);
    this.modifiedFiles.add(filePath); // Keep for backward compatibility
    this.updateTitle();
    this.updateContent();
  }

  public removeFile (filePath: string): void {
    this.trackedFiles.delete(filePath);
    this.modifiedFiles.delete(filePath); // Keep for backward compatibility
    this.updateTitle();
    this.updateContent();
  }

  public clearFiles (): void {
    this.trackedFiles.clear();
    this.modifiedFiles.clear(); // Keep for backward compatibility
    this.isWorkInProgress = false;
    this.updateTitle();
    this.updateContent();
  }

  public getTrackedFiles (): TrackedFile[] {
    return Array.from(this.trackedFiles.entries()).map(([ path, type ]) => ({ path, type }));
  }

  // Legacy API - maintained for backward compatibility
  /** @deprecated Use addFile() instead */
  public addModifiedFile (filePath: string): void {
    this.addFile(filePath, 'modified');
  }

  /** @deprecated Use removeFile() instead */
  public removeModifiedFile (filePath: string): void {
    this.removeFile(filePath);
  }

  /** @deprecated Use clearFiles() instead */
  public clearModifiedFiles (): void {
    this.clearFiles();
  }

  /** @deprecated Use getTrackedFiles() instead */
  public getModifiedFiles (): string[] {
    return Array.from(this.modifiedFiles);
  }

  public setWorkInProgress (inProgress: boolean): void {
    console.log('[ModifiedFilesTracker] setWorkInProgress called:', inProgress);
    this.isWorkInProgress = inProgress;
    this.updateTitle();
  }

  public setVisible (visible: boolean): void {
    if (visible) {
      this.render.removeClass('hidden');
    } else {
      this.render.addClass('hidden');
    }
  }

  private getFileIconColor (fileType: FileChangeType): string {
    switch (fileType) {
      case 'created':
        return '#22c55e'; // Green for newly created files
      case 'modified':
        return '#3b82f6'; // Blue for modified files
      case 'deleted':
        return '#ef4444'; // Red for deleted files
      default:
        return 'var(--mynah-color-text-weak)'; // Default color
    }
  }

  private getFileIcon (fileType: FileChangeType): MynahIcons {
    return MynahIcons.FILE; // Use file icon for all cases
  }
}
