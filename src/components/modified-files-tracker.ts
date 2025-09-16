/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement, ChatItemBodyRenderer } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { CollapsibleContent } from './collapsible-content';
import { MynahUIGlobalEvents } from '../helper/events';
import { MynahEventNames, ChatItem } from '../static';
import testIds from '../helper/test-ids';

export interface ModifiedFilesTrackerProps {
  tabId: string;
  visible?: boolean;
  chatItem?: ChatItem;
}

export class ModifiedFilesTracker {
  render: ExtendedHTMLElement;
  private readonly props: ModifiedFilesTrackerProps;
  private readonly collapsibleContent: CollapsibleContent;
  private readonly contentWrapper: ExtendedHTMLElement;
  public titleText: string = 'Modified Files';

  constructor (props: ModifiedFilesTrackerProps) {
    StyleLoader.getInstance().load('components/_modified-files-tracker.scss');
    this.props = { visible: true, ...props };

    this.contentWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-modified-files-content' ]
    });

    this.collapsibleContent = new CollapsibleContent({
      title: this.titleText,
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

    this.updateContent();
  }

  private getFilePillsRenderer (): ChatItemBodyRenderer[] {
    const fileList = this.props.chatItem?.fileList;
    if (fileList == null) return [];

    const filePills = fileList.filePaths?.map(filePath => {
      const fileName = fileList.details?.[filePath]?.visibleName ?? filePath;
      const isDeleted = fileList.deletedFiles?.includes(filePath) === true;

      return {
        type: 'span' as const,
        classNames: [
          'mynah-chat-item-tree-file-pill',
          ...(isDeleted ? [ 'mynah-chat-item-tree-file-pill-deleted' ] : [])
        ],
        children: [ fileName ],
        events: {
          click: () => {
            if (fileList.details?.[filePath]?.clickable === false) {
              return;
            }
            MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_CLICK, {
              tabId: this.props.tabId,
              messageId: this.props.chatItem?.messageId,
              filePath,
              deleted: isDeleted
            });
          }
        }
      };
    }) ?? [];

    return filePills;
  }

  private updateContent (): void {
    const filePills = this.getFilePillsRenderer();
    this.contentWrapper.clear();

    if (filePills.length === 0) {
      this.contentWrapper.update({
        children: [ {
          type: 'div',
          classNames: [ 'mynah-modified-files-empty-state' ],
          children: [ 'No modified files' ]
        } ]
      });
    } else {
      this.contentWrapper.update({ children: filePills });
    }
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
}
