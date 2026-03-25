// src/hooks/useQiskitIntegration.js
import { useState, useEffect, useCallback } from 'react';
import { QiskitService } from '../services/qiskit/QiskitService';

/**
 * Custom hook for Qiskit integration
 * Handles Qiskit backend management, code generation, and simulation
 */
export const useQiskitIntegration = () => {
  const [useQiskit, setUseQiskit] = useState(false);
  const [backends, setBackends] = useState([]);
  const [selectedBackend, setSelectedBackend] = useState('simulator');
  const [qiskitCode, setQiskitCode] = useState('');
  const [qiskitResults, setQiskitResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize backends on mount
  useEffect(() => {
    fetchBackends();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Fetch available Qiskit backends
   */
  const fetchBackends = useCallback(async () => {
    try {
      const availableBackends = await QiskitService.getBackends();
      setBackends(availableBackends);
    } catch (err) {
      console.warn('Using mock backends:', err);
      // Mock backends if API is not available
      setBackends([
        { name: 'simulator', type: 'simulator', description: 'Local simulator' },
        { name: 'ibmq_qasm_simulator', type: 'simulator', description: 'IBM QASM Simulator' },
        { name: 'ibmq_manila', type: 'real', description: 'IBM Manila (5 qubits)' },
        { name: 'ibmq_belem', type: 'real', description: 'IBM Belem (5 qubits)' }
      ]);
    }
  }, []);

  /**
   * Generate Qiskit Python code for the current circuit
   * @param {Array} circuit - Circuit representation
   * @param {number} numQubits - Number of qubits
   * @param {Array} initialStates - Initial states of qubits
   */
  const generateCode = useCallback(async (circuit, numQubits, initialStates) => {
    try {
      const code = QiskitService.generatePythonCode(circuit, numQubits, initialStates);
      setQiskitCode(code);
      return code;
    } catch (err) {
      setError('Failed to generate Qiskit code: ' + err.message);
      return null;
    }
  }, []);

  /**
   * Run simulation using Qiskit
   * @param {Array} circuit - Circuit representation
   * @param {number} numQubits - Number of qubits
   * @param {Array} initialStates - Initial states of qubits
   * @param {Object} options - Simulation options
   */
  const runQiskitSimulation = useCallback(async (circuit, numQubits, initialStates, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate code first
      await generateCode(circuit, numQubits, initialStates);
      
      // Convert circuit to Qiskit format
      const qiskitCircuitData = QiskitService.convertToQiskitFormat(
        circuit, 
        numQubits, 
        initialStates
      );
      
      // Run simulation
      const results = await QiskitService.runSimulation(qiskitCircuitData, {
        backend: selectedBackend,
        shots: options.shots || 1024,
        ...options
      });
      
      setQiskitResults(results);
      return results;
      
    } catch (err) {
      console.error('Qiskit simulation error:', err);
      setError('Qiskit simulation failed: ' + err.message);
      
      // Try mock simulation as fallback
      try {
        const mockResults = QiskitService.mockSimulation(
          QiskitService.convertToQiskitFormat(circuit, numQubits, initialStates),
          { shots: options.shots || 1024 }
        );
        setQiskitResults(mockResults);
        return mockResults;
      } catch (mockErr) {
        console.error('Mock simulation also failed:', mockErr);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedBackend, generateCode]);

  /**
   * Clear Qiskit results and code
   */
  const clearResults = useCallback(() => {
    setQiskitResults(null);
    setQiskitCode('');
    setError(null);
  }, []);

  /**
   * Export Qiskit results
   * @returns {Object} Exportable Qiskit data
   */
  const exportResults = useCallback(() => {
    return {
      code: qiskitCode,
      results: qiskitResults,
      backend: selectedBackend,
      useQiskit,
      exportedAt: new Date().toISOString()
    };
  }, [qiskitCode, qiskitResults, selectedBackend, useQiskit]);

  /**
   * Test connection to Qiskit backend
   * @returns {boolean} True if connection successful
   */
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      const backends = await QiskitService.getBackends();
      return backends.length > 0;
    } catch (err) {
      setError('Connection test failed: ' + err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get backend information
   * @param {string} backendName - Name of the backend
   * @returns {Object|null} Backend information
   */
  const getBackendInfo = useCallback((backendName) => {
    return backends.find(backend => backend.name === backendName) || null;
  }, [backends]);

  /**
   * Validate circuit for Qiskit compatibility
   * @param {Array} circuit - Circuit representation
   * @param {number} numQubits - Number of qubits
   * @returns {Object} Validation result
   */
  const validateForQiskit = useCallback((circuit, numQubits) => {
    const errors = [];
    const warnings = [];

    // Check number of qubits against backend limits
    const backendInfo = getBackendInfo(selectedBackend);
    if (backendInfo && backendInfo.maxQubits && numQubits > backendInfo.maxQubits) {
      errors.push(`Circuit has ${numQubits} qubits, but ${selectedBackend} supports max ${backendInfo.maxQubits}`);
    }

    // Check for unsupported gates
    const supportedGates = ['h', 'x', 'y', 'z', 's', 't', 'cx', 'cz', 'swap', 'measure'];
    for (let row = 0; row < circuit.length; row++) {
      for (let col = 0; col < circuit[row].length; col++) {
        const cell = circuit[row][col];
        if (cell.gate && !supportedGates.includes(cell.gate.id)) {
          warnings.push(`Gate ${cell.gate.id} at position (${row}, ${col}) may not be supported`);
        }
      }
    }

    // Check circuit depth for real hardware
    if (backendInfo && backendInfo.type === 'real') {
      const depth = Math.max(...circuit.map(row => 
        row.findLastIndex(cell => cell.gate !== null) + 1
      ));
      if (depth > 100) {
        warnings.push(`Circuit depth (${depth}) may be too deep for real hardware`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [selectedBackend, getBackendInfo]);

  return {
    // State
    useQiskit,
    backends,
    selectedBackend,
    qiskitCode,
    qiskitResults,
    isLoading,
    error,

    // Actions
    setUseQiskit,
    setSelectedBackend,
    generateCode,
    runQiskitSimulation,
    clearResults,
    testConnection,

    // Utilities
    exportResults,
    getBackendInfo,
    validateForQiskit,
    hasResults: !!qiskitResults
  };
};