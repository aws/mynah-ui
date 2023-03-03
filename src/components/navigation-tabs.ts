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
    const selectedTab = MynahUIDataStore.getInstance().getValue('selectedNavigationTab');
    MynahUIDataStore.getInstance().subscribe('loading', this.setLoading);

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-nav-tabs-wrapper', ...(MynahUIDataStore.getInstance().getValue('loading') === true ? [ 'mynah-nav-tabs-loading' ] : []) ],
      children: this.getTabsRender(tabs, selectedTab),
    });

    MynahUIDataStore.getInstance().subscribe('navigationTabs', (newTabs: ToggleOption[]) => {
      this.render.update({
        children: this.getTabsRender(newTabs, MynahUIDataStore.getInstance().getValue('selectedNavigationTab'))
      });
    });
    MynahUIDataStore.getInstance().subscribe('selectedNavigationTab', (newSelectedTab?: string | null) => {
      this.render.update({
        children: this.getTabsRender(MynahUIDataStore.getInstance().getValue('navigationTabs'), newSelectedTab)
      });
    });
  }

  private readonly setLoading = (isLoading: boolean): void => {
    if (isLoading) {
      this.render.addClass('mynah-nav-tabs-loading');
    } else {
      this.render.removeClass('mynah-nav-tabs-loading');
    }
  };

  private readonly getTabsRender = (tabs: ToggleOption[], selected?: string | null): ExtendedHTMLElement[] => tabs.length > 0
    ? [
        new Toggle({
          onChange: this.props.onChange,
          type: 'tabs',
          name: 'mynah-nav-tabs',
          options: tabs,
          value: selected
        }).render
      ]
    : [];
}
