// utils.js

/**
 * Determines if the current device is a mobile device based on screen width and touch support.
 * @returns {boolean} True if the screen width is less than 576px or if touch is supported, false otherwise.
 */
const isMobileDevice = () =>
  window.innerWidth < 576 ||
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0;

/**
 * Map number x from range [a, b] to [c, d]
 */
const map = (x, a, b, c, d) => ((x - a) * (d - c)) / (b - a) + c;

/**
 * Linear interpolation
 */
const lerp = (a, b, n) => (1 - n) * a + n * b;

export { isMobileDevice, map, lerp };
