/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIGlobalEvents } from '../helper/events';
import { MynahUITabsStore } from '../helper/tabs-store';
import { MynahEventNames, TabBarAction, TabBarMainAction } from '../static';
import { Button } from './button';
import { Icon } from './icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from './overlay';

export interface TabBarButtonsWrapperProps {
  onButtonClick?: (selectedTabId: string, buttonId: string) => void;
}
export class TabBarButtonsWrapper {
  render: ExtendedHTMLElement;
  private readonly props: TabBarButtonsWrapperProps;

  constructor (props?: TabBarButtonsWrapperProps) {
    this.props = props ?? {};
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-nav-tabs-bar-buttons-wrapper' ],
      children: this.getTabsBarButtonsRender(MynahUITabsStore.getInstance().getSelectedTabId()),
    });

    MynahUITabsStore.getInstance().addListener('selectedTabChange', (selectedTabId) => {
      this.render.clear();
      this.render.update({
        children: this.getTabsBarButtonsRender(selectedTabId)
      });
    });
  }

  private readonly getTabsBarButtonsRender = (selectedTabId: string): ExtendedHTMLElement[] => {
    let tabBarButtons = Config.getInstance().config.tabBarButtons ?? [];
    const tabBarButtonsFromTabStore = MynahUITabsStore.getInstance().getTabDataStore(selectedTabId)?.getValue('tabBarButtons');
    if (tabBarButtonsFromTabStore != null && tabBarButtonsFromTabStore.length > 0) {
      tabBarButtons = tabBarButtonsFromTabStore;
    }
    return tabBarButtons.map((tabBarButton: TabBarMainAction) => new TabBarButtonWithMultipleOptions({
      onButtonClick: (buttonId) => {
        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.TAB_BAR_BUTTON_CLICK, { tabId: selectedTabId, buttonId });
        if (this.props.onButtonClick != null) {
          this.props.onButtonClick(selectedTabId, buttonId);
        }
      },
      tabBarActionButton: tabBarButton
    }).render);
  };
}

interface TabBarButtonWithMultipleOptionsProps {
  onButtonClick: (buttonId: string) => void;
  tabBarActionButton: TabBarMainAction;
}
class TabBarButtonWithMultipleOptions {
  render: ExtendedHTMLElement;
  private buttonOptionsOverlay: Overlay | undefined;
  private readonly props: TabBarButtonWithMultipleOptionsProps;

  constructor (props: TabBarButtonWithMultipleOptionsProps) {
    this.props = props;
    this.render = new Button({
      label: this.props.tabBarActionButton.text,
      tooltip: this.props.tabBarActionButton.description,
      tooltipVerticalDirection: OverlayVerticalDirection.START_TO_BOTTOM,
      tooltipHorizontalDirection: OverlayHorizontalDirection.TO_LEFT,
      icon: this.props.tabBarActionButton.icon != null ? new Icon({ icon: this.props.tabBarActionButton.icon }).render : undefined,
      primary: false,
      onClick: () => {
        if (this.props.tabBarActionButton.items != null && this.props.tabBarActionButton.items?.length > 0) {
          this.showButtonOptionsOverlay(this.props.tabBarActionButton.items);
        } else {
          this.props.onButtonClick(this.props.tabBarActionButton.id);
        }
      }
    }).render;
  }

  private readonly showButtonOptionsOverlay = (items: TabBarAction[]): void => {
    this.buttonOptionsOverlay = new Overlay({
      background: true,
      closeOnOutsideClick: true,
      referenceElement: this.render,
      dimOutside: false,
      removeOtherOverlays: true,
      verticalDirection: OverlayVerticalDirection.TO_BOTTOM,
      horizontalDirection: OverlayHorizontalDirection.END_TO_LEFT,
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-nav-tabs-bar-buttons-wrapper-overlay' ],
          children: items.map(item => new Button({
            label: item.text,
            icon: item.icon != null ? new Icon({ icon: item.icon }).render : undefined,
            primary: false,
            onClick: () => {
              this.hideButtonOptionsOverlay();
              this.props.onButtonClick(item.id);
            }
          }).render)
        }
      ],
    });
  };

  private readonly hideButtonOptionsOverlay = (): void => {
    if (this.buttonOptionsOverlay !== undefined) {
      this.buttonOptionsOverlay.close();
      this.buttonOptionsOverlay = undefined;
    }
  };
}
