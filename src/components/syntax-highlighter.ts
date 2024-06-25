/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { highlightElement } from 'prismjs';

import 'prismjs/components/prism-markup.min';
import 'prismjs/components/prism-xml-doc.min';
import 'prismjs/components/prism-css.min';
import 'prismjs/components/prism-clike.min';
import 'prismjs/components/prism-javascript.min';
import 'prismjs/components/prism-typescript.min';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-diff.min';
import 'prismjs/components/prism-tsx.min';
import 'prismjs/components/prism-lua.min';
import 'prismjs/components/prism-java.min';
import 'prismjs/components/prism-json.min';
import 'prismjs/components/prism-markdown.min';
import 'prismjs/components/prism-mongodb.min';
import 'prismjs/components/prism-c.min';
import 'prismjs/components/prism-bash.min';
import 'prismjs/components/prism-csharp.min';
import 'prismjs/components/prism-objectivec.min';
import 'prismjs/components/prism-python.min';
import 'prismjs/components/prism-regex.min';
import 'prismjs/components/prism-scala.min';
import 'prismjs/components/prism-scss.min';
import 'prismjs/components/prism-less.min';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/keep-markup/prism-keep-markup.js';
import 'prismjs/plugins/diff-highlight/prism-diff-highlight.min';

import {
  CodeBlockActions,
  CodeSelectionType,
  OnCodeBlockActionFunction,
} from '../static';
import { Button } from './button';
import { Icon } from './icon';
import { cancelEvent } from '../helper/events';
import { Config } from '../helper/config';
import { highlightersWithTooltip } from './card/card-body';
import escapeHTML from 'escape-html';
import unescapeHTML from 'unescape-html';
import '../styles/components/_syntax-highlighter.scss';
import { copyToClipboard } from '../helper/chat-item';

const IMPORTED_LANGS = [
  'markup',
  'xml',
  'css',
  'clike',
  'diff',
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'lua',
  'java',
  'json',
  'markdown',
  'mongodb',
  'c',
  'bash',
  'csharp',
  'objectivec',
  'python',
  'regex',
  'scala',
  'scss',
  'less',
  'diff-markup',
  'diff-xml',
  'diff-css',
  'diff-clike',
  'diff-diff',
  'diff-javascript',
  'diff-typescript',
  'diff-jsx',
  'diff-tsx',
  'diff-lua',
  'diff-java',
  'diff-json',
  'diff-markdown',
  'diff-mongodb',
  'diff-c',
  'diff-bash',
  'diff-csharp',
  'diff-objectivec',
  'diff-python',
  'diff-regex',
  'diff-scala',
  'diff-scss',
  'diff-less',
];
const DEFAULT_LANG = 'clike';

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
  language?: string;
  keepHighlights?: boolean;
  showLineNumbers?: boolean;
  block?: boolean;
  startingLineNumber?: number;
  index?: number;
  codeBlockActions?: CodeBlockActions;
  onCopiedToClipboard?: (type?: CodeSelectionType, text?: string, codeBlockIndex?: number) => void;
  onCodeBlockAction?: OnCodeBlockActionFunction;
}

export class SyntaxHighlighter {
  private readonly props?: SyntaxHighlighterProps;
  private readonly codeBlockButtons: ExtendedHTMLElement[] = [];
  render: ExtendedHTMLElement;

