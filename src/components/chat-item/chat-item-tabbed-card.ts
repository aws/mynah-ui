import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItemContent } from '../../static';
import { CardBody } from '../card/card-body';
import { MynahIcons } from '../icon';
import { Toggle } from '../toggle';
import '../../styles/components/card/_chat-item-tabbed-card.scss';

export interface ChatItemTabbedCardProps {
  tabId: string;
  messageId: string | undefined;
  tabbedCard: Required<ChatItemContent>['tabbedCard'];
}

export class ChatItemTabbedCard {
  render: ExtendedHTMLElement;

  constructor (props: ChatItemTabbedCardProps) {
    const body = new CardBody({
      classNames: [ 'mynah-tabbed-card-body' ],
      body: 'test'
    });
    const toggleGroup = new Toggle({
      options: props.tabbedCard.tabs.map((tab) => {
        return {
          label: tab,
          value: tab,
          icon: MynahIcons.CODE_BLOCK
        };
      }),
      direction: 'horizontal',
      name: 'testToggle',
      value: props.tabbedCard.tabs[0],
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-tabbed-card-wrapper', 'mynah-card-inner-order-65' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-tabbed-card-content' ],
          children: [
            body.render
          ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-tabbed-card-tabs' ],
          children: [
            toggleGroup.render
          ]
        }
      ]
    });
  }
}
