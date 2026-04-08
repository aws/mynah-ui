import { DetailedListWrapper } from '../../detailed-list/detailed-list';
import { DetailedListItemGroup } from '../../../static';

/**
 * Build a list with N items, each with a unique id 'item-0', 'item-1', ...
 */
const buildList = (count: number): DetailedListItemGroup[] => [ {
  groupName: 'Test group',
  children: Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i}`,
    description: `desc ${i}`,
  })),
} ];

const focusFirstItem = (wrapper: DetailedListWrapper): void => {
  // changeTarget moves focus from -1 to the first selectable item.
  wrapper.changeTarget('down', false, false);
};

const focusNextItem = (wrapper: DetailedListWrapper): void => {
  wrapper.changeTarget('down', false, false);
};

describe('DetailedListWrapper.update preserveFocus', () => {
  it('preserves the focused index across update when preserveFocus is true', () => {
    const wrapper = new DetailedListWrapper({
      detailedList: { list: buildList(5), selectable: true },
    });

    // Move focus to index 2 (third item).
    focusFirstItem(wrapper);
    focusNextItem(wrapper);
    focusNextItem(wrapper);
    expect(wrapper.getTargetElement()?.id).toBe('item-2');

    // Update with a new list of the same length, preserveFocus = true.
    wrapper.update({ list: buildList(5) }, false, true);

    // The focused element should still be at index 2 in the rebuilt list.
    expect(wrapper.getTargetElement()?.id).toBe('item-2');
  });

  it('resets focus when preserveFocus is false (default behavior)', () => {
    const wrapper = new DetailedListWrapper({
      detailedList: { list: buildList(5), selectable: true },
    });

    focusFirstItem(wrapper);
    focusNextItem(wrapper);
    expect(wrapper.getTargetElement()?.id).toBe('item-1');

    // Update without preserveFocus — focus should reset.
    wrapper.update({ list: buildList(5) });

    expect(wrapper.getTargetElement()).toBeNull();
  });

  it('gracefully handles preserveFocus when the new list is shorter than the saved index', () => {
    const wrapper = new DetailedListWrapper({
      detailedList: { list: buildList(10), selectable: true },
    });

    // Focus index 7.
    for (let i = 0; i < 8; i++) {
      wrapper.changeTarget('down', false, false);
    }
    expect(wrapper.getTargetElement()?.id).toBe('item-7');

    // Update to a 3-item list — index 7 is out of range.
    wrapper.update({ list: buildList(3) }, false, true);

    // No item should be focused (the saved index is invalid in the new list).
    expect(wrapper.getTargetElement()).toBeNull();
  });

  it('preserveFocus with no prior selection is a no-op', () => {
    const wrapper = new DetailedListWrapper({
      detailedList: { list: buildList(5), selectable: true },
    });

    // No initial focus (activeTargetElementIndex is -1).
    expect(wrapper.getTargetElement()).toBeNull();

    wrapper.update({ list: buildList(5) }, false, true);

    // Still no focus.
    expect(wrapper.getTargetElement()).toBeNull();
  });
});
