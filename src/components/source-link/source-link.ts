/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExtendedHTMLElement } from '../../helper/dom';
import { SourceLink } from '../../static';
import { Card } from '../card/card';
import { SourceLinkBody } from './source-link-body';
import { SourceLinkHeader } from './source-link-header';

export interface SourceLinkCardProps {sourceLink: SourceLink; compact?: 'flat' | true}
export class SourceLinkCard {
  private readonly sourceLink: SourceLink;
  render: ExtendedHTMLElement;
  constructor (props: SourceLinkCardProps) {
    this.sourceLink = props.sourceLink;
    this.render = new Card({
      children: [
        new SourceLinkHeader({
          sourceLink: this.sourceLink
        }).render,
        ...(this.sourceLink.body !== undefined ? [ new SourceLinkBody({ suggestion: this.sourceLink }).render ] : []),
      ],
    }).render;
  }
}
