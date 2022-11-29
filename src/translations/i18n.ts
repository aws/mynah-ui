/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { I18nResolver } from 'i18n-ts'
import en from './en'

export class I18N {
    private static instance: I18N;
    public texts;
    private constructor(localLanguage?: string) {
        const i18n = {
            en,
            default: en,
        }
        this.texts = new I18nResolver(i18n, localLanguage).translation
    }

    public static getInstance(localLanguage?: string): I18N {
        if (!I18N.instance) {
            I18N.instance = new I18N(localLanguage);
        }

        return I18N.instance;
    }
}
