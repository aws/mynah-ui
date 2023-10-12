/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { ChatItemType, KeyMap, MynahEventNames, QuickActionCommandGroup, Suggestion } from '../../static';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';
import { MynahUITabsStore } from '../../helper/tabs-store';

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
  private readonly sendButton: ExtendedHTMLElement;
  private quickActionCommands: QuickActionCommandGroup[];
  private commandSelector: Overlay;
  private commandSelectorOpen: boolean = false;
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

    setTimeout(() => {
      this.promptTextInput.focus();
    }, 100);
  }

  private readonly handleInputKeydown = (e: KeyboardEvent): void => {
    if (!this.commandSelectorOpen) {
      this.quickActionCommands = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('quickActionCommands') as QuickActionCommandGroup[];
      if (e.key === KeyMap.ENTER && !e.shiftKey && !e.ctrlKey) {
        cancelEvent(e);
        this.sendPrompt();
      } else if (e.key === KeyMap.ENTER && (e.shiftKey || e.ctrlKey)) {
        cancelEvent(e);
        this.promptTextInput.value = `${this.promptTextInput.value}\n`;
        setTimeout(() => {
          this.calculateTextAreaHeight(true);
        }, 10);
      } else if (this.quickActionCommands.length > 0 && e.key === KeyMap.SLASH && this.promptTextInput.value === '') {
        // update the prompt list every time
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
      const blockedKeys = [ KeyMap.ENTER, KeyMap.ESCAPE, KeyMap.SPACE, KeyMap.TAB ] as string[];
      const navigationalKeys = [ KeyMap.ARROW_UP, KeyMap.ARROW_DOWN ] as string[];
      if (blockedKeys.includes(e.key)) {
        e.preventDefault();
        if ((e.key === KeyMap.ENTER || e.key === KeyMap.TAB) && this.commandSelector.render.querySelectorAll('.target-command').length === 0) {
          this.promptTextInput.value = this.commandSelector.render.querySelector('.mynah-chat-command-selector-command')?.getAttribute('prompt') ?? this.promptTextInput.value;
        }
        this.promptTextInput.value = this.promptTextInput.value + ' ';
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
                  prompt: quickActionCommand.promptText ?? quickActionCommand.command
                },
                events: {
                  click: () => {
                    this.promptTextInput.value = `${quickActionCommand.command} `;
                    this.commandSelector.close();
                    this.promptTextInput.focus();
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

  private readonly sendPrompt = (): void => {
    if (this.promptTextInput.value.trim() !== '') {
      this.resetTextAreaHeight();
      MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).updateStore({
        chatItems: [
          ...MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('chatItems'),
          {
            type: ChatItemType.PROMPT,
            body: `<span markdown="1">${this.promptTextInput.value}\n</span>`,
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
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CHAT_PROMPT, { tabId: this.props.tabId, prompt: { prompt: this.promptTextInput.value, attachment: this.attachment } });

      this.promptTextInput.value = '';
      this.promptTextInputWrapper.addClass('no-text');
      this.attachmentWrapper.clear();
      this.attachment = undefined;
    }
  };
}
