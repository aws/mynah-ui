/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { KeyMap, MynahEventNames, QuickActionCommand, QuickActionCommandGroup, SourceLink } from '../../static';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay';
import { MynahUITabsStore } from '../../helper/tabs-store';
import escapeHTML from 'escape-html';
import { ChatPromptInputCommand } from './chat-prompt-input-command';
import { CodeSnippet } from './prompt-input/code-snippet';
import { SendButton } from './prompt-input/send-button';
import { PromptTextInput } from './prompt-input/prompt-text-input';

export const MAX_USER_INPUT = 4000;
export const MAX_USER_INPUT_THRESHOLD = 96;
export interface ChatPromptInputProps {
  tabId: string;
}
export class ChatPromptInput {
  render: ExtendedHTMLElement;
  private readonly props: ChatPromptInputProps;
  private readonly attachmentWrapper: ExtendedHTMLElement;
  private readonly promptTextInput: PromptTextInput;
  private readonly promptTextInputCommand: ChatPromptInputCommand;
  private readonly remainingCharsIndicator: ExtendedHTMLElement;
  private readonly sendButton: SendButton;
  private readonly codeSnippet: CodeSnippet;
  private quickActionCommands: QuickActionCommandGroup[];
  private commandSelector: Overlay;
  private commandSelectorOpen: boolean = false;
  private selectedCommand: string = '';
  private attachment?: SourceLink;
  private filteredCommandsList: QuickActionCommandGroup[];
  constructor (props: ChatPromptInputProps) {
    this.props = props;
    this.quickActionCommands = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[];
    this.promptTextInputCommand = new ChatPromptInputCommand({
      command: '',
      onRemoveClick: () => {
        this.selectedCommand = '';
        this.promptTextInputCommand.setCommand('');
      }
    });
    this.promptTextInput = new PromptTextInput({
      tabId: this.props.tabId,
      onKeydown: this.handleInputKeydown,
      onInput: () => this.updateAvailableCharactersIndicator(),
    });
    this.remainingCharsIndicator = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-chat-prompt-chars-indicator' ],
      innerHTML: `${MAX_USER_INPUT - this.promptTextInput.getTextInputValue().length}/${MAX_USER_INPUT}`
    });
    this.sendButton = new SendButton({
      tabId: this.props.tabId,
      onClick: () => {
        this.sendPrompt();
      },
    });

    this.codeSnippet = new CodeSnippet({
      tabId: this.props.tabId,
    });

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
          classNames: [ 'mynah-chat-prompt' ],
          children: [
            {
              type: 'div',
              classNames: [ 'mynah-chat-prompt-input-wrapper' ],
              children: [
                this.promptTextInputCommand.render,
                this.promptTextInput.render,
                this.sendButton.render,
              ]
            },
            this.attachmentWrapper
          ]
        },
        this.remainingCharsIndicator,
      ],
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.ADD_CODE_SNIPPET, (data: {
      textToAdd?: string;
      tabId?: string;
    }) => {
      if (this.props.tabId === data.tabId) {
        // Code snippet will have a limit of MAX_USER_INPUT - MAX_USER_INPUT_THRESHOLD - current prompt text length
        // If exceeding that, we will crop it
        const textInputLength = this.promptTextInput.getTextInputValue().trim().length;
        const currentSelectedCodeMaxLength = (MAX_USER_INPUT + MAX_USER_INPUT_THRESHOLD) - textInputLength;
        const croppedSelectedCodeSnippet = (data.textToAdd ?? '')?.slice(0, currentSelectedCodeMaxLength);
        this.codeSnippet.updateSelectedCodeSnippet(croppedSelectedCodeSnippet);
        // Also update the limit on prompt text given the selected code
        this.promptTextInput.updateTextInputMaxLength(Math.min(MAX_USER_INPUT, (MAX_USER_INPUT + MAX_USER_INPUT_THRESHOLD) - croppedSelectedCodeSnippet.length));
        this.updateAvailableCharactersIndicator();
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.REMOVE_CODE_SNIPPET, () => {
      this.promptTextInput.updateTextInputMaxLength(MAX_USER_INPUT);
      this.codeSnippet.clear();
      // Update the limit on prompt text given the selected code
      this.updateAvailableCharactersIndicator();
    });

    setTimeout(() => {
      this.promptTextInput.focus();
    }, 500);
  }

  private readonly updateAvailableCharactersIndicator = (): void => {
    const totalCharsUsed =
      this.promptTextInput.getTextInputValue().trim().length + this.codeSnippet.lastCodeSnippet.length;
    this.remainingCharsIndicator.update({
      innerHTML: `${Math.max(0, (MAX_USER_INPUT - totalCharsUsed))}/${MAX_USER_INPUT}`
    });
  };

  private readonly handleInputKeydown = (e: KeyboardEvent): void => {
    if (!this.commandSelectorOpen) {
      this.quickActionCommands = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[];
      if (e.key === KeyMap.BACKSPACE && this.selectedCommand !== '' && this.promptTextInput.getTextInputValue() === '') {
        cancelEvent(e);
        this.clearTextArea();
      } else if (e.key === KeyMap.ENTER && !e.shiftKey && !e.ctrlKey) {
        cancelEvent(e);
        this.sendPrompt();
      } else if (this.selectedCommand === '' && this.quickActionCommands.length > 0 && e.key === KeyMap.SLASH && this.promptTextInput.getTextInputValue() === '') {
        // Show available quick actions
        if (this.commandSelector !== undefined) {
          this.commandSelector.close();
        }
        this.filteredCommandsList = [ ...this.quickActionCommands ];
        this.commandSelector = new Overlay({
          closeOnOutsideClick: true,
          referenceElement: this.render.querySelector('.mynah-chat-prompt') as ExtendedHTMLElement,
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
        if (commandElements[nextElement].getAttribute('prompt') !== null) {
          this.promptTextInput.updateTextInputValue(commandElements[nextElement].getAttribute('prompt') as string);
        }
      } else {
        if (this.commandSelector !== undefined) {
          setTimeout(() => {
            if (this.promptTextInput.getTextInputValue() === '') {
              this.commandSelector.close();
            } else {
              this.filteredCommandsList = [];
              [ ...this.quickActionCommands ].forEach((quickActionGroup: QuickActionCommandGroup) => {
                const newQuickActionCommandGroup = { ...quickActionGroup };
                try {
                  const promptRegex = new RegExp(`${this.promptTextInput.getTextInputValue().substring(1)}` ?? '', 'gi');
                  newQuickActionCommandGroup.commands = newQuickActionCommandGroup.commands.filter(command =>
                    command.command.match(promptRegex)
                  );
                  if (newQuickActionCommandGroup.commands.length > 0) {
                    this.filteredCommandsList.push(newQuickActionCommandGroup);
                  }
                } catch (e) {
                  // In case the prompt is an incomplete regex
                }
              });
              if (this.filteredCommandsList.length > 0) {
                this.commandSelector.toggleHidden(false);
                this.commandSelector.updateContent([ this.getQuickCommandActions(this.filteredCommandsList) ]);
              } else {
                // If there's no matching action, hide the command selector overlay
                this.commandSelector.toggleHidden(true);
              }
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
    this.promptTextInput.updateTextInputValue('');
    if (quickActionCommand.placeholder !== undefined) {
      this.promptTextInputCommand.setCommand(this.selectedCommand);
      this.promptTextInput.updateTextInputPlaceholder(quickActionCommand.placeholder);
    } else {
      this.sendPrompt();
    }
    this.commandSelector.close();
    this.promptTextInput.focus();
  };

  public readonly clearTextArea = (): void => {
    this.selectedCommand = '';
    this.promptTextInput.clear();
    this.promptTextInput.updateTextInputMaxLength(MAX_USER_INPUT);
    this.promptTextInputCommand.setCommand('');
    this.attachmentWrapper.clear();
    this.codeSnippet.clear();
    this.attachment = undefined;
    this.updateAvailableCharactersIndicator();
  };

  public readonly addText = (textToAdd: string): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.ADD_CODE_SNIPPET, {
      textToAdd,
      tabId: this.props.tabId
    });
  };

  private readonly sendPrompt = (): void => {
    const currentInputValue = this.promptTextInput.getTextInputValue();
    if (currentInputValue.trim() !== '' || this.selectedCommand.trim() !== '') {
      const selectedCodeSnippet: string | undefined = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('selectedCodeSnippet');
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CHAT_PROMPT, {
        tabId: this.props.tabId,
        prompt: {
          prompt: currentInputValue + (selectedCodeSnippet ?? ''),
          escapedPrompt: escapeHTML(currentInputValue + (selectedCodeSnippet ?? '')),
          ...(this.selectedCommand !== '' ? { command: this.selectedCommand } : {}),
          attachment: this.attachment
        }
      });
      this.clearTextArea();
    }
  };
}
