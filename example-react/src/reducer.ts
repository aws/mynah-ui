/* eslint-disable no-case-declarations */
import { configureStore } from '@reduxjs/toolkit';
import { setStorage, getStorage } from './utils/local-storage';
import { createReducer } from '@reduxjs/toolkit';

export enum StoreEventNames {
  SET_DARK_MODE = 'setDarkMode',
}

export const stateDefaults: State = {
  stateVersion: '4.0',
  darkMode: false,
};

export interface State {
  stateVersion: string;
  darkMode?: boolean;
}

const reducer = createReducer({ ...stateDefaults }, (builder:any) => {
  builder
    .addCase(StoreEventNames.SET_DARK_MODE, (state:State, action: any) => {
      state.darkMode = action.value;
    })
});

export const store = configureStore({
  reducer: reducer,
  preloadedState: getStorage(),
});

store.subscribe(() => setStorage(store.getState()));
