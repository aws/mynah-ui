import { Config } from '../../../helper/config';
import { ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import { Icon, MynahIcons } from '../../icon';

export interface ISendButtonProps {
  tabId: string;
  onClick: () => void;
}

export class SendButton {
  private readonly _props: ISendButtonProps;
  private readonly _render: ExtendedHTMLElement;
  constructor (props: ISendButtonProps) {
    this._props = props;

    const initialDisabledState = MynahUITabsStore.getInstance().getTabDataStore(this._props.tabId).getValue('promptInputDisabledState') as boolean;

    this._render = new (Config.getInstance().config.componentClasses.Button)({
      classNames: [ 'mynah-icon-button', 'mynah-chat-prompt-button' ],
      attributes: {
        ...(initialDisabledState ? { disabled: 'disabled' } : {}),
        tabindex: '5'
      },
      icon: new Icon({ icon: MynahIcons.ENVELOPE_SEND }).render,
      onClick: () => {
        this._props.onClick();
      },
    }).render;

    MynahUITabsStore.getInstance().getTabDataStore(this._props.tabId).subscribe('promptInputDisabledState', (isDisabled: boolean) => {
      if (isDisabled) {
        this.render.setAttribute('disabled', 'disabled');
      } else {
        this.render.removeAttribute('disabled');
      }
    });
  }

  get render (): ExtendedHTMLElement {
    return this._render;
  }
}
