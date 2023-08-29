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
    const splitUrl = props.url
      .replace(/^(http|https):\/\//, '')
      .split('/');
    const thumbnail = getThumbnailClass(splitUrl[0], props.metadata);
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-header', ...((thumbnail != null) ? [ 'mynah-card-header-with-source-thumbnail' ] : []) ],
      children: [
        {
          type: 'span',
          classNames: [ 'mynah-source-thumbnail', thumbnail ?? 'default' ]
        },
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
              innerHTML: splitUrl.map(urlPart => `<span><span>${urlPart}</span></span>`).join(''),
            },
            ...((props.metadata != null) ? [ this.getSourceMetaBlock(props.metadata) ] : []),
          ],
        },
      ],
    });
  }

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
                children: [ getTimeDiff((new Date()).getTime() - metadata.lastActivityDate, 2) ]
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
                children: [ metadata.answerCount.toString() ]
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

function getThumbnailClass (domain: string, metadata?: SuggestionMetaDataUnion): string | undefined {
  if (metadata !== null && metadata !== undefined) {
    return Object.keys(metadata).join(' ');
  }
  switch (domain) {
    case 'github.com':
      return 'github';
    case 'docs.aws.amazon.com':
    case 'boto3.amazonaws.com':
    case 'sdk.amazonaws.com':
      return 'aws';
    case 'stackoverflow.com':
      return 'stackOverflow';
    default:
      return undefined;
  }
}
