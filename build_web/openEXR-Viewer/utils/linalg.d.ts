export declare class Matrix4x4 {
    data: Float32Array;
    static create(): Matrix4x4;
    static fromScaling(matrix: Matrix4x4, scaling: number[]): void;
    static multiply(output: Matrix4x4, a: Matrix4x4, b: Matrix4x4): void;
    static scale(output: Matrix4x4, a: Matrix4x4, scale: number[]): void;
    static translate(output: Matrix4x4, a: Matrix4x4, translation: number[]): void;
    static clone(a: Matrix4x4): Matrix4x4;
    static invert(output: Matrix4x4, matrix: Matrix4x4): void;
    constructor(buffer?: Float32Array);
}
export declare class Vector4 {
    data: Float32Array;
    static create(): Vector4;
    static set(output: Vector4, x: number, y: number, z: number, w: number): void;
    static fromValues(x: number, y: number, z: number, w: number): Vector4;
    static transformMat4(output: Vector4, vector: Vector4, matrix: Matrix4x4): void;
    constructor();
}
