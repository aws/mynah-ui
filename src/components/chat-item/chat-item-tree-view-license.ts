/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent } from '../../helper/events';
import { ReferenceTrackerInformation } from '../../static';
import { Button } from '../button';
import { Icon, MynahIcons } from '../icon';

export interface ChatItemTreeViewLicenseProps {
  referenceSuggestionLabel: string;
  references: ReferenceTrackerInformation[];
}

export class ChatItemTreeViewLicense {
  private isOpen: boolean;
  private readonly referenceListWrapper: ExtendedHTMLElement;
  private readonly dropdownButtonWrapper: ExtendedHTMLElement;
  render: ExtendedHTMLElement;

  constructor (props: ChatItemTreeViewLicenseProps) {
    // If no references are found then just return an empty div
    if (props.references.length === 0) {
      this.render = DomBuilder.getInstance().build({
        type: 'div',
      });
      return;
    }

    this.isOpen = true;

    this.referenceListWrapper = DomBuilder.getInstance().build({
      type: 'div',
      children: this.buildDropdownChildren(props.references)
    });

    const dropdownButton = this.buildDropdownButton(props.referenceSuggestionLabel, props.references);

    this.dropdownButtonWrapper = DomBuilder.getInstance().build({
      type: 'div',
      children: [ dropdownButton ]
    });

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-chat-item-tree-view-license' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-chat-item-tree-view-license-container' ],
          children: [
            this.dropdownButtonWrapper,
            this.referenceListWrapper
          ]
        }
      ]
    });
  }

  private buildDropdownChildren (references: ReferenceTrackerInformation[]): ExtendedHTMLElement[] | string[] {
    return this.isOpen
      ? [
          DomBuilder.getInstance().build({
            type: 'ul',
            children: references.map(ref => ({
              type: 'li',
              innerHTML: ref.information
            })),
          })
        ]
      : [ '' ];
  }

  private buildDropdownButton (label: string, references: ReferenceTrackerInformation[]): ExtendedHTMLElement {
    return new Button({
      icon: new Icon({ icon: this.isOpen ? MynahIcons.DOWN_OPEN : MynahIcons.RIGHT_OPEN }).render,
      classNames: [ 'mynah-chat-item-tree-view-license-dropdown-button' ],
      label,
      primary: false,
      onClick: (e) => {
        cancelEvent(e);
        this.isOpen = !this.isOpen;
        this.referenceListWrapper.update({
          children: this.buildDropdownChildren(references)
        });
        this.dropdownButtonWrapper.update({
          children: [ this.buildDropdownButton(label, references) ]
        });
      },
    }).render;
  }
}
