import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react';

const baseRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
): HTMLElement => render(ui, { wrapper: React.Fragment, ...options }).container.firstChild as HTMLElement

export * from '@testing-library/react';
export * from '@testing-library/jest-dom';
export { baseRender as renderElement };