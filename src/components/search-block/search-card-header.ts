/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIDataStore } from '../../helper/store';
import { NotificationType } from '../../static';
import { Button } from '../button';
import { FeedbackForm } from '../feedback-form/feedback-form';
import { Icon, MynahIcons } from '../icon';

export class SearchCardHeader {
  private readonly feedbackForm: FeedbackForm;
  private readonly infoBar: ExtendedHTMLElement;
  render: ExtendedHTMLElement;

  constructor () {
    this.feedbackForm = new FeedbackForm();
    this.infoBar = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-search-block-header-info-bar' ],
      children: this.getHeaderInfoContent(MynahUIDataStore.getInstance().getValue('headerInfo'))
    });

    MynahUIDataStore.getInstance().subscribe('headerInfo', headerInfo => {
      this.infoBar.update({ children: this.getHeaderInfoContent(headerInfo) });
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-search-block-header' ],
      children: [
        {
          type: 'div',
          persistent: true,
          classNames: [ 'mynah-search-block-header-top-bar' ],
          children: [
            new Button({
              onClick: () => {
                MynahUIDataStore.getInstance().resetStore();
              },
              primary: false,
              label: 'Clear All',
              classNames: [ 'mynah-header-button' ],
            }).render,
            this.feedbackForm.feedbackContainer,
          ],
        },
        this.infoBar
      ],
    });
  }

  private readonly getHeaderInfoContent = (headerInfo: {content: string; type: MynahIcons}): Array<ExtendedHTMLElement | string> => {
    if (headerInfo.content !== '') {
      return [
        DomBuilder.getInstance().build({
          type: 'div',
          classNames: [ 'mynah-search-block-header-info-bar-bg', `mynah-header-info-${headerInfo.type ?? NotificationType.INFO}` ]
        }),
        new Icon({ icon: headerInfo.type ?? NotificationType.INFO }).render,
        DomBuilder.getInstance().build({
          type: 'span',
          classNames: [ 'mynah-search-block-header-info-bar-text' ],
          innerHTML: headerInfo.content
        })
      ];
    }
    return [ '' ];
  };
}
