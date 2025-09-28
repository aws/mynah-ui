/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { MynahUIGlobalEvents } from '../helper/events';
import { MynahEventNames, ChatItemContent } from '../static';
import { Icon } from './icon';
import testIds from '../helper/test-ids';
import { MynahUITabsStore } from '../helper/tabs-store';

export interface ModifiedFilesTrackerProps {
  tabId: string;
  visible?: boolean;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly collapsibleContent: CollapsibleContent;
  public titleText: string = 'No files modified!';

  constructor (props: ModifiedFilesTrackerProps) {
    console.log('[ModifiedFilesTracker] Constructor called with props:', props);
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

    const tabDataStore = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId);

    console.log('[ModifiedFilesTracker] Setting up modifiedFilesList subscription');
    tabDataStore.subscribe('modifiedFilesList', (fileList: ChatItemContent['fileList'] | null) => {
      console.log('[ModifiedFilesTracker] modifiedFilesList updated:', fileList);
      this.renderModifiedFiles(fileList);
    });

    tabDataStore.subscribe('newConversation', (newValue: boolean) => {
      console.log('[ModifiedFilesTracker] newConversation subscription:', newValue);
      if (newValue) {
        console.log('[ModifiedFilesTracker] Clearing files for new conversation');
        this.clearContent();
      }
    });

    tabDataStore.subscribe('modifiedFilesTitle', (newTitle: string) => {
      console.log('[ModifiedFilesTracker] Title updated:', newTitle);
      if (newTitle !== '') {
        this.collapsibleContent.updateTitle(newTitle);
      }
    });

    const initialFilesList = tabDataStore.getValue('modifiedFilesList');
    console.log('[ModifiedFilesTracker] Initial modifiedFilesList:', initialFilesList);
    this.renderModifiedFiles(initialFilesList);
  }

  private clearContent (): void {
    console.log('[ModifiedFilesTracker] clearContent called');
    const contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
    if (contentWrapper != null) {
      contentWrapper.innerHTML = '';
      console.log('[ModifiedFilesTracker] Content cleared');
    }
  }

  private renderModifiedFiles (fileList: ChatItemContent['fileList'] | null): void {
    console.log('[ModifiedFilesTracker] renderModifiedFiles called with:', fileList);

    const contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
    if (contentWrapper == null) {
      console.warn('[ModifiedFilesTracker] Content wrapper not found');
      return;
    }

    contentWrapper.innerHTML = '';

    // Check if fileList is null, empty object, or has no filePaths
    if (fileList == null || fileList.filePaths == null || fileList.filePaths.length === 0) {
      console.log('[ModifiedFilesTracker] No files in data, showing empty state');
      this.renderEmptyState(contentWrapper);
      return;
    }

    console.log('[ModifiedFilesTracker] Rendering', fileList.filePaths.length, 'files');
    this.renderFilePills(contentWrapper, fileList);
  }

  private renderEmptyState (contentWrapper: Element): void {
    console.log('[ModifiedFilesTracker] Rendering empty state');
    const emptyState = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-empty-state' ],
      children: [ 'No modified files' ]
    });
    contentWrapper.appendChild(emptyState);
  }

  private renderFilePills (contentWrapper: Element, fileList: ChatItemContent['fileList']): void {
    console.log('[ModifiedFilesTracker] renderFilePills called with fileList:', fileList);
    if (fileList?.filePaths == null || fileList.filePaths.length === 0) {
      console.warn('[ModifiedFilesTracker] No filePaths in fileList');
      return;
    }
    const pillsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-pills-container' ],
      children: fileList.filePaths.map(filePath => {
        const details = fileList.details?.[filePath];
        const fileName = details?.visibleName ?? filePath;
        const isDeleted = fileList.deletedFiles?.includes(filePath) === true;
        const statusIcon = details?.icon ?? 'ok-circled';
        const messageId = details?.data?.messageId;

        console.log('[ModifiedFilesTracker] Creating pill for file:', { filePath, fileName, isDeleted, messageId });

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
                    console.log('[ModifiedFilesTracker] File click ignored - not clickable:', filePath);
                    return;
                  }
                  console.log('[ModifiedFilesTracker] File clicked:', filePath);
                  event.preventDefault();
                  event.stopPropagation();
                  MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_CLICK, {
                    tabId: this.props.tabId,
                    messageId,
                    filePath,
                    deleted: isDeleted,
                    fileDetails: details
                  });
                }
              }
            }
          ]
        };
      })
    });
    contentWrapper.appendChild(pillsContainer);

    // Add undo buttons if available
    const undoButtons = (fileList as { undoButtons?: Array<{ id: string; text: string; status?: string }> }).undoButtons;
    if (undoButtons != null && undoButtons.length > 0) {
      const undoButtonsContainer = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-undo-buttons' ],
        children: undoButtons.map((button) => ({
          type: 'button',
          classNames: [ 'mynah-button', `mynah-button-${button.status ?? 'clear'}` ],
          children: [ button.text ],
          events: {
            click: (event: Event) => {
              console.log('[ModifiedFilesTracker] Undo button clicked:', button.id);
              event.preventDefault();
              event.stopPropagation();
              MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
                tabId: this.props.tabId,
                messageId: 'modified-files-tracker',
                buttonId: button.id
              });
            }
          }
        }))
      });
      contentWrapper.appendChild(undoButtonsContainer);
    }

    console.log('[ModifiedFilesTracker] File pills rendered successfully');
  }

  public setVisible (visible: boolean): void {
    console.log('[ModifiedFilesTracker] setVisible called:', visible);
    if (visible) {
      this.render.removeClass('hidden');
    } else {
      this.render.addClass('hidden');
    }
  }
}
