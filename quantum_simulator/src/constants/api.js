// src/constants/api.js
/**
 * API configuration and constants
 * Centralized API endpoints and configuration
 */

// Base API configuration
export const API_CONFIG = {
    // Qiskit API
    QISKIT_BASE_URL: process.env.REACT_APP_QISKIT_API_URL || 'http://localhost:5000/api/qiskit',
    
    // Request timeouts (in milliseconds)
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    SIMULATION_TIMEOUT: 120000, // 2 minutes for complex simulations
    BACKEND_FETCH_TIMEOUT: 10000, // 10 seconds
    
    // Retry configuration
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    
    // Rate limiting
    MAX_REQUESTS_PER_MINUTE: 60,
    
    // Request headers
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  
  // API endpoints
  export const API_ENDPOINTS = {
    // Qiskit endpoints
    QISKIT: {
      BACKENDS: '/backends',
      SIMULATE: '/simulate',
      STATUS: '/status',
      JOBS: '/jobs',
      RESULTS: '/results'
    },
    
    // Future endpoints for other services
    CIRCUIT: {
      SAVE: '/circuit/save',
      LOAD: '/circuit/load',
      SHARE: '/circuit/share'
    },
    
    ANALYTICS: {
      TRACK: '/analytics/track',
      PERFORMANCE: '/analytics/performance'
    }
  };
  
  // Simulation configuration
  export const SIMULATION_CONFIG = {
    // Default values
    DEFAULT_SHOTS: 1024,
    MAX_SHOTS: 10000,
    MIN_SHOTS: 1,
    
    // Circuit limits
    MAX_QUBITS: 8,
    MAX_DEPTH: 20,
    MIN_QUBITS: 1,
    MIN_DEPTH: 1,
    
    // Simulation backends
    LOCAL_BACKENDS: ['simulator', 'statevector_simulator'],
    REMOTE_BACKENDS: ['ibmq_qasm_simulator', 'ibmq_manila', 'ibmq_belem'],
    
    // Performance thresholds
    PERFORMANCE_THRESHOLDS: {
      FAST: 1000, // ms
      MEDIUM: 5000, // ms
      SLOW: 15000 // ms
    }
  };
  
  // Qiskit-specific configuration
  export const QISKIT_CONFIG = {
    // Default backend
    DEFAULT_BACKEND: 'simulator',
    
    // Backend types
    BACKEND_TYPES: {
      SIMULATOR: 'simulator',
      REAL_DEVICE: 'real_device'
    },
    
    // Job status values
    JOB_STATUS: {
      PENDING: 'PENDING',
      RUNNING: 'RUNNING',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED'
    },
    
    // Error codes
    ERROR_CODES: {
      NETWORK_ERROR: 'NETWORK_ERROR',
      TIMEOUT: 'TIMEOUT',
      INVALID_CIRCUIT: 'INVALID_CIRCUIT',
      BACKEND_UNAVAILABLE: 'BACKEND_UNAVAILABLE',
      QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
      AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED'
    },
    
    // Supported gates for different backends
    SUPPORTED_GATES: {
      BASIC_SIMULATOR: ['h', 'x', 'y', 'z', 's', 't', 'cx', 'measure'],
      IBM_HARDWARE: ['h', 'x', 'cx', 'rz', 'sx', 'measure'],
      FULL_SIMULATOR: ['h', 'x', 'y', 'z', 's', 't', 'cx', 'cz', 'swap', 'cp', 'measure']
    }
  };
  
  // Error messages
  export const ERROR_MESSAGES = {
    NETWORK: {
      CONNECTION_FAILED: 'Failed to connect to the server. Please check your internet connection.',
      TIMEOUT: 'Request timed out. The server may be busy or unreachable.',
      SERVER_ERROR: 'Server error occurred. Please try again later.'
    },
    
    VALIDATION: {
      INVALID_CIRCUIT: 'Invalid circuit configuration. Please check your circuit setup.',
      TOO_MANY_QUBITS: 'Circuit has too many qubits for the selected backend.',
      INVALID_GATE: 'One or more gates are not supported by the selected backend.',
      EMPTY_CIRCUIT: 'Circuit is empty. Please add some gates before simulation.'
    },
    
    SIMULATION: {
      FAILED: 'Simulation failed. Please try again or select a different backend.',
      QUOTA_EXCEEDED: 'API quota exceeded. Please wait before making more requests.',
      BACKEND_UNAVAILABLE: 'Selected backend is currently unavailable. Please choose another backend.'
    },
    
    QISKIT: {
      CODE_GENERATION_FAILED: 'Failed to generate Qiskit code. Please check your circuit.',
      INVALID_BACKEND: 'Selected Qiskit backend is not available.',
      JOB_FAILED: 'Qiskit job execution failed. Please try again.'
    }
  };
  
  // Success messages
  export const SUCCESS_MESSAGES = {
    SIMULATION: {
      COMPLETED: 'Simulation completed successfully!',
      CODE_GENERATED: 'Qiskit code generated successfully!',
      CIRCUIT_VALIDATED: 'Circuit validation passed.'
    },
    
    API: {
      CONNECTED: 'Successfully connected to Qiskit backend.',
      BACKENDS_LOADED: 'Available backends loaded successfully.'
    }
  };
  
  // Development and debugging
  export const DEBUG_CONFIG = {
    // Enable debug logging
    ENABLE_LOGGING: process.env.NODE_ENV === 'development',
    
    // Log levels
    LOG_LEVELS: {
      ERROR: 'error',
      WARN: 'warn',
      INFO: 'info',
      DEBUG: 'debug'
    },
    
    // Mock data for development
    MOCK_BACKENDS: [
      { 
        name: 'simulator', 
        type: 'simulator', 
        description: 'Local quantum simulator',
        maxQubits: 32,
        available: true
      },
      { 
        name: 'ibmq_qasm_simulator', 
        type: 'simulator', 
        description: 'IBM QASM Simulator',
        maxQubits: 32,
        available: true
      },
      { 
        name: 'ibmq_manila', 
        type: 'real_device', 
        description: 'IBM Manila (5 qubits)',
        maxQubits: 5,
        available: false
      },
      { 
        name: 'ibmq_belem', 
        type: 'real_device', 
        description: 'IBM Belem (5 qubits)',
        maxQubits: 5,
        available: true
      }
    ],
    
    // Enable mock mode when API is unavailable
    ENABLE_MOCK_MODE: true
  };
  
  // Cache configuration
  export const CACHE_CONFIG = {
    // Cache durations (in milliseconds)
    BACKENDS_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    RESULTS_CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
    
    // Cache keys
    CACHE_KEYS: {
      BACKENDS: 'qiskit_backends',
      USER_PREFERENCES: 'user_preferences',
      RECENT_CIRCUITS: 'recent_circuits'
    },
    
    // Maximum cache size
    MAX_CACHE_SIZE: 50 // Maximum number of cached items
  };