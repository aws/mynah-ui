import { ModifiedFilesTracker } from '../modified-files-tracker';
import { MynahUIGlobalEvents } from '../../helper/events';
import { ChatItem, ChatItemType } from '../../static';

// Mock the tabs store
jest.mock('../../helper/tabs-store', () => ({
  MynahUITabsStore: {
    getInstance: jest.fn(() => ({
      getTabDataStore: jest.fn(() => ({
        subscribe: jest.fn(),
        getValue: jest.fn((key: string) => {
          if (key === 'chatItems') {
            return [];
          }
          return '';
        })
      }))
    }))
  }
}));

// Mock global events
jest.mock('../../helper/events', () => ({
  MynahUIGlobalEvents: {
    getInstance: jest.fn(() => ({
      dispatch: jest.fn()
    }))
  }
}));

// Mock CollapsibleContent
jest.mock('../collapsible-content', () => ({
  CollapsibleContent: jest.fn().mockImplementation(() => ({
    render: {
      querySelector: jest.fn(() => ({
        innerHTML: '',
        appendChild: jest.fn()
      }))
    },
    updateTitle: jest.fn()
  }))
}));

describe('ModifiedFilesTracker', () => {
  let mockDispatch: jest.Mock;
  let mockSubscribe: jest.Mock;
  let mockGetValue: jest.Mock;
  let mockGetTabDataStore: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockSubscribe = jest.fn();
    mockGetValue = jest.fn((key: string) => {
      if (key === 'chatItems') {
        return [];
      }
      return '';
    });
    mockGetTabDataStore = jest.fn(() => ({
      subscribe: mockSubscribe,
      getValue: mockGetValue
    }));

    (MynahUIGlobalEvents.getInstance as jest.Mock).mockReturnValue({
      dispatch: mockDispatch
    });

    const { MynahUITabsStore } = jest.requireMock('../../helper/tabs-store');
    (MynahUITabsStore.getInstance as jest.Mock).mockReturnValue({
      getTabDataStore: mockGetTabDataStore
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    const tracker = new ModifiedFilesTracker({
      tabId: 'test-tab'
    });

    expect(tracker.render).toBeDefined();
    expect(tracker.render.classList.contains('mynah-modified-files-tracker-wrapper')).toBeTruthy();
    expect(tracker.render.classList.contains('hidden')).toBeTruthy();
  });

  it('should render visible when visible prop is true', () => {
    const tracker = new ModifiedFilesTracker({
      tabId: 'test-tab',
      visible: true
    });

    expect(tracker.render.classList.contains('hidden')).toBeFalsy();
  });

  it('should subscribe to chatItems and modifiedFilesTitle', () => {
    const tracker = new ModifiedFilesTracker({
      tabId: 'test-tab'
    });

    expect(tracker).toBeDefined();
    expect(mockSubscribe).toHaveBeenCalledWith('chatItems', expect.any(Function));
    expect(mockSubscribe).toHaveBeenCalledWith('modifiedFilesTitle', expect.any(Function));
  });

  describe('updateContent', () => {
    let tracker: ModifiedFilesTracker;
    let mockContentWrapper: any;

    beforeEach(() => {
      mockContentWrapper = {
        innerHTML: '',
        appendChild: jest.fn()
      };

      const { CollapsibleContent } = jest.requireMock('../collapsible-content');
      (CollapsibleContent as jest.Mock).mockImplementation(() => ({
        render: {
          querySelector: jest.fn(() => mockContentWrapper)
        },
        updateTitle: jest.fn()
      }));

      tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });
    });

    it('should show empty state when no modified files', () => {
      mockGetValue.mockReturnValue([]);

      (tracker as any).updateContent();

      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });

    it('should render file pills when modified files exist', () => {
      const mockChatItems: ChatItem[] = [
        {
          type: ChatItemType.ANSWER,
          messageId: 'msg-1',
          fileList: {
            filePaths: [ 'test.ts' ],
            details: {
              'test.ts': {
                changes: { added: 5, deleted: 2 },
                visibleName: 'test.ts',
                icon: 'ok-circled'
              }
            }
          }
        }
      ];

      mockGetValue.mockReturnValue(mockChatItems);

      (tracker as any).updateContent();

      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });
  });

  describe('title updates', () => {
    it('should update title when modifiedFilesTitle changes', () => {
      const mockUpdateTitle = jest.fn();
      const { CollapsibleContent } = jest.requireMock('../collapsible-content');
      (CollapsibleContent as jest.Mock).mockImplementation(() => ({
        render: {
          querySelector: jest.fn(() => ({ innerHTML: '', appendChild: jest.fn() }))
        },
        updateTitle: mockUpdateTitle
      }));

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      expect(tracker).toBeDefined();

      const titleCallback = mockSubscribe.mock.calls.find(
        (call: any) => call[0] === 'modifiedFilesTitle'
      )?.[1];

      titleCallback?.('New Title');

      expect(mockUpdateTitle).toHaveBeenCalledWith('New Title');
    });

    it('should not update title when empty string is provided', () => {
      const mockUpdateTitle = jest.fn();
      const { CollapsibleContent } = jest.requireMock('../collapsible-content');
      (CollapsibleContent as jest.Mock).mockImplementation(() => ({
        render: {
          querySelector: jest.fn(() => ({ innerHTML: '', appendChild: jest.fn() }))
        },
        updateTitle: mockUpdateTitle
      }));

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      expect(tracker).toBeDefined();

      const titleCallback = mockSubscribe.mock.calls.find(
        (call: any) => call[0] === 'modifiedFilesTitle'
      )?.[1];

      titleCallback?.('');

      expect(mockUpdateTitle).not.toHaveBeenCalled();
    });
  });

  describe('setVisible method', () => {
    it('should show tracker when setVisible(true) is called', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      tracker.render.removeClass = jest.fn();
      tracker.setVisible(true);

      expect(tracker.render.removeClass).toHaveBeenCalledWith('hidden');
    });

    it('should hide tracker when setVisible(false) is called', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      tracker.render.addClass = jest.fn();
      tracker.setVisible(false);

      expect(tracker.render.addClass).toHaveBeenCalledWith('hidden');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle null contentWrapper gracefully', () => {
      const { CollapsibleContent } = jest.requireMock('../collapsible-content');
      (CollapsibleContent as jest.Mock).mockImplementation(() => ({
        render: {
          querySelector: jest.fn(() => null)
        },
        updateTitle: jest.fn()
      }));

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      expect(() => (tracker as any).updateContent()).not.toThrow();
    });

    it('should handle files with deleted status', () => {
      const mockContentWrapper = {
        innerHTML: '',
        appendChild: jest.fn()
      };

      const { CollapsibleContent } = jest.requireMock('../collapsible-content');
      (CollapsibleContent as jest.Mock).mockImplementation(() => ({
        render: {
          querySelector: jest.fn(() => mockContentWrapper)
        },
        updateTitle: jest.fn()
      }));

      const mockChatItems: ChatItem[] = [
        {
          type: ChatItemType.ANSWER,
          messageId: 'msg-1',
          fileList: {
            filePaths: [ 'deleted.ts' ],
            deletedFiles: [ 'deleted.ts' ],
            details: {
              'deleted.ts': {
                changes: { added: 0, deleted: 10 },
                visibleName: 'deleted.ts',
                icon: 'trash'
              }
            }
          }
        }
      ];

      mockGetValue.mockReturnValue(mockChatItems);

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      (tracker as any).updateContent();
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });

    it('should handle files with undo buttons', () => {
      const mockContentWrapper = {
        innerHTML: '',
        appendChild: jest.fn()
      };

      const { CollapsibleContent } = jest.requireMock('../collapsible-content');
      (CollapsibleContent as jest.Mock).mockImplementation(() => ({
        render: {
          querySelector: jest.fn(() => mockContentWrapper)
        },
        updateTitle: jest.fn()
      }));

      const mockChatItems: ChatItem[] = [
        {
          type: ChatItemType.ANSWER,
          messageId: 'msg-1',
          header: {
            buttons: [ { id: 'undo-changes', text: 'Undo' } ]
          },
          fileList: {
            filePaths: [ 'test.ts' ],
            details: {
              'test.ts': {
                changes: { added: 5, deleted: 2 },
                visibleName: 'test.ts',
                icon: 'ok-circled'
              }
            }
          }
        }
      ];

      mockGetValue.mockReturnValue(mockChatItems);

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      (tracker as any).updateContent();
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });

    it('should handle undo-all-changes button', () => {
      const mockContentWrapper = {
        innerHTML: '',
        appendChild: jest.fn()
      };

      const { CollapsibleContent } = jest.requireMock('../collapsible-content');
      (CollapsibleContent as jest.Mock).mockImplementation(() => ({
        render: {
          querySelector: jest.fn(() => mockContentWrapper)
        },
        updateTitle: jest.fn()
      }));

      const mockChatItems: ChatItem[] = [
        {
          type: ChatItemType.ANSWER,
          messageId: 'msg-1',
          header: {
            buttons: [ { id: 'undo-all-changes', text: 'Undo All Changes' } ]
          },
          fileList: {
            filePaths: [ 'test.ts' ],
            details: {
              'test.ts': {
                changes: { added: 5, deleted: 2 },
                visibleName: 'test.ts'
              }
            }
          }
        }
      ];

      mockGetValue.mockReturnValue(mockChatItems);

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      (tracker as any).updateContent();
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });

    it('should handle files without icon', () => {
      const mockContentWrapper = {
        innerHTML: '',
        appendChild: jest.fn()
      };

      const { CollapsibleContent } = jest.requireMock('../collapsible-content');
      (CollapsibleContent as jest.Mock).mockImplementation(() => ({
        render: {
          querySelector: jest.fn(() => mockContentWrapper)
        },
        updateTitle: jest.fn()
      }));

      const mockChatItems: ChatItem[] = [
        {
          type: ChatItemType.ANSWER,
          messageId: 'msg-1',
          fileList: {
            filePaths: [ 'test.ts' ],
            details: {
              'test.ts': {
                changes: { added: 5, deleted: 2 },
                visibleName: 'test.ts'
              }
            }
          }
        }
      ];

      mockGetValue.mockReturnValue(mockChatItems);

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      (tracker as any).updateContent();
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });

    it('should handle files with clickable false', () => {
      const mockContentWrapper = {
        innerHTML: '',
        appendChild: jest.fn()
      };

      const { CollapsibleContent } = jest.requireMock('../collapsible-content');
      (CollapsibleContent as jest.Mock).mockImplementation(() => ({
        render: {
          querySelector: jest.fn(() => mockContentWrapper)
        },
        updateTitle: jest.fn()
      }));

      const mockChatItems: ChatItem[] = [
        {
          type: ChatItemType.ANSWER,
          messageId: 'msg-1',
          fileList: {
            filePaths: [ 'test.ts' ],
            details: {
              'test.ts': {
                changes: { added: 5, deleted: 2 },
                visibleName: 'test.ts',
                clickable: false
              }
            }
          }
        }
      ];

      mockGetValue.mockReturnValue(mockChatItems);

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      (tracker as any).updateContent();
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });
  });
});
