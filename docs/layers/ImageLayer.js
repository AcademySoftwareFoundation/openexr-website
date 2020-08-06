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
var cached_function_1 = require("../utils/cached-function");
var Layer_1 = require("./Layer");
var DrawMode;
(function (DrawMode) {
    DrawMode[DrawMode["LDR"] = 0] = "LDR";
    DrawMode[DrawMode["HDR"] = 1] = "HDR";
    DrawMode[DrawMode["ColorMap"] = 2] = "ColorMap";
})(DrawMode || (DrawMode = {}));
var ViewTransform;
(function (ViewTransform) {
    ViewTransform[ViewTransform["None"] = -1] = "None";
    ViewTransform[ViewTransform["Gamma22"] = 0] = "Gamma22";
    ViewTransform[ViewTransform["K1S1"] = 1] = "K1S1";
})(ViewTransform || (ViewTransform = {}));
var vertexShaderSource = "\nattribute vec3 aVertexPosition;\nattribute vec2 aTextureCoord;\nvarying vec2 vTextureCoord;\nuniform mat4 viewMatrix;\nvoid main(void) {\n    gl_Position = viewMatrix * vec4(aVertexPosition, 1.0);\n    vTextureCoord = aTextureCoord;\n}";
var fragmentShaderSource = "\nprecision mediump float;\nuniform int viewTransform;\nuniform float exposure;\nuniform float offset;\nuniform float gamma;\nuniform int mode;\nuniform int nChannels;\nuniform int lossFunction;\nuniform int imageHeight; // Height and width are used to access neighboring pixels\nuniform int imageWidth;\nvarying vec2 vTextureCoord;\nuniform sampler2D imASampler;\nuniform sampler2D imBSampler;\nuniform sampler2D cmapSampler;\n\nvec3 lookupOffset(sampler2D sampler, vec2 position, vec2 offset) {\n    // Read neighbouring pixels from an image texture\n    // Takes 'position' (range 0 - 1) and an integer pixel offset 'offset'\n    vec2 imageSize = vec2(imageWidth, imageHeight);\n    return texture2D(sampler, position + offset / imageSize).rgb;\n}\n\nfloat log10(float a) {\n  const float logBase10 = 1.0 / log2( 10.0 );\n\n  return log2(a) * logBase10;\n}\n\nfloat luminance(vec3 rgb) {\n  return dot(vec3(0.2126, 0.7152, 0.0722), rgb);\n}\n\nvec3 GOG(vec3 rgb, float gain, float offset, float gamma) {\n  return pow(gain * rgb + offset, vec3(1.0 / gamma));\n}\n\nfloat logEncodingLogC(float a) {\n  float LogC = a >= 0.01059106816664 ? 0.385537 + 0.2471896 * log10(a * 5.555556 + 0.052272) : a * 5.367655 + 0.092809;\n\n  return LogC;\n}\n\nfloat sigmoidK1S1(float a) {\n  float sigmoid = 1.0 / (1.0 + pow(2.718281828459045, -8.9 * (a - 0.435)));\n\n  return sigmoid;\n}\n\nvec3 viewTransformNone(vec3 rgb) {\n  return rgb;\n}\n\nvec3 viewTransformGamma22(vec3 rgb) {\n  const float exponent = 1.0 / 2.2;\n\n  return pow(max(rgb, 0.0), vec3(exponent, exponent, exponent));\n}\n\nvec3 viewTransformK1S1(vec3 rgb) {\n  vec3 LogC = vec3(logEncodingLogC(rgb.x), logEncodingLogC(rgb.y), logEncodingLogC(rgb.z));\n\n  return vec3(sigmoidK1S1(LogC.x), sigmoidK1S1(LogC.y), sigmoidK1S1(LogC.z));\n}\n\nvec3 applyViewTransform(vec3 rgb, int which) {\n  if (which == " + ViewTransform.None + ") {\n    return viewTransformNone(rgb);\n  } else if (which == " + ViewTransform.Gamma22 + ") {\n    return viewTransformGamma22(rgb);\n  } else if (which == " + ViewTransform.K1S1 + ") {\n    return viewTransformK1S1(rgb);\n  }\n}\n\nvoid main(void) {\n    vec3 col;\n    vec2 position = vec2(vTextureCoord.s, vTextureCoord.t);\n    if (lossFunction == " + Layer_1.LossFunction.L1 + ") {\n        col = texture2D(imASampler, position).rgb;\n        col = col - texture2D(imBSampler, position).rgb;\n        col = abs(col);\n    } else if (lossFunction == " + Layer_1.LossFunction.MAPE + ") {\n        vec3 img = texture2D(imASampler, position).rgb;\n        vec3 ref = texture2D(imBSampler, position).rgb;\n        vec3 diff = img - ref;\n        col = abs(diff) / (abs(ref) + 1e-2);\n    } else if (lossFunction == " + Layer_1.LossFunction.SMAPE + ") {\n        vec3 img = texture2D(imASampler, position).rgb;\n        vec3 ref = texture2D(imBSampler, position).rgb;\n        vec3 diff = img - ref;\n        col = 2.0 * abs(diff) / (abs(ref) + abs(img) + 2e-2);\n    } else if (lossFunction == " + Layer_1.LossFunction.MRSE + ") {\n        vec3 img = texture2D(imASampler, position).rgb;\n        vec3 ref = texture2D(imBSampler, position).rgb;\n        vec3 diff = img - ref;\n        col = diff * diff / (ref * ref + 1e-4);\n    } else if (lossFunction == " + Layer_1.LossFunction.L2 + ") {\n        vec3 img = texture2D(imASampler, position).rgb;\n        vec3 ref = texture2D(imBSampler, position).rgb;\n        vec3 diff = img - ref;\n        col = diff * diff;\n    } else if (lossFunction == " + Layer_1.LossFunction.SSIM + ") {\n        const int windowRadius = 2; // We use a symmetric 5x5 window as opposed to the customary 8x8 (wiki)\n        const float L = 1.; // The dynamic range\n        const float k1 = 0.01, k2 = 0.03; // Default constants\n        const float c1 = (k1*L)*(k1*L), c2 = (k2*L)*(k2*L);\n        const float n = float((2 * windowRadius + 1) * (2 * windowRadius + 1));\n\n        // Compute means and standard deviations of both images\n        float aSum, aaSum, bSum, bbSum, abSum;\n        for (int x = 0; x <= 2 * windowRadius; ++x) {\n            for (int y = 0; y <= 2 * windowRadius; ++y) {\n                vec2 offset = vec2(float(x - windowRadius), float(y - windowRadius));\n                float a = luminance(applyViewTransform(lookupOffset(imASampler, position, offset), viewTransform));\n                float b = luminance(applyViewTransform(lookupOffset(imBSampler, position, offset), viewTransform));\n                aSum += a; bSum += b;\n                aaSum += a * a; bbSum += b * b;\n                abSum += a * b;\n            }\n        }\n        float aMean = aSum / n, bMean = bSum / n;\n        float aVar = (aaSum - n * aMean * aMean) / (n + 1.);\n        float bVar = (bbSum - n * bMean * bMean) / (n + 1.);\n        float abCovar = (abSum - n * aMean * bMean) / (n + 1.);\n\n        float numerator = (2. * aMean * bMean + c1) * (2. * abCovar + c2);\n        float denominator = (aMean * aMean + bMean * bMean + c1) * (aVar + bVar + c2);\n        float ssim = numerator / denominator;\n        col = vec3(1. - ssim, 1. - ssim, 1. - ssim);\n    } else {\n        col = texture2D(imASampler, position).rgb;\n        if (nChannels == 1) {\n            col = vec3(col.r, col.r, col.r);\n        }\n    }\n\n    if (mode == " + DrawMode.LDR + ") {\n        col = pow(col, vec3(2.2));\n        col = GOG(col, exposure, offset, gamma);\n        col = applyViewTransform(col, viewTransform);\n    } else if (mode == " + DrawMode.HDR + ") {\n        col = GOG(col, exposure, offset, gamma);\n        col = applyViewTransform(col, viewTransform);\n    } else {\n        float avg = (col.r + col.g + col.b) * 0.3333333333 * exposure;\n        col = texture2D(cmapSampler, vec2(avg, 0.0)).rgb;\n    }\n\n    gl_FragColor = vec4(col, 1.0);\n}";
var imageVertices = new Float32Array([
    // X   Y     Z      U    V
    -1.0, -1.0, 0.0, 0.0, 1.0,
    -1.0, 1.0, 0.0, 0.0, 0.0,
    1.0, -1.0, 0.0, 1.0, 1.0,
    1.0, 1.0, 0.0, 1.0, 0.0,
]);
var colorMapTexels = new Uint8Array([
    0, 0, 3, 255,
    23, 15, 60, 255,
    67, 15, 117, 255,
    113, 31, 129, 255,
    158, 46, 126, 255,
    205, 63, 112, 255,
    240, 96, 93, 255,
    253, 149, 103, 255,
    254, 201, 141, 255,
    251, 252, 191, 255,
]);
function compileShader(code, type, gl) {
    var shader = gl.createShader(type);
    if (!shader) {
        throw new Error("Creating shader failed with error.");
    }
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error("Compiling shader failed with error '" + gl.getShaderInfoLog(shader) + "'.");
    }
    return shader;
}
var defaultTonemapping = { viewTransform: 0.0, exposure: 1.0, gamma: 1.0, offset: 0.0 };
/**
 * Image Layer
 */
