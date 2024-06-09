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
import { RendererExtensionFunction, marked } from 'marked';
import unescapeHTML from 'unescape-html';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay';
import { SyntaxHighlighter } from '../syntax-highlighter';
import { generateUID } from '../../helper/guid';

const PREVIEW_DELAY = 500;

// Marked doesn't exports it, needs manual addition
interface MarkedExtensions {
  extensions?: null | {
    renderers: {
      [name: string]: RendererExtensionFunction;
    };
    childTokens: {
      [name: string]: string[];
    };
  };
}

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

export const PARTS_CLASS_NAME = 'typewriter-part';
export const PARTS_CLASS_NAME_VISIBLE = 'typewriter';

export interface CardBodyProps {
  body?: string;
  children?: Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject>;
  childLocation?: 'above-body' | 'below-body';
  highlightRangeWithTooltip?: ReferenceTrackerInformation[];
  useParts?: boolean;
  codeBlockStartIndex?: number;
  processChildren?: boolean;
  classNames?: string[];
  onLinkClick?: (url: string, e: MouseEvent) => void;
  onCopiedToClipboard?: OnCopiedToClipboardFunction;
  onInsertToCursorPosition?: OnInsertToCursorPositionFunction;
}
export class CardBody {
  render: ExtendedHTMLElement;
  props: CardBodyProps;
  nextCodeBlockIndex: number = 0;
  codeBlockStartIndex: number = 0;
  private highlightRangeTooltip: Overlay | null;
  private highlightRangeTooltipTimeout: ReturnType<typeof setTimeout>;
  constructor (props: CardBodyProps) {
    this.codeBlockStartIndex = props.codeBlockStartIndex ?? 0;
    this.props = props;
    const childList = [
      ...this.getContentBodyChildren(this.props),
      ...(this.props.children != null
        ? this.props.processChildren === true
          ? this.props.children.map(node => {
            const processedNode = this.processNode(node as HTMLElement);
            if (processedNode.querySelectorAll !== undefined) {
              Array.from(processedNode.querySelectorAll('*:empty:not(img):not(br):not(hr)')).forEach(emptyElement => { emptyElement.remove(); });
            }
            return processedNode;
          })
          : this.props.children
        : [])
    ];
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-card-body', ...(this.props.classNames ?? []) ],
      children: this.props.childLocation === 'above-body' ? childList.reverse() : childList,
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

  private readonly processNode = (node: HTMLElement): HTMLElement => {
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
            auxclick: (e: MouseEvent) => {
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
        language: snippetLanguage?.trim() !== '' ? snippetLanguage : '',
        keepHighlights: true,
        showCopyOptions: isBlockCode,
        block: isBlockCode,
        index: isBlockCode ? this.nextCodeBlockIndex : undefined,
        onCopiedToClipboard: this.props.onCopiedToClipboard != null
          ? (type, text, codeBlockIndex) => {
              if (this.props.onCopiedToClipboard != null) {
                this.props.onCopiedToClipboard(
                  type,
                  text,
                  this.getReferenceTrackerInformationFromElement(highlighter),
                  this.codeBlockStartIndex + (codeBlockIndex ?? 0),
                  this.nextCodeBlockIndex);
              }
            }
          : undefined,
        onInsertToCursorPosition: this.props.onInsertToCursorPosition != null
          ? (type, text, codeBlockIndex) => {
              if (this.props.onInsertToCursorPosition != null) {
                this.props.onInsertToCursorPosition(
                  type,
                  text,
                  this.getReferenceTrackerInformationFromElement(highlighter),
                  this.codeBlockStartIndex + (codeBlockIndex ?? 0),
                  this.nextCodeBlockIndex);
              }
            }
          : undefined
      }).render;
      if (this.props.useParts === true) {
        highlighter.classList.add(PARTS_CLASS_NAME);
      }
      if (isBlockCode) {
        ++this.nextCodeBlockIndex;
      }
      return highlighter;
    }

    elementFromNode.childNodes?.forEach((child) => {
      elementFromNode.replaceChild(this.processNode(child as HTMLElement), child);
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
                (originalRefTrackerInfo?.recommendationContentSpan?.end ?? 0) -
                (originalRefTrackerInfo?.recommendationContentSpan?.start ?? 0))
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
        background: true,
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

  /**
   * Returns extension additions
   * @returns marked options extensions
   */
  private readonly getMarkedExtensions = (): MarkedExtensions => {
    return {
      extensions: {
        renderers: {
          text: (token) => {
            if (this.props.useParts === true) {
              // We should skip words inside code blocks
              // In general code blocks getting rendered before the text items
              // However for listitems, the case is different
              // We still need to check if the word is a code field start,
              // is it inside a code field or is it a code field end
              let codeOpen = false;
              return token.text.split(' ').map((textPart: string) => {
                if (textPart.match(/`/) != null) {
                  // revert the code field open state back
                  // or restart the open state of code field
                  codeOpen = !codeOpen;
                  // open or close state
                  // return the text as is
                  return textPart;
                }

                // if inside code field
                // return text as is
                if (codeOpen) {
                  return textPart;
                }

                // otherwise add typewriter animation wrapper
                return `<span class="${PARTS_CLASS_NAME}">${textPart}</span>`;
              }).join(' ');
            }
            return token.text;
          }
        },
        childTokens: {}
      }
    };
  };

  private readonly getContentBodyChildren = (props: CardBodyProps): Array<HTMLElement | ExtendedHTMLElement | DomBuilderObject> => {
    if (props.body != null && props.body.trim() !== '') {
      let incomingBody = props.body;
      if (props.body !== undefined && props.highlightRangeWithTooltip !== undefined && props.highlightRangeWithTooltip.length > 0) {
        props.highlightRangeWithTooltip.forEach((highlightRangeWithTooltip, index) => {
          if (incomingBody !== undefined && highlightRangeWithTooltip.recommendationContentSpan !== undefined) {
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
            innerHTML: `${marked.parse(incomingBody, {
              breaks: true,
              ...this.getMarkedExtensions()
            }) as string}`,
          }).childNodes
        ).map(node => {
          const processedNode = this.processNode(node as HTMLElement);
          if (processedNode.querySelectorAll !== undefined) {
            Array.from(processedNode.querySelectorAll('*:empty:not(img):not(br):not(hr)')).forEach(emptyElement => { emptyElement.remove(); });
          }
          return processedNode;
        }))
      ];
    }

    return [];
  };
}
