/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { generateUID } from './guid';

export interface Bindable<T> {
  value: T;
  bindable: true;
  subscribe: (callback: (value: T) => void) => string;
  unSubscribe: (subscriptionId: string) => void;
  valueOf: () => T;
}

export const bindable = <T>(value: T): Bindable<T> => {
  const subscribers: { [key: string]: (value: T) => void } = {};

  const state = {
    value,
    bindable: true,
    subscribers: {}
  };

  return new Proxy(state, {
    get (target: { value: T }, prop: string | symbol) {
      if (prop === 'value') {
        return target.value;
      }
      if (prop === 'valueOf') {
        return function () { return target.value; };
      }
      if (prop === 'subscribe') {
        return function (callback: (value: T) => void) {
          const subscriptionId = generateUID();
          subscribers[subscriptionId] = callback;
          return subscriptionId;
        };
      }
      if (prop === 'unSubscribe') {
        return function (subscriptionId: string) {
          if (subscribers[subscriptionId] != null) {
            delete subscribers[subscriptionId];
          }
        };
      }
      return target[prop as keyof typeof target];
    },
    set (target: { value: T }, prop: string | symbol, newValue: T) {
      if (prop === 'value') {
        target.value = newValue;
        Object.values(subscribers).forEach(callback => {
          callback(newValue);
        });
      }
      return true;
    }
  }) as Bindable<T>;
};
export const isBindable = <T>(value: T | Bindable<T>): value is Bindable<T> => {
  return typeof value === 'object' &&
           value !== null &&
           'bindable' in value &&
           value.bindable;
};
export const getBindableValue = <T>(value: T | Bindable<T> | undefined): T | undefined => {
  return value != null ? isBindable(value) ? value.value : value : undefined;
};

export type MakePropsBindable<T> = {
  [K in keyof T]: T[K] extends undefined ? never :
    T[K] extends (infer U | undefined) ? U | Bindable<U> | undefined :
      T[K] | Bindable<T[K]>;
};
