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
import MarkdownIt from 'markdown-it';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';

export interface SuggestionCardBodyProps {
  suggestion: Partial<Suggestion>;
  showFooterButtons?: boolean;
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
              } else if (elementFromNode.tagName?.toLowerCase() === 'span' && elementFromNode.hasAttribute('markdown')) {
                const md = new MarkdownIt();
                const mdToHTML = md.render(elementFromNode.innerHTML);
                elementFromNode.innerHTML = mdToHTML;
                return elementFromNode;
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
        ...(props.suggestion.type !== undefined && props.suggestion.type !== 'ApiDocsSuggestion'
          ? [ new SuggestionCardRelevanceVote({ suggestion: props.suggestion as Required<Suggestion> }).render ]
          : []),
        ...(props.showFooterButtons === true
          ? [ new Button({
              classNames: [ 'mynah-card-under-body-button' ],
              primary: false,
              label: 'Attach to chat',
              icon: DomBuilder.getInstance().build({
                type: 'div',
                children: [
                  new Icon({ icon: MynahIcons.CHAT }).render,
                ],
              }),
              onClick: () => {
                MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SUGGESTION_ATTACHED_TO_CHAT, props.suggestion);
              },
            }).render ]
          : []),
      ],
    });
  }
}
