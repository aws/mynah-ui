/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable @typescript-eslint/no-dynamic-delete */
/* eslint-disable @typescript-eslint/prefer-includes */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent, MynahUIGlobalEvents } from '../../helper/events';
import { MynahUIDataStore } from '../../helper/store';
import {
  KeyMap,
  SearchPayloadMatchPolicy,
  ContextSource,
  ContextType,
  ContextTypes,
  MynahEventNames,
  ContextChangeType,
  NotificationType
} from '../../static';
import { ContextPill } from '../context-item';
import { Icon, MynahIcons } from '../icon';
import { Notification } from '../notification/notification';

interface RenderedContextType extends ContextType {
  render: HTMLElement | ExtendedHTMLElement;
}
export interface SearchContextProps {
  initContextList?: SearchPayloadMatchPolicy;
  onContextInsertionEnabled?: () => void;
  onContextInsertionDisabled?: () => void;
}

export class SearchContext {
  private readonly allowedCharCount = 100;
  private readonly contextCheckExpression = /^\S+$/;
  private readonly isAcceptedKeyPress = (char: string): boolean => this.contextCheckExpression.test(char);
  private readonly acceptedNagivationKeys = Object.keys(KeyMap).map(
    (key: string) => (KeyMap as Record<string, string>)[key]
  );

  private renderedContextMap: Record<string, RenderedContextType> = {};
  private readonly onContextInsertionEnabled;
  private readonly onContextInsertionDisabled;

  constructor (props?: SearchContextProps) {
    this.onContextInsertionEnabled = props?.onContextInsertionEnabled;
    this.onContextInsertionDisabled = props?.onContextInsertionDisabled;
    const initContext = MynahUIDataStore.getInstance().getValue('matchPolicy');
    if (initContext !== undefined) {
      this.createContextItemElements(initContext, {});
    }

    MynahUIDataStore.getInstance().subscribe('matchPolicy', (matchPolicy: SearchPayloadMatchPolicy, oldMatchPolicy: Partial<SearchPayloadMatchPolicy>) => {
      this.createContextItemElements(matchPolicy, oldMatchPolicy);
    });
  }

  private readonly enableContextInsertion = (): void => {
    this.contextInsertionButton.addClass('context-insertion-activated');
    this.contextInsertionInput.focus();
    if (this.onContextInsertionEnabled !== undefined) {
      this.onContextInsertionEnabled();
    }
  };

  private readonly disableContextInsertion = (): void => {
    this.contextInsertionButton.removeClass('context-insertion-activated');
    this.contextInsertionInput.value = '';
    this.inputAutoWidth.update({
      innerHTML: '',
    });
    if (this.onContextInsertionDisabled !== undefined) {
      this.onContextInsertionDisabled();
    }
  };

  private readonly createContextItemElements = (matchPolicy: SearchPayloadMatchPolicy, oldMatchPolicy: Partial<SearchPayloadMatchPolicy>): void => {
    const userAddedContext: string[] = MynahUIDataStore.getInstance().getValue('userAddedContext') as string[];
    const removedContext: ContextType[] = [];
    const addedContext: ContextType[] = [];
    Object.keys(oldMatchPolicy).forEach(policyGroup => {
      oldMatchPolicy[policyGroup as keyof SearchPayloadMatchPolicy]?.forEach(contextKey => {
        if (matchPolicy[policyGroup as keyof SearchPayloadMatchPolicy]?.indexOf(contextKey) === -1) {
          removedContext.push({
            context: contextKey,
            source: ContextSource.AUTO,
            type: policyGroup as ContextTypes
          });
        }
      });
    });
    Object.keys(matchPolicy).forEach(policyGroup => {
      matchPolicy[policyGroup as keyof SearchPayloadMatchPolicy].forEach(contextKey => {
        if (!oldMatchPolicy[policyGroup as keyof SearchPayloadMatchPolicy]?.includes(contextKey)) {
          addedContext.push({
            context: contextKey,
            source: userAddedContext.includes(contextKey) ? ContextSource.USER : ContextSource.AUTO,
            type: policyGroup as ContextTypes
          });
        }
      });
    });

    removedContext.forEach((contextItem: ContextType) => {
      if (this.renderedContextMap[contextItem.context]) {
        this.renderedContextMap[contextItem.context].render.remove();
        delete this.renderedContextMap[contextItem.context];
      }
    });
    addedContext.forEach((contextItem: ContextType) => {
      const contextRender = new ContextPill({
        context: contextItem,
        showRemoveButton: true,
      }).render;
      this.renderedContextMap[contextItem.context] = {
        ...contextItem,
        render: contextRender,
      };
      this.contextWrapper.insertChild('afterbegin', contextRender);
    });
  };

