/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { KeyMap, MynahEventNames, QuickActionCommand, QuickActionCommandGroup, Suggestion } from '../../static';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';
import { MynahUITabsStore } from '../../helper/tabs-store';
import escapeHTML from 'escape-html';
import { ChatPromptInputCommand } from './chat-prompt-input-command';
import { CodeSnippet } from './prompt-input/code-snippet';

export interface ChatPromptInputProps {
  tabId: string;
}
export class ChatPromptInput {
  render: ExtendedHTMLElement;
  private readonly props: ChatPromptInputProps;
  private readonly attachmentWrapper: ExtendedHTMLElement;
  private readonly promptTextInputWrapper: ExtendedHTMLElement;
  private readonly promptTextInput: ExtendedHTMLElement;
  private readonly promptTextInputSizer: ExtendedHTMLElement;
  private readonly promptTextInputCommand: ChatPromptInputCommand;
  private readonly sendButton: ExtendedHTMLElement;
  private readonly codeSnippet: CodeSnippet;
  private quickActionCommands: QuickActionCommandGroup[];
  private commandSelector: Overlay;
  private commandSelectorOpen: boolean = false;
  private selectedCommand: string = '';
  private inputDisabled: boolean;
  private attachment?: Suggestion;
  private filteredCommandsList: QuickActionCommandGroup[];
  constructor (props: ChatPromptInputProps) {
    this.props = props;
    this.inputDisabled = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputDisabledState') as boolean;
    this.quickActionCommands = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[];
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('promptInputDisabledState', (isDisabled: boolean) => {
      this.inputDisabled = isDisabled;
      if (isDisabled) {
        this.promptTextInput.setAttribute('disabled', 'disabled');
        this.sendButton.setAttribute('disabled', 'disabled');
      } else {
        this.promptTextInput.removeAttribute('disabled');
        this.sendButton.removeAttribute('disabled');
        this.promptTextInput.focus();
      }
    });
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('promptInputPlaceholder', (placeholderText: string) => {
      this.promptTextInput.setAttribute('placeholder', placeholderText);
    });
    this.promptTextInputCommand = new ChatPromptInputCommand({
      command: '',
      onRemoveClick: () => {
        this.selectedCommand = '';
        this.promptTextInputCommand.setCommand('');
        this.promptTextInput.update({
          attributes: {
            placeholder: MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder')
          }
        });
      }
    });
    this.promptTextInputSizer = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-chat-prompt-input', 'mynah-chat-prompt-input-sizer' ],
    });
    this.promptTextInput = DomBuilder.getInstance().build({
      type: 'textarea',
      classNames: [ 'mynah-chat-prompt-input' ],
      attributes: {
        ...(this.inputDisabled ? { disabled: 'disabled' } : {}),
        tabindex: '1',
        rows: '1',
        maxlength: '100000',
        type: 'text',
        placeholder: MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder'),
        value: '',
      },
      events: {
        keydown: this.handleInputKeydown,
        input: this.calculateTextAreaHeight,
        focus: () => {
          this.render.addClass('input-has-focus');
        },
        blur: () => {
          this.render.removeClass('input-has-focus');
        }
      },
    });
    this.promptTextInputWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-input-inner-wrapper', 'no-text' ],
      children: [
        this.promptTextInputSizer,
        this.promptTextInput,
      ]
    });
    this.sendButton = new Button({
      classNames: [ 'mynah-icon-button', 'mynah-chat-prompt-button' ],
      attributes: {
        ...(this.inputDisabled ? { disabled: 'disabled' } : {}),
        tabindex: '5'
      },
      icon: new Icon({ icon: MynahIcons.ENVELOPE_SEND }).render,
      onClick: () => {
        this.sendPrompt();
      },
    }).render;

    this.codeSnippet = new CodeSnippet({ tabId: this.props.tabId });

    this.attachmentWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-attachment-wrapper' ],
      children: [
        this.codeSnippet.render
      ]
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-wrapper' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-chat-prompt-input-wrapper' ],
          children: [
            this.promptTextInputCommand.render,
            this.promptTextInputWrapper,
            this.sendButton,
          ]
        },
        this.attachmentWrapper
      ],
    });

    setTimeout(() => {
      this.promptTextInput.focus();
    }, 500);
  }

  private readonly handleInputKeydown = (e: KeyboardEvent): void => {
    if (!this.commandSelectorOpen) {
      this.quickActionCommands = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[];
      if (e.key === KeyMap.BACKSPACE && this.selectedCommand !== '' && this.promptTextInput.value === '') {
        cancelEvent(e);
        this.clearTextArea();
      } else if (e.key === KeyMap.ENTER && !e.shiftKey && !e.ctrlKey) {
        cancelEvent(e);
        this.sendPrompt();
      } else if (e.key === KeyMap.ENTER && (e.shiftKey || e.ctrlKey)) {
        cancelEvent(e);
        this.promptTextInput.value = `${this.promptTextInput.value}\n`;
        setTimeout(() => {
          this.calculateTextAreaHeight(true);
        }, 10);
      } else if (this.selectedCommand === '' && this.quickActionCommands.length > 0 && e.key === KeyMap.SLASH && this.promptTextInput.value === '') {
        if (this.commandSelector !== undefined) {
          this.commandSelector.close();
        }
        this.filteredCommandsList = [ ...this.quickActionCommands ];
        this.commandSelector = new Overlay({
          background: false,
          closeOnOutsideClick: false,
          referenceElement: this.render,
          dimOutside: false,
          stretchWidth: true,
          verticalDirection: OverlayVerticalDirection.TO_TOP,
          horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
          onClose: () => {
            this.commandSelectorOpen = false;
          },
          children: [
            this.getQuickCommandActions(this.quickActionCommands)
          ],
        });

        this.commandSelectorOpen = true;
      }
    } else {
      const blockedKeys = [ KeyMap.ENTER, KeyMap.ESCAPE, KeyMap.SPACE, KeyMap.TAB, KeyMap.BACK_SLASH, KeyMap.SLASH ] as string[];
      const navigationalKeys = [ KeyMap.ARROW_UP, KeyMap.ARROW_DOWN ] as string[];
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        if (e.key === KeyMap.ENTER || e.key === KeyMap.TAB || e.key === KeyMap.SPACE) {
          // let quickAction: QuickActionCommand;
          const targetElement = this.commandSelector.render.querySelector('.target-command') ?? this.commandSelector.render.querySelector('.mynah-chat-command-selector-command');
          this.handleCommandSelection({
            command: targetElement?.getAttribute('command') ?? '',
            placeholder: targetElement?.getAttribute('placeholder') ?? undefined,
          });
        }
        if (this.commandSelector !== undefined) {
          this.commandSelector.close();
        }
      } else if (navigationalKeys.includes(e.key)) {
        e.preventDefault();
        const commandElements = Array.from(this.commandSelector.render.querySelectorAll('.mynah-chat-command-selector-command'));
        let lastActiveElement = commandElements.findIndex(commandElement => commandElement.classList.contains('target-command'));
        lastActiveElement = lastActiveElement === -1 ? commandElements.length : lastActiveElement;
        let nextElement: number;
        if (e.key === KeyMap.ARROW_UP) {
          if (lastActiveElement > 0) {
            nextElement = lastActiveElement - 1;
          } else {
            nextElement = commandElements.length - 1;
          }
        } else {
          if (lastActiveElement < commandElements.length - 1) {
            nextElement = lastActiveElement + 1;
          } else {
            nextElement = 0;
          }
        }

        commandElements[lastActiveElement]?.classList.remove('target-command');
        commandElements[nextElement].classList.add('target-command');
        this.promptTextInput.value = commandElements[nextElement].getAttribute('prompt') ?? this.promptTextInput.value;
      } else {
        if (this.commandSelector !== undefined) {
          setTimeout(() => {
            if (this.promptTextInput.value === '') {
              this.commandSelector.close();
            } else {
              this.filteredCommandsList = [];
              [ ...this.quickActionCommands ].forEach((quickActionGroup: QuickActionCommandGroup) => {
                const newQuickActionCommandGroup = { ...quickActionGroup };
                newQuickActionCommandGroup.commands = newQuickActionCommandGroup
                  .commands.filter(command => command.command.match(new RegExp(`${this.promptTextInput.value.substring(1)}` ?? '', 'gi')));
                if (newQuickActionCommandGroup.commands.length > 0) {
                  this.filteredCommandsList.push(newQuickActionCommandGroup);
                }
              });
              this.commandSelector.updateContent([ this.getQuickCommandActions(this.filteredCommandsList) ]);
            }
          }, 1);
        }
      }
    }
  };

  private readonly getQuickCommandActions = (quickCommandList: QuickActionCommandGroup[]): ExtendedHTMLElement => {
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-command-selector' ],
      children: quickCommandList.map((quickActionCommandGroup) => {
        return DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-chat-command-selector-group' ],
          children: [
            ...(quickActionCommandGroup.groupName !== undefined
              ? [ DomBuilder.getInstance().build({
                  type: 'h4',
                  classNames: [ 'mynah-chat-command-selector-group-title' ],
                  children: [ quickActionCommandGroup.groupName ]
                }) ]
              : []),
            ...(quickActionCommandGroup.commands.map(quickActionCommand => {
              return DomBuilder.getInstance().build({
                type: 'div',
                classNames: [ 'mynah-chat-command-selector-command' ],
                attributes: {
                  ...quickActionCommand
                },
                events: {
                  click: () => {
                    this.handleCommandSelection(quickActionCommand);
                  }
                },
                children: [
                  {
                    type: 'div',
                    classNames: [ 'mynah-chat-command-selector-command-name' ],
                    children: [ quickActionCommand.command ]
                  },
                  ...(quickActionCommand.description !== undefined
                    ? [ {
                        type: 'div',
                        classNames: [ 'mynah-chat-command-selector-command-description' ],
                        children: [ quickActionCommand.description ]
                      } ]
                    : [])
                ]
              });
            }))
          ]
        });
      })
    });
  };

  private readonly handleCommandSelection = (quickActionCommand: QuickActionCommand): void => {
    this.selectedCommand = quickActionCommand.command;
    if (quickActionCommand.placeholder !== undefined) {
      this.promptTextInput.value = '';
      this.promptTextInputCommand.setCommand(this.selectedCommand);
      this.promptTextInput.update({
        attributes: {
          placeholder: quickActionCommand.placeholder
        }
      });
    } else {
      this.promptTextInput.value = '';
      this.sendPrompt();
    }
    this.commandSelector.close();
    this.promptTextInput.focus();
  };

  private readonly calculateTextAreaHeight = (newLine?: boolean): void => {
    if (this.promptTextInput.value.trim() !== '') {
      this.promptTextInputWrapper.removeClass('no-text');
    } else {
      this.promptTextInputWrapper.addClass('no-text');
    }
    this.promptTextInputSizer.innerHTML = this.promptTextInput.value.replace(/\n/g, `</br>${newLine === true ? '&nbsp;' : ''}`);
  };

  private readonly resetTextAreaHeight = (): void => {
    this.promptTextInputSizer.innerHTML = '';
  };

  public readonly clearTextArea = (): void => {
    this.resetTextAreaHeight();
    this.selectedCommand = '';
    this.promptTextInputCommand.setCommand('');
    this.promptTextInput.value = '';
    this.promptTextInput.update({
      attributes: {
        placeholder: MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder')
      }
    });
    this.promptTextInputWrapper.addClass('no-text');
    this.attachmentWrapper.clear();
    this.codeSnippet.render.clear();
    this.attachment = undefined;
  };

  public readonly addText = (textToAdd: string): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.ADD_CODE_SNIPPET, {
      tabId: this.props.tabId,
      selectedCodeSnippet: textToAdd,
    });
  };

  private readonly sendPrompt = (): void => {
    if (this.promptTextInput.value.trim() !== '' || this.selectedCommand.trim() !== '') {
      const selectedCodeSnippet: string | undefined = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('selectedCodeSnippet');
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CHAT_PROMPT, {
        tabId: this.props.tabId,
        prompt: {
          prompt: this.promptTextInput.value + (selectedCodeSnippet ?? ''),
          escapedPrompt: escapeHTML(this.promptTextInput.value + (selectedCodeSnippet ?? '')),
          ...(this.selectedCommand !== '' ? { command: this.selectedCommand } : {}),
          attachment: this.attachment
        }
      });
      this.clearTextArea();
    }
  };
}
