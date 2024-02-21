/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatItemButton, ChatItemFormItem, FeedbackPayload, MynahEventNames, MynahPortalNames } from '../../static';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { Button } from '../button';
import { FeedbackFormComment } from './feedback-form-comment';
import { cancelEvent, MynahUIGlobalEvents } from '../../helper/events';
import { Icon, MynahIcons } from '../icon';
import { Config } from '../../helper/config';
import { Select } from '../form-items/select';
import { CustomFormWrapper } from './custom-form';

export interface FeedbackFormProps {
  initPayload?: FeedbackPayload;
}
export class FeedbackForm {
  private feedbackFormWrapper: ExtendedHTMLElement;
  private readonly feedbackOptionsWrapper: Select;
  private readonly feedbackComment: FeedbackFormComment;
  private readonly feedbackSubmitButton: Button;
  private feedbackPayload: FeedbackPayload = { messageId: '', selectedOption: '', tabId: '', comment: '' };
  public readonly feedbackFormContainer: ExtendedHTMLElement;

  constructor (props?: FeedbackFormProps) {
    this.feedbackPayload = {
      selectedOption: Config.getInstance().config.feedbackOptions[0].value,
      messageId: '',
      tabId: '',
      comment: '',
      ...props?.initPayload
    };

    MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.SHOW_FEEDBACK_FORM, (data: {messageId?: string; tabId: string; customFormData?: {
      title?: string;
      description?: string;
      buttons?: ChatItemButton[];
      formItems?: ChatItemFormItem[];
    };}) => {
      if (this.feedbackFormWrapper === undefined) {
        this.feedbackFormWrapper = DomBuilder.getInstance().createPortal(
          MynahPortalNames.FEEDBACK_FORM,
          {
            type: 'div',
            attributes: {
              id: 'mynah-feedback-form-wrapper'
            },
          },
          'afterbegin'
        );
      }

      this.feedbackFormWrapper.clear();
      this.feedbackFormWrapper.update({
        children: [
          data.messageId !== undefined
            ? this.feedbackFormContainer
            : data.customFormData !== undefined
              ? new CustomFormWrapper({
                tabId: data.tabId,
                chatItem: data.customFormData,
                title: data.customFormData.title,
                description: data.customFormData.description,
                onFormAction: () => {
                  this.close();
                },
                onCloseButtonClick: (e) => {
                  cancelEvent(e);
                  this.close();
                }
              }).render
              : ''
        ]
      });
      if (data.messageId !== undefined) {
        this.feedbackPayload.messageId = data.messageId;
      }
      this.feedbackPayload.tabId = data.tabId;
      setTimeout(() => {
        this.show();
      }, 5);
    });

    this.feedbackOptionsWrapper = new Select({
      options: Config.getInstance().config.feedbackOptions,
      onChange: (val) => {
        this.feedbackPayload.selectedOption = val;
      },
      label: Config.getInstance().config.texts.feedbackFormOptionsLabel,
    });

    this.feedbackComment = new FeedbackFormComment({
      onChange: (comment: string) => {
        this.feedbackPayload.comment = comment;
      },
      initComment: this.feedbackPayload?.comment,
    });

    this.feedbackSubmitButton = new Button({
      label: Config.getInstance().config.texts.submit,
      onClick: () => {
        this.onFeedbackSet(this.feedbackPayload);
        this.close();
      },
    });

    this.feedbackFormContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-feedback-form' ],
      events: { click: cancelEvent },
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-feedback-form-header' ],
          children: [
            {
              type: 'h4',
              children: [ Config.getInstance().config.texts.feedbackFormTitle ]
            },
            new Button({
              primary: false,
              onClick: () => {
                this.close();
              },
              icon: new Icon({ icon: MynahIcons.CANCEL }).render
            }).render
          ]
        },
        this.feedbackOptionsWrapper.render,
        {
          type: 'span',
          children: [ Config.getInstance().config.texts.feedbackFormCommentLabel ],
        },
        this.feedbackComment.render,
        {
          type: 'div',
          classNames: [ 'mynah-feedback-form-buttons-container' ],
          children: [
            new Button({
              primary: false,
              label: Config.getInstance().config.texts.cancel,
              onClick: () => {
                this.close();
              }
            }).render,
            this.feedbackSubmitButton.render
          ]
        }
      ],
    });
  }

  private readonly onFeedbackSet = (feedbackData: FeedbackPayload): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FEEDBACK_SET, feedbackData);
  };

  close = (): void => {
    this.feedbackComment.clear();
    this.feedbackOptionsWrapper.setValue(Config.getInstance().config.feedbackOptions[0].value);
    this.feedbackPayload = {
      messageId: '',
      selectedOption: Config.getInstance().config.feedbackOptions[0].value,
      tabId: '',
      comment: ''
    };
    this.feedbackFormWrapper.removeClass('mynah-feedback-form-show');
  };

  show = (): void => {
    this.feedbackFormWrapper.addClass('mynah-feedback-form-show');
  };
}