  constructor (props: SyntaxHighlighterProps) {
    this.props = props;

    let codeMarkup = unescapeHTML(props.codeStringWithMarkup);
    // Replacing the incoming markups with keyword matching static texts
    if (props.keepHighlights === true) {
      codeMarkup = codeMarkup
        .replace(new RegExp(highlighters.start.markup, 'g'), highlighters.start.textReplacement)
        .replace(new RegExp(highlighters.end.markup, 'g'), highlighters.end.textReplacement)
        .replace(new RegExp(ellipsis.start.markup, 'g'), ellipsis.start.textReplacement)
        .replace(new RegExp(ellipsis.end.markup, 'g'), ellipsis.end.textReplacement);
    }

    let escapedCodeBlock = escapeHTML(codeMarkup);

    // Convert reference tracker escaped markups back to original incoming from the parent
    escapedCodeBlock = escapedCodeBlock
      .replace(new RegExp(escapeHTML(highlightersWithTooltip.start.markupStart), 'g'), highlightersWithTooltip.start.markupStart)
      .replace(new RegExp(escapeHTML(highlightersWithTooltip.start.markupEnd), 'g'), highlightersWithTooltip.start.markupEnd)
      .replace(new RegExp(escapeHTML(highlightersWithTooltip.end.markup), 'g'), highlightersWithTooltip.end.markup);

    const preElement = DomBuilder.getInstance().build({
      type: 'pre',
      classNames: [ 'keep-markup',
          `language-${props.language !== undefined && IMPORTED_LANGS.includes(props.language) ? props.language : DEFAULT_LANG}`,
          ...(((props.language?.match('diff')) != null) ? [ 'diff-highlight' ] : []),
          ...(props.showLineNumbers === true ? [ 'line-numbers' ] : []),
      ],
      children: [
        {
          type: 'code',
          innerHTML: escapedCodeBlock,
        }
      ],
      events: {
        copy: (e) => {
          cancelEvent(e);
          const selectedCode = this.getSelectedCodeContextMenu();
          if (selectedCode.code.length > 0) {
            copyToClipboard(selectedCode.code, (): void => {
              this.onCopiedToClipboard(selectedCode.code, selectedCode.type);
            });
          }
        }
      }
    });
    highlightElement(preElement);

    // replacing back the keyword matchings for incoming highlights to markup for highlighting code
    if (props.keepHighlights === true) {
      preElement.innerHTML = preElement.innerHTML
        .replace(new RegExp(highlighters.start.textReplacement, 'g'), highlighters.start.markup)
        .replace(new RegExp(highlighters.end.textReplacement, 'g'), highlighters.end.markup)
        .replace(new RegExp(ellipsis.start.textReplacement, 'g'), ellipsis.start.markup)
        .replace(new RegExp(ellipsis.end.textReplacement, 'g'), ellipsis.end.markup);
    }

    if (props.codeBlockActions != null) {
      Object.keys(props.codeBlockActions).forEach((actionId: string) => {
        const validAction = props.codeBlockActions?.[actionId]?.acceptedLanguages == null || props.codeBlockActions?.[actionId]?.acceptedLanguages?.find(acceptedLang => props.language?.match(new RegExp(acceptedLang, 'gi'))) != null ? props.codeBlockActions?.[actionId] : undefined;
        if (validAction != null) {
          this.codeBlockButtons.push(new Button({
            icon: validAction.icon != null ? new Icon({ icon: validAction.icon }).render : undefined,
            label: validAction.label,
            attributes: { title: Config.getInstance().config.texts.insertAtCursorLabel },
            primary: false,
            onClick: e => {
              cancelEvent(e);
              const selectedCode = this.getSelectedCode();
              if (this.props?.onCodeBlockAction !== undefined) {
                this.props.onCodeBlockAction(
                  validAction.id,
                  validAction.data,
                  selectedCode.type,
                  selectedCode.code,
                  undefined,
                  this.props?.index
                );
              }
            },
            additionalEvents: { mousedown: cancelEvent },
          }).render);
        }
      });
    }

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-syntax-highlighter',
        ...(props.block !== true ? [ 'mynah-inline-code' ] : []),
      ],
      children: [
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
          : []),
        {
          type: 'div',
          classNames: [ 'mynah-syntax-highlighter-copy-buttons' ],
          children: [
            ...this.codeBlockButtons,
            ...(this.codeBlockButtons.length > 0
              ? [ {
                  type: 'span',
                  classNames: [ 'mynah-syntax-highlighter-language' ],
                  children: [ props.language ?? 'text' ]
                } ]
              : []),
          ],
        }
      ]
    });
  }

  private readonly getSelectedCodeContextMenu = (): {
    code: string;
    type: CodeSelectionType;
  } => ({
    code: document.getSelection()?.toString() ?? '',
    type: 'selection'
  });

  private readonly getSelectedCode = (): {
    code: string;
    type: CodeSelectionType;
  } => ({
    code: this.render.querySelector('pre')?.innerText ?? '',
    type: 'block'
  });

  private readonly onCopiedToClipboard = (
    textToSendClipboard: string,
    type?: CodeSelectionType): void => {
    if (this.props?.onCopiedToClipboard != null) {
      this.props?.onCopiedToClipboard(
        type,
        textToSendClipboard,
        this.props.index
      );
    }
  };
}
