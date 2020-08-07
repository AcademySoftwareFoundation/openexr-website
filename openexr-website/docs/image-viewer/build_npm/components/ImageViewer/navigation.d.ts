/// <reference types="react" />
import { InputNode } from './index';
export interface NavRowProps {
    row: InputNode;
    active: boolean;
    selection: string;
    handleClick: Function;
    removeCommonPrefix: boolean;
}
export declare const NavRow: ({ row, active, selection, handleClick, removeCommonPrefix }: NavRowProps) => JSX.Element;
