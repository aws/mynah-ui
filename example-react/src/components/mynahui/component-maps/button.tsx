/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// import { marked } from 'marked';
import { ButtonAbstract, ButtonProps, DomBuilder, ExtendedHTMLElement } from '@aws/mynah-ui';
import { createElement, ReactElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { Button } from '@cloudscape-design/components';

interface MynahUIButtonProps extends ButtonProps {
  disabled?: boolean;
}

export const MynahUIButton = (props: MynahUIButtonProps) => {
  return (
    <Button onClick={(event)=>{
        props.onClick(event);
    }}
    variant={props.primary ? 'primary' : 'normal'}>
      <span
        ref={(ref) => {
          if (typeof props.icon === "string") {
            ref?.appendChild(document.createTextNode(props.icon));
          } else if (typeof props.icon !== "undefined") {
            ref?.appendChild(props.icon);
          }
        }}
      />

      <span
        ref={(ref) =>{
            console.log(props.label, props.children);
            const elmList = [...(props.children ? props.children : []), ...(props.label ? [props.label] : [])];
            console.log(elmList);
            elmList?.forEach((child) => {
                if (typeof child === "string") {
                  ref?.insertAdjacentText('beforeend', child);
                } else {
                  ref?.insertAdjacentElement('beforeend', child);
                }
              })
        }}
      />
    </Button>
  );
};

export class CloudscapeMynahUIButton extends ButtonAbstract {
  private root: Root;
  private elm: ReactElement;
  private props: ButtonProps;
  private disabled: boolean = false;
  constructor (props: ButtonProps) {
    super();
    this.props = props;
    this.render = DomBuilder.getInstance().build({
      type: 'span'
    });
    this.elm = createElement(MynahUIButton, {
      ...this.props,
      disabled: this.disabled
    });
    this.root = createRoot(this.render);
    this.root.render(this.elm);
  }

  updateLabel = (label: HTMLElement | ExtendedHTMLElement | string): void => {
    this.root.unmount();
    this.root = createRoot(this.render);
    this.props.children = [label];
    this.elm = createElement(MynahUIButton, {
      ...this.props,
    });
    this.root.render(this.elm);
  };

  setEnabled = (enabled: boolean): void => {
    this.root.unmount();
    this.root = createRoot(this.render);
    this.disabled = !enabled;
    this.elm = createElement(MynahUIButton, {
      ...this.props,
      disabled: this.disabled
    });
    this.root.render(this.elm);
  };
}
