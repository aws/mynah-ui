/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { AutocompleteItem, KeyMap, MynahEventNames, SearchHistoryFilters, SearchHistoryItem, SearchPayloadCodeSelection } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { HistoryContent } from './search-history-content';
import { AutocompleteContent } from './autocomplete-content';
import { I18N } from '../../translations/i18n';
import { cancelEvent, MynahUIGlobalEvents } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';

export class SearchInput {
  render: ExtendedHTMLElement;
  private searchTextInput: ExtendedHTMLElement;
  private readonly searchButton: ExtendedHTMLElement;
  private readonly searchHistoryButton: ExtendedHTMLElement;
  private readonly remainingIndicator: ExtendedHTMLElement;
  private autocompleteContent: AutocompleteContent | undefined;
  private readonly allowedCharCount: number = 1000;
  private codeSelectionAvailable: boolean = false;
  constructor () {
    const initText = MynahUIDataStore.getInstance().getValue('query');
    this.codeSelectionAvailable = MynahUIDataStore.getInstance().getValue('codeSelection').selectedCode !== '';

    const classNames = [ 'mynah-search-input' ];
    if (this.codeSelectionAvailable) {
      classNames.push('search-always-active');
    }

    this.searchTextInput = DomBuilder.getInstance().build({
      type: 'input',
      classNames,
      attributes: {
        tabindex: '1',
        maxlength: '1000',
        type: 'text',
        placeholder:
        this.codeSelectionAvailable
          ? I18N.getInstance().texts.searchInputAPIHelpPlaceholder
          : I18N.getInstance().texts.searchInputMynahPlaceholder,
        value: initText ?? '',
      },
      events: {
        keyup: this.handleInputKeydown.bind(this),
      },
    });
    this.searchButton = new Button({
      classNames: [ 'mynah-icon-button', 'mynah-search-button' ],
      attributes: { tabindex: '5' },
      icon: DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-mutating-next-icon' ],
        children: [
          new Icon({ icon: MynahIcons.SEARCH }).render,
          { type: 'i', classNames: [ 'mynah-loading-spinner' ] },
        ],
      }),
      onClick: () => {
        this.triggerSearch();
      },
    }).render;
    this.searchHistoryButton = new Button({
      classNames: [ 'mynah-icon-button' ],
      primary: false,
      attributes: { tabindex: '5' },
      icon: DomBuilder.getInstance().build({
        type: 'div',
        classNames: [ 'mynah-search-history-icon' ],
        children: [
          new Icon({ icon: MynahIcons.SEARCH_HISTORY }).render,
          { type: 'i', classNames: [ 'mynah-history-icon' ] },
        ],
      }),
      onClick: this.triggerSearchHistory.bind(this),
    }).render;

    this.remainingIndicator = DomBuilder.getInstance().build({
      type: 'span',
      attributes: {
        'remaining-chars': (initText !== undefined && initText.length > 0
          ? this.allowedCharCount - initText.length
          : this.allowedCharCount
        ).toString(),
        'max-chars': this.allowedCharCount.toString(),
      },
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-search-input-wrapper' ],
      children: [
        this.searchTextInput,
        this.remainingIndicator,
        this.searchHistoryButton,
        this.searchButton,
      ],
    });

    MynahUIDataStore.getInstance().subscribe('query', (query: string) => {
      this.searchTextInput.value = query;
      this.remainingIndicator.update({
        attributes: {
          'remaining-chars': (this.allowedCharCount - this.searchTextInput.value.length).toString(),
        },
      });
    });

    MynahUIDataStore.getInstance().subscribe('autoCompleteSuggestions', (autoCompleteList: AutocompleteItem[]) => {
      this.handleAutocompleteSuggestions(this.searchTextInput.value, autoCompleteList);
    });

    MynahUIDataStore.getInstance().subscribe('loading', (loading: boolean) => {
      this.setWaitState(loading);
    });

    MynahUIDataStore.getInstance().subscribe('codeSelection', (codeSelection: SearchPayloadCodeSelection) => {
      if (codeSelection.selectedCode !== '') {
        this.codeSelectionAvailable = true;
        this.searchTextInput.addClass('search-always-active');
        this.searchTextInput.setAttribute('placeholder', I18N.getInstance().texts.searchInputAPIHelpPlaceholder);
      } else {
        this.codeSelectionAvailable = false;
        this.searchTextInput.removeClass('search-always-active');
        this.searchTextInput.setAttribute('placeholder', I18N.getInstance().texts.searchInputMynahPlaceholder);
      }
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.AUTOCOMPLETE_SUGGESTION_CLICK, (data: {
      autocompleteQuery: AutocompleteItem;
      autocompleteSuggestionSelected: number;
      autocompleteSuggestionsCount: number;}) => {
      this.searchTextInput.value = data.autocompleteQuery.suggestion;
      this.remainingIndicator.update({
        attributes: {
          'remaining-chars': (this.allowedCharCount - this.searchTextInput.value.length).toString(),
        },
      });
      this.autocompleteContent?.close();
      this.triggerSearch(true);
    });
  }

  public addFocusOnInput = (): void => {
    this.searchTextInput.focus();
  };

  private readonly handleInputKeydown = (e: KeyboardEvent): void => {
    if (e.key === KeyMap.ENTER) {
      cancelEvent(e);
      this.triggerSearch();
    } else if (e.key === KeyMap.ARROW_DOWN) {
      if (this.autocompleteContent !== undefined) {
        this.searchTextInput.value = this.autocompleteContent.hover(false);
      }
    } else if (e.key === KeyMap.ARROW_UP) {
      if (this.autocompleteContent !== undefined) {
        this.searchTextInput.value = this.autocompleteContent.hover(true);
      }
    } else if (
      e.key === KeyMap.DELETE ||
            e.key === KeyMap.BACKSPACE ||
            !Object.values<string>(KeyMap).includes(e.key)
    ) {
      MynahUIGlobalEvents.getInstance().dispatch(
        MynahEventNames.REQUEST_AUTOCOMPLETE_SUGGESTIONS,
        { input: this.searchTextInput.value });
    }
    this.remainingIndicator.update({
      attributes: {
        'remaining-chars': (this.allowedCharCount - this.searchTextInput.value.length).toString(),
      },
    });
  };

  private readonly triggerSearch = (isFromAutocomplete?: boolean): void => {
    if (this.codeSelectionAvailable || this.searchTextInput.value.trim() !== '') {
      MynahUIDataStore.getInstance().updateStore({
        query: this.searchTextInput.value
      });
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SEARCH, {
        query: this.searchTextInput.value,
        isFromAutocomplete
      });
    }
  };

  private readonly triggerSearchHistory = (): void => {
    const filters: SearchHistoryFilters = {
      isGlobal: false,
      languages: [],
      resultOffset: 0,
      resultLimit: 50,
    };
    this.searchHistoryButton.addClass('mynah-button-wait');
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.REQUEST_SEARCH_HISTORY, {
      filters
    });
    const searchHistorySubscriptionId = MynahUIDataStore.getInstance().subscribe('searchHistory', (searchHistory: SearchHistoryItem[]) => {
      this.searchHistoryButton.removeClass('mynah-button-wait');
      const historyContent = new HistoryContent({
        referenceElement: this.searchHistoryButton,
        searchHistory,
      });
      historyContent.createOverlay();
      MynahUIDataStore.getInstance().unsubscribe('searchHistory', searchHistorySubscriptionId);
    });
  };

  private readonly handleAutocompleteSuggestions = (input: string, autocompleteSuggestions: AutocompleteItem[]): void => {
    if (input.trim() === '') {
      this.autocompleteContent?.close();
    } else {
      if (this.autocompleteContent !== undefined) {
        if (autocompleteSuggestions.length === 0) {
          this.autocompleteContent?.close();
        } else {
          this.autocompleteContent.updateQuery(input);
          this.autocompleteContent.updateSuggestions(autocompleteSuggestions, 0);
        }
      } else if (autocompleteSuggestions.length !== 0) {
        this.autocompleteContent = new AutocompleteContent({
          searchQuery: input,
          referenceElement: this.searchTextInput,
          autocompleteSuggestions,
          onClose: () => {
            this.autocompleteContent = undefined;
          },
        });
      }
    }
  };

  private readonly setWaitState = (waitState?: boolean): void => {
    if (waitState ?? false) {
      this.searchButton.addClass('mynah-button-wait');
    } else {
      this.searchButton.removeClass('mynah-button-wait');
    }
  };
}
