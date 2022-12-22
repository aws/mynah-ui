/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';
import { LiveSearchState, MynahEventNames } from '../../static';
import { Icon, MynahIcons } from '../icon';
import { Toggle } from '../toggle';

const LiveSearchStateColors = {
  [LiveSearchState.PAUSE]: 'var(--mynah-color-status-warning)',
  [LiveSearchState.RESUME]: 'var(--mynah-color-status-success)',
};

export interface SearchLiveToggleProps {
  label: string;
}
export class SearchLiveToggle {
  render: ExtendedHTMLElement;
  private readonly toggle: Toggle;
  private queryChangeSubscriptionId: string | undefined;

  constructor (props: SearchLiveToggleProps) {
    const initialValue = MynahUIDataStore.getInstance().getValue('liveSearchState');
    this.toggle = new Toggle({
      name: 'mynah-implicit-search',
      value: initialValue,
      options: [
        {
          label: new Icon({ icon: MynahIcons.PLAY }).render,
          value: LiveSearchState.RESUME,
          color: LiveSearchStateColors[LiveSearchState.RESUME],
        },
        {
          label: new Icon({ icon: MynahIcons.PAUSE }).render,
          value: LiveSearchState.PAUSE,
          color: LiveSearchStateColors[LiveSearchState.PAUSE],
        },
      ],
      onChange: value => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.LIVE_SEARCH_STATE_CHANGED, {
          liveSearchState: value as LiveSearchState.RESUME | LiveSearchState.PAUSE
        });
      },
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-search-live-toggle-wrapper',
        ...(initialValue === LiveSearchState.STOP ? [ 'mynah-hide-content' ] : []) ],
      children: [ { type: 'b', children: [ props.label ] }, this.toggle.render ],
    });

    if (MynahUIDataStore.getInstance().getValue('liveSearchState') !== LiveSearchState.STOP) {
      this.queryChangeSubscriptionId = MynahUIDataStore.getInstance().subscribe('query', this.flashToggle);
    }
    this.queryChangeSubscriptionId = MynahUIDataStore.getInstance().subscribe('query', this.flashToggle);

    MynahUIDataStore.getInstance().subscribe('liveSearchState', (newState: LiveSearchState) => {
      if (newState !== this.toggle.getValue()) {
        if (newState === LiveSearchState.STOP) {
          this.render.addClass('mynah-hide-content');
          if (this.queryChangeSubscriptionId !== undefined) {
            MynahUIDataStore.getInstance().unsubscribe('query', this.queryChangeSubscriptionId);
            this.queryChangeSubscriptionId = undefined;
          }
        } else {
          this.render.removeClass('mynah-hide-content');
          this.toggle.setValue(newState);
          if (this.queryChangeSubscriptionId === undefined) {
            this.queryChangeSubscriptionId = MynahUIDataStore.getInstance().subscribe('query', this.flashToggle);
          }
        }
      }
    });
  }

  flashToggle = (): void => {
    this.render.removeClass('flash-toggle');
    setTimeout(() => {
      this.render.addClass('flash-toggle');
    }, 100);
  };
}
