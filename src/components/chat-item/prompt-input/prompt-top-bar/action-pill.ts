import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../../../helper/dom';
import { generateUID } from '../../../../helper/guid';
import testIds from '../../../../helper/test-ids';
import { QuickActionCommand, CheckboxFormItemGroup } from '../../../../static';
import { Icon } from '../../../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../../overlay';
import { CheckboxGroupWrapper } from './checkbox-list-wrapper';

export interface ActionPillProps {
  actionPillConfig?: QuickActionCommand;
  actionPillItems?: CheckboxFormItemGroup[];
}

// used for rules list
export class ActionPill {
  render: ExtendedHTMLElement;
  props: ActionPillProps;
  overlay: Overlay;
  checklistSelectorContainer: CheckboxGroupWrapper;
  checkedItemState: Map<string, boolean>;

  constructor (props: ActionPillProps) {
    this.props = props;
    this.checkedItemState = new Map<string, boolean>();
    const temporaryId = generateUID();

    this.render = DomBuilder.getInstance().build({
      type: 'span',
      children: this.getActionPillChildren(),
      classNames: [ 'context', 'pinned' ],
      attributes: {
        'context-tmp-id': temporaryId,
        contenteditable: 'false'
      },
      events: {
        click: (e) => {
          this.showOverlay(e);
        }
      }
    });
  }

  showOverlay (e: Event): void {
    this.overlay = new Overlay({
      testId: testIds.prompt.tobBarActionOverlay,
      background: true,
      closeOnOutsideClick: false, // false for easy debugging. switch back to true for prod
      referenceElement: (e.currentTarget ?? e.target) as HTMLElement,
      dimOutside: false,
      removeOtherOverlays: true,
      verticalDirection: OverlayVerticalDirection.TO_TOP,
      horizontalDirection: OverlayHorizontalDirection.END_TO_LEFT,
      children: [ this.getCheckListItemGroups() ]
    });
  }

  getActionPillChildren (): Array<string | HTMLElement | DomBuilderObject> {
    return (this.props.actionPillConfig != null)
      ? [
          ...(this.props.actionPillConfig.icon != null ? [ new Icon({ icon: this.props.actionPillConfig.icon }).render ] : [ ]),
          { type: 'span', classNames: [ 'at-char' ], innerHTML: '@' },
                `${this.props.actionPillConfig.command.replace(/^@?(.*)$/, '$1')}`
        ]
      : [ '' ];
  }

  handleItemSelected (command: QuickActionCommand): void {
    console.log('command clicked', command);
  }

  private readonly getCheckListItemGroups = (): ExtendedHTMLElement => {
    // if (this.checklistSelectorContainer == null) {
    this.checklistSelectorContainer = new CheckboxGroupWrapper({ checkboxGroups: this.props.actionPillItems ?? [] });
    // } else {
    //   this.checklistSelectorContainer.update({
    //     checkboxGroups: this.props.actionPillItems ?? []
    //   });
    // }
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-quick-picks-overlay-wrapper' ],
      children: [
        this.checklistSelectorContainer.render
      ]
    });
  };
}
