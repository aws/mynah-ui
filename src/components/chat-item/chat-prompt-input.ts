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
  onStopChatResponse?: () => void;
}
export class ChatPromptInput {
  render: ExtendedHTMLElement;
  private readonly attachmentWrapper: ExtendedHTMLElement;
  private readonly promptTextInput: ExtendedHTMLElement;
  private sendButton: ExtendedHTMLElement;
  private readonly clearButton: ExtendedHTMLElement;
  private readonly loading: boolean;
  private readonly onStopChatResponse = (): void => {};
  private attachment?: Suggestion;
  constructor (props?: CharPromptInputProps) {
    this.onStopChatResponse = () => {
      if (props?.onStopChatResponse !== undefined) {
        props?.onStopChatResponse();
        const newButton = this.getButton(false, false);
        this.sendButton.replaceWith(newButton);
        this.sendButton = newButton;
      }
    };
    this.loading = MynahUIDataStore.getInstance().getValue('loadingChat') as boolean;
    MynahUIDataStore.getInstance().subscribe('chatItems', (chatItems) => {
      this.promptTextInput.setAttribute('placeholder', chatItems.length > 0 ? I18N.getInstance().texts.chatPromptInputFollowUpPlaceholder : I18N.getInstance().texts.chatPromptInputPlaceholder);
    });
    MynahUIDataStore.getInstance().subscribe('loadingChat', (newLoadingValue: boolean) => {
      if (newLoadingValue) {
        this.promptTextInput.setAttribute('placeholder', '...');
        this.promptTextInput.setAttribute('disabled', 'disabled');
        this.clearButton.setAttribute('disabled', 'disabled');
      } else {
        const placeHolder = MynahUIDataStore.getInstance().getValue('chatItems').length > 0 ? I18N.getInstance().texts.chatPromptInputFollowUpPlaceholder : I18N.getInstance().texts.chatPromptInputPlaceholder;
        this.promptTextInput.setAttribute('placeholder', placeHolder);
        this.promptTextInput.removeAttribute('disabled');
        this.clearButton.removeAttribute('disabled');
      }

      const newButton = this.getButton(newLoadingValue, props?.onStopChatResponse !== undefined);
      this.sendButton.replaceWith(newButton);
      this.sendButton = newButton;
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
        keydown: this.handleInputKeyup.bind(this),
        keyup: (e) => {
          const element = (e.target as HTMLTextAreaElement);
          element.style.height = `${(element.scrollHeight)}px`;
        }
      },
    });
    this.sendButton = this.getButton(this.loading, props?.onStopChatResponse !== undefined);
    this.clearButton = new Button({
      primary: false,
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
            this.promptTextInput,
            this.clearButton,
            this.sendButton,
          ]
        },
        this.attachmentWrapper
      ],
    });
  }

  private readonly getButton = (loading: boolean, isStoppable: boolean): ExtendedHTMLElement => new Button({
    classNames: [ 'mynah-icon-button', 'mynah-search-button', ...(loading && isStoppable ? [ 'mynah-search-button-cancel-state' ] : []) ],
    attributes: {
      ...(loading && !isStoppable ? { disabled: 'disabled' } : {}),
      tabindex: '5'
    },
    icon: DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-mutating-next-icon' ],
      children: [
        new Icon({ icon: loading && isStoppable ? MynahIcons.CANCEL : MynahIcons.RIGHT_OPEN }).render
      ],
    }),
    onClick: () => {
      if (isStoppable && loading) {
        this.onStopChatResponse();
      } else {
        this.triggerSearch();
      }
    },
  }).render;

  private readonly handleInputKeyup = (e: KeyboardEvent): void => {
    if (e.key === KeyMap.ENTER && !e.shiftKey) {
      cancelEvent(e);
      this.triggerSearch();
    }
  };

  private readonly resetTextAreaHeight = (): void => {
    this.promptTextInput.style.height = 'initial';
  };

  private readonly triggerSearch = (): void => {
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
