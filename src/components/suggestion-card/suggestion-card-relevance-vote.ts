/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MynahEventNames, RelevancyVoteType, Suggestion } from '../../static';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Icon, MynahIcons } from '../icon';
import { MynahUIGlobalEvents } from '../../helper/events';
import { generateUID } from '../../helper/guid';

export interface SuggestionCardRelevanceVoteProps {
  suggestion: Suggestion;
}
export class SuggestionCardRelevanceVote {
  render: ExtendedHTMLElement;
  votingId: string;
  constructor (props: SuggestionCardRelevanceVoteProps) {
    this.votingId = props.suggestion.url ?? props.suggestion.id ?? generateUID();
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-votes-wrapper' ],
      children: [
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
                id: `${this.votingId}-vote-up`,
                name: `${this.votingId}-vote`,
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
                id: `${this.votingId}-vote-down`,
                name: `${this.votingId}-vote`,
                value: 'down',
              },
              classNames: [ 'mynah-vote-radio', 'mynah-vote-down-radio' ],
            },
            {
              type: 'label',
              attributes: { for: `${this.votingId}-vote-up` },
              classNames: [ 'mynah-vote-label', 'mynah-vote-up' ],
              children: [ new Icon({ icon: MynahIcons.THUMBS_UP }).render ],
            },
            {
              type: 'label',
              attributes: { for: `${this.votingId}-vote-down` },
              classNames: [ 'mynah-vote-label', 'mynah-vote-down' ],
              children: [ new Icon({ icon: MynahIcons.THUMBS_DOWN }).render ],
            },
          ],
        },
      ],
    });
  }

  private readonly handleVoteChange = (vote: RelevancyVoteType, suggestion: Suggestion): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CARD_VOTE, { id: this.votingId, vote });
  };
}
