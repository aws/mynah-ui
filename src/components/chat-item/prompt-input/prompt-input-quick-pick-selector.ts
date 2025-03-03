import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import testIds from '../../../helper/test-ids';
import { ChatItemButton, QuickActionCommandGroup, QuickActionCommand } from '../../../static';
import { CardBody } from '../../card/card-body';
import { ChatItemButtonsWrapper } from '../chat-item-buttons';
import { PromptInputQuickPickItem } from './prompt-input-quick-pick-item';

export interface PromptInputQuickPickSelectorProps {
  quickPickGroupList: QuickActionCommandGroup[];
  onQuickPickGroupActionClick: (action: ChatItemButton) => void;
  onQuickPickItemSelect: (quickPickItem: QuickActionCommand) => void;
}

export class PromptInputQuickPickSelector {
  render: ExtendedHTMLElement;
  private readonly props: PromptInputQuickPickSelectorProps;
  private activeTargetElementIndex: number = 0;
  private allSelectableQuickPickElements: PromptInputQuickPickItem[] = [];
  constructor (props: PromptInputQuickPickSelectorProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.quickPicksWrapper,
      classNames: [ 'mynah-chat-command-selector' ],
      children: this.getQuickPickGroups()
    });
  }

  private readonly getQuickPickGroups = (): ExtendedHTMLElement[] => {
    const groups = this.props.quickPickGroupList.map((quickPickGroup) => {
      return DomBuilder.getInstance().build({
        type: 'div',
        testId: testIds.prompt.quickPicksGroup,
        classNames: [ 'mynah-chat-command-selector-group' ],
        children: [
          ...(quickPickGroup.groupName !== undefined
            ? [ DomBuilder.getInstance().build({
                type: 'div',
                testId: testIds.prompt.quickPicksGroupTitle,
                classNames: [ 'mynah-chat-command-selector-group-title' ],
                children: [
                  new CardBody({
                    body: quickPickGroup.groupName
                  }).render,
                  new ChatItemButtonsWrapper({
                    buttons: (quickPickGroup.actions ?? []).map(action => ({
                      id: action.id,
                      status: action.status,
                      icon: action.icon,
                      text: action.text,
                      disabled: false
                    })),
                    onActionClick: (action, event) => {
                      this.props.onQuickPickGroupActionClick?.(action);
                    }
                  }).render
                ]
              }) ]
            : []),
          ...(quickPickGroup.commands.map(quickPickCommand => {
            const quickPickItemElement = new PromptInputQuickPickItem({
              quickPickItem: quickPickCommand,
              onSelect: () => {
                this.props.onQuickPickItemSelect(quickPickCommand);
              }
            });
            if (quickPickCommand.disabled !== true) {
              this.allSelectableQuickPickElements.push(quickPickItemElement);
            }
            return quickPickItemElement.render;
          }))
        ]
      });
    });
    this.allSelectableQuickPickElements[0]?.setFocus(true);
    return groups;
  };

  public readonly changeTarget = (direction: 'up' | 'down'): void => {
    if (this.allSelectableQuickPickElements.length > 0) {
      let nextElementIndex: number = this.activeTargetElementIndex;
      if (direction === 'up') {
        if (nextElementIndex > 0) {
          nextElementIndex--;
        } else {
          nextElementIndex = this.allSelectableQuickPickElements.length - 1;
        }
      } else {
        if (nextElementIndex < this.allSelectableQuickPickElements.length - 1) {
          nextElementIndex++;
        } else {
          nextElementIndex = 0;
        }
      }

      this.allSelectableQuickPickElements[this.activeTargetElementIndex].setFocus(false);
      this.activeTargetElementIndex = nextElementIndex;
      this.allSelectableQuickPickElements[this.activeTargetElementIndex].setFocus(true);
    }
  };

  public readonly getTargetElement = (): QuickActionCommand | null => {
    if (this.allSelectableQuickPickElements.length > 0) {
      return this.allSelectableQuickPickElements[Math.max(this.activeTargetElementIndex, 0)].getItem();
    }
    return null;
  };

  public readonly updateList = (quickPickGroupList: QuickActionCommandGroup[]): void => {
    this.activeTargetElementIndex = 0;
    this.allSelectableQuickPickElements = [];
    this.props.quickPickGroupList = quickPickGroupList;
    this.render.update({
      children: this.getQuickPickGroups()
    });
  };
}
