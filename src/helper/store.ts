/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { LiveSearchState, MynahEventNames, MynahMode, MynahUIDataModel, NotificationType } from '../static';
import { MynahUIGlobalEvents } from './events';
import { generateUID } from './guid';

const PrimitiveObjectTypes = [ 'string', 'number', 'boolean' ];
export class EmptyMynahUIDataModel {
  data: Required<MynahUIDataModel>;
  constructor (defaults?: MynahUIDataModel | null) {
    this.data = {
      loading: false,
      loadingChat: false,
      showChatAvatars: true,
      liveSearchState: LiveSearchState.STOP,
      query: '',
      code: '',
      invisibleContextItems: [],
      navigationTabs: [],
      autoCompleteSuggestions: [],
      searchHistory: [],
      showingHistoricalSearch: false,
      liveSearchAnimation: true,
      codeSelection: {
        selectedCode: '',
        file: {
          name: '',
          range: {
            start: { row: '0', column: '0' },
            end: { row: '0', column: '0' }
          }
        }
      },
      codeQuery: { simpleNames: [], fullyQualifiedNames: { used: [] } },
      matchPolicy: { must: [], mustNot: [], should: [] },
      userAddedContext: [],
      mode: MynahMode.SEARCH,
      suggestions: [],
      chatItems: [],
      headerInfo: {
        content: '',
        type: NotificationType.INFO
      },
      ...defaults
    };
  }
}
export class MynahUIDataStore {
  private static instance: MynahUIDataStore;
  private readonly subsciptions: Record<keyof MynahUIDataModel, Record<string, (newValue?: any, oldValue?: any) => void>>;
  private store: Required<MynahUIDataModel> = (new EmptyMynahUIDataModel()).data;
  private defaults: MynahUIDataModel | null = null;

  private constructor (initialData?: MynahUIDataModel) {
    this.store = Object.assign(this.store, initialData);
    this.subsciptions = Object.create({});
    (Object.keys(this.store) as Array<keyof MynahUIDataModel>).forEach((storeKey) => {
      Object.assign(this.subsciptions, { [storeKey]: {} });
    });
  }

  public static getInstance = (initialData?: MynahUIDataModel): MynahUIDataStore => {
    if (MynahUIDataStore.instance === undefined) {
      MynahUIDataStore.instance = new MynahUIDataStore(initialData);
    }

    return MynahUIDataStore.instance;
  };

  /**
   * Sets the defaults to use while clearing the store
   * @param defaults partial set of MynahUIDataModel for defaults
   */
  public setDefaults = (defaults: MynahUIDataModel | null): void => {
    this.defaults = defaults;
  };

  /**
   * Get the defaults to use while generating an empty store data
   */
  public getDefaults = (): MynahUIDataModel | null => this.defaults;

  /**
   * Subscribe to value changes of a specific item in data store
   * @param storeKey One of the keys in MynahUIDataModel
   * @param handler function will be called when value of the given key is updated in store with new and old values
   * @returns subscriptionId which needed to unsubscribe
   */
  public subscribe = (storeKey: keyof MynahUIDataModel, handler: (newValue: any, oldValue?: any) => void): string => {
    const subscriptionId: string = generateUID();
    this.subsciptions[storeKey][subscriptionId] = handler;
    return subscriptionId;
  };

  /**
   * Unsubscribe from changes of a specific item in data store
   * @param storeKey One of the keys in MynahUIDataModel
   * @param subscriptionId subsciptionId which is returned from subscribe function
   */
  public unsubscribe = (storeKey: keyof MynahUIDataModel, subscriptionId: string): void => {
    if (this.subsciptions[storeKey]?.[subscriptionId] !== undefined) {
      delete this.subsciptions[storeKey][subscriptionId];
    }
  };

  /**
   * Returns current value of an item in data store
   * @param storeKey One of the keys in MynahUIDataModel
   * @returns value of the given key in data store
   */
  public getValue = (storeKey: keyof MynahUIDataModel): any => structuredClone(this.store[storeKey]);

  /**
   * Returns current value of an item in data store
   * @param storeKey One of the keys in MynahUIDataModel
   * @returns value of the given key in data store
   */
  public getDefaultValue = (storeKey: keyof MynahUIDataModel): any => (new EmptyMynahUIDataModel(this.defaults)).data[storeKey];

  /**
   * Updates the store and informs the subscribers.
   * @param data A full or partial set of store data model with values.
   */
  public updateStore = (data: MynahUIDataModel, skipSubscribers?: boolean): void => {
    if (skipSubscribers !== true) {
      (Object.keys(data) as Array<keyof MynahUIDataModel>).forEach(storeKey => {
        Object.keys(this.subsciptions[storeKey]).forEach((subscriptionId: string) => {
          if (!PrimitiveObjectTypes.includes(typeof data[storeKey]) || data[storeKey] !== this.store[storeKey]) {
            this.subsciptions[storeKey][subscriptionId](data[storeKey], this.store[storeKey]);
          }
        });
      });
    }
    this.store = Object.assign(structuredClone(this.store), data);
  };

  /**
   * Clears store data and informs all the subscribers
   */
  public resetStore = (): void => {
    this.updateStore((new EmptyMynahUIDataModel(structuredClone(this.defaults))).data);
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.RESET_STORE);
  };
}
