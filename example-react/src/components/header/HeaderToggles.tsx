import { useDispatch, useSelector } from 'react-redux';
import { State, StoreEventNames } from '../../reducer';
import { DarkModeIcon } from './assets/DarkModeIcon';
import { useEffect } from 'react';
import { Icon, SpaceBetween, Toggle } from '@cloudscape-design/components';

const DARK_MODE_CLASS = 'awsui-dark-mode';

export const HeaderToggles = (): JSX.Element => {
  const darkMode = useSelector((state: State) => state.darkMode);
  const dispatch = useDispatch();
  useEffect(() => {
    if (darkMode) {
      document.querySelector('body')?.classList.add(DARK_MODE_CLASS);
    } else {
      document.querySelector('body')?.classList.remove(DARK_MODE_CLASS);
    }
  }, [darkMode]);

  return (
    <SpaceBetween size='m' alignItems='end' direction='horizontal'>
      <Toggle
        checked={darkMode ?? false}
        onChange={({ detail }) => {
          dispatch({
            type: StoreEventNames.SET_DARK_MODE,
            value: detail.checked,
          });
        }}
      >
        <Icon svg={<DarkModeIcon />} />
      </Toggle>
    </SpaceBetween>
  );
};
