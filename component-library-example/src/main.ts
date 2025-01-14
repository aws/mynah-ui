import { bindable, Button, ButtonStatus, Card, CardContent, DomBuilder, Icon, MynahIcons } from '@aws/mynah-ui';
import './styles/styles.scss';

export const initialize = (): void => {
  // BOF -> THEME SELECTION
  const themeSelector: HTMLSelectElement = document.querySelector('#theme-selector') as HTMLSelectElement;
  themeSelector.addEventListener('change', e => {
    if (themeSelector.value.match('dark-') != null) {
      document.querySelector('body')?.classList.add('vscode-dark');
    } else {
      document.querySelector('body')?.classList.remove('vscode-dark');
    }
    document.querySelector('html')?.setAttribute('theme', themeSelector.value);
  });
  // EOF -> THEME SELECTION

  //
  //
  //
  //
  // Generic bindable(s)
  const itemCount = bindable(1);

  // Button bindable(s)
  const label = bindable(`Add item **${itemCount.value}**`);
  const icon = bindable(MynahIcons.CURSOR_INSERT);
  const status = bindable('info' as ButtonStatus);

  // Card bindable(s)
  const body = bindable('### Hi, items will be added below:');

  // Manually subscribe to generic ones
  itemCount.subscribe((value) => {
    label.value = `Add item **${value}**`;
  });

  // This will create a new "div" element with "mynah-ui-panel" id inside the root element
  // which is "body" by default and can be configured while initializing DomBuilder
  DomBuilder.getInstance().createPortal('component-test-root',
    {
      type: 'div',
      attributes: { id: 'mynah-ui-panel' },
      children: [
        {
          type: 'div',
          children: [
            new Button({
              label,
              status,
              primary: false,
              icon: new Icon({ icon }).render,
              onClick: () => {
                body.value += `\n - Item **\`${itemCount.value}\`**\n`;
                itemCount.value++;
                icon.value = MynahIcons.OK;
                status.value = 'success';

                // Revert button UI changes
                setTimeout(() => {
                  icon.value = MynahIcons.CURSOR_INSERT;
                  status.value = 'info';
                }, 5000);
              }
            }).render
          ]
        },
        new Card({
          children: [
            new Icon({
              icon
            }).render,
            new CardContent({
              renderAsStream: true,
              body,
            }).render,
          ]
        }).render
      ]
    },
    'beforeend');
};

initialize();
