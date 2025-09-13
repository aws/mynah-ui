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
    const titleElement = tracker.render.querySelector('.mynah-modified-files-title-text');
    expect(titleElement?.textContent).toBe('No files modified!');
  });

  it('should add modified files', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.addModifiedFile('src/another.ts');

    expect(tracker.getModifiedFiles()).toEqual([ 'src/test.ts', 'src/another.ts' ]);

    const titleElement = tracker.render.querySelector('.mynah-modified-files-title-text');
    expect(titleElement?.textContent).toBe('Done!');
  });

  it('should remove modified files', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.addModifiedFile('src/another.ts');
    tracker.removeModifiedFile('src/test.ts');

    expect(tracker.getModifiedFiles()).toEqual([ 'src/another.ts' ]);

    const titleElement = tracker.render.querySelector('.mynah-modified-files-title-text');
    expect(titleElement?.textContent).toBe('Done!');
  });

  it('should update work in progress status', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.setWorkInProgress(true);

    const titleElement = tracker.render.querySelector('.mynah-modified-files-title-text');
    expect(titleElement?.textContent).toBe('Working...');

    tracker.setWorkInProgress(false);
    expect(titleElement?.textContent).toBe('Done!');
  });

  it('should clear all modified files', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.addModifiedFile('src/another.ts');
    tracker.clearModifiedFiles();

    expect(tracker.getModifiedFiles()).toEqual([]);

    const titleElement = tracker.render.querySelector('.mynah-modified-files-title-text');
    expect(titleElement?.textContent).toBe('No files modified!');
  });

  it('should handle visibility toggle', () => {
    expect(tracker.render.classList.contains('hidden')).toBe(false);

    tracker.setVisible(false);
    expect(tracker.render.classList.contains('hidden')).toBe(true);

    tracker.setVisible(true);
    expect(tracker.render.classList.contains('hidden')).toBe(false);
  });

  it('should prevent duplicate files', () => {
    tracker.addModifiedFile('src/test.ts');
    tracker.addModifiedFile('src/test.ts'); // Duplicate

    expect(tracker.getModifiedFiles()).toEqual([ 'src/test.ts' ]);
  });

  it('should show Done status when files are modified', () => {
    tracker.addModifiedFile('src/test.ts');

    let titleElement = tracker.render.querySelector('.mynah-modified-files-title-text');
    expect(titleElement?.textContent).toBe('Done!');

    tracker.addModifiedFile('src/another.ts');

    titleElement = tracker.render.querySelector('.mynah-modified-files-title-text');
    expect(titleElement?.textContent).toBe('Done!');
  });
});
