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
import { Card } from '../card/card';

export interface DetailedListWrapperProps {
  detailedList: DetailedList;
  descriptionTextDirection?: 'ltr' | 'rtl';
  onFilterValueChange?: (filterValues: Record<string, any>, isValid: boolean) => void;
  onGroupActionClick?: (action: ChatItemButton) => void;
  onItemSelect?: (detailedListItem: DetailedListItem) => void;
  onItemClick?: (detailedListItem: DetailedListItem) => void;
  onItemActionClick?: (action: ChatItemButton, detailedListItem?: DetailedListItem) => void;
  onFilterActionClick?: (action: ChatItemButton, filterValues?: Record<string, any>, isValid?: boolean) => void;
}

export class DetailedListWrapper {
  render: ExtendedHTMLElement;
  private readonly detailedListItemGroupsContainer: ExtendedHTMLElement;
  private filterForm: ChatItemFormItemsWrapper;
  private readonly filtersContainer: ExtendedHTMLElement;
  private readonly filterActionsContainer: ExtendedHTMLElement;
  private readonly headerContainer: ExtendedHTMLElement;
  private readonly props: DetailedListWrapperProps;
  private detailedListItemsBlockData: Array<{
    data: DetailedListItem[];
    element: ExtendedHTMLElement;
  }> = [];

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
    this.filterActionsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-detailed-list-filter-actions-wrapper' ],
      children: this.getFilterActions()
    });
    this.detailedListItemGroupsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-detailed-list-item-groups-wrapper' ],
      children: this.getDetailedListItemGroups(),
      events: {
        scroll: () => {
          const wrapperOffsetHeight = this.detailedListItemGroupsContainer.offsetHeight;
          const wrapperScrollTop = this.detailedListItemGroupsContainer.scrollTop;
          this.detailedListItemsBlockData.forEach(itemsBlock => {
            const itemBlockTop = itemsBlock.element.offsetTop;
            const itemBlockBottom = itemsBlock.element.offsetTop + itemsBlock.element.offsetHeight;
            if (itemsBlock.element.childNodes.length === 0 &&
              (itemBlockTop < wrapperScrollTop + wrapperOffsetHeight) &&
              (itemBlockBottom > wrapperScrollTop - wrapperOffsetHeight)) {
              itemsBlock.element.update({
                children: this.getDetailedListItemElements(itemsBlock.data)
              });
            } else if ((itemBlockTop > wrapperScrollTop + wrapperOffsetHeight) ||
            (itemBlockBottom < wrapperScrollTop - wrapperOffsetHeight)) {
              itemsBlock.element.clear();
            }
          });
        }
      }
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.quickPicksWrapper,
      classNames: [ 'mynah-detailed-list' ],
      children: [
        this.headerContainer,
        this.filtersContainer,
        this.detailedListItemGroupsContainer,
        this.filterActionsContainer
      ]
    });
  }

  private readonly getHeader = (): Array<ExtendedHTMLElement | string> => {
    if (this.props.detailedList.header != null) {
      return [ new TitleDescriptionWithIcon({
        description: DomBuilder.getInstance().build({
          type: 'div',
          children: [
            this.props.detailedList.header.description ?? '',
            ...(this.props.detailedList.header.status != null
              ? [ new Card({
                  testId: testIds.sheet.description,
                  border: true,
                  padding: 'medium',
                  status: this.props.detailedList.header.status?.status,
                  children: [ new TitleDescriptionWithIcon({
                    description: this.props.detailedList.header.status?.description,
                    title: this.props.detailedList.header.status?.title,
                    icon: this.props.detailedList.header.status?.icon
                  }).render ],
                }).render ]
              : [])
          ]
        }),
        icon: this.props.detailedList.header.icon,
        title: this.props.detailedList.header.title,
      }).render ];
    }
    return [ '' ];
  };

  private readonly getFilters = (): Array<ExtendedHTMLElement | string> => {
    if (this.props.detailedList.filterOptions != null && this.props.detailedList.filterOptions.length > 0) {
      this.filterForm = new ChatItemFormItemsWrapper({
        tabId: '',
        chatItem: {
          formItems: this.props.detailedList.filterOptions
        },
        onFormChange: this.props.onFilterValueChange
      });
      return [ this.filterForm.render ];
    }
    return [ '' ];
  };

  private readonly getFilterActions = (): ExtendedHTMLElement[] => {
    return [ new ChatItemButtonsWrapper({
      onActionClick: (action) => {
        this.props.onFilterActionClick?.(action, this.filterForm?.getAllValues(), this.filterForm?.isFormValid());
      },
      buttons: this.props.detailedList.filterActions ?? [],
    }).render ];
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
          ...((chunkArray(detailedListGroup.children ?? [], 100)).map((detailedListItemPart, index) => {
            const itemBlockKey = generateUID();
            const detailedListItemBlock = DomBuilder.getInstance().build({
              type: 'div',
              attributes: {
                key: itemBlockKey,
                style: `min-height: calc(${detailedListItemPart.length} * (var(--mynah-sizing-8) + var(--mynah-sizing-half)));`
              },
              classNames: [ 'mynah-detailed-list-items-block' ],
              children: index < 5
                ? this.getDetailedListItemElements(detailedListItemPart)
                : []
            });
            this.detailedListItemsBlockData.push({
              data: detailedListItemPart,
              element: detailedListItemBlock
            });
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
        onClick: this.props.onItemClick,
        onActionClick: this.props.onItemActionClick,
        selectable: this.props.detailedList.selectable !== false && this.props.detailedList.selectable !== 'clickable',
        clickable: this.props.detailedList.selectable === 'clickable',
        textDirection: this.props.detailedList.textDirection,
        descriptionTextDirection: this.props.descriptionTextDirection
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

    if (detailedList.filterActions != null) {
      this.props.detailedList.filterActions = detailedList.filterActions;
      this.filterActionsContainer.update({
        children: this.getFilterActions()
      });
    }

    if (detailedList.list != null) {
      this.detailedListItemsBlockData = [];
      this.detailedListItemGroupsContainer.clear();
      this.activeTargetElementIndex = 0;
      this.allSelectableDetailedListElements = [];
      this.props.detailedList.list = detailedList.list;
      this.detailedListItemGroupsContainer.update({
        children: this.getDetailedListItemGroups()
      });
    }
  };
}
