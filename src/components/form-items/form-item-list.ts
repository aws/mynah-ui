/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Config } from '../../helper/config';
import { DomBuilder, ExtendedHTMLElement } from '../../helper/dom';
import { cancelEvent } from '../../helper/events';
import { generateUID } from '../../helper/guid';
import { StyleLoader } from '../../helper/style-loader';
import { ChatItemFormItem, ListItemEntry } from '../../static';
import { Button } from '../button';
import { ChatItemFormItemsWrapper } from '../chat-item/chat-item-form-items';
import { Icon, MynahIcons } from '../icon';

export interface FormItemListProps {
  items: ChatItemFormItem[];
  entries: ListItemEntry[];
  classNames?: string[];
  attributes?: Record<string, string>;
  label?: HTMLElement | ExtendedHTMLElement | string;
  description?: ExtendedHTMLElement;
  wrapperTestId?: string;
  onChange?: (values: string[]) => void;
}

export abstract class FormItemListAbstract {
  render: ExtendedHTMLElement;
  setValue = (value: ListItemEntry[]): void => { };
  getValue = (): string[] => [];
  setEnabled = (enabled: boolean): void => { };
}

export class FormItemListInternal extends FormItemListAbstract {
  private readonly rowWrapper: ExtendedHTMLElement;
  private readonly addButton: ExtendedHTMLElement;
  private readonly props: FormItemListProps;
  private readonly rows: Map<string, ExtendedHTMLElement> = new Map();
  private formData: Record<string, string> = {};
  render: ExtendedHTMLElement;

  constructor (props: FormItemListProps) {
    StyleLoader.getInstance().load('components/form-items/_form-item-list.scss');
    super();
    this.props = props;

    this.rowWrapper = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-form-item-list-rows-wrapper' ],
      children: [
        this.addButton
      ]
    });

    this.addButton = new Button({
      classNames: [ 'mynah-form-item-list-add-button' ],
      primary: false,
      label: 'Add',
      onClick: (e) => {
        cancelEvent(e);
        this.addRow();
      },
      icon: new Icon({ icon: MynahIcons.PLUS }).render
    }).render;

    this.render = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-form-input-wrapper' ],
      children: [
        {
          type: 'span',
          classNames: [ 'mynah-form-input-label' ],
          children: [ ...(props.label !== undefined ? [ props.label ] : []) ]
        },
        {
          type: 'div',
          classNames: [ 'mynah-form-item-list-wrapper' ],
          testId: props.wrapperTestId,
          children: [
            this.rowWrapper,
            this.addButton
          ]
        },
        ...[ props.description !== undefined ? props.description : '' ]
      ]
    });

    // Initialize with existing values or add an empty row
    if (props.entries.length > 0) {
      props.entries.forEach(entry => this.addRow(entry));
    } else {
      this.addRow();
    }
  }

  private addRow (entry?: ListItemEntry): void {
    const rowId = generateUID();

    // Create form items container
    const formItemsContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-form-item-list-row-items-container' ]
    });

    // Create remove button
    const removeButton = new Button({
      classNames: [ 'mynah-form-item-list-row-remove-button' ],
      primary: false,
      disabled: entry?.persistent,
      onClick: (e) => {
        cancelEvent(e);
        this.removeRow(rowId);
      },
      icon: new Icon({ icon: MynahIcons.CANCEL }).render
    }).render;

    // Render form items
    this.props.items.forEach(item => {
      item = { ...item, title: this.rows.size === 0 ? item.title : '' };

      const value = entry?.values[item.id];
      if (value != null) {
        item.value = value;
      }

      formItemsContainer.appendChild(new ChatItemFormItemsWrapper({
        tabId: '',
        chatItem: {
          formItems: [ item ]
        },
        onFormChange: (formData: Record<string, string>) => {
          this.formData = formData;
          this.props.onChange?.(this.getValue());
        },
      }).render);
    });

    // Create row container and add it to the wrapper
    const rowContainer = DomBuilder.getInstance().build({
      type: 'div',
      classNames: [ 'mynah-form-item-list-row' ],
      attributes: {
        'data-row-id': rowId
      },
      children: [
        formItemsContainer,
        removeButton
      ]
    });
    this.rowWrapper.appendChild(rowContainer);

    // Store the row reference
    this.rows.set(rowId, rowContainer);
    this.props.onChange?.(this.getValue());
  }

  private removeRow (rowId: string): void {
    const row = this.rows.get(rowId);
    if (row != null) {
      row.remove();
      this.rows.delete(rowId);
      this.props.onChange?.(this.getValue());
    }
  }

  setValue = (value: ListItemEntry[]): void => {
    // Clear existing rows
    this.rows.forEach(row => row.remove());
    this.rows.clear();

    // Add new rows
    if (value.length > 0) {
      value.forEach(entry => this.addRow(entry));
    } else {
      this.addRow();
    }
  };

  getValue = (): string[] => {
    return Object.values(this.formData);
  };

  setEnabled = (enabled: boolean): void => {
    // TODO: Implement
  };
}

export class FormItemList extends FormItemListAbstract {
  render: ExtendedHTMLElement;

  constructor (props: FormItemListProps) {
    super();
    return new (Config.getInstance().config.componentClasses.FormItemList ?? FormItemListInternal)(props);
  }

  setValue = (value: ListItemEntry[]): void => { };
  getValue = (): string[] => [];
  setEnabled = (enabled: boolean): void => { };
}
