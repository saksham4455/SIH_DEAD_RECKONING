"use strict";
/**
 * Tiny matrix helper library. The EKF state is only 4-dimensional, so a full
 * linear-algebra dependency would be overkill — these plain array-of-arrays
 * operations are easy to read and easy to unit-test line by line.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.zeros = zeros;
exports.identity = identity;
exports.transpose = transpose;
exports.multiply = multiply;
exports.add = add;
exports.subtract = subtract;
exports.scalarMultiply = scalarMultiply;
exports.invert2x2 = invert2x2;
exports.invert = invert;
exports.diag = diag;
exports.columnVector = columnVector;
exports.flatten = flatten;
function zeros(rows, cols) {
    return Array.from({ length: rows }, () => new Array(cols).fill(0));
}
function identity(n) {
    const m = zeros(n, n);
    for (let i = 0; i < n; i++)
        m[i][i] = 1;
    return m;
}
function transpose(a) {
    const rows = a.length;
    const cols = a[0].length;
    const result = zeros(cols, rows);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            result[j][i] = a[i][j];
        }
    }
    return result;
}
function multiply(a, b) {
    const rowsA = a.length;
    const colsA = a[0].length;
    const colsB = b[0].length;
    const result = zeros(rowsA, colsB);
    for (let i = 0; i < rowsA; i++) {
        for (let j = 0; j < colsB; j++) {
            let sum = 0;
            for (let k = 0; k < colsA; k++)
                sum += a[i][k] * b[k][j];
            result[i][j] = sum;
        }
    }
    return result;
}
function add(a, b) {
    return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}
function subtract(a, b) {
    return a.map((row, i) => row.map((v, j) => v - b[i][j]));
}
function scalarMultiply(a, s) {
    return a.map((row) => row.map((v) => v * s));
}
/** Closed-form inverse for a 2x2 matrix. */
function invert2x2(a) {
    const [[a00, a01], [a10, a11]] = a;
    const det = a00 * a11 - a01 * a10;
    if (Math.abs(det) < 1e-12) {
        throw new Error('Matrix is singular / near-singular — cannot invert');
    }
    const invDet = 1 / det;
    return [
        [a11 * invDet, -a01 * invDet],
        [-a10 * invDet, a00 * invDet],
    ];
}
/**
 * General Gauss-Jordan inverse for a small square matrix. The KF's
 * measurement dimension varies (2 rows for position-only, up to 4 when
 * speed + heading are also observed), so the update step needs an inverse
 * that isn't hardcoded to one size. Fine for the tiny (<=4x4) matrices
 * this engine ever produces.
 */
function invert(a) {
    const n = a.length;
    if (n === 2)
        return invert2x2(a);
    // Build [A | I] augmented matrix and row-reduce.
    const aug = a.map((row, i) => [...row, ...identity(n)[i]]);
    for (let col = 0; col < n; col++) {
        // Partial pivot for numerical stability.
        let pivotRow = col;
        for (let r = col + 1; r < n; r++) {
            if (Math.abs(aug[r][col]) > Math.abs(aug[pivotRow][col]))
                pivotRow = r;
        }
        if (Math.abs(aug[pivotRow][col]) < 1e-12) {
            throw new Error('Matrix is singular / near-singular — cannot invert');
        }
        [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
        const pivotVal = aug[col][col];
        for (let c = 0; c < 2 * n; c++)
            aug[col][c] /= pivotVal;
        for (let r = 0; r < n; r++) {
            if (r === col)
                continue;
            const factor = aug[r][col];
            for (let c = 0; c < 2 * n; c++)
                aug[r][c] -= factor * aug[col][c];
        }
    }
    return aug.map((row) => row.slice(n));
}
function diag(values) {
    const n = values.length;
    const m = zeros(n, n);
    for (let i = 0; i < n; i++)
        m[i][i] = values[i];
    return m;
}
function columnVector(values) {
    return values.map((v) => [v]);
}
function flatten(a) {
    return a.map((row) => row[0]);
}
//# sourceMappingURL=matrix.js.map