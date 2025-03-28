import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent } from '../../helper/events';
import testIds from '../../helper/test-ids';
import { DetailedListItem } from '../../static';
import { Icon } from '../icon';

export interface DetailedListItemWrapperProps {
  listItem: DetailedListItem;
  onSelect: (detailedListItem: DetailedListItem) => void;
}

export class DetailedListItemWrapper {
  render: ExtendedHTMLElement;
  private readonly props: DetailedListItemWrapperProps;

  constructor (props: DetailedListItemWrapperProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.quickPickItem,
      classNames: [ 'mynah-detailed-list-item' ],
      attributes: {
        disabled: this.props.listItem.disabled ?? 'false',
      },
      events: {
        click: (e) => {
          cancelEvent(e);
          if (this.props.listItem.disabled !== true) {
            this.props.onSelect(this.props.listItem);
          }
        }
      },
      children: [
        ...(this.props.listItem.icon !== undefined
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
          classNames: [ 'mynah-detailed-list-item-name' ],
          innerHTML: this.props.listItem.title ?? this.props.listItem.name
        },
        ...(this.props.listItem.description !== undefined
          ? [ {
              type: 'div',
              classNames: [ 'mynah-detailed-list-item-description' ],
              innerHTML: `<bdi>${this.props.listItem.description.replace(/ /g, '&nbsp;')}</bdi>`
            } ]
          : []),
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
          : [])
      ]
    });
  }

  public readonly setFocus = (isFocused: boolean): void => {
    if (isFocused) {
      this.render.addClass('target-command');
      this.render.scrollIntoView(true);
    } else {
      this.render.removeClass('target-command');
    }
  };

  public readonly getItem = (): DetailedListItem => {
    return this.props.listItem;
  };
}
