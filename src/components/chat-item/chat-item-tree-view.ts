import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent, MynahUIGlobalEvents } from '../../helper/events';
import { FileNode, TreeNode } from '../../helper/file-tree';
import { FileNodeAction, MynahEventNames } from '../../static';
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
      classNames: [ 'mynah-chat-item-tree-view-button' ],
      label: DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-item-tree-view-button-title' ],
        children: [
          {
            type: 'span',
            children: [ this.node.name ]
          },
          {
            type: 'span',
            classNames: [ 'mynah-chat-item-tree-view-button-weak-title' ],
            children: [ `${this.node.children.length} ${Config.getInstance().config.texts.files}` ]
          }
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

    const fileItem = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-chat-item-tree-view-file-item',
        this.node.details?.status !== undefined ? `mynah-chat-item-tree-view-file-item-status-${this.node.details?.status}` : '',
      ],
      events: {
        click: () => {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.OPEN_DIFF, {
            tabId: this.tabId,
            messageId: this.messageId,
            filePath: (this.node as FileNode).filePath,
            deleted: (this.node as FileNode).deleted,
          });
        }
      },
      children: [
        {
          type: 'div',
          classNames: [
            'mynah-chat-item-tree-view-file-item-title',
            this.node.deleted ? 'mynah-chat-item-tree-view-file-item-deleted' : '',
          ],
          children: [ {
            type: 'span',
            children: [ this.node.name ]
          } ]
        },
        ...(this.node.details !== undefined
          ? [ {
              type: 'div',
              classNames: [ 'mynah-chat-item-tree-view-file-item-details' ],
              children: [
                ...(this.node.details.icon !== undefined ? [ new Icon({ icon: this.node.details.icon }).render ] : []),
                ...(this.node.details.label !== undefined
                  ? [ {
                      type: 'span',
                      classNames: [ 'mynah-chat-item-tree-view-file-item-details-text' ],
                      children: [ this.node.details.label ]
                    } ]
                  : []),
              ]
            } ]
          : []),
        ...(this.node.actions !== undefined
          ? [ {
              type: 'div',
              classNames: [ 'mynah-chat-item-tree-view-file-item-actions' ],
              children: this.node.actions.map((action: FileNodeAction) => new Button({
                icon: new Icon({ icon: action.icon }).render,
                ...(action.label !== undefined ? { label: action.label } : {}),
                attributes: {
                  title: action.description ?? ''
                },
                classNames: [ 'mynah-icon-button', action.status ?? '' ],
                primary: false,
                onClick: (e) => {
                  cancelEvent(e);
                  MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_ACTION_CLICK, {
                    tabId: this.tabId,
                    messageId: this.messageId,
                    filePath: (this.node as FileNode).filePath,
                    actionName: action.name,
                  });
                },
              }).render)
            } ]
          : []),
      ]
    });

    return [ fileItem ];
  }
}
