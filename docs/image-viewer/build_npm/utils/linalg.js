"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Prototype identity matrix
var IDENTITY4x4 = new Float32Array(16);
for (var i = 0; i < 4; ++i) {
    IDENTITY4x4[i + 4 * i] = 1.0;
}
var Matrix4x4 = /** @class */ (function () {
    function Matrix4x4(buffer) {
        if (buffer === void 0) { buffer = IDENTITY4x4; }
        this.data = new Float32Array(buffer);
    }
    Matrix4x4.create = function () {
        return new Matrix4x4;
    };
    Matrix4x4.fromScaling = function (matrix, scaling) {
        if (scaling.length !== 3) {
            throw new Error('Matrix4x4.fromScaling requires a 3-dimentional vector as input');
        }
        scaling.forEach(function (scale, i) {
            matrix.data[i + 4 * i] = scale;
        });
    };
    Matrix4x4.multiply = function (output, a, b) {
        var data = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                for (var k = 0; k < 4; ++k) {
                    data[4 * j + i] += a.data[4 * k + i] * b.data[4 * j + k];
                }
            }
        }
        output.data = data;
    };
    Matrix4x4.scale = function (output, a, scale) {
        if (scale.length !== 3) {
            throw new Error('Matrix4x4.scale expects the third argument to have 3 numbers');
        }
        var data = new Float32Array(a.data);
        for (var i = 0; i < 3; ++i) {
            for (var j = 0; j < 4; ++j) {
                data[4 * i + j] *= scale[i];
            }
        }
        output.data = data;
    };
    Matrix4x4.translate = function (output, a, translation) {
        if (translation.length !== 3) {
            throw new Error('Matrix4x4.translate expects the third argument to have 3 numbers');
        }
        var data = new Float32Array(a.data);
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 3; ++j) {
                data[12 + i] += a.data[4 * j + i] * translation[j];
            }
        }
        output.data = data;
    };
    Matrix4x4.clone = function (a) {
        return new Matrix4x4(a.data);
    };
    Matrix4x4.invert = function (output, matrix) {
        var m = matrix.data;
        var o = output.data;
        // tslint:disable:whitespace
        // tslint:disable:max-line-length
        o[0] = -m[7] * m[10] * m[13] + m[6] * m[11] * m[13] + m[7] * m[9] * m[14] - m[5] * m[11] * m[14] - m[6] * m[9] * m[15] + m[5] * m[10] * m[15];
        o[1] = m[3] * m[10] * m[13] - m[2] * m[11] * m[13] - m[3] * m[9] * m[14] + m[1] * m[11] * m[14] + m[2] * m[9] * m[15] - m[1] * m[10] * m[15];
        o[2] = -m[3] * m[6] * m[13] + m[2] * m[7] * m[13] + m[3] * m[5] * m[14] - m[1] * m[7] * m[14] - m[2] * m[5] * m[15] + m[1] * m[6] * m[15];
        o[3] = m[3] * m[6] * m[9] - m[2] * m[7] * m[9] - m[3] * m[5] * m[10] + m[1] * m[7] * m[10] + m[2] * m[5] * m[11] - m[1] * m[6] * m[11];
        o[4] = m[7] * m[10] * m[12] - m[6] * m[11] * m[12] - m[7] * m[8] * m[14] + m[4] * m[11] * m[14] + m[6] * m[8] * m[15] - m[4] * m[10] * m[15];
        o[5] = -m[3] * m[10] * m[12] + m[2] * m[11] * m[12] + m[3] * m[8] * m[14] - m[0] * m[11] * m[14] - m[2] * m[8] * m[15] + m[0] * m[10] * m[15];
        o[6] = m[3] * m[6] * m[12] - m[2] * m[7] * m[12] - m[3] * m[4] * m[14] + m[0] * m[7] * m[14] + m[2] * m[4] * m[15] - m[0] * m[6] * m[15];
        o[7] = -m[3] * m[6] * m[8] + m[2] * m[7] * m[8] + m[3] * m[4] * m[10] - m[0] * m[7] * m[10] - m[2] * m[4] * m[11] + m[0] * m[6] * m[11];
        o[8] = -m[7] * m[9] * m[12] + m[5] * m[11] * m[12] + m[7] * m[8] * m[13] - m[4] * m[11] * m[13] - m[5] * m[8] * m[15] + m[4] * m[9] * m[15];
        o[9] = m[3] * m[9] * m[12] - m[1] * m[11] * m[12] - m[3] * m[8] * m[13] + m[0] * m[11] * m[13] + m[1] * m[8] * m[15] - m[0] * m[9] * m[15];
        o[10] = -m[3] * m[5] * m[12] + m[1] * m[7] * m[12] + m[3] * m[4] * m[13] - m[0] * m[7] * m[13] - m[1] * m[4] * m[15] + m[0] * m[5] * m[15];
        o[11] = m[3] * m[5] * m[8] - m[1] * m[7] * m[8] - m[3] * m[4] * m[9] + m[0] * m[7] * m[9] + m[1] * m[4] * m[11] - m[0] * m[5] * m[11];
        o[12] = m[6] * m[9] * m[12] - m[5] * m[10] * m[12] - m[6] * m[8] * m[13] + m[4] * m[10] * m[13] + m[5] * m[8] * m[14] - m[4] * m[9] * m[14];
        o[13] = -m[2] * m[9] * m[12] + m[1] * m[10] * m[12] + m[2] * m[8] * m[13] - m[0] * m[10] * m[13] - m[1] * m[8] * m[14] + m[0] * m[9] * m[14];
        o[14] = m[2] * m[5] * m[12] - m[1] * m[6] * m[12] - m[2] * m[4] * m[13] + m[0] * m[6] * m[13] + m[1] * m[4] * m[14] - m[0] * m[5] * m[14];
        o[15] = -m[2] * m[5] * m[8] + m[1] * m[6] * m[8] + m[2] * m[4] * m[9] - m[0] * m[6] * m[9] - m[1] * m[4] * m[10] + m[0] * m[5] * m[10];
        // tslint:enable:whitespace
        // tslint:enable:max-line-length
        var determinant = m[0] * o[0] + m[1] * o[4] + m[2] * o[8] + m[3] * o[12];
        if (determinant === 0.0) {
            throw new Error('Matrix is not invertible.');
        }
        var inverseDeterminant = 1.0 / determinant;
        for (var i = 0; i < 16; ++i) {
            o[i] *= inverseDeterminant;
        }
    };
    return Matrix4x4;
}());
exports.Matrix4x4 = Matrix4x4;
var Vector4 = /** @class */ (function () {
    function Vector4() {
        this.data = new Float32Array([0, 0, 0, 0]);
    }
    Vector4.create = function () {
        return new Vector4;
    };
    Vector4.set = function (output, x, y, z, w) {
        output.data[0] = x;
        output.data[1] = y;
        output.data[2] = z;
        output.data[3] = w;
    };
    Vector4.fromValues = function (x, y, z, w) {
        var vector = new Vector4;
        Vector4.set(vector, x, y, z, w);
        return vector;
    };
    Vector4.transformMat4 = function (output, vector, matrix) {
        var v = vector.data;
        var m = matrix.data;
        var data = new Float32Array([0, 0, 0, 0]);
        for (var i = 0; i < 4; ++i) {
            for (var j = 0; j < 4; ++j) {
                data[i] += v[j] * m[4 * j + i];
            }
        }
        output.data = data;
    };
    return Vector4;
}());
exports.Vector4 = Vector4;
// function assertEqual(a: mat4 | vec4, b: Matrix4x4 | Vector4, message: string): void {
//     for (let i = 0; i < a.length; ++i) {
//         if (Math.abs(a[i] - b.data[i]) > 0.001) {
//             throw new Error('Failed:' + message + '\n' + a + '\n' + b.data);
//         }
//     }
// }
// function test() {
//     const a = mat4.create();
//     const b = Matrix4x4.create();
//     assertEqual(a, b, 'after creation');
//     for (let ii = 0; ii < 16; ++ii) {
//         a[ii] = b.data[ii] = Math.random();
//     }
//     const c = mat4.create();
//     const d = Matrix4x4.create();
//     mat4.fromScaling(c, [4, 3, 2]);
//     Matrix4x4.fromScaling(d, [4, 3, 2]);
//     assertEqual(c, d, 'fromScaling');
//     mat4.translate(c, a, [2, 3, 4]);
//     Matrix4x4.translate(d, b, [2, 3, 4]);
//     // assertEqual(a, b, 'after translation ab');
//     assertEqual(c, d, 'after translation cd');
//     mat4.scale(a, c, [2, 3, 4]);
//     Matrix4x4.scale(b, d, [2, 3, 4]);
//     assertEqual(a, b, 'after scaling ab');
//     // assertEqual(c, d, 'after scaling cd');
//     mat4.translate(c, a, [2, 3, 4]);
//     Matrix4x4.translate(d, b, [2, 3, 4]);
//     // assertEqual(a, b, 'after translation again ab');
//     assertEqual(c, d, 'after translation again cd');
//     mat4.invert(a, c);
//     Matrix4x4.invert(b, d);
//     assertEqual(a, b, 'after invert ab');
//     assertEqual(c, d, 'after invert cd');
//     const e = mat4.create();
//     const f = Matrix4x4.create();
//     mat4.multiply(e, c, a);
//     Matrix4x4.multiply(f, d, b);
//     assertEqual(e, f, 'after multiply ef');
//     assertEqual(c, d, 'after multiply cd');
//     assertEqual(a, b, 'after multiply ab');
//     mat4.scale(a, c, [5, -3, 4]);
//     Matrix4x4.scale(b, d, [5, -3, 4]);
//     assertEqual(a, b, 'after scaling again ab');
//     assertEqual(c, d, 'after scaling again cd');
//     // assertEqual(c, d, 'after scaling cd');
//     const q = mat4.clone(a);
//     const i = Matrix4x4.clone(b);
//     assertEqual(q, i, 'after cloning');
//     const v1 = vec4.create();
//     const w1 = Vector4.create();
//     assertEqual(v1, w1, 'vectors after init');
//     vec4.set(v1, 3, 4, 5, 6);
//     Vector4.set(w1, 3, 4, 5, 6);
//     assertEqual(v1, w1, 'vectors after set');
//     const v2 = vec4.fromValues(6, 5, 4, 3);
//     const w2 = Vector4.fromValues(6, 5, 4, 3);
//     assertEqual(v2, w2, 'vectors after fromValues');
//     vec4.transformMat4(v1, v2, a);
//     Vector4.transformMat4(w1, w2, b);
//     assertEqual(v1, w1, 'vectors after tranformMat4');
// }
//# sourceMappingURL=linalg.js.map