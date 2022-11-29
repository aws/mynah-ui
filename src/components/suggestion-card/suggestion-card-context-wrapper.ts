/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContextSource } from '../../static'
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom'
import { ContextPill } from '../context-item'
import { ContextManager } from '../../helper/context-manager'

export interface SuggestionCardContextWrapperProps {
    contextList: string[]
}
export class SuggestionCardContextWrapper {
    render: ExtendedHTMLElement
    constructor(props: SuggestionCardContextWrapperProps) {
        this.render = DomBuilder.getInstance().build({
            type: 'div',
            classNames: ['mynah-card-context-wrapper'],
            children: [
                {
                    type: 'div',
                    classNames: ['mynah-card-tags'],
                    children: props.contextList.map((context: string) => {
                        ContextManager.getInstance().addOrUpdateContext({
                            ...ContextManager.getInstance().getContextObjectFromKey(context),
                            availableInSuggestion: true,
                            source: ContextSource.SUGGESTION,
                        })
                        return new ContextPill({
                            context: ContextManager.getInstance().contextMap[context],
                        }).render
                    }),
                },
            ],
        })
    }
}
