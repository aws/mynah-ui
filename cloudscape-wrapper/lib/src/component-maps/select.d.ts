/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/// <reference types="react" />
import { SelectAbstract, SelectProps } from '@aws/mynah-ui';
interface MynahUISelectProps extends SelectProps {
    disabled?: boolean;
}
export declare const MynahUISelect: (props: MynahUISelectProps) => JSX.Element;
export declare class CloudscapeMynahUISelect extends SelectAbstract {
    private readonly root;
    private readonly props;
    private disabled;
    constructor(props: SelectProps);
    private readonly onChangeHandler;
    private readonly updateRender;
    setValue: (value: string) => void;
    getValue: () => string;
    setEnabled: (enabled: boolean) => void;
}
export {};