  private readonly contextInsertionKeydownHandler = (e: KeyboardEvent): void => {
    if (this.acceptedNagivationKeys.includes(e.key) || this.isAcceptedKeyPress(e.key)) {
      if (e.key === KeyMap.ENTER || e.key === KeyMap.SPACE) {
        cancelEvent(e);
        if (this.contextCheckExpression.test(this.contextInsertionInput.value)) {
          if (this.renderedContextMap[this.contextInsertionInput.value] === undefined) {
            MynahUIDataStore.getInstance().updateStore({
              userAddedContext: [ ...MynahUIDataStore.getInstance().getValue('userAddedContext'), this.contextInsertionInput.value ]
            });

            const loadingListener = MynahUIDataStore.getInstance().subscribe('loading', (loadingState) => {
              if (!loadingState) {
                this.enableContextInsertion();
              }
              MynahUIDataStore.getInstance().unsubscribe('loading', loadingListener);
            });
            MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CONTEXT_VISIBILITY_CHANGE, {
              type: ContextChangeType.ADD,
              context: {
                context: this.contextInsertionInput.value,
                type: ContextTypes.SHOULD,
                source: ContextSource.USER,
              }
            });
          } else {
            this.contextWrapper.insertChild(
              'afterbegin',
              this.renderedContextMap[this.contextInsertionInput.value].render
            );
          }

          this.inputAutoWidth.update({
            innerHTML: '',
          });
          this.contextInsertionInput.value = '';
        } else {
          this.contextInsertionButton.removeClass('shake');
          setTimeout(() => {
            this.contextInsertionButton.addClass('shake');
            const notification = new Notification({
              content: 'You cannot add context items containing spaces.',
              type: NotificationType.WARNING,
              onNotificationClick: () => { },
            });
            notification.notify();
          }, 50);
        }
      } else if (e.key === KeyMap.ESCAPE) {
        cancelEvent(e);
        this.disableContextInsertion();
      } else {
        if (
          !this.acceptedNagivationKeys.includes(e.key) &&
                    this.allowedCharCount - this.contextInsertionInput.value.length <= 0
        ) {
          cancelEvent(e);
        }
      }
    } else {
      cancelEvent(e);
    }
  };

  private readonly inputAutoWidth = DomBuilder.getInstance().build({
    type: 'span',
  });

  private contextInsertionInput = DomBuilder.getInstance().build({
    type: 'input',
    classNames: [ 'context-text-input' ],
    attributes: {
      maxlength: this.allowedCharCount.toString(),
      tabindex: '10',
      type: 'text',
      placeholder: 'Add context',
    },
    events: {
      focus: this.enableContextInsertion,
      blur: this.disableContextInsertion,
      keydown: this.contextInsertionKeydownHandler,
      input: () => {
        this.inputAutoWidth.update({
          innerHTML: this.contextInsertionInput.value,
        });
      },
      paste: cancelEvent,
    },
  });

  private readonly contextInsertionButton = DomBuilder.getInstance().build({
    type: 'label',
    persistent: true,
    classNames: [ 'mynah-context-checkbox-label' ],
    attributes: { id: 'add-new-context' },
    events: { click: this.enableContextInsertion.bind(this) },
    children: [
      new Icon({ icon: MynahIcons.PLUS }).render,
      {
        type: 'span',
        classNames: [ 'add-new-context-label' ],
        children: [ 'Add context' ],
      },
      this.contextInsertionInput,
      this.inputAutoWidth,
    ],
  });

  private readonly contextWrapper = DomBuilder.getInstance().build({
    type: 'div',
    classNames: [ 'mynah-context-wrapper' ],
    children: [ this.contextInsertionButton ],
  });

  render = DomBuilder.getInstance().build({
    type: 'div',
    classNames: [ 'mynah-search-block-advanced-control' ],
    children: [ this.contextWrapper ],
    events: {
      dblclick: (e) => {
        new Notification({
          title: 'Error occured',
          content: [
            { type: 'span', children: [ 'An error occured while getting the suggestions for your search.' ] },
            { type: 'span', children: [ 'This error is reported to the team automatically. We will take it into account shortly.' ] },
          ],
          type: NotificationType.ERROR,
          onNotificationClick: () => {
            //
          },
          duration: -1
        }).notify();
      }
    }
  });
}
