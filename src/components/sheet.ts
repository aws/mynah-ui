/*!
 * Copyright 2025 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import testIds from '../helper/test-ids';
import { ChatItemButton, DomBuilder, DomBuilderObject, ExtendedHTMLElement, MynahEventNames, MynahIcons, MynahPortalNames, TabBarAction, TabBarMainAction } from '../main';
import { cancelEvent, MynahUIGlobalEvents } from '../helper/events';
import { Button } from './button';
import { Icon } from './icon';
import { CardBody } from './card/card-body';
import { StyleLoader } from '../helper/style-loader';
import { TabBarButtonWithMultipleOptions } from './navigation-tab-bar-buttons';

export interface SheetProps {
  title?: string;
  children?: Array<ExtendedHTMLElement | HTMLElement | string | DomBuilderObject>;
  fullScreen?: boolean;
  showBackButton?: boolean;
  description?: string;
  actions?: TabBarAction[];
  onClose: () => void;
  onBack: () => void;
  onActionClick?: (action: TabBarAction) => void;
}

export class Sheet {
  private backButton: Button;
  private sheetTitle: ExtendedHTMLElement;
  private sheetTitleActions: ExtendedHTMLElement;
  private sheetDescription: ExtendedHTMLElement;
  sheetContainer: ExtendedHTMLElement;
  sheetWrapper: ExtendedHTMLElement;
  onClose: () => void;
  onBack: () => void;
  onActionClick: ((action: ChatItemButton) => void) | undefined;

  constructor () {
    StyleLoader.getInstance().load('components/_sheet.scss');
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
      this.onBack = data.onBack;
      this.onActionClick = data.onActionClick;
      this.backButton = new Button({
        icon: new Icon({ icon: 'left-open' }).render,
        status: 'clear',
        classNames: [ 'mynah-sheet-back-button' ],
        primary: false,
        border: false,
        hidden: data.showBackButton !== true,
        onClick: this.onBack
      });
      this.sheetTitle = this.getTitle(data.title);
      this.sheetDescription = this.getDescription(data.description);
      this.sheetTitleActions = this.getTitleActions(data.actions);

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
                    this.backButton.render,
                    this.sheetTitle,
                    this.sheetTitleActions,
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
                this.sheetDescription,
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

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.UPDATE_SHEET, (data: SheetProps) => {
      if (data.showBackButton != null) {
        this.backButton.setHidden(!data.showBackButton);
      }
      if (data.title != null) {
        const newTitle = this.getTitle(data.title);
        this.sheetTitle.replaceWith(newTitle);
        this.sheetTitle = newTitle;
      }
      if (data.description != null) {
        const newDescription = this.getDescription(data.description);
        this.sheetDescription.replaceWith(newDescription);
        this.sheetDescription = newDescription;
      }
      if (data.actions != null) {
        const newActions = this.getTitleActions(data.actions);
        this.sheetTitleActions.replaceWith(newActions);
        this.sheetTitleActions = newActions;
      }
    });
  }

  private readonly getTitle = (title?: string): ExtendedHTMLElement => {
    return DomBuilder.getInstance().build({
      type: 'h4',
      testId: testIds.sheet.title,
      children: [ title ?? '' ],
    });
  };

  private readonly getTitleActions = (actions?: ChatItemButton[]): ExtendedHTMLElement => {
    return DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.sheet.title,
      classNames: [ 'mynah-sheet-header-actions-container' ],
      children: actions?.map((actionItem: TabBarMainAction) => {
        return new TabBarButtonWithMultipleOptions({
          onButtonClick: (tabBarAction) => {
            this.onActionClick?.(tabBarAction);
          },
          tabBarActionButton: actionItem
        }).render;
      })
    });
  };

  private readonly getDescription = (description?: string): ExtendedHTMLElement => new CardBody({
    testId: testIds.sheet.description,
    body: description ?? ''
  }).render;

  close = (): void => {
    this.sheetWrapper.removeClass('mynah-sheet-show');
    this.onClose?.();
  };

  show = (): void => {
    this.sheetWrapper.addClass('mynah-sheet-show');
  };
}
