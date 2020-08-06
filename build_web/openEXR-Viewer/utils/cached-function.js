"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function cachedFunction(f) {
    var cachedValues = new Map();
    return function (input) {
        var cachedResult = cachedValues.get(input);
        if (cachedResult) {
            return cachedResult;
        }
        else {
            var output = f(input);
            cachedValues.set(input, output);
            return output;
        }
    };
}
exports.default = cachedFunction;
//# sourceMappingURL=cached-function.js.map