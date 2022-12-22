/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getTimeDiff } from '../../helper/date-time';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent } from '../../helper/events';
import {
  SearchPayloadMatchPolicy,
  ContextTypeClassNames,
  SearchHistoryItem
} from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';

export interface HistoryCardContentProps {
  content: SearchHistoryItem;
  onHistoryItemClick: (historyItem: SearchHistoryItem) => void;
}
export class HistoryCardContent {
  render: ExtendedHTMLElement;
  openSearch: any;

  private getSearchHitoryRecordTitle (historyItem: SearchHistoryItem): string {
    const titleParts = [];

    if (historyItem.query !== undefined && historyItem.query.input !== '') {
      titleParts.push(historyItem.query.input);
    }

    if (historyItem.query.codeSelection?.file !== undefined && historyItem.query.codeSelection.file.name !== '') {
      titleParts.push(
                `${historyItem.query.codeSelection.file.range.start.row}:${historyItem.query.codeSelection.file.range.start.column}`
      );
      titleParts.push(historyItem.query.codeSelection.file.name.split('/').pop());
    }

    return titleParts.join(' ');
  }

  constructor (props: HistoryCardContentProps) {
    let icon = [];

    switch (props.content.query.trigger) {
      case 'SearchBarInput':
      case 'SearchBarRefinement':
        icon = [
          new Icon({
            icon: MynahIcons.USER,
          }).render,
        ];
        break;
      case 'CodeSelection':
        icon = [
          new Icon({
            icon: MynahIcons.CODE_BLOCK,
          }).render,
        ];
        break;
      default:
        icon = [
          new Icon({
            icon: MynahIcons.LIGHT_BULB,
          }).render,
        ];
        break;
    }

    this.render = new Button({
      classNames: [ 'mynah-search-history-button' ],
      onClick: (e: Event) => {
        cancelEvent(e);
        props.onHistoryItemClick(props.content);
      },
      label: DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-search-history-button-label' ],
        children: [
          {
            type: 'div',
            classNames: [ 'mynah-search-history-trigger-icon' ],
            children: [ ...icon ],
          },
          {
            type: 'div',
            classNames: [ 'mynah-search-history-title-wrapper' ],
            children: [
              {
                type: 'h3',
                innerHTML: this.getSearchHitoryRecordTitle(props.content),
              },
              {
                type: 'span',
                innerHTML: props.content.recordDate !== undefined
                  ? `${getTimeDiff(
                      new Date().getTime() - props.content.recordDate
                    ).toString()} ago`
                  : '',
              },
            ],
          },
          {
            type: 'div',
            classNames: [ 'mynah-search-history-item-context-wrapper' ],
            children: Object.keys(props.content.query.queryContext).map((policyGroup: string) => {
              if (
                props.content.query.queryContext[policyGroup as keyof SearchPayloadMatchPolicy].length >
                                0
              ) {
                return DomBuilder.getInstance().build({
                  type: 'span',
                  classNames: [
                    'mynah-context-pill',
                    ContextTypeClassNames[policyGroup as keyof SearchPayloadMatchPolicy],
                  ],
                  children: [
                    {
                      type: 'label',
                      classNames: [ 'mynah-context-checkbox-label' ],
                      children: [
                        {
                          type: 'span',
                          innerHTML: props.content.query.queryContext[
                            policyGroup as keyof SearchPayloadMatchPolicy
                          ].length.toString(),
                        },
                      ],
                    },
                  ],
                });
              }
              return '';
            }),
          },
        ],
      }),
    }).render;
  }
}
