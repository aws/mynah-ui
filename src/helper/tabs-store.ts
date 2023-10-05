/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { MynahUITabStoreModel, MynahUITabStoreTab } from '../static';
import { generateUID } from './guid';
import { MynahUIDataStore } from './store';

interface TabStoreSubscription {
  'add': Record<string, (tabId: string, tabData?: MynahUITabStoreTab) => void>;
  'remove': Record<string, (tabId: string) => void>;
  'update': Record<string, (tabId: string, tabData?: MynahUITabStoreTab) => void>;
  'selectedTabChange': Record<string, (tabId: string) => void>;
}
export class EmptyMynahUITabsStoreModel {
  data: Required<MynahUITabStoreModel>;
  constructor () {
    const guid = generateUID();
    this.data = {
      [guid]: {
        tabTitle: 'Welcome to Q',
        isSelected: true,
        store: {},
      }
    };
  }
}
export class MynahUITabsStore {
  private static instance: MynahUITabsStore;
  private readonly subsciptions: TabStoreSubscription = {
    add: {},
    remove: {},
    update: {},
    selectedTabChange: {}
  };

  private readonly tabsStore: Required<MynahUITabStoreModel> = {};
  private readonly tabsDataStore: Record<string, MynahUIDataStore> = {};

  private constructor (initialData?: MynahUITabStoreModel) {
    this.tabsStore = Object.assign(this.tabsStore, initialData);
    if ((initialData != null) && Object.keys(initialData).length > 0) {
      Object.keys(initialData).forEach((tabId: string) => {
        this.tabsDataStore[tabId] = new MynahUIDataStore(initialData[tabId].store ?? {});
      });
    }
  }

  public readonly addTab = (tabData: MynahUITabStoreTab): string => {
    const tabId = generateUID();
    this.updateTab(this.getSelectedTabId(), { isSelected: false });
    this.tabsStore[tabId] = { ...tabData, isSelected: true };
    this.tabsDataStore[tabId] = new MynahUIDataStore(tabData.store ?? {});
    this.informSubscribers('add', tabId, tabData);
    this.informSubscribers('selectedTabChange', tabId);
    return tabId;
  };

  public readonly removeTab = (tabId: string): string => {
    const wasSelected = this.tabsStore[tabId].isSelected ?? false;
    delete this.tabsStore[tabId];
    this.tabsDataStore[tabId].resetStore();
    delete this.tabsDataStore[tabId];
    this.informSubscribers('remove', tabId);
    if (wasSelected) {
      const tabIds = Object.keys(this.tabsStore);
      this.tabsStore[tabIds[tabIds.length - 1]].isSelected = true;
      this.informSubscribers('selectedTabChange', tabIds[tabIds.length - 1]);
    }
    return tabId;
  };

  /**
   * Updates the store and informs the subscribers.
   * @param data A full or partial set of store data model with values.
   */
  public updateTab = (tabId: string, tabData?: Partial<MynahUITabStoreTab>, skipSubscribers?: boolean): void => {
    if (this.tabsStore[tabId] !== undefined) {
      if (tabData?.isSelected === true && this.getSelectedTabId() !== tabId) {
        this.updateTab(this.getSelectedTabId(), { isSelected: false });
        this.informSubscribers('selectedTabChange', tabId);
      }
      this.tabsStore[tabId] = { ...this.tabsStore[tabId], ...tabData };
      if (tabData?.store !== undefined) {
        if (this.tabsDataStore[tabId] === undefined) {
          this.tabsDataStore[tabId] = new MynahUIDataStore();
        }
        this.tabsDataStore[tabId].updateStore(tabData?.store);
      }
      if (skipSubscribers !== true) {
        this.informSubscribers('update', tabId, this.tabsStore[tabId]);
      }
    }
  };

  public static getInstance = (initialData?: MynahUITabStoreModel): MynahUITabsStore => {
    if (MynahUITabsStore.instance === undefined) {
      MynahUITabsStore.instance = new MynahUITabsStore(initialData);
    }

    return MynahUITabsStore.instance;
  };

  /**
   * Subscribe to changes of the tabsStore
   * @param handler function will be called when tabs changed
   * @returns subscriptionId which needed to unsubscribe
   */
  public addListener = (eventName: keyof TabStoreSubscription, handler: (tabId: string, tabData?: MynahUITabStoreTab) => void): string => {
    const subscriptionId: string = generateUID();
    this.subsciptions[eventName][subscriptionId] = handler;
    return subscriptionId;
  };

  /**
   * Unsubscribe from changes of the tabs store
   * @param subscriptionId subsciptionId which is returned from subscribe function
   */
  public removeListener = (eventName: keyof TabStoreSubscription, subscriptionId: string): void => {
    if (this.subsciptions[eventName][subscriptionId] !== undefined) {
      delete this.subsciptions[eventName][subscriptionId];
    }
  };

  private readonly informSubscribers = (eventName: keyof TabStoreSubscription, tabId: string, tabData?: MynahUITabStoreTab): void => {
    const subsriberKeys = Object.keys(this.subsciptions[eventName]);
    subsriberKeys.forEach(subscriberKey => {
      this.subsciptions[eventName][subscriberKey](tabId, tabData);
    });
  };

  /**
   * Returns the tab
   * @param tabId Tab Id
   * @returns info of the tab
   */
  public getTab = (tabId: string): any => this.tabsStore[tabId];

  /**
   * Returns the tab
   * @param tabId Tab Id
   * @returns info of the tab
   */
  public getAllTabs = (): MynahUITabStoreModel => structuredClone(this.tabsStore);

  /**
   * Returns the data store of the tab
   * @param tabId Tab Id
   * @returns data of the tab
   */
  public getTabDataStore = (tabId: string): any => this.tabsDataStore[tabId];

  /**
   * Returns the data of the tab
   * @param tabId Tab Id
   * @returns data of the tab
   */
  public getSelectedTabId = (): string => {
    const tabIds = Object.keys(this.tabsStore);
    return tabIds.find(tabId => this.tabsStore[tabId].isSelected === true) ?? '';
  };

  /**
   * Clears store data and informs all the subscribers
   */
  public removeAllTabs = (): void => {
    Object.keys(this.tabsStore).forEach(tabId => {
      this.removeTab(tabId);
    });
  };
}
