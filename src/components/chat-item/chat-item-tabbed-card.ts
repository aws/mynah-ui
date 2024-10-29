import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItemContent, ChatItemType } from '../../static';
import { Toggle, ToggleOption } from '../toggle';
import '../../styles/components/chat/_chat-item-card-tabbed-card.scss';
import { ChatItemCard } from './chat-item-card';

export interface ChatItemTabbedCardProps {
  tabId: string;
  messageId: string | undefined;
  tabbedCard: Required<ChatItemContent>['tabbedCard'];
}

export class ChatItemTabbedCard {
  contentCard: ChatItemCard;
  render: ExtendedHTMLElement;
  props: ChatItemTabbedCardProps;

  constructor (props: ChatItemTabbedCardProps) {
    this.props = props;
    const toggleGroup = new Toggle({
      options: props.tabbedCard.tabs,
      direction: 'horizontal',
      name: `tabbed-card-toggle-${props.messageId ?? props.tabId}`,
      value: props.tabbedCard.selectedValue ?? props.tabbedCard.tabs[0].value,
      onChange: (value) => {
        // this.contentCard.render.update();
      }
    });

    this.contentCard = new ChatItemCard({
      tabId: props.tabId,
      small: true,
      inline: true,
      chatItem: {
        type: ChatItemType.ANSWER,
        messageId: props.messageId,
        body: toggleGroup.getValue() as string
      }
    });

    this.contentCard = new ChatItemCard({
      tabId: props.tabId,
      small: true,
      inline: true,
      chatItem: {
        type: ChatItemType.ANSWER,
        messageId: props.messageId,
        informationCard: {
          content: this.getTabFromValue(toggleGroup.getValue() as string)?.content ?? {}
        }
      }
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-tabbed-card-wrapper', 'mynah-card-inner-order-65' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-tabbed-card-content' ],
          children: [
            this.contentCard.render
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

  private readonly getTabFromValue = (value: string): ToggleOption & {content: ChatItemContent} | undefined => {
    return this.props.tabbedCard.tabs.find((tab) => tab.value === value);
  };
}
