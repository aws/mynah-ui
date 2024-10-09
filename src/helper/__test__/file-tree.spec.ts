import { TreeNode, fileListToTree } from '../file-tree';

describe('file tree', () => {
  it('fileListToTree', () => {
    const modifiedFilePaths = [
      '.github/workflow.yml',
      './package.json',
      './tsconfig.json',
      'src/game.ts',
      'tests/game.test.ts',
      'tests/no-extension',
      'tests/.eslintignore',
      'deleted/file-added.js'
    ];

    const deletedFilePaths = [
      '.github/removed-workflow.yml',
      'deleted/folder/',
      'deleted/file-removed.ts',
      'deleted/folder/file-removed.ts'
    ];

    const correctTreeNode: TreeNode = {
      name: 'Changes',
      type: 'folder',
      deleted: false,
      children: [
        {
          name: '.github',
          type: 'folder',
          deleted: false,
          children: [
            {
              name: 'workflow.yml',
              type: 'file',
              filePath: '.github/workflow.yml',
              originalFilePath: '.github/workflow.yml',
              deleted: false,
              actions: undefined,
              details: undefined
            },
            {
              name: 'removed-workflow.yml',
              type: 'file',
              filePath: '.github/removed-workflow.yml',
              originalFilePath: '.github/removed-workflow.yml',
              deleted: true,
              actions: undefined,
              details: undefined
            }
          ]
        },
        {
          name: 'package.json',
          type: 'file',
          filePath: 'package.json', // Removed the leading ./
          originalFilePath: './package.json',
          deleted: false,
          actions: undefined,
          details: undefined
        },
        {
          name: 'tsconfig.json',
          type: 'file',
          filePath: 'tsconfig.json', // Removed the leading ./
          originalFilePath: './tsconfig.json',
          deleted: false,
          actions: undefined,
          details: undefined
        },
        {
          name: 'src',
          type: 'folder',
          deleted: false,
          children: [
            {
              name: 'game.ts',
              type: 'file',
              filePath: 'src/game.ts',
              originalFilePath: 'src/game.ts',
              deleted: false,
              actions: undefined,
              details: undefined
            }
          ]
        },
        {
          name: 'tests',
          type: 'folder',
          deleted: false,
          children: [
            {
              name: 'game.test.ts',
              type: 'file',
              filePath: 'tests/game.test.ts',
              originalFilePath: 'tests/game.test.ts',
              deleted: false,
              actions: undefined,
              details: undefined
            },
            {
              name: 'no-extension',
              type: 'file',
              filePath: 'tests/no-extension',
              originalFilePath: 'tests/no-extension',
              deleted: false,
              actions: undefined,
              details: undefined
            },
            {
              name: '.eslintignore',
              type: 'file',
              filePath: 'tests/.eslintignore',
              originalFilePath: 'tests/.eslintignore',
              deleted: false,
              actions: undefined,
              details: undefined
            }
          ]
        },
        {
          name: 'deleted',
          type: 'folder',
          deleted: false,
          children: [
            {
              name: 'file-added.js',
              type: 'file',
              filePath: 'deleted/file-added.js',
              originalFilePath: 'deleted/file-added.js',
              deleted: false,
              actions: undefined,
              details: undefined
            },
            {
              name: 'folder',
              type: 'folder',
              deleted: true,
              children: [
                {
                  name: 'file-removed.ts',
                  type: 'file',
                  filePath: 'deleted/folder/file-removed.ts',
                  originalFilePath: 'deleted/folder/file-removed.ts',
                  deleted: true,
                  actions: undefined,
                  details: undefined
                }
              ]
            },
            {
              name: 'file-removed.ts',
              type: 'file',
              filePath: 'deleted/file-removed.ts',
              originalFilePath: 'deleted/file-removed.ts',
              deleted: true,
              actions: undefined,
              details: undefined
            }
          ]
        }
      ]
    };

    expect(fileListToTree(modifiedFilePaths, deletedFilePaths)).toEqual(correctTreeNode);
  });
});
