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
import 'prismjs/components/prism-go.min';
import 'prismjs/components/prism-csharp.min';
import 'prismjs/components/prism-objectivec.min';
import 'prismjs/components/prism-python.min';
import 'prismjs/components/prism-regex.min';
import 'prismjs/components/prism-swift.min';
import 'prismjs/components/prism-scala.min';
import 'prismjs/components/prism-scss.min';
import 'prismjs/components/prism-less.min';
import 'prismjs/components/prism-ruby.min';
import 'prismjs/components/prism-rust.min';
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
import { highlightersWithTooltip } from './card/card-body';
import escapeHTML from 'escape-html';
import '../styles/components/_syntax-highlighter.scss';
import { copyToClipboard } from '../helper/chat-item';
import testIds from '../helper/test-ids';
import unescapeHTML from 'unescape-html';

const langs = [
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
  'go',
  'markdown',
  'mongodb',
  'c',
  'bash',
  'csharp',
  'objectivec',
  'python',
  'regex',
  'swift',
  'scala',
  'scss',
  'less',
  'ruby',
  'rust',
];

const IMPORTED_LANGS = [ ...langs, ...(langs.map(lang => `diff-${lang}`)) ];
const DEFAULT_LANG = 'clike';

export interface SyntaxHighlighterProps {
  codeStringWithMarkup: string;
  language?: string;
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

    // To ensure we are not leaving anything unescaped before escaping i.e to prevent double escaping
    let escapedCodeBlock = escapeHTML(unescapeHTML(props.codeStringWithMarkup));

    // Convert reference tracker escaped markups back to original incoming from the parent
    escapedCodeBlock = escapedCodeBlock
      .replace(new RegExp(escapeHTML(highlightersWithTooltip.start.markupStart), 'g'), highlightersWithTooltip.start.markupStart)
      .replace(new RegExp(escapeHTML(highlightersWithTooltip.start.markupEnd), 'g'), highlightersWithTooltip.start.markupEnd)
      .replace(new RegExp(escapeHTML(highlightersWithTooltip.end.markup), 'g'), highlightersWithTooltip.end.markup);

    const preElement = DomBuilder.getInstance().build({
      type: 'pre',
      testId: testIds.chatItem.syntaxHighlighter.codeBlock,
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

    if (props.codeBlockActions != null) {
      Object.keys(props.codeBlockActions).forEach((actionId: string) => {
        const validAction = props.codeBlockActions?.[actionId]?.acceptedLanguages == null || props.language == null || props.codeBlockActions?.[actionId]?.acceptedLanguages?.find(acceptedLang => props.language === acceptedLang) != null ? props.codeBlockActions?.[actionId] : undefined;
        if (validAction != null) {
          this.codeBlockButtons.push(new Button({
            testId: testIds.chatItem.syntaxHighlighter.button,
            icon: validAction.icon != null ? new Icon({ icon: validAction.icon }).render : undefined,
            label: validAction.label,
            attributes: { title: validAction.description ?? '' },
            primary: false,
            classNames: [
              ...(props.codeBlockActions?.[actionId]?.flash != null ? [ 'mynah-button-flash-by-parent-focus', `animate-${props.codeBlockActions?.[actionId]?.flash ?? 'infinite'}` ] : [ '' ])
            ],
            ...(props.codeBlockActions?.[actionId]?.flash != null
              ? {
                  onHover: (e) => {
                    if (e.target != null) {
                      (e.target as HTMLButtonElement).classList.remove('mynah-button-flash-by-parent-focus');
                    }
                  }
                }
              : {}),
            onClick: e => {
              cancelEvent(e);
              if (e.target != null) {
                (e.target as HTMLButtonElement).classList.remove('mynah-button-flash-by-parent-focus');
              }
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
      testId: testIds.chatItem.syntaxHighlighter.wrapper,
      classNames: [ 'mynah-syntax-highlighter',
        ...(props.block !== true ? [ 'mynah-inline-code' ] : []),
      ],
      children: [
        preElement,
        ...(props.showLineNumbers === true
          ? [
              {
                type: 'span',
                testId: testIds.chatItem.syntaxHighlighter.lineNumbers,
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
          testId: testIds.chatItem.syntaxHighlighter.buttonsWrapper,
          classNames: [ 'mynah-syntax-highlighter-copy-buttons' ],
          children: [
            ...this.codeBlockButtons,
            ...(this.codeBlockButtons.length > 0
              ? [ {
                  type: 'span',
                  testId: testIds.chatItem.syntaxHighlighter.language,
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
