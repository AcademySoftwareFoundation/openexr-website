import { Matrix4x4 } from '../utils/linalg';
import { Image } from '../utils/image-loading';
export interface ImageDifference {
    type: 'Difference';
    imageA: Image;
    imageB: Image;
    width: number;
    height: number;
    nChannels: number;
    lossFunction: LossFunction;
}
export declare type Input = Image | ImageDifference;
export default class Layer {
    protected canvas: HTMLCanvasElement;
    protected image: Input;
    protected transformation: Matrix4x4;
    private aspectMatrixBuffer;
    private viewMatrixBuffer;
    constructor(canvas: HTMLCanvasElement, image: Input);
    /**
     * Resize the canvas size if its elements size in the browser changed
     * @return whether anything changed
     */
    protected resize(): boolean;
    /**
     * Compute the scalings in X and Y make sure the (-1,1) x (-1,1) box has the aspect ratio of the image
     * and is positioned centerally in the canvas
     */
    protected getAspect(): {
        x: number;
        y: number;
    };
    /**
     * Compute the view matrix from the current transformation and the shape of the window
     */
    protected getViewMatrix(): Matrix4x4;
}
export declare enum LossFunction {
    L1 = 1,
    L2 = 2,
    MAPE = 3,
    MRSE = 4,
    SMAPE = 5,
    SSIM = 6
}
export declare function lossFunctionFromString(name: string): LossFunction;
