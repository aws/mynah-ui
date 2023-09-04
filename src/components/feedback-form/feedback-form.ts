/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeedbackPayload, FeedbackStars, MynahEventNames, MynahPortalNames } from '../../static';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Button } from '../button';
import { FeedbackFormComment } from './feedback-form-comment';
import { FeedbackFormStars } from './feedback-form-stars';
import { cancelEvent, MynahUIGlobalEvents } from '../../helper/events';
import { Icon, MynahIcons } from '../icon';

export interface FeedbackFormProps {
  initPayload?: FeedbackPayload;
}
export class FeedbackForm {
  private feedbackFormWrapper: ExtendedHTMLElement;
  private readonly feedbackStars: FeedbackFormStars;
  private readonly feedbackComment: FeedbackFormComment;
  private feedbackPayload: FeedbackPayload = {};
  private readonly feedbackSubmitButton: Button;
  public readonly feedbackFormContainer: ExtendedHTMLElement;

  constructor (props?: FeedbackFormProps) {
    if (props?.initPayload !== undefined) {
      this.feedbackPayload = {
        ...(props.initPayload.stars !== undefined && { stars: props.initPayload.stars }),
        ...(props.initPayload.comment !== undefined && { comment: props.initPayload.comment }),
      };
    }

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SHOW_FEEDBACK_FORM_CLICK, () => {
      if (this.feedbackFormWrapper === undefined) {
        this.feedbackFormWrapper = DomBuilder.getInstance().createPortal(
          MynahPortalNames.FEEDBACK_FORM,
          {
            type: 'div',
            attributes: {
              id: 'mynah-feedback-form-wrapper'
            },
            children: [
              new Button({
                classNames: [ 'mynah-bottom-block-close-button' ],
                onClick: () => {
                  this.feedbackFormWrapper.removeClass('mynah-feedback-form-show');
                },
                icon: new Icon({ icon: MynahIcons.CANCEL }).render
              }).render,
              this.feedbackFormContainer
            ]
          },
          'afterbegin'
        );
      }
      setTimeout(() => {
        this.feedbackFormWrapper.addClass('mynah-feedback-form-show');
      }, 5);
    });

    this.feedbackStars = new FeedbackFormStars({
      onChange: (star: FeedbackStars) => {
        this.feedbackPayload.stars = star;
        this.onFeedbackSet({ stars: star });
        this.feedbackComment.setEnabled(true);
        this.feedbackSubmitButton.setEnabled(true);
      },
      initStar: this.feedbackPayload?.stars,
    });

    this.feedbackComment = new FeedbackFormComment({
      onChange: (comment: string) => {
        this.feedbackPayload.comment = comment;
      },
      initComment: this.feedbackPayload?.comment,
    });

    this.feedbackSubmitButton = new Button({
      label: 'Submit',
      onClick: () => {
        if (this.feedbackPayload.comment !== undefined && this.feedbackPayload.comment.trim() !== '') {
          this.onFeedbackSet({ comment: this.feedbackPayload.comment });
        }
        this.feedbackComment.setComment('');
        this.feedbackFormWrapper.removeClass('mynah-feedback-form-show');
      },
    });
    this.feedbackSubmitButton.setEnabled(false);

    this.feedbackFormContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-feedback-form' ],
      events: { click: cancelEvent },
      children: [ this.feedbackStars.render, this.feedbackComment.render, this.feedbackSubmitButton.render ],
    });
  }

  private readonly onFeedbackSet = (feedbackData: FeedbackPayload): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FEEDBACK_SET, feedbackData);
  };
}
