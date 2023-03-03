/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { getTimeDiff } from '../../helper/date-time';
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import { SuggestionMetaDataUnion } from '../../static';
import { Icon, MynahIcons } from '../icon';

export interface SuggestionCardHeaderProps {
  title: string;
  url: string;
  metadata?: SuggestionMetaDataUnion;
  onSuggestionTitleClick?: (e?: MouseEvent) => void;
  onSuggestionLinkCopy?: () => void;
}
export class SuggestionCardHeader {
  render: ExtendedHTMLElement;
  constructor (props: SuggestionCardHeaderProps) {
    const splittedUrl = props.url
      .replace(/^(http|https):\/\//, '')
      .split('/');
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-header', ...((props.metadata != null) ? [ 'mynah-card-header-with-source-thumbnail' ] : []) ],
      children: [
        ...((props.metadata != null)
          ? [ {
              type: 'span',
              classNames: [ 'mynah-source-thumbnail', this.getSourceMetaBlockClassName(props.metadata) ]
            } ]
          : []),
        {
          type: 'div',
          classNames: [ 'mynah-card-title-wrapper' ],
          children: [
            {
              type: 'a',
              classNames: [ 'mynah-card-title' ],
              events: {
                ...(props.onSuggestionTitleClick !== undefined && {
                  click: props.onSuggestionTitleClick,
                }),
              },
              attributes: { href: props.url, target: '_blank' },
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
                ...(props.onSuggestionTitleClick !== undefined && {
                  click: props.onSuggestionTitleClick,
                }),
                ...(props.onSuggestionLinkCopy !== undefined && { copy: props.onSuggestionLinkCopy }),
              },
              attributes: { href: props.url, target: '_blank' },
              innerHTML: splittedUrl.map(urlPart => `<span><span>${urlPart}</span></span>`).join(''),
            },
            ...((props.metadata != null) ? [ this.getSourceMetaBlock(props.metadata) ] : []),
          ],
        },
      ],
    });
  }

  private readonly getSourceMetaBlockClassName = (metadataUnion?: SuggestionMetaDataUnion): string => metadataUnion !== null && metadataUnion !== undefined ? Object.keys(metadataUnion).join(' ') : '';

  private readonly getSourceMetaBlock = (metadataUnion?: SuggestionMetaDataUnion): DomBuilderObject => {
    const metaItems: any[] = [];
    if (metadataUnion !== null && metadataUnion !== undefined) {
      Object.keys(metadataUnion).forEach(metadataKey => {
        const metadata = metadataUnion[metadataKey];
        if (metadata.isAccepted === true) {
          metaItems.push({
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item', 'approved-answer' ],
            children: [
              new Icon({ icon: MynahIcons.OK }).render,
              {
                type: 'span',
                classNames: [ 'mynah-title-meta-block-item-text' ],
                children: [ 'Accepted answer' ]
              }
            ]
          });
        }

        if (metadata.lastActivityDate !== undefined) {
          metaItems.push({
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item' ],
            children: [
              new Icon({ icon: MynahIcons.CALENDAR }).render,
              {
                type: 'span',
                classNames: [ 'mynah-title-meta-block-item-text' ],
                children: [ `${getTimeDiff((new Date()).getTime() - metadata.lastActivityDate, 2, ' and ')} ago` ]
              }
            ]
          });
        }

        if (metadata.answerCount !== undefined) {
          metaItems.push({
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item' ],
            children: [
              new Icon({ icon: MynahIcons.CHAT }).render,
              {
                type: 'span',
                classNames: [ 'mynah-title-meta-block-item-text' ],
                children: [ `${metadata.answerCount.toString()} answers` ]
              }
            ]
          });
        }

        if (metadata.stars !== undefined) {
          metaItems.push({
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item' ],
            children: [
              new Icon({ icon: MynahIcons.STAR }).render,
              {
                type: 'span',
                classNames: [ 'mynah-title-meta-block-item-text' ],
                children: [ `${metadata.stars.toString()} contributors` ]
              }
            ]
          });
        }

        if (metadata.forks !== undefined) {
          metaItems.push({
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item' ],
            children: [
              new Icon({ icon: MynahIcons.DOWN_OPEN }).render,
              {
                type: 'span',
                classNames: [ 'mynah-title-meta-block-item-text' ],
                children: [ `${metadata.forks.toString()} forks` ]
              }
            ]
          });
        }

        if (metadata.score !== undefined) {
          metaItems.push({
            type: 'span',
            classNames: [ 'mynah-title-meta-block-item' ],
            children: [
              new Icon({ icon: MynahIcons.THUMBS_UP }).render,
              {
                type: 'span',
                classNames: [ 'mynah-title-meta-block-item-text' ],
                children: [ `${metadata.score.toString()}` ]
              }
            ]
          });
        }
      });
    }

    return {
      type: 'span',
      classNames: [ 'mynah-title-meta-block' ],
      children: metaItems
    };
  };
}
