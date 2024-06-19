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
  children: Array<FolderNode | FileNode>;
}

/*
 * Converts a list of file Paths into a tree
 *
 * @input: The list of path in string format
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
  rootTitle?: string): TreeNode => {
  return [ ...splitFilePaths(modifiedFilePaths, false), ...splitFilePaths(deletedFilePaths, true) ].reduce<TreeNode>(
    (acc, { originalFilePath, filePath, deleted }) => {
      // pointer to keep track of the current tree node
      let currentNode = acc;
      for (let i = 0; i < filePath.length; i++) {
        const fileOrFolder = filePath[i];
        // we can assume the leaf of each branch is a file. the LLM doesn't generate
        // empty folder changes
        if (i === filePath.length - 1) {
          const filePathJoined = filePath.join('/');
          // the parent of a file is always a folder
          (currentNode as FolderNode).children.push({
            type: 'file',
            name: fileOrFolder,
            filePath: filePathJoined,
            deleted,
            originalFilePath,
            actions: actions !== undefined ? actions[originalFilePath] : undefined,
            details: details !== undefined ? details[originalFilePath] : undefined,
          });
          break;
        } else {
          const oldItem = (currentNode as FolderNode).children.find(({ name }) => name === fileOrFolder);
          if (oldItem != null) {
            currentNode = oldItem;
          } else {
            // if the current fileOrFolder is not in the list, add it as a folder and move the pointer
            const newItem: FolderNode = { name: fileOrFolder, type: 'folder', children: [] };
            (currentNode as FolderNode).children.push(newItem);
            currentNode = newItem;
          }
        }
      }
      return acc;
    },
    // Start off with a root folder called Changes
    { name: rootTitle ?? Config.getInstance().config.texts.changes, type: 'folder', children: [] }
  );
};

const splitFilePaths = (paths: string[], deleted: boolean): Array<{ originalFilePath: string; filePath: string[]; deleted: boolean }> =>
  paths
    // split file path by folder. ignore dot folders
    .map(filePath => ({ originalFilePath: filePath, filePath: filePath.split('/').filter(item => item !== undefined && item !== '.'), deleted }));
