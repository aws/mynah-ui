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
import testIds from '../../helper/test-ids';
import { PromptInputProgress } from './prompt-input/prompt-progress';
import { CardBody } from '../card/card-body';
import { Icon } from '../icon';

// 96 extra is added as a threshold to allow for attachments
// We ignore this for the textual character limit
export const MAX_USER_INPUT_THRESHOLD = 96;
export const MAX_USER_INPUT = (): number => {
  return Config.getInstance().config.maxUserInput - MAX_USER_INPUT_THRESHOLD;
};

// The amount of characters in the prompt input necessary for the warning to show
export const INPUT_LENGTH_WARNING_THRESHOLD = (): number => {
  return Config.getInstance().config.userInputLengthWarningThreshold;
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
  private readonly sendButton: PromptInputSendButton;
  private readonly progressIndicator: PromptInputProgress;
  private readonly promptAttachment: PromptAttachment;
  private readonly chatPrompt: ExtendedHTMLElement;
  private promptTextInputLabel: ExtendedHTMLElement;
  private remainingCharsOverlay: Overlay;
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
    const quickPickContextItems = (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('contextCommands') as QuickActionCommandGroup[]) ?? [];
    const allQuickPickContextItems = quickPickContextItems.flatMap(cntxGroup => cntxGroup.commands.map(cmd => cmd.command));
    this.promptTextInput = new PromptTextInput({
      initMaxLength: MAX_USER_INPUT(),
      tabId: this.props.tabId,
      onKeydown: this.handleInputKeydown,
      contextItems: allQuickPickContextItems,
      onInput: () => this.updateAvailableCharactersIndicator(),
      onFocus: () => {
        this.render.addClass('input-has-focus');
        this.handleInputFocus();
      },
      onBlur: () => {
        if (this.render.hasClass('awaits-confirmation')) {
          this.promptTextInputCommand.setCommand('');
          this.selectedCommand = '';
          this.promptTextInput.updateTextInputPlaceholder(MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputPlaceholder'));
          this.promptTextInput.updateTextInputMaxLength(Config.getInstance().config.maxUserInput);
          if (Config.getInstance().config.autoFocus) {
            this.promptTextInput.focus();
          }
          this.render.removeClass('awaits-confirmation');
        }
        this.render.removeClass('input-has-focus');
        this.remainingCharsOverlay?.close();
      }
    });
    const initText = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputText');
    if (initText != null && initText.trim() !== '') {
      this.promptTextInput.updateTextInputValue(initText);
    }
    this.sendButton = new PromptInputSendButton({
      tabId: this.props.tabId,
      onClick: () => {
        this.sendPrompt();
      },
    });
    this.progressIndicator = new PromptInputProgress({
      tabId: this.props.tabId,
    });

    this.promptAttachment = new PromptAttachment({
      tabId: this.props.tabId,
    });

    this.attachmentWrapper = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.attachmentWrapper,
      classNames: [ 'mynah-chat-prompt-attachment-wrapper' ],
      children: [
        this.promptAttachment.render
      ]
    });

    this.chatPrompt = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt' ],
      children: [
        this.chatPrompt,
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
        this.attachmentWrapper,
        this.progressIndicator.render
      ]
    });

    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'promptInputText', (promptInputText: string) => {
      if (this.promptTextInput.getTextInputValue() !== promptInputText) {
        this.promptTextInput.clear();
        this.promptTextInput.updateTextInputValue(promptInputText);
        setTimeout(() => {
          this.promptTextInput.focus(-1);
        }, 750);
      }
    });

    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'promptInputLabel', (promptInputLabel: string) => {
      const newDetails = this.getPromptInputTextLabel(promptInputLabel);
      if (this.promptTextInputLabel != null) {
        this.promptTextInputLabel.replaceWith(newDetails);
      } else {
        this.promptTextInputLabel = newDetails;
      }
    });

    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'promptInputVisible', (promptInputVisible?: boolean) => {
      if (promptInputVisible === false) {
        this.render.addClass('hidden');
      } else {
        this.render.removeClass('hidden');
      }
    });

    this.promptTextInputLabel = this.getPromptInputTextLabel(MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputLabel'));

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.wrapper,
      classNames: [ 'mynah-chat-prompt-wrapper', MynahUITabsStore.getInstance().getTabDataStore(props.tabId).getValue('promptInputVisible') === false ? 'hidden' : '' ],
      children: [
        this.promptTextInputLabel,
        this.chatPrompt
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
        const currentSelectedCodeMaxLength = (MAX_USER_INPUT()) - textInputLength;
        const croppedAttachmentContent = (data.textToAdd ?? '')?.slice(0, currentSelectedCodeMaxLength);
        this.promptAttachment.updateAttachment(croppedAttachmentContent, data.type);
        // Also update the limit on prompt text given the selected code
        this.promptTextInput.updateTextInputMaxLength(Math.max(MAX_USER_INPUT_THRESHOLD, (MAX_USER_INPUT() - croppedAttachmentContent.length)));
        this.updateAvailableCharactersIndicator();

        // When code is attached, focus to the input with a delay
        // Delay is necessary for the render updates
        setTimeout(() => {
          this.promptTextInput.focus(-1);
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
    const characterAmount = MAX_USER_INPUT() - Math.max(0, (this.promptTextInput.promptTextInputMaxLength - this.promptTextInput.getTextInputValue().trim().length));
    const charTextElm = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [ 'mynah-chat-prompt-chars-indicator' ],
      innerHTML: `${characterAmount}/${MAX_USER_INPUT()}`,
    });

    // Re(render) if the overlay is not in the DOM, else update
    if (this.remainingCharsOverlay == null || this.remainingCharsOverlay.render.parentNode == null) {
      this.remainingCharsOverlay = new Overlay({
        testId: testIds.prompt.remainingCharsIndicator,
        background: true,
        closeOnOutsideClick: false,
        referenceElement: this.chatPrompt,
        dimOutside: false,
        verticalDirection: OverlayVerticalDirection.TO_BOTTOM,
        horizontalDirection: OverlayHorizontalDirection.END_TO_LEFT,
        children: [
          charTextElm
        ],
      });
    } else {
      this.remainingCharsOverlay.updateContent([
        charTextElm
      ]);
    }

    // Set the visibility based on whether the threshold is hit
    if (characterAmount >= INPUT_LENGTH_WARNING_THRESHOLD()) {
      this.remainingCharsOverlay.toggleHidden(false);
    } else {
      this.remainingCharsOverlay.toggleHidden(true);
    }
  };

  private readonly handleInputKeydown = (e: KeyboardEvent): void => {
    if (e.key === KeyMap.ESCAPE && this.render.hasClass('awaits-confirmation')) {
      this.promptTextInput.blur();
    }
    if (!this.quickPickOpen) {
      const quickPickContextItems = (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('contextCommands') as QuickActionCommandGroup[]) ?? [];
      const allQuickPickContextItems = quickPickContextItems.flatMap(cntxGroup => cntxGroup.commands.map(cmd => cmd.command));
      const quickPickCommandItems = (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[]) ?? [];

      // Update the contextList on promptTextInput too
      this.promptTextInput.updateContextItems(allQuickPickContextItems);

      if (e.key === KeyMap.BACKSPACE || e.key === KeyMap.DELETE) {
        if (this.selectedCommand !== '' && this.promptTextInput.getTextInputValue() === '') {
          cancelEvent(e);
          this.clearTextArea(true);
        } else if (quickPickContextItems.length > 0) {
          // If we're trying to delete a context item, we should do it as a word, not just some letter inside the context.
          // Since those context are defined, it should match the whole term or it shouldn't be there at all.
          const targetWord = this.promptTextInput.getWordAndIndexOnCursorPos();
          if (targetWord.word.charAt(0) === KeyMap.AT) {
            if (allQuickPickContextItems.includes(targetWord.word)) {
              cancelEvent(e);
              const currValue = this.promptTextInput.getTextInputValue();
              this.promptTextInput.updateTextInputValue(currValue.substring(0, targetWord.wordStartIndex) + currValue.substring(targetWord.wordStartIndex + targetWord.word.length));
              this.promptTextInput.focus(targetWord.wordStartIndex);
            }
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
            if (commandToSend.command !== '') {
              this.handleContextCommandSelection(commandToSend);
            } else {
              // Otherwise pass the given text by user
              const command = this.promptTextInput.getTextInputValue().substring(this.quickPickTriggerIndex).match(/\S*/gi)?.[0] ?? '';
              this.handleContextCommandSelection({ command });
            }
          } else {
            switch (e.key) {
              case KeyMap.SPACE:
                this.handleQuickActionCommandSelection(commandToSend, 'space');
                break;
              case KeyMap.TAB:
                this.handleQuickActionCommandSelection(commandToSend, 'tab');
                break;
              case KeyMap.ENTER:
                this.handleQuickActionCommandSelection(commandToSend, 'enter');
                break;
            }
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
    // Show the character limit warning overlay if the threshold is hit
    this.updateAvailableCharactersIndicator();

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
      testId: testIds.prompt.quickPicksWrapper,
      classNames: [ 'mynah-chat-command-selector' ],
      children: quickPickGroupList.map((quickPickGroup) => {
        return DomBuilder.getInstance().build({
          type: 'div',
          testId: testIds.prompt.quickPicksGroup,
          classNames: [ 'mynah-chat-command-selector-group' ],
          children: [
            ...(quickPickGroup.groupName !== undefined
              ? [ DomBuilder.getInstance().build({
                  type: 'div',
                  testId: testIds.prompt.quickPicksGroupTitle,
                  classNames: [ 'mynah-chat-command-selector-group-title' ],
                  children: [ new CardBody({
                    body: quickPickGroup.groupName
                  }).render ]
                }) ]
              : []),
            ...(quickPickGroup.commands.map(quickPickCommand => {
              return DomBuilder.getInstance().build({
                type: 'div',
                testId: testIds.prompt.quickPickItem,
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
                        this.handleQuickActionCommandSelection(quickPickCommand, 'click');
                      }
                    }
                  }
                },
                children: [
                  ...(quickPickCommand.icon !== undefined
                    ? [
                        new Icon({
                          icon: quickPickCommand.icon
                        }).render
                      ]
                    : []),
                  {
                    type: 'div',
                    classNames: [ 'mynah-chat-command-selector-command-container' ],
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
                  }
                ]
              });
            }))
          ]
        });
      })
    });
  };

  private readonly handleQuickActionCommandSelection = (quickActionCommand: QuickActionCommand, method: 'enter' | 'tab' | 'space' | 'click'): void => {
    this.selectedCommand = quickActionCommand.command;
    this.promptTextInput.updateTextInputValue('');
    if (quickActionCommand.placeholder !== undefined) {
      this.promptTextInputCommand.setCommand(this.selectedCommand);
      this.promptTextInput.updateTextInputPlaceholder(quickActionCommand.placeholder);
    } else if (method === 'enter' || method === 'click') {
      this.sendPrompt();
    } else {
      this.promptTextInputCommand.setCommand(this.selectedCommand);
      this.promptTextInput.updateTextInputPlaceholder(Config.getInstance().config.texts.commandConfirmation);
      this.promptTextInput.updateTextInputMaxLength(0);
      this.render.addClass('awaits-confirmation');
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

  private readonly sendPrompt = (): void => {
    const quickPickItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[];
    const currentInputValue = this.promptTextInput.getTextInputValue();
    if (currentInputValue.trim() !== '' || this.selectedCommand.trim() !== '') {
      let selectedCommand = this.selectedCommand;

      // Catching cases where user could send a prompt with quick action command but the command is not be selected correctly
      if (selectedCommand === '') {
        for (const quickPickItem of quickPickItems) {
          if (selectedCommand !== '') break;
          const matchedCommand = quickPickItem.commands.find((item) => item.disabled === false && currentInputValue.startsWith(item.command));
          if (matchedCommand !== undefined) {
            selectedCommand = matchedCommand.command;
          }
        }
      }

      const attachmentContent: string | undefined = this.promptAttachment?.lastAttachmentContent;

      // Trim prompt text with command selectedCommand exists
      const promptText = this.selectedCommand === '' && selectedCommand !== ''
        ? currentInputValue.replace(selectedCommand, '') + (attachmentContent ?? '')
        : currentInputValue + (attachmentContent ?? '');
      const context: string[] = [];

      const quickPickContextItems = (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('contextCommands') as QuickActionCommandGroup[]) ?? [];
      const allQuickPickContextItems = quickPickContextItems.flatMap(cntxGroup => cntxGroup.commands.map(cmd => cmd.command));
      const escapedPrompt = escapeHTML(promptText.replace(/@\S*/gi, (match) => {
        if (!context.includes(match) && allQuickPickContextItems.includes(match)) {
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
          ...(selectedCommand !== '' ? { command: selectedCommand } : {}),
        }
      };
      this.clearTextArea();
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CHAT_PROMPT, promptData);
    }
  };

  private readonly getPromptInputTextLabel = (promptInputLabel?: string): ExtendedHTMLElement => DomBuilder.getInstance().build({
    type: 'div',
    testId: testIds.prompt.label,
    classNames: [ 'mynah-chat-prompt-input-label' ],
    children: promptInputLabel != null && promptInputLabel.trim() !== ''
      ? [
          new CardBody({
            body: promptInputLabel
          }).render
        ]
      : []
  });

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
}
