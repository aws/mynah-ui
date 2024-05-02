/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { marked } from 'marked';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { ChatItemAction } from '../../static';
import { Icon } from '../icon';
import { Overlay, OverlayHorizontalDirection, OverlayVerticalDirection } from '../overlay';
import { Card } from '../card/card';
import { CardBody } from '../card/card-body';

const PREVIEW_DELAY = 250;
const MAX_LENGTH = 40;
export interface ChatItemFollowUpOptionProps {
  followUpOption: ChatItemAction;
  onClick: (followUpOption: ChatItemAction) => void;
}
export class ChatItemFollowUpOption {
  private readonly props: ChatItemFollowUpOptionProps;
  render: ExtendedHTMLElement;
  private followupTooltip: Overlay | null;
  private followupTooltipTimeout: ReturnType<typeof setTimeout>;
  private disabled: boolean = false;
  constructor (props: ChatItemFollowUpOptionProps) {
    this.props = props;
    this.disabled = this.props.followUpOption.disabled === true;

    // revert back if the extension is set before (because it only works globally)
    marked.use({
      extensions: [ {
        name: 'text',
        renderer: (token) => {
          return token.text;
        }
      } ]
    });
    const croppedPillText = props.followUpOption.pillText.length > MAX_LENGTH ? `${props.followUpOption.pillText.substring(0, MAX_LENGTH - 3)}...` : props.followUpOption.pillText;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-chat-item-followup-question-option',
        `mynah-chat-item-followup-question-option-status-${props.followUpOption.status ?? 'default'}`,
        props.followUpOption.disabled === true ? 'mynah-chat-item-followup-question-option-disabled' : ''
      ],
      children: [
        ...(props.followUpOption.icon !== undefined
          ? [
              new Icon({ icon: props.followUpOption.icon }).render
            ]
          : []),
        {
          type: 'span',
          innerHTML: (marked(croppedPillText, { breaks: true }) as string).replace('<p>', '').replace('</p>', '')
        }
      ],
      events: {
        click: (e) => {
          if (!this.disabled) {
            this.hideCroppedFollowupText();
            this.props.onClick(props.followUpOption);
          }
        },
        ...(props.followUpOption.pillText.length > MAX_LENGTH || props.followUpOption.description !== undefined
          ? {
              mouseover: (e) => {
                let tooltipText = marked(props.followUpOption.pillText.length > MAX_LENGTH ? props.followUpOption.pillText : '', { breaks: true }) as string;
                if (props.followUpOption.description !== undefined) {
                  if (tooltipText !== '') {
                    tooltipText += '\n\n';
                  }
                  tooltipText += props.followUpOption.description;
                }
                this.showCroppedFollowupText(e, tooltipText);
              },
              mouseleave: this.hideCroppedFollowupText
            }
          : {})
      }
    });
  }

  private readonly showCroppedFollowupText = (e: MouseEvent, content: string): void => {
    if (content.trim() !== undefined) {
      clearTimeout(this.followupTooltipTimeout);
      this.followupTooltipTimeout = setTimeout(() => {
        const elm: HTMLElement = e.target as HTMLElement;
        this.followupTooltip = new Overlay({
          background: true,
          closeOnOutsideClick: false,
          referenceElement: elm,
          dimOutside: false,
          removeOtherOverlays: true,
          verticalDirection: OverlayVerticalDirection.TO_TOP,
          horizontalDirection: OverlayHorizontalDirection.START_TO_RIGHT,
          children: [
            new Card({
              border: false,
              children: [
                new CardBody({
                  body: content
                }).render
              ]
            }).render
          ],
        });
      }, PREVIEW_DELAY);
    }
  };

  public readonly hideCroppedFollowupText = (): void => {
    clearTimeout(this.followupTooltipTimeout);
    if (this.followupTooltip !== null) {
      this.followupTooltip?.close();
      this.followupTooltip = null;
    }
  };

  public readonly setEnabled = (enabled: boolean): void => {
    this.disabled = !enabled;
    if (enabled) {
      this.render.removeClass('mynah-chat-item-followup-question-option-disabled');
    } else {
      this.render.addClass('mynah-chat-item-followup-question-option-disabled');
    }
  };
}
