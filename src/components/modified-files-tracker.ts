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
import { MoreContentIndicator } from './more-content-indicator';

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
  private scrollableContainer: ExtendedHTMLElement | null = null;
  private moreContentIndicator: MoreContentIndicator | null = null;

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

    if (this.props.chatItem != null) {
      this.addChatItem(this.props.chatItem);
    } else {
      this.renderAllContent();
    }
    this.setVisibility();
  }

  private renderAllContent (): void {
    if (this.contentWrapper === null) {
      this.contentWrapper = this.collapsibleContent.render.querySelector('.mynah-collapsible-content-label-content-wrapper');
      if (this.contentWrapper === null) return;

      // Stop propagation on content wrapper to prevent collapsing
      this.contentWrapper.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      // Create scrollable container
      this.scrollableContainer = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-modified-files-scrollable-container' ],
        children: []
      });

      // Create more content indicator
      this.moreContentIndicator = new MoreContentIndicator({
        onClick: () => this.scrollToBottom()
      });

      this.contentWrapper.appendChild(this.scrollableContainer);
      this.contentWrapper.appendChild(this.moreContentIndicator.render);

      // Add scroll listener to show/hide indicator
      this.scrollableContainer.addEventListener('scroll', () => {
        this.updateScrollIndicator();
      });
    }

    if (this.scrollableContainer !== null) {
      this.scrollableContainer.innerHTML = '';

      if (this.chatItems.size > 0) {
        this.renderAllItems(this.scrollableContainer);
      } else {
        this.renderEmptyState(this.scrollableContainer);
      }

      // Update scroll indicator after content changes
      setTimeout(() => this.updateScrollIndicator(), 0);
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
    let hasFilesRendered = false;

    // First pass: render all items in order, tracking if files were rendered
    this.chatItems.forEach((chatItem) => {
      if (chatItem.header?.fileList != null) {
        this.renderFileList(contentWrapper, chatItem);
        hasFilesRendered = true;
      } else if (chatItem.buttons != null && hasFilesRendered) {
        this.renderFileList(contentWrapper, chatItem);
      }
    });

    // Second pass: clean up undo-all buttons that have no preceding files
    const toDeleteChatItems: string[] = [];
    let hasSeenFiles = false;
    this.chatItems.forEach((chatItem) => {
      if (chatItem.header?.fileList != null) {
        hasSeenFiles = true;
      } else if (chatItem.buttons != null && !hasSeenFiles) {
        toDeleteChatItems.push(chatItem.messageId ?? '');
      }
    });
    toDeleteChatItems.forEach((messageId) => {
      this.removeChatItem(messageId);
    });
  }

  private renderFileList (contentWrapper: Element, chatItem: ChatItem): void {
    const fileList = chatItem.header?.fileList;
    if (chatItem.messageId == null) return;

    // Handle undo-all buttons (no file list)
    if (fileList == null) {
      if (chatItem.buttons == null) return;

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
      return;
    }

    // Handle regular file lists
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
        flatList: chatItem.header?.fileList?.flatList ?? true,
        actions: (actions != null) ? { [filePath]: actions[filePath] } : undefined,
        details: (details != null) ? { [filePath]: details[filePath] } : undefined,
        hideFileCount: chatItem.header?.fileList?.hideFileCount ?? true,
        collapsed: false,
        referenceSuggestionLabel: '', // don't need this field to be set
        references: [], // don't need this field to be set
        onRootCollapsedStateChange: () => {} // not useful for this component
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

  private updateTitleText (chatItem: ChatItem): void {
    // Using chatItem itself, if other than string is passed for title
    if (chatItem.forModifiedFilesTracker?.title !== undefined && chatItem.title !== '') {
      this.collapsibleContent.updateTitle(chatItem.forModifiedFilesTracker.title);
    }
  }

  private setVisibility (): void {
    this.isVisible = this.chatItems.size !== 0;
    if (!this.isVisible) {
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
      this.updateTitleText(chatItem);
      this.renderAllContent();
      this.setVisibility();
    }
  }

  public removeChatItem (messageId: string): void {
    if (this.chatItems.has(messageId)) {
      this.chatItems.delete(messageId);
      this.renderAllContent();
      this.setVisibility();
    }
  }

  public clear (): void {
    this.chatItems.clear();
    this.renderAllContent();
    this.setVisibility();
  }

  private scrollToBottom (): void {
    if (this.scrollableContainer !== null) {
      this.scrollableContainer.scrollTop = this.scrollableContainer.scrollHeight;
    }
  }

  private updateScrollIndicator (): void {
    if (this.scrollableContainer === null || this.moreContentIndicator === null) return;

    const { scrollTop, scrollHeight, clientHeight } = this.scrollableContainer;
    const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 5;

    if (isScrolledToBottom || scrollHeight <= clientHeight) {
      this.moreContentIndicator.render.style.display = 'none';
    } else {
      this.moreContentIndicator.render.style.display = 'block';
    }
  }
}
