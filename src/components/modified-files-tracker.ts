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

export interface ModifiedFilesTrackerProps {
  tabId: string;
  visible?: boolean;
  onFileClick?: (filePath: string) => void;
  onAcceptFile?: (filePath: string) => void;
  onUndoFile?: (filePath: string) => void;
  onAcceptAll?: () => void;
  onUndoAll?: () => void;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly modifiedFiles: Set<string> = new Set();
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
    const titleText = this.modifiedFiles.size === 0
      ? 'No files modified!'
      : this.isWorkInProgress ? 'Working...' : 'Done!';

    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-title-wrapper' ],
      children: [
        {
          type: 'span',
          classNames: [ 'mynah-modified-files-title-text' ],
          children: [ titleText ]
        },
        ...(this.modifiedFiles.size > 0
          ? [ {
              type: 'div',
              classNames: [ 'mynah-modified-files-title-actions' ],
              children: [
                new Button({ tooltip: 'Undo all', icon: new Icon({ icon: MynahIcons.UNDO }).render, primary: false, border: false, status: 'clear', onClick: () => this.props.onUndoAll?.() }).render
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
      { id: 'undo', icon: MynahIcons.UNDO, text: 'Undo', description: 'Undo changes', status: 'clear' }
    ];
  }

  private readonly handleFileAction = (action: ChatItemButton, filePath: string): void => {
    switch (action.id) {
      case 'undo':
        this.props.onUndoFile?.(filePath);
        break;
    }
  };

  private updateContent (): void {
    const fileItems = this.modifiedFiles.size === 0
      ? [ this.getEmptyStateContent() ]
      : Array.from(this.modifiedFiles).map(filePath =>
        DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-modified-files-item' ],
          children: [
            new Icon({ icon: MynahIcons.FILE }).render,
            {
              type: 'span',
              classNames: [ 'mynah-modified-files-item-path' ],
              children: [ filePath ]
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
                  onClick: () => this.handleFileAction(action, filePath)
                }).render
              )
            }
          ],
          events: {
            click: () => this.props.onFileClick?.(filePath)
          }
        })
      );

    this.contentWrapper.clear();
    this.contentWrapper.update({ children: fileItems });
  }

  private updateTitle (): void {
    const newTitle = this.getTitleWithButtons();
    this.collapsibleContent.updateTitle(newTitle);
  }

  // Public API - same as original
  public addModifiedFile (filePath: string): void {
    this.modifiedFiles.add(filePath);
    this.updateTitle();
    this.updateContent();
  }

  public removeModifiedFile (filePath: string): void {
    this.modifiedFiles.delete(filePath);
    this.updateTitle();
    this.updateContent();
  }

  public setWorkInProgress (inProgress: boolean): void {
    this.isWorkInProgress = inProgress;
    this.updateTitle();
  }

  public clearModifiedFiles (): void {
    this.modifiedFiles.clear();
    this.isWorkInProgress = false;
    this.updateTitle();
    this.updateContent();
  }

  public getModifiedFiles (): string[] {
    return Array.from(this.modifiedFiles);
  }

  public setVisible (visible: boolean): void {
    if (visible) {
      this.render.removeClass('hidden');
    } else {
      this.render.addClass('hidden');
    }
  }
}
