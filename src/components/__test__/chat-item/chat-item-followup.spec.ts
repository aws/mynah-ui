import { ChatItem, ChatItemType } from '../../../static';
import { ChatItemFollowUpContainer } from '../../chat-item/chat-item-followup';

describe('chat-item-followup', () => {
  it('followup items', () => {
    const mockChatItem: ChatItem = {
      type: ChatItemType.ANSWER,
      messageId: 'testMessageId',
      followUp: {
        text: 'Test follow up title',
        options: [
          { pillText: 'Test follow up question 1', prompt: 'Test follow up question 1' },
          { pillText: 'Test follow up question 2', prompt: 'Test follow up question 2' },
          { pillText: 'Test follow up question 3', prompt: 'Test follow up question 3' },
        ],
      },
    };

    const testFollowupContainer = new ChatItemFollowUpContainer({
      tabId: 'tab-1',
      chatItem: mockChatItem,
    });
    expect(testFollowupContainer.render.children[0].textContent).toBe('Test follow up title');
    expect(testFollowupContainer.render.children[0].classList.contains('mynah-chat-item-followup-question-text')).toBeTruthy();
    expect(testFollowupContainer.render.children[1].children[0].textContent?.trim()).toBe('Test follow up question 1');
    expect(testFollowupContainer.render.children[1].children[0].classList.contains('mynah-chat-item-followup-question-option')).toBeTruthy();
    expect(testFollowupContainer.render.children[1].children[1].textContent?.trim()).toBe('Test follow up question 2');
    expect(testFollowupContainer.render.children[1].children[1].classList.contains('mynah-chat-item-followup-question-option')).toBeTruthy();
    expect(testFollowupContainer.render.children[1].children[2].textContent?.trim()).toBe('Test follow up question 3');
    expect(testFollowupContainer.render.children[1].children[2].classList.contains('mynah-chat-item-followup-question-option')).toBeTruthy();
  });
});
