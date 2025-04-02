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
import { generateUID } from '../../../main';
import { Icon } from '../../icon';

const PREVIEW_DELAY = 500;

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
  private lastCursorIndex: number = 0;
  private readonly props: PromptTextInputProps;
  private readonly promptTextInput: ExtendedHTMLElement;
  private promptInputOverlay: Overlay | null = null;
  private keydownSupport: boolean = true;
  private readonly selectedContext: Record<string, QuickActionCommand> = {};
  private contextTooltip: Overlay | null;
  private contextTooltipTimeout: ReturnType<typeof setTimeout>;

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
          this.hideContextTooltip();
        },
        keyup: (e: KeyboardEvent) => {
          this.lastCursorIndex = this.updateCursorPos();
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
          this.lastCursorIndex = this.updateCursorPos();
        },
        blur: () => {
          if (typeof this.props.onBlur !== 'undefined') {
            this.props.onBlur();
          }
        },
        paste: (e: ClipboardEvent): void => {
          // Prevent the default paste behavior
          e.preventDefault();

          // Get plain text from clipboard
          const text = e.clipboardData?.getData('text/plain');
          if (text != null) {
            // Insert text at cursor position
            const selection = window.getSelection();
            if ((selection?.rangeCount) != null) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(text));

              // Move cursor to end of inserted text
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            }

            // Check if input is empty and trigger input event
            this.checkIsEmpty();
            if (this.props.onInput != null) {
              this.props.onInput(new KeyboardEvent('input'));
            }
          }
        },
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

  private readonly updateCursorPos = (): number => {
    const selection = window.getSelection();
    if ((selection == null) || (selection.rangeCount === 0)) return 0;

    const range = selection.getRangeAt(0);
    const container = this.promptTextInput;

    // If the selection is not within our container, return 0
    if (!container.contains(range.commonAncestorContainer)) return 0;

    // Get the range from start of container to cursor position
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(container);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
  };

  private readonly checkIsEmpty = (): void => {
    if (this.promptTextInput.textContent === '' && this.promptTextInput.querySelectorAll('span.context').length === 0) {
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

  private readonly moveCursorToEnd = (): void => {
    const range = document.createRange();
    range.selectNodeContents(this.promptTextInput);
    range.collapse(false);
    const selection = window.getSelection();
    if (selection != null) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  private readonly showContextTooltip = (e: MouseEvent, contextItem: QuickActionCommand): void => {
    clearTimeout(this.contextTooltipTimeout);
    this.contextTooltipTimeout = setTimeout(() => {
      const elm: HTMLElement = e.target as HTMLElement;
      this.contextTooltip = new Overlay({
        testId: testIds.prompt.contextTooltip,
        background: true,
        closeOnOutsideClick: false,
        referenceElement: elm,
        dimOutside: false,
        removeOtherOverlays: true,
        verticalDirection: OverlayVerticalDirection.TO_TOP,
        horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
        children: [
          DomBuilder.getInstance().build({
            type: 'div',
            testId: testIds.prompt.contextTooltip,
            classNames: [ 'mynah-chat-prompt-context-tooltip' ],
            children: [
              ...(contextItem.icon !== undefined
                ? [
                    new Icon({
                      icon: contextItem.icon
                    }).render
                  ]
                : []),
              {
                type: 'div',
                classNames: [ 'mynah-chat-prompt-context-tooltip-container' ],
                children: [
                  {
                    type: 'div',
                    classNames: [ 'mynah-chat-prompt-context-tooltip-name' ],
                    children: [ contextItem.command ]
                  },
                  ...(contextItem.description !== undefined
                    ? [ {
                        type: 'div',
                        classNames: [ 'mynah-chat-prompt-context-tooltip-description' ],
                        children: [ contextItem.description ]
                      } ]
                    : [])
                ]
              }
            ]
          })
        ],
      });
    }, PREVIEW_DELAY);
  };

  private readonly hideContextTooltip = (): void => {
    if (this.contextTooltipTimeout !== null) {
      clearTimeout(this.contextTooltipTimeout);
    }
    if (this.contextTooltip != null) {
      this.contextTooltip.close();
      this.contextTooltip = null;
    }
  };

  public readonly insertContextItem = (contextItem: QuickActionCommand, position: number): void => {
    const temporaryId = generateUID();
    this.selectedContext[temporaryId] = contextItem;
    const contextSpanElement = DomBuilder.getInstance().build({
      type: 'span',
      children: [
        ...(contextItem.icon != null ? [ new Icon({ icon: contextItem.icon }).render ] : [ ]),
        { type: 'span', classNames: [ 'at-char' ], innerHTML: '@' },
        `${contextItem.command.replace(/^@?(.*)$/, '$1')}`
      ],
      classNames: [ 'context' ],
      attributes: {
        'context-tmp-id': temporaryId,
        contenteditable: 'false'
      },
      events: {
        mouseenter: (e) => {
          this.showContextTooltip(e, contextItem);
        },
        mouseleave: this.hideContextTooltip,
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

    this.checkIsEmpty();
  };

  public readonly getCursorPos = (): number => this.lastCursorIndex;

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
    this.moveCursorToEnd();
  };

  public readonly blur = (): void => {
    this.promptTextInput.blur();
    this.checkIsEmpty();
  };

  public readonly getTextInputValue = (withInputLineBreaks?: boolean): string => {
    if (withInputLineBreaks === true) {
      return (this.promptTextInput.innerText ?? '').trim();
    }
    return (this.promptTextInput.textContent ?? '').trim();
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

  /**
   * Returns the cursorLine, totalLines and if the cursor is at the beginning or end of the whole text
   * @returns {cursorLine: number, totalLines: number, isAtTheBeginning: boolean, isAtTheEnd: boolean}
   */
  public readonly getCursorPosition = (): { cursorLine: number; totalLines: number; isAtTheBeginning: boolean; isAtTheEnd: boolean } => {
    const lineHeight = parseFloat(window.getComputedStyle(this.promptTextInput, null).getPropertyValue('line-height'));
    let isAtTheBeginning = false;
    let isAtTheEnd = false;
    let cursorLine = -1;
    const cursorElm = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'cursor' ]
    }) as HTMLSpanElement;
    this.insertElementToGivenPosition(cursorElm, this.getCursorPos(), undefined, true);
    cursorLine = Math.floor((cursorElm.offsetTop + (cursorElm.offsetHeight)) / lineHeight) ?? 0;
    if (cursorLine <= 1 && (cursorElm?.offsetLeft ?? 0) === 0) {
      isAtTheBeginning = true;
    }

    const eolElm = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'eol' ]
    }) as HTMLSpanElement;
    this.promptTextInput.insertChild('beforeend', eolElm);
    const totalLines = Math.floor((eolElm.offsetTop + (eolElm.offsetHeight)) / lineHeight) ?? 0;
    if (cursorElm.offsetLeft === eolElm.offsetLeft && cursorElm.offsetTop === eolElm.offsetTop) {
      isAtTheEnd = true;
    }

    cursorElm.remove();
    eolElm.remove();

    return {
      cursorLine,
      totalLines,
      isAtTheBeginning,
      isAtTheEnd,
    };
  };

  public readonly getUsedContext = (): QuickActionCommand[] => {
    return Array.from(this.promptTextInput.querySelectorAll('span.context')).map((context) => {
      return this.selectedContext[context.getAttribute('context-tmp-id') ?? ''] ?? {};
    });
  };
}
