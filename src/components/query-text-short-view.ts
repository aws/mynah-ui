/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIDataStore } from '../helper/store';
import { Icon, MynahIcons } from './icon';
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
        MynahUIDataStore.getInstance().getValue('query')
      ],
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-query-text-short-view'
      ],
      children: [
        new Icon({ icon: MynahIcons.SEARCH }).render,
        this.textBlock
      ],
    });

    MynahUIDataStore.getInstance().subscribe('query', (query) => {
      this.textBlock.clear();
      this.textBlock.update({ children: [ query ] });
    });
  }
}
