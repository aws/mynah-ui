import { ModifiedFilesTracker } from '../modified-files-tracker';
import { MynahUIGlobalEvents } from '../../helper/events';
import { ChatItem, ChatItemType, MynahEventNames } from '../../static';

// Mock dependencies
jest.mock('../../helper/style-loader', () => ({
  StyleLoader: {
    getInstance: jest.fn(() => ({
      load: jest.fn()
    }))
  }
}));

jest.mock('../../helper/events', () => ({
  MynahUIGlobalEvents: {
    getInstance: jest.fn(() => ({
      dispatch: jest.fn()
    }))
  }
}));

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

jest.mock('../chat-item/chat-item-tree-view-wrapper', () => ({
  ChatItemTreeViewWrapper: jest.fn().mockImplementation(() => ({
    render: document.createElement('div')
  }))
}));

jest.mock('../chat-item/chat-item-buttons', () => ({
  ChatItemButtonsWrapper: jest.fn().mockImplementation(() => ({
    render: document.createElement('div')
  }))
}));

describe('ModifiedFilesTracker', () => {
  let mockDispatch: jest.Mock;
  let mockContentWrapper: any;
  let mockCollapsibleContent: any;

  beforeEach(() => {
    mockDispatch = jest.fn();
    mockContentWrapper = {
      innerHTML: '',
      appendChild: jest.fn(),
      addEventListener: jest.fn()
    };

    (MynahUIGlobalEvents.getInstance as jest.Mock).mockReturnValue({
      dispatch: mockDispatch
    });

    const { CollapsibleContent } = jest.requireMock('../collapsible-content');
    mockCollapsibleContent = {
      render: {
        querySelector: jest.fn(() => mockContentWrapper)
      },
      updateTitle: jest.fn()
    };
    (CollapsibleContent as jest.Mock).mockImplementation(() => mockCollapsibleContent);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with basic props', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      expect(tracker.render).toBeDefined();
      expect(tracker.render.classList.contains('mynah-modified-files-tracker-wrapper')).toBe(true);
      expect(tracker.titleText).toBe('No files modified!');
    });

    it('should initialize with chatItem containing fileList', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1',
        header: {
          fileList: {
            filePaths: [ 'test.ts' ]
          }
        }
      };

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab',
        chatItem
      });

      expect(tracker).toBeDefined();
    });

    it('should render empty state when no fileList provided', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      expect(tracker).toBeDefined();
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });
  });

  describe('renderModifiedFiles', () => {
    let tracker: ModifiedFilesTracker;

    beforeEach(() => {
      tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });
    });

    it('should handle null fileList', () => {
      (tracker as any).renderModifiedFiles(null);
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });

    it('should add files to collection when fileList provided', () => {
      const fileList = {
        filePaths: [ 'test.ts', 'another.js' ]
      };

      (tracker as any).renderModifiedFiles(fileList, 'msg-1');
      expect((tracker as any).allFiles.size).toBe(1);
    });

    it('should handle empty filePaths array', () => {
      const fileList = {
        filePaths: []
      };

      (tracker as any).renderModifiedFiles(fileList, 'msg-1');
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });
  });

  describe('renderEmptyState', () => {
    it('should render empty state message', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      (tracker as any).renderEmptyState(mockContentWrapper);
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });
  });

  describe('renderAllFilePills', () => {
    let tracker: ModifiedFilesTracker;

    beforeEach(() => {
      tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });
    });

    it('should render file pills for each file', () => {
      const fileList = {
        filePaths: [ 'test.ts', 'another.js' ],
        deletedFiles: [],
        actions: {},
        details: {}
      };

      (tracker as any).allFiles.set('msg-1', { fileList, messageId: 'msg-1' });
      (tracker as any).renderAllFilePills(mockContentWrapper);

      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });

    it('should handle deleted files', () => {
      const fileList = {
        filePaths: [ 'test.ts' ],
        deletedFiles: [ 'test.ts' ],
        actions: {},
        details: {}
      };

      (tracker as any).allFiles.set('msg-1', { fileList, messageId: 'msg-1' });
      (tracker as any).renderAllFilePills(mockContentWrapper);

      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });

    it('should render buttons when chatItem has header buttons', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1',
        header: {
          buttons: [
            { id: 'accept', text: 'Accept' },
            { id: 'reject', text: 'Reject' }
          ]
        }
      };

      tracker = new ModifiedFilesTracker({
        tabId: 'test-tab',
        chatItem
      });

      const fileList = {
        filePaths: [ 'test.ts' ],
        deletedFiles: [],
        actions: {},
        details: {}
      };

      (tracker as any).allFiles.set('msg-1', { fileList, messageId: 'msg-1' });
      (tracker as any).renderAllFilePills(mockContentWrapper);

      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });
  });

  describe('getOriginalMessageId', () => {
    it('should remove modified-files- prefix', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      const result = (tracker as any).getOriginalMessageId('modified-files-msg-1');
      expect(result).toBe('msg-1');
    });

    it('should return original messageId if no prefix', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      const result = (tracker as any).getOriginalMessageId('msg-1');
      expect(result).toBe('msg-1');
    });
  });

  describe('renderUndoAllButton', () => {
    let tracker: ModifiedFilesTracker;

    beforeEach(() => {
      tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });
    });

    it('should render undo all button when chatItem has buttons', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1',
        buttons: [
          { id: 'undo-all', text: 'Undo All' }
        ]
      };

      (tracker as any).renderUndoAllButton(chatItem);
      expect(mockContentWrapper.appendChild).toHaveBeenCalled();
    });

    it('should return early when contentWrapper is null', () => {
      mockCollapsibleContent.render.querySelector.mockReturnValue(null);

      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1',
        buttons: [
          { id: 'undo-all', text: 'Undo All' }
        ]
      };

      expect(() => (tracker as any).renderUndoAllButton(chatItem)).not.toThrow();
    });

    it('should return early when chatItem has no buttons', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1'
      };

      expect(() => (tracker as any).renderUndoAllButton(chatItem)).not.toThrow();
    });

    it('should return early when messageId is empty', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: '',
        buttons: [
          { id: 'undo-all', text: 'Undo All' }
        ]
      };

      expect(() => (tracker as any).renderUndoAllButton(chatItem)).not.toThrow();
    });
  });

  describe('updateTitleText', () => {
    let tracker: ModifiedFilesTracker;

    beforeEach(() => {
      tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });
    });

    it('should update title when chatItem has title', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        title: 'Modified Files'
      };

      (tracker as any).updateTitleText(chatItem);
      expect(tracker.titleText).toBe('Modified Files');
      expect(mockCollapsibleContent.updateTitle).toHaveBeenCalledWith('Modified Files');
    });

    it('should not update title when chatItem title is empty', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        title: ''
      };

      const originalTitle = tracker.titleText;
      (tracker as any).updateTitleText(chatItem);
      expect(tracker.titleText).toBe(originalTitle);
    });

    it('should not update title when chatItem has no title', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER
      };

      const originalTitle = tracker.titleText;
      (tracker as any).updateTitleText(chatItem);
      expect(tracker.titleText).toBe(originalTitle);
    });
  });

  describe('addChatItem', () => {
    let tracker: ModifiedFilesTracker;

    beforeEach(() => {
      tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });
    });

    it('should add chatItem with fileList', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1',
        title: 'Test Title',
        header: {
          fileList: {
            filePaths: [ 'test.ts' ]
          }
        }
      };

      tracker.addChatItem(chatItem);
      expect(tracker.titleText).toBe('Test Title');
      expect((tracker as any).props.chatItem).toBe(chatItem);
    });

    it('should add chatItem with only buttons', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1',
        buttons: [
          { id: 'undo-all', text: 'Undo All' }
        ]
      };

      tracker.addChatItem(chatItem);
      expect((tracker as any).props.chatItem).toBe(chatItem);
    });

    it('should handle chatItem without fileList or buttons', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1'
      };

      expect(() => tracker.addChatItem(chatItem)).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all files and reset title', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      // Add some files first
      const fileList = {
        filePaths: [ 'test.ts' ]
      };
      (tracker as any).allFiles.set('msg-1', { fileList, messageId: 'msg-1' });

      tracker.clear();

      expect((tracker as any).allFiles.size).toBe(0);
      expect(tracker.titleText).toBe('No files modified!');
      expect(mockCollapsibleContent.updateTitle).toHaveBeenCalledWith('No files modified!');
    });
  });

  describe('setVisible', () => {
    it('should be a no-op method', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      expect(() => tracker.setVisible(true)).not.toThrow();
      expect(() => tracker.setVisible(false)).not.toThrow();
    });
  });

  describe('event handling', () => {
    it('should dispatch BODY_ACTION_CLICKED event with filePath', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1',
        header: {
          buttons: [
            { id: 'accept', text: 'Accept' }
          ],
          fileList: {
            filePaths: [ 'test.ts' ]
          }
        }
      };

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab',
        chatItem
      });

      expect(tracker).toBeDefined();

      // Simulate button click by calling the onActionClick callback
      const { ChatItemButtonsWrapper } = jest.requireMock('../chat-item/chat-item-buttons');
      const mockCall = (ChatItemButtonsWrapper as jest.Mock).mock.calls[0];
      const onActionClick = mockCall[0].onActionClick;

      onActionClick({ id: 'accept', text: 'Accept' });

      expect(mockDispatch).toHaveBeenCalledWith(MynahEventNames.BODY_ACTION_CLICKED, {
        tabId: 'test-tab',
        messageId: 'msg-1',
        actionId: 'accept',
        actionText: 'Accept',
        filePath: expect.any(String)
      });
    });

    it('should dispatch BODY_ACTION_CLICKED event for undo all button', () => {
      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg-1',
        buttons: [
          { id: 'undo-all', text: 'Undo All' }
        ]
      };

      (tracker as any).renderUndoAllButton(chatItem);

      // Simulate button click
      const { ChatItemButtonsWrapper } = jest.requireMock('../chat-item/chat-item-buttons');
      const mockCall = (ChatItemButtonsWrapper as jest.Mock).mock.calls[0];
      const onActionClick = mockCall[0].onActionClick;

      onActionClick({ id: 'undo-all', text: 'Undo All' });

      expect(mockDispatch).toHaveBeenCalledWith(MynahEventNames.BODY_ACTION_CLICKED, {
        tabId: 'test-tab',
        messageId: 'msg-1',
        actionId: 'undo-all',
        actionText: 'Undo All'
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null contentWrapper gracefully', () => {
      mockCollapsibleContent.render.querySelector.mockReturnValue(null);

      const tracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      expect(() => (tracker as any).renderModifiedFiles(null)).not.toThrow();
    });

    it('should handle fileList with actions and details', () => {
      const testTracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      const fileList = {
        filePaths: [ 'test.ts' ],
        deletedFiles: [],
        actions: {
          'test.ts': [ { id: 'view', text: 'View' } ]
        },
        details: {
          'test.ts': { changes: { added: 5, deleted: 2 } }
        }
      };

      expect(() => (testTracker as any).renderModifiedFiles(fileList, 'msg-1')).not.toThrow();
    });

    it('should handle multiple file groups', () => {
      const testTracker = new ModifiedFilesTracker({
        tabId: 'test-tab'
      });

      const fileList1 = {
        filePaths: [ 'test1.ts' ],
        deletedFiles: [],
        actions: {},
        details: {}
      };

      const fileList2 = {
        filePaths: [ 'test2.ts' ],
        deletedFiles: [],
        actions: {},
        details: {}
      };

      (testTracker as any).allFiles.set('msg-1', { fileList: fileList1, messageId: 'msg-1' });
      (testTracker as any).allFiles.set('msg-2', { fileList: fileList2, messageId: 'msg-2' });

      expect(() => (testTracker as any).renderAllFilePills(mockContentWrapper)).not.toThrow();
      expect(mockContentWrapper.appendChild).toHaveBeenCalledTimes(3);
    });
  });
});
