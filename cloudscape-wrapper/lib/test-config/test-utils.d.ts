import { ReactElement } from 'react';
import { RenderOptions } from '@testing-library/react';
declare const baseRender: (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => HTMLElement;
export * from '@testing-library/react';
export * from '@testing-library/jest-dom';
export { baseRender as renderElement };
