import { State, stateDefaults } from '../reducer';

const LocalStorageKey = 'MynahUICloudscapeDemo';

export const setStorage = (state: State): void => {
  // Clear unnecesary parts of the state before saving
  const stateToSaveToLocalStorage: State = {
    ...state,
  };

  localStorage.setItem(
    LocalStorageKey,
    JSON.stringify(stateToSaveToLocalStorage)
  );
};

export const getStorage = (): State => {
  let storedState: State = structuredClone(stateDefaults);
  try {
    const localStorageState: State = JSON.parse(
      localStorage.getItem(LocalStorageKey) ?? '{}'
    );

    if (
      validateStorageState(
        storedState.stateVersion,
        localStorageState.stateVersion
      )
    ) {
      storedState = {
        ...storedState,
        ...localStorageState,
      };
    }
  } catch (err) {
    //
  }
  return storedState;
};

export const resetStorage = () => {
  localStorage.removeItem(LocalStorageKey);
};

const validateStorageState = (
  currentVersion: string,
  incomingVersion?: string
): boolean => {
  return incomingVersion === currentVersion;
};
