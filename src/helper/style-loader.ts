/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import '../styles/styles.scss';

export class StyleLoader {
  private static instance: StyleLoader | undefined;
  private constructor () {

  }

  public static getInstance (): StyleLoader {
    if (StyleLoader.instance === undefined) {
      StyleLoader.instance = new StyleLoader();
    }

    return StyleLoader.instance;
  }

  public destroy = (): void => {
    StyleLoader.instance = undefined;
  };
}
