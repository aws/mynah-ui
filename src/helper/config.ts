/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StateManager } from "../static";
import { DomBuilder } from "./dom";

const configProcessors: Record<string, (sourceString: string) => any> = {
    'query-text': (sourceString: string) => decodeURI(sourceString),
    context: (sourceString: string) => decodeURI(sourceString),
    loading: (sourceString: string) => sourceString === 'true',
    suggestions: (sourceString: string) => decodeURI(sourceString),
    'code-selection': (sourceString: string) => decodeURI(sourceString),
    'code-query': (sourceString: string) => decodeURI(sourceString),
    live: (sourceString: string) => sourceString === 'true',
    language: (sourceString: string) => decodeURI(sourceString),
}
export interface MynahConfigProps {
    stateManager: StateManager
}
export class MynahConfig {
    private config: Record<string, any> = {
        'query-text': '',
        context: '',
        loading: 'false',
        suggestions: '',
        'logo-url': '',
        'code-selection': '',
        'code-query': '',
        live: false,
        language: 'en',
    }
    private readonly stateManager;

    constructor(props:MynahConfigProps) {
        const configElement = DomBuilder.getInstance().root.querySelector('mynah-config');
        this.stateManager = props.stateManager;
        // eslint-disable-next-line no-null/no-null
        if (configElement !== null) {
            Object.keys(this.config).forEach((configItem: string) => {
                if (Boolean(this.stateManager.getState()) && Boolean(this.stateManager.getState()[configItem])) {
                    this.config[configItem] = this.stateManager.getState()[configItem]
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                } else if (configElement.getAttribute(configItem)) {
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    this.config[configItem] = configProcessors[configItem]
                        ? configProcessors[configItem](
                              configElement.getAttribute(configItem) ?? this.config[configItem]
                          )
                        : configElement.getAttribute(configItem) ?? this.config[configItem]
                }
            })
        }
    }

    getConfig = (configName: string): any => this.config[configName] ?? ''

    setConfig = (configName: string, configValue: string): void => {
        this.config[configName] = configValue
        this.stateManager.setState({ ...this.config })
    }
}
