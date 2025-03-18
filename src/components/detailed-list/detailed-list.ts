import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import testIds from '../../helper/test-ids';
import { ChatItemButton, DetailedList, DetailedListItem, DetailedListItemGroup } from '../../static';
import { CardBody } from '../card/card-body';
import { Icon } from '../icon';
import { ChatItemButtonsWrapper } from '../chat-item/chat-item-buttons';
import { DetailedListItemWrapper } from './detailed-list-item';
import { chunkArray } from '../../helper/quick-pick-data-handler';

export interface DetailedListWrapperProps {
  detailedList: DetailedList;
  onQuickPickGroupActionClick: (action: ChatItemButton) => void;
  onQuickPickItemSelect: (detailedListItem: DetailedListItem) => void;
}

export class DetailedListWrapper {
  render: ExtendedHTMLElement;
  private readonly props: DetailedListWrapperProps;
  private activeTargetElementIndex: number = 0;
  private allSelectableDetailedListElements: DetailedListItemWrapper[] = [];
  constructor (props: DetailedListWrapperProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.quickPicksWrapper,
      classNames: [ 'mynah-chat-command-selector' ],
      children: this.getQuickPickGroups()
    });
  }

  private readonly getQuickPickGroups = (): ExtendedHTMLElement[] => {
    const groups = this.props.detailedList.list?.map((detailedListGroup: DetailedListItemGroup) => {
      return DomBuilder.getInstance().build({
        type: 'div',
        testId: testIds.prompt.quickPicksGroup,
        classNames: [ 'mynah-chat-command-selector-group' ],
        children: [
          ...(detailedListGroup.groupName !== undefined
            ? [ DomBuilder.getInstance().build({
                type: 'div',
                testId: testIds.prompt.quickPicksGroupTitle,
                classNames: [ 'mynah-chat-command-selector-group-title' ],
                children: [
                  ...(detailedListGroup.icon != null ? [ new Icon({ icon: detailedListGroup.icon }).render ] : []),
                  new CardBody({
                    body: detailedListGroup.groupName
                  }).render,
                  new ChatItemButtonsWrapper({
                    buttons: (detailedListGroup.actions ?? []).map(action => ({
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
          ...((chunkArray(detailedListGroup.children ?? [], 100)).map(detailedListItemPart => {
            const detailedListItemBlock = DomBuilder.getInstance().build({
              type: 'div',
              classNames: [ 'mynah-chat-command-selector-items-block' ],
              children: detailedListItemPart.map(detailedListItem => {
                const detailedListItemElement = new DetailedListItemWrapper({
                  listItem: detailedListItem,
                  onSelect: () => {
                    this.props.onQuickPickItemSelect(detailedListItem);
                  }
                });
                if (detailedListItem.disabled !== true) {
                  this.allSelectableDetailedListElements.push(detailedListItemElement);
                }
                return detailedListItemElement.render;
              })
            });
            return detailedListItemBlock;
          }))
        ]
      });
    });
    this.allSelectableDetailedListElements[0]?.setFocus(true);
    return groups ?? [];
  };

  public readonly changeTarget = (direction: 'up' | 'down'): void => {
    if (this.allSelectableDetailedListElements.length > 0) {
      let nextElementIndex: number = this.activeTargetElementIndex;
      if (direction === 'up') {
        if (nextElementIndex > 0) {
          nextElementIndex--;
        } else {
          nextElementIndex = this.allSelectableDetailedListElements.length - 1;
        }
      } else {
        if (nextElementIndex < this.allSelectableDetailedListElements.length - 1) {
          nextElementIndex++;
        } else {
          nextElementIndex = 0;
        }
      }

      this.allSelectableDetailedListElements[this.activeTargetElementIndex].setFocus(false);
      this.activeTargetElementIndex = nextElementIndex;
      this.allSelectableDetailedListElements[this.activeTargetElementIndex].setFocus(true);
    }
  };

  public readonly getTargetElement = (): DetailedListItem | null => {
    if (this.allSelectableDetailedListElements.length > 0) {
      return this.allSelectableDetailedListElements[Math.max(this.activeTargetElementIndex, 0)].getItem();
    }
    return null;
  };

  public readonly updateList = (detailedListItemGroups: DetailedListItemGroup[]): void => {
    this.activeTargetElementIndex = 0;
    this.allSelectableDetailedListElements = [];
    this.props.detailedList.list = detailedListItemGroups;
    this.render.update({
      children: this.getQuickPickGroups()
    });
  };
}
