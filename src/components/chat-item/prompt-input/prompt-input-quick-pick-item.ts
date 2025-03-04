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
  private readonly descriptionText: ExtendedHTMLElement;
  private readonly description: ExtendedHTMLElement;

  constructor (props: PromptInputQuickPickItemProps) {
    this.props = props;

    this.descriptionText = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-chat-command-selector-command-description-text' ],
      children: [ this.props.quickPickItem.description ?? '' ]
    });
    this.description =
      DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-command-selector-command-description' ],
        children: [ this.descriptionText ]
      });

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
          ? [ this.description ]
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

    setTimeout(() => this.updateTruncation(), 5);
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

  private readonly updateTruncation = (): void => {
    if (this.props.quickPickItem.description == null) {
      return;
    }
    const text = this.props.quickPickItem.description;

    // Create a temporary span element to measure the text
    const measureElement = document.createElement('span');
    measureElement.style.visibility = 'hidden';
    measureElement.style.position = 'absolute';
    measureElement.style.whiteSpace = 'nowrap';
    document.body.appendChild(measureElement);

    // Measure the full text
    measureElement.textContent = text;
    const textWidth = measureElement.offsetWidth;

    // Get the max width from the container
    const maxWidth = this.description.offsetWidth;

    // If the text fits, update with the original
    if (textWidth <= maxWidth) {
      document.body.removeChild(measureElement);
      this.descriptionText.innerText = text;
      return;
    }

    const ellipsis = '...';
    let left = 0; let right = text.length;

    while (left < right) {
      const middle = Math.floor((left + right) / 2);
      const truncated = text.slice(0, middle) + ellipsis + text.slice(-middle);
      measureElement.textContent = truncated;

      if (measureElement.offsetWidth > maxWidth) {
        right = middle - 1;
      } else {
        left = middle + 1;
      }
    }

    // Clean up by removing the temporary measure element
    document.body.removeChild(measureElement);

    // Update the truncated text
    this.descriptionText.innerText = text.slice(0, right) + ellipsis + text.slice(-right);
  };
}
