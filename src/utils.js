// utils/mathUtils.js
export default {
  // map number x from range [a, b] to [c, d]
  map: (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c,

  // linear interpolation
  lerp: (a, b, n) => (1 - n) * a + n * b,
};
