import { MynahUIGlobalEvents } from '../../helper/events';
import { ChatItemButton, DetailedList, DetailedListItem, MynahEventNames } from '../../static';
import { DetailedListWrapper } from './detailed-list';

export interface DetailedListSheetProps {
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
    // To prevent the header from being shown in the detailed list wrapper
    const detailedListCopy: DetailedList = { ...props.detailedList, header: undefined };
    this.detailedListWrapper = new DetailedListWrapper({
      detailedList: detailedListCopy,
      onFilterValueChange: props.events?.onFilterValueChange,
      onItemSelect: props.events?.onItemSelect,
      onItemActionClick: props.events?.onActionClick,
    });
    this.keyPressHandler = (e: KeyboardEvent) => {
      this.props.events?.onKeyPress?.(e);
    };
  }

  open = (): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.OPEN_SHEET, {
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
