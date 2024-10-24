import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItemContent, ChatItemType, Status } from '../../static';
import { Icon, MynahIcons } from '../icon';
import { ChatItemCard } from './chat-item-card';

export interface ChatItemInformationCardProps {
  tabId: string;
  messageId: string | undefined;
  informationCard: {
    title?: string;
    status?: {
      status?: Status;
      icon?: MynahIcons;
      body?: string;
    };
    description?: string;
    icon?: MynahIcons;
    content: ChatItemContent;
  };
}

export class ChatItemInformationCard {
  render: ExtendedHTMLElement;

  constructor (props: ChatItemInformationCardProps) {
    const mainContent = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-information-card-main' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-information-card-header-container' ],
          children: [
            ...(props.informationCard.icon !== undefined
              ? [
                  new Icon({
                    icon: props.informationCard.icon
                  }).render
                ]
              : []),
            {
              type: 'div',
              classNames: [ 'mynah-chat-item-information-card-header' ],
              children: [
                {
                  type: 'div',
                  classNames: [ 'mynah-chat-item-information-card-title' ],
                  children: [ props.informationCard.title ?? '' ]
                },
                ...(props.informationCard.description !== undefined
                  ? [ {
                      type: 'div',
                      classNames: [ 'mynah-chat-item-information-card-description' ],
                      children: [ props.informationCard.description ]
                    } ]
                  : [])
              ]
            }
          ]
        }
      ]
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-information-card', 'mynah-card-inner-order-55' ],
      children: [
        mainContent
      ]
    });

    mainContent.insertChild('beforeend', new ChatItemCard({
      tabId: props.tabId,
      small: true,
      inline: true,
      chatItem: {
        ...props.informationCard.content,
        type: ChatItemType.ANSWER,
        messageId: props.messageId,
      }
    }).render);

    if (props.informationCard.status !== undefined) {
      const statusFooter = DomBuilder.getInstance().build({
        type: 'div',
        classNames: [
          'mynah-chat-item-information-card-footer',
          ...(props.informationCard.status.status != null ? [ `status-${props.informationCard.status.status}` ] : []),
        ],
        children: [
          ...(props.informationCard.status.icon !== undefined
            ? [
                new Icon({
                  icon: props.informationCard.status.icon
                }).render
              ]
            : []),
          ...(props.informationCard.status.body !== undefined
            ? [ {
                type: 'p',
                children: [ props.informationCard.status.body ]
              } ]
            : [])
        ]
      });
      this.render.insertChild('beforeend', statusFooter);
    }
  }
}
