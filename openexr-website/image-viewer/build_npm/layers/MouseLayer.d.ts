import { Matrix4x4 } from '../utils/linalg';
import Layer, { Input } from './Layer';
/**
 * Mouse Layer
 * @todo add some proper documentation
 */
export default class MouseLayer extends Layer {
    private pointCallback?;
    private transformationCallback?;
    private panningState;
    private unsubscribeFunctions; /** To be called on destruct */
    private enableMouseEvents;
    constructor(canvas: HTMLCanvasElement, image: Input, enableMouseEvents: boolean);
    setTransformation(transformation: Matrix4x4, broadcast?: boolean): void;
    setEnableMouseEvents(enable: boolean): void;
    onTransformationChange(callback?: (t: Matrix4x4) => void): void;
    setImage(image: Input): void;
    onPointAt(callback?: Function): void;
    destruct(): void;
    private handleMouseMove;
    private handleMouseUp;
    private handleMouseDown;
    private handleScroll;
    /**
     * Event handler for reporting mouse movement.
     *
     * Only applicable when the options 'onPoint' property is set on this component.
     */
    private handlePointReporting;
    /**
     * Translate clientX and clientY values to relative positions within the bounding box
     * of the viewer.
     */
    private relativeMousePosition;
    /**
     * Translate canvas coordinates to image coodrinates
     */
    private canvasToImage;
}
