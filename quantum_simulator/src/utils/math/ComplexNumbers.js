// src/utils/math/ComplexNumbers.js
/**
 * Complex number operations for quantum simulation
 */

export class ComplexMath {
    /**
     * Add two complex numbers
     * @param {Object} a - First complex number {re, im}
     * @param {Object} b - Second complex number {re, im}
     * @returns {Object} Sum {re, im}
     */
    static add(a, b) {
      return { 
        re: a.re + b.re, 
        im: a.im + b.im 
      };
    }
  
    /**
     * Subtract two complex numbers
     * @param {Object} a - First complex number {re, im}
     * @param {Object} b - Second complex number {re, im}
     * @returns {Object} Difference {re, im}
     */
    static subtract(a, b) {
      return { 
        re: a.re - b.re, 
        im: a.im - b.im 
      };
    }
  
    /**
     * Multiply two complex numbers
     * @param {Object} a - First complex number {re, im}
     * @param {Object} b - Second complex number {re, im}
     * @returns {Object} Product {re, im}
     */
    static multiply(a, b) {
      return { 
        re: (a.re * b.re) - (a.im * b.im), 
        im: (a.re * b.im) + (a.im * b.re) 
      };
    }
  
    /**
     * Divide two complex numbers
     * @param {Object} a - Numerator {re, im}
     * @param {Object} b - Denominator {re, im}
     * @returns {Object} Quotient {re, im}
     */
    static divide(a, b) {
      const denominator = b.re * b.re + b.im * b.im;
      if (Math.abs(denominator) < 1e-10) {
        throw new Error('Division by zero in complex arithmetic');
      }
      
      return {
        re: (a.re * b.re + a.im * b.im) / denominator,
        im: (a.im * b.re - a.re * b.im) / denominator
      };
    }
  
    /**
     * Calculate the magnitude (absolute value) of a complex number
     * @param {Object} complex - Complex number {re, im}
     * @returns {number} Magnitude
     */
    static magnitude(complex) {
      return Math.sqrt(complex.re * complex.re + complex.im * complex.im);
    }
  
    /**
     * Calculate the phase (argument) of a complex number
     * @param {Object} complex - Complex number {re, im}
     * @returns {number} Phase in radians
     */
    static phase(complex) {
      return Math.atan2(complex.im, complex.re);
    }
  
    /**
     * Calculate the complex conjugate
     * @param {Object} complex - Complex number {re, im}
     * @returns {Object} Complex conjugate {re, -im}
     */
    static conjugate(complex) {
      return {
        re: complex.re,
        im: -complex.im
      };
    }
  
    /**
     * Scale a complex number by a real factor
     * @param {Object} complex - Complex number {re, im}
     * @param {number} factor - Real scaling factor
     * @returns {Object} Scaled complex number {re, im}
     */
    static scale(complex, factor) {
      return {
        re: complex.re * factor,
        im: complex.im * factor
      };
    }
  
    /**
     * Create a complex number from polar coordinates
     * @param {number} magnitude - Magnitude (r)
     * @param {number} phase - Phase in radians (θ)
     * @returns {Object} Complex number {re, im}
     */
    static fromPolar(magnitude, phase) {
      return {
        re: magnitude * Math.cos(phase),
        im: magnitude * Math.sin(phase)
      };
    }
  
    /**
     * Convert complex number to polar form
     * @param {Object} complex - Complex number {re, im}
     * @returns {Object} Polar form {magnitude, phase}
     */
    static toPolar(complex) {
      return {
        magnitude: this.magnitude(complex),
        phase: this.phase(complex)
      };
    }
  
    /**
     * Check if two complex numbers are approximately equal
     * @param {Object} a - First complex number {re, im}
     * @param {Object} b - Second complex number {re, im}
     * @param {number} tolerance - Tolerance for comparison (default: 1e-10)
     * @returns {boolean} True if approximately equal
     */
    static isEqual(a, b, tolerance = 1e-10) {
      return Math.abs(a.re - b.re) < tolerance && Math.abs(a.im - b.im) < tolerance;
    }
  
    /**
     * Check if a complex number is approximately zero
     * @param {Object} complex - Complex number {re, im}
     * @param {number} tolerance - Tolerance for comparison (default: 1e-10)
     * @returns {boolean} True if approximately zero
     */
    static isZero(complex, tolerance = 1e-10) {
      return this.magnitude(complex) < tolerance;
    }
  
    /**
     * Format complex number for display
     * @param {Object} complex - Complex number {re, im}
     * @param {number} precision - Number of decimal places (default: 3)
     * @returns {string} Formatted string representation
     */
    static format(complex, precision = 3) {
      const { re, im } = complex;
      const absRe = Math.abs(re);
      const absIm = Math.abs(im);
      
      // Round to specified precision
      const roundedRe = Math.round(re * Math.pow(10, precision)) / Math.pow(10, precision);
      const roundedIm = Math.round(im * Math.pow(10, precision)) / Math.pow(10, precision);
      
      // Handle special cases
      if (absRe < Math.pow(10, -precision) && absIm < Math.pow(10, -precision)) {
        return "0";
      }
      if (absRe < Math.pow(10, -precision)) {
        if (roundedIm === 1) return "i";
        if (roundedIm === -1) return "-i";
        return `${roundedIm}i`;
      }
      if (absIm < Math.pow(10, -precision)) {
        return `${roundedRe}`;
      }
      
      // Both real and imaginary parts present
      let imagPart = Math.abs(roundedIm);
      if (imagPart === 1) imagPart = "";
      
      const sign = im >= 0 ? "+" : "-";
      return `${roundedRe}${sign}${imagPart}i`;
    }
  
    /**
     * Create a zero complex number
     * @returns {Object} Zero complex number {re: 0, im: 0}
     */
    static zero() {
      return { re: 0, im: 0 };
    }
  
    /**
     * Create a unit complex number (1 + 0i)
     * @returns {Object} Unit complex number {re: 1, im: 0}
     */
    static one() {
      return { re: 1, im: 0 };
    }
  
    /**
     * Create the imaginary unit (0 + 1i)
     * @returns {Object} Imaginary unit {re: 0, im: 1}
     */
    static i() {
      return { re: 0, im: 1 };
    }
  
    /**
     * Calculate e^(i*θ) using Euler's formula
     * @param {number} theta - Angle in radians
     * @returns {Object} Complex exponential {re, im}
     */
    static exponential(theta) {
      return {
        re: Math.cos(theta),
        im: Math.sin(theta)
      };
    }
  
    /**
     * Calculate the square root of a complex number
     * @param {Object} complex - Complex number {re, im}
     * @returns {Object} Square root {re, im}
     */
    static sqrt(complex) {
      const magnitude = this.magnitude(complex);
      const phase = this.phase(complex);
      
      return this.fromPolar(Math.sqrt(magnitude), phase / 2);
    }
  
    /**
     * Raise a complex number to a power
     * @param {Object} complex - Base complex number {re, im}
     * @param {number} power - Real power
     * @returns {Object} Result {re, im}
     */
    static pow(complex, power) {
      const magnitude = this.magnitude(complex);
      const phase = this.phase(complex);
      
      return this.fromPolar(
        Math.pow(magnitude, power),
        phase * power
      );
    }
  }