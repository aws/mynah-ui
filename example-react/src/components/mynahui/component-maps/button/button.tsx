/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// import { marked } from 'marked';
import { ButtonAbstract, ButtonProps, DomBuilder, ExtendedHTMLElement } from '@aws/mynah-ui';
import { Root, createRoot } from 'react-dom/client';
import { Button } from '@cloudscape-design/components';
import './button.scss';

interface MynahUIButtonProps extends ButtonProps {
    disabled?: boolean;
}

export const MynahUIButton = (props: MynahUIButtonProps) => {
    const getElmList = () => [...(props.children ? props.children : []), ...(props.label ? [props.label] : [])];
    return (
        <Button
            disabled={props.disabled}
            iconSvg={
                typeof props.icon !== 'undefined' ? (
                    <span
                        className="mynah-ui-cloudscape-button-icon"
                        ref={ref => {
                            if (typeof props.icon === 'string') {
                                ref?.appendChild(document.createTextNode(props.icon));
                            } else if (typeof props.icon !== 'undefined') {
                                ref?.appendChild(props.icon);
                            }
                        }}
                    />
                ) : undefined
            }
            onClick={event => {
                props.onClick(event);
            }}
            variant={props.primary ? 'primary' : getElmList().length > 0 ? (props.primary === false ? 'link' : 'normal') : 'inline-icon'}
        >
            {getElmList().map(elm => {
                if (typeof elm === 'string') {
                    return elm;
                }
                return (
                    <span
                        ref={ref => {
                            ref?.insertAdjacentElement('beforeend', elm);
                        }}
                    />
                );
            })}
        </Button>
    );
};

export class CloudscapeMynahUIButton extends ButtonAbstract {
    private root: Root;
    private props: ButtonProps;
    private disabled: boolean = false;
    constructor(props: ButtonProps) {
        super();
        this.props = props;
        this.render = DomBuilder.getInstance().build({
            type: 'span',
            classNames: ['mynah-ui-cloudscape-button-wrapper', ...(props.primary === false ? ['mynah-ui-cloudscape-button-inline'] : []), ...(this.props.classNames??[])],
            attributes: this.props.attributes
        });
        this.root = createRoot(this.render);
        this.root.render(<MynahUIButton {...this.props} disabled={this.disabled}/>);
    }

    updateLabel = (label: HTMLElement | ExtendedHTMLElement | string): void => {
        this.props.children = [label];
        this.root.render(<MynahUIButton {...this.props} disabled={this.disabled}/>);
    };

    setEnabled = (enabled: boolean): void => {
        this.disabled = !enabled;
        this.root.render(<MynahUIButton {...this.props} disabled={this.disabled}/>);
    };
}
