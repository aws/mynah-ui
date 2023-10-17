/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement, htmlDecode } from '../helper/dom';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import {
  OnCopiedToClipboardFunction,
  OnInsertToCursorPositionFunction,
  ReferenceTrackerInformation,
} from '../static';
import { Button } from './button';
import { Notification } from './notification/notification';
import { Icon, MynahIcons } from './icon';
import { cancelEvent } from '../helper/events';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from './overlay/overlay';
import { SuggestionCardBody } from './suggestion-card/suggestion-card-body';

const DEFAULT_LANG = 'typescript';

// they'll be used to replaced within the code, so making them unique is a must
export const highlighters = {
  start: {
    markup: '<span class="amzn-mynah-search-result-highlight">',
    textReplacement: '__mynahhighlighterstart__',
  },
  end: {
    markup: '</span>',
    textReplacement: '__mynahhighlighterend__',
  },
};
export const highlightersWithTooltip = {
  start: {
    markup: '<mark class="amzn-mynah-ui-reference-tracker-highlight">',
    textReplacement: '__mynahhighlighterwithtooltipstart__',
  },
  end: {
    markup: '</mark>',
    textReplacement: '__mynahhighlighterwithtooltipend__',
  },
};
export const ellipsis = {
  start: {
    markup: '<span class="amzn-mynah-search-result-ellipsis">',
    textReplacement: '__mynahcodeellipsisstart__',
  },
  end: {
    markup: '</span>',
    textReplacement: '__mynahcodeellipsisend__',
  },
};

export interface SyntaxHighlighterProps {
  codeStringWithMarkup: string;
  language?: string;
  keepHighlights?: boolean;
  showLineNumbers?: boolean;
  block?: boolean;
  startingLineNumber?: number;
  showCopyOptions?: boolean;
  highlightRangeWithTooltip?: ReferenceTrackerInformation[];
  onCopiedToClipboard?: OnCopiedToClipboardFunction;
  onInsertToCursorPosition?: OnInsertToCursorPositionFunction;
}
const PREVIEW_DELAY = 500;

export class SyntaxHighlighter {
  private readonly onCopiedToClipboard?: OnCopiedToClipboardFunction;
  private readonly onInsertToCursorPosition?: OnInsertToCursorPositionFunction;
  private readonly highlightRangeWithTooltip: ReferenceTrackerInformation[] | undefined;
  private highlightRangeTooltipTimeout: ReturnType<typeof setTimeout>;
  private highlightRangeTooltip: Overlay | null;
  render: ExtendedHTMLElement;

