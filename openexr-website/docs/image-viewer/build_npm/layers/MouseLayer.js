"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var linalg_1 = require("../utils/linalg");
var Layer_1 = require("./Layer");
var normalizeWheel = require('normalize-wheel');
var SCROLL_FACTOR = 1.001;
/**
 * Mouse Layer
 * @todo add some proper documentation
 */
var MouseLayer = /** @class */ (function (_super) {
    __extends(MouseLayer, _super);
    function MouseLayer(canvas, image, enableMouseEvents) {
        var _this = _super.call(this, canvas, image) || this;
        _this.panningState = null;
        _this.unsubscribeFunctions = []; /** To be called on destruct */
        _this.handleMouseMove = _this.handleMouseMove.bind(_this);
        _this.handleMouseDown = _this.handleMouseDown.bind(_this);
        _this.handleMouseUp = _this.handleMouseUp.bind(_this);
        _this.handleScroll = _this.handleScroll.bind(_this);
        _this.handlePointReporting = _this.handlePointReporting.bind(_this);
        _this.enableMouseEvents = enableMouseEvents;
        // Subscribe to changes in the layers reactive inputs and window size
        var unsubscribe;
        document.addEventListener('mouseup', _this.handleMouseUp);
        unsubscribe = document.removeEventListener.bind(document, 'mouseup', _this.handleMouseUp);
        _this.unsubscribeFunctions.push(unsubscribe);
        document.addEventListener('mousemove', _this.handleMouseMove);
        unsubscribe = document.removeEventListener.bind(document, 'mousemove', _this.handleMouseMove);
        _this.unsubscribeFunctions.push(unsubscribe);
        canvas.addEventListener('wheel', _this.handleScroll);
        unsubscribe = canvas.removeEventListener.bind(canvas, 'wheel', _this.handleScroll);
        _this.unsubscribeFunctions.push(unsubscribe);
        canvas.addEventListener('mousedown', _this.handleMouseDown);
        unsubscribe = canvas.removeEventListener.bind(canvas, 'mousedown', _this.handleMouseDown);
        _this.unsubscribeFunctions.push(unsubscribe);
        canvas.addEventListener('mousemove', _this.handlePointReporting);
        unsubscribe = canvas.removeEventListener.bind(canvas, 'mousemove', _this.handlePointReporting);
        _this.unsubscribeFunctions.push(unsubscribe);
        return _this;
    }
    MouseLayer.prototype.setTransformation = function (transformation, broadcast) {
        if (broadcast === void 0) { broadcast = false; }
        this.transformation = transformation;
        if (broadcast && this.transformationCallback != null) {
            this.transformationCallback(transformation);
        }
    };
    MouseLayer.prototype.setEnableMouseEvents = function (enable) {
        this.enableMouseEvents = enable;
    };
    MouseLayer.prototype.onTransformationChange = function (callback) {
        this.transformationCallback = callback;
    };
    MouseLayer.prototype.setImage = function (image) {
        this.image = image;
    };
    MouseLayer.prototype.onPointAt = function (callback) {
        this.pointCallback = callback;
    };
    MouseLayer.prototype.destruct = function () {
        this.unsubscribeFunctions.forEach(function (fn) { return fn(); });
    };
    MouseLayer.prototype.handleMouseMove = function (event) {
        if (!this.enableMouseEvents) {
            return;
        }
        if (this.panningState) {
            var _a = this.relativeMousePosition(event.clientX, event.clientY), x = _a.x, y = _a.y;
            var dx = x - this.panningState.previousMouse.x;
            var dy = y - this.panningState.previousMouse.y;
            var transformation = linalg_1.Matrix4x4.create();
            var aspect = this.getAspect();
            linalg_1.Matrix4x4.translate(transformation, transformation, [dx / aspect.x, dy / aspect.y, 0.0]);
            linalg_1.Matrix4x4.multiply(transformation, transformation, this.transformation);
            this.setTransformation(transformation, true);
            this.panningState.previousMouse = { x: x, y: y };
        }
    };
    MouseLayer.prototype.handleMouseUp = function (event) {
        if (this.panningState) {
            this.panningState = null;
        }
    };
    MouseLayer.prototype.handleMouseDown = function (event) {
        var mousePosition = this.relativeMousePosition(event.clientX, event.clientY);
        this.panningState = {
            transformationAtStart: linalg_1.Matrix4x4.clone(this.transformation),
            previousMouse: mousePosition,
        };
    };
    MouseLayer.prototype.handleScroll = function (event) {
        if (!this.enableMouseEvents) {
            return;
        }
        event.preventDefault();
        var pixelY = normalizeWheel(event).pixelY;
        var mouse = this.relativeMousePosition(event.clientX, event.clientY);
        var transformation = linalg_1.Matrix4x4.create();
        var deltaMatrix = linalg_1.Matrix4x4.create();
        var aspect = this.getAspect();
        linalg_1.Matrix4x4.translate(deltaMatrix, deltaMatrix, [mouse.x / aspect.x, mouse.y / aspect.y, 0.0]);
        var scaleFactor = Math.pow(SCROLL_FACTOR, pixelY);
        linalg_1.Matrix4x4.scale(deltaMatrix, deltaMatrix, [scaleFactor, scaleFactor, 1.0]);
        linalg_1.Matrix4x4.translate(deltaMatrix, deltaMatrix, [-mouse.x / aspect.x, -mouse.y / aspect.y, 0.0]);
        linalg_1.Matrix4x4.multiply(transformation, deltaMatrix, this.transformation);
        this.setTransformation(transformation, true);
    };
    /**
     * Event handler for reporting mouse movement.
     *
     * Only applicable when the options 'onPoint' property is set on this component.
     */
    MouseLayer.prototype.handlePointReporting = function (event) {
        if (this.pointCallback) {
            if (!this.panningState) {
                var _a = this.relativeMousePosition(event.clientX, event.clientY), x = _a.x, y = _a.y;
                var imageCoordinates = this.canvasToImage(x, y);
                this.pointCallback(imageCoordinates.x, imageCoordinates.y);
            }
        }
    };
    /**
     * Translate clientX and clientY values to relative positions within the bounding box
     * of the viewer.
     */
    MouseLayer.prototype.relativeMousePosition = function (clientX, clientY) {
        var _a = this.canvas, clientWidth = _a.clientWidth, clientHeight = _a.clientHeight;
        var _b = this.canvas.getBoundingClientRect(), left = _b.left, top = _b.top;
        return {
            x: -1.0 + 2.0 * (clientX - left) / clientWidth,
            y: 1.0 - 2.0 * (clientY - top) / clientHeight,
        };
    };
    /**
     * Translate canvas coordinates to image coodrinates
     */
    MouseLayer.prototype.canvasToImage = function (x, y) {
        var point = linalg_1.Vector4.create();
        linalg_1.Vector4.set(point, x, y, 1.0, 1.0);
        var inverseViewMatrix = linalg_1.Matrix4x4.create();
        var viewMatrix = this.getViewMatrix();
        linalg_1.Matrix4x4.invert(inverseViewMatrix, viewMatrix);
        linalg_1.Vector4.transformMat4(point, point, inverseViewMatrix);
        return { x: point.data[0], y: point.data[1] };
    };
    return MouseLayer;
}(Layer_1.default));
exports.default = MouseLayer;
//# sourceMappingURL=MouseLayer.js.map