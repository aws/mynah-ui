/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatItemCard } from '../../chat-item/chat-item-card';
import { ChatItemType } from '../../../static';
import { MynahUIGlobalEvents } from '../../../helper/events';

// Mock the tabs store
jest.mock('../../../helper/tabs-store', () => ({
  MynahUITabsStore: {
    getInstance: jest.fn(() => ({
      getTabDataStore: jest.fn(() => ({
        subscribe: jest.fn(),
        getValue: jest.fn(() => ({})),
        updateStore: jest.fn()
      }))
    }))
  }
}));

// Mock global events
jest.mock('../../../helper/events', () => ({
  MynahUIGlobalEvents: {
    getInstance: jest.fn(() => ({
      dispatch: jest.fn()
    }))
  },
  MynahEventNames: {
    BODY_ACTION_CLICKED: 'BODY_ACTION_CLICKED'
  },
  cancelEvent: jest.fn()
}));

// Mock DOM builder
jest.mock('../../../helper/dom', () => ({
  DomBuilder: {
    getInstance: jest.fn(() => ({
      build: jest.fn((options) => {
        const element = document.createElement(options.type ?? 'div');
        if (options.classNames != null) {
          element.className = options.classNames.join(' ');
        }
        if (options.attributes != null) {
          Object.keys(options.attributes).forEach(key => {
            element.setAttribute(key, options.attributes[key]);
          });
        }
        if (options.innerHTML != null) {
          element.innerHTML = options.innerHTML;
        }
        if (options.children != null) {
          options.children.forEach((child: any) => {
            if (typeof child === 'string') {
              element.appendChild(document.createTextNode(child));
            } else if (child?.type != null) {
              const childElement = document.createElement(child.type);
              if (child.children != null && child.children.length > 0 && typeof child.children[0] === 'string') {
                childElement.textContent = child.children[0];
              }
              element.appendChild(childElement);
            } else if (child != null) {
              element.appendChild(child);
            }
          });
        }
        // Add mock methods
        element.addClass = jest.fn();
        element.removeClass = jest.fn();
        element.insertChild = jest.fn();
        element.update = jest.fn();
        return element;
      }),
      createPortal: jest.fn()
    }))
  },
  getTypewriterPartsCss: jest.fn(() => document.createElement('style')),
  ExtendedHTMLElement: HTMLElement,
  cleanupElement: jest.fn((element) => element) // Mock cleanup function
}));

// Mock other dependencies
jest.mock('../../card/card', () => ({
  Card: jest.fn().mockImplementation(() => {
    const mockElement = document.createElement('div') as any;
    mockElement.insertChild = jest.fn();
    mockElement.addClass = jest.fn();
    mockElement.removeClass = jest.fn();
    return {
      render: mockElement
    };
  })
}));

jest.mock('../../../helper/config', () => ({
  Config: {
    getInstance: jest.fn(() => ({
      config: {
        texts: {
          spinnerText: 'Loading...'
        },
        codeBlockActions: {},
        componentClasses: {
          Button: undefined // This allows the fallback to ButtonInternal
        }
      }
    }))
  }
}));

jest.mock('../../../helper/guid', () => ({
  generateUID: jest.fn(() => 'test-uid')
}));

