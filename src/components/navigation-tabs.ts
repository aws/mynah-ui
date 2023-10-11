/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { cancelEvent } from '../helper/events';
import { MynahUITabsStore } from '../helper/tabs-store';
import { MynahUITabStoreTab } from '../static';
import { Button } from './button';
import { Icon, MynahIcons } from './icon';
import { Toggle, ToggleOption } from './toggle';

export interface TabsProps {
  onChange?: (selectedTabId: string) => void;
}
export class Tabs {
  render: ExtendedHTMLElement;
  private toggleGroup: Toggle;
  private readonly props: TabsProps;

  constructor (props: TabsProps) {
    this.props = props;

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-nav-tabs-wrapper' ],
      events: {
        dblclick: (e) => {
          cancelEvent(e);
          MynahUITabsStore.getInstance().addTab();
        }
      },
      children: this.getTabsRender(MynahUITabsStore.getInstance().getSelectedTabId()),
    });

    MynahUITabsStore.getInstance().addListener('add', (tabId, tabData) => {
      /* this.render.update({
        children: this.getTabsRender(tabId)
      }); */

      this.toggleGroup.addOption({
        value: tabId,
        label: tabData?.tabTitle,
        selected: tabData?.isSelected
      });
      this.render.setAttribute('selected-tab', tabId);
    });
    MynahUITabsStore.getInstance().addListener('remove', (tabId, newSelectedTab?: MynahUITabStoreTab) => {
      /* this.render.update({
        children: this.getTabsRender(MynahUITabsStore.getInstance().getSelectedTabId())
      }); */
      this.toggleGroup.removeOption(tabId);
      if (newSelectedTab !== undefined) {
        this.toggleGroup.snapToOption(MynahUITabsStore.getInstance().getSelectedTabId());
      }
      this.render.setAttribute('selected-tab', MynahUITabsStore.getInstance().getSelectedTabId());
    });
    MynahUITabsStore.getInstance().addListener('selectedTabChange', (selectedTabId) => {
      this.render.setAttribute('selected-tab', selectedTabId);
      this.toggleGroup.setValue(selectedTabId);
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

  private readonly getTabsRender = (selectedTabId?: string): ExtendedHTMLElement[] => {
    const tabs = this.getTabOptionsFromTabStoreData();
    this.toggleGroup = new Toggle({
      onChange: (selectedTabId: string) => {
        MynahUITabsStore.getInstance().selectTab(selectedTabId);
        if (this.props.onChange !== undefined) {
          this.props.onChange(selectedTabId);
        }
      },
      onRemove: (selectedTabId) => {
        MynahUITabsStore.getInstance().removeTab(selectedTabId);
      },
      name: 'mynah-main-tabs',
      options: tabs,
      value: selectedTabId
    });
    return [
      this.toggleGroup.render,
      new Button({
        classNames: [ 'mynah-toggle-close-button' ],
        onClick: (e) => {
          cancelEvent(e);
          MynahUITabsStore.getInstance().addTab();
        },
        icon: new Icon({ icon: MynahIcons.PLUS }).render,
        primary: false
      }).render
    ];
  };
}
