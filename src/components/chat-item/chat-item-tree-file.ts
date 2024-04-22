import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { FileNodeAction, MynahEventNames, TreeNodeDetails } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';

export interface ChatItemTreeFileProps {
  tabId: string;
  messageId: string;
  filePath: string;
  fileName: string;
  icon?: MynahIcons;
  deleted?: boolean;
  details?: TreeNodeDetails;
  actions?: FileNodeAction[];
}

export class ChatItemTreeFile {
  render: ExtendedHTMLElement;
  constructor (props: ChatItemTreeFileProps) {
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-chat-item-tree-view-file-item',
        props.details?.status !== undefined ? `mynah-chat-item-tree-view-file-item-status-${props.details?.status}` : '',
      ],
      events: {
        click: () => {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_CLICK, {
            tabId: props.tabId,
            messageId: props.messageId,
            filePath: props.filePath,
            deleted: props.deleted,
          });
        }
      },
      children: [
        ...(props.icon != null
          ? [ {
              type: 'span',
              classNames: [ 'mynah-chat-single-file-icon' ],
              children: [ new Icon({ icon: props.icon ?? MynahIcons.PAPER_CLIP }).render ]
            } ]
          : []),
        {
          type: 'div',
          classNames: [
            'mynah-chat-item-tree-view-file-item-title',
            props.deleted === true ? 'mynah-chat-item-tree-view-file-item-deleted' : '',
          ],
          children: [ {
            type: 'span',
            children: [ props.fileName ]
          } ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-tree-view-file-item-details' ],
          children: props.details != null
            ? [
                ...(props.details.icon !== undefined ? [ new Icon({ icon: props.details.icon }).render ] : []),
                ...(props.details.label !== undefined
                  ? [ {
                      type: 'span',
                      classNames: [ 'mynah-chat-item-tree-view-file-item-details-text' ],
                      children: [ props.details.label ]
                    } ]
                  : []),
              ]
            : []
        },
        ...(props.actions !== undefined
          ? [ {
              type: 'div',
              classNames: [ 'mynah-chat-item-tree-view-file-item-actions' ],
              children: props.actions.map((action: FileNodeAction) => new Button({
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
                    tabId: props.tabId,
                    messageId: props.messageId,
                    filePath: props.filePath,
                    actionName: action.name,
                  });
                },
              }).render)
            } ]
          : []),
      ]
    });
  }
}
