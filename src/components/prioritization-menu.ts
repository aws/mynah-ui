/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextType, ContextTypeClassNames, ContextTypes } from '../static'
import { cancelEvent, DomBuilder, ExtendedHTMLElement } from '../helper/dom'
import { Button } from './button'
import { Icon, MynahIcons } from './icon'
import { Overlay, OverlayVerticalDirection } from './overlay/overlay'
import { ContextManager } from '../helper/context-manager'
export interface PrioritizationMenuButtonsProps {
    context: ContextType
    referenceElement: Element | ExtendedHTMLElement
    onMenuClose: () => void
}
export class PrioritizationMenuButtons {
    private menuOverlay!: Overlay
    private readonly props: PrioritizationMenuButtonsProps
    constructor(props: PrioritizationMenuButtonsProps) {
        this.props = props
    }

    public createOverlay(): void {
        this.menuOverlay = new Overlay({
            referenceElement: this.props.referenceElement,
            verticalDirection: OverlayVerticalDirection.CENTER,
            onClose: this.props.onMenuClose,
            children: [
                {
                    type: 'div',
                    classNames: ['mynah-prioritization-menu-buttons-container'],
                    children: [
                        new Button({
                            classNames: ['mynah-prioritise-button', ContextTypeClassNames[ContextTypes.MUST]],
                            onClick: (e: Event) => {
                                cancelEvent(e)
                                this.handlePrioritizationButtonClick.apply(this, [ContextTypes.MUST])
                            },
                            label: DomBuilder.getInstance().build({
                                type: 'span',
                                innerHTML: `Must have&nbsp;<b>${this.props.context.context}</b>`,
                            }),
                        }).render,
                        new Button({
                            classNames: ['mynah-prioritise-button', ContextTypeClassNames[ContextTypes.SHOULD]],
                            onClick: (e: Event) => {
                                cancelEvent(e)
                                this.handlePrioritizationButtonClick.apply(this, [ContextTypes.SHOULD])
                            },
                            label: DomBuilder.getInstance().build({
                                type: 'span',
                                innerHTML: `More with&nbsp;<b>${this.props.context.context}</b>`,
                            }),
                        }).render,
                        new Button({
                            classNames: ['mynah-prioritise-button', ContextTypeClassNames[ContextTypes.MUST_NOT]],
                            onClick: (e: Event) => {
                                cancelEvent(e)
                                this.handlePrioritizationButtonClick.apply(this, [ContextTypes.MUST_NOT])
                            },
                            label: DomBuilder.getInstance().build({
                                type: 'span',
                                innerHTML: `Without&nbsp;<b>${this.props.context.context}</b>`,
                            }),
                        }).render,
                    ],
                },
            ],
        })
    }

    private readonly handlePrioritizationButtonClick = (priority: ContextTypes): void => {
        this.menuOverlay.close()
        ContextManager.getInstance().addOrUpdateContext({ ...this.props.context, type: priority, visible: true })
    }
}
