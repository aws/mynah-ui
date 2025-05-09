import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent } from '../../helper/events';
import testIds from '../../helper/test-ids';
import { ChatItemButton, DetailedListItem } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay';
import { parseMarkdown } from '../../helper/marked';

export interface DetailedListItemWrapperProps {
  listItem: DetailedListItem;
  descriptionTextDirection?: 'ltr' | 'rtl';
  onSelect?: (detailedListItem: DetailedListItem) => void;
  onActionClick?: (action: ChatItemButton) => void;
  selectable?: boolean;
  textDirection?: 'row' | 'column';
}

export class DetailedListItemWrapper {
  render: ExtendedHTMLElement;
  private readonly props: DetailedListItemWrapperProps;
  private actionMenuOverlay: Overlay | undefined;

  constructor (props: DetailedListItemWrapperProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.quickPickItem,
      classNames: [ 'mynah-detailed-list-item' ],
      attributes: {
        disabled: this.props.listItem.disabled ?? 'false',
        selectable: this.props.selectable ?? 'true',
      },
      events: {
        click: (e) => {
          cancelEvent(e);
          if (this.props.listItem.disabled !== true && this.props.selectable !== false) {
            this.props.onSelect?.(this.props.listItem);
          }
        }
      },
      children: [
        ...(this.props.listItem.icon != null
          ? [
              {
                type: 'div',
                classNames: [ 'mynah-detailed-list-icon' ],
                children: [
                  new Icon({
                    icon: this.props.listItem.icon
                  }).render
                ]
              }
            ]
          : []),
        {
          type: 'div',
          classNames: [ 'mynah-detailed-list-item-text', 'mynah-detailed-list-item-text-direction-' + (this.props.textDirection ?? 'row') ],
          children: [
            ...(this.props.listItem.title != null || this.props.listItem.name != null
              ? [ {
                  type: 'div',
                  classNames: [ 'mynah-detailed-list-item-name' ],
                  innerHTML: this.props.listItem.title ?? this.props.listItem.name
                } ]
              : []),
            ...(this.props.listItem.description != null
              ? [ {
                  type: 'div',
                  classNames: [ 'mynah-detailed-list-item-description', this.props.descriptionTextDirection ?? 'ltr' ],
                  innerHTML: `<bdi>${parseMarkdown(this.props.listItem.description.replace(/ /g, '&nbsp;').replace(/\n\s*\n/g, ' '), { includeLineBreaks: false, inline: true })}</bdi>`
                } ]
              : [])
          ]
        },
        ...((this.props.listItem.children != null) && this.props.listItem.children.length > 0
          ? [
              {
                type: 'div',
                classNames: [ 'mynah-detailed-list-item-arrow-icon' ],
                children: [
                  new Icon({ icon: 'right-open' }).render
                ]
              }
            ]
          : []),
        ...(this.props.listItem.actions != null
          ? this.props.listItem.groupActions !== false && this.props.listItem.actions.length > 1
            ? [ {
                type: 'div',
                classNames: [ 'mynah-detailed-list-item-actions' ],
                children: [ new Button({
                  testId: testIds.detailedList.actionMenu,
                  icon: new Icon({ icon: MynahIcons.ELLIPSIS }).render,
                  primary: false,
                  onClick: (e) => {
                    cancelEvent(e);
                    this.showActionMenuOverlay();
                  },
                }).render ]
              } ]
            : [ {
                type: 'div',
                classNames: [ 'mynah-detailed-list-item-actions' ],
                children: this.props.listItem.actions.map((action) => this.getActionButton(action, (this.props.listItem.groupActions === false)))
              } ]
          : []),
      ]
    });
  }

  public readonly setFocus = (isFocused: boolean, scrollIntoView: boolean): void => {
    if (isFocused) {
      this.render.addClass('target-command');
      if (scrollIntoView) {
        this.render.scrollIntoView(true);
      }
    } else {
      this.render.removeClass('target-command');
    }
  };

  public readonly getItem = (): DetailedListItem => {
    return this.props.listItem;
  };

  private readonly showActionMenuOverlay = (): void => {
    this.actionMenuOverlay = new Overlay({
      background: true,
      closeOnOutsideClick: true,
      referenceElement: this.render,
      dimOutside: false,
      removeOtherOverlays: true,
      verticalDirection: OverlayVerticalDirection.CENTER,
      horizontalDirection: OverlayHorizontalDirection.END_TO_LEFT,
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-detailed-list-item-actions-overlay' ],
          children: this.props.listItem.actions?.map((action) => this.getActionButton(action, true))
        }
      ],
    });
  };

  private getActionButton (action: ChatItemButton, showText?: boolean): ExtendedHTMLElement {
    return new Button({
      testId: testIds.detailedList.action,
      icon: action.icon ? new Icon({ icon: action.icon }).render : undefined,
      ...(showText === true ? { label: action.text } : {}),
      tooltip: action.description,
      primary: false,
      border: false,
      status: action.status,
      onClick: (e) => {
        cancelEvent(e);
        this.props.onActionClick?.(action);
        this.hideActionMenuOverlay();
      },
    }).render;
  }

  private readonly hideActionMenuOverlay = (): void => {
    if (this.actionMenuOverlay !== undefined) {
      this.actionMenuOverlay.close();
      this.actionMenuOverlay = undefined;
    }
  };
}
