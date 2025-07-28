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
import testIds from '../helper/test-ids';

export class DropdownList {
  render: ExtendedHTMLElement;
  private readonly props: DropdownListProps;
  private readonly tabId: string;
  private readonly messageId: string;
  private dropdownContent: ExtendedHTMLElement | null = null;
  private dropdownPortal: ExtendedHTMLElement | null = null;
  private readonly uid: string;
  private isOpen = false;
  private selectedOptions: DropdownListOption[] = [];
  private dropdownIcon: ExtendedHTMLElement;
  private readonly sheetOpenListenerId: string | null = null;

  // Helper method to get CSS variable values
  private getCSSVariableValue (variableName: string, fallback: number): number {
    const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    if (value.length > 0) {
      const numericValue = parseFloat(value);
      return isNaN(numericValue) ? fallback : numericValue;
    }
    return fallback;
  }

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
      classNames: [ 'mynah-dropdown-list-button' ],
      testId: testIds.dropdownList.button
    }).render;

    // Create the main container (without dropdown content)
    this.render = DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.dropdownList.wrapper,
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

    // Add click outside listener to close dropdown (use capture phase to catch events before stopPropagation)
    document.addEventListener('click', this.handleClickOutside, true);

    // Listen for sheet/overlay open events to close dropdown
    this.sheetOpenListenerId = MynahUIGlobalEvents.getInstance().addListener(MynahEventNames.OPEN_SHEET, this.handleSheetOpen);
  }

  private readonly createOptionElement = (option: DropdownListOption): ExtendedHTMLElement => {
    const isSelected = this.selectedOptions.some(selectedOption => selectedOption.id === option.id);

    return DomBuilder.getInstance().build({
      type: 'div',
      testId: testIds.dropdownList.option,
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
          testId: testIds.dropdownList.optionLabel,
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
    // Skip if already selected
    if (this.selectedOptions.some(selectedOption => selectedOption.id === option.id)) {
      return;
    }

    // Select only this option
    this.selectedOptions = [ option ];

    // Update UI, close dropdown and dispatch event
    this.updateUI();
    this.isOpen = false;
    this.closeDropdown();
    this.dispatchChangeEvent();
  };

  private readonly updateUI = (): void => {
    // Update dropdown options (if dropdown is open)
    if (this.dropdownContent != null) {
      const optionElements = this.dropdownContent.querySelectorAll('.mynah-dropdown-list-option');
      const selectedIds = new Set(this.selectedOptions.map(opt => opt.id));

      Array.from(optionElements).forEach((element) => {
        const optionElement = element as ExtendedHTMLElement;
        const optionId = optionElement.getAttribute('data-option-id');
        if (optionId == null) return;

        const isSelected = selectedIds.has(optionId);
        const optionLabel = this.props.options.find(opt => opt.id === optionId)?.label ?? '';
        const labelElement = optionElement.querySelector('.mynah-dropdown-list-option-label');

        if (labelElement == null) return;

        if (isSelected) {
          optionElement.addClass('selected');
          labelElement.innerHTML = '';
          labelElement.appendChild(new Icon({ icon: MynahIcons.OK, classNames: [ 'mynah-dropdown-list-check-icon' ] }).render);
          labelElement.appendChild(document.createTextNode(optionLabel));
        } else {
          optionElement.removeClass('selected');
          labelElement.innerHTML = optionLabel;
        }
      });
    }

    // Update button label
    const buttonLabel = this.render.querySelector('.mynah-dropdown-list-button .mynah-button-label');
    if (buttonLabel != null) {
      buttonLabel.innerHTML = this.selectedOptions.length > 0 ? this.selectedOptions[0].label : this.props.title;
    }
  };

  private readonly onLinkClick = (buttonId: string): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.DROPDOWN_LINK_CLICK, {
      tabId: this.props.tabId,
      actionId: buttonId
    });
  };

  private readonly toggleDropdown = (e: Event): void => {
    e.stopPropagation();
    this.isOpen = !this.isOpen;
    this.isOpen ? this.openDropdown() : this.closeDropdown();
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
            ...(this.props.description != null
              ? [ {
                  type: 'p',
                  testId: testIds.dropdownList.description,
                  classNames: [ 'mynah-dropdown-list-description' ],
                  children: [
                    this.props.description,
                    ...(this.props.descriptionLink != null
                      ? (() => {
                          const descriptionLink = this.props.descriptionLink;
                          return [ {
                            type: 'button',
                            classNames: [ 'mynah-dropdown-list-description-link' ],
                            events: {
                              click: (e: Event) => {
                                e.stopPropagation();
                                this.onLinkClick(descriptionLink.id);
                              }
                            },
                            children: [ descriptionLink.text ]
                          } ];
                        })()
                      : [])
                  ]
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
        testId: testIds.dropdownList.portal,
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

    // Check viewport bounds first (quick check)
    const viewportHeight = window.innerHeight ?? document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth ?? document.documentElement.clientWidth;
    if (rect.bottom < 0 || rect.top > viewportHeight || rect.right < 0 || rect.left > viewportWidth) {
      return false;
    }

    // Check parent containers with overflow
    for (let parent = element.parentElement; parent != null; parent = parent.parentElement) {
      const parentStyle = window.getComputedStyle(parent);
      const hasOverflow = [ 'overflow', 'overflowX', 'overflowY' ].some(
        prop => parentStyle[prop as any] !== 'visible'
      );

      if (hasOverflow) {
        const parentRect = parent.getBoundingClientRect();
        if (rect.bottom < parentRect.top || rect.top > parentRect.bottom ||
            rect.right < parentRect.left || rect.left > parentRect.right) {
          return false;
        }
      }
    }

    return true;
  };

  private readonly updateDropdownPosition = (): void => {
    if (this.dropdownPortal == null) return;

    // Close dropdown if button is not visible
    if (!this.isElementVisible(this.render)) {
      this.isOpen = false;
      this.closeDropdown();
      return;
    }

    // Calculate position using CSS variables
    const buttonRect = this.render.getBoundingClientRect();
    const dropdownWidth = this.getCSSVariableValue('--mynah-dropdown-width', 250);
    const dropdownMargin = this.getCSSVariableValue('--mynah-dropdown-margin', 4);

    // Position dropdown below button with margin
    const calculatedTop = buttonRect.bottom + dropdownMargin;

    // Align with chat item card if present, otherwise align with button
    const chatItemCard = this.render.closest('.mynah-chat-item-card');
    const calculatedLeft = (chatItemCard != null)
      ? chatItemCard.getBoundingClientRect().right - dropdownWidth
      : buttonRect.right - dropdownWidth;

    // Update position
    this.dropdownPortal.style.top = `${calculatedTop}px`;
    this.dropdownPortal.style.left = `${calculatedLeft}px`;
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
    if (!this.isOpen) return;

    const target = e.target as Node;

    // Don't close if clicking inside the dropdown portal
    if (this.dropdownPortal?.contains(target) ?? false) {
      return;
    }

    // Don't close if clicking on this dropdown's button
    if (this.render.contains(target)) {
      return;
    }

    // Close the dropdown for any other click
    this.isOpen = false;
    this.closeDropdown();
    this.dispatchChangeEvent();
  };

  private readonly handleSheetOpen = (): void => {
    // Close dropdown when any sheet/overlay opens
    if (this.isOpen) {
      this.isOpen = false;
      this.closeDropdown();
      this.dispatchChangeEvent();
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

  private readonly dispatchChangeEvent = (): void => {
    MynahUIGlobalEvents.getInstance().dispatch(MynahEventNames.DROP_DOWN_OPTION_CHANGE, {
      value: this.selectedOptions,
      messageId: this.messageId,
      tabId: this.tabId
    });

    // Also trigger onChange callback if provided
    if (this.props.onChange != null) {
      this.props.onChange(this.selectedOptions);
    }
  };

  public readonly destroy = (): void => {
    document.removeEventListener('click', this.handleClickOutside, true);

    // Remove sheet open listener if it exists
    if (this.sheetOpenListenerId != null) {
      MynahUIGlobalEvents.getInstance().removeListener(MynahEventNames.OPEN_SHEET, this.sheetOpenListenerId);
    }

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
