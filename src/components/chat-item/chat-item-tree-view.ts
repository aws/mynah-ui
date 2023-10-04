import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent, MynahUIGlobalEvents } from '../../helper/events';
import { FileNode, TreeNode } from '../../helper/file-tree';
import { MynahEventNames } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';

export interface ChatItemTreeViewProps {
  node: TreeNode;
}

export class ChatItemTreeView {
  private readonly node: TreeNode;
  private isOpen: boolean;
  render: ExtendedHTMLElement;

  constructor (props: ChatItemTreeViewProps) {
    this.node = props.node;
    this.isOpen = true;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: this.getClassNames(),
      children: [
        ...this.node.type === 'folder' ? this.buildFolderNode() : this.buildFileNode()
      ]
    });
  }

  getClassNames (): string[] {
    return [ 'mynah-chat-item-tree-view', this.node.type === 'file' ? 'mynah-chat-tree-view-file' : `mynah-chat-tree-view-folder-${this.isOpen ? 'open' : 'closed'}` ];
  }

  updateTree (): void {
    this.render.update({
      classNames: this.getClassNames(),
      children: [ ...this.node.type === 'folder' ? this.buildFolderNode() : this.buildFileNode()
      ]
    });
  }

  buildFolderChildren (): ExtendedHTMLElement[] {
    if (this.node.type !== 'folder') return [];

    const folderChildren = this.isOpen
      ? this.node.children.map((childNode) => DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-item-pull-request-item' ],
        children: [ new ChatItemTreeView({ node: childNode }).render ]
      }))
      : [];
    return folderChildren;
  }

  buildFolderNode (): ExtendedHTMLElement[] {
    if (this.node.type !== 'folder') return [];

    const folderItem = new Button({
      icon: new Icon({ icon: this.isOpen ? MynahIcons.MINUS : MynahIcons.PLUS }).render,
      label: this.node.name,
      onClick: (e) => {
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

    return [ new Button({
      label: this.node.name,
      onClick: () => {
        // FIXME: revisit this. should we even send the leftPath?
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.OPEN_DIFF, { leftPath: 'empty', rightPath: (this.node as FileNode).filePath });
      }
    }).render ];
  }
}
