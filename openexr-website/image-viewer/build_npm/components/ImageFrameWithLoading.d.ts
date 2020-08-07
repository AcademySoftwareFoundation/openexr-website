import * as React from 'react';
import { Matrix4x4 } from '../utils/linalg';
import ImageFrame from './ImageFrame';
import { LossFunction, Input as ImageInput } from '../layers/Layer';
export interface ImageSpecUrl {
    type: 'Url';
    url: string;
    tonemapGroup: string;
}
export interface ImageSpecLossMap {
    type: 'Difference';
    lossFunction: LossFunction;
    urlA: string;
    urlB: string;
    tonemapGroup: string;
}
export declare type ImageSpec = ImageSpecUrl | ImageSpecLossMap;
export interface ImageFrameWithLoadingProps {
    imageSpec: ImageSpec;
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
export interface ImageFrameWithLoadingState {
    isLoading: boolean;
    errorMsg: string | null;
    image: ImageInput | null;
}
/**
 * A wrapper around ImageFrame that deals with the loading of images
 * It takes an `ImageSpec` instead of an `InputImage`.
 */
export default class ImageFrameWithLoading extends React.Component<ImageFrameWithLoadingProps, ImageFrameWithLoadingState> {
    imageFrame: ImageFrame | null;
    private cache;
    private requestId;
    private currentRequest;
    constructor(props: ImageFrameWithLoadingProps);
    componentWillReceiveProps(nextProps: ImageFrameWithLoadingProps): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    /**
     * Initiate the download of the current spec.
     * Sets the state in case of correct or incorrect loads.
     */
    private handleImageChange;
    /**
     * Download an image
     * @param image specification of the image to download (url or difference of two images)
     * @return Promise of a loaded image
     */
    private downloadImage;
}
