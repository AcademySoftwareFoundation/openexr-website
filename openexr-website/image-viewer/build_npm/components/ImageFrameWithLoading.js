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
var styled_components_1 = require("styled-components");
var ImageFrame_1 = require("./ImageFrame");
var image_loading_1 = require("../utils/image-loading");
var StretchingDiv = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"], ["\n  position: absolute;\n  top: 0; bottom: 0;\n  left: 0; right: 0;\n  width: 100%; height: 100%;\n"])));
var LoadingOverlay = styled_components_1.default.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  display: block;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  text-align: left;\n  padding: .6em;\n  background-color: rgb(64, 64, 64);\n"], ["\n  display: block;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  text-align: left;\n  padding: .6em;\n  background-color: rgb(64, 64, 64);\n"])));
/**
 * A wrapper around ImageFrame that deals with the loading of images
 * It takes an `ImageSpec` instead of an `InputImage`.
 */
var ImageFrameWithLoading = /** @class */ (function (_super) {
    __extends(ImageFrameWithLoading, _super);
    function ImageFrameWithLoading(props) {
        var _this = _super.call(this, props) || this;
        _this.cache = new image_loading_1.ImageCache();
        _this.requestId = 0;
        // Counter to ensure that returning downloads are still relevant to the current app state.
        _this.currentRequest = 0;
        _this.state = {
            isLoading: false,
            errorMsg: null,
            image: null,
        };
        _this.handleImageChange(props, false);
        return _this;
    }
    ImageFrameWithLoading.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.imageSpec !== this.props.imageSpec) { // Assumes imageSpec to be immutable
            this.handleImageChange(nextProps);
        }
    };
    ImageFrameWithLoading.prototype.componentWillUnmount = function () {
        // Don't handle any returning downloads anymore after unmount.
        this.requestId = -1;
    };
    ImageFrameWithLoading.prototype.render = function () {
        var _this = this;
        return (React.createElement(StretchingDiv, null,
            this.state.image != null ?
                React.createElement(ImageFrame_1.default, { viewTransform: this.props.viewTransform, exposure: this.props.exposure, gamma: this.props.gamma, offset: this.props.offset, image: this.state.image, ref: function (frame) { return _this.imageFrame = frame; }, allowMovement: this.props.allowMovement, enableMouseEvents: this.props.enableMouseEvents })
                : null,
            this.state.isLoading ? React.createElement(LoadingOverlay, null, "Downloading ...") : null,
            this.state.errorMsg ? React.createElement(LoadingOverlay, null, this.state.errorMsg) : null));
    };
    /**
     * Initiate the download of the current spec.
     * Sets the state in case of correct or incorrect loads.
     */
    ImageFrameWithLoading.prototype.handleImageChange = function (props, shouldSetLoadingState) {
        var _this = this;
        if (shouldSetLoadingState === void 0) { shouldSetLoadingState = true; }
        this.currentRequest++;
        var handledRequest = this.currentRequest;
        if (shouldSetLoadingState) {
            this.setState({
                isLoading: true,
                errorMsg: null,
            });
        }
        this.downloadImage(props.imageSpec)
            .then(function (image) {
            if (handledRequest !== _this.currentRequest) {
                // This download does not correspond to the latest request, so should not be shown.
                return;
            }
            _this.setState({
                errorMsg: null,
                isLoading: false,
                image: image,
            });
        })
            .catch(function (error) {
            if (handledRequest !== _this.requestId) {
                // This download does not correspond to the latest request, so should not be shown.
                return;
            }
            _this.setState({
                errorMsg: error.message,
                isLoading: false,
            });
        });
    };
    /**
     * Download an image
     * @param image specification of the image to download (url or difference of two images)
     * @return Promise of a loaded image
     */
    ImageFrameWithLoading.prototype.downloadImage = function (spec) {
        var _this = this;
        if (spec.type === 'Url') {
            return this.cache.get(spec.url);
        }
        else if (spec.type === 'Difference') {
            return Promise.all([spec.urlA, spec.urlB].map(function (url) { return _this.cache.get(url); }))
                .then(function (_a) {
                var imageA = _a[0], imageB = _a[1];
                // Make sure images have the same size and number of channels;
                var height = imageA.height;
                var width = imageA.width;
                var nChannels = imageA.nChannels;
                if (height !== imageB.height) {
                    throw Error(spec.urlA + " & " + spec.urlB + " with heights " + height + " & " + imageB.height + " cannot be compared.");
                }
                if (width !== imageB.width) {
                    throw Error(spec.urlA + " & " + spec.urlB + " with widths " + width + " & " + imageB.width + " cannot be compared.");
                }
                if (nChannels !== imageB.nChannels) {
                    throw Error(spec.urlA + " & " + spec.urlB + " with unequal nChannels " + nChannels + " & " + imageB.nChannels + ".");
                }
                return {
                    type: spec.type,
                    imageA: imageA,
                    imageB: imageB,
                    width: width,
                    height: height,
                    nChannels: nChannels,
                    lossFunction: spec.lossFunction,
                };
            });
        }
        else {
            throw Error("Unkonwn imageSpec type for " + spec + ".");
        }
    };
    return ImageFrameWithLoading;
}(React.Component));
exports.default = ImageFrameWithLoading;
var templateObject_1, templateObject_2;
//# sourceMappingURL=ImageFrameWithLoading.js.map