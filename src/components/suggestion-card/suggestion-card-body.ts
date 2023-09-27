/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
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
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';
import { marked } from 'marked';

export interface SuggestionCardBodyProps {
  suggestion: Partial<Suggestion>;
  showFooterButtons?: boolean;
  onLinkMouseEnter?: (e: MouseEvent, url: string) => void;
  onLinkMouseLeave?: (e: MouseEvent, url: string) => void;
}
export class SuggestionCardBody {
  render: ExtendedHTMLElement;
  cardBody: ExtendedHTMLElement;
  matchingLanguage: string;
  props: SuggestionCardBodyProps;

  constructor (props: SuggestionCardBodyProps) {
    this.props = props;
    this.matchingLanguage =
      findLanguageFromSuggestion(props.suggestion) ?? SupportedCodingLanguagesExtensionToTypeMap.js;
    this.cardBody = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-body' ],
      children: this.getCardBodyChildren(this.props),
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-center' ],
      children: [
        this.cardBody,
        ...(props.suggestion.type !== undefined && props.suggestion.type !== 'ApiDocsSuggestion'
          ? [ new SuggestionCardRelevanceVote({ suggestion: props.suggestion as Required<Suggestion> }).render ]
          : []),
        ...(props.showFooterButtons === true
          ? [ new Button({
              classNames: [ 'mynah-card-under-body-button' ],
              primary: false,
              label: 'Follow up in chat',
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

  private readonly processNode = (node: HTMLElement, suggestion?: Partial<Suggestion>, matchingLanguage?: string): HTMLElement => {
    const elementFromNode: HTMLElement = node;
    if (elementFromNode.tagName?.toLowerCase() === 'span' && elementFromNode.hasAttribute('markdown')) {
      elementFromNode.innerHTML = marked(elementFromNode.innerHTML);
      Array.from(elementFromNode.getElementsByTagName('a')).forEach(a => {
        const url = a.href;

        a.onclick = (event?: MouseEvent) => {
          MynahUIGlobalEvents
            .getInstance()
            .dispatch(MynahEventNames.SUGGESTION_OPEN, {
              suggestion: { id: url, url },
              event,
            });
        };
      });

      return DomBuilder.getInstance().build({
        type: 'div',
        children: (Array.from(elementFromNode.childNodes) as HTMLElement[]).map(node => {
          let language = matchingLanguage;
          const classes = node.getAttribute !== undefined ? node.getAttribute('class') : null;
          if (node.nodeName === 'PRE' && classes !== null && classes.includes('language-')) {
            language = classes.replace('language-', '');
          }
          return this.processNode(node, suggestion, language);
        })
      });
    }

    if (elementFromNode.tagName?.toLowerCase() === 'a') {
      const url = elementFromNode.getAttribute('href') ?? '';
      return DomBuilder.getInstance().build(
        {
          type: 'a',
          events: {
            click: (e?: MouseEvent) => {
              MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SUGGESTION_OPEN, { suggestion: { id: url, url }, event: e });
            },
            mouseenter: (e: MouseEvent) => {
              if (this.props.onLinkMouseEnter !== undefined) {
                this.props.onLinkMouseEnter(e, url);
              }
            },
            mouseleave: (e: MouseEvent) => {
              if (this.props.onLinkMouseLeave !== undefined) {
                this.props.onLinkMouseLeave(e, url);
              }
            }
          },
          attributes: { href: elementFromNode.getAttribute('href') ?? '', target: '_blank' },
          innerHTML: elementFromNode.innerHTML,
        });
    }
    if ((elementFromNode.tagName?.toLowerCase() === 'pre' && elementFromNode.querySelector('code') !== null) ||
      elementFromNode.tagName?.toLowerCase() === 'code'
    ) {
      const isBlockCode = elementFromNode.tagName?.toLowerCase() === 'pre' || elementFromNode.innerHTML.match(/\r|\n/) !== null;

      return new SyntaxHighlighter({
        codeStringWithMarkup: (elementFromNode.tagName?.toLowerCase() === 'pre' ? elementFromNode.querySelector('code') : elementFromNode)?.innerHTML ?? '',
        language: matchingLanguage,
        keepHighlights: true,
        showCopyOptions: isBlockCode,
        block: isBlockCode,
        onCopiedToClipboard: (type, text) => {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.COPY_CODE_TO_CLIPBOARD, { type, text });
        },
        onInsertToCursorPosition: (type, text) => {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.INSERT_CODE_TO_CURSOR_POSITION, { type, text });
        }
      }).render;
    }

    elementFromNode.childNodes.forEach((child) => {
      elementFromNode.replaceChild(this.processNode(child as HTMLElement, suggestion), child);
    });

    return elementFromNode;
  };

  private readonly getCardBodyChildren = (props: SuggestionCardBodyProps): Array<HTMLElement | ExtendedHTMLElement | DomBuilderObject> => [
    ...(Array.from(
      DomBuilder.getInstance().build({
        type: 'div',
        innerHTML: `${marked(props.suggestion.body as string)}`,
      }).childNodes
    ).map(node => {
      return this.processNode(node as HTMLElement, props.suggestion, this.matchingLanguage);
    })),
    ...(props.suggestion.type === 'ApiDocsSuggestion' && props.suggestion.metadata?.canonicalExample !== undefined
      ? [ new SuggestionCard({
          suggestion: {
            title: 'Example',
            ...(props.suggestion.metadata as CanonicalExample)?.canonicalExample,
          }
        }).render ]
      : [])
  ];

  public readonly updateCardBody = (body: string): void => {
    this.cardBody.update({
      children: this.getCardBodyChildren({
        ...this.props,
        suggestion: {
          ...this.props.suggestion,
          body
        }
      })
    });
  };
}
