import { MynahUIGlobalEvents } from '../../helper/events';
import { ChatItemButton, DetailedList, DetailedListItem, MynahEventNames } from '../../static';
import { DetailedListWrapper } from './detailed-list';

export interface DetailedListSheetProps {
  tabId: string;
  detailedList: DetailedList;
  events?: {
    onFilterValueChange?: (filterValues: Record<string, any>, isValid: boolean) => void;
    onKeyPress?: (e: KeyboardEvent) => void;
    onItemSelect?: (detailedListItem: DetailedListItem) => void;
    onActionClick?: (action: ChatItemButton) => void;
    onClose?: () => void;
  };
}

export class DetailedListSheet {
  props: DetailedListSheetProps;
  detailedListWrapper: DetailedListWrapper;
  private readonly keyPressHandler: (e: KeyboardEvent) => void;

  constructor (props: DetailedListSheetProps) {
    this.props = props;
    this.detailedListWrapper = new DetailedListWrapper({
      detailedList: props.detailedList,
      onFilterValueChange: props.events?.onFilterValueChange,
      onDetailedListItemSelect: props.events?.onItemSelect,
      onDetailedListItemActionClick: props.events?.onActionClick,
    });
    this.keyPressHandler = (e: KeyboardEvent) => {
      this.props.events?.onKeyPress?.(e);
    };
  }

  open = (): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.OPEN_SHEET, {
      tabId: this.props.tabId,
      fullScreen: true,
      title: this.props.detailedList.header?.title,
      description: this.props.detailedList.header?.description,
      children: [ this.detailedListWrapper.render ],
      onClose: () => {
        this.props.events?.onClose?.();
        window.removeEventListener('keydown', this.keyPressHandler);
      }
    });

    window.addEventListener('keydown', this.keyPressHandler);
  };

  update = (detailedList: DetailedList): void => {
    this.detailedListWrapper.update(detailedList);
  };

  close = (): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CLOSE_SHEET);
  };
}
