/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getTimeDiff } from '../../helper/date-time';
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { SuggestionMetaData } from '../../static';
import { Icon, MynahIcons } from '../icon';

export interface SuggestionCardHeaderProps {
  title: string;
  url: string;
  metaData?: SuggestionMetaData;
  onSuggestionTitleClick?: () => void;
  onSuggestionLinkClick?: () => void;
  onSuggestionLinkCopy?: () => void;
}
export class SuggestionCardHeader {
  render: ExtendedHTMLElement;
  constructor (props: SuggestionCardHeaderProps) {
    const splittedUrl = props.url
      .replace(/^(http|https):\/\//, '')
      .split('/')
      .slice(0, 3);
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-header', ...((props.metaData != null) ? [ 'mynah-card-header-with-source-thumbnail' ] : []) ],
      children: [
        ...((props.metaData != null)
          ? [ {
              type: 'span',
              classNames: [ 'mynah-source-thumbnail', props.metaData.site ]
            } ]
          : []),
        {
          type: 'div',
          classNames: [ 'mynah-card-title-wrapper' ],
          events: {
            ...(props.onSuggestionTitleClick !== undefined && {
              click: (e: Event) => {
                // to prevent double click from the anchor element inside, we need to check if it is not the anchor element
                if (
                  !(e.target as HTMLElement).classList.contains('mynah-card-url') &&
                                    props.onSuggestionTitleClick !== undefined
                ) {
                  props.onSuggestionTitleClick();
                }
              },
            }),
          },
          children: [
            {
              type: 'div',
              classNames: [ 'mynah-card-title' ],
              children: [ props.title, {
                type: 'div',
                classNames: [ 'mynah-card-expand-icon' ],
                children: [ new Icon({ icon: MynahIcons.EXTERNAL }).render ],
              } ],
            },
            {
              type: 'a',
              classNames: [ 'mynah-card-url' ],
              events: {
                ...(props.onSuggestionLinkClick !== undefined && {
                  click: props.onSuggestionLinkClick,
                }),
                ...(props.onSuggestionLinkCopy !== undefined && { copy: props.onSuggestionLinkCopy }),
              },
              attributes: { href: props.url, target: '_blank' },
              innerHTML: `${splittedUrl.slice(0, splittedUrl.length - 1).join(' / ')} / <b>${splittedUrl[splittedUrl.length - 1]
                                }</b>`,
            },
            ...((props.metaData != null) ? [ this.getSourceMetaBlock(props.metaData) ] : []),
          ],
        },
      ],
    });
  }

  private readonly getSourceMetaBlock = (metaData: SuggestionMetaData): DomBuilderObject => {
    const metaItems = [];
    if (metaData.isAccepted === true) {
      metaItems.push({
        type: 'span',
        classNames: [ 'mynah-title-meta-block-item', 'approved-answer' ],
        children: [
          new Icon({ icon: MynahIcons.OK }).render,
          {
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item-text' ],
            children: [ 'Approved answer' ]
          }
        ]
      });
    }

    if (metaData.lastActivityDate !== undefined) {
      metaItems.push({
        type: 'span',
        classNames: [ 'mynah-title-meta-block-item' ],
        children: [
          new Icon({ icon: MynahIcons.CALENDAR }).render,
          {
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item-text' ],
            children: [ `${getTimeDiff((new Date()).getTime() - metaData.lastActivityDate, 2, ' and ')} ago` ]
          }
        ]
      });
    }

    if (metaData.answers !== undefined) {
      metaItems.push({
        type: 'span',
        classNames: [ 'mynah-title-meta-block-item' ],
        children: [
          new Icon({ icon: MynahIcons.CHAT }).render,
          {
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item-text' ],
            children: [ `${metaData.answers.toString()} answers` ]
          }
        ]
      });
    }

    if (metaData.stars !== undefined) {
      metaItems.push({
        type: 'span',
        classNames: [ 'mynah-title-meta-block-item' ],
        children: [
          new Icon({ icon: MynahIcons.STAR }).render,
          {
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item-text' ],
            children: [ `${metaData.stars.toString()} contributors` ]
          }
        ]
      });
    }

    if (metaData.forks !== undefined) {
      metaItems.push({
        type: 'span',
        classNames: [ 'mynah-title-meta-block-item' ],
        children: [
          new Icon({ icon: MynahIcons.DOWN_OPEN }).render,
          {
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item-text' ],
            children: [ `${metaData.forks.toString()} forks` ]
          }
        ]
      });
    }

    if (metaData.upVotes !== undefined) {
      metaItems.push({
        type: 'span',
        classNames: [ 'mynah-title-meta-block-item' ],
        children: [
          new Icon({ icon: MynahIcons.THUMBS_UP }).render,
          {
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item-text' ],
            children: [ `${metaData.upVotes.toString()} upvotes` ]
          }
        ]
      });
    }

    return {
      type: 'span',
      classNames: [ 'mynah-title-meta-block' ],
      children: metaItems
    };
  };
}
