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
var image_loading_1 = require("../utils/image-loading");
var TextLayer = /** @class */ (function (_super) {
    __extends(TextLayer, _super);
    function TextLayer(canvas, image) {
        var _this = _super.call(this, canvas, image) || this;
        _this.needsRerender = true;
        // Create canvas 2d drawing context
        var context = canvas.getContext('2d');
        if (context == null) {
            throw new Error('Failed to create 2D context for TextOverlay');
        }
        _this.context = context;
        // Make sure 'this' is available even when these methods are passed as callbacks
        _this.checkRender = _this.checkRender.bind(_this);
        _this.invalidate = _this.invalidate.bind(_this);
        // Draw for the first time
        _this.needsRerender = true;
        requestAnimationFrame(_this.checkRender);
        return _this;
    }
    TextLayer.prototype.setTransformation = function (transformation) {
        this.transformation = transformation;
        this.invalidate();
    };
    TextLayer.prototype.setImage = function (image) {
        this.image = image;
        this.invalidate();
    };
    /**
     * Force a new draw
     */
    TextLayer.prototype.invalidate = function () {
        this.needsRerender = true;
    };
    /**
     * Render loop, will draw when this component is invalidated with
     * this.needsRerender = true;
     * or when the size of the container changed
     */
    TextLayer.prototype.checkRender = function () {
        if (this.resize() || this.needsRerender) {
            this.needsRerender = false;
            this.draw();
        }
        requestAnimationFrame(this.checkRender);
    };
    /**
     * Paint a new overlay
     */
    TextLayer.prototype.draw = function () {
        var canvas = this.context.canvas;
        var leftTop = linalg_1.Vector4.fromValues(-1, 1, 0.0, 1.0);
        var rightBottom = linalg_1.Vector4.fromValues(1, -1, 0.0, 1.0);
        var mvMatrix = this.getViewMatrix();
        var invMvMatrix = linalg_1.Matrix4x4.create();
        linalg_1.Matrix4x4.invert(invMvMatrix, mvMatrix);
        var image = this.image;
        linalg_1.Vector4.transformMat4(leftTop, leftTop, invMvMatrix);
        linalg_1.Vector4.transformMat4(rightBottom, rightBottom, invMvMatrix);
        this.convertClipToRaster(leftTop, leftTop, image.width, image.height);
        this.convertClipToRaster(rightBottom, rightBottom, image.width, image.height);
        var px = Math.floor(leftTop.data[0]);
        var py = Math.floor(leftTop.data[1]);
        var qx = Math.floor(rightBottom.data[0]);
        var qy = Math.floor(rightBottom.data[1]);
        var lineHeight = Math.floor(20 * window.devicePixelRatio);
        var fontSize = Math.floor(16 * window.devicePixelRatio);
        var nx = canvas.width / (lineHeight * 3 + 2);
        var ny = canvas.height / (lineHeight * 3 + 2);
        this.context.clearRect(0, 0, canvas.width, canvas.height);
        if (image.type === 'Difference') {
            // We don't have access to computed values, so won't show the HUD
            return;
        }
        var zoomedInEnough = rightBottom.data[0] - leftTop.data[0] < nx && rightBottom.data[1] - leftTop.data[1] < ny;
        if (zoomedInEnough) {
            this.context.font = fontSize + "px sans-serif";
            for (var y = Math.max(0, py); y <= Math.min(image.height - 1, qy); y++) {
                for (var x = Math.max(0, px); x <= Math.min(image.width - 1, qx); x++) {
                    linalg_1.Vector4.set(leftTop, x, y, 0.0, 1.0);
                    this.convertRasterToClip(leftTop, leftTop, image.width, image.height);
                    linalg_1.Vector4.transformMat4(leftTop, leftTop, mvMatrix);
                    this.convertClipToRaster(leftTop, leftTop, canvas.width, canvas.height);
                    var r = void 0, g = void 0, b = void 0;
                    if (image.nChannels === 1) {
                        r = image_loading_1.getPixelColor(image, x, y, 0);
                        this.context.fillStyle = '#888888';
                        this.context.fillText(r.toFixed(4), leftTop.data[0], leftTop.data[1] + fontSize);
                    }
                    else {
                        r = image_loading_1.getPixelColor(image, x, y, 0);
                        g = image_loading_1.getPixelColor(image, x, y, 1);
                        b = image_loading_1.getPixelColor(image, x, y, 2);
                        this.context.fillStyle = '#990000';
                        this.context.fillText(r.toFixed(4), leftTop.data[0], leftTop.data[1] + fontSize);
                        this.context.fillStyle = '#009900';
                        this.context.fillText(g.toFixed(4), leftTop.data[0], leftTop.data[1] + fontSize + lineHeight);
                        this.context.fillStyle = '#0000FF';
                        this.context.fillText(b.toFixed(4), leftTop.data[0], leftTop.data[1] + fontSize + 2 * lineHeight);
                    }
                }
            }
        }
    };
    /**
     * Convert coordinates from clip space to raster space
     * @param out coordinates in raster space (0, xres) x (0, yres)
     * @param a coordinates in clip space (-1,1) x (-1,1)
     * @param xres
     * @param yres
     */
    TextLayer.prototype.convertClipToRaster = function (out, a, xres, yres) {
        out.data[0] = (a.data[0] + 1.0) * 0.5 * xres;
        out.data[1] = (1.0 - a.data[1]) * 0.5 * yres;
        return out;
    };
    /**
     * Convert coordinates from raster space to clip space
     * @param out coordinates in raster space (0, xres) x (0, yres)
     * @param a coordinates in clip space (-1,1) x (-1,1)
     * @param xres
     * @param yres
     */
    TextLayer.prototype.convertRasterToClip = function (out, a, xres, yres) {
        out.data[0] = a.data[0] * 2.0 / xres - 1.0;
        out.data[1] = 1.0 - (a.data[1] * 2.0 / yres);
        return out;
    };
    return TextLayer;
}(Layer_1.default));
exports.default = TextLayer;
//# sourceMappingURL=TextLayer.js.map