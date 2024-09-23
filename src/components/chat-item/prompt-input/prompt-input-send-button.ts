import { ExtendedHTMLElement } from '../../../helper/dom';
import { MynahUITabsStore } from '../../../helper/tabs-store';
import testIds from '../../../helper/test-ids';
import { Button } from '../../button';
import { Icon, MynahIcons } from '../../icon';

export interface SendButtonProps {
  tabId: string;
  onClick: () => void;
}

export class PromptInputSendButton {
  render: ExtendedHTMLElement;
  private readonly props: SendButtonProps;
  constructor (props: SendButtonProps) {
    this.props = props;

    const initialDisabledState = MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).getValue('promptInputDisabledState') as boolean;

    this.render = new Button({
      testId: testIds.prompt.send,
      classNames: [ 'mynah-chat-prompt-button' ],
      attributes: {
        ...(initialDisabledState ? { disabled: 'disabled' } : {}),
        tabindex: '0'
      },
      icon: new Icon({ icon: MynahIcons.ENVELOPE_SEND }).render,
      primary: false,
      border: false,
      status: 'info',
      onClick: () => {
        this.props.onClick();
      },
    }).render;

    MynahUITabsStore.getInstance().getTabDataStore(this.props.tabId).subscribe('promptInputDisabledState', (isDisabled: boolean) => {
      if (isDisabled) {
        this.render.setAttribute('disabled', 'disabled');
      } else {
        this.render.removeAttribute('disabled');
      }
    });
  }
}
