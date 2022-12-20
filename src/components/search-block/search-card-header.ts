/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeedbackPayload } from '../../static';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { FeedbackForm } from '../feedback-form/feedback-form';

export interface SearchCardHeaderProps {
  onFeedbackSet: (feedbackPayload: FeedbackPayload) => void;
}
export class SearchCardHeader {
  private readonly feedbackForm: FeedbackForm;
  render: ExtendedHTMLElement;

  constructor (props: SearchCardHeaderProps) {
    this.feedbackForm = new FeedbackForm({ onFeedbackSet: props.onFeedbackSet });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      persistent: true,
      classNames: [ 'mynah-search-block-header' ],
      children: [ this.feedbackForm.feedbackContainer ],
    });
  }
}
