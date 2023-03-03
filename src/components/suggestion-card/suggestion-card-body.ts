/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import {
  CanonicalExample,
  MynahEventNames,
  Suggestion,
  SupportedCodingLanguagesExtensionToTypeMap,
} from '../../static';
import { SyntaxHighlighter } from '../syntax-highlighter';
import { findLanguageFromSuggestion } from '../../helper/find-language';
import { SuggestionCardRelevanceVote } from './suggestion-card-relevance-vote';
import { MynahUIGlobalEvents } from '../../helper/events';
import { SuggestionCard } from './suggestion-card';

export interface SuggestionCardBodyProps {
  suggestion: Suggestion;
}
export class SuggestionCardBody {
  render: ExtendedHTMLElement;

  constructor (props: SuggestionCardBodyProps) {
    const matchingLanguage =
            findLanguageFromSuggestion(props.suggestion) ?? SupportedCodingLanguagesExtensionToTypeMap.js;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-center' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-card-body' ],
          children: [
            ...(Array.from(
              DomBuilder.getInstance().build({
                type: 'div',
                innerHTML: props.suggestion.body,
              }).childNodes
            ).map(node => {
              const elementFromNode: HTMLElement = node as HTMLElement;
              if ((elementFromNode.tagName?.toLowerCase() === 'pre' && elementFromNode.querySelector('code') !== null) ||
              elementFromNode.tagName?.toLowerCase() === 'code'
              ) {
                return new SyntaxHighlighter({
                  codeStringWithMarkup: (elementFromNode.tagName?.toLowerCase() === 'pre' ? elementFromNode.querySelector('code') : elementFromNode)?.innerHTML ?? '',
                  language: matchingLanguage,
                  keepHighlights: true,
                  showCopyOptions: true,
                  onCopiedToClipboard: (type, text) => {
                    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SUGGESTION_COPY_TO_CLIPBOARD, { suggestionId: props.suggestion.url, type, text });
                  },
                }).render;
              }
              return node;
            }) as HTMLElement[]),
            ...(props.suggestion.type === 'ApiDocsSuggestion' && props.suggestion.metadata?.canonicalExample !== undefined
              ? [ new SuggestionCard({
                  suggestion: {
                    title: 'Example',
                    id: '',
                    context: [],
                    ...(props.suggestion.metadata as CanonicalExample)?.canonicalExample,
                  }
                }).render ]
              : [])
          ],
        },
        ...(props.suggestion.type !== 'ApiDocsSuggestion' ? [ new SuggestionCardRelevanceVote({ suggestion: props.suggestion }).render ] : []),
      ],
    });
  }
}
