/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import * as Prism from 'prismjs';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import {
  OnCopiedToClipboardFunction,
  SupportedCodingLanguagesExtensionToTypeMap,
  SupportedCodingLanguagesType,
} from '../static';
import { Button } from './button';
import { Notification } from './notification/notification';
import { Icon, MynahIcons } from './icon';
import { cancelEvent } from '../helper/events';

const DEFAULT_LANG = SupportedCodingLanguagesExtensionToTypeMap.js;

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
  language?: SupportedCodingLanguagesType;
  keepHighlights?: boolean;
  showLineNumbers?: boolean;
  block?: boolean;
  startingLineNumber?: number;
  showCopyOptions?: boolean;
  onCopiedToClipboard?: OnCopiedToClipboardFunction;
}
export class SyntaxHighlighter {
  private readonly code: ExtendedHTMLElement;
  private readonly onCopiedToClipboard?: OnCopiedToClipboardFunction;
  render: ExtendedHTMLElement;

  constructor (props: SyntaxHighlighterProps) {
    this.onCopiedToClipboard = props.onCopiedToClipboard;
    let codeMarkup = props.codeStringWithMarkup;
    // Replacing the markups with plain text replacement blocks
    if (props.keepHighlights === true) {
      codeMarkup = codeMarkup
        .replace(new RegExp(highlighters.start.markup, 'g'), highlighters.start.textReplacement)
        .replace(new RegExp(highlighters.end.markup, 'g'), highlighters.end.textReplacement)
        .replace(new RegExp(ellipsis.start.markup, 'g'), ellipsis.start.textReplacement)
        .replace(new RegExp(ellipsis.end.markup, 'g'), ellipsis.end.textReplacement);
    }

    // Converting to prism styled markup
    let styledCode = Prism.highlight(
            `${codeMarkup}`,
            Prism.languages[props.language ?? DEFAULT_LANG],
            props.language ?? DEFAULT_LANG
    );

    // replacing back the plain text to markup for highlighting code
    if (props.keepHighlights === true) {
      styledCode = styledCode
        .replace(new RegExp(highlighters.start.textReplacement, 'g'), highlighters.start.markup)
        .replace(new RegExp(highlighters.end.textReplacement, 'g'), highlighters.end.markup)
        .replace(new RegExp(ellipsis.start.textReplacement, 'g'), ellipsis.start.markup)
        .replace(new RegExp(ellipsis.end.textReplacement, 'g'), ellipsis.end.markup);
    }

    this.code = DomBuilder.getInstance().build({
      type: 'code',
      innerHTML: styledCode,
    });
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
                    icon: new Icon({ icon: MynahIcons.COPY }).render,
                    attributes: { title: 'Copy whole block' },
                    primary: false,
                    onClick: e => {
                      cancelEvent(e);
                      this.copyToClipboard(
                        this.code.innerText,
                        'Whole code block is copied to clipboard',
                        'block'
                      );
                    },
                  }).render,
                  new Button({
                    icon: new Icon({ icon: MynahIcons.TEXT_SELECT }).render,
                    attributes: { title: 'Copy selected text' },
                    primary: false,
                    onClick: e => {
                      cancelEvent(e);
                      const currentRange = window.getSelection() !== null ? window.getSelection()?.getRangeAt(0) ?? null : null;
                      let textToSendClipboard: string | undefined;
                      if (currentRange?.commonAncestorContainer?.isSameNode(this.code) ?? false) {
                        textToSendClipboard = window.getSelection()?.toString();
                      }
                      this.copyToClipboard(
                        textToSendClipboard ?? this.code.innerText,
                                              `${
                                                  textToSendClipboard !== undefined
                                                      ? 'Your selection'
                                                      : 'Whole code block'
                                              } is copied to clipboard.`,
                                              textToSendClipboard !== undefined ? 'selection' : 'block'
                      );
                    },
                    additionalEvents: { mousedown: cancelEvent },
                  }).render,
                ],
              },
            ]
          : []),
        {
          type: 'pre',
          classNames: [
            `language-${props.language ?? DEFAULT_LANG}`,
            ...(props.showLineNumbers === true ? [ 'line-numbers' ] : []),
          ],
          children: [
            this.code,
            ...(props.showLineNumbers === true
              ? [
                  {
                    type: 'span',
                    classNames: [ 'line-numbers-rows' ],
                    children: styledCode.split(/\n/).map((n: string, i: number) => ({
                      type: 'span',
                      innerHTML: String(i + (props.startingLineNumber ?? 1)),
                    })),
                  },
                ]
              : []),
          ],
        },
      ],
    });
  }

  private readonly copyToClipboard = (
    textToSendClipboard: string,
    notificationText?: string,
    type?: 'selection' | 'block'
  ): void => {
    navigator.clipboard
      .writeText(textToSendClipboard)
      .then(() => {
        if (this.onCopiedToClipboard !== undefined) {
          this.onCopiedToClipboard(type, textToSendClipboard);
        }
        if (notificationText !== undefined) {
          // eslint-disable no-new
          new Notification({
            content: notificationText,
            title: 'Copied to clipbard',
            duration: 2000,
          }).notify();
        }
      })
      .catch(e => {
        //
      });
  };
}
