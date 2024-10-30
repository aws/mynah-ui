import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItemContent, ChatItemType } from '../../static';
import { Toggle, ToggleOption } from '../toggle';
import '../../styles/components/chat/_chat-item-card-tabbed-card.scss';
import { ChatItemCard } from './chat-item-card';
import testIds from '../../helper/test-ids';

export interface ChatItemTabbedCardProps {
  tabId: string;
  messageId: string | undefined;
  tabbedCard: Required<ChatItemContent>['tabbedCard'];
}

export class ChatItemTabbedCard {
  contentCards: Map<ToggleOption, ChatItemCard>;
  render: ExtendedHTMLElement;
  props: ChatItemTabbedCardProps;

  constructor (props: ChatItemTabbedCardProps) {
    this.props = props;
    const toggleGroup = new Toggle({
      options: props.tabbedCard.tabs,
      direction: 'horizontal',
      name: `tabbed-card-toggle-${props.messageId ?? props.tabId}`,
      value: props.tabbedCard.tabs.filter((tab) => tab.selected)[0].value,
      testId: testIds.chatItem.tabbedCard.tabs,
      onChange: (value) => {
        // this.contentCards.forEach((card) => card.render.addClass('hidden'));
        // this.contentCards.get(this.getTabFromValue(value))?.render.removeClass('hidden');
      }
    });

    this.contentCards = new Map<ToggleOption, ChatItemCard>();
    props.tabbedCard.tabs.forEach((tab) => {
      const card = new ChatItemCard({
        tabId: props.tabId,
        inline: true,
        chatItem: {
          type: ChatItemType.ANSWER,
          messageId: props.messageId,
          informationCard: {
            content: tab.content
          }
        }
      });
      if (!(tab.selected ?? false)) {
        card.render.addClass('hidden');
      }
      this.contentCards.set(tab, card);
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-tabbed-card-wrapper', 'mynah-card-inner-order-65' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-tabbed-card-contents' ],
          children: Array.from(this.contentCards.values()).map(card => card.render)
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

  private readonly getTabFromValue = (value: string): ToggleOption => {
    return this.props.tabbedCard.tabs.find((tab) => tab.value === value) ?? this.props.tabbedCard.tabs[0];
  };
}
