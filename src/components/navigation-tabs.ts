/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUITabsStore } from '../helper/tabs-store';
import { Toggle, ToggleOption } from './toggle';

export interface TabsProps {
  onChange?: (selectedTabId: string) => void;
}
export class Tabs {
  render: ExtendedHTMLElement;
  private readonly props: TabsProps;

  constructor (props: TabsProps) {
    this.props = props;

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-nav-tabs-wrapper' ],
      children: this.getTabsRender(),
    });

    MynahUITabsStore.getInstance().addListener('add', () => {
      this.render.setAttribute('selected-tab', MynahUITabsStore.getInstance().getSelectedTabId());
      this.render.update({
        children: this.getTabsRender()
      });
    });
    MynahUITabsStore.getInstance().addListener('remove', () => {
      this.render.update({
        children: this.getTabsRender()
      });
    });
    MynahUITabsStore.getInstance().addListener('selectedTabChange', (selectedTabId) => {
      this.render.setAttribute('selected-tab', selectedTabId);
    });
  }

  private readonly getTabOptionsFromTabStoreData = (): ToggleOption[] => {
    const tabs = MynahUITabsStore.getInstance().getAllTabs();
    return Object.keys(tabs).map((tabId: string) => {
      const tabOption = {
        value: tabId,
        label: tabs[tabId].tabTitle,
        selected: tabs[tabId].isSelected
      };
      return tabOption;
    });
  };

  private readonly getTabsRender = (): ExtendedHTMLElement[] => {
    const tabs = this.getTabOptionsFromTabStoreData();
    return tabs.length > 0
      ? [
          new Toggle({
            onChange: (selectedTabId: string) => {
              MynahUITabsStore.getInstance().updateTab(selectedTabId, { isSelected: true });
              if (this.props.onChange !== undefined) {
                this.props.onChange(selectedTabId);
              }
            },
            type: 'tabs',
            name: 'mynah-main-tabs',
            options: tabs,
            value: MynahUITabsStore.getInstance().getSelectedTabId()
          }).render
        ]
      : [];
  };
}
