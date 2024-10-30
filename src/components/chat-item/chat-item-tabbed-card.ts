import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItemContent, ChatItemType } from '../../static';
import { Toggle } from '../toggle';
import '../../styles/components/chat/_chat-item-card-tabbed-card.scss';
import { ChatItemCard } from './chat-item-card';
import testIds from '../../helper/test-ids';
import { emptyChatItemContent } from '../../helper/chat-item';

export interface ChatItemTabbedCardProps {
  tabId: string;
  messageId: string | undefined;
  tabbedCard: NonNullable<Required<ChatItemContent>['tabbedContent']>;
}

export class ChatItemTabbedCard {
  contentCard: ChatItemCard;

  render: ExtendedHTMLElement;
  props: ChatItemTabbedCardProps;

  constructor (props: ChatItemTabbedCardProps) {
    this.props = props;
    const toggleGroup = new Toggle({
      options: props.tabbedCard,
      direction: 'horizontal',
      name: `tabbed-card-toggle-${props.messageId ?? props.tabId}`,
      value: props.tabbedCard.filter((tab) => tab.selected)[0].value,
      testId: testIds.chatItem.tabbedCard.tabs,
      onChange: (value) => {
        console.log(value, this.getTabContentFromValue(value));
        this.contentCard.updateCardStack({
          ...emptyChatItemContent,
          ...this.getTabContentFromValue(value)
        });
        // this.contentCards.forEach((card) => card.render.addClass('hidden'));
        // this.contentCards.get(this.getTabFromValue(value))?.render.removeClass('hidden');
      }
    });

    const selectedTabContent = props.tabbedCard.filter((tab) => tab.selected)[0]?.content ?? props.tabbedCard[0].content;
    this.contentCard = new ChatItemCard({
      tabId: props.tabId,
      chatItem: {
        messageId: props.messageId,
        type: ChatItemType.ANSWER,
        ...selectedTabContent
      }
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-tabbed-card-wrapper', 'mynah-card-inner-order-65' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-tabbed-card-contents' ],
          children: [ this.contentCard.render ]
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

  private readonly getTabContentFromValue = (value: string): ChatItemContent => {
    return this.props.tabbedCard.find((tab) => tab.value === value)?.content ?? this.props.tabbedCard[0].content;
  };
}
