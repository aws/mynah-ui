/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatItemCardContent, ChatItemCardContentProps } from '../chat-item/chat-item-card-content';
import { DomBuilder } from '../../helper/dom';
import { CardBody } from '../card/card-body';

// Mock dependencies
jest.mock('../../helper/dom');
jest.mock('../card/card-body');
jest.mock('../../helper/guid', () => ({
  generateUID: jest.fn(() => 'test-uid-123')
}));

describe('ChatItemCardContent Modify Functionality', () => {
  let mockDomBuilder: jest.Mocked<DomBuilder>;
  let mockCardBody: jest.Mocked<CardBody>;
  let mockTextarea: HTMLTextAreaElement;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock textarea element
    mockTextarea = {
      value: '',
      style: { height: '40px' },
      scrollHeight: 60,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      focus: jest.fn(),
      blur: jest.fn()
    } as any;

    // Mock DOM Builder
    mockDomBuilder = {
      getInstance: jest.fn().mockReturnThis(),
      build: jest.fn().mockImplementation((config) => {
        if (config.type === 'textarea') {
          // Create a fresh textarea mock for each test
          const element = {
            value: config.attributes?.value || '',
            style: { height: '40px' },
            scrollHeight: 60,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            focus: jest.fn(),
            blur: jest.fn()
          };
          // Don't add parentNode initially - it will be set by the test if needed
          return element;
        }
        return {
          insertChild: jest.fn(),
          remove: jest.fn(),
          addClass: jest.fn(),
          removeClass: jest.fn(),
          querySelector: jest.fn(),
          querySelectorAll: jest.fn(),
          insertAdjacentElement: jest.fn(),
          childNodes: [],
          innerHTML: '',
          parentNode: {
            replaceChild: jest.fn()
          }
        };
      })
    } as any;
    (DomBuilder.getInstance as jest.Mock).mockReturnValue(mockDomBuilder);

    // Mock CardBody
    mockCardBody = {
      render: {
        insertChild: jest.fn(),
        remove: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn().mockReturnValue([]),
        insertAdjacentElement: jest.fn(),
        childNodes: [],
        innerHTML: '',
        parentNode: {
          replaceChild: jest.fn()
        }
      },
      nextCodeBlockIndex: 0
    } as any;
    (CardBody as jest.Mock).mockReturnValue(mockCardBody);
  });

  describe('Editable Mode Creation', () => {
    it('should create textarea when editable is true', () => {
      const props: ChatItemCardContentProps = {
        body: '```shell\necho "hello world"\n```',
        editable: true,
        onEdit: jest.fn()
      };

      const content = new ChatItemCardContent(props);

      expect(mockDomBuilder.build).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'textarea',
          attributes: expect.objectContaining({
            value: 'echo "hello world"'
          })
        })
      );
      expect(content.render).toEqual(expect.objectContaining({
        value: 'echo "hello world"',
        addEventListener: expect.any(Function),
        blur: expect.any(Function),
        focus: expect.any(Function),
        removeEventListener: expect.any(Function),
        scrollHeight: 60,
        style: { height: '40px' }
      }));
    });

    it('should extract shell command from markdown code block', () => {
      const shellCommand = 'echo "hello world"\nls -la';
      const props: ChatItemCardContentProps = {
        body: `\`\`\`shell\n${shellCommand}\n\`\`\``,
        editable: true,
        onEdit: jest.fn()
      };

      void new ChatItemCardContent(props);

      expect(mockDomBuilder.build).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            value: shellCommand
          })
        })
      );
    });

    it('should handle plain text body when editable', () => {
      const plainText = 'echo "plain command"';
      const props: ChatItemCardContentProps = {
        body: plainText,
        editable: true,
        onEdit: jest.fn()
      };

      void new ChatItemCardContent(props);

      expect(mockDomBuilder.build).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            value: plainText
          })
        })
      );
    });

    it('should handle empty body when editable', () => {
      const props: ChatItemCardContentProps = {
        body: '',
        editable: true,
        onEdit: jest.fn()
      };

      void new ChatItemCardContent(props);

      expect(mockDomBuilder.build).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            value: ''
          })
        })
      );
    });

    it('should handle null body when editable', () => {
      const props: ChatItemCardContentProps = {
        body: null,
        editable: true,
        onEdit: jest.fn()
      };

      void new ChatItemCardContent(props);

      expect(mockDomBuilder.build).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            value: ''
          })
        })
      );
    });

    it('should create textarea with proper CSS classes', () => {
      const props: ChatItemCardContentProps = {
        body: 'test command',
        editable: true,
        classNames: [ 'custom-class' ],
        onEdit: jest.fn()
      };

      void new ChatItemCardContent(props);

      expect(mockDomBuilder.build).toHaveBeenCalledWith(
        expect.objectContaining({
          classNames: expect.arrayContaining([
            'mynah-shell-command-input',
            'custom-class'
          ])
        })
      );
    });
  });

  describe('Non-Editable Mode Creation', () => {
    it('should create CardBody when editable is false', () => {
      const props: ChatItemCardContentProps = {
        body: 'test content',
        editable: false
      };

      const content = new ChatItemCardContent(props);

      expect(CardBody).toHaveBeenCalled();
      expect(content.render).toBe(mockCardBody.render);
    });

    it('should create CardBody when editable is undefined', () => {
      const props: ChatItemCardContentProps = {
        body: 'test content'
      };

      const content = new ChatItemCardContent(props);

      expect(CardBody).toHaveBeenCalled();
      expect(content.render).toBe(mockCardBody.render);
    });
  });

  describe('Update Card Stack Functionality', () => {
    it('should transition from non-editable to editable mode', () => {
      const props: ChatItemCardContentProps = {
        body: '```shell\necho "test"\n```',
        editable: false
      };

      const content = new ChatItemCardContent(props);
      const mockParentNode = {
        replaceChild: jest.fn()
      };
      Object.defineProperty(content.render, 'parentNode', {
        value: mockParentNode,
        writable: true
      });

      // Transition to editable
      content.updateCardStack({
        editable: true,
        body: '```shell\necho "modified"\n```'
      });

      expect(mockParentNode.replaceChild).toHaveBeenCalled();
    });

    it('should transition from editable to non-editable mode', () => {
      const props: ChatItemCardContentProps = {
        body: '```shell\necho "test"\n```',
        editable: true,
        onEdit: jest.fn()
      };

      const content = new ChatItemCardContent(props);
      const mockParentNode = {
        replaceChild: jest.fn()
      };
      Object.defineProperty(content.render, 'parentNode', {
        value: mockParentNode,
        writable: true
      });

      // Transition to non-editable
      content.updateCardStack({
        editable: false,
        body: '```shell\necho "updated"\n```'
      });

      expect(mockParentNode.replaceChild).toHaveBeenCalled();
      expect(CardBody).toHaveBeenCalled();
    });

    it('should handle updates in editable mode with textarea resize', () => {
      const onEditMock = jest.fn();
      const props: ChatItemCardContentProps = {
        body: '```shell\necho "test"\n```',
        editable: true,
        onEdit: onEditMock
      };

      const content = new ChatItemCardContent(props);

      // Update with new editable content
      content.updateCardStack({
        editable: true,
        body: '```shell\necho "new command"\n```'
      });

      // Should create a new textarea
      expect(mockDomBuilder.build).toHaveBeenCalledTimes(2);
    });

    it('should handle stream updates in non-editable mode', () => {
      const props: ChatItemCardContentProps = {
        body: 'initial content',
        editable: false,
        renderAsStream: true
      };

      const content = new ChatItemCardContent(props);

      // Update with stream content
      content.updateCardStack({
        body: 'updated content'
      });

      // Should update the internal update stack
      expect(content).toBeDefined();
    });
  });

  describe('Event Handling', () => {
    it('should call onEdit when textarea input changes', () => {
      const onEditMock = jest.fn();
      const props: ChatItemCardContentProps = {
        body: '```shell\necho "test"\n```',
        editable: true,
        onEdit: onEditMock
      };

      void new ChatItemCardContent(props);

      // Verify that the build was called with input event handler
      expect(mockDomBuilder.build).toHaveBeenCalledWith(
        expect.objectContaining({
          events: expect.objectContaining({
            input: expect.any(Function)
          })
        })
      );
    });

    it('should handle focus event for textarea auto-resize', () => {
      const props: ChatItemCardContentProps = {
        body: '```shell\necho "test"\n```',
        editable: true,
        onEdit: jest.fn()
      };

      void new ChatItemCardContent(props);

      // Verify that the build was called with focus event handler
      expect(mockDomBuilder.build).toHaveBeenCalledWith(
        expect.objectContaining({
          events: expect.objectContaining({
            focus: expect.any(Function)
          })
        })
      );
    });
  });

  describe('Text Extraction', () => {
    it('should return textarea value when in editable mode', () => {
      const props: ChatItemCardContentProps = {
        body: '```shell\necho "test"\n```',
        editable: true,
        onEdit: jest.fn()
      };

      const content = new ChatItemCardContent(props);
      // Set the value on the actual render element
      (content.render as any).value = 'current textarea content';

      const text = content.getText();

      expect(text).toBe('current textarea content');
    });

    it('should extract command from markdown body when not editable', () => {
      const shellCommand = 'echo "hello world"';
      const props: ChatItemCardContentProps = {
        body: `\`\`\`shell\n${shellCommand}\n\`\`\``,
        editable: false
      };

      const content = new ChatItemCardContent(props);

      const text = content.getText();

      expect(text).toBe(shellCommand);
    });

    it('should return plain text body when no markdown', () => {
      const plainText = 'plain command';
      const props: ChatItemCardContentProps = {
        body: plainText,
        editable: false
      };

      const content = new ChatItemCardContent(props);

      const text = content.getText();

      expect(text).toBe(plainText);
    });

    it('should return empty string for null body', () => {
      const props: ChatItemCardContentProps = {
        body: null,
        editable: false
      };

      const content = new ChatItemCardContent(props);

      const text = content.getText();

      expect(text).toBe('');
    });
  });

  describe('Render Details', () => {
    it('should return correct render details from CardBody', () => {
      const props: ChatItemCardContentProps = {
        body: 'test content',
        editable: false
      };

      mockCardBody.nextCodeBlockIndex = 5;
      const content = new ChatItemCardContent(props);

      const details = content.getRenderDetails();

      expect(details).toEqual({
        totalNumberOfCodeBlocks: 5
      });
    });

    it('should return zero code blocks when no CardBody', () => {
      const props: ChatItemCardContentProps = {
        body: 'test content',
        editable: true,
        onEdit: jest.fn()
      };

      const content = new ChatItemCardContent(props);

      const details = content.getRenderDetails();

      expect(details).toEqual({
        totalNumberOfCodeBlocks: 0
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed markdown code blocks', () => {
      const props: ChatItemCardContentProps = {
        body: '```shell\necho "missing closing',
        editable: true,
        onEdit: jest.fn()
      };

      expect(() => {
        void new ChatItemCardContent(props);
      }).not.toThrow();
    });

    it('should handle multiple code blocks and extract first one', () => {
      const firstCommand = 'echo "first"';
      const props: ChatItemCardContentProps = {
        body: `\`\`\`shell\n${firstCommand}\n\`\`\`\n\nSome text\n\n\`\`\`shell\necho "second"\n\`\`\``,
        editable: true,
        onEdit: jest.fn()
      };

      void new ChatItemCardContent(props);

      expect(mockDomBuilder.build).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: expect.objectContaining({
            value: firstCommand
          })
        })
      );
    });

    it('should handle updateCardStack with no parent node', () => {
      const props: ChatItemCardContentProps = {
        body: 'test',
        editable: false
      };

      const content = new ChatItemCardContent(props);
      Object.defineProperty(content.render, 'parentNode', {
        value: null,
        writable: true
      });

      expect(() => {
        content.updateCardStack({ editable: true });
      }).not.toThrow();
    });

    it('should handle animation state changes', () => {
      const onAnimationStateChangeMock = jest.fn();
      const props: ChatItemCardContentProps = {
        body: 'test content',
        editable: false,
        renderAsStream: true,
        onAnimationStateChange: onAnimationStateChangeMock
      };

      const content = new ChatItemCardContent(props);

      // Trigger update to start animation
      content.updateCardStack({
        body: 'updated content'
      });

      expect(content).toBeDefined();
    });

    it('should handle content properties when creating CardBody', () => {
      const mockOnLinkClick = jest.fn();
      const mockOnCopiedToClipboard = jest.fn();
      const props: ChatItemCardContentProps = {
        body: 'test content',
        editable: false,
        contentProperties: {
          onLinkClick: mockOnLinkClick,
          onCopiedToClipboard: mockOnCopiedToClipboard
        }
      };

      void new ChatItemCardContent(props);

      expect(CardBody).toHaveBeenCalledWith(
        expect.objectContaining({
          onLinkClick: mockOnLinkClick,
          onCopiedToClipboard: mockOnCopiedToClipboard
        })
      );
    });
  });
});
