/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
/// <reference types="react" />
import './button.scss';
import { ButtonAbstract, ButtonProps, ExtendedHTMLElement } from '@aws/mynah-ui';
interface MynahUIButtonProps extends ButtonProps {
    disabled?: boolean;
}
export declare const MynahUIButton: (props: MynahUIButtonProps) => JSX.Element;
export declare class CloudscapeMynahUIButton extends ButtonAbstract {
    private readonly root;
    private readonly props;
    private disabled;
    constructor(props: ButtonProps);
    updateLabel: (label: HTMLElement | ExtendedHTMLElement | string) => void;
    setEnabled: (enabled: boolean) => void;
}
export {};
