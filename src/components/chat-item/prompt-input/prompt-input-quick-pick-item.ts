import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { cancelEvent } from '../../../helper/events';
import testIds from '../../../helper/test-ids';
import { QuickActionCommand } from '../../../static';
import { Icon } from '../../icon';

export interface PromptInputQuickPickItemProps {
  quickPickItem: QuickActionCommand;
  onSelect: (quickPickItem: QuickActionCommand) => void;
}

export class PromptInputQuickPickItem {
  render: ExtendedHTMLElement;
  private readonly props: PromptInputQuickPickItemProps;

  constructor (props: PromptInputQuickPickItemProps) {
    this.props = props;
    const descriptionSplitPosition = 20;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.quickPickItem,
      classNames: [ 'mynah-chat-command-selector-command' ],
      attributes: {
        disabled: this.props.quickPickItem.disabled ?? 'false',
      },
      events: {
        click: (e) => {
          cancelEvent(e);
          if (this.props.quickPickItem.disabled !== true) {
            this.props.onSelect(this.props.quickPickItem);
          }
        }
      },
      children: [
        ...(this.props.quickPickItem.icon !== undefined
          ? [
              {
                type: 'div',
                classNames: [ 'mynah-chat-command-selector-icon' ],
                children: [
                  new Icon({
                    icon: this.props.quickPickItem.icon
                  }).render
                ]
              }
            ]
          : []),
        {
          type: 'div',
          classNames: [ 'mynah-chat-command-selector-command-name' ],
          innerHTML: this.props.quickPickItem.command
        },
        ...(this.props.quickPickItem.description !== undefined
          ? [ {
              type: 'div',
              classNames: [ 'mynah-chat-command-selector-command-description' ],
              children: [ {
                type: 'span',
                innerHTML: this.props.quickPickItem.description.slice(0, descriptionSplitPosition).replace(/ /g, '&nbsp;')
              }, {
                type: 'span',
                innerHTML: `<bdi>${this.props.quickPickItem.description.slice(descriptionSplitPosition).replace(/ /g, '&nbsp;')}</bdi>`
              } ]
            } ]
          : []),
        ...((this.props.quickPickItem.children != null) && this.props.quickPickItem.children.length > 0
          ? [
              {
                type: 'div',
                classNames: [ 'mynah-chat-command-selector-command-arrow-icon' ],
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

  public readonly getItem = (): QuickActionCommand => {
    return this.props.quickPickItem;
  };
}
