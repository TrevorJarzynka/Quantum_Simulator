// src/hooks/useQuantumSimulation.js
import { useState, useCallback, useRef } from 'react';
import { QuantumSimulator } from '../services/quantumSimulation/QuantumSimulator';

/**
 * Custom hook for managing quantum simulation
 * Handles simulation execution, step navigation, and results
 */
export const useQuantumSimulation = () => {
  const [simulationResults, setSimulationResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const simulatorRef = useRef(new QuantumSimulator());

  /**
   * Run quantum simulation
   * @param {Array} circuit - Circuit representation
   * @param {number} numQubits - Number of qubits
   * @param {Array} initialStates - Initial states of qubits
   * @param {number} maxDepth - Maximum circuit depth
   */
  const runSimulation = useCallback(async (circuit, numQubits, initialStates, maxDepth) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate the circuit
      const results = simulatorRef.current.simulate(circuit, numQubits, initialStates, maxDepth);
      
      setSimulationResults(results);
      setCurrentStep(0);
      
      return results;
    } catch (err) {
      console.error('Simulation error:', err);
      setError(err.message || 'Simulation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear simulation results
   */
  const clearResults = useCallback(() => {
    setSimulationResults(null);
    setCurrentStep(0);
    setError(null);
  }, []);

  /**
   * Step backward in simulation
   */
  const stepBack = useCallback(() => {
    if (simulationResults && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [simulationResults, currentStep]);

  /**
   * Step forward in simulation
   */
  const stepForward = useCallback(() => {
    if (simulationResults && currentStep < simulationResults.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [simulationResults, currentStep]);

  /**
   * Jump to a specific step
   * @param {number} step - Step number to jump to
   */
  const jumpToStep = useCallback((step) => {
    if (simulationResults && step >= 0 && step < simulationResults.length) {
      setCurrentStep(step);
    }
  }, [simulationResults]);

  /**
   * Get current state data
   * @returns {Object|null} Current state data or null if no results
   */
  const getCurrentState = useCallback(() => {
    if (simulationResults && simulationResults[currentStep]) {
      return simulationResults[currentStep];
    }
    return null;
  }, [simulationResults, currentStep]);

  /**
   * Calculate probabilities for current state
   * @returns {Array|null} Probabilities array or null if no results
   */
  const getCurrentProbabilities = useCallback(() => {
    const currentState = getCurrentState();
    if (currentState) {
      return simulatorRef.current.calculateProbabilities(currentState.state);
    }
    return null;
  }, [getCurrentState]);

  /**
   * Perform measurement on a specific qubit for current state
   * @param {number} qubit - Qubit to measure
   * @param {number} numQubits - Total number of qubits
   * @returns {Object|null} Measurement result or null if no results
   */
  const measureQubit = useCallback((qubit, numQubits) => {
    const currentState = getCurrentState();
    if (currentState) {
      return simulatorRef.current.measureQubit(currentState.state, qubit, numQubits);
    }
    return null;
  }, [getCurrentState]);

  /**
   * Get simulation statistics
   * @returns {Object} Statistics object
   */
  const getStatistics = useCallback(() => {
    if (!simulationResults) {
      return {
        totalSteps: 0,
        hasEntanglement: false,
        maxProbability: 0,
        stateComplexity: 0
      };
    }

    const currentState = getCurrentState();
    if (!currentState) {
      return {
        totalSteps: simulationResults.length,
        hasEntanglement: false,
        maxProbability: 0,
        stateComplexity: 0
      };
    }

    const probabilities = getCurrentProbabilities();
    const nonZeroStates = probabilities.filter(p => p > 0.001);
    
    return {
      totalSteps: simulationResults.length,
      currentStep: currentStep,
      hasEntanglement: nonZeroStates.length > 1,
      maxProbability: Math.max(...probabilities),
      stateComplexity: nonZeroStates.length,
      probabilities
    };
  }, [simulationResults, currentStep, getCurrentState, getCurrentProbabilities]);

  /**
   * Export simulation results
   * @returns {Object} Exportable simulation data
   */
  const exportResults = useCallback(() => {
    if (!simulationResults) return null;

    return {
      results: simulationResults,
      currentStep,
      statistics: getStatistics(),
      exportedAt: new Date().toISOString()
    };
  }, [simulationResults, currentStep, getStatistics]);

  /**
   * Check if simulation can step in given direction
   * @param {string} direction - 'forward' or 'backward'
   * @returns {boolean} True if step is possible
   */
  const canStep = useCallback((direction) => {
    if (!simulationResults) return false;
    
    if (direction === 'forward') {
      return currentStep < simulationResults.length - 1;
    } else if (direction === 'backward') {
      return currentStep > 0;
    }
    
    return false;
  }, [simulationResults, currentStep]);

  /**
   * Get step information
   * @returns {Object} Step information
   */
  const getStepInfo = useCallback(() => {
    if (!simulationResults) {
      return {
        current: 0,
        total: 0,
        canStepBack: false,
        canStepForward: false
      };
    }

    return {
      current: currentStep,
      total: simulationResults.length - 1,
      canStepBack: canStep('backward'),
      canStepForward: canStep('forward')
    };
  }, [simulationResults, currentStep, canStep]);

  return {
    // State
    simulationResults,
    currentStep,
    isLoading,
    error,
    
    // Actions
    runSimulation,
    clearResults,
    stepBack,
    stepForward,
    jumpToStep,
    
    // Data access
    getCurrentState,
    getCurrentProbabilities,
    measureQubit,
    getStatistics,
    exportResults,
    
    // Utilities
    canStep,
    getStepInfo,
    hasResults: !!simulationResults
  };
};