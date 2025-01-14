/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { getBindableValue, isBindable, MakePropsBindable } from '../../helper/bindable';
import { DomBuilder, DomBuilderEventHandler, DomBuilderEventHandlerWithOptions, ExtendedHTMLElement, GenericEvents } from '../../helper/dom';
import { EngagementType } from '../../static';
import '../../styles/components/card/_card.scss';

/**
 * We'll not consider it as an engagement if the total spend time is lower than below constant and won't trigger the event
 */
const ENGAGEMENT_DURATION_LIMIT = 3000;

/**
 * This 6(px) and 300(ms) are coming from a behavioral research and browser reaction to input devices to count the action as a mouse movement or a click event
 */
const ENGAGEMENT_MIN_SELECTION_DISTANCE = 6;
const ENGAGEMENT_MIN_CLICK_DURATION = 300;
interface CardPropsBindable {
  classNames?: string[];
  testId?: string;
  attributes?: Record<string, string>;
  border?: boolean;
  background?: boolean;
  padding?: 'small' | 'medium' | 'large' | 'none';
  children?: Array<HTMLElement | ExtendedHTMLElement | string>;
  events?: Partial<Record<GenericEvents, DomBuilderEventHandler | DomBuilderEventHandlerWithOptions>>;
}

export interface CardProps extends MakePropsBindable<CardPropsBindable>{
  onCardEngaged?: (engagement: {
    engagementDurationTillTrigger: number;
    engagementType: EngagementType;
    totalMouseDistanceTraveled: {
      x: number;
      y: number;
    };
    selectionDistanceTraveled?: { x: number; y: number; selectedText?: string | undefined };
  }) => void;
}
export class Card {
  render: ExtendedHTMLElement;
  private props: CardProps;
  private engagementStartTime: number = -1;
  private totalMouseDistanceTraveled: { x: number; y: number } = { x: 0, y: 0 };
  private previousMousePosition!: { x: number; y: number };
  private mouseDownInfo!: { x: number; y: number; time: number };
  constructor (props: CardProps) {
    this.props = props;
    Object.entries(this.props).forEach(([ key, value ]) => {
      if (isBindable(value)) {
        value.subscribe((newVal) => {
          this.update({
            [key]: newVal
          });
        });
      }
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: getBindableValue(this.props.testId),
      classNames: this.getClassList(),
      children: [
        ...(getBindableValue(this.props.children) ?? []),
      ],
      events: {
        ...getBindableValue(this.props.events),
        ...(this.props.onCardEngaged !== undefined
          ? this.getEngagementEvents()
          : {})
      },
      attributes: getBindableValue(this.props.attributes)
    });
  }

  private readonly getEngagementEvents = (): Partial<Record<GenericEvents, DomBuilderEventHandler | DomBuilderEventHandlerWithOptions>> => ({
    mouseenter: e => {
      if (this.engagementStartTime === -1) {
        this.engagementStartTime = new Date().getTime();
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
        this.totalMouseDistanceTraveled = { x: 0, y: 0 };
      }
    },
    mousemove: e => {
      if (this.engagementStartTime === -1) {
        this.engagementStartTime = new Date().getTime();
      }
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
        this.mouseDownInfo !== undefined &&
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
  });

  private readonly getClassList = (): string[] => ([
    'mynah-card',
    `padding-${getBindableValue(this.props.padding) ?? 'large'}`,
    getBindableValue(this.props.border) !== false ? 'border' : '',
    getBindableValue(this.props.background) !== false ? 'background' : '',
    ...(getBindableValue(this.props.classNames) ?? [])
  ]);

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
    if (this.props.onCardEngaged !== undefined) {
      this.props.onCardEngaged({
        engagementDurationTillTrigger: new Date().getTime() - this.engagementStartTime,
        engagementType:
                    interactionDistanceTraveled !== undefined ? EngagementType.INTERACTION : EngagementType.TIME,
        totalMouseDistanceTraveled: this.totalMouseDistanceTraveled,
        selectionDistanceTraveled:
                    Boolean(interactionDistanceTraveled?.x ?? 0) && Boolean(interactionDistanceTraveled?.y)
                      ? interactionDistanceTraveled
                      : undefined,
      });
    }
    this.resetEngagement();
  };

  public readonly update = (newProps: Partial<CardProps>): void => {
    let updateClassList = false;
    Object.keys(newProps).forEach((propKey) => {
      const key = propKey as keyof CardProps;
      if (key === 'events') {
        this.render.update({
          events: {
            ...(getBindableValue(newProps.events) ?? {}),
            ...(this.props.onCardEngaged !== undefined
              ? this.getEngagementEvents()
              : {})
          }
        });
      }

      if (key === 'attributes') {
        if (getBindableValue(newProps.attributes) != null) {
          this.render.update({
            attributes: getBindableValue(newProps.attributes)
          });
        } else if (getBindableValue(this.props.attributes) != null) {
          const resetAttributes = {};
          Object.assign(resetAttributes, Object.fromEntries(
            Object.keys(getBindableValue(this.props.attributes) ?? {}).map(key => [ key, undefined ])
          ));
          this.render.update({
            attributes: resetAttributes
          });
        }
      }

      if (key === 'testId') {
        this.render.update({ testId: getBindableValue(newProps.testId) });
      }

      if (key === 'children') {
        this.render.clear();
        if (getBindableValue(newProps.children) != null) {
          this.render.update({
            children: [
              ...(getBindableValue(newProps.children) ?? []),
            ],
          });
        }
      }

      if (key === 'classNames' || key === 'border' || key === 'background' || key === 'padding') {
        updateClassList = true;
      }
    });

    this.props = {
      ...this.props,
      ...newProps
    };

    if (updateClassList) {
      this.render.update({
        classNames: this.getClassList(),
      });
    }
  };
}