var ImageLayer = /** @class */ (function (_super) {
    __extends(ImageLayer, _super);
    function ImageLayer(canvas, image) {
        var _this = _super.call(this, canvas, image) || this;
        _this.tonemappingSettings = defaultTonemapping;
        _this.needsRerender = true;
        // Make sure 'this' is available even when these methods are passed as a callback
        _this.checkRender = _this.checkRender.bind(_this);
        _this.invalidate = _this.invalidate.bind(_this);
        _this.initWebGl(canvas);
        // Create a texture cache and load the image texture
        _this.getTexture = cached_function_1.default(_this.createTexture.bind(_this));
        // Draw for the first time
        _this.needsRerender = true;
        requestAnimationFrame(_this.checkRender);
        return _this;
    }
    ImageLayer.prototype.setTransformation = function (transformation) {
        this.transformation = transformation;
        this.invalidate();
    };
    ImageLayer.prototype.setTonemapping = function (tonemapping) {
        this.tonemappingSettings = tonemapping;
        this.invalidate();
    };
    ImageLayer.prototype.setImage = function (image) {
        this.image = image;
        this.invalidate();
    };
    /**
     * Force a new draw the next frame
     */
    ImageLayer.prototype.invalidate = function () {
        this.needsRerender = true;
    };
    /**
     * Render loop, will draw when this component is invalidated with
     * this.needsRerender = true;
     * or when the size of the container changed
     */
    ImageLayer.prototype.checkRender = function () {
        if (this.resize() || this.needsRerender) {
            this.needsRerender = false;
            this.draw();
        }
        requestAnimationFrame(this.checkRender);
    };
    /**
     * Paint a new image
     */
    ImageLayer.prototype.draw = function () {
        if (!this.cmapTexture) {
            throw new Error('Textures need to be initialized before calling draw()');
        }
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.uniform1i(this.glUniforms.viewTransform, this.tonemappingSettings.viewTransform);
        this.gl.uniform1f(this.glUniforms.exposure, this.tonemappingSettings.exposure);
        this.gl.uniform1f(this.glUniforms.offset, this.tonemappingSettings.offset);
        this.gl.uniform1f(this.glUniforms.gamma, this.tonemappingSettings.gamma);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // tslint:disable-line
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVertexBuffer);
        this.gl.vertexAttribPointer(this.glAttributes.vertexPosition, 3, this.gl.FLOAT, false, 5 * imageVertices.BYTES_PER_ELEMENT, 0);
        this.gl.vertexAttribPointer(this.glAttributes.vertexTextureCoordinate, 2, this.gl.FLOAT, false, 5 * imageVertices.BYTES_PER_ELEMENT, // stride
        3 * imageVertices.BYTES_PER_ELEMENT // offset
        );
        this.gl.uniform1i(this.glUniforms.imageHeight, this.image.height);
        this.gl.uniform1i(this.glUniforms.imageWidth, this.image.width);
        if (this.image.type === 'Difference') {
            this.gl.uniform1i(this.glUniforms.drawMode, DrawMode.ColorMap);
            this.gl.uniform1i(this.glUniforms.lossFunction, this.image.lossFunction);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture(this.image.imageA));
            this.gl.uniform1i(this.glUniforms.imASampler, 0);
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture(this.image.imageB));
            this.gl.uniform1i(this.glUniforms.imBSampler, 1);
        }
        else {
            if (this.image.nChannels === 1) {
                this.gl.uniform1i(this.glUniforms.drawMode, DrawMode.ColorMap);
            }
            else if (this.image.type === 'HdrImage') {
                this.gl.uniform1i(this.glUniforms.drawMode, DrawMode.HDR);
            }
            else {
                this.gl.uniform1i(this.glUniforms.drawMode, DrawMode.LDR);
            }
            this.gl.uniform1i(this.glUniforms.lossFunction, 0);
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture(this.image));
            this.gl.uniform1i(this.glUniforms.imASampler, 0);
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.getTexture(this.image));
            this.gl.uniform1i(this.glUniforms.imBSampler, 1);
        }
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.cmapTexture);
        this.gl.uniform1i(this.glUniforms.cmapSampler, 2);
        this.gl.uniform1i(this.glUniforms.nChannels, this.image.nChannels);
        var viewMatrix = this.getViewMatrix();
        this.gl.uniformMatrix4fv(this.glUniforms.viewMatrix, false, viewMatrix.data);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    };
    ImageLayer.prototype.initWebGl = function (canvas) {
        this.gl = canvas.getContext('webgl');
        if (!this.gl) {
            throw new Error('Please upgrade your browser to one that supports WebGL.');
        }
        if (!this.gl.getExtension('OES_texture_float')) {
            throw new Error('Your browser does not supports WebGL FLoating Point Textures.');
        }
        this.gl.clearColor(0.25, 0.25, 0.25, 1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        var program = this.initShaders();
        this.quadVertexBuffer = this.initQuadVertexBuffer();
        this.glAttributes = this.initAttributes(program);
        this.glUniforms = this.initUniforms(program);
        this.cmapTexture = this.initCmapTexture();
    };
    ImageLayer.prototype.initShaders = function () {
        var vertexShader = compileShader(vertexShaderSource, this.gl.VERTEX_SHADER, this.gl);
        var fragmentShader = compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER, this.gl);
        var program = this.gl.createProgram();
        if (vertexShader && fragmentShader && program) {
            this.gl.attachShader(program, vertexShader);
            this.gl.attachShader(program, fragmentShader);
            this.gl.linkProgram(program);
        }
        if (!program || !this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            throw new Error('Failed to link the program.');
        }
        this.gl.useProgram(program);
        return program;
    };
    ImageLayer.prototype.initCmapTexture = function () {
        var cmapTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, cmapTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, colorMapTexels.length / 4, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, colorMapTexels);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        if (!cmapTexture) {
            throw new Error('Failed to initialize color map texture.');
        }
        return cmapTexture;
    };
    ImageLayer.prototype.initQuadVertexBuffer = function () {
        var buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, imageVertices, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        if (!buffer) {
            throw new Error('Failed to initialize quad vertex buffer.');
        }
        return buffer;
    };
    ImageLayer.prototype.initAttributes = function (program) {
        var attributes = {
            vertexPosition: this.gl.getAttribLocation(program, 'aVertexPosition'),
            vertexTextureCoordinate: this.gl.getAttribLocation(program, 'aTextureCoord'),
        };
        this.gl.enableVertexAttribArray(attributes.vertexPosition);
        this.gl.enableVertexAttribArray(attributes.vertexTextureCoordinate);
        return attributes;
    };
    ImageLayer.prototype.initUniforms = function (program) {
        var _this = this;
        var getUniformLocation = function (name) {
            var location = _this.gl.getUniformLocation(program, name);
            if (!location) {
                throw new Error("Failed to get uniform location for '" + name + "'.");
            }
            return location;
        };
        return {
            drawMode: getUniformLocation('mode'),
            lossFunction: getUniformLocation('lossFunction'),
            nChannels: getUniformLocation('nChannels'),
            viewMatrix: getUniformLocation('viewMatrix'),
            imASampler: getUniformLocation('imASampler'),
            imBSampler: getUniformLocation('imBSampler'),
            cmapSampler: getUniformLocation('cmapSampler'),
            viewTransform: getUniformLocation('viewTransform'),
            exposure: getUniformLocation('exposure'),
            offset: getUniformLocation('offset'),
            gamma: getUniformLocation('gamma'),
            imageWidth: getUniformLocation('imageWidth'),
            imageHeight: getUniformLocation('imageHeight'),
        };
    };
    ImageLayer.prototype.createTexture = function (image) {
        var texture = this.gl.createTexture();
        if (!texture) {
            throw new Error('Failed to initialize image texture');
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        if (image.type === 'HdrImage') {
            if (image.nChannels === 1) {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, image.width, image.height, 0, this.gl.LUMINANCE, this.gl.FLOAT, image.data);
            }
            else if (image.nChannels === 3) {
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, image.width, image.height, 0, this.gl.RGB, this.gl.FLOAT, image.data);
            }
            else {
                throw new Error("Don't know what to do with " + image.nChannels + " image channels.");
            }
        }
        else {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image.data);
        }
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return texture;
    };
    return ImageLayer;
}(Layer_1.default));
exports.default = ImageLayer;
//# sourceMappingURL=ImageLayer.js.map