import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent, MynahUIGlobalEvents } from '../../helper/events';
import { FileNode, TreeNode } from '../../helper/file-tree';
import { MynahEventNames } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';

export interface ChatItemTreeViewProps {
  node: TreeNode;
  depth?: number;
  tabId: string;
  messageId: string;
}

export class ChatItemTreeView {
  private readonly node: TreeNode;
  private isOpen: boolean;
  private readonly depth: number;
  private readonly tabId: string;
  private readonly messageId: string;
  render: ExtendedHTMLElement;

  constructor (props: ChatItemTreeViewProps) {
    this.node = props.node;
    this.tabId = props.tabId;
    this.messageId = props.messageId;
    this.isOpen = true;
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
          classNames: [ 'mynah-chat-item-pull-request-item' ],
          children: [ new ChatItemTreeView({ node: childNode, depth: this.depth + 1, tabId: this.tabId, messageId: this.messageId }).render ],
        })
      )
      : [];
    return folderChildren;
  }

  buildFolderNode (): ExtendedHTMLElement[] {
    if (this.node.type !== 'folder') return [];

    const folderItem = new Button({
      icon: new Icon({ icon: this.isOpen ? MynahIcons.DOWN_OPEN : MynahIcons.RIGHT_OPEN }).render,
      label: `${this.node.name} ${this.node.children.length} files`,
      primary: false,
      onClick: e => {
        cancelEvent(e);
        this.isOpen = !this.isOpen;
        this.updateTree();
      },
    }).render;
    folderItem.style.paddingLeft = `${15 * this.depth}px`;
    const childrenItems = this.buildFolderChildren();
    return [ folderItem, ...childrenItems ];
  }

  buildFileNode (): ExtendedHTMLElement[] {
    if (this.node.type !== 'file') return [];

    const fileItem = new Button({
      // Eye is temporary until file addition/file removal is finished
      icon: new Icon({ icon: MynahIcons.DOC }).render,
      label: this.node.name,
      primary: false,
      onClick: () => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.OPEN_DIFF, {
          tabId: this.tabId,
          messageId: this.messageId,
          filePath: (this.node as FileNode).filePath,
          deleted: (this.node as FileNode).deleted,
        });
      },
    }).render;
    fileItem.style.paddingLeft = `${15 * this.depth}px`;
    if (this.node.deleted) {
      fileItem.style.textDecoration = 'line-through';
    }
    return [ fileItem ];
  }
}
