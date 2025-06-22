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
});
