/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahEventNames, SearchHistoryItem } from '../../static';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';
import { HistoryCardContent } from './search-history-card';

export interface HistoryContentProps {
  referenceElement: Element | ExtendedHTMLElement;
  searchHistory: SearchHistoryItem[];
}
export class HistoryContent {
  private historyItemsOverlay!: Overlay;
  private readonly props: HistoryContentProps;
  render!: ExtendedHTMLElement;
  constructor (props: HistoryContentProps) {
    this.props = props;
  }

  public createOverlay (): void {
    this.historyItemsOverlay = new Overlay({
      referenceElement: this.props.referenceElement,
      verticalDirection: OverlayVerticalDirection.TO_BOTTOM,
      horizontalDirection: OverlayHorizontalDirection.END_TO_LEFT,
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-search-history-items-wrapper' ],
          children: this.searchHistoryCards(this.props.searchHistory),
        },
      ],
    });
  }

  searchHistoryCards = (historyItems: SearchHistoryItem[]): ExtendedHTMLElement[] =>
    historyItems.map(
      record =>
        new HistoryCardContent({
          content: record,
          onHistoryItemClick: this.handleHistoryChange,
        }).render
    );

  private readonly handleHistoryChange = (historyItem: SearchHistoryItem): void => {
    this.historyItemsOverlay.close();
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SEARCH_HISTORY_ITEM_CLICK, {
      historyItem
    });
  };
}
