/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { I18N } from '../../translations/i18n';
import { ChatItemType, KeyMap, MynahEventNames, QuickActionCommandGroup, Suggestion } from '../../static';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';
import { SuggestionCard } from '../suggestion-card/suggestion-card';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';

export class ChatPromptInput {
  render: ExtendedHTMLElement;
  private readonly attachmentWrapper: ExtendedHTMLElement;
  private readonly promptTextInputWrapper: ExtendedHTMLElement;
  private readonly promptTextInput: ExtendedHTMLElement;
  private readonly promptTextInputSizer: ExtendedHTMLElement;
  private readonly sendButton: ExtendedHTMLElement;
  private readonly quickActionCommands: QuickActionCommandGroup[];
  private commandSelector: Overlay;
  private commandSelectorOpen: boolean = false;
  private inputDisabled: boolean;
  private attachment?: Suggestion;
  private filteredCommandsList: QuickActionCommandGroup[];
  constructor () {
    this.inputDisabled = MynahUIDataStore.getInstance().getValue('promptInputDisabledState') as boolean;
    this.quickActionCommands = MynahUIDataStore.getInstance().getValue('quickActionCommands') as QuickActionCommandGroup[];
    MynahUIDataStore.getInstance().subscribe('promptInputDisabledState', (isDisabled: boolean) => {
      this.inputDisabled = isDisabled;
      if (isDisabled) {
        this.promptTextInput.setAttribute('disabled', 'disabled');
        this.sendButton.setAttribute('disabled', 'disabled');
      } else {
        this.promptTextInput.removeAttribute('disabled');
        this.sendButton.removeAttribute('disabled');
      }
    });
    MynahUIDataStore.getInstance().subscribe('promptInputPlaceholder', (placeholderText: string) => {
      this.promptTextInput.setAttribute('placeholder', placeholderText);
    });
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SUGGESTION_ATTACHED_TO_CHAT, (suggestion: Suggestion) => {
      this.attachment = suggestion;
      this.attachmentWrapper.insertChild('beforeend', DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-chat-attachment-item' ],
        events: {
          click: () => {
            this.attachmentWrapper.clear();
            this.attachment = undefined;
          }
        },
        children: [
          {
            type: 'div',
            classNames: [ 'mynah-chat-attachment-delete-icon' ],
            children: [
              new Icon({ icon: MynahIcons.CANCEL }).render
            ]
          },
          new SuggestionCard({
            suggestion: {
              ...suggestion,
              body: ''
            },
            compact: true
          }).render
        ]
      }));
      this.promptTextInput.value = I18N.getInstance().texts.limitByUrl;
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
        placeholder: MynahUIDataStore.getInstance().getValue('promptInputPlaceholder'),
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

    this.attachmentWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-attachment-wrapper' ],
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-wrapper' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-chat-prompt-input-wrapper' ],
          children: [
            this.promptTextInputWrapper,
            this.sendButton,
          ]
        },
        this.attachmentWrapper
      ],
    });
  }

  private readonly handleInputKeydown = (e: KeyboardEvent): void => {
    if (!this.commandSelectorOpen) {
      if (e.key === KeyMap.ENTER && !e.shiftKey) {
        cancelEvent(e);
        this.sendPrompt();
      } else if (e.key === KeyMap.ENTER && e.shiftKey) {
        this.promptTextInput.value = this.promptTextInput.value + ' ';
        setTimeout(() => {
          this.calculateTextAreaHeight();
        }, 10);
      } else if (this.quickActionCommands.length > 0 && e.key === KeyMap.SLASH && this.promptTextInput.value === '') {
        // will show prompt list
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
          children: [
            this.getQuickCommandActions(this.quickActionCommands)
          ],
        });

        this.commandSelectorOpen = true;
      }
    } else {
      const blockedKeys = [ KeyMap.ENTER, KeyMap.ESCAPE, KeyMap.SPACE, KeyMap.TAB ] as string[];
      const navigationalKeys = [ KeyMap.ARROW_UP, KeyMap.ARROW_DOWN ] as string[];
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        if ((e.key === KeyMap.ENTER || e.key === KeyMap.TAB) && this.commandSelector.render.querySelectorAll('.target-command').length === 0) {
          this.promptTextInput.value = this.commandSelector.render.querySelector('.mynah-chat-command-selector-command')?.getAttribute('command') ?? this.promptTextInput.value;
        }
        this.promptTextInput.value = this.promptTextInput.value + ' ';
        if (this.commandSelector !== undefined) {
          this.commandSelector.close();
        }
        this.commandSelectorOpen = false;
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
        this.promptTextInput.value = commandElements[nextElement].getAttribute('command') ?? this.promptTextInput.value;
      } else {
        if (this.commandSelector !== undefined) {
          setTimeout(() => {
            if (this.promptTextInput.value === '') {
              this.commandSelector.close();
              this.commandSelectorOpen = false;
            } else {
              this.filteredCommandsList = [];
              [ ...this.quickActionCommands ].forEach((quickActionGroup: QuickActionCommandGroup) => {
                const newQuickActionCommandGroup = { ...quickActionGroup };
                newQuickActionCommandGroup.commands = newQuickActionCommandGroup.commands.filter(command => command.command.substring(1).match(this.promptTextInput.value.substring(1)));
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
                  command: quickActionCommand.command,
                  prompt: quickActionCommand.promptText ?? ''
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

  private readonly calculateTextAreaHeight = (): void => {
    if (this.promptTextInput.value.trim() !== '') {
      this.promptTextInputWrapper.removeClass('no-text');
    } else {
      this.promptTextInputWrapper.addClass('no-text');
    }
    this.promptTextInputSizer.innerHTML = this.promptTextInput.value.replace(/\r?\n/g, '</br>');
  };

  private readonly resetTextAreaHeight = (): void => {
    this.promptTextInputSizer.innerHTML = '';
  };

  private readonly sendPrompt = (): void => {
    if (this.promptTextInput.value.trim() !== '') {
      this.resetTextAreaHeight();
      MynahUIDataStore.getInstance().updateStore({
        chatItems: [
          ...MynahUIDataStore.getInstance().getValue('chatItems'),
          {
            type: ChatItemType.PROMPT,
            body: `<span>${this.promptTextInput.value}</span>`,
            ...(this.attachment !== undefined
              ? {
                  relatedContent: {
                    title: false,
                    content: [ this.attachment ]
                  }
                }
              : {})
          }
        ]
      });
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CHAT_PROMPT, { prompt: this.promptTextInput.value, attachment: this.attachment });

      this.promptTextInput.value = '';
      this.promptTextInputWrapper.addClass('no-text');
      this.attachmentWrapper.clear();
      this.attachment = undefined;
    }
  };
}
