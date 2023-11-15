/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, DomBuilderObject, ExtendedHTMLElement } from '../../helper/dom';
import {
  OnCopiedToClipboardFunction,
  OnInsertToCursorPositionFunction,
  ReferenceTrackerInformation,
} from '../../static';
import { marked } from 'marked';
import unescapeHTML from 'unescape-html';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay';
import { SyntaxHighlighter } from '../syntax-highlighter';
import { generateUID } from '../../helper/guid';

const PREVIEW_DELAY = 500;
export const highlightersWithTooltip = {
  start: {
    markupStart: '<mark ',
    markupAttributes: (markerIndex: string) => `marker-index=${markerIndex}`,
    markupEnd: ' reference-tracker>'
  },
  end: {
    markup: '</mark>',
  },
};

export interface CardBodyProps {
  body: string;
  children?: Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject>;
  highlightRangeWithTooltip?: ReferenceTrackerInformation[];
  onLinkClick?: (url: string, e: MouseEvent) => void;
  onCopiedToClipboard?: OnCopiedToClipboardFunction;
  onInsertToCursorPosition?: OnInsertToCursorPositionFunction;
}
export class CardBody {
  render: ExtendedHTMLElement;
  props: CardBodyProps;
  private highlightRangeTooltip: Overlay | null;
  private highlightRangeTooltipTimeout: ReturnType<typeof setTimeout>;
  constructor (props: CardBodyProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-body' ],
      children: [
        ...this.getContentBodyChildren(this.props),
        ...(this.props.children ?? [])
      ],
    });

    Array.from(this.render.querySelectorAll('mark[reference-tracker]')).forEach((highlightRangeElement) => {
      highlightRangeElement.addEventListener('mouseenter', (e) => {
        const index = parseInt((e.target as HTMLElement).getAttribute('marker-index') ?? '0');
        if (props.highlightRangeWithTooltip?.[index] !== undefined) {
          this.showHighlightRangeTooltip(e as MouseEvent, props.highlightRangeWithTooltip[index].information);
        }
      });
      highlightRangeElement.addEventListener('mouseleave', this.hideHighlightRangeTooltip);
    });
  }

  private readonly processNode = (node: HTMLElement, contentString: string, matchingLanguage?: string): HTMLElement => {
    const elementFromNode: HTMLElement = node;
    if (elementFromNode.tagName?.toLowerCase() === 'a') {
      const url = elementFromNode.getAttribute('href') ?? '';
      return DomBuilder.getInstance().build(
        {
          type: 'a',
          events: {
            click: (e: MouseEvent) => {
              if (this.props.onLinkClick !== undefined) {
                this.props.onLinkClick(url, e);
              }
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
      const codeElement = (elementFromNode.tagName?.toLowerCase() === 'pre' ? elementFromNode.querySelector('code') : elementFromNode);
      const snippetLanguage = Array.from(codeElement?.classList ?? []).find(className => className.match('language-'))?.replace('language-', '');
      const codeString = codeElement?.innerHTML ?? '';

      const highlighter = new SyntaxHighlighter({
        codeStringWithMarkup: unescapeHTML(codeString),
        language: snippetLanguage?.trim() !== '' ? snippetLanguage : matchingLanguage,
        keepHighlights: true,
        showCopyOptions: isBlockCode,
        block: isBlockCode,
        onCopiedToClipboard: (type, text) => {
          if (this.props.onCopiedToClipboard != null) {
            this.props.onCopiedToClipboard(type, text, this.getReferenceTrackerInformationFromElement(highlighter));
          }
        },
        onInsertToCursorPosition: (type, text) => {
          if (this.props.onInsertToCursorPosition != null) {
            this.props.onInsertToCursorPosition(type, text, this.getReferenceTrackerInformationFromElement(highlighter));
          }
        }
      }).render;
      return highlighter;
    }

    elementFromNode.childNodes.forEach((child) => {
      elementFromNode.replaceChild(this.processNode(child as HTMLElement, contentString), child);
    });
    return elementFromNode;
  };

  private readonly getReferenceTrackerInformationFromElement = (element: ExtendedHTMLElement | HTMLElement): ReferenceTrackerInformation[] => {
    // cloning the element
    // since we're gonna inject some unique items
    // to get the start indexes
    const codeElement = element.querySelector('code')?.cloneNode(true) as HTMLElement;

    if (codeElement !== undefined) {
      const markerElements = codeElement.querySelectorAll('mark[reference-tracker]');
      if (markerElements.length > 0) {
        return (Array.from(markerElements) as HTMLElement[]).map((mark: HTMLElement, index: number) => {
          // Generating a unique identifier element
          // to get the start index of it inside the code block
          const startIndexText = `__MARK${index}_${generateUID()}_START__`;
          const startIndexTextElement = DomBuilder.getInstance().build({
            type: 'span',
            innerHTML: startIndexText
          });
          // Injecting that unique identifier for the start index inside the current mark element
          mark.insertAdjacentElement('afterbegin', startIndexTextElement);
          // finding that text inside the code element's inner text
          // to get the startIndex
          const startIndex = codeElement.innerText.indexOf(startIndexText);

          // when we get the start index, we need to remove the element
          // to get the next one's start index properly
          // we don't need to calculate the end index because it will be available
          startIndexTextElement.remove();

          // find the original reference tracker information
          const originalRefTrackerInfo = this.props.highlightRangeWithTooltip?.[parseInt(mark.getAttribute('marker-index') ?? '0')];
          return {
            ...originalRefTrackerInfo,
            recommendationContentSpan: {
              start: startIndex,
              end: startIndex + (
                (originalRefTrackerInfo?.recommendationContentSpan.end ?? 0) -
                (originalRefTrackerInfo?.recommendationContentSpan.start ?? 0))
            }
          };
        }) as ReferenceTrackerInformation[];
      }
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
              new CardBody({
                body: tooltipText,
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

  private readonly getContentBodyChildren = (props: CardBodyProps): Array<HTMLElement | ExtendedHTMLElement | DomBuilderObject> => {
    let incomingBody = props.body;
    if (props.body !== undefined && props.highlightRangeWithTooltip !== undefined && props.highlightRangeWithTooltip.length > 0) {
      props.highlightRangeWithTooltip.forEach((highlightRangeWithTooltip, index) => {
        if (incomingBody !== undefined) {
          const generatedStartMarkup = `${highlightersWithTooltip.start.markupStart}${highlightersWithTooltip.start.markupAttributes(index.toString())}${highlightersWithTooltip.start.markupEnd}`;
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
          innerHTML: `${marked((incomingBody), { breaks: true })}`,
        }).childNodes
      ).map(node => {
        const processedNode = this.processNode(node as HTMLElement, props.body);
        if (processedNode.querySelectorAll !== undefined) {
          Array.from(processedNode.querySelectorAll('*:empty')).forEach(emptyElement => { emptyElement.remove(); });
        }
        return processedNode;
      }))
    ];
  };
}
