// src/hooks/useCircuitState.js
import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing quantum circuit state
 * Handles circuit creation, gate placement, and state management
 */
export const useCircuitState = (numQubits = 3, maxDepth = 10) => {
  const [circuit, setCircuit] = useState([]);
  const [selectedGate, setSelectedGate] = useState(null);
  const [initialStates, setInitialStates] = useState([]);

  // Initialize circuit when parameters change
  useEffect(() => {
    initializeCircuit();
  }, [numQubits, maxDepth]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Initialize empty circuit and default initial states
   */
  const initializeCircuit = useCallback(() => {
    const newCircuit = Array(numQubits).fill().map(() => 
      Array(maxDepth).fill().map(() => ({ gate: null }))
    );
    setCircuit(newCircuit);
    
    // Initialize all qubits to |0⟩ state
    const newInitialStates = Array(numQubits).fill().map(() => ({ 
      value: '0',  // Default to |0⟩ state
      phase: 0     // No additional phase
    }));
    setInitialStates(newInitialStates);
  }, [numQubits, maxDepth]);

  /**
   * Place a gate at specified position
   * @param {number} row - Qubit index
   * @param {number} col - Time step index
   * @param {Object} gate - Gate object to place
   */
  const placeGate = useCallback((row, col, gate) => {
    setCircuit(prevCircuit => {
      const newCircuit = prevCircuit.map(row => [...row]);
      
      // Handle multi-qubit gates
      if (gate.control || gate.target) {
        // For multi-qubit gates, we need to handle placement logic
        // This is a simplified version - in a full implementation,
        // you'd want more sophisticated multi-qubit gate placement
        newCircuit[row][col] = { gate: { ...gate, control: gate.control } };
      } else {
        // Single qubit gate
        newCircuit[row][col] = { gate };
      }
      
      return newCircuit;
    });
  }, []);

  /**
   * Remove a gate from specified position
   * @param {number} row - Qubit index
   * @param {number} col - Time step index
   */
  const removeGate = useCallback((row, col) => {
    setCircuit(prevCircuit => {
      const newCircuit = prevCircuit.map(row => [...row]);
      newCircuit[row][col] = { gate: null };
      return newCircuit;
    });
  }, []);

  /**
   * Clear the entire circuit
   */
  const clearCircuit = useCallback(() => {
    initializeCircuit();
  }, [initializeCircuit]);

  /**
   * Handle cell click in circuit editor
   * @param {number} row - Qubit index
   * @param {number} col - Time step index
   */
  const handleCellClick = useCallback((row, col) => {
    if (selectedGate) {
      placeGate(row, col, selectedGate);
    }
  }, [selectedGate, placeGate]);

  /**
   * Update initial state of a specific qubit
   * @param {number} qubitIndex - Index of the qubit
   * @param {Object} newState - New state object {value, phase}
   */
  const updateInitialState = useCallback((qubitIndex, newState) => {
    setInitialStates(prevStates => {
      const newStates = [...prevStates];
      newStates[qubitIndex] = newState;
      return newStates;
    });
  }, []);

  /**
   * Check if circuit has any gates
   * @returns {boolean} True if circuit has gates
   */
  const hasGates = useCallback(() => {
    return circuit.some(row => 
      row.some(cell => cell.gate !== null)
    );
  }, [circuit]);

  /**
   * Get gates in a specific column
   * @param {number} col - Column index
   * @returns {Array} Array of gates in the column
   */
  const getGatesInColumn = useCallback((col) => {
    const gates = [];
    for (let row = 0; row < numQubits; row++) {
      if (circuit[row] && circuit[row][col] && circuit[row][col].gate) {
        gates.push({
          qubit: row,
          gate: circuit[row][col].gate
        });
      }
    }
    return gates;
  }, [circuit, numQubits]);

  /**
   * Validate circuit for common issues
   * @returns {Object} Validation result {isValid, errors}
   */
  const validateCircuit = useCallback(() => {
    const errors = [];
    
    // Check for orphaned multi-qubit gates
    for (let col = 0; col < maxDepth; col++) {
      const gatesInColumn = getGatesInColumn(col);
      const controlGates = gatesInColumn.filter(g => g.gate.control);
      const targetGates = gatesInColumn.filter(g => g.gate.target);
      
      // Check if every control gate has a corresponding target
      for (const controlGate of controlGates) {
        const hasTarget = targetGates.some(targetGate => 
          targetGate.gate.id === controlGate.gate.id
        );
        if (!hasTarget) {
          errors.push(`Control gate ${controlGate.gate.name} at qubit ${controlGate.qubit}, column ${col} has no target`);
        }
      }
      
      // Check if every target gate has a corresponding control
      for (const targetGate of targetGates) {
        const hasControl = controlGates.some(controlGate => 
          controlGate.gate.id === targetGate.gate.id
        );
        if (!hasControl) {
          errors.push(`Target gate ${targetGate.gate.name} at qubit ${targetGate.qubit}, column ${col} has no control`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [circuit, maxDepth, getGatesInColumn]);

  /**
   * Export circuit to JSON format
   * @returns {Object} Circuit data as JSON
   */
  const exportCircuit = useCallback(() => {
    return {
      numQubits,
      maxDepth,
      initialStates,
      circuit: circuit.map(row => 
        row.map(cell => ({
          gate: cell.gate ? {
            id: cell.gate.id,
            name: cell.gate.name,
            description: cell.gate.description,
            color: cell.gate.color,
            control: cell.gate.control,
            target: cell.gate.target
          } : null
        }))
      ),
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }
    };
  }, [circuit, numQubits, maxDepth, initialStates]);

  /**
   * Import circuit from JSON format
   * @param {Object} circuitData - Circuit data to import
   */
  const importCircuit = useCallback((circuitData) => {
    if (circuitData.numQubits && circuitData.circuit) {
      setCircuit(circuitData.circuit);
      setInitialStates(circuitData.initialStates || []);
    }
  }, []);

  return {
    // State
    circuit,
    selectedGate,
    initialStates,
    
    // Actions
    setSelectedGate,
    placeGate,
    removeGate,
    clearCircuit,
    handleCellClick,
    updateInitialState,
    
    // Utilities
    hasGates,
    getGatesInColumn,
    validateCircuit,
    exportCircuit,
    importCircuit,
    
    // Circuit properties
    numQubits,
    maxDepth
  };
};