import { DomBuilder, ExtendedHTMLElement } from '../../../../helper/dom';
import testIds from '../../../../helper/test-ids';
import { DetailedList, DetailedListItem, ChatItemButton } from '../../../../static';
import { Button } from '../../../button';
import { DetailedListWrapper } from '../../../detailed-list/detailed-list';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../../overlay';

export interface TopBarButtonOverlayProps {
  tabId: string;
  topBarButtonOverlay: DetailedList;
  onTopBarButtonOverlayItemClick?: (detailedListItem: DetailedListItem) => void;
  onTopBarButtonOverlayGroupClick?: (groupName: string) => void;
}

export interface TopBarButtonProps {
  topBarButton?: ChatItemButton;
  onTopBarButtonClick?: (action: ChatItemButton) => void;
}

export class TopBarButton {
  render: ExtendedHTMLElement;
  private readonly props: TopBarButtonProps;
  private overlay?: Overlay;
  private checklistSelectorContainer: DetailedListWrapper;
  private overlayData: TopBarButtonOverlayProps;
  private topBarButton: Button;

  constructor (props: TopBarButtonProps) {
    this.props = props;

    this.render = DomBuilder.getInstance().build({
      testId: testIds.prompt.topBarButton,
      type: 'span',
      children: this.getTopBarButtonChildren(),
      classNames: [ 'top-bar-button' ],
      attributes: {
        contenteditable: 'false'
      },
    });
  }

  update (newProps: TopBarButtonProps): void {
    if (newProps.topBarButton != null) {
      this.props.topBarButton = newProps.topBarButton;
    }
    this.render.update({
      children: this.getTopBarButtonChildren(),
    });
  }

  closeOverlay (): void {
    this.overlay?.close();
  }

  showOverlay (topBarButtonOverlay: TopBarButtonOverlayProps): void {
    this.overlayData = topBarButtonOverlay;

    if (this.overlay == null) {
      this.overlay = new Overlay({
        testId: testIds.prompt.tobBarActionOverlay,
        background: true,
        closeOnOutsideClick: true,
        referenceElement: document.querySelector('.mynah-chat-prompt') as ExtendedHTMLElement,
        stretchWidth: true,
        dimOutside: false,
        onClose: () => { this.overlay = undefined; },
        removeOtherOverlays: true,
        verticalDirection: OverlayVerticalDirection.TO_TOP,
        horizontalDirection: OverlayHorizontalDirection.END_TO_LEFT,
        children: [ this.getItemGroups() ]
      });
    } else {
      this.overlay.updateContent([ this.getItemGroups() ]);
    }
  }

  getTopBarButtonChildren (): Array<string | ExtendedHTMLElement> {
    if (this.topBarButton == null) {
      this.topBarButton = new Button({
        onClick: () => {
          if (this.props.topBarButton != null) this.props.onTopBarButtonClick?.(this.props.topBarButton);
        },
        primary: false,
        status: 'clear',
        border: false,
        label: this.props.topBarButton?.text ?? '',
        hidden: this.props.topBarButton == null
      });
    } else {
      if (this.props.topBarButton == null) {
        this.topBarButton.setHidden(true);
      } else {
        this.topBarButton.updateLabel(this.props.topBarButton.text ?? '');
        this.topBarButton.setHidden(false);
      }
    }

    return [ this.topBarButton.render ];
  }

  private readonly getItemGroups = (): ExtendedHTMLElement => {
    if (this.checklistSelectorContainer == null) {
      this.checklistSelectorContainer = new DetailedListWrapper({
        detailedList: this.overlayData.topBarButtonOverlay,
        onGroupClick: this.overlayData.onTopBarButtonOverlayGroupClick,
        onGroupActionClick: (_, groupName) => { if (groupName != null) this.overlayData.onTopBarButtonOverlayGroupClick?.(groupName); },
        onItemClick: this.overlayData.onTopBarButtonOverlayItemClick,
        onItemActionClick: (_, detailedListItem) => { if (detailedListItem != null) this.overlayData.onTopBarButtonOverlayItemClick?.(detailedListItem); },
      });
    } else {
      this.checklistSelectorContainer?.update(this.overlayData.topBarButtonOverlay);
    }

    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-quick-picks-overlay-wrapper' ],
      children: [ this.checklistSelectorContainer.render ]
    });
  };

  // connect this to main.ts props
  onTopBarButtonOverlayChanged (topBarButtonOverlay: DetailedList): void {
    this.overlayData.topBarButtonOverlay = topBarButtonOverlay;
    if (this.overlay != null) {
      this.overlay.updateContent([ this.getItemGroups() ]);
    }
  }
}