  constructor (props: SyntaxHighlighterProps) {
    this.onCopiedToClipboard = props.onCopiedToClipboard;
    this.onInsertToCursorPosition = props.onInsertToCursorPosition;
    this.highlightRangeWithTooltip = props.highlightRangeWithTooltip;

    let codeMarkup = htmlDecode(props.codeStringWithMarkup);

    // Adding simple static keywords for highlighting
    if (props.highlightRangeWithTooltip !== undefined && props.highlightRangeWithTooltip.length > 0) {
      props.highlightRangeWithTooltip.forEach((highlightRangeWithTooltip, index) => {
        let calculatedStartIndex = (highlightRangeWithTooltip.range.start + (index * (highlightersWithTooltip.start.textReplacement.length + highlightersWithTooltip.end.textReplacement.length)));
        let calculatedEndIndex = (calculatedStartIndex + highlightersWithTooltip.start.textReplacement.length - highlightRangeWithTooltip.range.start) + highlightRangeWithTooltip.range.end;
        if (calculatedEndIndex > codeMarkup.length) {
          calculatedStartIndex = codeMarkup.length - 1;
        }
        if (calculatedEndIndex > codeMarkup.length) {
          calculatedEndIndex = codeMarkup.length - 1;
        }
        codeMarkup = codeMarkup.slice(0, calculatedStartIndex) + highlightersWithTooltip.start.textReplacement + codeMarkup.slice(calculatedStartIndex);
        codeMarkup = codeMarkup.slice(0, calculatedEndIndex) + highlightersWithTooltip.end.textReplacement + codeMarkup.slice(calculatedEndIndex);
      });
    }

    // Replacing the incoming markups with keyword matching static texts
    if (props.keepHighlights === true) {
      codeMarkup = codeMarkup
        .replace(new RegExp(highlighters.start.markup, 'g'), highlighters.start.textReplacement)
        .replace(new RegExp(highlighters.end.markup, 'g'), highlighters.end.textReplacement)
        .replace(new RegExp(ellipsis.start.markup, 'g'), ellipsis.start.textReplacement)
        .replace(new RegExp(ellipsis.end.markup, 'g'), ellipsis.end.textReplacement);
    }

    // Converting to prism styled markup
    const preElement = DomBuilder.getInstance().build({
      type: 'pre',
      classNames: [ 'keep-markup',
          `language-${props.language ?? DEFAULT_LANG}`,
          ...(props.showLineNumbers === true ? [ 'line-numbers' ] : []),
      ],
      children: [
        {
          type: 'code',
          innerHTML: Prism.highlight(codeMarkup, Prism.languages[props.language ?? DEFAULT_LANG], `language-${props.language ?? DEFAULT_LANG}`),
        }
      ],
    });
    Prism.highlightElement(preElement);

    // Convert simple keyword matchings to defined html markups
    if (props.highlightRangeWithTooltip !== undefined && props.highlightRangeWithTooltip.length > 0) {
      preElement.innerHTML = preElement.innerHTML
        .replace(new RegExp(highlightersWithTooltip.start.textReplacement, 'g'), highlightersWithTooltip.start.markup)
        .replace(new RegExp(highlightersWithTooltip.end.textReplacement, 'g'), highlightersWithTooltip.end.markup);
    }

    // replacing back the keyword matchings for incoming highlights to markup for highlighting code
    if (props.keepHighlights === true) {
      preElement.innerHTML = preElement.innerHTML
        .replace(new RegExp(highlighters.start.textReplacement, 'g'), highlighters.start.markup)
        .replace(new RegExp(highlighters.end.textReplacement, 'g'), highlighters.end.markup)
        .replace(new RegExp(ellipsis.start.textReplacement, 'g'), ellipsis.start.markup)
        .replace(new RegExp(ellipsis.end.textReplacement, 'g'), ellipsis.end.markup);
    }

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-syntax-highlighter',
        ...(props.block !== true ? [ 'mynah-inline-code' ] : []),
      ],
      children: [
        ...(props.showCopyOptions === true
          ? [
              {
                type: 'div',
                classNames: [ 'mynah-syntax-highlighter-copy-buttons' ],
                children: [
                  new Button({
                    icon: new Icon({ icon: MynahIcons.CURSOR_INSERT }).render,
                    label: 'Insert at cursor',
                    attributes: { title: 'Insert at cursor' },
                    primary: false,
                    onClick: e => {
                      cancelEvent(e);
                      const selectedCode = this.getSelectedCode();
                      if (this.onInsertToCursorPosition !== undefined) {
                        this.onInsertToCursorPosition(
                          selectedCode.type,
                          selectedCode.code,
                          this.highlightRangeWithTooltip
                        );
                      }
                    },
                    additionalEvents: { mousedown: cancelEvent },
                  }).render,
                  new Button({
                    icon: new Icon({ icon: MynahIcons.COPY }).render,
                    label: 'Copy',
                    attributes: { title: 'Copy' },
                    primary: false,
                    onClick: e => {
                      cancelEvent(e);
                      const selectedCode = this.getSelectedCode();
                      this.copyToClipboard(selectedCode.code, selectedCode.type);
                    },
                    additionalEvents: { mousedown: cancelEvent },
                  }).render,
                ],
              },
            ]
          : []),
        preElement,
        ...(props.showLineNumbers === true
          ? [
              {
                type: 'span',
                classNames: [ 'line-numbers-rows' ],
                children: (preElement.innerHTML).split(/\n/).slice(0, -1).map((n: string, i: number) => ({
                  type: 'span',
                  innerHTML: String(i + (props.startingLineNumber ?? 1)),
                })),
              }
            ]
          : [])
      ],
    });

    Array.from(this.render.querySelectorAll('.amzn-mynah-ui-reference-tracker-highlight')).forEach((highlightRangeElement, index) => {
      highlightRangeElement.addEventListener('mouseenter', (e) => {
        if (props.highlightRangeWithTooltip?.[index] !== undefined) {
          this.showHighlightRangeTooltip(e as MouseEvent, props.highlightRangeWithTooltip[index].tooltipMarkdown);
        }
      });
      highlightRangeElement.addEventListener('mouseleave', this.hideHighlightRangeTooltip);
    });
  }

  private readonly showHighlightRangeTooltip = (e: MouseEvent, tooltipText: string): void => {
    clearTimeout(this.highlightRangeTooltipTimeout);
    this.highlightRangeTooltipTimeout = setTimeout(() => {
      this.highlightRangeTooltip = new Overlay({
        background: false,
        closeOnOutsideClick: false,
        referencePoint: {
          left: e.pageX,
          top: e.pageY
        },
        removeOtherOverlays: true,
        dimOutside: false,
        verticalDirection: OverlayVerticalDirection.TO_TOP,
        horizontalDirection: OverlayHorizontalDirection.CENTER,
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

  private readonly getSelectedCode = (): {
    code: string;
    type: 'selection' | 'block';
  } => ({
    code: this.render.querySelector('pre')?.innerText ?? '',
    type: 'block'
  });

  private readonly copyToClipboard = (
    textToSendClipboard: string,
    type?: 'selection' | 'block',
    notificationText?: string,
  ): void => {
    navigator.clipboard
      .writeText(textToSendClipboard)
      .then(() => {
        if (this.onCopiedToClipboard !== undefined) {
          this.onCopiedToClipboard(type, textToSendClipboard, this.highlightRangeWithTooltip);
        }
        if (notificationText !== undefined) {
          // eslint-disable no-new
          new Notification({
            content: notificationText,
            title: 'Copied to clipboard',
            duration: 2000,
          }).notify();
        }
      })
      .catch(e => {
        //
      });
  };
}
