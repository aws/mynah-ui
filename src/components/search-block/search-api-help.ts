/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Icon, MynahIcons } from '../icon';
import { SyntaxHighlighter } from '../syntax-highlighter';
import { getLanguageFromFileName } from '../../helper/find-language';
import { MynahEventNames, SearchPayloadCodeSelection, SupportedCodingLanguagesExtensionToTypeMap } from '../../static';
import { cancelEvent, MynahUIGlobalEvents } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';

export class SearchApiHelp {
  render: ExtendedHTMLElement;
  private isCollapsed: boolean = true;
  constructor () {
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-search-api-help', 'hide', 'collapsed' ],
      children: [],
    });

    MynahUIDataStore.getInstance().subscribe('codeSelection', (codeSelection: SearchPayloadCodeSelection) => {
      if (codeSelection.selectedCode !== '') {
        this.updateContent(codeSelection);
        this.show();
      } else {
        this.hide();
      }
    });
  }

  private readonly hide = (): void => {
    this.render.addClass('hide');
  };

  private readonly show = (): void => {
    this.render.removeClass('hide');
  };

  private readonly updateContent = (codeSelection: SearchPayloadCodeSelection): void => {
    this.render.update({
      children: [
        DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-search-api-help-code-view-detail-row' ],
          children: [
            {
              type: 'h4',
              innerHTML: 'Target file:',
            },
            {
              type: 'b',
              innerHTML: codeSelection.file?.name,
            },
          ],
        }),
        DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-search-api-help-code-view-detail-row' ],
          children: [
            {
              type: 'h4',
              innerHTML: 'Selected range:',
            },
            {
              type: 'span',
              innerHTML:
                codeSelection.file?.range !== undefined
                  ? `${codeSelection.file?.range.end !== undefined ? 'From ' : ''}line <b>${
                    codeSelection.file?.range.start.row
                      }</b>, column <b>${codeSelection.file?.range.start.column ?? ''}</b> ${
                        codeSelection.file?.range.end !== undefined
                              ? `to line <b>${codeSelection.file?.range.end?.row}</b>, column <b>${
                                codeSelection.file?.range.end?.column ?? ''
                                }</b>`
                              : ''
                      }`
                  : '',
            },
          ],
        }),
        DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-search-api-help-code-view-wrapper' ],
          events: {
            click: e => {
              cancelEvent(e);
              // uncollapse only if it is collapsed, not collapse it back with code click to make it selectable
              if (this.isCollapsed) {
                this.isCollapsed = false;
                this.onCodeDetailsClicked(codeSelection.selectedCode, codeSelection.file?.name, codeSelection.file?.range);
                this.render.removeClass('collapsed');
              }
            },
          },
          children: [
            new SyntaxHighlighter({
              codeStringWithMarkup: codeSelection.selectedCode,
              language:
                                codeSelection.file?.name !== undefined
                                  ? getLanguageFromFileName(codeSelection.file?.name)
                                  : SupportedCodingLanguagesExtensionToTypeMap.js,
              keepHighlights: false,
              showLineNumbers: true,
              startingLineNumber: Number(codeSelection.file?.range?.start.row ?? 1),
            }).render,
          ],
        }),
        DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-search-api-help-collapser' ],
          events: {
            click: e => {
              cancelEvent(e);
              this.isCollapsed = !this.isCollapsed;
              if (!this.isCollapsed) {
                this.onCodeDetailsClicked(codeSelection.selectedCode, codeSelection.file?.name, codeSelection.file?.range);
              }
              this.render.toggleClass('collapsed');
            },
          },
          children: [
            {
              type: 'span',
              classNames: [ 'mynah-search-api-help-uncollapse-icon' ],
              children: [ new Icon({ icon: MynahIcons.DOWN_OPEN }).render ],
            },
            {
              type: 'span',
              classNames: [ 'mynah-search-api-help-collapse-icon' ],
              children: [ new Icon({ icon: MynahIcons.UP_OPEN }).render ],
            },
          ],
        }),
      ],
    });
  };

  private readonly onCodeDetailsClicked = (
    code: string,
    fileName?: string,
    range?: {
      start: { row: string; column?: string };
      end?: { row: string; column?: string };
    }
  ): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CODE_DETAILS_CLICK,
      {
        code,
        fileName,
        range
      });
  };
}
