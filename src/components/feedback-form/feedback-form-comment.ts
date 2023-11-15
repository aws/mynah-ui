/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';

export interface FeedbackFormCommentProps {
  onChange?: (comment: string) => void;
  initComment?: string;
}
export class FeedbackFormComment {
  render: ExtendedHTMLElement;

  constructor (props: FeedbackFormCommentProps) {
    this.render = DomBuilder.getInstance().build({
      type: 'textarea',
      events: {
        keyup: (e: InputEvent) => {
          if (props.onChange !== undefined) {
            props.onChange(this.render.value);
          }
        },
      },
      classNames: [ 'mynah-feedback-form-comment' ],
      attributes: {
        value: props.initComment ?? '',
      },
    });
  }

  getComment = (): string => this.render.value;
  clear = (): void => { this.render.value = ''; };
}
