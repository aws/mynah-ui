import { MynahUIGlobalEvents } from '../../../helper/events';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { MynahEventNames } from '../../../static';
import { ChatPromptInput, MAX_USER_INPUT, INPUT_LENGTH_WARNING_THRESHOLD } from '../../chat-item/chat-prompt-input';

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

    // Remaining character indicator should be undefined as the overlay should only be defined when the threshold is hit
    expect(testChatInput.render.querySelector('.mynah-chat-prompt-chars-indicator')?.textContent).toBeUndefined();
    // Send icon
    expect(testChatInput.render.querySelector('i .mynah-ui-icon .mynah-ui-icon-envelope-send')).toBeDefined();
    // Text area
    const promptInput = testChatInput.render.querySelector('.mynah-chat-prompt-input');
    expect(promptInput?.getAttribute('placeholder')).toBe('test prompt placeholder');
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
    const promptInput = testChatInput.render.querySelector('.mynah-chat-prompt-input');
    expect(promptInput?.getAttribute('placeholder')).toBe('test prompt placeholder');
    expect(promptInput?.getAttribute('disabled')).toBe(null);
    MynahUITabsStore.getInstance().updateTab(testTabId, {
      isSelected: true,
      store: {
        promptInputDisabledState: true,
      }
    });
    expect(promptInput?.getAttribute('placeholder')).toBe('test prompt placeholder');
    expect(promptInput?.getAttribute('disabled')).toBe('disabled');
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
    const promptInput = document.body.querySelector('.mynah-chat-prompt-input') as HTMLDivElement;

    // Input character should change the remaining character count
    promptInput.textContent = 'z'.repeat(INPUT_LENGTH_WARNING_THRESHOLD());
    promptInput?.dispatchEvent(new KeyboardEvent('input', { key: 'z' }));

    expect(document.body.querySelector('.mynah-chat-prompt-chars-indicator')?.textContent).toBe(`${INPUT_LENGTH_WARNING_THRESHOLD()}/${MAX_USER_INPUT()}`);

    // Code snippet should change the remaining character count
    const textToAdd = "console.log('hello')";
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.ADD_ATTACHMENT, {
      tabId: testTabId,
      textToAdd
    });

    // expect(document.body.querySelector('.mynah-chat-prompt-chars-indicator')?.textContent).toBe(`${
    //   promptInput.innerText.length + textToAdd.length}/${MAX_USER_INPUT()}`);
  });
});
