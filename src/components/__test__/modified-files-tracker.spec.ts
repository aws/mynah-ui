import { ModifiedFilesTracker } from '../modified-files-tracker';
import { ChatItem, ChatItemType } from '../../static';
import { MynahUIGlobalEvents } from '../../helper/events';

// Mock global events
jest.mock('../../helper/events', () => ({
  MynahUIGlobalEvents: {
    getInstance: jest.fn(() => ({
      dispatch: jest.fn()
    }))
  }
}));

describe('ModifiedFilesTracker', () => {
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    (MynahUIGlobalEvents.getInstance as jest.Mock).mockReturnValue({
      dispatch: mockDispatch
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render basic modified files tracker', () => {
    const tracker = new ModifiedFilesTracker({ tabId: 'test-tab' });
    expect(tracker.render).toBeDefined();
    expect(tracker.render.classList.contains('hidden')).toBe(true);
  });

  describe('addChatItem', () => {
    it('should add chat item with file list', () => {
      const tracker = new ModifiedFilesTracker({ tabId: 'test-tab' });
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg1',
        header: {
          fileList: {
            filePaths: [ 'file1.ts' ],
            deletedFiles: [],
            actions: {},
            details: {}
          }
        }
      };

      tracker.addChatItem(chatItem);
      expect(tracker.render.classList.contains('hidden')).toBe(false);
    });

    it('should add chat item with buttons only', () => {
      const tracker = new ModifiedFilesTracker({ tabId: 'test-tab' });
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg2',
        buttons: [ { id: 'undo-all', text: 'Undo All' } ]
      };

      tracker.addChatItem(chatItem);
      expect(tracker.render.classList.contains('hidden')).toBe(true);
    });

    it('should not add chat item without messageId', () => {
      const tracker = new ModifiedFilesTracker({ tabId: 'test-tab' });
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        buttons: [ { id: 'undo-all', text: 'Undo All' } ]
      };

      tracker.addChatItem(chatItem);
      expect(tracker.render.classList.contains('hidden')).toBe(true);
    });
  });

  describe('undo-all button logic', () => {
    it('should render undo-all button when files were rendered previously', () => {
      const tracker = new ModifiedFilesTracker({ tabId: 'test-tab' });

      // Add file list first
      const fileItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'file-msg',
        header: {
          fileList: {
            filePaths: [ 'file1.ts' ],
            deletedFiles: [],
            actions: {},
            details: {}
          }
        }
      };

      // Add undo-all button
      const undoAllItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'undo-msg',
        buttons: [ { id: 'undo-all', text: 'Undo All' } ]
      };

      tracker.addChatItem(fileItem);
      tracker.addChatItem(undoAllItem);

      const undoContainer = tracker.render.querySelector('.mynah-modified-files-undo-all-container');
      expect(undoContainer).toBeTruthy();
    });

    it('should not render undo-all button when no files were rendered', () => {
      const tracker = new ModifiedFilesTracker({ tabId: 'test-tab' });

      // Add only undo-all button without files
      const undoAllItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'undo-msg',
        buttons: [ { id: 'undo-all', text: 'Undo All' } ]
      };

      tracker.addChatItem(undoAllItem);

      const undoContainer = tracker.render.querySelector('.mynah-modified-files-undo-all-container');
      expect(undoContainer).toBeFalsy();
    });
  });

  describe('removeChatItem', () => {
    it('should remove chat item by messageId', () => {
      const tracker = new ModifiedFilesTracker({ tabId: 'test-tab' });
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg1',
        header: {
          fileList: {
            filePaths: [ 'file1.ts' ],
            deletedFiles: [],
            actions: {},
            details: {}
          }
        }
      };

      tracker.addChatItem(chatItem);
      expect(tracker.render.classList.contains('hidden')).toBe(false);

      tracker.removeChatItem('msg1');
      expect(tracker.render.classList.contains('hidden')).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all chat items and hide tracker', () => {
      const tracker = new ModifiedFilesTracker({ tabId: 'test-tab' });
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'msg1',
        header: {
          fileList: {
            filePaths: [ 'file1.ts' ],
            deletedFiles: [],
            actions: {},
            details: {}
          }
        }
      };

      tracker.addChatItem(chatItem);
      expect(tracker.render.classList.contains('hidden')).toBe(false);

      tracker.clear();
      expect(tracker.render.classList.contains('hidden')).toBe(true);
    });
  });
});
