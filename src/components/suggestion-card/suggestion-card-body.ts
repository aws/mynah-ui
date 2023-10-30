/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import {
  MynahEventNames,
  ReferenceTrackerInformation,
  Suggestion,
} from '../../static';
import { SyntaxHighlighter } from '../syntax-highlighter';
import { MynahUIGlobalEvents } from '../../helper/events';
import { marked } from 'marked';
import unescapeHTML from 'unescape-html';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay/overlay';

const PREVIEW_DELAY = 500;
export const highlightersWithTooltip = {
  start: {
    markupStart: '<mark ',
    markupAttirubtes: (markerIndex: string) => `marker-index=${markerIndex}`,
    markupEnd: ' reference-tracker>'
  },
  end: {
    markup: '</mark>',
  },
};

export interface SuggestionCardBodyProps {
  suggestion: Partial<Suggestion>;
  children?: Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject>;
  highlightRangeWithTooltip?: ReferenceTrackerInformation[];
  showFooterButtons?: boolean;
}
export class SuggestionCardBody {
  render: ExtendedHTMLElement;
  cardBody: ExtendedHTMLElement;
  props: SuggestionCardBodyProps;
  private highlightRangeTooltip: Overlay | null;
  private highlightRangeTooltipTimeout: ReturnType<typeof setTimeout>;
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
        this.cardBody,
        ...(this.props.children ?? [])
      ],
    });
  }

  private readonly processNode = (node: HTMLElement, suggestion?: Partial<Suggestion>, matchingLanguage?: string): HTMLElement => {
    const elementFromNode: HTMLElement = node;
    if (elementFromNode.tagName?.toLowerCase() === 'a') {
      const url = elementFromNode.getAttribute('href') ?? '';
      return DomBuilder.getInstance().build(
        {
          type: 'a',
          events: {
            click: (e?: MouseEvent) => {
              MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SUGGESTION_OPEN, { suggestion: { id: url, url }, event: e });
            },
          },
          attributes: { href: elementFromNode.getAttribute('href') ?? '', target: '_blank' },
          innerHTML: elementFromNode.innerHTML,
        });
    }
    if ((elementFromNode.tagName?.toLowerCase() === 'pre' && elementFromNode.querySelector('code') !== null) ||
      elementFromNode.tagName?.toLowerCase() === 'code'
    ) {
      const isBlockCode = elementFromNode.tagName?.toLowerCase() === 'pre' || elementFromNode.innerHTML.match(/\r|\n/) !== null;
      const codeString = (elementFromNode.tagName?.toLowerCase() === 'pre' ? elementFromNode.querySelector('code') : elementFromNode)?.innerHTML ?? '';

      const highlighter = new SyntaxHighlighter({
        codeStringWithMarkup: unescapeHTML(codeString),
        language: matchingLanguage,
        keepHighlights: true,
        showCopyOptions: isBlockCode,
        block: isBlockCode,
        onCopiedToClipboard: (type, text) => {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.COPY_CODE_TO_CLIPBOARD, {
            type,
            text,
            referenceTrackerInformation: this.getReferenceTrackerInformationFromElement(highlighter)
          });
        },
        onInsertToCursorPosition: (type, text) => {
          MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.INSERT_CODE_TO_CURSOR_POSITION, {
            type,
            text,
            referenceTrackerInformation: this.getReferenceTrackerInformationFromElement(highlighter)
          });
        }
      }).render;
      return highlighter;
    }

    elementFromNode.childNodes.forEach((child) => {
      elementFromNode.replaceChild(this.processNode(child as HTMLElement, suggestion), child);
    });
    return elementFromNode;
  };

  private readonly getReferenceTrackerInformationFromElement = (element: ExtendedHTMLElement | HTMLElement | Element): ReferenceTrackerInformation[] => {
    const markerElements = element.querySelectorAll('mark[reference-tracker]');
    if (markerElements.length > 0) {
      return Array.from(markerElements).map((mark) => {
        return this.props.highlightRangeWithTooltip?.[parseInt(mark.getAttribute('marker-index') ?? '0')];
      }) as ReferenceTrackerInformation[];
    }
    return [];
  };

  private readonly showHighlightRangeTooltip = (e: MouseEvent, tooltipText: string): void => {
    clearTimeout(this.highlightRangeTooltipTimeout);
    this.highlightRangeTooltipTimeout = setTimeout(() => {
      this.highlightRangeTooltip = new Overlay({
        background: false,
        closeOnOutsideClick: false,
        referenceElement: (e.currentTarget ?? e.target) as HTMLElement,
        removeOtherOverlays: true,
        dimOutside: false,
        verticalDirection: OverlayVerticalDirection.TO_TOP,
        horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
        children: [
          {
            type: 'div',
            classNames: [ 'mynah-ui-syntax-highlighter-highlight-tooltip' ],
            children: [
              new SuggestionCardBody({
                suggestion: {
                  body: tooltipText,
                }
              }).render
            ]
          }
        ],
      });
    }, PREVIEW_DELAY);
  };

  private readonly hideHighlightRangeTooltip = (): void => {
    clearTimeout(this.highlightRangeTooltipTimeout);
    if (this.highlightRangeTooltip !== null) {
      this.highlightRangeTooltip?.close();
      this.highlightRangeTooltip = null;
    }
  };

  private readonly getCardBodyChildren = (props: SuggestionCardBodyProps): Array<HTMLElement | ExtendedHTMLElement | DomBuilderObject> => {
    let incomingBody = props.suggestion.body;
    if (props.suggestion.body !== undefined && props.highlightRangeWithTooltip !== undefined && props.highlightRangeWithTooltip.length > 0) {
      props.highlightRangeWithTooltip.forEach((highlightRangeWithTooltip, index) => {
        console.log(highlightRangeWithTooltip);
        if (incomingBody !== undefined) {
          const generatedStartMarkup = `${highlightersWithTooltip.start.markupStart}${highlightersWithTooltip.start.markupAttirubtes(index.toString())}${highlightersWithTooltip.start.markupEnd}`;
          let calculatedStartIndex = (highlightRangeWithTooltip.recommendationContentSpan.start + (index * (generatedStartMarkup.length + highlightersWithTooltip.end.markup.length)));
          let calculatedEndIndex = (calculatedStartIndex + generatedStartMarkup.length - highlightRangeWithTooltip.recommendationContentSpan.start) + highlightRangeWithTooltip.recommendationContentSpan.end;
          if (calculatedEndIndex > incomingBody.length) {
            calculatedStartIndex = incomingBody.length - 1;
          }
          if (calculatedEndIndex > incomingBody.length) {
            calculatedEndIndex = incomingBody.length - 1;
          }
          incomingBody = incomingBody.slice(0, calculatedStartIndex) + generatedStartMarkup + incomingBody.slice(calculatedStartIndex);
          incomingBody = incomingBody.slice(0, calculatedEndIndex) + highlightersWithTooltip.end.markup + incomingBody.slice(calculatedEndIndex);
        }
      });
    }

    return [
      ...(Array.from(
        DomBuilder.getInstance().build({
          type: 'div',
          innerHTML: `${marked((incomingBody as string), { breaks: true })}`,
        }).childNodes
      ).map(node => {
        const processedNode = this.processNode(node as HTMLElement, props.suggestion);
        if (processedNode.querySelectorAll !== undefined) {
          Array.from(processedNode.querySelectorAll('*:empty')).forEach(emptyElement => { emptyElement.remove(); });

          Array.from(processedNode.querySelectorAll('mark[reference-tracker]')).forEach((highlightRangeElement) => {
            highlightRangeElement.addEventListener('mouseenter', (e) => {
              const index = parseInt((e.target as HTMLElement).getAttribute('marker-index') ?? '0');
              if (props.highlightRangeWithTooltip?.[index] !== undefined) {
                this.showHighlightRangeTooltip(e as MouseEvent, props.highlightRangeWithTooltip[index].information);
              }
            });
            highlightRangeElement.addEventListener('mouseleave', this.hideHighlightRangeTooltip);
          });
        }
        return processedNode;
      }))
    ];
  };
}
