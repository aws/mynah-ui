import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahUITabsStore } from '../../helper/tabs-store';
import { MynahEventNames } from '../../static';
import { ChatPromptInput } from '../chat-item/chat-prompt-input';

describe('chat-prompt-input', () => {
  it('render', () => {
    // Add a tab
    const testTabId = MynahUITabsStore.getInstance().addTab({
      isSelected: true,
      store: {
        promptInputPlaceholder: 'test prompt placeholder',
      }
    }) as string;

    const testChatInput = new ChatPromptInput({
      tabId: testTabId,
    });

    // Remaining character indicator
    expect(testChatInput.render.querySelector('.mynah-chat-prompt-chars-indicator')?.textContent).toBe('4000/4000');
    // Send icon
    expect(testChatInput.render.querySelector('i .mynah-ui-icon .mynah-ui-icon-envelope-send')).toBeDefined();
    // Text area
    const textareaElement = testChatInput.render.querySelector('textarea');
    expect(textareaElement?.placeholder).toBe('test prompt placeholder');
  });

  it('enable and disable textarea', () => {
    // Add a tab
    const testTabId = MynahUITabsStore.getInstance().addTab({
      isSelected: true,
      store: {
        promptInputPlaceholder: 'test prompt placeholder',
        promptInputDisabledState: false,
      }
    }) as string;

    const testChatInput = new ChatPromptInput({
      tabId: testTabId,
    });

    // Text area
    const textareaElement = testChatInput.render.querySelector('textarea');
    expect(textareaElement?.placeholder).toBe('test prompt placeholder');
    expect(textareaElement?.disabled).toBeFalsy();
    MynahUITabsStore.getInstance().updateTab(testTabId, {
      isSelected: true,
      store: {
        promptInputDisabledState: true,
      }
    });
    expect(textareaElement?.placeholder).toBe('test prompt placeholder');
    expect(textareaElement?.disabled).toBe(true);
  });

  it('textarea input', () => {
    // Add a tab
    const testTabId = MynahUITabsStore.getInstance().addTab({
      isSelected: true,
      store: {
        promptInputPlaceholder: 'test prompt placeholder',
        promptInputDisabledState: false,
      }
    }) as string;

    const testChatInput = new ChatPromptInput({
      tabId: testTabId,
    });

    document.body.appendChild(testChatInput.render);

    // Text area
    const textareaElement = document.body.querySelector('textarea') as HTMLTextAreaElement;

    // Input character should change the remaining character count
    textareaElement.value = 'z';
    textareaElement?.dispatchEvent(new KeyboardEvent('input', { key: 'z' }));

    expect(testChatInput.render.querySelector('.mynah-chat-prompt-chars-indicator')?.textContent).toBe('3999/4000');

    // Code snippet should change the remaining character count
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.ADD_CODE_SNIPPET, {
      tabId: testTabId,
      textToAdd: "console.log('hello')",
    });
    expect(testChatInput.render.querySelector('.mynah-chat-prompt-chars-indicator')?.textContent).toBe('3979/4000');
  });
});
