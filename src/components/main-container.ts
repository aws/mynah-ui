/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { OnCopiedToClipboardFunctionWithSuggestionId, RelevancyVoteType, Suggestion, SuggestionEngagement } from '../static';
import { SuggestionCard } from './suggestion-card/suggestion-card';

export interface MainContainerProps {
  onSuggestionOpen?: (suggestion: Suggestion) => void;
  onSuggestionLinkClick?: (suggestion: Suggestion) => void;
  onSuggestionLinkCopy?: (suggestion: Suggestion) => void;
  onSuggestionEngaged?: (engagementInfo: SuggestionEngagement) => void;
  onCopiedToClipboard?: OnCopiedToClipboardFunctionWithSuggestionId;
  onVoteChange: (suggestion: Suggestion, vote: RelevancyVoteType) => void;
  onScroll?: (e: Event) => void;
}
export class MainContainer {
  private readonly onSuggestionOpen;
  private readonly onSuggestionLinkClick;
  private readonly onSuggestionLinkCopy;
  private readonly onSuggestionEngaged;
  private readonly onCopiedToClipboard;
  private readonly onVoteChange;
  private readonly cardsWrapper: ExtendedHTMLElement;
  private readonly skeletonWrapper: ExtendedHTMLElement;
  public render: ExtendedHTMLElement;
  constructor (props: MainContainerProps) {
    this.onVoteChange = props.onVoteChange;
    this.onSuggestionOpen = props.onSuggestionOpen;
    this.onSuggestionLinkClick = props.onSuggestionLinkClick;
    this.onSuggestionLinkCopy = props.onSuggestionLinkCopy;
    this.onSuggestionEngaged = props.onSuggestionEngaged;
    this.onCopiedToClipboard = props.onCopiedToClipboard;
    this.cardsWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-cards-wrapper' ],
      events: { ...(props.onScroll !== undefined && { scroll: props.onScroll }) },
      persistent: true,
    });
    this.skeletonWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-skeleton-wrapper' ],
      persistent: true,
      children: [
        new SuggestionCard({
          onVoteChange: this.onVoteChange,
          suggestion: {
            title: 'Lorem ipsum dolor sit',
            url: '#mynahisawesome.com/mynah',
            body: `<p>Lorem ipsum dolor sit amet</p>
                      <p>Nunc sit amet nulla sit amet est rhoncus ornare. In sodales tristique finibus.</p>
                      <pre><code>lorem sit amet</code></pre>`,
            id: 'skeleton-1',
            context: [ 'skl-con-1', 'skl-con-2' ],
          },
        }).render.addClass('mynah-card-skeleton'),
        new SuggestionCard({
          onVoteChange: this.onVoteChange,
          suggestion: {
            title: 'Lorem ipsum dolor sit',
            url: '#mynahismorenadmoreawesome.com/mynah',
            body: `<p>Lorem ipsum dolor sit amet</p>
                      <pre><code>sit amet
                      loremasdasdsadasdasdasd
                      asd</code></pre>`,
            id: 'skeleton-2',
            context: [ 'skl-con-3', 'skl-con-4' ],
          },
        }).render.addClass('mynah-card-skeleton'),
      ],
    });

    this.render = DomBuilder.getInstance().build({
      persistent: true,
      type: 'div',
      classNames: [ 'mynah-main' ],
      children: [ this.cardsWrapper, this.skeletonWrapper ],
    });
  }

  clearCards = (): void => {
    this.render.removeClass('mynah-hide-content').removeClass('mynah-show-content');
    setTimeout(() => {
      this.render.addClass('mynah-hide-content');
    }, 10);
  };

  updateCards = (suggestions: Suggestion[]): void => {
    setTimeout(() => {
      this.cardsWrapper.clear();
      if (suggestions.length === 0) {
        this.cardsWrapper.insertChild(
          'beforeend',
          DomBuilder.getInstance().build({
            type: 'div',
            classNames: [ 'mynah-no-suggestion-indicator' ],
            children: [
              {
                type: 'span',
                children: [
                  "We couldn't find any relevant results with your search. Please refine your search and try again.",
                ],
              },
            ],
          }) as HTMLElement
        );
      } else {
        suggestions.forEach((suggestion, index) => {
          this.cardsWrapper.insertChild(
            'beforeend',
            new SuggestionCard({
              suggestion,
              onVoteChange: this.onVoteChange,
              onSuggestionOpen: this.onSuggestionOpen?.bind(this),
              onSuggestionLinkClick: this.onSuggestionLinkClick?.bind(this),
              onSuggestionLinkCopy: this.onSuggestionLinkCopy?.bind(this),
              onSuggestionEngaged: this.onSuggestionEngaged?.bind(this),
              onCopiedToClipboard: this.onCopiedToClipboard?.bind(this),
            }).render
          );
        });
      }

      setTimeout(() => {
        this.render.addClass('mynah-show-content');
      }, 10);
    }, 250);
  };
}
