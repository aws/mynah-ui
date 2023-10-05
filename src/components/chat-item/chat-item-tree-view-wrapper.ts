/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { fileListToTree } from '../../helper/file-tree';
import { Icon, MynahIcons } from '../icon';
import { Button } from '../button';
import { ChatItemTreeView } from './chat-item-tree-view';

export interface ChatItemTreeViewWrapperProps {
  files: string[];
}

export class ChatItemTreeViewWrapper {
  render: ExtendedHTMLElement;

  constructor (props: ChatItemTreeViewWrapperProps) {
    const tree = new ChatItemTreeView({
      node: fileListToTree(props.files),
    }).render;

    const codeSuggestions = DomBuilder.getInstance().build({
      type: 'h3',
      classNames: [ 'mynah-chat-item-tree-view-wrapper-label' ],
      children: [ `Code Suggestions ${props.files.length} files` ]
    });

    const wrapper = DomBuilder.getInstance().build({
      type: 'div',
      children: [ codeSuggestions, tree ]
    });

    const viewDiffLabel = DomBuilder.getInstance().build({
      type: 'h4',
      classNames: [ 'mynah-chat-item-tree-view-wrapper-feedback-label' ],
      children: [ 'Click on a file to view diff' ]
    });

    const dashLabel = DomBuilder.getInstance().build({
      type: 'hr',
      classNames: [ ],
      children: [ ]
    });

    const thumbsUpButton = new Button({
      icon: new Icon({ icon: MynahIcons.THUMBS_UP }).render,
      onClick: (e) => {
        // TODO implement thumbs up handler
      }
    }).render;

    const thumbsDownButton = new Button({
      icon: new Icon({ icon: MynahIcons.THUMBS_DOWN }).render,
      onClick: (e) => {
        // TODO implement thumbs down handler
      }
    }).render;

    const feedbackWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-tree-view-wrapper-feedback-div' ],
      children: [ thumbsUpButton, thumbsDownButton ]
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-tree-view-wrapper' ],
      children: [ wrapper, viewDiffLabel, dashLabel, feedbackWrapper ]
    });
  }
}
