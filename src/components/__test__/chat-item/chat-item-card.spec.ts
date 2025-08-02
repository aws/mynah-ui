import { ChatItemCard } from '../../chat-item/chat-item-card';
import { ChatItemType } from '../../../static';

// Mock the tabs store
jest.mock('../../../helper/tabs-store', () => ({
  MynahUITabsStore: {
    getInstance: jest.fn(() => ({
      getTabDataStore: jest.fn(() => ({
        subscribe: jest.fn(),
        getValue: jest.fn(() => ({}))
      }))
    }))
  }
}));

describe('ChatItemCard', () => {
  it('should render basic chat item card', () => {
    const card = new ChatItemCard({
      tabId: 'test-tab',
      chatItem: {
        type: ChatItemType.ANSWER,
        body: 'Test content'
      }
    });

    expect(card.render).toBeDefined();
  });

  describe('Pills functionality', () => {
    it('should render pills when renderAsPills is true', () => {
      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem: {
          type: ChatItemType.ANSWER,
          header: {
            icon: 'progress',
            body: 'Reading',
            fileList: {
              filePaths: [ 'file1.ts', 'file2.ts' ],
              renderAsPills: true
            }
          }
        }
      });

      const pillElements = card.render.querySelectorAll('.mynah-chat-item-tree-file-pill');
      expect(pillElements.length).toBe(2);
    });

    it('should include icon in customRenderer when pills are enabled', () => {
      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem: {
          type: ChatItemType.ANSWER,
          header: {
            icon: 'eye',
            body: 'Files read',
            fileList: {
              filePaths: [ 'test.json' ],
              renderAsPills: true
            }
          }
        }
      });

      const iconElement = card.render.querySelector('.mynah-ui-icon-eye');
      expect(iconElement).toBeTruthy();
    });

    it('should render pills with correct file names', () => {
      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem: {
          type: ChatItemType.ANSWER,
          header: {
            body: 'Processing',
            fileList: {
              filePaths: [ 'package.json', 'tsconfig.json' ],
              details: {
                'package.json': {
                  visibleName: 'package'
                },
                'tsconfig.json': {
                  visibleName: 'tsconfig'
                }
              },
              renderAsPills: true
            }
          }
        }
      });

      const pillElements = card.render.querySelectorAll('.mynah-chat-item-tree-file-pill');
      expect(pillElements[0].textContent).toBe('package');
      expect(pillElements[1].textContent).toBe('tsconfig');
    });

    it('should apply deleted styling to deleted files', () => {
      const card = new ChatItemCard({
        tabId: 'test-tab',
        chatItem: {
          type: ChatItemType.ANSWER,
          header: {
            body: 'Changes',
            fileList: {
              filePaths: [ 'deleted.ts', 'normal.ts' ],
              deletedFiles: [ 'deleted.ts' ],
              renderAsPills: true
            }
          }
        }
      });

      const deletedPill = card.render.querySelector('.mynah-chat-item-tree-file-pill-deleted');
      expect(deletedPill).toBeTruthy();
      expect(deletedPill?.textContent).toBe('deleted.ts');
    });
  });

  it('should not render pills when renderAsPills is false', () => {
    const card = new ChatItemCard({
      tabId: 'test-tab',
      chatItem: {
        type: ChatItemType.ANSWER,
        header: {
          body: 'Files',
          fileList: {
            filePaths: [ 'file1.ts' ],
            renderAsPills: false
          }
        }
      }
    });

    const pillElements = card.render.querySelectorAll('.mynah-chat-item-tree-file-pill');
    expect(pillElements.length).toBe(0);
  });

  it('should fall back to file path when visibleName is not provided', () => {
    const card = new ChatItemCard({
      tabId: 'test-tab',
      chatItem: {
        type: ChatItemType.ANSWER,
        header: {
          body: 'Files',
          fileList: {
            filePaths: [ 'src/components/test.ts' ],
            renderAsPills: true
          }
        }
      }
    });

    const pillElement = card.render.querySelector('.mynah-chat-item-tree-file-pill');
    expect(pillElement?.textContent).toBe('src/components/test.ts');
  });

  it('should handle empty filePaths array', () => {
    const card = new ChatItemCard({
      tabId: 'test-tab',
      chatItem: {
        type: ChatItemType.ANSWER,
        header: {
          body: 'No files',
          fileList: {
            filePaths: [],
            renderAsPills: true
          }
        }
      }
    });

    const pillElements = card.render.querySelectorAll('.mynah-chat-item-tree-file-pill');
    expect(pillElements.length).toBe(0);
  });
});
