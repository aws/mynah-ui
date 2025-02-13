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
              new Icon({
                icon: this.props.quickPickItem.icon
              }).render
            ]
          : []),
        {
          type: 'div',
          classNames: [ 'mynah-chat-command-selector-command-container' ],
          children: [
            {
              type: 'div',
              classNames: [ 'mynah-chat-command-selector-command-name' ],
              children: [ this.props.quickPickItem.command ]
            },
            ...(this.props.quickPickItem.description !== undefined
              ? [ {
                  type: 'div',
                  classNames: [ 'mynah-chat-command-selector-command-description' ],
                  children: [ this.props.quickPickItem.description ]
                } ]
              : [])
          ]
        }
      ]
    });
  }

  public readonly setFocus = (isFocused: boolean): void => {
    if (isFocused) {
      this.render.addClass('target-command');
    } else {
      this.render.removeClass('target-command');
    }
  };

  public readonly getItem = (): QuickActionCommand => {
    return this.props.quickPickItem;
  };
}
