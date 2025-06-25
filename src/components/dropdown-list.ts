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
import { DropdownListOption, DropdownListProps, MynahEventNames, MynahPortalNames } from '../static';

export class DropdownList {
  render: ExtendedHTMLElement;
  private readonly props: DropdownListProps;
  private readonly tabId: string;
  private readonly messageId: string;
  private dropdownContent: ExtendedHTMLElement | null = null;
  private dropdownPortal: ExtendedHTMLElement | null = null;
  private readonly selectedOptionsContainer: ExtendedHTMLElement;
  private readonly uid: string;
  private isOpen = false;
  private selectedOptions: DropdownListOption[] = [];
  private dropdownIcon: ExtendedHTMLElement;

  constructor (props: DropdownListProps) {
    StyleLoader.getInstance().load('components/_dropdown-list.scss');
    this.props = props;
    this.uid = generateUID();

    // Initialize messageId + tabId
    this.tabId = props.tabId ?? '';
    this.messageId = props.messageId ?? '';

    // Initialize selected options
    this.selectedOptions = props.options.filter(option => option.selected);

    // Initialize the dropdown icon
    this.dropdownIcon = new Icon({ icon: MynahIcons.DOWN_OPEN }).render;

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

    // Create the main container (without dropdown content)
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
        dropdownButton
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
          type: 'span',
          classNames: [ 'mynah-dropdown-list-option-label' ],
          children: [
            ...(isSelected ? [ new Icon({ icon: MynahIcons.OK, classNames: [ 'mynah-dropdown-list-check-icon' ] }).render ] : []),
            option.label
          ]
        }
      ]
    });
  };

  private readonly toggleOption = (option: DropdownListOption): void => {
    // Single select: replace the entire selection with the new option
    // Keep the current selection if clicking on already selected option
    const isAlreadySelected = this.selectedOptions.some(selectedOption => selectedOption.id === option.id);
    if (isAlreadySelected) {
      // If clicking on the already selected option, keep it selected (no change)
      return;
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
  };

  private readonly updateUI = (): void => {
    // Update the options in the dropdown (only if dropdown is open)
    if (this.dropdownContent != null) {
      const optionElements = this.dropdownContent.querySelectorAll('.mynah-dropdown-list-option');
      Array.from(optionElements).forEach((element) => {
        const optionElement = element as ExtendedHTMLElement;
        const optionId = optionElement.getAttribute('data-option-id');

        // Handle null case explicitly
        if (optionId == null) {
          return;
        }

        const isSelected = this.selectedOptions.some(option => option.id === optionId);
        const optionLabel = this.props.options.find(opt => opt.id === optionId)?.label ?? '';

        if (isSelected) {
          optionElement.addClass('selected');
          const labelElement = optionElement.querySelector('.mynah-dropdown-list-option-label');
          if (labelElement != null) {
            labelElement.innerHTML = '';
            labelElement.appendChild(new Icon({ icon: MynahIcons.OK, classNames: [ 'mynah-dropdown-list-check-icon' ] }).render);
            labelElement.appendChild(document.createTextNode(optionLabel));
          }
        } else {
          optionElement.removeClass('selected');
          const labelElement = optionElement.querySelector('.mynah-dropdown-list-option-label');
          if (labelElement != null) {
            labelElement.innerHTML = optionLabel;
          }
        }
      });
    }

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
      this.openDropdown();
    } else {
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.DROP_DOWN_OPTION_CHANGE, {
        value: this.selectedOptions,
        messageId: this.messageId,
        tabId: this.tabId
      });
      this.closeDropdown();
    }
  };

  private readonly openDropdown = (): void => {
    // Create the dropdown content
    this.dropdownContent = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-dropdown-list-content', 'open' ],
      children: [
        {
          type: 'div',
          classNames: [ 'mynah-dropdown-list-header' ],
          children: [
            {
              type: 'h4',
              classNames: [ 'mynah-dropdown-list-title' ],
              children: [
                ...(this.props.titleIcon != null
                  ? [ new Icon({
                      icon: this.props.titleIcon,
                      classNames: [
                        'mynah-dropdown-list-title-icon',
                        ...(this.props.titleIcon === MynahIcons.WARNING ? [ 'mynah-dropdown-list-title-icon-warning' ] : []),
                        ...(this.props.titleIcon === MynahIcons.INFO ? [ 'mynah-dropdown-list-title-icon-info' ] : [])
                      ]
                    }).render ]
                  : []),
                {
                  type: 'span',
                  classNames: [ 'mynah-dropdown-list-title-text' ],
                  children: [ this.props.title ]
                }
              ]
            },
            ...(this.props.description != null
              ? [ {
                  type: 'p',
                  classNames: [ 'mynah-dropdown-list-description' ],
                  children: [ this.props.description ]
                } ]
              : [])
          ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-dropdown-list-options' ],
          children: this.props.options.map(option => this.createOptionElement(option))
        }
      ]
    });

    // Create portal container
    this.dropdownPortal = DomBuilder.getInstance().createPortal(
      `${MynahPortalNames.OVERLAY}-dropdown-${this.uid}`,
      {
        type: 'div',
        classNames: [ 'mynah-dropdown-list-portal' ],
        attributes: {
          style: 'position: fixed; z-index: 9999;'
        },
        events: {
          click: (event: MouseEvent) => {
            // Prevent closing when clicking inside the dropdown
            event.stopPropagation();
          }
        },
        children: [ this.dropdownContent ]
      },
      'beforeend'
    );

    // Position the dropdown and add scroll listeners
    this.updateDropdownPosition();
    window.addEventListener('scroll', this.updateDropdownPosition, true);
    window.addEventListener('resize', this.updateDropdownPosition);

    // Update the icon to UP_OPEN when the dropdown is open
    this.dropdownIcon.replaceWith(new Icon({ icon: MynahIcons.UP_OPEN }).render);
    this.dropdownIcon = this.render.querySelector('.mynah-dropdown-list-button .mynah-ui-icon') as ExtendedHTMLElement;
  };

  private readonly isElementVisible = (element: Element): boolean => {
    const rect = element.getBoundingClientRect();

    // Check if element is visible within its scrollable parent containers
    let parent = element.parentElement;
    while (parent != null) {
      const parentRect = parent.getBoundingClientRect();
      const parentStyle = window.getComputedStyle(parent);

      // Check if parent has overflow hidden/scroll/auto
      const hasOverflow = parentStyle.overflow !== 'visible' ||
                         parentStyle.overflowX !== 'visible' ||
                         parentStyle.overflowY !== 'visible';

      if (hasOverflow) {
        // Check if element is visible within this parent's bounds
        const isVisibleInParent = !(
          rect.bottom < parentRect.top ||
          rect.top > parentRect.bottom ||
          rect.right < parentRect.left ||
          rect.left > parentRect.right
        );

        if (!isVisibleInParent) {
          return false;
        }
      }

      parent = parent.parentElement;
    }

    // Also check viewport bounds
    const viewportHeight = window.innerHeight ?? document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth ?? document.documentElement.clientWidth;

    return !(rect.bottom < 0 || rect.top > viewportHeight || rect.right < 0 || rect.left > viewportWidth);
  };

  private readonly updateDropdownPosition = (): void => {
    if (this.dropdownPortal != null) {
      // Check if the button is visible in the viewport
      if (!this.isElementVisible(this.render)) {
        // If button is not visible, close the dropdown
        this.isOpen = false;
        this.closeDropdown();
        return;
      }

      // Calculate position relative to the button
      const buttonRect = this.render.getBoundingClientRect();
      const calculatedTop = buttonRect.bottom + 4; // 4px margin

      // Try to find the chat item card container to align with its right edge
      const chatItemCard = this.render.closest('.mynah-chat-item-card');
      let calculatedLeft: number;

      if (chatItemCard != null) {
        // Align dropdown right edge with chat item card right edge
        const cardRect = chatItemCard.getBoundingClientRect();
        calculatedLeft = cardRect.right - 250; // 250px is dropdown width
      } else {
        // Fallback to button alignment if chat item card not found
        calculatedLeft = buttonRect.right - 250;
      }

      // Update the portal position
      this.dropdownPortal.style.top = `${calculatedTop}px`;
      this.dropdownPortal.style.left = `${calculatedLeft}px`;
    }
  };

  private readonly closeDropdown = (): void => {
    // Remove scroll and resize listeners
    window.removeEventListener('scroll', this.updateDropdownPosition, true);
    window.removeEventListener('resize', this.updateDropdownPosition);

    // Remove the portal
    if (this.dropdownPortal != null) {
      this.dropdownPortal.remove();
      this.dropdownPortal = null;
    }
    this.dropdownContent = null;

    // Update the icon to DOWN_OPEN when the dropdown is closed
    this.dropdownIcon.replaceWith(new Icon({ icon: MynahIcons.DOWN_OPEN }).render);
    this.dropdownIcon = this.render.querySelector('.mynah-dropdown-list-button .mynah-ui-icon') as ExtendedHTMLElement;
  };

  private readonly handleClickOutside = (e: MouseEvent): void => {
    // should trigger on change event as well
    if (this.isOpen && !this.render.contains(e.target as Node)) {
      this.isOpen = false;
      this.closeDropdown();
      // add event here
      MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.DROP_DOWN_OPTION_CHANGE, {
        value: this.selectedOptions,
        messageId: this.messageId,
        tabId: this.tabId
      });
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

    // Remove scroll and resize listeners if dropdown is open
    if (this.isOpen) {
      window.removeEventListener('scroll', this.updateDropdownPosition, true);
      window.removeEventListener('resize', this.updateDropdownPosition);
    }

    // Clean up portal if it exists
    if (this.dropdownPortal != null) {
      this.dropdownPortal.remove();
      this.dropdownPortal = null;
    }
    this.dropdownContent = null;
  };
}
