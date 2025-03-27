/*!
 * Copyright 2025 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import testIds from '../helper/test-ids';
import { DomBuilder, DomBuilderObject, ExtendedHTMLElement, MynahEventNames, MynahIcons, MynahPortalNames } from '../main';
import { cancelEvent, MynahUIGlobalEvents } from '../helper/events';
import '../styles/components/_sheet.scss';
import { Button } from './button';
import { Icon } from './icon';
import { CardBody } from './card/card-body';

export interface SheetProps {
  tabId: string;
  title?: string;
  children?: Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject>;
  fullScreen?: boolean;
  description?: string;
  onClose: () => void;
}

export class Sheet {
  sheetContainer: ExtendedHTMLElement;
  sheetWrapper: ExtendedHTMLElement;
  onClose: () => void;

  constructor () {
    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.OPEN_SHEET, (data: SheetProps) => {
      if (this.sheetWrapper === undefined) {
        this.sheetWrapper = DomBuilder.getInstance().createPortal(
          MynahPortalNames.SHEET,
          {
            type: 'div',
            testId: testIds.sheet.wrapper,
            attributes: {
              id: 'mynah-sheet-wrapper'
            },
          },
          'afterbegin'
        );
      }

      this.sheetWrapper.clear();
      this.onClose = data.onClose;
      this.sheetWrapper.update({
        children: [
          DomBuilder.getInstance().build(
            {
              type: 'div',
              classNames: [ 'mynah-sheet', data.fullScreen === true ? 'mynah-sheet-fullscreen' : '' ],
              events: {
                click: (e) => {
                  if (e.target != null && !(e.target as HTMLElement).classList.contains('mynah-ui-clickable-item')) {
                    cancelEvent(e);
                  }
                }
              },
              children: [
                {
                  type: 'div',
                  classNames: [ 'mynah-sheet-header' ],
                  children: [
                    {
                      type: 'h4',
                      testId: testIds.sheet.title,
                      children: [ data.title ?? '' ],
                    },
                    new Button({
                      testId: testIds.sheet.closeButton,
                      primary: false,
                      onClick: (e) => {
                        cancelEvent(e);
                        this.close();
                      },
                      icon: new Icon({ icon: MynahIcons.CANCEL }).render
                    }).render
                  ]
                },
                ...(data.description !== undefined
                  ? [ new CardBody({
                      testId: testIds.sheet.description,
                      body: data.description
                    }).render ]
                  : []),
                {
                  type: 'div',
                  classNames: [ 'mynah-sheet-body' ],
                  children: data.children
                },
              ],
            })
        ]
      });

      setTimeout(() => {
        this.show();
      }, 5);
    });

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.CLOSE_SHEET, () => {
      this.close();
    });
  }

  close = (): void => {
    this.sheetWrapper.removeClass('mynah-sheet-show');
    this.onClose?.();
  };

  show = (): void => {
    this.sheetWrapper.addClass('mynah-sheet-show');
  };
}
