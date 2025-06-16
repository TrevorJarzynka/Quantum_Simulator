// src/constants/ui.js
/**
 * UI constants and configuration
 * Layout, spacing, animations, and other UI-related constants
 */

// Layout and spacing
export const LAYOUT = {
    // Container sizes
    MAX_WIDTH: '1200px',
    MIN_WIDTH: '800px',
    
    // Spacing scale (based on 8px grid)
    SPACING: {
      XS: '4px',
      SM: '8px',
      MD: '16px',
      LG: '24px',
      XL: '32px',
      XXL: '48px'
    },
    
    // Border radius
    BORDER_RADIUS: {
      SM: '4px',
      MD: '6px',
      LG: '8px',
      FULL: '50%'
    },
    
    // Grid system
    GRID: {
      COLUMNS: 12,
      GUTTER: '20px',
      BREAKPOINTS: {
        SM: '576px',
        MD: '768px',
        LG: '992px',
        XL: '1200px'
      }
    }
  };
  
  // Component dimensions
  export const DIMENSIONS = {
    // Circuit editor
    CIRCUIT: {
      QUBIT_ROW_HEIGHT: '60px',
      CELL_SIZE: '60px',
      WIRE_THICKNESS: '2px',
      GATE_SIZE: '50px'
    },
    
    // Gate palette
    GATE_PALETTE: {
      WIDTH: '250px',
      GATE_SIZE: '60px',
      GRID_GAP: '10px'
    },
    
    // Visualizations
    VISUALIZATION: {
      PANEL_MIN_HEIGHT: '300px',
      BLOCH_SPHERE_SIZE: '120px',
      PROBABILITY_BAR_HEIGHT: '20px',
      MATRIX_CELL_SIZE: '60px'
    },
    
    // Controls
    CONTROLS: {
      BUTTON_HEIGHT: '36px',
      INPUT_HEIGHT: '36px',
      STEP_BUTTON_SIZE: '36px'
    }
  };
  
  // Typography
  export const TYPOGRAPHY = {
    // Font families
    FONT_FAMILY: {
      PRIMARY: "'Roboto', sans-serif",
      MONOSPACE: "'Courier New', monospace",
      HEADING: "'Roboto', sans-serif"
    },
    
    // Font sizes
    FONT_SIZE: {
      XS: '0.75rem',    // 12px
      SM: '0.875rem',   // 14px
      BASE: '1rem',     // 16px
      LG: '1.125rem',   // 18px
      XL: '1.25rem',    // 20px
      XXL: '1.5rem',    // 24px
      XXXL: '2rem'      // 32px
    },
    
    // Font weights
    FONT_WEIGHT: {
      LIGHT: 300,
      NORMAL: 400,
      MEDIUM: 500,
      SEMIBOLD: 600,
      BOLD: 700
    },
    
    // Line heights
    LINE_HEIGHT: {
      TIGHT: 1.2,
      NORMAL: 1.5,
      LOOSE: 1.8
    }
  };
  
  // Animations and transitions
  export const ANIMATIONS = {
    // Transition durations
    DURATION: {
      FAST: '0.15s',
      NORMAL: '0.3s',
      SLOW: '0.5s'
    },
    
    // Easing functions
    EASING: {
      EASE_IN: 'ease-in',
      EASE_OUT: 'ease-out',
      EASE_IN_OUT: 'ease-in-out',
      LINEAR: 'linear'
    },
    
    // Common transition properties
    TRANSITIONS: {
      ALL: 'all 0.3s ease',
      BACKGROUND: 'background-color 0.2s ease',
      TRANSFORM: 'transform 0.3s ease',
      OPACITY: 'opacity 0.2s ease',
      SHADOW: 'box-shadow 0.2s ease'
    },
    
    // Loading spinner
    SPINNER: {
      DURATION: '1s',
      SIZE: '18px'
    }
  };
  
  // Z-index layers
  export const Z_INDEX = {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070
  };
  
  // Shadows
  export const SHADOWS = {
    SM: '0 1px 3px rgba(0, 0, 0, 0.1)',
    MD: '0 2px 10px rgba(0, 0, 0, 0.1)',
    LG: '0 4px 20px rgba(0, 0, 0, 0.15)',
    XL: '0 8px 40px rgba(0, 0, 0, 0.2)',
    
    // Specific component shadows
    GATE: '0 2px 4px rgba(0, 0, 0, 0.1)',
    GATE_HOVER: '0 4px 8px rgba(0, 0, 0, 0.15)',
    PANEL: '0 2px 10px rgba(0, 0, 0, 0.1)',
    BUTTON: '0 2px 5px rgba(0, 0, 0, 0.1)'
  };
  
  // Component-specific UI constants
  export const COMPONENTS = {
    // Circuit editor
    CIRCUIT_EDITOR: {
      MIN_COLUMNS: 5,
      MAX_COLUMNS: 20,
      SCROLL_THRESHOLD: 10
    },
    
    // State visualizer
    STATE_VISUALIZER: {
      MAX_DISPLAY_STATES: 16,
      SCROLL_HEIGHT: '200px',
      PROBABILITY_PRECISION: 2
    },
    
    // Math visualizer
    MATH_VISUALIZER: {
      EQUATION_FONT_SIZE: '1rem',
      MATRIX_FONT_SIZE: '0.9rem',
      MAX_MATRIX_SIZE: '500px'
    },
    
    // Simulation controls
    SIMULATION_CONTROLS: {
      STEP_BUTTON_SIZE: '36px',
      PROGRESS_BAR_HEIGHT: '4px'
    },
    
    // Loading states
    LOADING: {
      SPINNER_SIZE: '20px',
      SKELETON_ANIMATION_DURATION: '1.5s',
      PULSE_OPACITY: 0.6
    }
  };
  
  // Responsive breakpoints
  export const BREAKPOINTS = {
    // Mobile first approach
    MOBILE: '(max-width: 767px)',
    TABLET: '(min-width: 768px) and (max-width: 1023px)',
    DESKTOP: '(min-width: 1024px)',
    
    // Specific queries
    SMALL_SCREEN: '(max-width: 1200px)',
    LARGE_SCREEN: '(min-width: 1201px)',
    
    // Print media
    PRINT: 'print'
  };
  
  // Accessibility
  export const ACCESSIBILITY = {
    // Focus outline
    FOCUS_OUTLINE: '2px solid #3498db',
    FOCUS_OFFSET: '2px',
    
    // High contrast ratios
    CONTRAST_RATIOS: {
      NORMAL: 4.5,
      LARGE: 3
    },
    
    // Animation preferences
    REDUCE_MOTION: 'prefers-reduced-motion: reduce',
    
    // Keyboard navigation
    TAB_INDEX: {
      SKIP: -1,
      NATURAL: 0,
      FORCE: 1
    }
  };
  
  // Form elements
  export const FORMS = {
    // Input dimensions
    INPUT: {
      HEIGHT: '40px',
      PADDING: '8px 12px',
      BORDER_WIDTH: '1px',
      BORDER_RADIUS: '4px'
    },
    
    // Button styles
    BUTTON: {
      HEIGHT: '40px',
      PADDING: '8px 16px',
      MIN_WIDTH: '80px',
      BORDER_RADIUS: '4px'
    },
    
    // Select dropdown
    SELECT: {
      HEIGHT: '40px',
      ARROW_SIZE: '12px'
    },
    
    // Validation states
    VALIDATION: {
      SUCCESS_COLOR: '#2ecc71',
      ERROR_COLOR: '#e74c3c',
      WARNING_COLOR: '#f39c12'
    }
  };
  
  // Performance thresholds
  export const PERFORMANCE = {
    // Render thresholds
    MAX_RENDERED_STATES: 100,
    VIRTUALIZATION_THRESHOLD: 50,
    
    // Animation frame budget
    FRAME_BUDGET: 16, // milliseconds
    
    // Debounce delays
    DEBOUNCE: {
      INPUT: 300,
      RESIZE: 100,
      SCROLL: 50
    }
  };