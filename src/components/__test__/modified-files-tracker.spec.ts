/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModifiedFilesTracker } from '../modified-files-tracker';

describe('ModifiedFilesTracker', () => {
  let tracker: ModifiedFilesTracker;
  let mockOnFileClick: jest.Mock;
  let mockOnAcceptFile: jest.Mock;
  let mockOnUndoFile: jest.Mock;

  beforeEach(() => {
    mockOnFileClick = jest.fn();
    mockOnAcceptFile = jest.fn();
    mockOnUndoFile = jest.fn();
    tracker = new ModifiedFilesTracker({
      tabId: 'test-tab',
      visible: true,
      onFileClick: mockOnFileClick,
      onAcceptFile: mockOnAcceptFile,
      onUndoFile: mockOnUndoFile
    });
    document.body.appendChild(tracker.render);
  });

  afterEach(() => {
    tracker.render.remove();
  });

  it('should initialize with empty state', () => {
    expect(tracker.getModifiedFiles()).toEqual([]);
    const titleElement = tracker.render.querySelector('.mynah-collapsible-content-label-title-text');
    expect(titleElement?.textContent).toBe('No files modified!');
  });

  it('should add modified files', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.addModifiedFile('src/another.ts');

    expect(tracker.getModifiedFiles()).toEqual([ 'src/test.ts', 'src/another.ts' ]);

    const titleElement = tracker.render.querySelector('.mynah-collapsible-content-label-title-text');
    expect(titleElement?.textContent).toBe('2 files modified so far. Work done!');
  });

  it('should remove modified files', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.addModifiedFile('src/another.ts');
    tracker.removeModifiedFile('src/test.ts');

    expect(tracker.getModifiedFiles()).toEqual([ 'src/another.ts' ]);

    const titleElement = tracker.render.querySelector('.mynah-collapsible-content-label-title-text');
    expect(titleElement?.textContent).toBe('1 file modified so far. Work done!');
  });

  it('should update work in progress status', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.setWorkInProgress(true);

    const titleElement = tracker.render.querySelector('.mynah-collapsible-content-label-title-text');
    expect(titleElement?.textContent).toBe('1 file modified so far. Work in progress...');

    tracker.setWorkInProgress(false);
    expect(titleElement?.textContent).toBe('1 file modified so far. Work done!');
  });

  it('should clear all modified files', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.addModifiedFile('src/another.ts');
    tracker.clearModifiedFiles();

    expect(tracker.getModifiedFiles()).toEqual([]);

    const titleElement = tracker.render.querySelector('.mynah-collapsible-content-label-title-text');
    expect(titleElement?.textContent).toBe('No files modified!');
  });

  it('should handle visibility toggle', () => {
    expect(tracker.render.classList.contains('hidden')).toBe(false);

    tracker.setVisible(false);
    expect(tracker.render.classList.contains('hidden')).toBe(true);

    tracker.setVisible(true);
    expect(tracker.render.classList.contains('hidden')).toBe(false);
  });

  it('should handle file clicks', () => {
    tracker.addModifiedFile('src/test.ts');

    // Directly test the callback mechanism by calling the internal method
    // This tests the functionality without relying on DOM rendering
    const fileItems = tracker.getFileListContent();
    expect(fileItems.length).toBe(1);

    // Simulate a click event on the file path
    const fileItem = fileItems[0];
    const filePath = fileItem.querySelector('.mynah-modified-files-item-path');
    const clickEvent = new Event('click');
    filePath?.dispatchEvent(clickEvent);

    expect(mockOnFileClick).toHaveBeenCalledWith('src/test.ts');
  });

  it('should handle accept and undo actions', () => {
    tracker.addModifiedFile('src/test.ts');

    const fileItems = tracker.getFileListContent();
    expect(fileItems.length).toBe(1);

    const fileItem = fileItems[0];
    const acceptButton = fileItem.querySelector('[data-testid="modified-files-tracker-file-item-accept"]');
    const undoButton = fileItem.querySelector('[data-testid="modified-files-tracker-file-item-undo"]');

    expect(acceptButton).toBeTruthy();
    expect(undoButton).toBeTruthy();

    // Test accept button click
    const acceptClickEvent = new Event('click');
    acceptButton?.dispatchEvent(acceptClickEvent);
    expect(mockOnAcceptFile).toHaveBeenCalledWith('src/test.ts');

    // Test undo button click
    const undoClickEvent = new Event('click');
    undoButton?.dispatchEvent(undoClickEvent);
    expect(mockOnUndoFile).toHaveBeenCalledWith('src/test.ts');
  });

  it('should display file icons', () => {
    tracker.addModifiedFile('src/test.ts');

    const fileItems = tracker.getFileListContent();
    const fileItem = fileItems[0];
    const fileIcon = fileItem.querySelector('.mynah-ui-icon-file');

    expect(fileIcon).toBeTruthy();
  });

  it('should prevent duplicate files', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.addModifiedFile('src/test.ts'); // Duplicate

    expect(tracker.getModifiedFiles()).toEqual([ 'src/test.ts' ]);
  });

  it('should handle singular vs plural file text', () => {
    tracker.addModifiedFile('src/test.ts');

    let titleElement = tracker.render.querySelector('.mynah-collapsible-content-label-title-text');
    expect(titleElement?.textContent).toBe('1 file modified so far. Work done!');

    tracker.addModifiedFile('src/another.ts');

    titleElement = tracker.render.querySelector('.mynah-collapsible-content-label-title-text');
    expect(titleElement?.textContent).toBe('2 files modified so far. Work done!');
  });
});
