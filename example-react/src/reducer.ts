/* eslint-disable no-case-declarations */
import { configureStore } from '@reduxjs/toolkit';
import { setStorage, getStorage } from './utils/local-storage';
import { createReducer } from '@reduxjs/toolkit';

export enum StoreEventNames {
  SET_DARK_MODE = 'setDarkMode',
  SET_VISUAL_REFRESH = 'setVisualRefresh',
}

export const stateDefaults: State = {
  stateVersion: '3.0',
  darkMode: false,
  visualRefresh: true,
};

export interface State {
  stateVersion: string;
  darkMode?: boolean;
  visualRefresh?: boolean;
}

const reducer = createReducer({ ...stateDefaults }, (builder:any) => {
  builder
    .addCase(StoreEventNames.SET_DARK_MODE, (state:State, action: any) => {
      state.darkMode = action.value;
    })
    .addCase(StoreEventNames.SET_VISUAL_REFRESH, (state:State, action: any) => {
      state.visualRefresh = action.value;
    });
});

export const store = configureStore({
  reducer: reducer,
  preloadedState: getStorage(),
});

store.subscribe(() => setStorage(store.getState()));
