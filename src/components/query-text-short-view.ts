/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIDataStore } from '../helper/store';
import { ChatItemType } from '../static';
import { ChatItemCard } from './chat-item/chat-item-card';
export class QueryTextShortView {
  render: ExtendedHTMLElement;
  private readonly textBlock: ExtendedHTMLElement;
  constructor () {
    this.textBlock = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-query-text-short-view-text'
      ],
      children: [],
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-query-text-short-view'
      ],
      children: [
        this.textBlock
      ],
    });

    MynahUIDataStore.getInstance().subscribe('chatMessageOnTopOfSearchResults', (chatMessageOnTopOfSearchResults) => {
      this.textBlock.clear();
      if (chatMessageOnTopOfSearchResults !== '') {
        this.textBlock.update({
          children: [ new ChatItemCard({
            chatItem: {
              type: ChatItemType.PROMPT,
              relatedContent: {
                title: false,
                content: []
              },
              body: `<div>${chatMessageOnTopOfSearchResults as string}</div>`
            }
          }).render ]
        });
      } else {
        this.textBlock.update({
          children: []
        });
      }
    });
  }
}
