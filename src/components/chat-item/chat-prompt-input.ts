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

export class ChatPromptInput {
  render: ExtendedHTMLElement;
  private readonly attachmentWrapper: ExtendedHTMLElement;
  private readonly promptTextInput: ExtendedHTMLElement;
  private readonly sendButton: ExtendedHTMLElement;
  private attachment?: Suggestion;
  constructor () {
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
        tabindex: '1',
        maxlength: '100000',
        type: 'text',
        placeholder: MynahUIDataStore.getInstance().getValue('chatItems').length > 0 ? I18N.getInstance().texts.chatPromptInputFollowUpPlaceholder : I18N.getInstance().texts.chatPromptInputPlaceholder,
        value: '',
      },
      events: {
        keyup: this.handleInputKeyup.bind(this),
      },
    });
    this.sendButton = new Button({
      classNames: [ 'mynah-icon-button', 'mynah-search-button' ],
      attributes: { tabindex: '5' },
      icon: DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-mutating-next-icon' ],
        children: [
          new Icon({ icon: MynahIcons.RIGHT_OPEN }).render
        ],
      }),
      onClick: () => {
        this.triggerSearch();
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
            this.sendButton
          ]
        },
        this.attachmentWrapper
      ],
    });
  }

  private readonly handleInputKeyup = (e: KeyboardEvent): void => {
    if (e.key === KeyMap.ENTER && !e.shiftKey) {
      cancelEvent(e);
      this.triggerSearch();
    }
  };

  private readonly triggerSearch = (): void => {
    if (this.promptTextInput.value.trim() !== '') {
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

      this.promptTextInput.setAttribute('placeholder', MynahUIDataStore.getInstance().getValue('chatItems').length > 0 ? I18N.getInstance().texts.chatPromptInputFollowUpPlaceholder : I18N.getInstance().texts.chatPromptInputPlaceholder);
      this.promptTextInput.value = '';
      this.attachmentWrapper.clear();
      this.attachment = undefined;
    }
  };
}
