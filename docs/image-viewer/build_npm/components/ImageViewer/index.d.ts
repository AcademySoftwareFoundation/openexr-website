import * as React from 'react';
import { Matrix4x4 } from '../../utils/linalg';
export declare type InputTree = InputNode | InputLeaf;
export interface InputNode {
    title: string;
    children: InputTree[];
}
export declare type InputLeaf = InputLeafImage | InputLeafLossMap;
export interface InputLeafImage {
    title: string;
    image: string;
}
export interface InputLeafLossMap {
    title: string;
    lossMap: {
        function: string;
        imageA: string;
        imageB: string;
    };
}
export interface ImageViewerState {
    activeRow: number; /** The number of the row that is currently active for keyboard toggling */
    selection: string[]; /** List of item titles that are selected */
    viewTransform: {
        [tonemapGroup: string]: number;
    }; /** Image view transform, a number between 0 and 1 for each tonemapGroup (string) */
    exposure: {
        [tonemapGroup: string]: number;
    }; /** Image exposure, a number > 0 for each tonemapGroup (string) */
    helpIsOpen: boolean; /** Whether the help screen overlay is currently open */
    defaultTransformation: Matrix4x4;
    transformationNeedsUpdate: boolean;
    hasFocus: boolean; /** The viewer has 'focus', i.e. the user clicked on it */
}
export interface ImageViewerProps {
    data: InputTree; /** Unsorted input tree, use the accessor this.getMenu() instead */
    baseUrl: string; /** Prefix for all images */
    sortMenu: boolean; /** Whether to sort the menu-items automatically */
    removeCommonPrefix: boolean; /** Should common prefices of menu names be shortened. */
    showInfo: boolean; /** Should the info footer be shown */
    selection?: string[]; /** List of item titles that are selected */
    onSelectionChange?: (selection: string[]) => void; /** The selection changed callback */
}
export default class ImageViewer extends React.Component<ImageViewerProps, ImageViewerState> {
    static defaultProps: {
        baseUrl: string;
        sortMenu: boolean;
        removeCommonPrefix: boolean;
        showInfo: boolean;
    };
    /** A reference the the imageFrame element, ready once the ImageViewer is loaded */
    private imageFrame;
    /** A reference to the div element of the containing div */
    private mainContainer;
    constructor(props: ImageViewerProps);
    getSelection(): string[];
    getMenu(): InputTree;
    componentDidMount(): void;
    componentDidUpdate(prevProps: ImageViewerProps): void;
    componentWillUnmount(): void;
    setTransformation(transformation: Matrix4x4): void;
    render(): JSX.Element;
    private renderImageSpec;
    /**
     * Select the active rows from the navigation data tree, according to the given selection
     *
     * @param tree navigation datastructure
     * @param selection array of the titles of selected items from top to bottom
     */
    private activeRows;
    /**
     * Recursively sort the input data
     *
     * It's a bit smart, for example bathroom-32 will come before bathroom-128,
     * and the word Color always goes first.
     * @param tree to be sored
     */
    private sortMenuRows;
    /**
     * Find the image to be shown based on the current selection
     */
    private currentImage;
    /**
     * Specification for the current image to load
     */
    private imageSpec;
    /**
     * Navigate to a particular image
     *
     * @param rows: a list of the rows currently visible
     * @param rowIndex: the index of the row in which to switch tabs
     * @param title: the title of the requested node
     *
     * For rows > rowIndex, we select children matching the current selection titles
     * if they exist. Otherwise, we resort to lazy matching.
     */
    private navigateTo;
    /**
     * Make sure that the current selection is valid given the current menu data
     *
     * If a title in the selection does not exist in the respective row, take a closely matching
     * element of the row.
     * @param wishes the desired selection, which might not be valid given the selected menu items
     */
    private validateSelection;
    /**
     * Update the selection state in the internal state or observers, depending
     * on configuration.
     * @param selection The selection to use
     */
    private updateSelectionState;
    /**
     * Return the titles of the first items of a sorted tree
     * @param tree a sorted navigation data structure
     */
    private getDefaultSelection;
    private dumpTransformation;
    private keyboardHandler;
    private setFocus;
    private unsetFocus;
}
