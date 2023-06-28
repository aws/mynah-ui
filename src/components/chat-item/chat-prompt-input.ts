/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { I18N } from '../../translations/i18n';
import { ChatItemType, KeyMap, MynahEventNames } from '../../static';
import { MynahUIGlobalEvents, cancelEvent } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';

export class ChatPromptInput {
  render: ExtendedHTMLElement;
  private readonly promptTextInput: ExtendedHTMLElement;
  private readonly sendButton: ExtendedHTMLElement;
  constructor () {
    const classNames = [ 'mynah-chat-prompt-input' ];

    this.promptTextInput = DomBuilder.getInstance().build({
      type: 'input',
      classNames,
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
          new Icon({ icon: MynahIcons.ENVELOPE_SEND }).render
        ],
      }),
      onClick: () => {
        this.triggerSearch();
      },
    }).render;

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-prompt-wrapper' ],
      children: [
        this.promptTextInput,
        this.sendButton,
      ],
    });
  }

  private readonly handleInputKeyup = (e: KeyboardEvent): void => {
    if (e.key === KeyMap.ENTER) {
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
          }
        ]
      });
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CHAT_PROMPT, this.promptTextInput.value);

      this.promptTextInput.setAttribute('placeholder', MynahUIDataStore.getInstance().getValue('chatItems').length > 0 ? I18N.getInstance().texts.chatPromptInputFollowUpPlaceholder : I18N.getInstance().texts.chatPromptInputPlaceholder);
      this.promptTextInput.value = '';
    }
  };
}
