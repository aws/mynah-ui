import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent } from '../../helper/events';
import { TreeNode } from '../../helper/file-tree';
import testIds from '../../helper/test-ids';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { ChatItemTreeFile } from './chat-item-tree-file';

export interface ChatItemTreeViewProps {
  node: TreeNode;
  depth?: number;
  tabId: string;
  messageId: string;
  hideFileCount?: boolean;
  collapsedByDefault?: boolean;
}

export class ChatItemTreeView {
  private readonly node: TreeNode;
  private isOpen: boolean;
  private readonly depth: number;
  private readonly tabId: string;
  private readonly messageId: string;
  private readonly hideFileCount: boolean;
  render: ExtendedHTMLElement;

  constructor (props: ChatItemTreeViewProps) {
    this.node = props.node;
    this.tabId = props.tabId;
    this.messageId = props.messageId;
    this.hideFileCount = props.hideFileCount ?? false;
    this.isOpen = !(props.collapsedByDefault ?? false);
    this.depth = props.depth ?? 0;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: this.getClassNames(),
      children: [ ...(this.node.type === 'folder' ? this.buildFolderNode() : this.buildFileNode()) ],
    });
  }

  getClassNames (): string[] {
    return [
      'mynah-chat-item-tree-view',
      this.node.type === 'file' ? 'mynah-chat-tree-view-file' : `mynah-chat-tree-view-folder-${this.isOpen ? 'open' : 'closed'}`,
    ];
  }

  updateTree (): void {
    this.render.update({
      classNames: this.getClassNames(),
      children: [ ...(this.node.type === 'folder' ? this.buildFolderNode() : this.buildFileNode()) ],
    });
  }

  buildFolderChildren (): ExtendedHTMLElement[] {
    if (this.node.type !== 'folder') return [];

    const folderChildren = this.isOpen
      ? this.node.children.map(childNode =>
        DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-chat-item-folder-child' ],
          children: [ new ChatItemTreeView({ node: childNode, depth: this.depth + 1, tabId: this.tabId, hideFileCount: this.hideFileCount, messageId: this.messageId }).render ],
        })
      )
      : [];
    return folderChildren;
  }

  buildFolderNode (): ExtendedHTMLElement[] {
    if (this.node.type !== 'folder') return [];

    const folderItem = new Button({
      testId: testIds.chatItem.fileTree.folder,
      icon: new Icon({ icon: this.isOpen ? MynahIcons.DOWN_OPEN : MynahIcons.RIGHT_OPEN }).render,
      classNames: [ 'mynah-chat-item-tree-view-button', this.depth === 0 ? 'mynah-chat-item-tree-view-root' : '' ],
      label: DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-item-tree-view-button-title' ],
        children: [
          new Icon({ icon: MynahIcons.FOLDER }).render,
          {
            type: 'span',
            children: [ this.node.name ]
          },
          ...(this.hideFileCount
            ? []
            : [ {
                type: 'span',
                classNames: [ 'mynah-chat-item-tree-view-button-weak-title' ],
                children: [ `${this.node.children.length} ${Config.getInstance().config.texts.files}` ]
              } ])
        ]
      }),
      primary: false,
      onClick: e => {
        cancelEvent(e);
        this.isOpen = !this.isOpen;
        this.updateTree();
      },
    }).render;
    const childrenItems = this.buildFolderChildren();
    return [ folderItem, ...childrenItems ];
  }

  buildFileNode (): ExtendedHTMLElement[] {
    if (this.node.type !== 'file') return [];

    const fileItem = new ChatItemTreeFile({
      fileName: this.node.name,
      filePath: this.node.filePath,
      originalFilePath: this.node.originalFilePath,
      tabId: this.tabId,
      messageId: this.messageId,
      details: this.node.details,
      deleted: this.node.deleted,
      actions: this.node.actions
    }).render;

    return [ fileItem ];
  }
}
