import { TopNavigation } from '@cloudscape-design/components';
import { Main } from './Main';

export default function App(): JSX.Element {
  return (
    <>
      <TopNavigation
        identity={{
          href: '#',
          title: 'MynahUI Cloudscape Demo',
        }}
        utilities={[
          {
            type: 'button',
            iconName: 'notification',
            title: 'Notifications',
            ariaLabel: 'Notifications (unread)',
            badge: true,
            disableUtilityCollapse: false,
          },
          {
            type: 'menu-dropdown',
            iconName: 'settings',
            ariaLabel: 'Settings',
            title: 'Settings',
            items: [
              {
                id: 'settings-1',
                text: 'Some settings 1',
              },
              {
                id: 'settings-2',
                text: 'Some settings 2',
              },
            ],
          },
          {
            type: 'menu-dropdown',
            text: 'User',
            description: 'email@example.com',
            iconName: 'user-profile',
            items: [
              { id: 'profile', text: 'Profile' },
              { id: 'preferences', text: 'Preferences' },
              { id: 'security', text: 'Security' },
              { id: 'signout', text: 'Sign out' },
            ],
          },
        ]}
      />
      <Main />
    </>
  );
}
