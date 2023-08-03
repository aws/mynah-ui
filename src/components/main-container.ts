/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { MynahUIDataStore } from '../helper/store';
import { SearchPayloadCodeSelection, Suggestion } from '../static';
import { NavivationTabs } from './navigation-tabs';
import { SuggestionCard } from './suggestion-card/suggestion-card';
import { SuggestionSkeleton } from './suggestion-card/suggestion-skeleton';
import { ToggleOption } from './toggle';

export interface MainContainerProps {
  onNavigationTabChange?: (selectedTab: string) => void;
}
export class MainContainer {
  private readonly navTabs: NavivationTabs;
  private readonly cardsWrapper: ExtendedHTMLElement;
  private readonly skeletonWrapper: ExtendedHTMLElement;
  private readonly mainContainer: ExtendedHTMLElement;
  public render: ExtendedHTMLElement;
  constructor (props: MainContainerProps) {
    this.cardsWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-cards-wrapper' ],
      persistent: true,
    });
    this.skeletonWrapper = new SuggestionSkeleton().render;

    this.navTabs = new NavivationTabs({
      onChange: (selectedTab: string) => {
        if (props.onNavigationTabChange !== undefined) {
          MynahUIDataStore.getInstance().updateStore({
            navigationTabs: MynahUIDataStore.getInstance().getValue('navigationTabs').map((navTab: ToggleOption) => ({ ...navTab, selected: navTab.value === selectedTab }))
          }, true);
          props.onNavigationTabChange(selectedTab);
        }

        MynahUIDataStore.getInstance().updateStore({
          ...(MynahUIDataStore.getInstance().getValue('showingHistoricalSearch') === true
            ? {
                headerInfo: {
                  content: ''
                },
                showingHistoricalSearch: false,
              }
            : {}),
        });
      }
    });

    this.mainContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-main' ],
      children: [ this.cardsWrapper, this.skeletonWrapper ],
    });
    this.render = DomBuilder.getInstance().build({
      persistent: true,
      type: 'div',
      classNames: [ 'mynah-main-wrapper' ],
      children: [
        this.navTabs.render,
        this.mainContainer,
      ],
    });

    MynahUIDataStore.getInstance().subscribe('suggestions', this.updateCards);
    MynahUIDataStore.getInstance().subscribe('loading', (loading: boolean) => {
      if (loading) {
        this.clearCards();
      }
    });
  }

  clearCards = (): void => {
    this.mainContainer.removeClass('mynah-hide-content').removeClass('mynah-show-content');
    setTimeout(() => {
      this.mainContainer.addClass('mynah-hide-content');
    }, 10);
  };

  updateCards = (suggestions: Suggestion[]): void => {
    setTimeout(() => {
      this.cardsWrapper.clear();
      if (suggestions.length === 0 && (MynahUIDataStore.getInstance().getValue('query') !== '' || (MynahUIDataStore.getInstance().getValue('codeSelection') as SearchPayloadCodeSelection).selectedCode !== '')) {
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
              showFooterButtons: true
            }).render
          );
        });
      }

      setTimeout(() => {
        this.mainContainer.addClass('mynah-show-content');
      }, 10);
    }, 250);
  };
}
