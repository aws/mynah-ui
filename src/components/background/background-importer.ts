/* eslint-disable @typescript-eslint/no-extraneous-class */
/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder } from '../../helper/dom';
import BACKGROUND from './chat-background.svg';

export class MynahUIBackgroundImporter {
  private static instance: MynahUIBackgroundImporter;
  private constructor () {
    DomBuilder.getInstance().createPortal('mynah-ui-chat-background', {
      type: 'style',
      attributes: {
        type: 'text/css'
      },
      children: [ `
        :root{
          --mynah-ui-chat-background: url(${BACKGROUND});
        }` ]
    }, 'beforebegin');
  }

  public static getInstance = (): MynahUIBackgroundImporter => {
    if (MynahUIBackgroundImporter.instance === undefined) {
      MynahUIBackgroundImporter.instance = new MynahUIBackgroundImporter();
    }

    return MynahUIBackgroundImporter.instance;
  };
}
