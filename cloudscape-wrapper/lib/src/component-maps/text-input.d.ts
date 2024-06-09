/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/// <reference types="react" />
import { TextInputAbstract, TextInputProps } from '@aws/mynah-ui';
interface MynahUITextInputProps extends TextInputProps {
    disabled?: boolean;
}
export declare const MynahUITextInput: (props: MynahUITextInputProps) => JSX.Element;
export declare class CloudscapeMynahUITextInput extends TextInputAbstract {
    private readonly root;
    private readonly props;
    private disabled;
    constructor(props: TextInputProps);
    private readonly onChangeHandler;
    private readonly updateRender;
    setValue: (value: string) => void;
    getValue: () => string;
    setEnabled: (enabled: boolean) => void;
}
export {};
