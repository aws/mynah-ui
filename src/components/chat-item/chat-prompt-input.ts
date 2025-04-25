/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatPrompt, FilterOption, KeyMap, MynahEventNames, PromptAttachmentType, QuickActionCommand, QuickActionCommandGroup } from '../../static';
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
import { convertDetailedListItemToQuickActionCommand, convertQuickActionCommandGroupsToDetailedListGroups, filterQuickPickItems, MARK_CLOSE, MARK_OPEN } from '../../helper/quick-pick-data-handler';
import { DetailedListWrapper } from '../detailed-list/detailed-list';
import { PromptOptions } from './prompt-input/prompt-options';
import { PromptInputStopButton } from './prompt-input/prompt-input-stop-button';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';

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
  onStopChatResponse?: (tabId: string) => void;
}

interface UserPrompt {
  inputText: string;
  codeAttachment: string;
}

export class ChatPromptInput {
  render: ExtendedHTMLElement;
  private readonly props: ChatPromptInputProps;
  private readonly attachmentWrapper: ExtendedHTMLElement;
  private readonly promptTextInput: PromptTextInput;
  private readonly contextSelectorButton: Button;
  private readonly promptTextInputCommand: ChatPromptInputCommand;
  private readonly sendButton: PromptInputSendButton;
  private readonly stopButton: PromptInputStopButton;
  private readonly progressIndicator: PromptInputProgress;
  private readonly promptAttachment: PromptAttachment;
  private readonly promptOptions: PromptOptions;
  private readonly chatPrompt: ExtendedHTMLElement;
  private quickPickItemsSelectorContainer: DetailedListWrapper;
  private promptTextInputLabel: ExtendedHTMLElement;
  private remainingCharsOverlay: Overlay;
  private quickPickTriggerIndex: number;
  private quickPickType: 'quick-action' | 'context';
  private quickPickItemGroups: QuickActionCommandGroup[];
  private filteredQuickPickItemGroups: QuickActionCommandGroup[];
  private searchTerm: string = '';
  private quickPick: Overlay;
  private quickPickOpen: boolean = false;
  private selectedCommand: string = '';
  private readonly userPromptHistory: UserPrompt[] = [];
  private userPromptHistoryIndex: number = -1;
  private lastUnsentUserPrompt: UserPrompt;
  private readonly markerRemovalRegex = new RegExp(`${MARK_OPEN}|${MARK_CLOSE}`, 'g');
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
      children: [ this.promptTextInputCommand.render ],
      onKeydown: this.handleInputKeydown,
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
    this.stopButton = new PromptInputStopButton({
      tabId: this.props.tabId,
      onClick: () => {
        if (this.props.onStopChatResponse != null) {
          this.props.onStopChatResponse(this.props.tabId);
        }
      },
    });
    this.progressIndicator = new PromptInputProgress({
      tabId: this.props.tabId,
    });

    this.promptAttachment = new PromptAttachment({
      tabId: this.props.tabId,
    });

