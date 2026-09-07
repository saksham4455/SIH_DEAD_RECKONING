import { identity, invert, multiply } from '../utils/matrix';

describe('matrix.invert', () => {
  it('inverts a 2x2 matrix correctly', () => {
    const a = [
      [4, 7],
      [2, 6],
    ];
    const inv = invert(a);
    const product = multiply(a, inv);
    product.forEach((row, i) => row.forEach((v, j) => expect(v).toBeCloseTo(identity(2)[i][j], 6)));
  });

  it('inverts a 4x4 diagonal matrix correctly', () => {
    const a = [
      [2, 0, 0, 0],
      [0, 3, 0, 0],
      [0, 0, 4, 0],
      [0, 0, 0, 5],
    ];
    const inv = invert(a);
    expect(inv[0][0]).toBeCloseTo(0.5);
    expect(inv[1][1]).toBeCloseTo(1 / 3);
    expect(inv[2][2]).toBeCloseTo(0.25);
    expect(inv[3][3]).toBeCloseTo(0.2);
  });

  it('throws on a singular matrix', () => {
    const singular = [
      [1, 2],
      [2, 4],
    ];
    expect(() => invert(singular)).toThrow();
  });
});
