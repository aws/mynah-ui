/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextSource, ContextTypes, SearchPayloadMatchPolicy } from '../../static';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ContextPill } from '../context-item';
import { MynahUIDataStore } from '../../helper/store';

export interface SuggestionCardContextWrapperProps {
  contextList: string[];
}
export class SuggestionCardContextWrapper {
  render: ExtendedHTMLElement;
  constructor (props: SuggestionCardContextWrapperProps) {
    const mustContextItems = (MynahUIDataStore.getInstance().getValue('matchPolicy') as SearchPayloadMatchPolicy).must;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-context-wrapper' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-card-tags' ],
          children: props.contextList.map((context: string) => new ContextPill({
            context: {
              context,
              source: ContextSource.SUGGESTION,
              type: mustContextItems.includes(context) ? ContextTypes.MUST : ContextTypes.SHOULD
            },
          }).render),
        },
      ],
    });
  }
}