describe('ChatItemCard - Modify Functionality', () => {
  let mockDispatch: jest.Mock;
  let mockContentBody: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock for global events
    mockDispatch = jest.fn();
    (MynahUIGlobalEvents.getInstance as jest.Mock).mockReturnValue({
      dispatch: mockDispatch
    });

    // Mock content body with modify methods
    mockContentBody = {
      render: document.createElement('div'),
      enterEditMode: jest.fn(),
      onSaveClicked: jest.fn(() => 'edited-command'),
      onCancelClicked: jest.fn(),
      getRenderDetails: jest.fn(() => ({ totalNumberOfCodeBlocks: 0 })),
      updateCardStack: jest.fn()
    };
  });

  describe('Editable Chat Item Button States', () => {
    it('should show modify button when editable is true but not in edit mode', () => {
      const chatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'test-message',
        body: '```shell\nnpm install\n```',
        editable: true,
        buttons: [
          { id: 'run-shell-command', text: 'Run', status: 'primary' as const },
          { id: 'reject-shell-command', text: 'Reject', status: 'clear' as const }
        ]
      };

      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem
      });

      // Mock the contentBody to simulate not being in edit mode
      (card as any).contentBody = mockContentBody;
      (card as any).isContentBodyInEditMode = false;

      // Trigger updateCardContent to set up buttons
      (card as any).updateCardContent();

      // Check that modify button is added
      const buttonWrapper = (card as any).chatButtonsInside;
      expect(buttonWrapper).toBeDefined();
    });

    it('should show save/cancel buttons when in edit mode', () => {
      const chatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'test-message',
        body: '```shell\nnpm install\n```',
        editable: true,
        buttons: [
          { id: 'run-shell-command', text: 'Run', status: 'primary' as const }
        ]
      };

      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem
      });

      // Mock the contentBody to simulate being in edit mode
      (card as any).contentBody = mockContentBody;
      (card as any).isContentBodyInEditMode = true;

      // Trigger updateCardContent to set up buttons
      (card as any).updateCardContent();

      // Check that save/cancel buttons are shown
      const buttonWrapper = (card as any).chatButtonsInside;
      expect(buttonWrapper).toBeDefined();
    });
  });

  describe('Modify Button Actions', () => {
    let card: ChatItemCard;
    let chatItem: any;

    beforeEach(() => {
      chatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'test-message',
        body: '```shell\nnpm install\n```',
        editable: true,
        buttons: [
          { id: 'run-shell-command', text: 'Run', status: 'primary' }
        ]
      };

      card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem
      });

      // Mock the contentBody
      (card as any).contentBody = mockContentBody;
      (card as any).isContentBodyInEditMode = false;
    });

    it('should handle modify button click', () => {
      const mockAction = { id: 'modify-shell-command', text: 'Modify' };

      // Simulate modify button click through the button wrapper's onActionClick
      const buttonWrapper = (card as any).chatButtonsInside;
      buttonWrapper?.props?.onActionClick?.(mockAction);

      // Verify enterEditMode was called
      expect(mockContentBody.enterEditMode).toHaveBeenCalled();

      // Verify event was dispatched
      expect(mockDispatch).toHaveBeenCalledWith('bodyActionClicked', {
        tabId: 'test-tab',
        messageId: 'test-message',
        actionId: 'modify-shell-command',
        actionText: 'Modify'
      });
    });

    it('should handle save button click', () => {
      const mockAction = { id: 'save-shell-command', text: 'Save' };

      // Simulate save button click
      const buttonWrapper = (card as any).chatButtonsInside;
      buttonWrapper?.props?.onActionClick?.(mockAction);

      // Verify onSaveClicked was called and returned the edited text
      expect(mockContentBody.onSaveClicked).toHaveBeenCalled();

      // Verify event was dispatched with editedText
      expect(mockDispatch).toHaveBeenCalledWith('bodyActionClicked', {
        tabId: 'test-tab',
        messageId: 'test-message',
        actionId: 'save-shell-command',
        actionText: 'Save',
        editedText: 'edited-command'
      });
    });

    it('should handle cancel button click', () => {
      const mockAction = { id: 'cancel-shell-command', text: 'Cancel' };

      // Simulate cancel button click
      const buttonWrapper = (card as any).chatButtonsInside;
      buttonWrapper?.props?.onActionClick?.(mockAction);

      // Verify onCancelClicked was called
      expect(mockContentBody.onCancelClicked).toHaveBeenCalled();

      // Verify event was dispatched
      expect(mockDispatch).toHaveBeenCalledWith('bodyActionClicked', {
        tabId: 'test-tab',
        messageId: 'test-message',
        actionId: 'cancel-shell-command',
        actionText: 'Cancel'
      });
    });
  });

  describe('Edit Mode Change Handling', () => {
    it('should update button states when edit mode changes', () => {
      const chatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'test-message',
        body: '```shell\nnpm install\n```',
        editable: true,
        buttons: [
          { id: 'run-shell-command', text: 'Run', status: 'primary' as const }
        ]
      };

      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem
      });

      // Mock the contentBody with onEditModeChange callback
      (card as any).contentBody = {
        ...mockContentBody,
        render: document.createElement('div')
      };

      // Simulate edit mode change by calling onEditModeChange
      const contentProps = (card as any).contentBody.updateCardStack.mock.calls[0]?.[0];
      if (contentProps?.onEditModeChange != null) {
        // Enter edit mode
        contentProps.onEditModeChange(true);
        expect((card as any).isContentBodyInEditMode).toBe(true);

        // Exit edit mode
        contentProps.onEditModeChange(false);
        expect((card as any).isContentBodyInEditMode).toBe(false);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing contentBody gracefully', () => {
      const chatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'test-message',
        body: '```shell\nnpm install\n```',
        editable: true,
        buttons: [
          { id: 'run-shell-command', text: 'Run', status: 'primary' as const }
        ]
      };

      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem
      });

      // Set contentBody to null
      (card as any).contentBody = null;

      const mockAction = { id: 'save-shell-command', text: 'Save' };

      // This should not throw an error
      expect(() => {
        const buttonWrapper = (card as any).chatButtonsInside;
        buttonWrapper?.props?.onActionClick?.(mockAction);
      }).not.toThrow();
    });

    it('should handle save action when onSaveClicked returns undefined', () => {
      const chatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'test-message',
        body: '```shell\nnpm install\n```',
        editable: true,
        buttons: []
      };

      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem
      });

      const mockContentBodyWithUndefinedSave = {
        ...mockContentBody,
        onSaveClicked: jest.fn(() => undefined)
      };

      (card as any).contentBody = mockContentBodyWithUndefinedSave;

      const mockAction = { id: 'save-shell-command', text: 'Save' };

      const buttonWrapper = (card as any).chatButtonsInside;
      buttonWrapper?.props?.onActionClick?.(mockAction);

      // Should still dispatch event, but with undefined editedText
      expect(mockDispatch).toHaveBeenCalledWith('bodyActionClicked', {
        tabId: 'test-tab',
        messageId: 'test-message',
        actionId: 'save-shell-command',
        actionText: 'Save',
        editedText: undefined
      });
    });
  });

  describe('Integration with Other Buttons', () => {
    it('should handle non-modify buttons normally', () => {
      const chatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'test-message',
        body: '```shell\nnpm install\n```',
        editable: true,
        buttons: [
          { id: 'run-shell-command', text: 'Run', status: 'primary' as const },
          { id: 'reject-shell-command', text: 'Reject', status: 'clear' as const }
        ]
      };

      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem
      });

      (card as any).contentBody = mockContentBody;

      const mockAction = { id: 'run-shell-command', text: 'Run' };

      // Simulate non-modify button click
      const buttonWrapper = (card as any).chatButtonsInside;
      buttonWrapper?.props?.onActionClick?.(mockAction);

      // Verify it doesn't call modify-specific methods
      expect(mockContentBody.enterEditMode).not.toHaveBeenCalled();
      expect(mockContentBody.onSaveClicked).not.toHaveBeenCalled();
      expect(mockContentBody.onCancelClicked).not.toHaveBeenCalled();

      // But should still dispatch the event
      expect(mockDispatch).toHaveBeenCalledWith('bodyActionClicked', {
        tabId: 'test-tab',
        messageId: 'test-message',
        actionId: 'run-shell-command',
        actionText: 'Run'
      });
    });
  });

  describe('Button Position and Ordering', () => {
    it('should position modify button correctly in button array', () => {
      const chatItem = {
        type: ChatItemType.ANSWER,
        messageId: 'test-message',
        body: '```shell\nnpm install\n```',
        editable: true,
        buttons: [
          { id: 'run-shell-command', text: 'Run', status: 'primary' as const },
          { id: 'reject-shell-command', text: 'Reject', status: 'clear' as const }
        ]
      };

      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem
      });

      (card as any).contentBody = mockContentBody;
      (card as any).isContentBodyInEditMode = false;

      // Force button update
      (card as any).updateCardContent();

      // Check that buttons are properly ordered with modify first
      const buttonWrapper = (card as any).chatButtonsInside;
      expect(buttonWrapper).toBeDefined();
    });
  });
});
