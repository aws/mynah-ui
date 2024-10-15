import escapeHTML from 'escape-html';
import { Config } from '../../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUIGlobalEvents } from '../../../helper/events';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { MynahEventNames } from '../../../static';
import { MAX_USER_INPUT } from '../chat-prompt-input';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../overlay';
import { Card } from '../../card/card';
import { CardBody } from '../../card/card-body';
import testIds from '../../../helper/test-ids';

export interface PromptTextInputProps {
  tabId: string;
  initMaxLength: number;
  contextReplacement?: boolean;
  contextItems?: string[];
  onKeydown: (e: KeyboardEvent) => void;
  onInput?: (e: KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export class PromptTextInput {
  render: ExtendedHTMLElement;
  promptTextInputMaxLength: number;
  private readonly props: PromptTextInputProps;
  private readonly promptTextInputSizer: ExtendedHTMLElement;
  private readonly promptTextInput: ExtendedHTMLElement;
  private promptInputOverlay: Overlay | null = null;
  private keydownSupport: boolean = true;
  constructor (props: PromptTextInputProps) {
    this.props = props;
    this.promptTextInputMaxLength = props.initMaxLength;

    const initialDisabledState = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputDisabledState') as boolean;

    this.promptTextInputSizer = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-chat-prompt-input', 'mynah-chat-prompt-input-sizer' ],
    });

    // To realign context items if resize happens on block
    if (ResizeObserver != null) {
      new ResizeObserver(() => {
        this.promptTextInputSizer.scrollTop = this.promptTextInput.scrollTop;
      }).observe(this.promptTextInputSizer);
    }

    this.promptTextInput = DomBuilder.getInstance().build({
      type: 'textarea',
      testId: testIds.prompt.input,
      classNames: [ 'mynah-chat-prompt-input' ],
      attributes: {
        ...(initialDisabledState ? { disabled: 'disabled' } : {}),
        tabindex: '0',
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
          if (typeof this.props.onFocus !== 'undefined') {
            this.props.onFocus();
          }
        },
        blur: () => {
          if (typeof this.props.onBlur !== 'undefined') {
            this.props.onBlur();
          }
        }
      },
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.inputWrapper,
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

    this.clear();
  }

  private readonly updatePromptTextInputSizer = (placeHolder?: {
    index?: number;
    text?: string;
  }): void => {
    if (this.promptInputOverlay !== null) {
      this.promptInputOverlay.close();
      this.promptInputOverlay = null;
    }
    if (this.promptTextInput.value.trim() !== '') {
      this.render.removeClass('no-text');
    } else {
      this.render.addClass('no-text');
    }
    let visualisationValue = escapeHTML(this.promptTextInput.value);
    if (this.props.contextReplacement === true) {
      visualisationValue = `${visualisationValue.replace(/@\S*/gi, (match) => {
        if ((this.props.contextItems == null) || !this.props.contextItems.includes(match)) {
          return match;
        }
        return `<span class="context">${match}</span>`;
      })}&nbsp`;
    }
    // HTML br element, which gives a new line, will not work without a content if it is placed at the end of the parent node
    // If it doesn't take effect, first new line step won't work with shift+enter
    // We're adding a space to make the br take effect.
    this.promptTextInputSizer.innerHTML = `${visualisationValue}&nbsp<br/>`;

    if (placeHolder?.text != null) {
      const targetContextItem = this.getContextElementAtTextIndex(placeHolder.index ?? 0);
      this.promptInputOverlay = new Overlay({
        background: true,
        closeOnOutsideClick: true,
        referenceElement: targetContextItem ?? this.render,
        dimOutside: false,
        removeOtherOverlays: true,
        verticalDirection: OverlayVerticalDirection.TO_TOP,
        horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
        children: [
          new Card({
            border: false,
            children: [
              new CardBody({
                body: placeHolder.text
              }).render
            ]
          }).render
        ],
      });
    }
  };

  public readonly setContextReplacement = (contextReplacement: boolean): void => {
    this.props.contextReplacement = contextReplacement;
  };

  public readonly getCursorPos = (): number => {
    return this.promptTextInput.selectionStart ?? this.promptTextInput.value.length;
  };

  public readonly getWordAndIndexOnCursorPos = (): { wordStartIndex: number; word: string } => {
    const currentValue = this.promptTextInput.value;
    // We're not splitting the text value by spaces to get the words
    // Reason behind that is the new line character can also be a word separator and additionally performance concerns.
    // We know that we're looking for a word, and we only need the word for the given index if it is inside a word
    const cursorPos = this.getCursorPos();
    let prevWordEndIndex = -1;
    const nextNewLineIndex = currentValue.indexOf('\n', cursorPos);
    const nextSpaceIndex = currentValue.indexOf(' ', cursorPos);

    // Either the first space or new line which separates the word
    const nextNewWordIndex = Math.min(nextSpaceIndex !== -1 ? nextSpaceIndex : currentValue.length, nextNewLineIndex !== -1 ? nextNewLineIndex : currentValue.length);

    // Find previous word separator chararacter
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (currentValue[i] === ' ' || currentValue[i] === '\n') {
        prevWordEndIndex = i;
        break;
      }
    }

    return {
      wordStartIndex: prevWordEndIndex + 1,
      word: currentValue.substring(prevWordEndIndex + 1, nextNewWordIndex)
    };
  };

  public readonly getContextElementAtTextIndex = (textIndex: number): HTMLSpanElement | null => {
    let startIndex = 0;
    let contextElement: HTMLSpanElement | null = null;
    for (const node of this.promptTextInputSizer.childNodes) {
      const currentEndIndex = startIndex + (node.textContent?.length ?? 0);
      if (textIndex > startIndex && textIndex <= currentEndIndex && node.nodeName === 'SPAN') {
        contextElement = node as HTMLSpanElement;
        break;
      }
      startIndex = currentEndIndex;
    };
    return contextElement;
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

  public readonly updateContextItems = (contextItems: string[]): void => {
    this.props.contextItems = contextItems;
  };
}
