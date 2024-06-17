import { marked } from 'marked';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { FileNodeAction, MynahEventNames, TreeNodeDetails } from '../../static';
import { Button } from '../button';
import { Card } from '../card/card';
import { CardBody } from '../card/card-body';
import { Icon, MynahIcons } from '../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay';

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

const PREVIEW_DELAY = 250;
export class ChatItemTreeFile {
  render: ExtendedHTMLElement;
  private fileTooltip: Overlay | null;
  private fileTooltipTimeout: ReturnType<typeof setTimeout>;
  constructor (props: ChatItemTreeFileProps) {
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-chat-item-tree-view-file-item',
        props.details?.status !== undefined ? `mynah-chat-item-tree-view-file-item-status-${props.details?.status}` : '',
      ],
      events: {
        click: () => {
          this.hideTooltip();
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FILE_CLICK, {
            tabId: props.tabId,
            messageId: props.messageId,
            filePath: props.filePath,
            deleted: props.deleted,
          });
        },
        ...(props.details?.description != null
          ? {
              mouseenter: (e: MouseEvent) => {
                const tooltipText = marked(props.details?.description ?? '', { breaks: true }) as string;
                this.showTooltip(tooltipText, OverlayVerticalDirection.CENTER, OverlayHorizontalDirection.TO_RIGHT);
              },
              mouseout: this.hideTooltip
            }
          : {})
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
                  this.hideTooltip();
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

  private readonly showTooltip = (content: string, vDir?: OverlayVerticalDirection, hDir?: OverlayHorizontalDirection): void => {
    if (content.trim() !== '') {
      clearTimeout(this.fileTooltipTimeout);
      this.fileTooltipTimeout = setTimeout(() => {
        this.fileTooltip = new Overlay({
          background: true,
          closeOnOutsideClick: false,
          referenceElement: this.render,
          dimOutside: false,
          removeOtherOverlays: true,
          verticalDirection: vDir ?? OverlayVerticalDirection.TO_TOP,
          horizontalDirection: hDir ?? OverlayHorizontalDirection.CENTER,
          children: [
            new Card({
              border: false,
              children: [
                new CardBody({
                  body: content
                }).render
              ]
            }).render
          ],
        });
      }, PREVIEW_DELAY);
    }
  };

  public readonly hideTooltip = (): void => {
    if (this.fileTooltipTimeout != null) {
      clearTimeout(this.fileTooltipTimeout);
    }
    this.fileTooltip?.close();
    this.fileTooltip = null;
  };
}
