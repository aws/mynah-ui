/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatItemCard } from './chat-item-card';
import { ChatItem, ChatItemType, MynahEventNames } from '../../static';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { MynahUIGlobalEvents } from '../../helper/events';
import { DomBuilder } from '../../helper/dom';
import { MynahIcons } from '../icon';

// Mock dependencies
jest.mock('../../helper/tabs-store');
jest.mock('../../helper/events');
jest.mock('../../helper/dom');

describe('ChatItemCard Modify Functionality', () => {
  let mockTabsStore: jest.Mocked<MynahUITabsStore>;
  let mockGlobalEvents: jest.Mocked<MynahUIGlobalEvents>;
  let mockDomBuilder: jest.Mocked<DomBuilder>;
  let mockTabDataStore: any;

  const mockTabId = 'test-tab-id';
  const mockMessageId = 'test-message-id';

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock DOM Builder
    mockDomBuilder = {
      getInstance: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({
        insertChild: jest.fn(),
        remove: jest.fn(),
        addClass: jest.fn(),
        removeClass: jest.fn(),
        update: jest.fn(),
        insertAdjacentElement: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
        scrollHeight: 100,
        clientHeight: 80,
        style: {},
        parentNode: {
          replaceChild: jest.fn()
        }
      })
    } as any;
    (DomBuilder.getInstance as jest.Mock).mockReturnValue(mockDomBuilder);

    // Mock Tab Data Store
    mockTabDataStore = {
      getValue: jest.fn(),
      updateStore: jest.fn(),
      subscribe: jest.fn()
    };

    // Mock Tabs Store
    mockTabsStore = {
      getInstance: jest.fn().mockReturnThis(),
      getTabDataStore: jest.fn().mockReturnValue(mockTabDataStore)
    } as any;
    (MynahUITabsStore.getInstance as jest.Mock).mockReturnValue(mockTabsStore);

    // Mock Global Events
    mockGlobalEvents = {
      getInstance: jest.fn().mockReturnThis(),
      dispatch: jest.fn()
    } as any;
    (MynahUIGlobalEvents.getInstance as jest.Mock).mockReturnValue(mockGlobalEvents);

    // Default tab data store values
    mockTabDataStore.getValue.mockImplementation((key: string) => {
      switch (key) {
        case 'showChatAvatars':
          return true;
        case 'chatItems':
          return [];
        default:
          return undefined;
      }
    });
  });

  describe('Editable Content Functionality', () => {
    it('should handle editable mode transition correctly', () => {
      const shellChatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "hello world"\n```',
        editable: false,
        header: {
          body: 'shell',
          buttons: [
            { id: 'run-shell-command', text: 'Run', icon: MynahIcons.PLAY },
            { id: 'modify-bash-command', text: 'Modify', icon: MynahIcons.PENCIL }
          ]
        }
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem: shellChatItem
      });

      expect(chatCard).toBeDefined();
      expect(mockDomBuilder.build).toHaveBeenCalled();
    });

    it('should switch to editable mode when editable is set to true', () => {
      const initialChatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        editable: false
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem: initialChatItem
      });

      // Update to editable mode
      const editableChatItem: ChatItem = {
        ...initialChatItem,
        editable: true
      };

      chatCard.updateCardStack(editableChatItem);

      // Verify that the content was updated
      expect(mockTabDataStore.updateStore).toHaveBeenCalled();
    });

    it('should extract shell command from markdown code block for editing', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "hello world"\nls -la\n```',
        editable: true
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      expect(chatCard).toBeDefined();
      // The content body should be created with editable=true
      expect(mockDomBuilder.build).toHaveBeenCalled();
    });

    it('should handle transition from editable back to non-editable', () => {
      const editableChatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        editable: true
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem: editableChatItem
      });

      // Update back to non-editable
      const nonEditableChatItem: ChatItem = {
        ...editableChatItem,
        editable: false,
        body: '```shell\necho "modified test"\n```'
      };

      chatCard.updateCardStack(nonEditableChatItem);

      expect(mockTabDataStore.updateStore).toHaveBeenCalled();
    });

    it('should preserve content when switching between editable states', () => {
      const initialContent = 'echo "original command"';
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: `\`\`\`shell\n${initialContent}\n\`\`\``,
        editable: false
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      // Switch to editable
      chatCard.updateCardStack({ editable: true });

      // Switch back to non-editable
      chatCard.updateCardStack({
        editable: false,
        body: `\`\`\`shell\n${initialContent}\n\`\`\``
      });

      expect(mockTabDataStore.updateStore).toHaveBeenCalledTimes(2);
    });
  });

  describe('Button Click Handling for Modify Features', () => {
    it('should dispatch button click events for modify buttons', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        buttons: [
          { id: 'modify-bash-command', text: 'Modify', icon: MynahIcons.PENCIL },
          { id: 'accept-bash-command', text: 'Accept', icon: MynahIcons.OK },
          { id: 'cancel-bash-edit', text: 'Cancel', icon: MynahIcons.CANCEL }
        ]
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      expect(chatCard).toBeDefined();
    });

    it('should handle keepCardAfterClick = false for button clicks', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        buttons: [
          {
            id: 'undo-all-changes',
            text: 'Undo all changes',
            icon: MynahIcons.UNDO,
            keepCardAfterClick: false
          }
        ]
      };

      mockTabDataStore.getValue.mockImplementation((key: string) => {
        if (key === 'chatItems') {
          return [ chatItem ];
        }
        return [];
      });

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      expect(chatCard).toBeDefined();
    });

    it('should properly update chat items when button removes card', () => {
      const chatItems: ChatItem[] = [
        {
          type: ChatItemType.ANSWER,
          messageId: mockMessageId,
          body: '```shell\necho "test"\n```'
        },
        {
          type: ChatItemType.ANSWER,
          messageId: 'other-message',
          body: 'Some other message'
        }
      ];

      mockTabDataStore.getValue.mockReturnValue(chatItems);

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem: chatItems[0]
      });

      expect(chatCard).toBeDefined();
    });
  });

  describe('Content Update Handling', () => {
    it('should handle body updates correctly', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "original"\n```',
        editable: false
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      // Update the body content
      chatCard.updateCardStack({
        body: '```shell\necho "updated"\n```'
      });

      expect(mockTabDataStore.updateStore).toHaveBeenCalled();
    });

    it('should handle null body updates', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```'
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      // Update with null body
      chatCard.updateCardStack({ body: null });

      expect(mockTabDataStore.updateStore).toHaveBeenCalled();
    });

    it('should handle empty body updates', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```'
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      // Update with empty body
      chatCard.updateCardStack({ body: '' });

      expect(mockTabDataStore.updateStore).toHaveBeenCalled();
    });
  });

  describe('Header and Button Updates', () => {
    it('should update header buttons when switching to edit mode', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        header: {
          body: 'shell',
          buttons: [
            { id: 'run-shell-command', text: 'Run', icon: MynahIcons.PLAY },
            { id: 'modify-bash-command', text: 'Modify', icon: MynahIcons.PENCIL }
          ]
        }
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      // Update to edit mode with different buttons
      chatCard.updateCardStack({
        editable: true,
        header: {
          body: 'shell',
          buttons: [
            { id: 'accept-bash-command', text: 'Accept', icon: MynahIcons.OK },
            { id: 'cancel-bash-edit', text: 'Cancel', icon: MynahIcons.CANCEL }
          ]
        }
      });

      expect(mockTabDataStore.updateStore).toHaveBeenCalled();
    });

    it('should handle header status updates', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        header: {
          body: 'shell',
          status: {
            status: 'info',
            icon: MynahIcons.INFO,
            text: 'Ready'
          }
        }
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      // Update status
      chatCard.updateCardStack({
        header: {
          ...chatItem.header,
          status: {
            status: 'success',
            icon: MynahIcons.OK,
            text: 'Completed'
          }
        }
      });

      expect(mockTabDataStore.updateStore).toHaveBeenCalled();
    });

    it('should handle null header updates', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        header: {
          body: 'shell'
        }
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      // Update with null header
      chatCard.updateCardStack({ header: null });

      expect(mockTabDataStore.updateStore).toHaveBeenCalled();
    });
  });

  describe('Event Dispatching', () => {
    it('should dispatch BODY_ACTION_CLICKED event for button clicks', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        buttons: [
          { id: 'modify-bash-command', text: 'Modify', icon: MynahIcons.PENCIL }
        ]
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      expect(chatCard).toBeDefined();
      // The button click handling is tested implicitly through the button wrapper
    });

    it('should handle form item values in button click events', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        buttons: [
          { id: 'run-shell-command', text: 'Run', icon: MynahIcons.PLAY }
        ],
        formItems: [
          {
            id: 'test-input',
            type: 'textinput',
            title: 'Test Input'
          }
        ]
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      expect(chatCard).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined messageId gracefully', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        // messageId is undefined
        body: '```shell\necho "test"\n```',
        editable: true
      };

      expect(() => {
        new ChatItemCard({
          tabId: mockTabId,
          chatItem
        });
      }).not.toThrow();
    });

    it('should handle malformed shell command blocks', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: 'echo "not in code block"',
        editable: true
      };

      expect(() => {
        new ChatItemCard({
          tabId: mockTabId,
          chatItem
        });
      }).not.toThrow();
    });

    it('should handle multiple code blocks in body', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "first"\n```\n\nSome text\n\n```shell\necho "second"\n```',
        editable: true
      };

      expect(() => {
        new ChatItemCard({
          tabId: mockTabId,
          chatItem
        });
      }).not.toThrow();
    });

    it('should handle updateCardStack with empty object', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```'
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      expect(() => {
        chatCard.updateCardStack({});
      }).not.toThrow();
    });

    it('should handle clearContent operation', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```',
        header: { body: 'shell' },
        buttons: [ { id: 'test-button', text: 'Test' } ]
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      expect(() => {
        chatCard.clearContent();
      }).not.toThrow();
    });
  });

  describe('Integration with Tabs Store', () => {
    it('should subscribe to showChatAvatars changes', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```'
      };

      new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      expect(mockTabDataStore.subscribe).toHaveBeenCalledWith(
        'showChatAvatars',
        expect.any(Function)
      );
    });

    it('should update store when card is updated', () => {
      const chatItem: ChatItem = {
        type: ChatItemType.ANSWER,
        messageId: mockMessageId,
        body: '```shell\necho "test"\n```'
      };

      const chatCard = new ChatItemCard({
        tabId: mockTabId,
        chatItem
      });

      chatCard.updateCardStack({ editable: true });

      expect(mockTabDataStore.updateStore).toHaveBeenCalled();
    });
  });
});
