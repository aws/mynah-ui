import { Config } from '../../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { MAX_USER_INPUT } from '../chat-prompt-input';

export interface PromptTextInputProps {
  tabId: string;
  initMaxLength: number;
  onKeydown: (e: KeyboardEvent) => void;
  onInput?: (e: KeyboardEvent) => void;
}

export class PromptTextInput {
  render: ExtendedHTMLElement;
  promptTextInputMaxLength: number;
  private readonly props: PromptTextInputProps;
  private readonly promptTextInputSizer: ExtendedHTMLElement;
  private readonly promptTextInput: ExtendedHTMLElement;
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
        maxlength: MAX_USER_INPUT.toString(),
        type: 'text',
        placeholder: MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder'),
        value: '',
      },
      events: {
        keydown: this.props.onKeydown,
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
  }

  private readonly updatePromptTextInputSizer = (): void => {
    if (this.promptTextInput.value.trim() !== '') {
      this.render.removeClass('no-text');
    } else {
      this.render.addClass('no-text');
    }
    this.promptTextInputSizer.innerHTML = this.promptTextInput.value.replace(/\n/g, '</br>&nbsp;');
  };

  public readonly clear = (): void => {
    this.promptTextInputSizer.innerHTML = '';
    this.updateTextInputValue('');
    const defaultPlaceholder = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder');
    this.updateTextInputPlaceholder(defaultPlaceholder);
    this.render.addClass('no-text');
  };

  public readonly focus = (): void => {
    if (Config.getInstance().config.autoFocus) {
      this.promptTextInput.focus();
    }
    this.updateTextInputValue('');
  };

  public readonly getTextInputValue = (): string => {
    return this.promptTextInput.value;
  };

  public readonly updateTextInputValue = (value: string): void => {
    this.promptTextInput.value = value;
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
