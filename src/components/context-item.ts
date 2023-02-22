/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextChangeType, ContextSource, ContextType, ContextTypeClassNames, ContextTypes, MynahEventNames, SearchPayloadMatchPolicy } from '../static';
import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { Button } from './button';
import { Icon, MynahIcons } from './icon';
import { PrioritizationMenuButtons } from './prioritization-menu';
import { cancelEvent, MynahUIGlobalEvents } from '../helper/events';
import { MynahUIDataStore } from '../helper/store';

export interface ContextPillProps {
  context: ContextType;
  showRemoveButton?: boolean;
}
export class ContextPill {
  private readonly props: ContextPillProps;
  render: ExtendedHTMLElement;
  constructor (props: ContextPillProps) {
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'span',
      attributes: { context: props.context.context },
      classNames: [ 'mynah-context-pill', ContextTypeClassNames[props.context.type ?? ContextTypes.SHOULD],
        ...(MynahUIDataStore.getInstance().getValue('invisibleContextItems').includes(props.context.context) === true ? [ 'mynah-context-hidden' ] : []) ],
      children: [
        ...(props.showRemoveButton !== false
          ? [
              new Icon({
                icon: this.props.context.type === ContextTypes.MUST_NOT ? MynahIcons.BLOCK : MynahIcons.OK_CIRCLED,
                classNames: [ 'mynah-context-pill-group-icon' ]
              }).render
            ]
          : []),
        {
          type: 'span',
          classNames: [ 'mynah-context-checkbox-label' ],
          events: !(props.showRemoveButton ?? false)
            ? {
                click: (event: Event) => {
                  cancelEvent(event);
                  const currentMatchPolicy: SearchPayloadMatchPolicy = MynahUIDataStore.getInstance().getValue('matchPolicy') as SearchPayloadMatchPolicy;
                  const alreadyAvailable = Object.keys((currentMatchPolicy)).reduce((res: boolean, policyGroup: string) => {
                    if (currentMatchPolicy[policyGroup as keyof SearchPayloadMatchPolicy].includes(this.props.context.context)) {
                      return true;
                    }
                    return res;
                  }, false);
                  if (!alreadyAvailable) {
                    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CONTEXT_VISIBILITY_CHANGE, {
                      type: ContextChangeType.ADD,
                      context: {
                        context: this.props.context.context,
                        type: ContextTypes.SHOULD,
                        source: ContextSource.SUGGESTION,
                      }
                    });
                  }
                },
              }
            : {},
          children: [
            { type: 'span', innerHTML: props.context.context },
            ...(props.showRemoveButton ?? false
              ? [
                  {
                    type: 'div',
                    classNames: [ 'filter-remove-button' ],
                    events: {
                      click: (event: Event) => {
                        cancelEvent(event);
                        MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.CONTEXT_VISIBILITY_CHANGE, {
                          type: ContextChangeType.REMOVE,
                          context: this.props.context
                        });
                        MynahUIDataStore.getInstance().updateStore({
                          userAddedContext: [
                            ...MynahUIDataStore.getInstance().getValue('userAddedContext').filter((contextKey: string) => contextKey !== this.props.context.context)
                          ]
                        });
                      },
                    },
                    children: [ new Icon({ icon: MynahIcons.CANCEL }).render ],
                  },
                ]
              : []),
          ],
        },
        new Button({
          onClick: this.handleMenuOpen.bind(this),
          icon: new Icon({ icon: MynahIcons.MENU }).render,
        }).render.addClass('mynah-prioritise-button'),
      ],
    });
  }

  private readonly handleMenuOpen = (e: Event): void => {
    const elm: HTMLElement = e.currentTarget as HTMLElement;
    this.render.addClass('keep-active');
    const buttons = new PrioritizationMenuButtons({
      referenceElement: elm,
      context: this.props.context,
      onMenuClose: () => {
        this.render.removeClass('keep-active');
      },
    });
    buttons.createOverlay();
  };
}
