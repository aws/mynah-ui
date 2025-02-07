import { Config } from '../../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUIGlobalEvents } from '../../../helper/events';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { MynahEventNames, QuickActionCommand } from '../../../static';
import { MAX_USER_INPUT } from '../chat-prompt-input';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../../overlay';
import { Card } from '../../card/card';
import { CardBody } from '../../card/card-body';
import testIds from '../../../helper/test-ids';

export interface PromptTextInputProps {
  tabId: string;
  initMaxLength: number;
  onKeydown: (e: KeyboardEvent) => void;
  onInput?: (e: KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export class PromptTextInput {
  render: ExtendedHTMLElement;
  promptTextInputMaxLength: number;
  private readonly props: PromptTextInputProps;
  private readonly promptTextInput: ExtendedHTMLElement;
  private promptInputOverlay: Overlay | null = null;
  private keydownSupport: boolean = true;
  constructor (props: PromptTextInputProps) {
    this.props = props;
    this.promptTextInputMaxLength = props.initMaxLength;

    const initialDisabledState = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputDisabledState') as boolean;

    this.promptTextInput = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.input,
      classNames: [ 'mynah-chat-prompt-input', 'empty' ],
      innerHTML: '',
      attributes: {
        contenteditable: 'true',
        ...(initialDisabledState ? { disabled: 'disabled' } : {}),
        tabindex: '0',
        rows: '1',
        maxlength: MAX_USER_INPUT().toString(),
        type: 'text',
        placeholder: MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder'),
        ...(Config.getInstance().config.autoFocus ? { autofocus: 'autofocus' } : {})
      },
      events: {
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
          if (this.props.onInput !== undefined) {
            this.props.onInput(e);
          }
          this.removeContextPlaceholderOverlay();
          this.checkIsEmpty();
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
        this.promptTextInput,
      ]
    });

    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('promptInputDisabledState', (isDisabled: boolean) => {
      if (isDisabled) {
        this.promptTextInput.setAttribute('disabled', 'disabled');
        this.promptTextInput.setAttribute('contenteditable', 'false');
        this.promptTextInput.blur();
      } else {
        // Enable the input field and focus on it
        this.promptTextInput.removeAttribute('disabled');
        this.promptTextInput.setAttribute('contenteditable', 'true');
        if (Config.getInstance().config.autoFocus && document.hasFocus()) {
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

  private readonly checkIsEmpty = (): void => {
    if (this.promptTextInput.textContent === '') {
      this.promptTextInput.addClass('empty');
      this.render.addClass('no-text');
    } else {
      this.promptTextInput.removeClass('empty');
      this.render.removeClass('no-text');
    }
  };

  private readonly removeContextPlaceholderOverlay = (): void => {
    this.promptInputOverlay?.close();
    this.promptInputOverlay?.render.remove();
    this.promptInputOverlay = null;
  };

  private readonly insertElementToGivenPosition = (
    element: HTMLElement | Text,
    position: number,
    endPosition?: number,
    maintainCursor: boolean = false
  ): void => {
    const selection = window.getSelection();
    if (selection == null) return;

    // Store original cursor position if we need to maintain it
    const originalRange = maintainCursor ? selection.getRangeAt(0).cloneRange() : null;

    const range = document.createRange();
    let currentPos = 0;

    // Find the correct text node and offset
    for (const node of this.promptTextInput.childNodes) {
      const length = node.textContent?.length ?? 0;

      if (currentPos + length >= position) {
        if (node.nodeType === Node.TEXT_NODE || node.nodeName === 'BR') {
          const offset = Math.min(position - currentPos, length);
          range.setStart(node, offset);

          if (endPosition != null) {
            let endNode = node;
            let endOffset = Math.min(endPosition - currentPos, length);

            if (endPosition > currentPos + length) {
              let endPos = currentPos + length;
              for (let i = Array.from(this.promptTextInput.childNodes).indexOf(node) + 1;
                i < this.promptTextInput.childNodes.length;
                i++) {
                const nextNode = this.promptTextInput.childNodes[i];
                const nextLength = nextNode.textContent?.length ?? 0;

                if (endPos + nextLength >= endPosition) {
                  endNode = nextNode;
                  endOffset = endPosition - endPos;
                  break;
                }
                endPos += nextLength;
              }
            }

            range.setEnd(endNode, endOffset);
            range.deleteContents();
          }

          range.insertNode(element);

          if (endPosition != null) {
            const spaceNode = document.createTextNode('\u00A0');
            range.setStartAfter(element);
            range.insertNode(spaceNode);
            range.setStartAfter(spaceNode);
            element = spaceNode;
          } else {
            range.setStartAfter(element);
          }
          break;
        }
      }
      currentPos += length;
    }

    if (!maintainCursor) {
      // Only modify cursor position if maintainCursor is false
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (originalRange != null) {
      // Restore original cursor position
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
  };

  public readonly insertContextItem = (contextItem: QuickActionCommand, position: number): void => {
    const contextSpanElement = DomBuilder.getInstance().build({
      type: 'span',
      children: [ `@${contextItem.command.replace(/^@?(.*)$/, '$1')}` ],
      classNames: [ 'context' ],
      attributes: {
        route: JSON.stringify(contextItem.route),
        contenteditable: 'false'
      }
    });
    this.insertElementToGivenPosition(contextSpanElement, position, this.getCursorPos());

    if (contextItem.placeholder != null) {
      this.promptInputOverlay = new Overlay({
        background: true,
        closeOnOutsideClick: true,
        referenceElement: contextSpanElement ?? this.render,
        dimOutside: false,
        removeOtherOverlays: true,
        verticalDirection: OverlayVerticalDirection.TO_TOP,
        horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
        children: [
          new Card({
            border: false,
            children: [
              new CardBody({
                body: contextItem.placeholder
              }).render
            ]
          }).render
        ],
      });
    }
  };

  public readonly getCursorPos = (): number => {
    let position = 0;
    const selection = window.getSelection();

    if ((selection != null) && selection.rangeCount !== 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(this.promptTextInput);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      position = preCaretRange.toString().length;
    }

    return position;
  };

  public readonly clear = (): void => {
    this.promptTextInput.innerHTML = '';
    const defaultPlaceholder = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder');
    this.updateTextInputPlaceholder(defaultPlaceholder);
    this.removeContextPlaceholderOverlay();
    this.checkIsEmpty();
  };

  public readonly focus = (): void => {
    if (Config.getInstance().config.autoFocus) {
      this.promptTextInput.focus();
    }
  };

  public readonly blur = (): void => {
    this.promptTextInput.blur();
    this.checkIsEmpty();
  };

  public readonly getTextInputValue = (): string => {
    return (this.promptTextInput.innerText ?? '').trim();
  };

  public readonly updateTextInputValue = (value: string): void => {
    this.promptTextInput.innerText = value;
    this.checkIsEmpty();
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

  public readonly deleteTextRange = (position: number, endPosition: number): void => {
    const selection = window.getSelection();
    if (selection == null) return;

    const range = document.createRange();
    let currentPos = 0;
    let startNode = null;
    let startOffset = 0;
    let endNode = null;
    let endOffset = 0;

    // Find start and end positions
    for (const node of this.promptTextInput.childNodes) {
      const length = node.textContent?.length ?? 0;

      // Find start position
      if ((startNode == null) && currentPos + length >= position) {
        startNode = node;
        startOffset = position - currentPos;
      }

      // Find end position
      if (currentPos + length >= endPosition) {
        endNode = node;
        endOffset = endPosition - currentPos;
        break;
      }

      currentPos += length;
    }

    // If we found both positions, delete the range
    if ((startNode != null) && (endNode != null)) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      range.deleteContents();
    }

    this.checkIsEmpty();
  };

  public readonly getCursorLine = (): {cursorLine: number; totalLines: number} => {
    const lineHeight = parseFloat(window.getComputedStyle(this.promptTextInput, null).getPropertyValue('line-height'));
    const totalLines = Math.floor(this.promptTextInput.scrollHeight / lineHeight);
    let cursorLine = -1;
    const cursorElm = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'cursor' ]
    });
    this.insertElementToGivenPosition(cursorElm, this.getCursorPos(), undefined, true);
    if (cursorElm != null) {
      // find the cursor line position depending on line height
      cursorLine = Math.floor(((cursorElm as HTMLSpanElement).offsetTop + ((cursorElm as HTMLSpanElement).offsetHeight)) / lineHeight);
    }
    return {
      cursorLine,
      totalLines
    };
  };

  public readonly getUsedContext = (): string[][] => {
    return Array.from(this.promptTextInput.querySelectorAll('span.context')).map((context) => {
      return JSON.parse(context.getAttribute('route') ?? '[]');
    });
  };
}
