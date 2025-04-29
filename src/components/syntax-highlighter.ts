/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';

import {
  CodeBlockActions,
  CodeSelectionType,
  OnCodeBlockActionFunction,
} from '../static';
import { Button } from './button';
import { Icon, MynahIcons } from './icon';
import { cancelEvent } from '../helper/events';
import { highlightersWithTooltip } from './card/card-body';
import escapeHTML from 'escape-html';
import testIds from '../helper/test-ids';
import '../styles/components/_syntax-highlighter.scss';
import { MoreContentIndicator } from './more-content-indicator';
// @ts-expect-error
import ts from '@shikijs/langs/typescript';
// @ts-expect-error
import diff from '@shikijs/langs/diff';
import { createCssVariablesTheme, createHighlighterCoreSync, createJavaScriptRegexEngine } from 'shiki';
import { StyleLoader } from '../helper/style-loader';

export interface SyntaxHighlighterProps {
  codeStringWithMarkup: string;
  language?: string;
  showLineNumbers?: boolean;
  block?: boolean;
  wrapCodeBlock?: boolean;
  startingLineNumber?: number;
  index?: number;
  codeBlockActions?: CodeBlockActions;
  hideLanguage?: boolean;
  unlimitedHeight?: boolean;
  onCopiedToClipboard?: (type?: CodeSelectionType, text?: string, codeBlockIndex?: number) => void;
  onCodeBlockAction?: OnCodeBlockActionFunction;
}

export class SyntaxHighlighter {
  private readonly props: SyntaxHighlighterProps;
  private readonly codeBlockButtons: ExtendedHTMLElement[] = [];
  render: ExtendedHTMLElement;

  constructor (props: SyntaxHighlighterProps) {
    StyleLoader.getInstance().load('components/_syntax-highlighter.scss');
    this.props = props;

    const mynahSyntaxTheme = createCssVariablesTheme({
      name: 'mynah-syntax',
      variablePrefix: '--shiki-',
      variableDefaults: {},
      fontStyle: true
    });

    const shiki = createHighlighterCoreSync({
      themes: [ mynahSyntaxTheme ],
      langs: [ ts, diff ],
      engine: createJavaScriptRegexEngine(),
    });

    // To ensure we are not leaving anything unescaped before escaping i.e to prevent double escaping
    let escapedCodeBlock = props.codeStringWithMarkup;

    // Convert reference tracker escaped markups back to original incoming from the parent
    escapedCodeBlock = escapedCodeBlock
      .replace(new RegExp(escapeHTML(highlightersWithTooltip.start.markupStart), 'g'), highlightersWithTooltip.start.markupStart)
      .replace(new RegExp(escapeHTML(highlightersWithTooltip.start.markupEnd), 'g'), highlightersWithTooltip.start.markupEnd)
      .replace(new RegExp(escapeHTML(highlightersWithTooltip.end.markup), 'g'), highlightersWithTooltip.end.markup);

    // const codeElement = DomBuilder.getInstance().build({
    //   type: 'code',
    //   classNames: [
    //     ...(props.language != null ? [ `language-${props.language.replace('diff-', '')}` ] : [ (props.block ?? false) ? DEFAULT_LANGUAGE : 'language-plaintext' ]),
    //     ...(props.showLineNumbers === true ? [ 'line-numbers' ] : []),
    //   ],
    //   innerHTML: shiki.codeToHtml(escapedCodeBlock, { lang: 'ts', theme: 'mynah-syntax' })
    // });

    // Overlay another code element for diffs, as highlight.js doesn't allow multiple language styles
    // const diffOverlay = DomBuilder.getInstance().build({
    //   type: 'code',
    //   classNames: [ 'diff', 'language-diff' ],
    //   innerHTML: shiki.codeToHtml(escapedCodeBlock, { lang: 'diff', theme: 'mynah-syntax' })
    // });

    const shikiString = shiki.codeToHtml(escapedCodeBlock, { lang: 'ts', theme: 'mynah-syntax' });
    const parser = new DOMParser();
    const doc = parser.parseFromString(shikiString, 'text/html');
    const preElement = doc.body.firstElementChild as HTMLPreElement;

    // const preElement = DomBuilder.getInstance().build({
    //   type: 'pre',
    //   testId: testIds.chatItem.syntaxHighlighter.codeBlock,
    //   children: [
    //     codeElement,
    //     ((props.language?.match('diff')) != null) ? diffOverlay : ''
    //   ],
    //   events: {
    //     copy: (e) => {
    //       cancelEvent(e);
    //       const selectedCode = this.getSelectedCodeContextMenu();
    //       if (selectedCode.code.length > 0) {
    //         copyToClipboard(selectedCode.code, (): void => {
    //           this.onCopiedToClipboard(selectedCode.code, selectedCode.type);
    //         });
    //       }
    //     }
    //   }
    // });

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

    const moreContentIndicator = new MoreContentIndicator({
      icon: MynahIcons.DOWN_OPEN,
      border: false,
      onClick: () => {
        if (this.render.hasClass('no-max')) {
          this.render.removeClass('no-max');
          moreContentIndicator.update({
            icon: MynahIcons.DOWN_OPEN
          });
        } else {
          this.render.addClass('no-max');
          moreContentIndicator.update({
            icon: MynahIcons.UP_OPEN
          });
        }
      }
    });
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.chatItem.syntaxHighlighter.wrapper,
      classNames: [ 'mynah-syntax-highlighter',
        ...(props.block !== true ? [ 'mynah-inline-code' ] : [ ]),
        ...(props.wrapCodeBlock === true ? [ 'wrap-code-block' ] : [ ]),
        ...(props.unlimitedHeight === true ? [ 'no-max' ] : [ ]),
      ],
      children: [
        preElement,
        ...(this.props.block === true
          ? [
              ...(this.props.unlimitedHeight !== true ? [ moreContentIndicator.render ] : []),
              {
                type: 'div',
                testId: testIds.chatItem.syntaxHighlighter.buttonsWrapper,
                classNames: [ 'mynah-syntax-highlighter-copy-buttons' ],
                children: [
                  ...this.codeBlockButtons,
                  ...(props.language != null && this.props.hideLanguage !== true
                    ? [ {
                        type: 'span',
                        testId: testIds.chatItem.syntaxHighlighter.language,
                        classNames: [ 'mynah-syntax-highlighter-language' ],
                        children: [ props.language.replace('diff-', '') ]
                      } ]
                    : []),
                ],
              }
            ]
          : [])
      ]
    });

    setTimeout(() => {
      if (this.props.block === true && this.props.unlimitedHeight !== true && preElement.scrollHeight > preElement.clientHeight) {
        this.render.addClass('max-height-exceed');
      }
    }, 100);
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
