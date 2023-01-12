/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MynahEventNames, RelevancyVoteType, Suggestion } from '../../static';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Icon, MynahIcons } from '../icon';
import { MynahUIGlobalEvents } from '../../helper/events';

export interface SuggestionCardRelevanceVoteProps {
  suggestion: Suggestion;
}
export class SuggestionCardRelevanceVote {
  render: ExtendedHTMLElement;
  constructor (props: SuggestionCardRelevanceVoteProps) {
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-votes-wrapper' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-vote-text' ],
          innerHTML: '<b>Is this relevant?</b>',
        },
        {
          type: 'div',
          classNames: [ 'mynah-card-vote' ],
          children: [
            {
              type: 'input',
              events: {
                change: (e: Event) => {
                  this.handleVoteChange(RelevancyVoteType.UP, props.suggestion);
                },
              },
              attributes: {
                type: 'radio',
                id: `${props.suggestion.url}-vote-up`,
                name: `${props.suggestion.url}-vote`,
                value: 'up',
              },
              classNames: [ 'mynah-vote-radio', 'mynah-vote-up-radio' ],
            },
            {
              type: 'input',
              events: {
                change: (e: Event) => {
                  this.handleVoteChange(RelevancyVoteType.DOWN, props.suggestion);
                },
              },
              attributes: {
                type: 'radio',
                id: `${props.suggestion.url}-vote-down`,
                name: `${props.suggestion.url}-vote`,
                value: 'down',
              },
              classNames: [ 'mynah-vote-radio', 'mynah-vote-down-radio' ],
            },
            {
              type: 'label',
              attributes: { for: `${props.suggestion.url}-vote-up` },
              classNames: [ 'mynah-vote-label', 'mynah-vote-up' ],
              children: [ new Icon({ icon: MynahIcons.THUMBS_UP }).render ],
            },
            {
              type: 'label',
              attributes: { for: `${props.suggestion.url}-vote-down` },
              classNames: [ 'mynah-vote-label', 'mynah-vote-down' ],
              children: [ new Icon({ icon: MynahIcons.THUMBS_DOWN }).render ],
            },
            {
              type: 'span',
              classNames: [ 'mynah-vote-indicator' ],
            },
          ],
        },
      ],
    });
  }

  private readonly handleVoteChange = (vote: RelevancyVoteType, suggestion: Suggestion): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SUGGESTION_VOTE, { suggestion, vote });
  };
}
