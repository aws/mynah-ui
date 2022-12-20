/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextType, ContextTypeClassNames, ContextTypes } from '../static';
import { cancelEvent, DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { Button } from './button';
import { Icon, MynahIcons } from './icon';
import { PrioritizationMenuButtons } from './prioritization-menu';
import { ContextManager } from '../helper/context-manager';

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
      attributes: { 'pill-of': props.context.context },
      classNames: [ 'mynah-context-pill', ContextTypeClassNames[props.context.type ?? ContextTypes.SHOULD] ],
      children: [
        {
          type: 'label',
          attributes: { for: props.context.context },
          classNames: [ 'mynah-context-checkbox-label' ],
          events: !(props.showRemoveButton ?? false)
            ? {
                click: (event: Event) => {
                  cancelEvent(event);
                  ContextManager.getInstance().addOrUpdateContext({ ...props.context, visible: true });
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
                        ContextManager.getInstance().removeContext(props.context.context);
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
