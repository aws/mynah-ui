/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/// <reference types="react" />
import { TextAreaAbstract, TextAreaProps } from '@aws/mynah-ui';
interface MynahUITextAreaProps extends TextAreaProps {
    disabled?: boolean;
}
export declare const MynahUITextArea: (props: MynahUITextAreaProps) => JSX.Element;
export declare class CloudscapeMynahUITextArea extends TextAreaAbstract {
    private readonly root;
    private readonly props;
    private disabled;
    constructor(props: TextAreaProps);
    private readonly onChangeHandler;
    private readonly updateRender;
    setValue: (value: string) => void;
    getValue: () => string;
    setEnabled: (enabled: boolean) => void;
}
export {};
