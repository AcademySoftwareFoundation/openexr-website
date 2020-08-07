"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var React = require("react");
var linalg_1 = require("../utils/linalg");
var ImageLayer_1 = require("../layers/ImageLayer");
var TextLayer_1 = require("../layers/TextLayer");
var MouseLayer_1 = require("../layers/MouseLayer");
var styled_components_1 = require("styled-components");
var StretchingCanvas = styled_components_1.default.canvas(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"], ["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"])));
var StretchingDiv = styled_components_1.default.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"], ["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"])));
/**
 * An image frame that deals with mouse movement for padding and zooming
 */
var ImageFrame = /** @class */ (function (_super) {
    __extends(ImageFrame, _super);
    function ImageFrame(props) {
        var _this = _super.call(this, props) || this;
        _this.transformation = linalg_1.Matrix4x4.create();
        /** Where to go back when reset() is called */
        _this.defaultTransformation = linalg_1.Matrix4x4.create();
        _this.handleTransformationChange = _this.handleTransformationChange.bind(_this);
        return _this;
    }
    ImageFrame.prototype.componentDidMount = function () {
        this.imageLayer = new ImageLayer_1.default(this.imageLayerElement, this.props.image);
        this.textLayer = new TextLayer_1.default(this.textLayerElement, this.props.image);
        this.mouseLayer = new MouseLayer_1.default(this.mouseLayerElement, this.props.image, this.props.enableMouseEvents);
        this.mouseLayer.onTransformationChange(this.handleTransformationChange);
        this.updateCanvasProps();
        this.handleTransformationChange(this.transformation);
    };
    ImageFrame.prototype.componentDidUpdate = function (prevProps) {
        this.updateCanvasProps(prevProps);
        this.mouseLayer.setEnableMouseEvents(this.props.enableMouseEvents);
    };
    ImageFrame.prototype.componentWillUnmount = function () {
        this.mouseLayer.onPointAt(undefined);
        this.mouseLayer.onTransformationChange(undefined);
        this.mouseLayer.destruct();
    };
    /** Set the default transformation that calling reset() will result in */
    ImageFrame.prototype.setDefaultTransformation = function (transformation) {
        this.defaultTransformation = transformation;
    };
    ImageFrame.prototype.reset = function () {
        this.handleTransformationChange(this.defaultTransformation);
    };
    ImageFrame.prototype.setTransformation = function (transformation) {
        this.handleTransformationChange(transformation);
    };
    ImageFrame.prototype.getTransformation = function () {
        return this.transformation;
    };
    ImageFrame.prototype.render = function () {
        var _this = this;
        return (React.createElement(StretchingDiv, null,
            React.createElement(StretchingCanvas, { ref: function (x) { if (x) {
                    _this.imageLayerElement = x;
                } } }),
            React.createElement(StretchingCanvas, { ref: function (x) { if (x) {
                    _this.textLayerElement = x;
                } } }),
            React.createElement(StretchingCanvas, { ref: function (x) { if (x) {
                    _this.mouseLayerElement = x;
                } } })));
    };
    ImageFrame.prototype.handleTransformationChange = function (transformation) {
        if (this.props.allowMovement) {
            this.transformation = transformation;
            this.imageLayer.setTransformation(transformation);
            this.textLayer.setTransformation(transformation);
            this.mouseLayer.setTransformation(transformation);
            if (this.props.onTransform != null) {
                this.props.onTransform(transformation);
            }
        }
    };
    ImageFrame.prototype.updateCanvasProps = function (previousProps) {
        if (previousProps === void 0) { previousProps = null; }
        if (!previousProps ||
            previousProps.viewTransform !== this.props.viewTransform ||
            previousProps.exposure !== this.props.exposure ||
            previousProps.gamma !== this.props.gamma ||
            previousProps.offset !== this.props.offset) {
            this.imageLayer.setTonemapping({
                viewTransform: this.props.viewTransform,
                exposure: this.props.exposure,
                offset: this.props.offset,
                gamma: this.props.gamma
            });
        }
        if (!previousProps || previousProps.image !== this.props.image) {
            this.imageLayer.setImage(this.props.image);
            this.textLayer.setImage(this.props.image);
            this.mouseLayer.setImage(this.props.image);
        }
        this.mouseLayer.onPointAt(this.props.onPoint);
    };
    return ImageFrame;
}(React.Component));
exports.default = ImageFrame;
var templateObject_1, templateObject_2;
//# sourceMappingURL=ImageFrame.js.map