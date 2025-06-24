/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DomBuilder, ExtendedHTMLElement } from '../helper/dom';
import { StyleLoader } from '../helper/style-loader';
import { Button } from './button';
import { Icon, MynahIcons } from './icon';
import { generateUID } from '../helper/guid';
import { MynahUIGlobalEvents } from '../helper/events';
import { MynahEventNames } from '../static';

export interface DropdownListOption {
  id: string;
  label: string;
  selected?: boolean;
}

export interface DropdownListProps {
  title: string;
  description?: string;
  options: DropdownListOption[];
  onChange?: (selectedOptions: DropdownListOption[]) => void;
  testId?: string;
  classNames?: string[];
}

export class DropdownList {
  render: ExtendedHTMLElement;
  private readonly props: DropdownListProps;
  private readonly dropdownContent: ExtendedHTMLElement;
  private readonly selectedOptionsContainer: ExtendedHTMLElement;
  private readonly uid: string;
  private isOpen = false;
  private selectedOptions: DropdownListOption[] = [];
  private dropdownIcon: ExtendedHTMLElement;

  constructor (props: DropdownListProps) {
    StyleLoader.getInstance().load('components/_dropdown-list.scss');
    this.props = props;
    this.uid = generateUID();

    // Initialize selected options
    this.selectedOptions = props.options.filter(option => option.selected);

    // Initialize the dropdown icon
    this.dropdownIcon = new Icon({ icon: MynahIcons.DOWN_OPEN }).render;

    // Create the dropdown content (hidden initially)
    this.dropdownContent = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-dropdown-list-content' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-dropdown-list-header' ],
          children: [
            {
              type: 'h4',
              classNames: [ 'mynah-dropdown-list-title' ],
              children: [ props.title ]
            },
            ...(props.description != null
              ? [ {
                  type: 'p',
                  classNames: [ 'mynah-dropdown-list-description' ],
                  children: [ props.description ]
                } ]
              : [])
          ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-dropdown-list-options' ],
          children: props.options.map(option => this.createOptionElement(option))
        }
      ]
    });

    // Create the main dropdown button with the selected option's label if available
    const initialLabel = this.selectedOptions.length > 0 ? this.selectedOptions[0].label : props.title;
    const dropdownButton = new Button({
      label: initialLabel,
      icon: this.dropdownIcon,
      onClick: this.toggleDropdown,
      primary: false,
      status: 'clear',
      classNames: [ 'mynah-dropdown-list-button' ]
    }).render;

    // Create the main container
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: props.testId,
      classNames: [
        'mynah-dropdown-list-wrapper',
        ...(props.classNames ?? [])
      ],
      attributes: {
        id: this.uid
      },
      children: [
        dropdownButton,
        this.dropdownContent
      ]
    });

    // Add click outside listener to close dropdown
    document.addEventListener('click', this.handleClickOutside);
  }

  private readonly createOptionElement = (option: DropdownListOption): ExtendedHTMLElement => {
    const isSelected = this.selectedOptions.some(selectedOption => selectedOption.id === option.id);

    return DomBuilder.getInstance().build({
      type: 'div',
      classNames: [
        'mynah-dropdown-list-option',
        ...(isSelected ? [ 'selected' ] : [])
      ],
      attributes: {
        'data-option-id': option.id
      },
      events: {
        click: (e) => {
          e.stopPropagation();
          this.toggleOption(option);
        }
      },
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-dropdown-list-checkbox' ],
          children: [
            isSelected ? new Icon({ icon: MynahIcons.OK, classNames: [ 'mynah-dropdown-list-check-icon' ] }).render : ''
          ]
        },
        {
          type: 'span',
          classNames: [ 'mynah-dropdown-list-option-label' ],
          children: [ option.label ]
        }
      ]
    });
  };

  private readonly toggleOption = (option: DropdownListOption): void => {
    // Single select: replace the entire selection with the new option
    // unless it's already selected, in which case deselect it
    const isAlreadySelected = this.selectedOptions.some(selectedOption => selectedOption.id === option.id);
    if (isAlreadySelected) {
      // If clicking on the already selected option, deselect it
      this.selectedOptions = [];
    } else {
      // Otherwise, select only this option
      this.selectedOptions = [ option ];
    }

    // Update the UI
    this.updateUI();

    // Trigger onChange callback
    if (this.props.onChange != null) {
      this.props.onChange(this.selectedOptions);
    }

    // Dispatch global event
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.FORM_CHANGE, {
      id: this.uid,
      value: this.selectedOptions.map(opt => opt.id)
    });
  };

  private readonly updateUI = (): void => {
    // Update the options in the dropdown
    const optionElements = this.dropdownContent.querySelectorAll('.mynah-dropdown-list-option');
    Array.from(optionElements).forEach((element) => {
      const optionElement = element as ExtendedHTMLElement;
      const optionId = optionElement.getAttribute('data-option-id');
      const isSelected = this.selectedOptions.some(option => option.id === optionId);

      if (isSelected) {
        optionElement.addClass('selected');
        const checkbox = optionElement.querySelector('.mynah-dropdown-list-checkbox');
        if (checkbox != null) {
          checkbox.innerHTML = '';
          checkbox.appendChild(new Icon({ icon: MynahIcons.OK, classNames: [ 'mynah-dropdown-list-check-icon' ] }).render);
        }
      } else {
        optionElement.removeClass('selected');
        const checkbox = optionElement.querySelector('.mynah-dropdown-list-checkbox');
        if (checkbox != null) {
          checkbox.innerHTML = '';
        }
      }
    });

    // Update the dropdown button label to show the selected option
    const dropdownButton = this.render.querySelector('.mynah-dropdown-list-button');
    if (dropdownButton != null) {
      const buttonLabel = dropdownButton.querySelector('.mynah-button-label');
      if (buttonLabel != null) {
        if (this.selectedOptions.length > 0) {
          // Show only the selected option label
          buttonLabel.innerHTML = this.selectedOptions[0].label;
        } else {
          buttonLabel.innerHTML = this.props.title;
        }
      }
    }
  };

  private readonly toggleDropdown = (e: Event): void => {
    e.stopPropagation();
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.dropdownContent.addClass('open');
      // Update the icon to UP_OPEN when the dropdown is open
      this.dropdownIcon.replaceWith(new Icon({ icon: MynahIcons.UP_OPEN }).render);
      this.dropdownIcon = this.render.querySelector('.mynah-dropdown-list-button .mynah-ui-icon') as ExtendedHTMLElement;
    } else {
      this.dropdownContent.removeClass('open');
      // Update the icon to DOWN_OPEN when the dropdown is closed
      this.dropdownIcon.replaceWith(new Icon({ icon: MynahIcons.DOWN_OPEN }).render);
      this.dropdownIcon = this.render.querySelector('.mynah-dropdown-list-button .mynah-ui-icon') as ExtendedHTMLElement;
    }
  };

  private readonly handleClickOutside = (e: MouseEvent): void => {
    if (this.isOpen && !this.render.contains(e.target as Node)) {
      this.isOpen = false;
      this.dropdownContent.removeClass('open');
      // Update the icon to DOWN_OPEN when the dropdown is closed by clicking outside
      this.dropdownIcon.replaceWith(new Icon({ icon: MynahIcons.DOWN_OPEN }).render);
      this.dropdownIcon = this.render.querySelector('.mynah-dropdown-list-button .mynah-ui-icon') as ExtendedHTMLElement;
    }
  };

  public readonly getSelectedOptions = (): DropdownListOption[] => {
    return [ ...this.selectedOptions ];
  };

  public readonly setSelectedOptions = (optionIds: string[]): void => {
    this.selectedOptions = this.props.options.filter(option =>
      optionIds.includes(option.id)
    );
    this.updateUI();
  };

  public readonly destroy = (): void => {
    document.removeEventListener('click', this.handleClickOutside);
  };
}
