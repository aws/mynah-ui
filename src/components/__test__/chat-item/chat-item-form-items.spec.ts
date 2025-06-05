import { ChatItem, ChatItemType } from '../../../static';
import { ChatItemFormItemsWrapper } from '../../chat-item/chat-item-form-items';
import { MynahIcons } from '../../icon';

describe('chat-item-form-items', () => {
  // Helper function to create a mock chat item with form items
  const createMockChatItem = (formItems: any[]): Partial<ChatItem> => ({
    type: ChatItemType.ANSWER,
    messageId: 'testMessageId',
    formItems
  });

  it('should render mandatory form item with title correctly', () => {
    const mockChatItem = createMockChatItem([
      {
        id: 'test-item',
        type: 'textinput',
        title: 'Test Title',
        mandatory: true
      }
    ]);

    const formItemsWrapper = new ChatItemFormItemsWrapper({
      tabId: 'tab-1',
      chatItem: mockChatItem
    });

    // Find the mandatory title element using data-testid attribute
    const titleElement = formItemsWrapper.render.querySelector('.mynah-ui-form-item-mandatory-title');
    expect(titleElement).not.toBeNull();

    // Check that it contains the asterisk icon
    const asteriskIcon = titleElement?.querySelector('i.mynah-ui-icon');
    expect(asteriskIcon).not.toBeNull();
    expect(asteriskIcon?.classList.contains(`mynah-ui-icon-${MynahIcons.ASTERISK}`)).toBeTruthy();

    // Check that the title text is present
    expect(titleElement?.textContent?.includes('Test Title')).toBeTruthy();
  });

  it('should hide mandatory icon when hideMandatoryIcon is true', () => {
    const mockChatItem = createMockChatItem([
      {
        id: 'test-item',
        type: 'textinput',
        title: 'Test Title',
        mandatory: true,
        hideMandatoryIcon: true
      }
    ]);

    const formItemsWrapper = new ChatItemFormItemsWrapper({
      tabId: 'tab-1',
      chatItem: mockChatItem
    });

    // There should be no mandatory title element with asterisk since hideMandatoryIcon is true
    const titleElement = formItemsWrapper.render.querySelector('.mynah-ui-form-item-mandatory-title');
    expect(titleElement).toBeNull();
  });

  it('should show mandatory icon when hideMandatoryIcon is false', () => {
    const mockChatItem = createMockChatItem([
      {
        id: 'test-item',
        type: 'textinput',
        title: 'Test Title',
        mandatory: true,
        hideMandatoryIcon: false
      }
    ]);

    const formItemsWrapper = new ChatItemFormItemsWrapper({
      tabId: 'tab-1',
      chatItem: mockChatItem
    });

    // The mandatory title element should be present with asterisk
    const titleElement = formItemsWrapper.render.querySelector('.mynah-ui-form-item-mandatory-title');
    expect(titleElement).not.toBeNull();

    // Check that it contains the asterisk icon
    const asteriskIcon = titleElement?.querySelector('i.mynah-ui-icon');
    expect(asteriskIcon).not.toBeNull();
  });

  it('should set default value for mandatory select items', () => {
    const mockChatItem = createMockChatItem([
      {
        id: 'model-select',
        type: 'select',
        mandatory: true,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' }
        ]
      }
    ]);

    const formItemsWrapper = new ChatItemFormItemsWrapper({
      tabId: 'tab-1',
      chatItem: mockChatItem
    });

    // The form item should have its value set to the first option
    const formData = formItemsWrapper.getAllValues();
    expect(formData['model-select']).toBe('option1');
  });
});
