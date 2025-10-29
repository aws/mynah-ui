/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { ChatItem, MynahEventNames } from '../static';
import testIds from '../helper/test-ids';
import { ChatItemTreeViewWrapper } from './chat-item/chat-item-tree-view-wrapper';
import { ChatItemButtonsWrapper } from './chat-item/chat-item-buttons';
import { MynahUIGlobalEvents } from '../helper/events';

export interface ModifiedFilesTrackerProps {
  tabId: string;
  isVisible?: boolean;
  chatItem?: ChatItem;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly collapsibleContent: CollapsibleContent;
  private readonly chatItems: Map<string, ChatItem> = new Map();
  private isVisible: boolean;
  private contentWrapper: Element | null = null;
  private renderTimeout: number | null = null;
  private clickHandler: ((e: Event) => void) | null = null;

  constructor (props: ModifiedFilesTrackerProps) {
    StyleLoader.getInstance().load('components/_modified-files-tracker.scss');
    this.props = props;
    this.isVisible = props.isVisible ?? false;

    this.collapsibleContent = new CollapsibleContent({
      title: '',
      initialCollapsedState: true,
      children: [],
      classNames: [ 'mynah-modified-files-tracker' ],
      testId: testIds.modifiedFilesTracker.wrapper
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-tracker-wrapper' ],
      testId: testIds.modifiedFilesTracker.container,
      children: [ this.collapsibleContent.render ]
    });

    this.setVisibility(this.isVisible);

    if (this.props.chatItem != null) {
      this.addChatItem(this.props.chatItem);
    } else {
      this.renderAllContent();
    }
  }

  private renderAllContent (): void {
    if (this.renderTimeout !== null) {
      clearTimeout(this.renderTimeout);
    }
    this.renderTimeout = window.setTimeout(() => {
      this.doRender();
      this.renderTimeout = null;
    }, 16);
  }

  private doRender (): void {
    if (this.contentWrapper === null) {
      this.contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
      if (this.contentWrapper === null) return;

      this.clickHandler = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };
      this.contentWrapper.addEventListener('click', this.clickHandler);
    }

    this.contentWrapper.innerHTML = '';

