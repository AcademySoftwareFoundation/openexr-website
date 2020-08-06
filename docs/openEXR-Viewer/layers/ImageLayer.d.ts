import { Matrix4x4 } from '../utils/linalg';
import { Image } from '../utils/image-loading';
import Layer, { Input } from './Layer';
export interface TonemappingSettings {
    viewTransform: number;
    offset: number;
    gamma: number;
    exposure: number;
}
export declare type TextureCache = (image: Image) => WebGLTexture;
/**
 * Image Layer
 */
export default class ImageLayer extends Layer {
    private tonemappingSettings;
    private needsRerender;
    private getTexture;
    private gl;
    private glAttributes;
    private glUniforms;
    private quadVertexBuffer;
    private cmapTexture;
    constructor(canvas: HTMLCanvasElement, image: Input);
    setTransformation(transformation: Matrix4x4): void;
    setTonemapping(tonemapping: TonemappingSettings): void;
    setImage(image: Input): void;
    /**
     * Force a new draw the next frame
     */
    invalidate(): void;
    /**
     * Render loop, will draw when this component is invalidated with
     * this.needsRerender = true;
     * or when the size of the container changed
     */
    private checkRender;
    /**
     * Paint a new image
     */
    private draw;
    private initWebGl;
    private initShaders;
    private initCmapTexture;
    private initQuadVertexBuffer;
    private initAttributes;
    private initUniforms;
    private createTexture;
}
