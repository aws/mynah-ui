/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import {
  MynahEventNames,
  Suggestion,
} from '../../static';
import { SyntaxHighlighter } from '../syntax-highlighter';
import { MynahUIGlobalEvents } from '../../helper/events';
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
  props: SuggestionCardBodyProps;
  private readonly syntaxHighlighterHighlightWithTooltipRangeItems: Array<Array<{
    range: {
      start: number;
      end: number;
    };
    tooltipMarkdown: string;
  }>> = [ [] ];

  constructor (props: SuggestionCardBodyProps) {
    this.props = props;
    this.cardBody = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-body' ],
      children: this.getCardBodyChildren(this.props),
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-center' ],
      children: [
        this.cardBody
      ],
    });
  }

  private readonly processNode = (node: HTMLElement, suggestion?: Partial<Suggestion>, matchingLanguage?: string): HTMLElement => {
    const elementFromNode: HTMLElement = node;
    if (elementFromNode.tagName?.toLowerCase() === 'span' && elementFromNode.hasAttribute('markdown')) {
      elementFromNode.innerHTML = marked.parse(elementFromNode.innerHTML, {
        breaks: true
      });
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
            node.setAttribute('data-line', '1-3');
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
        highlightRangeWithTooltip: isBlockCode ? this.syntaxHighlighterHighlightWithTooltipRangeItems[0] : undefined,
        showCopyOptions: isBlockCode,
        block: isBlockCode,
        onCopiedToClipboard: (type, text, referenceTrackerInformation) => {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.COPY_CODE_TO_CLIPBOARD, { type, text, referenceTrackerInformation });
        },
        onInsertToCursorPosition: (type, text, referenceTrackerInformation) => {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.INSERT_CODE_TO_CURSOR_POSITION, { type, text, referenceTrackerInformation });
        }
      }).render;
    }

    elementFromNode.childNodes.forEach((child) => {
      elementFromNode.replaceChild(this.processNode(child as HTMLElement, suggestion), child);
    });
    return elementFromNode;
  };

  private readonly getCardBodyChildren = (props: SuggestionCardBodyProps): Array<HTMLElement | ExtendedHTMLElement | DomBuilderObject> => {
    // TODO: Implement the Regex selector solution: props.suggestion.body?.match(/<span\s+start="([^"]+)"\s+end="([^"]+)"[^>]*>.*?<\/span>/g));
    const tempParser = DomBuilder.getInstance().build({
      type: 'div',
      innerHTML: props.suggestion.body
    });
    Array.from(tempParser.querySelectorAll('span[start]')).forEach((syntaxHighlighterHighlightWithTooltipElement) => {
      this.syntaxHighlighterHighlightWithTooltipRangeItems[0].push({
        range: {
          start: parseInt(syntaxHighlighterHighlightWithTooltipElement.getAttribute('start') ?? '0'),
          end: parseInt(syntaxHighlighterHighlightWithTooltipElement.getAttribute('end') ?? '0'),
        },
        tooltipMarkdown: syntaxHighlighterHighlightWithTooltipElement.innerHTML
      });
    });
    const markedString = marked.parse(props.suggestion.body as string, {
      breaks: true
    });
    return [
      ...(Array.from(
        DomBuilder.getInstance().build({
          type: 'div',
          innerHTML: `${markedString}`,
        }).childNodes
      ).map(node => {
        const processedNode = this.processNode(node as HTMLElement, props.suggestion);
        if (processedNode.querySelectorAll !== undefined) {
          Array.from(processedNode.querySelectorAll('*:empty')).forEach(emptyElement => { emptyElement.remove(); });
        }
        return processedNode;
      }))
    ];
  };

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

  public readonly addToCardBody = (elementToAdd: ExtendedHTMLElement | HTMLElement | string): void => {
    this.cardBody.insertChild('beforeend', elementToAdd);
  };
}
