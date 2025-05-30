import { DomBuilder, ExtendedHTMLElement } from '../../../../helper/dom';
import { MynahUIGlobalEvents } from '../../../../helper/events';
import { generateUID } from '../../../../helper/guid';
import testIds from '../../../../helper/test-ids';
import { DetailedList, DetailedListItem, MynahEventNames, QuickActionCommand } from '../../../../static';
import { Icon, MynahIcons } from '../../../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../../overlay';
import { ActionPill } from './action-pill';

const PREVIEW_DELAY = 500;

export interface PromptTopBarProps {
  classNames?: string[];
  tabId: string;
  contextItems: QuickActionCommand[];
  title?: string;
  placeholder?: string;

  onContextSelectorButtonClick?: () => void;
  onContextItemAdd?: (contextItems: QuickActionCommand) => void;
  onContextItemRemove?: (contextItems: QuickActionCommand) => void;

  actionPill?: QuickActionCommand;
  actionPillOverlay: DetailedList;
  onActionPillOverlayItemClick?: (detailedListItem: DetailedListItem) => void;
  onActionPillOverlayGroupClick?: (groupName: string) => void;
  onActionPillClick?: (action: QuickActionCommand) => void;
}

export class PromptTopBar {
  render: ExtendedHTMLElement;
  hoveredItemId: string | undefined;
  hoveredIcons: Record<string, Icon>;
  visibleCount: number;
  overflowOverlay: Overlay; // might not be needed
  actionPill: ActionPill;
  overflowListContainer: ExtendedHTMLElement;
  private contextTooltip: Overlay | null;
  private contextTooltipTimeout: ReturnType<typeof setTimeout>;
  private readonly props: PromptTopBarProps;

