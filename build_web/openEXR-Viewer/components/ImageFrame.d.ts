import * as React from 'react';
import { Matrix4x4 } from '../utils/linalg';
import { Input as ImageInput } from '../layers/Layer';
export interface ImageFrameProps {
    image: ImageInput;
    viewTransform: number;
    exposure: number;
    gamma: number;
    offset: number;
    allowMovement: boolean;
    /** Optional callback to be called when the mouse moves */
    onPoint?: (x: number, y: number) => void;
    /** Optional callback to be called when the canvas is panned or zoomed */
    onTransform?: (transformation: Matrix4x4) => void;
    enableMouseEvents: boolean;
}
/**
 * An image frame that deals with mouse movement for padding and zooming
 */
export default class ImageFrame extends React.Component<ImageFrameProps, {}> {
    private imageLayerElement;
    private textLayerElement;
    private mouseLayerElement;
    private imageLayer;
    private textLayer;
    private mouseLayer;
    private transformation;
    /** Where to go back when reset() is called */
    private defaultTransformation;
    constructor(props: ImageFrameProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: ImageFrameProps): void;
    componentWillUnmount(): void;
    /** Set the default transformation that calling reset() will result in */
    setDefaultTransformation(transformation: Matrix4x4): void;
    reset(): void;
    setTransformation(transformation: Matrix4x4): void;
    getTransformation(): Matrix4x4;
    render(): JSX.Element;
    private handleTransformationChange;
    private updateCanvasProps;
}
