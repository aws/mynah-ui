/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileNodeAction, TreeNodeDetails } from '../static';
import { Config } from './config';

export type TreeNode = FolderNode | FileNode;

export interface FileNode {
  name: string;
  type: 'file';
  filePath: string;
  originalFilePath: string;
  deleted: boolean;
  actions?: FileNodeAction[];
  details?: TreeNodeDetails;
}

export interface FolderNode {
  name: string;
  type: 'folder';
  details?: TreeNodeDetails;
  deleted: boolean;
  children: Array<FolderNode | FileNode>;
}

/*
 * Converts a list of file Paths into a tree
 *
 * @param modifiedFilePaths List of modified file paths.
 * @param deletedFilePaths List of deleted file paths.
 * @param actions Optional actions to associate with file nodes.
 * @param details Optional details to associate with file nodes.
 * @param rootTitle Title for the root folder node.
 * @returns TreeNode representing the root of the tree.
 *
 * Example Input:
 *  modifiedFilePaths: [
 *   "project/src/hello.js",
 * ]
 *  deletedFilePaths: [
 *   "project/src/goodbye.js",
 *  ]
 *
 * Example output:
 * {
 *  name: 'Changes',
 *  type: 'folder',
 *  children: [{
 *      name: 'project',
 *      type: 'folder',
 *      children: [{
 *          name: 'src',
 *          type: 'folder',
 *          children: [
 *              { name: 'hello.js', type: 'file', filePath: 'project/src/hello.js', deleted: false },
 *              { name: 'goodbye.js', type: 'file', filePath: 'project/src/goodbye.js', deleted: true },
 *          ]
 *      }]
 *  }]
 * }
 */
export const fileListToTree = (
  modifiedFilePaths: string[],
  deletedFilePaths: string[] = [],
  actions?: Record<string, FileNodeAction[]>,
  details?: Record<string, TreeNodeDetails>,
  rootTitle: string = Config.getInstance().config.texts.changes
): TreeNode => {
  const createFolderNode = (name: string): FolderNode => ({
    name,
    type: 'folder',
    deleted: false,
    children: []
  });

  const addFileNode = (
    currentNode: FolderNode,
    fileOrFolder: string,
    filePath: string[],
    originalFilePath: string,
    deleted: boolean
  ): void => {
    currentNode.children.push({
      type: 'file',
      name: fileOrFolder,
      filePath: filePath.join('/'),
      deleted,
      originalFilePath,
      actions: actions?.[originalFilePath],
      details: details?.[originalFilePath],
    });
  };

  const findOrCreateFolderNode = (
    currentNode: FolderNode,
    fileOrFolder: string
  ): FolderNode => {
    let folderNode: FolderNode | undefined = currentNode.children.find(
      (child) => child.name === fileOrFolder && child.type === 'folder'
    ) as FolderNode;

    if (folderNode === undefined) {
      folderNode = createFolderNode(fileOrFolder);
      currentNode.children.push(folderNode);
    }

    return folderNode;
  };

  const markFoldersAsDeletedIfApplicable = (node: FolderNode): boolean => {
    if (node.children.length === 0) return node.deleted;

    let allChildrenDeleted = true;

    node.children.forEach((child) => {
      if (child.type === 'folder') {
        const childFolderDeleted = markFoldersAsDeletedIfApplicable(child);
        if (!childFolderDeleted) allChildrenDeleted = false;
      } else if (!child.deleted) {
        allChildrenDeleted = false;
      }
    });

    node.deleted = allChildrenDeleted;
    return node.deleted;
  };

  const deduplicatedModifiedFiles = Array.from(new Set(modifiedFilePaths));
  const deduplicatedDeletedFiles = Array.from(new Set(deletedFilePaths));

  const tree = [ ...splitFilePaths(deduplicatedModifiedFiles, false), ...splitFilePaths(deduplicatedDeletedFiles, true) ]
    .reduce<TreeNode>((acc, { originalFilePath, filePath, deleted }) => {
    let currentNode = acc as FolderNode;

    filePath.forEach((fileOrFolder, index) => {
      const isLastItem = index === filePath.length - 1;

      if (isLastItem) {
        if (originalFilePath.endsWith('/')) {
          findOrCreateFolderNode(currentNode, fileOrFolder);
        } else {
          addFileNode(currentNode, fileOrFolder, filePath, originalFilePath, deleted);
        }
      } else {
        currentNode = findOrCreateFolderNode(currentNode, fileOrFolder);
      }
    });

    return acc;
  }, createFolderNode(rootTitle));

  markFoldersAsDeletedIfApplicable(tree as FolderNode);

  return tree;
};

/**
 * Helper function to split file paths into parts and mark them as deleted if applicable.
 *
 * @param paths Array of file paths.
 * @param deleted Boolean flag indicating if the file is deleted.
 * @returns Array of split file paths with metadata.
 */
const splitFilePaths = (
  paths: string[],
  deleted: boolean
): Array<{ originalFilePath: string; filePath: string[]; deleted: boolean }> =>
  paths.map((filePath) => {
    const cleanFilePath = filePath.startsWith('./') ? filePath.slice(2) : filePath;
    return {
      originalFilePath: filePath,
      filePath: cleanFilePath.split('/').filter((part) => part !== undefined && part !== ''),
      deleted,
    };
  });