  constructor (props: PromptTopBarProps) {
    this.props = props;
    this.visibleCount = this.props.contextItems.length;
    this.hoveredIcons = {};

    if (this.props.actionPill != null) {
      this.actionPill = new ActionPill({
        actionPill: this.props.actionPill,
        actionPillOverlay: this.props.actionPillOverlay,
        onActionPillOverlayGroupClick: this.props.onActionPillOverlayGroupClick,
        onActionPillOverlayItemClick: this.props.onActionPillOverlayItemClick,
        onActionPillClick: this.props.onActionPillClick
      });
    }

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.topBar,
      classNames: [ 'mynah-prompt-input-top-bar', ...(this.props.classNames ?? []) ],
      children: [
        this.generateTitle(),
        ...this.generateContextPills(),
        this.generateOverflowPill(),
        this.actionPill.render
      ],
    });

    // Add resize observer to handle responsive behavior
    this.setupResizeObserver();

    // Use setTimeout to ensure the DOM is fully rendered before measuring
    setTimeout(() => {
      this.recalculateVisibleItems();
    }, 100);
  }

  update (newProps?: Partial<PromptTopBarProps>): void {
    if (newProps?.contextItems != null) {
      this.props.contextItems = newProps.contextItems;
    }
    if (newProps?.title != null) {
      this.props.title = newProps.title;
    }
    if (newProps?.placeholder != null) {
      this.props.placeholder = newProps.placeholder;
    }
    this.render.update({
      children: [
        this.generateTitle(),
        ...this.generateContextPills(),
        this.generateOverflowPill(),
        this.actionPill.render
      ]
    });
    if (newProps?.contextItems != null) {
      this.recalculateVisibleItems();
    }
  }

  updateActionPillOverlay (actionPillOverlay: DetailedList): void {
    this.actionPill.onActionPillOverlayChanged(actionPillOverlay);
  }

  generateTitle (): ExtendedHTMLElement | string {
    const { title } = this.props;
    return title != null
      ? DomBuilder.getInstance().build({
        type: 'span',
        classNames: [ 'title' ],
        children: [
          this.props.contextItems.length === 0 ? title : title.charAt(0)
        ],
        events: {
          click: (e) => {
            this.props.onContextSelectorButtonClick?.();
          }
        }
      })
      : '';
  }

  getVisibleContextItems (): QuickActionCommand[] {
    return this.props.contextItems.slice(0, this.visibleCount);
  }

  getOverflowContextItems (): QuickActionCommand[] {
    return this.props.contextItems.slice(this.visibleCount).map((item) => ({ ...item, icon: this.hoveredItemId === (item.id ?? item.command) ? MynahIcons.CANCEL : item.icon }));
  }

  isHovered (id: string): boolean {
    return (this.hoveredItemId === id);
  }

  setHoveredItem (id: string): void {
    this.hoveredItemId = id;
  }

  clearHoveredItem (): void {
    this.hoveredItemId = undefined;
  }

  // this might replace need for hoveredItem, add hovered prop to this func. when one is set to cance, set rest to its icon!!
  generatePillIcon (contextItem: QuickActionCommand): MynahIcons {
    return this.isHovered(contextItem.id ?? contextItem.command) ? MynahIcons.CANCEL : contextItem.icon as MynahIcons;
  }

  generateContextPills (overflow?: boolean): Array<ExtendedHTMLElement | string> {
    const temporaryId = generateUID(); // is this needed?
    if (this.props.contextItems.length === 0 && this.props.placeholder != null && overflow == null) {
      return [ DomBuilder.getInstance().build({
        type: 'span',
        classNames: [ 'placeholder' ],
        children: [ this.props.placeholder ]
      }) ];
    } else if (this.props.contextItems.length > 0) {
      return (overflow === true ? this.getOverflowContextItems() : this.getVisibleContextItems()).map((contextItem) => {
        this.hoveredIcons[contextItem.id ?? contextItem.command] = new Icon({ icon: this.generatePillIcon(contextItem) });
        return DomBuilder.getInstance().build({
          type: 'span',
          children: [
            this.hoveredIcons[contextItem.id ?? contextItem.command].render,
            { type: 'span', classNames: [ 'at-char' ], innerHTML: '@' },
            { type: 'span', classNames: [ 'label' ], children: [ `${contextItem.command.replace(/^@?(.*)$/, '$1')}` ] }
          ],
          classNames: [ 'context', overflow === true ? 'overflow-pill' : '' ],
          attributes: {
            'context-tmp-id': temporaryId,
            contenteditable: 'false'
          },
          events: {
            mouseenter: (e) => { // or mouseover
              if (!this.isHovered(contextItem.id ?? contextItem.command)) {
                this.setHoveredItem(contextItem.id ?? contextItem.command);
                if (overflow === true) { this.generateOverflowOverlayChildren(); } else { this.showContextTooltip(e, contextItem); this.hoveredIcons[contextItem.id ?? contextItem.command]?.update(this.generatePillIcon(contextItem)); }
              }
            },
            mouseleave: (e) => {
              if (this.hoveredItemId != null) { this.clearHoveredItem(); }
              if (overflow === true) {
                this.generateOverflowOverlayChildren();
              } else {
                this.hoveredIcons[contextItem.id ?? contextItem.command]?.update(this.generatePillIcon(contextItem));
              }
              this.hideContextTooltip();
            },
            click: (e) => {
              this.removeContextPill(contextItem.id ?? contextItem.command);
              if (overflow === true) { this.generateOverflowOverlayChildren(); }
            }
          }
        });
      });
    }
    return [ '' ];
  }

  private readonly showContextTooltip = (e: MouseEvent, contextItem: QuickActionCommand): void => {
    clearTimeout(this.contextTooltipTimeout);
    this.contextTooltipTimeout = setTimeout(() => {
      const elm: HTMLElement = e.target as HTMLElement;

      console.log('pinned context el', elm, elm.getBoundingClientRect());
      this.contextTooltip = new Overlay({
        testId: testIds.prompt.contextTooltip,
        background: true,
        closeOnOutsideClick: false,
        referenceElement: elm,
        dimOutside: false,
        removeOtherOverlays: true,
        verticalDirection: OverlayVerticalDirection.TO_TOP,
        horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
        children: [
          DomBuilder.getInstance().build({
            type: 'div',
            testId: testIds.prompt.contextTooltip,
            classNames: [ 'mynah-chat-prompt-context-tooltip' ],
            children: [
              ...(contextItem.icon !== undefined
                ? [
                    new Icon({
                      icon: contextItem.icon
                    }).render
                  ]
                : []),
              {
                type: 'div',
                classNames: [ 'mynah-chat-prompt-context-tooltip-container' ],
                children: [
                  {
                    type: 'div',
                    classNames: [ 'mynah-chat-prompt-context-tooltip-name' ],
                    children: [ contextItem.command ]
                  },
                  ...(contextItem.description !== undefined
                    ? [ {
                        type: 'div',
                        classNames: [ 'mynah-chat-prompt-context-tooltip-description' ],
                        children: [ contextItem.description ]
                      } ]
                    : [])
                ]
              }
            ]
          })
        ],
      });
    }, PREVIEW_DELAY);
  };

  private readonly hideContextTooltip = (): void => {
    if (this.contextTooltipTimeout !== null) {
      clearTimeout(this.contextTooltipTimeout);
    }
    if (this.contextTooltip != null) {
      this.contextTooltip.close();
      this.contextTooltip = null;
    }
  };

  removeContextPill (id: string): void {
    const itemToRemove = this.props.contextItems.find((item) => (item.id ?? item.command) === id);
    if (itemToRemove != null) {
      this.props.contextItems = this.props.contextItems.filter((item) => (item.id ?? item.command) !== id);
      this.props.onContextItemRemove?.(itemToRemove);
      this.update();
      this.recalculateVisibleItems();
    }
  }

  addContextPill (contextItem: QuickActionCommand): void {
    if (this.props.contextItems.find(({ id }) => id === contextItem.id) == null) {
      this.props.contextItems.push(contextItem);
      this.props.onContextItemAdd?.(contextItem);
      this.update();
      this.recalculateVisibleItems();
    }
  }

  getOverflowCount (): number {
    return this.props.contextItems.length - this.visibleCount;
  }

  // todo: add listener for item updates from consumer

  generateOverflowPill (): ExtendedHTMLElement | string {
    if (this.getOverflowCount() <= 0) {
      return '';
    }

    return DomBuilder.getInstance().build({
      type: 'span',
      children: [
        `+${this.getOverflowCount()}`
      ],
      classNames: [ 'context', 'overflow' ],
      attributes: {
        contenteditable: 'false'
      },
      events: {
        click: (e: Event) => {
          this.showOverflowOverlay(e);
        }
      }
    });
  }

  showOverflowOverlay (e: Event): void {
    this.overflowOverlay = new Overlay({
      testId: testIds.prompt.tobBarOverflowOverlay,
      background: true,
      closeOnOutsideClick: true, // false for debugging. set to true for prod
      referenceElement: (e.currentTarget ?? e.target) as HTMLElement,
      removeIfReferenceElementRemoved: false,
      dimOutside: false,
      removeOtherOverlays: true,
      verticalDirection: OverlayVerticalDirection.TO_TOP,
      horizontalDirection: OverlayHorizontalDirection.END_TO_LEFT,
      children: [ this.generateOverflowOverlayChildren() ]
    });
  }

  generateOverflowOverlayChildren (): ExtendedHTMLElement {
    const overlayChildren = this.generateContextPills(true);
    if (this.overflowListContainer == null) {
      this.overflowListContainer = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-prompt-quick-picks-overlay-wrapper', 'mynah-context-list' ],
        children: overlayChildren
      });
    } else {
      if (overlayChildren.length === 0) {
        this.overflowOverlay.close();
      }
      this.overflowListContainer.update({ children: overlayChildren });
    }
    return this.overflowListContainer;
  }

  // getOverflowItemsAsDetailedListGroup (): DetailedListItemGroup[] {
  //   return convertQuickActionCommandGroupsToDetailedListGroups([ { commands: this.getOverflowContextItems() } ]);
  // }

  private setupResizeObserver (): void {
    // Use the existing MynahUIGlobalEvents system to listen for ROOT_RESIZE events
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.ROOT_RESIZE, () => {
      this.recalculateVisibleItems();
    });
  }

  // Sets visibleContextItems based on container width. Pills that don't fit will be moved into context overflow.
  // As width increases, move items back from context overflow into row of displayed pills.
  private recalculateVisibleItems (): void {
    const { contextItems } = this.props;
    if (contextItems.length === 0) return;

    const containerWidth = this.render.offsetWidth;
    const titleElement = this.render.querySelector<HTMLElement>('.title');
    const titleWidth = (titleElement != null) ? titleElement.offsetWidth + 8 : 0; // 8px for margin/padding
    const actionPillElement = this.render.querySelector<HTMLElement>('.pinned');
    const actionPillWidth = (actionPillElement != null) ? actionPillElement.offsetWidth + 8 : 0;
    const overflowElement = this.render.querySelector<HTMLElement>('.overflow');
    const overflowWidth = (overflowElement != null) ? overflowElement.offsetWidth + 8 : 0;

    // Available width for context pills
    const availableWidth = containerWidth - titleWidth - actionPillWidth - 16; // 16px for container padding

    // Check if we need to handle width increase scenario
    const shouldCheckForExpansion = this.getOverflowCount() > 0;
    if (shouldCheckForExpansion) {
      // Try to add one more item from overflow if we have at least 100px of extra space
      const extraSpaceNeeded = 100; // Maximum width for a pill to be brought back

      // Calculate current used width
      let currentUsedWidth = 0;
      const currentPills = Array.from(this.render.querySelectorAll('.context:not(.pinned):not(.overflow)'));
      currentPills.forEach((pill) => {
        currentUsedWidth += (pill as HTMLElement).offsetWidth + 8; // 8px for gap
      });

      // Check if we have enough space to bring back an item from overflow
      const remainingWidth = availableWidth - currentUsedWidth - overflowWidth;
      if (remainingWidth >= extraSpaceNeeded && this.getOverflowCount() > 0) {
        // We have enough space to bring back at least one item
        this.visibleCount++;

        // Rebuild the component with the new visible items
        this.update();
        return; // Exit early as we've updated the component
      }
    }

    // Handle width decrease scenario
    // Get all context pills
    const contextPills = Array.from(this.render.querySelectorAll('.context:not(.pinned):not(.overflow)'));

    // Calculate how many pills can fit
    let usedWidth = 0;
    let visibleCount = 0;

    for (let i = 0; i < contextPills.length; i++) {
      const pill = contextPills[i] as HTMLElement;
      usedWidth += pill.offsetWidth + 8; // 8px for gap

      if (usedWidth > availableWidth) {
        break;
      }

      visibleCount++;
    }
    // If we need to adjust the visible items
    if (this.visibleCount !== visibleCount) {
      this.visibleCount = visibleCount;

      // Rebuild the component with the new visible items

      this.update();
    }
  }
}
