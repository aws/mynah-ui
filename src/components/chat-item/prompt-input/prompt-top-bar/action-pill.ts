import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../../../helper/dom';
import { MynahUIGlobalEvents } from '../../../../helper/events';
import { generateUID } from '../../../../helper/guid';
import testIds from '../../../../helper/test-ids';
import { QuickActionCommand, DetailedList, DetailedListItem, MynahEventNames } from '../../../../static';
import { DetailedListWrapper } from '../../../detailed-list/detailed-list';
import { Icon } from '../../../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../../overlay';

export interface ActionPillProps {
  actionPill: QuickActionCommand;
  actionPillOverlay: DetailedList;
  onActionPillClick?: (action: QuickActionCommand) => void;
  onActionPillOverlayItemClick?: (detailedListItem: DetailedListItem) => void;
  onActionPillOverlayGroupClick?: (groupName: string) => void;
}

// used for rules list
export class ActionPill {
  render: ExtendedHTMLElement;
  props: ActionPillProps;
  overlay?: Overlay;
  checklistSelectorContainer: DetailedListWrapper;

  constructor (props: ActionPillProps) {
    this.props = props;
    const temporaryId = generateUID();

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CLOSE_TOP_BAR_ACTION_OVERLAY, () => {
      this.overlay?.close();
    });

    this.render = DomBuilder.getInstance().build({
      type: 'span',
      children: this.getActionPillChildren(),
      classNames: [ 'context', 'pinned' ],
      attributes: {
        'context-tmp-id': temporaryId,
        contenteditable: 'false'
      },
      events: {
        click: () => {
          this.props.onActionPillClick?.(props.actionPill);
        }
      }
    });
  }

  showOverlay (): void {
    if (this.overlay == null) {
      this.overlay = new Overlay({
        testId: testIds.prompt.tobBarActionOverlay,
        background: true,
        closeOnOutsideClick: true, // switch to false for easier debugging, true for prod
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

  getActionPillChildren (): Array<string | HTMLElement | DomBuilderObject> {
    return (this.props.actionPill != null)
      ? [
          ...(this.props.actionPill.icon != null ? [ new Icon({ icon: this.props.actionPill.icon }).render ] : [ ]),
          { type: 'span', classNames: [ 'at-char' ], innerHTML: '@' },
                `${this.props.actionPill.command.replace(/^@?(.*)$/, '$1')}`
        ]
      : [ '' ];
  }

  private readonly getItemGroups = (): ExtendedHTMLElement => {
    if (this.checklistSelectorContainer == null) {
      this.checklistSelectorContainer = new DetailedListWrapper({
        detailedList: this.props.actionPillOverlay,
        onGroupClick: this.props.onActionPillOverlayGroupClick,
        onGroupActionClick: (_, groupName) => { if (groupName != null) this.props.onActionPillOverlayGroupClick?.(groupName); },
        onItemClick: this.props.onActionPillOverlayItemClick,
        onItemActionClick: (_, detailedListItem) => { if (detailedListItem != null) this.props.onActionPillOverlayItemClick?.(detailedListItem); },
      });
    } else {
      this.checklistSelectorContainer?.update(this.props.actionPillOverlay);
    }

    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-quick-picks-overlay-wrapper' ],
      children: [ this.checklistSelectorContainer.render ]
    });
  };

  onActionPillOverlayChanged (actionPillOverlay: DetailedList): void {
    this.props.actionPillOverlay = actionPillOverlay;
    this.showOverlay();
  }
}
