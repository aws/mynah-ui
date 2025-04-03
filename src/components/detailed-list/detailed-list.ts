import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import testIds from '../../helper/test-ids';
import { ChatItemButton, DetailedList, DetailedListItem, DetailedListItemGroup } from '../../static';
import { CardBody } from '../card/card-body';
import { Icon } from '../icon';
import { ChatItemButtonsWrapper } from '../chat-item/chat-item-buttons';
import { DetailedListItemWrapper } from './detailed-list-item';
import { chunkArray } from '../../helper/quick-pick-data-handler';
import { ChatItemFormItemsWrapper } from '../chat-item/chat-item-form-items';
import { TitleDescriptionWithIcon } from '../title-description-with-icon';
import { generateUID } from '../../main';

export interface DetailedListWrapperProps {
  detailedList: DetailedList;
  onFilterValueChange?: (filterValues: Record<string, any>, isValid: boolean) => void;
  onGroupActionClick?: (action: ChatItemButton) => void;
  onItemSelect?: (detailedListItem: DetailedListItem) => void;
  onItemActionClick?: (action: ChatItemButton) => void;
}

export class DetailedListWrapper {
  render: ExtendedHTMLElement;
  private readonly detailedListItemGroupsContainer: ExtendedHTMLElement;
  private readonly filtersContainer: ExtendedHTMLElement;
  private readonly headerContainer: ExtendedHTMLElement;
  private readonly observer: IntersectionObserver | null;
  private readonly props: DetailedListWrapperProps;
  private detailedListItemsBlockData: Record<string, DetailedListItem[]> = {};
  private activeTargetElementIndex: number = 0;
  private allSelectableDetailedListElements: DetailedListItemWrapper[] = [];
  constructor (props: DetailedListWrapperProps) {
    this.props = props;
    this.headerContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-detailed-list-header-wrapper' ],
      children: this.getHeader()
    });
    this.filtersContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-detailed-list-filters-wrapper' ],
      children: this.getFilters()
    });
    this.detailedListItemGroupsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-detailed-list-item-groups-wrapper' ],
      children: this.getDetailedListItemGroups()
    });

    if (this.observer == null && IntersectionObserver != null) {
      this.observer = new IntersectionObserver((entries) => {
        const itemsBlockKey = entries[0].target.getAttribute('key');
        if (entries[0].isIntersecting && itemsBlockKey != null) {
          (entries[0].target as ExtendedHTMLElement).update({
            children: this.getDetailedListItemElements(this.detailedListItemsBlockData[itemsBlockKey])
          });
        } else {
          (entries[0].target as ExtendedHTMLElement).clear();
        }
      }, { root: this.detailedListItemGroupsContainer, rootMargin: '50px 0px 50px 0px', threshold: 0 });
    }

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.quickPicksWrapper,
      classNames: [ 'mynah-detailed-list' ],
      children: [
        this.headerContainer,
        this.filtersContainer,
        this.detailedListItemGroupsContainer,
      ]
    });
  }

  private readonly getHeader = (): Array<ExtendedHTMLElement | string> => {
    if (this.props.detailedList.header != null) {
      return [ new TitleDescriptionWithIcon({
        description: this.props.detailedList.header.description,
        icon: this.props.detailedList.header.icon,
        title: this.props.detailedList.header.title,
      }).render ];
    }
    return [ '' ];
  };

  private readonly getFilters = (): Array<ExtendedHTMLElement | string> => {
    if (this.props.detailedList.filterOptions != null && this.props.detailedList.filterOptions.length > 0) {
      return [ new ChatItemFormItemsWrapper({
        tabId: '',
        chatItem: {
          formItems: this.props.detailedList.filterOptions
        },
        onFormChange: this.props.onFilterValueChange
      }).render ];
    }
    return [ '' ];
  };

  private readonly getDetailedListItemGroups = (): Array<ExtendedHTMLElement | string> => {
    const groups = this.props.detailedList.list?.map((detailedListGroup: DetailedListItemGroup) => {
      return DomBuilder.getInstance().build({
        type: 'div',
        testId: testIds.prompt.quickPicksGroup,
        classNames: [ 'mynah-detailed-list-group' ],
        children: [
          ...(detailedListGroup.groupName !== undefined
            ? [ DomBuilder.getInstance().build({
                type: 'div',
                testId: testIds.prompt.quickPicksGroupTitle,
                classNames: [ 'mynah-detailed-list-group-title' ],
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
                    onActionClick: this.props.onGroupActionClick
                  }).render
                ]
              }) ]
            : []),
          ...((chunkArray(detailedListGroup.children ?? [], 50)).map((detailedListItemPart, index) => {
            const itemBlockKey = generateUID();
            const detailedListItemBlock = DomBuilder.getInstance().build({
              type: 'div',
              attributes: {
                key: itemBlockKey,
                style: `min-height: calc(${detailedListItemPart.length} * (var(--mynah-sizing-10) + var(--mynah-sizing-half))); background-color: rgba(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)}, 0.05)`
              },
              classNames: [ 'mynah-detailed-list-items-block' ],
              children: index < 4
                ? this.getDetailedListItemElements(detailedListItemPart)
                : []
            });
            this.detailedListItemsBlockData[itemBlockKey] = detailedListItemPart;
            if (index > 3) {
              this.observer?.observe(detailedListItemBlock);
            }
            return detailedListItemBlock;
          }))
        ]
      });
    });
    this.allSelectableDetailedListElements[0]?.setFocus(true, true);
    return groups ?? [ '' ];
  };

  private readonly getDetailedListItemElements = (detailedListItems: DetailedListItem[]): ExtendedHTMLElement[] => {
    return detailedListItems.map(detailedListItem => {
      const detailedListItemElement = new DetailedListItemWrapper({
        listItem: detailedListItem,
        onSelect: this.props.onItemSelect,
        onActionClick: this.props.onItemActionClick,
        selectable: this.props.detailedList.selectable,
        textDirection: this.props.detailedList.textDirection
      });
      if (detailedListItem.disabled !== true) {
        this.allSelectableDetailedListElements.push(detailedListItemElement);
      }
      return detailedListItemElement.render;
    });
  };

  public readonly changeTarget = (direction: 'up' | 'down', snapOnLastAndFirst?: boolean, scrollIntoView?: boolean): void => {
    if (this.allSelectableDetailedListElements.length > 0) {
      let nextElementIndex: number = this.activeTargetElementIndex;
      if (direction === 'up') {
        if (nextElementIndex > 0) {
          nextElementIndex--;
        } else if (snapOnLastAndFirst !== true) {
          nextElementIndex = this.allSelectableDetailedListElements.length - 1;
        } else {
          nextElementIndex = 0;
        }
      } else {
        if (nextElementIndex < this.allSelectableDetailedListElements.length - 1) {
          nextElementIndex++;
        } else if (snapOnLastAndFirst !== true) {
          nextElementIndex = 0;
        } else {
          nextElementIndex = this.allSelectableDetailedListElements.length - 1;
        }
      }

      this.allSelectableDetailedListElements[this.activeTargetElementIndex].setFocus(false, scrollIntoView === true);
      this.activeTargetElementIndex = nextElementIndex;
      this.allSelectableDetailedListElements[this.activeTargetElementIndex].setFocus(true, scrollIntoView === true);
    }
  };

  public readonly getTargetElement = (): DetailedListItem | null => {
    if (this.allSelectableDetailedListElements.length > 0) {
      return this.allSelectableDetailedListElements[Math.max(this.activeTargetElementIndex, 0)].getItem();
    }
    return null;
  };

  public readonly update = (detailedList: DetailedList): void => {
    if (detailedList.header != null) {
      this.props.detailedList.header = detailedList.header;
      this.headerContainer.update({
        children: this.getHeader()
      });
    }

    if (detailedList.filterOptions != null) {
      this.props.detailedList.filterOptions = detailedList.filterOptions;
      this.filtersContainer.update({
        children: this.getFilters()
      });
    }

    if (detailedList.list != null) {
      this.detailedListItemGroupsContainer.clear();
      this.detailedListItemsBlockData = {};
      this.observer?.disconnect();
      this.activeTargetElementIndex = 0;
      this.allSelectableDetailedListElements = [];
      this.props.detailedList.list = detailedList.list;
      this.detailedListItemGroupsContainer.update({
        children: this.getDetailedListItemGroups()
      });
    }
  };
}