    if (this.chatItems.size > 0) {
      this.renderAllItems(this.contentWrapper);
    } else {
      this.renderEmptyState(this.contentWrapper);
    }
  }

  private renderEmptyState (contentWrapper: Element): void {
    contentWrapper.appendChild(DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-empty-state' ],
      children: [ 'No modified files' ]
    }));
  }

  private renderAllItems (contentWrapper: Element): void {
    this.chatItems.forEach((chatItem) => {
      if (chatItem.header?.fileList != null) {
        this.renderFileList(contentWrapper, chatItem);
      }
    });

    // Render undo all buttons at the end
    this.chatItems.forEach((chatItem) => {
      if (chatItem.buttons != null && chatItem.header?.fileList == null) {
        this.renderUndoAllButton(contentWrapper, chatItem);
      }
    });
  }

  private renderFileList (contentWrapper: Element, chatItem: ChatItem): void {
    const fileList = chatItem.header?.fileList;
    if (fileList == null || chatItem.messageId == null) return;
    const { filePaths = [], deletedFiles = [], actions, details } = fileList;

    // Create a wrapper for each file group
    const fileGroupWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-group' ],
      children: []
    });

    // Render each file individually with its own buttons
    filePaths.forEach(filePath => {
      const singleFileWrapper = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-single-file' ],
        children: []
      });

      // Create horizontal container for file and buttons
      const horizontalContainer = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-horizontal-container' ],
        children: []
      });

      // Render the file tree for single file
      const fileTreeWrapper = new ChatItemTreeViewWrapper({
        tabId: this.props.tabId,
        messageId: chatItem.messageId ?? '',
        files: [ filePath ],
        cardTitle: '',
        rootTitle: undefined,
        deletedFiles: deletedFiles.filter(df => df === filePath),
        flatList: true,
        actions: (actions != null) ? { [filePath]: actions[filePath] } : undefined,
        details: (details != null) ? { [filePath]: details[filePath] } : undefined,
        hideFileCount: true,
        collapsed: false,
        referenceSuggestionLabel: '',
        references: [],
        onRootCollapsedStateChange: () => {}
      });

      horizontalContainer.appendChild(fileTreeWrapper.render);

      // Add buttons for this specific file if they exist
      if (chatItem.header?.buttons != null && Array.isArray(chatItem.header.buttons) && chatItem.header.buttons.length > 0) {
        const buttonsWrapper = new ChatItemButtonsWrapper({
          tabId: this.props.tabId,
          classNames: [ 'mynah-modified-files-file-buttons' ],
          formItems: null,
          buttons: chatItem.header.buttons,
          onActionClick: action => {
            MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
              tabId: this.props.tabId,
              messageId: chatItem.messageId,
              actionId: action.id,
              actionText: action.text,
              filePath
            });
          }
        });
        horizontalContainer.appendChild(buttonsWrapper.render);
      }

      singleFileWrapper.appendChild(horizontalContainer);
      fileGroupWrapper.appendChild(singleFileWrapper);
    });

    contentWrapper.appendChild(fileGroupWrapper);
  }

  private renderUndoAllButton (contentWrapper: Element, chatItem: ChatItem): void {
    if (chatItem.messageId === undefined || chatItem.messageId === null || chatItem.messageId === '' || chatItem.buttons == null) {
      return;
    }

    const buttonContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-undo-all-container' ],
      children: []
    });

    const buttonsWrapper = new ChatItemButtonsWrapper({
      tabId: this.props.tabId,
      classNames: [ 'mynah-modified-files-undo-all-buttons' ],
      formItems: null,
      buttons: chatItem.buttons,
      onActionClick: action => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.BODY_ACTION_CLICKED, {
          tabId: this.props.tabId,
          messageId: chatItem.messageId,
          actionId: action.id,
          actionText: action.text
        });

        if (action.keepCardAfterClick === false && chatItem.messageId != null) {
          this.removeChatItem(chatItem.messageId);
        }
      }
    });
    buttonContainer.appendChild(buttonsWrapper.render);
    contentWrapper.appendChild(buttonContainer);
  }

  private updateTitleText (chatItem: ChatItem): void {
    // Using chatItem itself, if other than string is passed for title
    if (chatItem.forModifiedFilesTracker?.title !== undefined && chatItem.title !== '') {
      this.collapsibleContent.updateTitle(chatItem.forModifiedFilesTracker.title);
    }
  }

  private setVisibility (isVisible: boolean): void {
    this.isVisible = isVisible;
    if (!isVisible) {
      this.render.classList.add('hidden');
    } else {
      this.render.classList.remove('hidden');
    }
  }

  public addChatItem (chatItem: ChatItem): void {
    if (chatItem.messageId != null && (chatItem.header?.fileList != null || chatItem.buttons != null)) {
      const existing = this.chatItems.get(chatItem.messageId);
      if (existing !== undefined && JSON.stringify(existing) === JSON.stringify(chatItem)) {
        return;
      }

      this.chatItems.set(chatItem.messageId, chatItem);
      this.setVisibility(chatItem.forModifiedFilesTracker?.isVisible ?? true);
      this.updateTitleText(chatItem);
      this.renderAllContent();
    }
  }

  public removeChatItem (messageId: string): void {
    if (this.chatItems.has(messageId)) {
      this.chatItems.delete(messageId);
      this.renderAllContent();
      if (this.chatItems.size === 0) {
        this.setVisibility(false);
      }
    }
  }

  public clear (): void {
    if (this.renderTimeout !== null) {
      clearTimeout(this.renderTimeout);
      this.renderTimeout = null;
    }
    if (this.contentWrapper !== null && this.clickHandler !== null) {
      this.contentWrapper.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }

    this.chatItems.clear();
    this.renderAllContent();
    this.setVisibility(false);
  }
}
