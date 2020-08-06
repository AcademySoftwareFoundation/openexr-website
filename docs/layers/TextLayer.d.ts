import { Matrix4x4 } from '../utils/linalg';
import Layer, { Input } from './Layer';
export default class TextLayer extends Layer {
    protected image: Input;
    private context;
    private needsRerender;
    constructor(canvas: HTMLCanvasElement, image: Input);
    setTransformation(transformation: Matrix4x4): void;
    setImage(image: Input): void;
    /**
     * Force a new draw
     */
    invalidate(): void;
    /**
     * Render loop, will draw when this component is invalidated with
     * this.needsRerender = true;
     * or when the size of the container changed
     */
    private checkRender;
    /**
     * Paint a new overlay
     */
    private draw;
    /**
     * Convert coordinates from clip space to raster space
     * @param out coordinates in raster space (0, xres) x (0, yres)
     * @param a coordinates in clip space (-1,1) x (-1,1)
     * @param xres
     * @param yres
     */
    private convertClipToRaster;
    /**
     * Convert coordinates from raster space to clip space
     * @param out coordinates in raster space (0, xres) x (0, yres)
     * @param a coordinates in clip space (-1,1) x (-1,1)
     * @param xres
     * @param yres
     */
    private convertRasterToClip;
}
