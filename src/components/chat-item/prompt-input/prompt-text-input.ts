import { Config } from '../../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUIGlobalEvents } from '../../../helper/events';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { MynahEventNames } from '../../../static';
import { MAX_USER_INPUT } from '../chat-prompt-input';

export interface PromptTextInputProps {
  tabId: string;
  initMaxLength: number;
  contextReplacement?: boolean;
  onKeydown: (e: KeyboardEvent) => void;
  onInput?: (e: KeyboardEvent) => void;
}

export class PromptTextInput {
  render: ExtendedHTMLElement;
  promptTextInputMaxLength: number;
  private readonly props: PromptTextInputProps;
  private readonly promptTextInputSizer: ExtendedHTMLElement;
  private readonly promptTextInput: ExtendedHTMLElement;
  private keydownSupport: boolean = true;
  constructor (props: PromptTextInputProps) {
    this.props = props;
    this.promptTextInputMaxLength = props.initMaxLength;

    const initialDisabledState = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputDisabledState') as boolean;

    this.promptTextInputSizer = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-chat-prompt-input', 'mynah-chat-prompt-input-sizer' ],
    });

    this.promptTextInput = DomBuilder.getInstance().build({
      type: 'textarea',
      classNames: [ 'mynah-chat-prompt-input' ],
      attributes: {
        ...(initialDisabledState ? { disabled: 'disabled' } : {}),
        tabindex: '1',
        rows: '1',
        maxlength: MAX_USER_INPUT().toString(),
        type: 'text',
        placeholder: MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder'),
        value: '',
        ...(Config.getInstance().config.autoFocus ? { autofocus: 'autofocus' } : {})
      },
      events: {
        scroll: () => {
          this.promptTextInputSizer.scrollTop = this.promptTextInput.scrollTop;
        },
        keypress: (e: KeyboardEvent) => {
          if (!this.keydownSupport) {
            this.props.onKeydown(e);
          }
        },
        keydown: (e: KeyboardEvent) => {
          if (e.key !== '') {
            this.keydownSupport = true;
            this.props.onKeydown(e);
          } else {
            this.keydownSupport = false;
          }
        },
        input: (e: KeyboardEvent) => {
          // Set the appropriate prompt input height
          this.updatePromptTextInputSizer();
          // Additional handler
          if (this.props.onInput !== undefined) {
            this.props.onInput(e);
          }
        },
        focus: () => {
          this.render.addClass('input-has-focus');
        },
        blur: () => {
          this.render.removeClass('input-has-focus');
        }
      },
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-input-inner-wrapper', 'no-text' ],
      children: [
        this.promptTextInputSizer,
        this.promptTextInput,
      ]
    });

    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('promptInputDisabledState', (isDisabled: boolean) => {
      if (isDisabled) {
        this.promptTextInput.setAttribute('disabled', 'disabled');
      } else {
        // Enable the input field and focus on it
        this.promptTextInput.removeAttribute('disabled');
        if (Config.getInstance().config.autoFocus) {
          this.promptTextInput.focus();
        }
      }
    });

    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('promptInputPlaceholder', (placeholderText: string) => {
      if (placeholderText !== undefined) {
        this.promptTextInput.update({
          attributes: {
            placeholder: placeholderText
          }
        });
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.TAB_FOCUS, (data) => {
      if (data.tabId === this.props.tabId) {
        this.promptTextInput.focus();
      }
    });
  }

  private readonly updatePromptTextInputSizer = (placeHolder?: {
    index?: number;
    text?: string;
  }): void => {
    if (this.promptTextInput.value.trim() !== '') {
      this.render.removeClass('no-text');
    } else {
      this.render.addClass('no-text');
    }
    let initProcessedValue = this.promptTextInput.value;
    if (placeHolder?.text != null) {
      initProcessedValue = `${initProcessedValue.substring(0, placeHolder.index ?? initProcessedValue.length)} <span class="placeholder">${placeHolder.text}</span> ${initProcessedValue.substring((placeHolder.index ?? initProcessedValue.length) + 1)}`;
    }
    let newVal = initProcessedValue.replace(/\n/g, ' <br>');
    if (this.props.contextReplacement === true) {
      newVal = `${newVal.replace(/@\S*/gi, (match) => `<span class="context">${match}</span>`)}&nbsp`;
    }
    this.promptTextInputSizer.innerHTML = newVal; ;
  };

  public readonly setContextReplacement = (contextReplacement: boolean): void => {
    this.props.contextReplacement = contextReplacement;
  };

  public readonly getCursorPos = (): number => {
    return this.promptTextInput.selectionStart ?? this.promptTextInput.value.length;
  };

  public readonly getWordAndIndexOnCursorPos = (): { wordStartIndex: number; word: string } => {
    const currentValue = this.promptTextInput.value;
    const cursorPos = this.getCursorPos();
    let prevSpaceIndex = -1;
    let nextSpaceIndex = currentValue.indexOf(' ', cursorPos);

    // We're not splitting the text value by spaces to get the words and check all of them
    // Reason behind that is performance concerns.
    // We know that we're looking for a word, and we only need the word for the given index if it is inside a word

    // Find previous space chararacter
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (currentValue[i] === ' ') {
        prevSpaceIndex = i;
        break;
      }
    }

    // Find next space character
    if (nextSpaceIndex === -1) {
      nextSpaceIndex = currentValue.length;
    }

    return {
      wordStartIndex: prevSpaceIndex + 1,
      word: currentValue.substring(prevSpaceIndex + 1, nextSpaceIndex)
    };
  };

  public readonly clear = (): void => {
    this.promptTextInputSizer.innerHTML = '';
    this.updateTextInputValue('');
    const defaultPlaceholder = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder');
    this.updateTextInputPlaceholder(defaultPlaceholder);
    this.render.addClass('no-text');
  };

  public readonly focus = (cursorIndex?: number): void => {
    if (Config.getInstance().config.autoFocus) {
      this.promptTextInput.focus();
    }
    if (cursorIndex != null) {
      this.promptTextInput.setSelectionRange(cursorIndex, cursorIndex);
    } else {
      this.updateTextInputValue('');
    }
  };

  public readonly getTextInputValue = (): string => {
    return this.promptTextInput.value;
  };

  public readonly updateTextInputValue = (value: string, placeHolder?: {
    index?: number;
    text?: string;
  }): void => {
    this.promptTextInput.value = value;
    this.updatePromptTextInputSizer(placeHolder);
  };

  public readonly updateTextInputMaxLength = (maxLength: number): void => {
    this.promptTextInputMaxLength = maxLength;
    this.promptTextInput.update({
      attributes: {
        maxlength: maxLength.toString(),
      }
    });
  };

  public readonly updateTextInputPlaceholder = (text: string): void => {
    this.promptTextInput.update({
      attributes: {
        placeholder: text,
      }
    });
  };
}
