/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder } from './dom';

const configProcessors: Record<string, (sourceString: string) => any> = {
  language: (sourceString: string) => decodeURI(sourceString),
};
export class MynahConfig {
  private config: Record<string, any> = {
    'logo-url': '',
    language: 'en',
  };

  constructor () {
    const configElement = DomBuilder.getInstance().root.querySelector('mynah-config');
    if (configElement !== null) {
      Object.keys(this.config).forEach((configItem: string) => {
        if (configElement.getAttribute(configItem) !== undefined) {
          this.config[configItem] = configProcessors[configItem] !== undefined
            ? configProcessors[configItem](
              configElement.getAttribute(configItem) ?? this.config[configItem]
            )
            : configElement.getAttribute(configItem) ?? this.config[configItem];
        }
      });
    }
  }

  getConfig = (configName: string): any => this.config[configName] ?? '';

  setConfig = (configName: string, configValue: string): void => {
    this.config[configName] = configValue;
  };
}
