/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Root, createRoot } from 'react-dom/client';
import { RadioGroup } from '@cloudscape-design/components';
import { useState } from 'react';
import { DomBuilder, RadioGroupAbstract, RadioGroupProps } from '@aws/mynah-ui';

interface MynahUIRadioGroupProps extends RadioGroupProps {
  disabled?: boolean;
}

export const MynahUIRadioGroup = (
  props: MynahUIRadioGroupProps
): JSX.Element => {
  const [value, setValue] = useState<string>(props.value ?? '');

  return (
    <>
      {props.label && (
        <span
          className='mynah-form-input-label'
          ref={(ref) => {
            if (ref != null) {
              (ref as HTMLElement).innerHTML = '';
            }
            if (typeof props.label === 'string') {
              ref?.appendChild(document.createTextNode(props.label));
            } else if (typeof props.label !== 'undefined') {
              ref?.appendChild(props.label);
            }
          }}
        />
      )}
      <RadioGroup
        onChange={(e: any) => {
          setValue(e.detail.value);
          if (props.onChange != null) {
            props.onChange(e.detail.value);
          }
        }}
        value={value}
        items={props.options?.map((opt) => ({
          ...opt,
          disabled: props.disabled,
        }))}
      />
    </>
  );
};

export class CloudscapeMynahUIRadioGroup extends RadioGroupAbstract {
  private readonly root: Root;
  private readonly props: RadioGroupProps;
  private disabled: boolean = false;
  constructor(props: RadioGroupProps) {
    super();
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'span',
      classNames: [
        'mynah-ui-cloudscape-radio-group-wrapper',
        'mynah-form-input-wrapper',
        ...(this.props.classNames ?? []),
      ],
      attributes: this.props.attributes,
    });
    this.root = createRoot(this.render);
    this.updateRender();
  }

  private readonly onChangeHandler = (value: string): void => {
    this.props.value = value;
    if (this.props.onChange != null) {
      this.props.onChange(value);
    }
  };

  private readonly updateRender = (): void => {
    this.root.render(
      <MynahUIRadioGroup
        {...this.props}
        onChange={this.onChangeHandler}
        disabled={this.disabled}
      />
    );
  };

  setValue = (value: string): void => {
    this.props.value = value;
    this.updateRender();
  };

  getValue = (): string => this.props.value ?? '';

  setEnabled = (enabled: boolean): void => {
    this.disabled = !enabled;
    this.updateRender();
  };
}