    this.promptOptions = new PromptOptions({
      filterOptions: MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputOptions'),
      onFiltersChange: (formData) => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.PROMPT_INPUT_OPTIONS_CHANGE, {
          tabId: this.props.tabId,
          optionsValues: formData
        });
      }
    });

    this.attachmentWrapper = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.prompt.attachmentWrapper,
      classNames: [ 'mynah-chat-prompt-attachment-wrapper' ],
      children: [
        this.promptAttachment.render
      ]
    });

    this.contextSelectorButton = new Button({
      icon: new Icon({ icon: MynahIcons.AT }).render,
      status: 'clear',
      disabled: ((MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('contextCommands') as QuickActionCommandGroup[]) ?? []).length === 0,
      primary: false,
      onClick: () => {
        this.searchTerm = '';
        this.quickPickType = 'context';
        this.quickPickItemGroups = (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('contextCommands') as QuickActionCommandGroup[]) ?? [];
        this.quickPickTriggerIndex = this.promptTextInput.getCursorPos();
        this.filteredQuickPickItemGroups = [ ...this.quickPickItemGroups ];
        this.promptTextInput.insertEndSpace();
        this.openQuickPick();
      },
    });

    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'contextCommands', (contextCommands) => {
      if (contextCommands?.length > 0) {
        this.contextSelectorButton.setEnabled(true);
      } else {
        this.contextSelectorButton.setEnabled(false);
      }
    });
    this.chatPrompt = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt' ],
      children: [
        this.progressIndicator.render,
        this.chatPrompt,
        {
          type: 'div',
          classNames: [ 'mynah-chat-prompt-input-wrapper' ],
          children: [
            this.promptTextInput.render,
            {
              type: 'div',
              classNames: [ 'mynah-chat-prompt-button-wrapper' ],
              children: [
                this.promptOptions.render,
                this.contextSelectorButton.render,
                this.stopButton.render,
                this.sendButton.render,
              ]
            },
          ]
        },
        this.attachmentWrapper,
      ]
    });

    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'promptInputText', (promptInputText: string) => {
      if (this.promptTextInput.getTextInputValue() !== promptInputText) {
        this.promptTextInput.clear();
        this.promptTextInput.updateTextInputValue(promptInputText);
        setTimeout(() => {
          this.promptTextInput.focus();
        }, 750);
      }
    });
    MynahUITabsStore.getInstance().addListenerToDataStore(this.props.tabId, 'promptInputOptions', (newFilterOptions: FilterOption[]) => {
      this.promptOptions.update(newFilterOptions);
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
    const navigationalKeys = [ KeyMap.ARROW_UP, KeyMap.ARROW_DOWN ] as string[];

    if (e.key === KeyMap.ESCAPE && this.render.hasClass('awaits-confirmation')) {
      this.promptTextInput.blur();
    }
    if (!this.quickPickOpen) {
      if (e.key === KeyMap.BACKSPACE || e.key === KeyMap.DELETE) {
        if (this.selectedCommand !== '' && this.promptTextInput.getTextInputValue() === '') {
          cancelEvent(e);
          this.clearTextArea(true);
        }
      } else if (e.key === KeyMap.ENTER &&
        ((!e.isComposing && !e.shiftKey && !e.ctrlKey) ||
        (e.isComposing && (e.shiftKey)))) {
        cancelEvent(e);
        this.sendPrompt();
      } else if (
        (this.selectedCommand === '' && e.key === KeyMap.SLASH && this.promptTextInput.getTextInputValue() === '') ||
        (e.key === KeyMap.AT && this.promptTextInput.promptTextInputMaxLength > 0)
      ) {
        const quickPickContextItems = (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('contextCommands') as QuickActionCommandGroup[]) ?? [];
        const quickPickCommandItems = (MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[]) ?? [];
        this.searchTerm = '';
        this.quickPickType = e.key === KeyMap.AT ? 'context' : 'quick-action';
        this.quickPickItemGroups = this.quickPickType === 'context' ? quickPickContextItems : quickPickCommandItems;
        this.quickPickTriggerIndex = this.quickPickType === 'context' ? this.promptTextInput.getCursorPos() : 1;
        this.filteredQuickPickItemGroups = [ ...this.quickPickItemGroups ];
        this.openQuickPick();
      } else if (navigationalKeys.includes(e.key)) {
        const cursorPosition = this.promptTextInput.getCursorPosition();
        if ((cursorPosition.isAtTheBeginning && e.key === KeyMap.ARROW_UP) || (cursorPosition.isAtTheEnd && e.key === KeyMap.ARROW_DOWN)) {
          if (this.userPromptHistoryIndex === -1 || this.userPromptHistoryIndex === this.userPromptHistory.length) {
            this.lastUnsentUserPrompt = {
              inputText: this.promptTextInput.getTextInputValue(),
              codeAttachment: this.promptAttachment?.lastAttachmentContent ?? '',
            };
          }

          if (this.userPromptHistoryIndex === -1) {
            this.userPromptHistoryIndex = this.userPromptHistory.length;
          }

          if (e.key === KeyMap.ARROW_UP) {
            // Check if the cursor is on the first line or not
            this.userPromptHistoryIndex = Math.max(0, this.userPromptHistoryIndex - 1);
          } else if (e.key === KeyMap.ARROW_DOWN) {
            // Check if the cursor is on the last line or not
            this.userPromptHistoryIndex = Math.min(this.userPromptHistory.length, this.userPromptHistoryIndex + 1);
          }

          let codeAttachment = '';
          if (this.userPromptHistoryIndex === this.userPromptHistory.length) {
            this.promptTextInput.updateTextInputValue(this.lastUnsentUserPrompt.inputText ?? '');
            codeAttachment = this.lastUnsentUserPrompt.codeAttachment ?? '';
          } else {
            this.promptTextInput.updateTextInputValue(this.userPromptHistory[this.userPromptHistoryIndex].inputText);
            codeAttachment = this.userPromptHistory[this.userPromptHistoryIndex].codeAttachment ?? '';
          }
          codeAttachment = codeAttachment.trim();
          if (codeAttachment.length > 0) {
            // the way we mark code in our example mynah client
            if (codeAttachment.startsWith('~~~~~~~~~~') && codeAttachment.endsWith('~~~~~~~~~~')) {
              codeAttachment = codeAttachment
                .replace(/^~~~~~~~~~~/, '')
                .replace(/~~~~~~~~~~$/, '')
                .trim();
            } else if (codeAttachment.startsWith('```') && codeAttachment.endsWith('```')) {
              // the way code is marked in VScode and JetBrains extensions
              codeAttachment = codeAttachment
                .replace(/^```/, '')
                .replace(/```$/, '')
                .trim();
            }
            this.promptAttachment.updateAttachment(codeAttachment, 'code');
          } else {
            this.promptAttachment.clear();
          }
        }
      }
    } else {
      const blockedKeys = [ KeyMap.ENTER, KeyMap.ESCAPE, KeyMap.SPACE, KeyMap.TAB, KeyMap.AT, KeyMap.BACK_SLASH, KeyMap.SLASH ] as string[];
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        if (e.key === KeyMap.ESCAPE) {
          if (this.quickPickType === 'quick-action') {
            this.clearTextArea(true);
          }
          this.quickPick?.close();
        } else if (e.key === KeyMap.ENTER || e.key === KeyMap.TAB || e.key === KeyMap.SPACE) {
          this.searchTerm = '';
          const targetDetailedListItem = this.quickPickItemsSelectorContainer.getTargetElement();
          if (targetDetailedListItem != null) {
            const commandToSend = convertDetailedListItemToQuickActionCommand(targetDetailedListItem);
            if (this.quickPickType === 'context') {
              if (commandToSend.command !== '') {
                this.handleContextCommandSelection(commandToSend);
              } else {
                // Otherwise pass the given text by user
                const command = this.promptTextInput.getTextInputValue().substring(this.quickPickTriggerIndex, this.promptTextInput.getCursorPos());
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
        }
      } else if (navigationalKeys.includes(e.key)) {
        cancelEvent(e);
        this.quickPickItemsSelectorContainer.changeTarget(e.key === KeyMap.ARROW_UP ? 'up' : 'down', true, true);
      } else {
        if (this.quickPick != null) {
          if (this.promptTextInput.getTextInputValue() === '') {
            this.quickPick.close();
          } else {
            if (e.key === KeyMap.ARROW_LEFT || e.key === KeyMap.ARROW_RIGHT) {
              cancelEvent(e);
            } else {
              this.filteredQuickPickItemGroups = [];
              // In case the prompt is an incomplete regex
              try {
                if (e.key === KeyMap.BACKSPACE) {
                  const isAllSelected = window.getSelection()?.toString() === this.promptTextInput.getTextInputValue();
                  if (this.searchTerm === '' || isAllSelected) {
                    this.quickPick.close();
                  } else {
                    this.searchTerm = this.searchTerm.slice(0, -1);
                  }
                } else if ((!e.ctrlKey && !e.metaKey) && e.key.length === 1) {
                  this.searchTerm += e.key.toLowerCase();
                }
                this.filteredQuickPickItemGroups = filterQuickPickItems([ ...this.quickPickItemGroups ], this.searchTerm);
              } catch (e) {}
              if (this.filteredQuickPickItemGroups.length > 0) {
                this.quickPick.toggleHidden(false);
                this.quickPick.updateContent([ this.getQuickPickItemGroups(this.filteredQuickPickItemGroups) ]);
              } else {
              // If there's no matching action, hide the command selector overlay
                this.quickPick.toggleHidden(true);
              }
            }
          }
        }
      }
    }
  };

  private readonly openQuickPick = (): void => {
    if (this.quickPickItemGroups.length > 0) {
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
  };

  private readonly handleInputFocus = (): void => {
    // Show the character limit warning overlay if the threshold is hit
    this.updateAvailableCharactersIndicator();

    const inputValue = this.promptTextInput.getTextInputValue();
    if (inputValue.startsWith('/')) {
      const quickPickItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[];
      this.quickPickItemGroups = [ ...quickPickItems ];
      this.quickPickTriggerIndex = 1;
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

      this.filteredQuickPickItemGroups = [ ...restorePreviousFilteredQuickPickItemGroups ];
      this.openQuickPick();
    }
  };

  private readonly getQuickPickItemGroups = (quickPickGroupList: QuickActionCommandGroup[]): ExtendedHTMLElement => {
    const detailedListItemsGroup = convertQuickActionCommandGroupsToDetailedListGroups(quickPickGroupList);
    if (this.quickPickItemsSelectorContainer == null) {
      this.quickPickItemsSelectorContainer = new DetailedListWrapper({
        descriptionTextDirection: 'rtl',
        detailedList: {
          list: detailedListItemsGroup,
          selectable: true
        },
        onGroupActionClick: (action) => {
          this.promptTextInput.deleteTextRange(this.quickPickTriggerIndex, this.promptTextInput.getCursorPos());
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.QUICK_COMMAND_GROUP_ACTION_CLICK, {
            tabId: this.props.tabId,
            actionId: action.id
          });
        },
        onItemSelect: (detailedListItem) => {
          const quickPickCommand: QuickActionCommand = convertDetailedListItemToQuickActionCommand(detailedListItem);
          if (this.quickPickType === 'context') {
            this.handleContextCommandSelection(quickPickCommand);
          } else {
            this.handleQuickActionCommandSelection(quickPickCommand, 'click');
          }
        },
      });
    } else {
      this.quickPickItemsSelectorContainer.update({
        list: detailedListItemsGroup
      });
    }
    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-quick-picks-overlay-wrapper' ],
      children: [
        this.quickPickItemsSelectorContainer.render
      ]
    });
  };

  private readonly handleQuickActionCommandSelection = (
    dirtyQuickActionCommand: QuickActionCommand,
    method: 'enter' | 'tab' | 'space' | 'click'): void => {
    const quickActionCommand = {
      ...dirtyQuickActionCommand,
      command: dirtyQuickActionCommand.command.replace(this.markerRemovalRegex, '')
    };

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

  private readonly handleContextCommandSelection = (dirtyContextCommand: QuickActionCommand): void => {
    const contextCommand: QuickActionCommand = {
      ...dirtyContextCommand,
      command: dirtyContextCommand.command.replace(this.markerRemovalRegex, '')
    };
    // Check if the selected command has children
    if (contextCommand.children?.[0] != null) {
      this.promptTextInput.deleteTextRange(this.quickPickTriggerIndex + 1, this.promptTextInput.getCursorPos());
      this.quickPickItemGroups = [ ...contextCommand.children ];
      this.quickPick.updateContent([
        this.getQuickPickItemGroups(contextCommand.children)
      ]);
    } else {
      this.quickPick.close();
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CONTEXT_SELECTED, {
        contextItem: contextCommand,
        tabId: this.props.tabId,
        promptInputCallback: (insert: boolean) => {
          if (insert) {
            this.promptTextInput.insertContextItem({
              ...contextCommand,
            }, this.quickPickTriggerIndex);
          } else {
            this.promptTextInput.deleteTextRange(this.quickPickTriggerIndex, this.promptTextInput.getCursorPos());
          }
        }
      });
    }
  };

  private readonly sendPrompt = (): void => {
    const quickPickItems = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[];
    const currentInputValue = this.promptTextInput.getTextInputValue();
    if (currentInputValue !== '' || this.selectedCommand.trim() !== '') {
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
      const context: QuickActionCommand[] = this.promptTextInput.getUsedContext();

      const escapedPrompt = escapeHTML(promptText.replace(/@\S*/gi, (match) => {
        // Unnecessary spaces will be removed by HTML rendering,
        // it is safe to add a start space to avoid rendering problems for bold text
        return ` **${match}**`;
      }));

      const promptData: {tabId: string; prompt: ChatPrompt} = {
        tabId: this.props.tabId,
        prompt: {
          prompt: promptText,
          escapedPrompt,
          context,
          options: this.promptOptions.getOptionValues() ?? {},
          ...(selectedCommand !== '' ? { command: selectedCommand } : {}),
        }
      };
      this.clearTextArea();

      if (currentInputValue !== '') {
        this.userPromptHistory.push({
          inputText: currentInputValue,
          codeAttachment: attachmentContent ?? '',
        });
      }

      this.lastUnsentUserPrompt = {
        inputText: '',
        codeAttachment: '',
      };

      this.userPromptHistoryIndex = -1;
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
    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).updateStore({
      promptInputText: '',
    });
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
