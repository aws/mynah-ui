import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { MAX_USER_INPUT } from '../chat-prompt-input';

export interface IPromptTextInputProps {
  tabId: string;
  onKeydown: (e: KeyboardEvent) => void;
  onInput?: (e: KeyboardEvent) => void;
}

export class PromptTextInput {
  private readonly _props: IPromptTextInputProps;
  private readonly _render: ExtendedHTMLElement;
  private readonly _promptTextInputSizer: ExtendedHTMLElement;
  private readonly _promptTextInput: ExtendedHTMLElement;
  constructor (props: IPromptTextInputProps) {
    this._props = props;

    const initialDisabledState = MynahUITabsStore.getInstance().getTabDataStore(this._props.tabId).getValue('promptInputDisabledState') as boolean;

    this._promptTextInputSizer = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-chat-prompt-input', 'mynah-chat-prompt-input-sizer' ],
    });

    this._promptTextInput = DomBuilder.getInstance().build({
      type: 'textarea',
      classNames: [ 'mynah-chat-prompt-input' ],
      attributes: {
        ...(initialDisabledState ? { disabled: 'disabled' } : {}),
        tabindex: '1',
        rows: '1',
        maxlength: MAX_USER_INPUT.toString(),
        type: 'text',
        placeholder: MynahUITabsStore.getInstance().getTabDataStore(this._props.tabId).getValue('promptInputPlaceholder'),
        value: '',
      },
      events: {
        keydown: this._props.onKeydown,
        input: (e: KeyboardEvent) => {
          // Set the appropriate prompt input height
          this.updatePromptTextInputSizer();
          // Additional handler
          if (this._props.onInput !== undefined) {
            this._props.onInput(e);
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

    this._render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-input-inner-wrapper', 'no-text' ],
      children: [
        this._promptTextInputSizer,
        this._promptTextInput,
      ]
    });
  }

  get render (): ExtendedHTMLElement {
    return this._render;
  }

  private readonly updatePromptTextInputSizer = (): void => {
    if (this._promptTextInput.value.trim() !== '') {
      this._render.removeClass('no-text');
    } else {
      this._render.addClass('no-text');
    }
    this._promptTextInputSizer.innerHTML = this._promptTextInput.value.replace(/\n/g, '</br>&nbsp;');
  };

  public readonly clear = (): void => {
    this._promptTextInputSizer.innerHTML = '';
    this.updateTextInputValue('');
    const defaultPlaceholder = MynahUITabsStore.getInstance().getTabDataStore(this._props.tabId).getValue('promptInputPlaceholder');
    this.updateTextInputPlaceholder(defaultPlaceholder);
    this._render.addClass('no-text');
  };

  public readonly focus = (): void => {
    this._promptTextInput.focus();
    this.updateTextInputValue('');
  };

  public readonly getTextInputValue = (): string => {
    return this._promptTextInput.value;
  };

  public readonly updateTextInputValue = (value: string): void => {
    this._promptTextInput.value = value;
  };

  public readonly updateTextInputMaxLength = (maxLength: number): void => {
    this._promptTextInput.update({
      attributes: {
        maxlength: maxLength.toString(),
      }
    });
  };

  public readonly updateTextInputPlaceholder = (text: string): void => {
    this._promptTextInput.update({
      attributes: {
        placeholder: text,
      }
    });
  };
}
