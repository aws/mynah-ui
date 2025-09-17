/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModifiedFilesTracker } from '../modified-files-tracker';

// Mock dependencies
jest.mock('../../helper/style-loader', () => ({
  StyleLoader: {
    getInstance: () => ({
      load: jest.fn()
    })
  }
}));

jest.mock('../../helper/dom', () => ({
  DomBuilder: {
    getInstance: () => ({
      build: jest.fn().mockReturnValue({
        querySelector: jest.fn(),
        removeClass: jest.fn(),
        addClass: jest.fn(),
        remove: jest.fn()
      })
    })
  }
}));

jest.mock('../collapsible-content', () => ({
  CollapsibleContent: jest.fn().mockImplementation(() => ({
    render: {
      querySelector: jest.fn().mockReturnValue({
        appendChild: jest.fn()
      })
    },
    updateTitle: jest.fn()
  }))
}));

jest.mock('../chat-item/chat-item-card', () => ({
  ChatItemCard: jest.fn().mockImplementation(() => ({
    render: {
      remove: jest.fn()
    }
  }))
}));

describe('ModifiedFilesTracker', () => {
  let tracker: ModifiedFilesTracker;
  const mockProps = {
    tabId: 'test-tab'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tracker = new ModifiedFilesTracker(mockProps);
  });

  describe('addFile', () => {
    it('should add a file to tracked files', () => {
      tracker.addFile('test.js', 'modified', '/full/path/test.js', 'tool-123');
      
      const trackedFiles = tracker.getTrackedFiles();
      expect(trackedFiles).toHaveLength(1);
      expect(trackedFiles[0]).toEqual({
        path: 'test.js',
        type: 'modified',
        fullPath: '/full/path/test.js',
        toolUseId: 'tool-123'
      });
    });

    it('should replace existing file with same path', () => {
      tracker.addFile('test.js', 'modified');
      tracker.addFile('test.js', 'created', '/new/path/test.js');
      
      const trackedFiles = tracker.getTrackedFiles();
      expect(trackedFiles).toHaveLength(1);
      expect(trackedFiles[0].type).toBe('created');
      expect(trackedFiles[0].fullPath).toBe('/new/path/test.js');
    });
  });

  describe('removeFile', () => {
    it('should remove a file from tracked files', () => {
      tracker.addFile('test.js', 'modified');
      tracker.removeFile('test.js');
      
      expect(tracker.getTrackedFiles()).toHaveLength(0);
    });
  });

  describe('getModifiedFiles', () => {
    it('should return only non-deleted files', () => {
      tracker.addFile('modified.js', 'modified');
      tracker.addFile('created.js', 'created');
      tracker.addFile('deleted.js', 'deleted');
      
      const modifiedFiles = tracker.getModifiedFiles();
      expect(modifiedFiles).toEqual(['modified.js', 'created.js']);
    });
  });

  describe('clearFiles', () => {
    it('should clear all tracked files', () => {
      tracker.addFile('test1.js', 'modified');
      tracker.addFile('test2.js', 'created');
      
      tracker.clearFiles();
      
      expect(tracker.getTrackedFiles()).toHaveLength(0);
    });
  });

  describe('buildFileList', () => {
    it('should build correct file list structure', () => {
      tracker.addFile('src/test.js', 'modified', '/full/src/test.js');
      tracker.addFile('deleted.js', 'deleted');
      
      const fileList = tracker['buildFileList']();
      
      expect(fileList.filePaths).toEqual(['src/test.js']);
      expect(fileList.deletedFiles).toEqual(['deleted.js']);
      expect(fileList.details['src/test.js']).toEqual({
        visibleName: 'test.js',
        clickable: true,
        fullPath: '/full/src/test.js'
      });
    });
  });

  describe('visibility', () => {
    it('should show/hide component', () => {
      const mockRender = tracker.render;
      
      tracker.setVisible(false);
      expect(mockRender.addClass).toHaveBeenCalledWith('hidden');
      
      tracker.setVisible(true);
      expect(mockRender.removeClass).toHaveBeenCalledWith('hidden');
    });
  });

  describe('DOM rendering', () => {
    it('should create ChatItemCard when files are added', () => {
      const { ChatItemCard } = jest.requireMock('../chat-item/chat-item-card');
      
      tracker.addFile('test.js', 'modified');
      
      expect(ChatItemCard).toHaveBeenCalledWith({
        tabId: 'test-tab',
        inline: true,
        small: true,
        initVisibility: true,
        chatItem: {
          type: 'answer',
          messageId: 'modified-files-tracker',
          header: {
            fileList: {
              filePaths: ['test.js'],
              deletedFiles: [],
              details: {
                'test.js': {
                  visibleName: 'test.js',
                  clickable: true
                }
              },
              renderAsPills: true
            }
          }
        }
      });
    });

    it('should append ChatItemCard to DOM', () => {
      const mockAppendChild = jest.fn();
      const mockQuerySelector = jest.fn().mockReturnValue({ appendChild: mockAppendChild });
      tracker['collapsibleContent'].render.querySelector = mockQuerySelector;
      
      tracker.addFile('test.js', 'modified');
      
      expect(mockQuerySelector).toHaveBeenCalledWith('.mynah-collapsible-content-wrapper');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should show empty state when no files', () => {
      const mockAppendChild = jest.fn();
      const mockQuerySelector = jest.fn().mockReturnValue({ appendChild: mockAppendChild });
      tracker['collapsibleContent'].render.querySelector = mockQuerySelector;
      
      // Clear any existing files and trigger update
      tracker.clearFiles();
      
      expect(mockAppendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          className: expect.stringContaining('mynah-modified-files-empty-state')
        })
      );
    });

    it('should remove old ChatItemCard when updating', () => {
      const mockRemove = jest.fn();
      
      // Add first file
      tracker.addFile('test1.js', 'modified');
      const firstCard = tracker['chatItemCard'];
      if (firstCard) {
        firstCard.render.remove = mockRemove;
      }
      
      // Add second file - should remove first card
      tracker.addFile('test2.js', 'modified');
      
      expect(mockRemove).toHaveBeenCalled();
    });
  });
});