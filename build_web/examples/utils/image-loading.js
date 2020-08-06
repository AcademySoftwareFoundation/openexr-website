"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var ExrParserWorker = require("worker-loader?name=exr.worker.js!./exr-parser.worker.js");
/**
 * A pool of exr parsing webworkers that get assigned tasks in a round-robin fashion.
 */
var ExrParserPool = /** @class */ (function () {
    function ExrParserPool(nWorkers) {
        this.nWorkers = nWorkers;
        /** To divide the work equally, keep track of the worker that got the previous job. */
        this.nextWorkerId = 0;
        /** Each job that is sent to a worker gets a unique jobId. */
        this.jobId = 0;
        /** After sending a job to a web worker, we register a return handler for when data comes back  */
        this.returnHandlers = {};
        this.workers = [];
        for (var i = 0; i < nWorkers; ++i) {
            var worker = new ExrParserWorker();
            this.workers.push(worker);
            worker.onmessage = this.handleResult.bind(this);
        }
    }
    /**
     * Parse raw EXR data using by assigning the task to a web worker in the pool
     */
    ExrParserPool.prototype.parse = function (url, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var worker = _this.nextWorker();
            var jobId = _this.jobId++;
            _this.returnHandlers[jobId] = function (event) {
                if (event.data.success) {
                    resolve(__assign({ url: url }, event.data.image));
                }
                else {
                    reject(new Error(event.data.message));
                }
            };
            worker.postMessage({ jobId: jobId, data: data }, [data]);
        });
    };
    /**
     * Handler that gets called whenever a result comes back from the webworkers
     * It looks up the corresponding handler by the jobId.
     */
    ExrParserPool.prototype.handleResult = function (event) {
        if (event.data.jobId != null) {
            var callback = this.returnHandlers[event.data.jobId];
            delete this.returnHandlers[event.data.jobId];
            callback(event);
        }
        else {
            throw new Error("Got a message from the webworker without job id.");
        }
    };
    /**
     * Get the web worker whose turn it is
     */
    ExrParserPool.prototype.nextWorker = function () {
        var worker = this.workers[this.nextWorkerId];
        this.nextWorkerId = (this.nextWorkerId + 1) % this.nWorkers;
        return worker;
    };
    return ExrParserPool;
}());
var pool = new ExrParserPool(2);
function parseExr(url, data) {
    return pool.parse(url, data);
}
function loadImage(url) {
    var suffix = url.split('.').pop();
    if (suffix && suffix.toLocaleLowerCase() === 'exr') {
        return loadExr(url);
    }
    else {
        return loadLdr(url);
    }
}
exports.loadImage = loadImage;
function loadExr(url) {
    console.time("Downloading '" + url + "'"); // tslint:disable-line
    return fetch(url)
        .then(function (result) {
        console.timeEnd("Downloading '" + url + "'"); // tslint:disable-line
        return result;
    })
        .then(function (result) { return result.arrayBuffer(); })
        .then(function (data) { return parseExr(url, data); });
}
exports.loadExr = loadExr;
function loadLdr(url) {
    console.time("Downloading '" + url + "'"); // tslint:disable-line
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.onerror = function (error) { return reject(new Error("Failed to load '" + url + "'.")); };
        image.onload = function () {
            console.timeEnd("Downloading '" + url + "'"); // tslint:disable-line
            try {
                var canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                var ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get 2d canvas context.'));
                    return;
                }
                ctx.drawImage(image, 0, 0);
                resolve({
                    url: url,
                    width: image.width,
                    height: image.height,
                    nChannels: 4,
                    data: image,
                    type: 'LdrImage',
                });
            }
            catch (error) {
                reject(new Error("Failed to load image '" + url + "': " + error));
            }
        };
        image.src = url;
    });
}
exports.loadLdr = loadLdr;
var pixelColorCache = new Map();
/**
 * Extract a pixel's color
 * Caches data for LDR images
 * @param image image
 * @param x pixel's x coordinate
 * @param y pixel's y coordinate
 * @param c color channel (r=0, g=1, b=2)
 */
function getPixelColor(image, x, y, c) {
    if (image.type === 'HdrImage') {
        return image.data[(x + y * image.width) * image.nChannels + c];
    }
    else {
        var getColorFnc = pixelColorCache.get(image);
        if (getColorFnc == null) {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var ctx_1 = canvas.getContext('2d');
            if (!ctx_1) {
                throw new Error('Failed to create 2d context to retrieve LDR image data');
            }
            ctx_1.drawImage(image.data, 0, 0, image.width, image.height);
            getColorFnc = function (X, Y, C) { return ctx_1.getImageData(X, Y, 1, 1).data[C] / 256; };
            pixelColorCache.set(image, getColorFnc);
        }
        return getColorFnc(x, y, c);
    }
}
exports.getPixelColor = getPixelColor;
var ImageCache = /** @class */ (function () {
    function ImageCache() {
        this.images = {};
        this.downloading = {};
    }
    ImageCache.prototype.contains = function (url) {
        return this.images.hasOwnProperty(url);
    };
    ImageCache.prototype.currentlyDownloading = function (url) {
        return this.downloading.hasOwnProperty(url);
    };
    ImageCache.prototype.size = function () {
        return Object.keys(this.images).length;
    };
    ImageCache.prototype.get = function (url) {
        if (this.contains(url)) {
            // console.log(`Image ${url} was in cache.`); // tslint:disable-line
            return Promise.resolve(this.images[url]);
        }
        else if (this.currentlyDownloading(url)) {
            return this.downloading[url];
        }
        else {
            // console.log(`Image ${url} is downloaded.`); // tslint:disable-line
            return this.load(url);
        }
    };
    ImageCache.prototype.store = function (url, image) {
        if (this.currentlyDownloading(url)) {
            delete this.currentlyDownloading[url];
        }
        this.images[url] = image;
        return image;
    };
    ImageCache.prototype.load = function (url) {
        var _this = this;
        var imagePromise = loadImage(url);
        this.downloading[url] = imagePromise;
        return imagePromise
            .then(function (image) { return _this.store(url, image); });
    };
    return ImageCache;
}());
exports.ImageCache = ImageCache;
//# sourceMappingURL=image-loading.js.map