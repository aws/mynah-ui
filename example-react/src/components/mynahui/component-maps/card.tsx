/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { CardAbstract, CardProps, DomBuilder, ExtendedHTMLElement } from '@aws/mynah-ui';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Container } from '@cloudscape-design/components';

export interface MynahUICardProps {
    children?: Array<HTMLElement | ExtendedHTMLElement | string>;
}

export const MynahUICard = (props: MynahUICardProps) => {
    return (
        <Container>
            <div
                ref={ref => {
                    props.children?.forEach(child => {
                        if (typeof child === 'string') {
                            ref?.appendChild(document.createTextNode(child));
                        } else if (typeof child !== 'undefined') {
                            ref?.appendChild(child);
                        }
                    });
                }}
            />
        </Container>
    );
};

export class CloudscapeMynahUICard extends CardAbstract {
    constructor(props: CardProps) {
        super(props);
        this.render = DomBuilder.getInstance().build({
            type: 'div',
        });

        const elm = createElement(MynahUICard, {
            children: props.children,
        });

        const root = createRoot(this.render);
        root.render(elm);
    }
}
