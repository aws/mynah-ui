/// <reference types="react" />
import './mynah-ui-polaris-theme.scss';
import { MynahUI, MynahUIProps } from '@aws/mynah-ui';
type PickMatching<T, V> = {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};
type ExtractMethods<T> = PickMatching<T, any>;
export type MynahUIPublicFeatures = ExtractMethods<MynahUI>;
export declare const MynahUIWrapper: import("react").ForwardRefExoticComponent<MynahUIProps & import("react").RefAttributes<PickMatching<MynahUI, any>>>;
export {};
