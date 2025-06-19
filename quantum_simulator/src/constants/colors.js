// src/constants/colors.js
/**
 * Color constants for the quantum circuit simulator
 * Centralized color management for consistency across the app
 */

// Primary color palette
export const COLORS = {
    // Brand colors
    PRIMARY: '#3498db',
    SECONDARY: '#95a5a6',
    SUCCESS: '#2ecc71',
    DANGER: '#e74c3c',
    WARNING: '#f39c12',
    INFO: '#9b59b6',
    
    // Gate colors (matching your existing design)
    HADAMARD: '#3498db',
    PAULI_X: '#e74c3c',
    PAULI_Y: '#2ecc71',
    PAULI_Z: '#f39c12',
    PHASE_S: '#9b59b6',
    PHASE_T: '#e67e22',
    
    // Multi-qubit gate colors
    CNOT: '#16a085',
    CONTROLLED_Z: '#8e44ad',
    SWAP: '#d35400',
    CONTROLLED_PHASE: '#27ae60',
    
    // Measurement
    MEASURE: '#7f8c8d',
    
    // UI colors
    BACKGROUND: '#0a0a0a',
    BACKGROUND_LIGHT: '#f8f9fa',
    BACKGROUND_DARK: '#f0f0f0',
    BORDER: '#ddd',
    BORDER_LIGHT: '#e0e0e0',
    
    // Text colors
    TEXT_PRIMARY: '#2c3e50',
    TEXT_SECONDARY: '#7f8c8d',
    TEXT_MUTED: '#95a5a6',
    TEXT_INVERSE: '#ffffff',
    
    // State colors
    ACTIVE: '#3498db',
    INACTIVE: '#ecf0f1',
    DISABLED: '#bdc3c7',
    
    // Visualization colors
    PROBABILITY_HIGH: '#3498db',
    PROBABILITY_LOW: '#b3e0ff',
    QUBIT_0: '#2ecc71',
    QUBIT_1: '#e74c3c'
  };
  
  // Semantic color mappings for better code readability
  export const SEMANTIC_COLORS = {
    // Circuit editor
    CIRCUIT_BACKGROUND: COLORS.BACKGROUND,
    CIRCUIT_WIRE: COLORS.TEXT_PRIMARY,
    CIRCUIT_CELL_HOVER: 'rgba(44, 62, 80, 0.1)',
    
    // Gate palette
    GATE_SHADOW: 'rgba(0, 0, 0, 0.1)',
    GATE_SHADOW_HOVER: 'rgba(0, 0, 0, 0.15)',
    GATE_SELECTED_BORDER: COLORS.TEXT_PRIMARY,
    
    // Controls and buttons
    BUTTON_PRIMARY: COLORS.PRIMARY,
    BUTTON_SECONDARY: COLORS.SECONDARY,
    BUTTON_DANGER: COLORS.DANGER,
    BUTTON_DISABLED: COLORS.DISABLED,
    
    // Visualizations
    STATE_VECTOR_BACKGROUND: COLORS.BACKGROUND_LIGHT,
    PROBABILITY_BAR_BACKGROUND: COLORS.BACKGROUND_DARK,
    BLOCH_SPHERE_BACKGROUND: COLORS.BACKGROUND_DARK,
    DENSITY_MATRIX_BACKGROUND: COLORS.BACKGROUND_LIGHT,
    
    // Status and feedback
    ERROR: COLORS.DANGER,
    SUCCESS: COLORS.SUCCESS,
    WARNING: COLORS.WARNING,
    LOADING: COLORS.INFO,
    
    // Quantum state indicators
    ENTANGLED: COLORS.WARNING,
    SEPARABLE: COLORS.SUCCESS,
    SUPERPOSITION: COLORS.INFO
  };
  
  // Color utilities
  export const COLOR_UTILS = {
    /**
     * Convert hex color to rgba with opacity
     * @param {string} hex - Hex color (e.g., '#3498db')
     * @param {number} opacity - Opacity value (0-1)
     * @returns {string} RGBA color string
     */
    hexToRgba: (hex, opacity) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
  
    /**
     * Get color based on probability value
     * @param {number} probability - Probability value (0-1)
     * @returns {string} Color for the probability
     */
    getProbabilityColor: (probability) => {
      if (probability > 0.1) return COLORS.PROBABILITY_HIGH;
      return COLORS.PROBABILITY_LOW;
    },
  
    /**
     * Get gate color by gate ID
     * @param {string} gateId - Gate identifier
     * @returns {string} Color for the gate
     */
    getGateColor: (gateId) => {
      const gateColorMap = {
        h: COLORS.HADAMARD,
        x: COLORS.PAULI_X,
        y: COLORS.PAULI_Y,
        z: COLORS.PAULI_Z,
        s: COLORS.PHASE_S,
        t: COLORS.PHASE_T,
        cx: COLORS.CNOT,
        cz: COLORS.CONTROLLED_Z,
        swap: COLORS.SWAP,
        cp: COLORS.CONTROLLED_PHASE,
        measure: COLORS.MEASURE
      };
      return gateColorMap[gateId] || COLORS.SECONDARY;
    }
  };
  
  // Theme configurations
  export const THEMES = {
    light: {
      background: COLORS.BACKGROUND,
      text: COLORS.TEXT_PRIMARY,
      border: COLORS.BORDER,
      accent: COLORS.PRIMARY
    },
    dark: {
      background: '#2c3e50',
      text: '#ecf0f1',
      border: '#34495e',
      accent: '#3498db'
    }
  };