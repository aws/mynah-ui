/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom'
import {
    OnCopiedToClipboardFunction,
    RelevancyVoteType,
    Suggestion,
    SupportedCodingLanguagesExtensionToTypeMap,
} from '../../static'
import { SyntaxHighlighter } from '../syntax-highlighter'
import { findLanguageFromSuggestion } from '../../helper/find-language'
import { SuggestionCardRelevanceVote } from './suggestion-card-relevance-vote'

export interface SuggestionCardBodyProps {
    suggestion: Suggestion
    onVoteChange: (suggestion: Suggestion, vote: RelevancyVoteType) => void
    onCopiedToClipboard?: OnCopiedToClipboardFunction
}
export class SuggestionCardBody {
    render: ExtendedHTMLElement

    constructor(props: SuggestionCardBodyProps) {
        const matchingLanguage =
            findLanguageFromSuggestion(props.suggestion) ?? SupportedCodingLanguagesExtensionToTypeMap.js
        this.render = DomBuilder.getInstance().build({
            type: 'div',
            classNames: ['mynah-card-center'],
            children: [
                {
                    type: 'div',
                    classNames: ['mynah-card-body'],
                    children: [
                        ...(Array.from(
                            DomBuilder.getInstance().build({
                                type: 'div',
                                innerHTML: props.suggestion.body,
                            }).childNodes
                        ).map(node => {
                            const elementFromNode: HTMLElement = node as HTMLElement
                            if (
                                elementFromNode.tagName?.toLowerCase() === 'pre' &&
                                // eslint-disable-next-line no-null/no-null
                                elementFromNode.querySelector('code') !== null
                            ) {
                                return new SyntaxHighlighter({
                                    codeStringWithMarkup: elementFromNode.querySelector('code')?.innerHTML ?? '',
                                    language: matchingLanguage,
                                    keepHighlights: true,
                                    showCopyOptions: true,
                                    onCopiedToClipboard: props.onCopiedToClipboard,
                                }).render
                            }
                            return node
                        }) as HTMLElement[]),
                    ],
                },
                new SuggestionCardRelevanceVote({ suggestion: props.suggestion, onVoteChange: props.onVoteChange }).render,
            ],
        })
    }
}
