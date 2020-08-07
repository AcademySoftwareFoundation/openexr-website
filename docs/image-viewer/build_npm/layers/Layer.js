"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var linalg_1 = require("../utils/linalg");
var Layer = /** @class */ (function () {
    function Layer(canvas, image) {
        this.canvas = canvas;
        this.image = image;
        this.transformation = linalg_1.Matrix4x4.create();
        this.aspectMatrixBuffer = linalg_1.Matrix4x4.create(); // To prevent memory allocation in the render loop
        this.viewMatrixBuffer = linalg_1.Matrix4x4.create(); // To prevent memory allocation in the render loop
        this.image = image;
        this.resize();
    }
    /**
     * Resize the canvas size if its elements size in the browser changed
     * @return whether anything changed
     */
    Layer.prototype.resize = function () {
        var width = Math.floor(this.canvas.clientWidth * window.devicePixelRatio);
        var height = Math.floor(this.canvas.clientHeight * window.devicePixelRatio);
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            return true;
        }
        return false;
    };
    /**
     * Compute the scalings in X and Y make sure the (-1,1) x (-1,1) box has the aspect ratio of the image
     * and is positioned centerally in the canvas
     */
    Layer.prototype.getAspect = function () {
        var viewAspect = this.canvas.clientWidth / this.canvas.clientHeight;
        var textAspect = this.image.width / this.image.height;
        var aspect;
        if (viewAspect > textAspect) {
            aspect = { x: textAspect / viewAspect, y: 1.0 };
        }
        else {
            aspect = { x: 1.0, y: viewAspect / textAspect };
        }
        return aspect;
    };
    /**
     * Compute the view matrix from the current transformation and the shape of the window
     */
    Layer.prototype.getViewMatrix = function () {
        var aspect = this.getAspect();
        linalg_1.Matrix4x4.fromScaling(this.aspectMatrixBuffer, [aspect.x, aspect.y, 1.0]);
        linalg_1.Matrix4x4.multiply(this.viewMatrixBuffer, this.aspectMatrixBuffer, this.transformation);
        return this.viewMatrixBuffer;
    };
    return Layer;
}());
exports.default = Layer;
var LossFunction;
(function (LossFunction) {
    LossFunction[LossFunction["L1"] = 1] = "L1";
    LossFunction[LossFunction["L2"] = 2] = "L2";
    LossFunction[LossFunction["MAPE"] = 3] = "MAPE";
    LossFunction[LossFunction["MRSE"] = 4] = "MRSE";
    LossFunction[LossFunction["SMAPE"] = 5] = "SMAPE";
    LossFunction[LossFunction["SSIM"] = 6] = "SSIM";
})(LossFunction = exports.LossFunction || (exports.LossFunction = {}));
var lossFunctions = {
    'L1': LossFunction.L1,
    'L2': LossFunction.L2,
    'MAPE': LossFunction.MAPE,
    'MRSE': LossFunction.MRSE,
    'SMAPE': LossFunction.SMAPE,
    'SSIM': LossFunction.SSIM,
};
function lossFunctionFromString(name) {
    if (lossFunctions.hasOwnProperty(name)) {
        return lossFunctions[name];
    }
    else {
        throw Error("Loss function " + name + " is invalid. Available options: " + Object.keys(lossFunctions));
    }
}
exports.lossFunctionFromString = lossFunctionFromString;
//# sourceMappingURL=Layer.js.map