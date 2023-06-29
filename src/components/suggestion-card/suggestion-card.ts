/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { MynahUIGlobalEvents } from '../../helper/events';
import { EngagementType, MynahEventNames, Suggestion, SuggestionMetaDataUnion } from '../../static';
import { SuggestionCardBody } from './suggestion-card-body';
import { SuggestionCardContextWrapper } from './suggestion-card-context-wrapper';
import { SuggestionCardHeader } from './suggestion-card-header';

/**
 * We'll not consider it as an engagement if the total spend time is lower than below constant and won't trigger the event
 */
const ENGAGEMENT_DURATION_LIMIT = 3000;

/**
 * This 6(px) and 300(ms) are coming from a behavioral research and browser reaction to input devices to count the action as a mouse movement or a click event
 */
const ENGAGEMENT_MIN_SELECTION_DISTANCE = 6;
const ENGAGEMENT_MIN_CLICK_DURATION = 300;

export interface SuggestionCardProps {suggestion: Suggestion; compact?: boolean; showFooterButtons?: boolean}
export class SuggestionCard {
  private engagementStartTime: number = -1;
  private totalMouseDistanceTraveled: { x: number; y: number } = { x: 0, y: 0 };
  private previousMousePosition!: { x: number; y: number };
  private mouseDownInfo!: { x: number; y: number; time: number };
  private readonly suggestion: Suggestion;
  render: ExtendedHTMLElement;
  constructor (props: SuggestionCardProps) {
    this.suggestion = props.suggestion;
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      attributes: {
        'data-filter': props.suggestion.context?.map(context => `${context}, `).join(''),
      },
      classNames: [ 'mynah-card', props.compact === true ? 'mynah-card-compact' : '' ],
      events: {
        mouseenter: e => {
          if (this.engagementStartTime === -1) {
            this.engagementStartTime = new Date().getTime();
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
            this.totalMouseDistanceTraveled = { x: 0, y: 0 };
          }
        },
        mousemove: e => {
          this.totalMouseDistanceTraveled = {
            x:
                      this.totalMouseDistanceTraveled.x +
                      Math.abs(e.clientX - this.previousMousePosition.x),
            y:
                      this.totalMouseDistanceTraveled.y +
                      Math.abs(e.clientY - this.previousMousePosition.y),
          };
          this.previousMousePosition = { x: e.clientX, y: e.clientY };
        },
        mousedown: e => {
          this.mouseDownInfo = { x: e.clientX, y: e.clientY, time: new Date().getTime() };
        },
        mouseup: e => {
          const mouseUpInfo = { x: e.clientX, y: e.clientY, time: new Date().getTime() };
          if (
            this.mouseDownInfo !== undefined && // in case of down is prevented defauly by some listener
                  (Math.abs(this.mouseDownInfo.x - mouseUpInfo.x) > ENGAGEMENT_MIN_SELECTION_DISTANCE ||
                      Math.abs(this.mouseDownInfo.y - mouseUpInfo.y) >
                      ENGAGEMENT_MIN_SELECTION_DISTANCE) &&
                  mouseUpInfo.time - this.mouseDownInfo.time > ENGAGEMENT_MIN_CLICK_DURATION
          ) {
            this.handleEngagement({
              x: Math.abs(this.mouseDownInfo.x - mouseUpInfo.x),
              y: Math.abs(this.mouseDownInfo.y - mouseUpInfo.y),
              selectedText: window?.getSelection()?.toString(),
            });
          }
        },
        mouseleave: () => {
          const engagementEndTime = new Date().getTime();
          if (this.engagementStartTime !== -1 && engagementEndTime - this.engagementStartTime > ENGAGEMENT_DURATION_LIMIT) {
            this.handleEngagement();
          } else {
            this.resetEngagement();
          }
        },
      },
      children: [
        new SuggestionCardHeader({
          title: props.suggestion.title,
          url: props.suggestion.url,
          metadata: props.suggestion.type !== 'ApiDocsSuggestion' ? props.suggestion.metadata as SuggestionMetaDataUnion : undefined,
          onSuggestionTitleClick: (e?: MouseEvent) => {
            MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SUGGESTION_OPEN, { suggestion: props.suggestion, event: e });
          },
          onSuggestionLinkCopy: () => {
            MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SUGGESTION_LINK_COPY, { suggestion: props.suggestion });
          },
        }).render,
        ...(props.suggestion.context?.length > 0 ? [ new SuggestionCardContextWrapper({ contextList: props.suggestion.context }).render ] : []),
        new SuggestionCardBody({ suggestion: props.suggestion, showFooterButtons: props.showFooterButtons }).render,
      ],
    });
  }

  private readonly resetEngagement = (): void => {
    this.engagementStartTime = -1;
    this.totalMouseDistanceTraveled = { x: 0, y: 0 };
    this.previousMousePosition = { x: 0, y: 0 };
    this.mouseDownInfo = { x: 0, y: 0, time: -1 };
  };

  private readonly handleEngagement = (interactionDistanceTraveled?: {
    x: number;
    y: number;
    selectedText?: string;
  }): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.SUGGESTION_ENGAGEMENT, {
      suggestion: this.suggestion,
      engagementDurationTillTrigger: new Date().getTime() - this.engagementStartTime,
      scrollDistanceToEngage:
                  this.render.offsetTop - this.previousMousePosition.y > 0
                    ? this.render.offsetTop - this.previousMousePosition.y
                    : 0,
      engagementType:
                  interactionDistanceTraveled !== undefined ? EngagementType.INTERACTION : EngagementType.TIME,
      totalMouseDistanceTraveled: this.totalMouseDistanceTraveled,
      selectionDistanceTraveled:
                  Boolean(interactionDistanceTraveled?.x ?? 0) && Boolean(interactionDistanceTraveled?.y)
                    ? interactionDistanceTraveled
                    : undefined,
    });
    this.resetEngagement();
  };
}
