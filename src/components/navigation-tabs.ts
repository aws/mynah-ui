/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { cancelEvent } from '../helper/events';
import { MynahUITabsStore } from '../helper/tabs-store';
import { MynahUITabStoreTab } from '../static';
import { Button } from './button';
import { Card } from './card/card';
import { CardBody } from './card/card-body';
import { Icon, MynahIcons } from './icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from './overlay/overlay';
import { Toggle, ToggleOption } from './toggle';

export interface TabsProps {
  onChange?: (selectedTabId: string) => void;
}
export class Tabs {
  render: ExtendedHTMLElement;
  private tabIdTitleSubscriptions: Record<string, string> = {};
  private tabIdChatItemsSubscriptions: Record<string, string> = {};
  private toggleGroup: Toggle;
  private previewOverlay: Overlay | undefined;
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
          if (MynahUITabsStore.getInstance().tabsLength() < Config.getInstance().config.maxTabs) {
            MynahUITabsStore.getInstance().addTab();
          }
        }
      },
      children: this.getTabsRender(MynahUITabsStore.getInstance().getSelectedTabId()),
    });

    MynahUITabsStore.getInstance().addListener('add', (tabId, tabData) => {
      this.assignListener(tabId);
      this.toggleGroup.addOption({
        value: tabId,
        label: tabData?.store?.tabTitle,
        selected: tabData?.isSelected
      });
      this.render.setAttribute('selected-tab', tabId);
    });
    MynahUITabsStore.getInstance().addListener('remove', (tabId, newSelectedTab?: MynahUITabStoreTab) => {
      this.removeListenerAssignments(tabId);
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
        label: tabs[tabId].store?.tabTitle,
        selected: tabs[tabId].isSelected
      };
      return tabOption;
    });
  };

  private readonly getTabsRender = (selectedTabId?: string): ExtendedHTMLElement[] => {
    const tabs = this.getTabOptionsFromTabStoreData();
    tabs.forEach(tab => {
      this.assignListener(tab.value);
    });
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
        additionalEvents: {
          mouseenter: (e) => {
            if (MynahUITabsStore.getInstance().tabsLength() === Config.getInstance().config.maxTabs) {
              this.showPreviewOverLay(e.currentTarget, Config.getInstance().config.texts.noMoreTabsTooltip);
            }
          },
          mouseleave: () => {
            this.closePreviewOverLay();
          },
        },
        onClick: (e) => {
          cancelEvent(e);
          if (MynahUITabsStore.getInstance().tabsLength() < Config.getInstance().config.maxTabs) {
            MynahUITabsStore.getInstance().addTab();
          }
        },
        icon: new Icon({ icon: MynahIcons.PLUS }).render,
        primary: false
      }).render
    ];
  };

  private readonly showPreviewOverLay = (elm: HTMLElement, markdownText: string): void => {
    this.previewOverlay = new Overlay({
      background: false,
      closeOnOutsideClick: false,
      referenceElement: elm,
      dimOutside: false,
      removeOtherOverlays: true,
      verticalDirection: OverlayVerticalDirection.TO_BOTTOM,
      horizontalDirection: OverlayHorizontalDirection.CENTER,
      children: [
        new Card({
          classNames: [ 'snippet-card-container-preview' ],
          children: [
            new CardBody({
              body: markdownText,
            }).render,
          ]
        }).render
      ],
    });
  };

  private readonly closePreviewOverLay = (): void => {
    if (this.previewOverlay !== undefined) {
      this.previewOverlay.close();
      this.previewOverlay = undefined;
    }
  };

  private readonly assignListener = (tabId: string): void => {
    this.tabIdTitleSubscriptions[tabId] = MynahUITabsStore.getInstance().addListenerToDataStore(tabId, 'tabTitle', (title) => {
      this.toggleGroup.updateOptionTitle(tabId, title);
    }) ?? '';
    this.tabIdChatItemsSubscriptions[tabId] = MynahUITabsStore.getInstance().addListenerToDataStore(tabId, 'chatItems', () => {
      this.toggleGroup.updateOptionIndicator(tabId, true);
    }) ?? '';
  };

  private readonly removeListenerAssignments = (tabId: string): void => {
    MynahUITabsStore.getInstance().removeListenerFromDataStore(tabId, this.tabIdTitleSubscriptions[tabId], 'tabTitle');
    MynahUITabsStore.getInstance().removeListenerFromDataStore(tabId, this.tabIdChatItemsSubscriptions[tabId], 'chatItems');
  };
}
