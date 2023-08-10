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
      children: [
        new ChatItemCard({
          chatItem: {
            type: ChatItemType.PROMPT,
            relatedContent: {
              title: false,
              content: []
            },
            body: `<div>${MynahUIDataStore.getInstance().getValue('query') as string}</div>`
          }
        }).render
      ],
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

    MynahUIDataStore.getInstance().subscribe('query', (query) => {
      this.textBlock.clear();
      this.textBlock.update({
        children: [ new ChatItemCard({
          chatItem: {
            type: ChatItemType.PROMPT,
            relatedContent: {
              title: false,
              content: []
            },
            body: `<div>${query as string}</div>`
          }
        }).render ]
      });
    });
  }
}
