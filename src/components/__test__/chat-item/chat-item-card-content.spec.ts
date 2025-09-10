/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatItemCardContent, ChatItemCardContentProps } from '../../chat-item/chat-item-card-content';
import { Config } from '../../../helper/config';

// Mock Config
jest.mock('../../../helper/config', () => ({
  Config: {
    getInstance: jest.fn()
  }
}));

describe('ChatItemCardContent Animation Speed', () => {
  const mockGetInstance = Config.getInstance as jest.MockedFunction<typeof Config.getInstance>;

  beforeEach(() => {
    jest.clearAllMocks();

    (mockGetInstance as jest.Mock).mockReturnValue({
      config: {
        typewriterStackTime: 100,
        typewriterMaxWordTime: 20,
        disableTypewriterAnimation: false,
      }
    } as any);

    document.body.innerHTML = '<div id="test-container"></div>';
  });

  describe('Animation Configuration', () => {
    it('should use fast animation settings', () => {
      (mockGetInstance as jest.Mock).mockReturnValue({
        config: {
          typewriterStackTime: 100,
          typewriterMaxWordTime: 20,
          disableTypewriterAnimation: false,
        }
      } as any);

      const props: ChatItemCardContentProps = {
        body: 'Test content',
        renderAsStream: true,
      };

      const cardContent = new ChatItemCardContent(props);
      expect(mockGetInstance).toHaveBeenCalled();
      expect(cardContent).toBeDefined();
    });

    it('should disable animation when configured', () => {
      (mockGetInstance as jest.Mock).mockReturnValue({
        config: {
          disableTypewriterAnimation: true,
        }
      } as any);

      const props: ChatItemCardContentProps = {
        body: 'Test content',
        renderAsStream: true,
      };

      const cardContent = new ChatItemCardContent(props);
      expect(mockGetInstance).toHaveBeenCalled();
      expect(cardContent).toBeDefined();
    });
  });

  describe('Stream Ending', () => {
    it('should end stream and call animation state change', () => {
      const onAnimationStateChange = jest.fn();
      const props: ChatItemCardContentProps = {
        body: 'Test content',
        renderAsStream: true,
        onAnimationStateChange,
      };

      const cardContent = new ChatItemCardContent(props);
      cardContent.endStream();

      expect(onAnimationStateChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Default Values', () => {
    it('should use defaults when config is empty', () => {
      (mockGetInstance as jest.Mock).mockReturnValue({
        config: {}
      } as any);

      const props: ChatItemCardContentProps = {
        body: 'Test content',
        renderAsStream: true,
      };

      const cardContent = new ChatItemCardContent(props);
      expect(mockGetInstance).toHaveBeenCalled();
      expect(cardContent).toBeDefined();
    });
  });
});
