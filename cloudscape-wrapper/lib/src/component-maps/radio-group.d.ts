/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/// <reference types="react" />
import { RadioGroupAbstract, RadioGroupProps } from '@aws/mynah-ui';
interface MynahUIRadioGroupProps extends RadioGroupProps {
    disabled?: boolean;
}
export declare const MynahUIRadioGroup: (props: MynahUIRadioGroupProps) => JSX.Element;
export declare class CloudscapeMynahUIRadioGroup extends RadioGroupAbstract {
    private readonly root;
    private readonly props;
    private disabled;
    constructor(props: RadioGroupProps);
    private readonly onChangeHandler;
    private readonly updateRender;
    setValue: (value: string) => void;
    getValue: () => string;
    setEnabled: (enabled: boolean) => void;
}
export {};
