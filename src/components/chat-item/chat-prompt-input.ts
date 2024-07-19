/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatPrompt, KeyMap, MynahEventNames, PromptAttachmentType, QuickActionCommand, QuickActionCommandGroup } from '../../static';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay';
import { MynahUITabsStore } from '../../helper/tabs-store';
import escapeHTML from 'escape-html';
import { ChatPromptInputCommand } from './chat-prompt-input-command';
import { PromptAttachment } from './prompt-input/prompt-attachment';
import { PromptInputSendButton } from './prompt-input/prompt-input-send-button';
import { PromptTextInput } from './prompt-input/prompt-text-input';
import { Config } from '../../helper/config';

export const MAX_USER_INPUT_THRESHOLD = 96;
export const MAX_USER_INPUT = (): number => {
  return Config.getInstance().config.maxUserInput - MAX_USER_INPUT_THRESHOLD;
};
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
  private readonly sendButton: PromptInputSendButton;
  private readonly promptAttachment: PromptAttachment;
  private quickPickTriggerIndex: number;
  private quickPickType: 'quick-action' | 'context';
  private textAfter: string;
  private quickPickItemGroups: QuickActionCommandGroup[];
  private filteredQuickPickItemGroups: QuickActionCommandGroup[];
  private quickPick: Overlay;
  private quickPickOpen: boolean = false;
  private selectedCommand: string = '';
  constructor (props: ChatPromptInputProps) {
    this.props = props;
    this.promptTextInputCommand = new ChatPromptInputCommand({
      command: '',
      onRemoveClick: () => {
        this.selectedCommand = '';
        this.promptTextInputCommand.setCommand('');
      }
    });
    this.promptTextInput = new PromptTextInput({
      initMaxLength: MAX_USER_INPUT(),
      tabId: this.props.tabId,
      onKeydown: this.handleInputKeydown,
      onInput: () => this.updateAvailableCharactersIndicator(),
      onFocus: this.handleInputFocus,
    });
    this.remainingCharsIndicator = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-chat-prompt-chars-indicator' ],
      innerHTML: `${MAX_USER_INPUT() - this.promptTextInput.getTextInputValue().length}/${MAX_USER_INPUT()}`
    });
    this.sendButton = new PromptInputSendButton({
      tabId: this.props.tabId,
      onClick: () => {
        this.sendPrompt();
      },
    });

    this.promptAttachment = new PromptAttachment({
      tabId: this.props.tabId,
    });

    this.attachmentWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-attachment-wrapper' ],
      children: [
        this.promptAttachment.render
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
                {
                  type: 'div',
                  classNames: [ 'mynah-chat-prompt-button-wrapper' ],
                  children: [
                    this.sendButton.render,
                  ]
                },
              ]
            },
            this.attachmentWrapper
          ]
        },
        this.remainingCharsIndicator,
      ],
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.ADD_ATTACHMENT, (data: {
      textToAdd?: string;
      tabId?: string;
      type?: PromptAttachmentType;
    }) => {
      if (this.props.tabId === data.tabId) {
        // Code snippet will have a limit of MAX_USER_INPUT - MAX_USER_INPUT_THRESHOLD - current prompt text length
        // If exceeding that, we will crop it
        const textInputLength = this.promptTextInput.getTextInputValue().trim().length;
        const currentSelectedCodeMaxLength = (MAX_USER_INPUT() + MAX_USER_INPUT_THRESHOLD) - textInputLength;
        const croppedAttachmentContent = (data.textToAdd ?? '')?.slice(0, currentSelectedCodeMaxLength);
        this.promptAttachment.updateAttachment(croppedAttachmentContent, data.type);
        // Also update the limit on prompt text given the selected code
        this.promptTextInput.updateTextInputMaxLength(Math.min(MAX_USER_INPUT(), Math.max(MAX_USER_INPUT_THRESHOLD, (MAX_USER_INPUT() + MAX_USER_INPUT_THRESHOLD) - croppedAttachmentContent.length)));
        this.updateAvailableCharactersIndicator();

        // When code is attached, focus to the input with a delay
        // Delay is necessary for the render updates
        setTimeout(() => {
          this.promptTextInput.focus();
        }, 100);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.REMOVE_ATTACHMENT, () => {
      this.promptTextInput.updateTextInputMaxLength(MAX_USER_INPUT());
      this.promptAttachment.clear();
      // Update the limit on prompt text given the selected code
      this.updateAvailableCharactersIndicator();
    });
  }

  private readonly updateAvailableCharactersIndicator = (): void => {
    const remainingChars =
      this.promptTextInput.promptTextInputMaxLength - this.promptTextInput.getTextInputValue().trim().length;
    this.remainingCharsIndicator.update({
      innerHTML: `${Math.max(0, remainingChars)}/${MAX_USER_INPUT()}`
    });
  };

  private readonly handleInputKeydown = (e: KeyboardEvent): void => {
    if (!this.quickPickOpen) {
      const quickPickContextItems = (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('contextCommands') as QuickActionCommandGroup[]) ?? [];
      const quickPickCommandItems = (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[]) ?? [];
      if (e.key === KeyMap.BACKSPACE || e.key === KeyMap.DELETE) {
        if (this.selectedCommand !== '' && this.promptTextInput.getTextInputValue() === '') {
          cancelEvent(e);
          this.clearTextArea(true);
        } else if (quickPickContextItems.length > 0) {
          // If we're trying to delete a context item, we should do it as a word, not just some letter inside the context.
          // Since those context are defined, it should match the whole term or it shouldn't be there at all.
          const targetWord = this.promptTextInput.getWordAndIndexOnCursorPos();
          if (targetWord.word.charAt(0) === KeyMap.AT) {
            cancelEvent(e);
            const currValue = this.promptTextInput.getTextInputValue();
            this.promptTextInput.updateTextInputValue(currValue.substring(0, targetWord.wordStartIndex) + currValue.substring(targetWord.wordStartIndex + targetWord.word.length));
            this.promptTextInput.focus(targetWord.wordStartIndex);
          }
        }
      } else if (e.key === KeyMap.ENTER &&
        ((!e.isComposing && !e.shiftKey && !e.ctrlKey) ||
        (e.isComposing && (e.shiftKey)))) {
        cancelEvent(e);
        this.sendPrompt();
      } else if (
        (this.selectedCommand === '' && e.key === KeyMap.SLASH && this.promptTextInput.getTextInputValue() === '') ||
        (e.key === KeyMap.AT)
      ) {
        this.quickPickType = e.key === KeyMap.AT ? 'context' : 'quick-action';
        this.quickPickItemGroups = this.quickPickType === 'context' ? quickPickContextItems : quickPickCommandItems;
        this.quickPickTriggerIndex = this.quickPickType === 'context' ? this.promptTextInput.getCursorPos() : 1;
        this.textAfter = this.promptTextInput.getTextInputValue().substring(this.quickPickTriggerIndex);
        this.promptTextInput.setContextReplacement(this.quickPickItemGroups.length > 0);

        if (this.quickPickItemGroups.length > 0) {
          this.filteredQuickPickItemGroups = [ ...this.quickPickItemGroups ];
          this.quickPick = new Overlay({
            closeOnOutsideClick: true,
            referenceElement: this.render.querySelector('.mynah-chat-prompt') as ExtendedHTMLElement,
            dimOutside: false,
            stretchWidth: true,
            verticalDirection: OverlayVerticalDirection.TO_TOP,
            horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
            onClose: () => {
              this.quickPickOpen = false;
            },
            children: [
              this.getQuickPickItemGroups(this.filteredQuickPickItemGroups)
            ],
          });

          this.quickPickOpen = true;
        }
      }
    } else {
      const blockedKeys = [ KeyMap.ENTER, KeyMap.ESCAPE, KeyMap.SPACE, KeyMap.TAB, KeyMap.AT, KeyMap.BACK_SLASH, KeyMap.SLASH ] as string[];
      const navigationalKeys = [ KeyMap.ARROW_UP, KeyMap.ARROW_DOWN ] as string[];
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        if (e.key === KeyMap.ESCAPE) {
          if (this.quickPickType === 'quick-action') {
            this.clearTextArea(true);
          } else {
            this.promptTextInput.updateTextInputValue(`${this.promptTextInput.getTextInputValue().substring(0, this.quickPickTriggerIndex)}${this.textAfter}`);
            this.promptTextInput.focus(this.quickPickTriggerIndex);
          }
          this.quickPick?.close();
        } else if (e.key === KeyMap.ENTER || e.key === KeyMap.TAB || e.key === KeyMap.SPACE) {
          let targetElement;
          // If list is empty, it means there's no match, so we need to clear the selection
          if (this.filteredQuickPickItemGroups.length > 0) {
            if (this.quickPick.render.querySelector('.target-command') != null) {
              targetElement = this.quickPick.render.querySelector('.target-command');
            } else if (this.quickPick.render.querySelector('.mynah-chat-command-selector-command')?.getAttribute('disabled') !== 'true') {
              targetElement = this.quickPick.render.querySelector('.mynah-chat-command-selector-command');
            }
          }
          const commandToSend = {
            command: targetElement?.getAttribute('command') ?? '',
            placeholder: targetElement?.getAttribute('placeholder') ?? undefined,
          };
          if (this.quickPickType === 'context') {
            this.handleContextCommandSelection(commandToSend);
          } else {
            this.handleQuickActionCommandSelection(commandToSend);
          }
        }
      } else if (navigationalKeys.includes(e.key)) {
        e.preventDefault();
        const commandsWrapper = this.quickPick.render.querySelector('.mynah-chat-command-selector');
        (commandsWrapper as ExtendedHTMLElement).addClass('has-target-item');
        const commandElements = Array.from(this.quickPick.render.querySelectorAll('.mynah-chat-command-selector-command'));
        let lastActiveElement = commandElements.findIndex(commandElement => commandElement.classList.contains('target-command'));
        lastActiveElement = lastActiveElement === -1 ? commandElements.length : lastActiveElement;
        let nextElementIndex: number = lastActiveElement;

        if (commandElements.length === commandElements.filter(commandElement => commandElement.getAttribute('disabled') === 'true')?.length) {
          nextElementIndex = -1;
        } else {
          let nextElementFound = false;
          while (!nextElementFound) {
            if (e.key === KeyMap.ARROW_UP) {
              if (nextElementIndex > 0) {
                nextElementIndex = nextElementIndex - 1;
              } else {
                nextElementIndex = commandElements.length - 1;
              }
            } else {
              if (nextElementIndex < commandElements.length - 1) {
                nextElementIndex = nextElementIndex + 1;
              } else {
                nextElementIndex = 0;
              }
            }
            if (commandElements[nextElementIndex].getAttribute('disabled') !== 'true') {
              nextElementFound = true;
            }
          }
        }

        if (nextElementIndex !== -1) {
          commandElements[lastActiveElement]?.classList.remove('target-command');
          commandElements[nextElementIndex].classList.add('target-command');
          if (commandElements[nextElementIndex].getAttribute('prompt') !== null) {
            this.promptTextInput.updateTextInputValue(commandElements[nextElementIndex].getAttribute('prompt') as string);
          }
        }
      } else {
        if (this.quickPick != null) {
          setTimeout(() => {
            if (this.promptTextInput.getTextInputValue() === '') {
              this.quickPick.close();
            } else {
              this.filteredQuickPickItemGroups = [];
              [ ...this.quickPickItemGroups ].forEach((quickPickGroup: QuickActionCommandGroup) => {
                const newQuickPickCommandGroup = { ...quickPickGroup };
                try {
                  const searchTerm = this.promptTextInput.getTextInputValue().substring(this.quickPickTriggerIndex).match(/\S*/gi)?.[0];
                  const promptRegex = new RegExp(searchTerm ?? '', 'gi');
                  newQuickPickCommandGroup.commands = newQuickPickCommandGroup.commands.filter(command =>
                    command.command.match(promptRegex)
                  );
                  if (newQuickPickCommandGroup.commands.length > 0) {
                    this.filteredQuickPickItemGroups.push(newQuickPickCommandGroup);
                  }
                } catch (e) {
                  // In case the prompt is an incomplete regex
                }
              });
              if (this.filteredQuickPickItemGroups.length > 0) {
                this.quickPick.toggleHidden(false);
                this.quickPick.updateContent([ this.getQuickPickItemGroups(this.filteredQuickPickItemGroups) ]);
              } else {
                // If there's no matching action, hide the command selector overlay
                this.quickPick.toggleHidden(true);
              }
            }
          }, 1);
        }
      }
    }
  };

  private readonly handleInputFocus = (): void => {
    const inputValue = this.promptTextInput.getTextInputValue();
    if (inputValue.startsWith('/')) {
      const quickPickItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[];
      this.quickPickItemGroups = [ ...quickPickItems ];
      this.quickPickTriggerIndex = 1;
      this.textAfter = inputValue.substring(this.quickPickTriggerIndex);
      this.promptTextInput.setContextReplacement(this.quickPickItemGroups.length > 0);
      const restorePreviousFilteredQuickPickItemGroups: QuickActionCommandGroup[] = [];
      this.quickPickItemGroups.forEach((quickPickGroup: QuickActionCommandGroup) => {
        const newQuickPickCommandGroup = { ...quickPickGroup };
        try {
          const searchTerm = inputValue.substring(this.quickPickTriggerIndex).match(/\S*/gi)?.[0];
          const promptRegex = new RegExp(searchTerm ?? '', 'gi');
          newQuickPickCommandGroup.commands = newQuickPickCommandGroup.commands.filter(command =>
            command.command.match(promptRegex)
          );
          if (newQuickPickCommandGroup.commands.length > 0) {
            restorePreviousFilteredQuickPickItemGroups.push(newQuickPickCommandGroup);
          }
        } catch (e) {
          // In case the prompt is an incomplete regex
        }
      });

      if (this.quickPickItemGroups.length > 0) {
        this.filteredQuickPickItemGroups = [ ...restorePreviousFilteredQuickPickItemGroups ];
        this.quickPick = new Overlay({
          closeOnOutsideClick: true,
          referenceElement: this.render.querySelector('.mynah-chat-prompt') as ExtendedHTMLElement,
          dimOutside: false,
          stretchWidth: true,
          verticalDirection: OverlayVerticalDirection.TO_TOP,
          horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
          onClose: () => {
            this.quickPickOpen = false;
          },
          children: [ this.getQuickPickItemGroups(this.filteredQuickPickItemGroups) ],
        });

        this.quickPickOpen = true;
      }
    }
  };

  private readonly getQuickPickItemGroups = (quickPickGroupList: QuickActionCommandGroup[]): ExtendedHTMLElement => {
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-command-selector' ],
      children: quickPickGroupList.map((quickPickGroup) => {
        return DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-chat-command-selector-group' ],
          children: [
            ...(quickPickGroup.groupName !== undefined
              ? [ DomBuilder.getInstance().build({
                  type: 'h4',
                  classNames: [ 'mynah-chat-command-selector-group-title' ],
                  children: [ quickPickGroup.groupName ]
                }) ]
              : []),
            ...(quickPickGroup.commands.map(quickPickCommand => {
              return DomBuilder.getInstance().build({
                type: 'div',
                classNames: [ 'mynah-chat-command-selector-command' ],
                attributes: {
                  ...quickPickCommand
                },
                events: {
                  click: () => {
                    if (quickPickCommand.disabled !== true) {
                      if (this.quickPickType === 'context') {
                        this.handleContextCommandSelection(quickPickCommand);
                      } else {
                        this.handleQuickActionCommandSelection(quickPickCommand);
                      }
                    }
                  }
                },
                children: [
                  {
                    type: 'div',
                    classNames: [ 'mynah-chat-command-selector-command-name' ],
                    children: [ quickPickCommand.command ]
                  },
                  ...(quickPickCommand.description !== undefined
                    ? [ {
                        type: 'div',
                        classNames: [ 'mynah-chat-command-selector-command-description' ],
                        children: [ quickPickCommand.description ]
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

  private readonly handleQuickActionCommandSelection = (quickActionCommand: QuickActionCommand): void => {
    this.selectedCommand = quickActionCommand.command;
    this.promptTextInput.updateTextInputValue('');
    if (quickActionCommand.placeholder !== undefined) {
      this.promptTextInputCommand.setCommand(this.selectedCommand);
      this.promptTextInput.updateTextInputPlaceholder(quickActionCommand.placeholder);
    } else {
      this.sendPrompt();
    }
    this.quickPick.close();
    if (Config.getInstance().config.autoFocus) {
      this.promptTextInput.focus();
    }
  };

  private readonly handleContextCommandSelection = (contextCommand: QuickActionCommand): void => {
    const previousText = this.promptTextInput.getTextInputValue().substring(0, this.quickPickTriggerIndex);
    this.promptTextInput.updateTextInputValue(`${previousText}${contextCommand.command} ${this.textAfter}`, {
      index: this.quickPickTriggerIndex + contextCommand.command.length,
      text: contextCommand.placeholder
    });
    this.quickPick.close();
    this.promptTextInput.focus(this.quickPickTriggerIndex + contextCommand.command.length + 1);
  };

  public readonly clearTextArea = (keepAttachment?: boolean): void => {
    this.selectedCommand = '';
    this.promptTextInput.clear();
    this.promptTextInput.updateTextInputMaxLength(MAX_USER_INPUT());
    this.promptTextInputCommand.setCommand('');
    if (keepAttachment !== true) {
      this.attachmentWrapper.clear();
      this.promptAttachment.clear();
    }
    this.updateAvailableCharactersIndicator();
  };

  public readonly addAttachment = (attachmentContent: string, type?: PromptAttachmentType): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.ADD_ATTACHMENT, {
      textToAdd: attachmentContent,
      tabId: this.props.tabId,
      type
    });
  };

  private readonly sendPrompt = (): void => {
    const currentInputValue = this.promptTextInput.getTextInputValue();
    if (currentInputValue.trim() !== '' || this.selectedCommand.trim() !== '') {
      const attachmentContent: string | undefined = this.promptAttachment?.lastAttachmentContent;
      const promptText = currentInputValue + (attachmentContent ?? '');
      const context: string[] = [];
      const escapedPrompt = escapeHTML(promptText.replace(/^\s+/gm, '').replace(/@\S*/gi, (match) => {
        if (!context.includes(match)) {
          context.push(match);
        }
        return `**${match}**`;
      }));
      const promptData: {tabId: string; prompt: ChatPrompt} = {
        tabId: this.props.tabId,
        prompt: {
          prompt: promptText,
          escapedPrompt,
          context,
          ...(this.selectedCommand !== '' ? { command: this.selectedCommand } : {}),
        }
      };
      this.clearTextArea();
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CHAT_PROMPT, promptData);
    }
  };
}
