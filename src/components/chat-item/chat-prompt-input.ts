/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { I18N } from '../../translations/i18n';
import { ChatItemType, KeyMap, MynahEventNames, Suggestion } from '../../static';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';
import { SuggestionCard } from '../suggestion-card/suggestion-card';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';

export interface CharPromptInputProps {
  showFeedbackButton?: boolean;
}
export class ChatPromptInput {
  render: ExtendedHTMLElement;
  private readonly attachmentWrapper: ExtendedHTMLElement;
  private readonly promptTextInputWrapper: ExtendedHTMLElement;
  private readonly promptTextInput: ExtendedHTMLElement;
  private readonly promptTextInputSizer: ExtendedHTMLElement;
  private readonly sendButton: ExtendedHTMLElement;
  private readonly clearButton: ExtendedHTMLElement;
  private loading: boolean;
  private attachment?: Suggestion;
  constructor (props?: CharPromptInputProps) {
    this.loading = MynahUIDataStore.getInstance().getValue('loadingChat') as boolean;
    MynahUIDataStore.getInstance().subscribe('loadingChat', (newLoadingValue: boolean) => {
      this.loading = newLoadingValue;
      if (newLoadingValue) {
        console.log('setting placeholder to ...');
        this.promptTextInput.setAttribute('placeholder', '...');
        this.promptTextInput.setAttribute('disabled', 'disabled');
        this.clearButton.setAttribute('disabled', 'disabled');
        this.sendButton.setAttribute('disabled', 'disabled');
      } else {
        const placeHolder = MynahUIDataStore.getInstance().getValue('chatItems').length > 0 ? I18N.getInstance().texts.chatPromptInputFollowUpPlaceholder : I18N.getInstance().texts.chatPromptInputPlaceholder;
        this.promptTextInput.setAttribute('placeholder', placeHolder);
        this.promptTextInput.removeAttribute('disabled');
        this.sendButton.removeAttribute('disabled');
        this.clearButton.removeAttribute('disabled');
      }
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
      attributes: {
        ...(this.loading ? { disabled: 'disabled' } : {}),
      },
    });
    this.promptTextInput = DomBuilder.getInstance().build({
      type: 'textarea',
      classNames: [ 'mynah-chat-prompt-input' ],
      attributes: {
        ...(this.loading ? { disabled: 'disabled' } : {}),
        tabindex: '1',
        rows: '1',
        maxlength: '100000',
        type: 'text',
        placeholder: MynahUIDataStore.getInstance().getValue('chatItems').length > 0 ? I18N.getInstance().texts.chatPromptInputFollowUpPlaceholder : I18N.getInstance().texts.chatPromptInputPlaceholder,
        value: '',
      },
      events: {
        keydown: this.handleInputKeydown,
        input: this.calculateTextAreaHeight,
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
        ...(this.loading ? { disabled: 'disabled' } : {}),
        tabindex: '5'
      },
      icon: new Icon({ icon: MynahIcons.ENVELOPE_SEND }).render,
      onClick: () => {
        this.sendPrompt();
      },
    }).render;
    this.clearButton = new Button({
      primary: false,
      classNames: [ 'mynah-icon-button' ],
      attributes: {
        ...(this.loading ? { disabled: 'disabled' } : {}),
        tabindex: '4'
      },
      icon: new Icon({ icon: MynahIcons.ELLIPSIS }).render,
      onClick: (e) => {
        const elm: HTMLElement = e.currentTarget as HTMLElement;
        this.render.addClass('keep-active');
        const menuOverlay = new Overlay({
          referenceElement: elm,
          dimOutside: false,
          verticalDirection: OverlayVerticalDirection.TO_TOP,
          horizontalDirection: OverlayHorizontalDirection.CENTER,
          children: [
            {
              type: 'div',
              classNames: [ 'mynah-chat-prompt-overlay-buttons-container' ],
              children: [
                ...(props?.showFeedbackButton === true
                  ? [ new Button({
                      primary: false,
                      onClick: (e: Event) => {
                        cancelEvent(e);
                        menuOverlay.close();
                        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SHOW_FEEDBACK_FORM_CLICK);
                      },
                      label: DomBuilder.getInstance().build({
                        type: 'span',
                        innerHTML: 'Send feedback',
                      }),
                    }).render ]
                  : []),
                new Button({
                  primary: false,
                  onClick: (e: Event) => {
                    cancelEvent(e);
                    menuOverlay.close();
                    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CLEAR_CHAT);
                  },
                  label: DomBuilder.getInstance().build({
                    type: 'span',
                    innerHTML: 'Clear chat',
                  }),
                }).render,
                new Button({
                  primary: false,
                  onClick: (e: Event) => {
                    cancelEvent(e);
                  },
                  attributes: { disabled: 'disabled' },
                  label: DomBuilder.getInstance().build({
                    type: 'span',
                    innerHTML: 'Start new chat',
                  }),
                }).render,
              ]
            }
          ],
        });
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
            this.clearButton,
            this.sendButton,
          ]
        },
        this.attachmentWrapper
      ],
    });
  }

  private readonly handleInputKeydown = (e: KeyboardEvent): void => {
    if (e.key === KeyMap.ENTER && !e.shiftKey) {
      cancelEvent(e);
      this.sendPrompt();
    } else if (e.key === KeyMap.ENTER && e.shiftKey) {
      this.promptTextInput.value = this.promptTextInput.value + ' ';
      setTimeout(() => {
        this.calculateTextAreaHeight();
      }, 10);
    }
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
      this.attachmentWrapper.clear();
      this.attachment = undefined;
    }
  };
}
