import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItemContent, ChatItemType } from '../../static';
import { Toggle } from '../toggle';
import { ChatItemCard } from './chat-item-card';
import testIds from '../../helper/test-ids';
import '../../styles/components/chat/_chat-item-card-tabbed-card.scss';

export interface ChatItemTabbedCardProps {
  tabId: string;
  messageId: string | undefined;
  tabbedCard: NonNullable<Required<ChatItemContent>['tabbedContent']>;
  classNames?: string[];
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
        this.contentCard.reset();
        this.contentCard.updateCardStack({
          ...this.getTabContentFromValue(value)
        });
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
      classNames: [ 'mynah-tabbed-card-wrapper', ...props.classNames ?? '' ],
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
