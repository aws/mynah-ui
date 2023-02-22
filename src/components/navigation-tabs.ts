/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIDataStore } from '../helper/store';
import { Toggle, ToggleOption } from './toggle';

export interface NavivationTabsProps {
  onChange?: (selectedValue: string) => void;
}
export class NavivationTabs {
  render: ExtendedHTMLElement;
  private readonly props: NavivationTabsProps;

  constructor (props: NavivationTabsProps) {
    this.props = props;
    const tabs = MynahUIDataStore.getInstance().getValue('navigationTabs');
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-nav-tabs-wrapper', ...(MynahUIDataStore.getInstance().getValue('loading') === true ? [ 'mynah-nav-tabs-loading' ] : []) ],
      children: this.getTabsRender(tabs),
    });

    MynahUIDataStore.getInstance().subscribe('loading', (isLoading) => {
      if (isLoading === true) {
        this.render.addClass('mynah-nav-tabs-loading');
      } else {
        this.render.removeClass('mynah-nav-tabs-loading');
      }
    });

    MynahUIDataStore.getInstance().subscribe('navigationTabs', (newTabs: {selected?: string; tabs: ToggleOption[]}) => {
      this.render.update({
        children: this.getTabsRender(newTabs)
      });
    });
  }

  private readonly getTabsRender = (tabs: {selected?: string; tabs: ToggleOption[]}): ExtendedHTMLElement[] => tabs.tabs.length > 0
    ? [
        new Toggle({
          onChange: this.props.onChange,
          type: 'tabs',
          name: 'mynah-nav-tabs',
          options: tabs.tabs,
          value: tabs.selected
        }).render
      ]
    : [];
}
