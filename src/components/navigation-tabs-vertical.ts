/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIDataStore } from '../helper/store';
import { NavivationTabsProps } from './navigation-tabs';
import { Toggle, ToggleOption } from './toggle';

export class NavivationTabsVertical {
  render: ExtendedHTMLElement;
  private readonly props: NavivationTabsProps;

  constructor (props: NavivationTabsProps) {
    this.props = props;
    const tabs = MynahUIDataStore.getInstance().getValue('sideNavigationTabs');
    MynahUIDataStore.getInstance().subscribe('loading', this.setLoading);

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-nav-tabs-wrapper', ...(MynahUIDataStore.getInstance().getValue('loading') === true ? [ 'mynah-nav-tabs-loading' ] : []) ],
      children: this.getTabsRender(tabs),
    });

    MynahUIDataStore.getInstance().subscribe('sideNavigationTabs', (newTabs: ToggleOption[]) => {
      this.render.update({
        children: this.getTabsRender(newTabs)
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

  private readonly getTabsRender = (tabs: ToggleOption[]): ExtendedHTMLElement[] => tabs.length > 0
    ? [
        new Toggle({
          onChange: this.props.onChange,
          type: 'switch',
          name: 'mynah-side-nav-tabs',
          direction: 'vertical',
          options: tabs,
          value: tabs.find(tab => tab.selected)?.value
        }).render
      ]
    : [];
}
