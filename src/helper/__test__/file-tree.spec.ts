import { TreeNode, fileListToTree } from '../file-tree';

describe('file tree', () => {
  it('fileListToTree', () => {
    const mockFilePaths = [ 'project/src/hello.js', 'project/src/goodbye.js' ];
    const correctTreeNode: TreeNode = {
      name: 'Changes',
      type: 'folder',
      children: [
        {
          name: 'project',
          type: 'folder',
          children: [
            {
              name: 'src',
              type: 'folder',
              children: [
                { name: 'hello.js', type: 'file', filePath: 'project/src/hello.js' },
                { name: 'goodbye.js', type: 'file', filePath: 'project/src/goodbye.js' }
              ]
            }
          ]
        }
      ]
    };

    expect(fileListToTree(mockFilePaths)).toEqual(correctTreeNode);
  });
});
