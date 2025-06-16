// src/services/quantumSimulation/QuantumSimulator.js
import { GATE_MATRICES } from '../../constants/gates';
import { ComplexMath } from '../../utils/math/ComplexNumbers';

/**
 * Quantum Circuit Simulator Service
 * Handles quantum state evolution and gate operations
 */
export class QuantumSimulator {
  constructor() {
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  /**
   * Create initial quantum state based on qubit initial values
   * @param {number} numQubits - Number of qubits
   * @param {Array} initialStates - Array of initial states for each qubit
   * @returns {Array} Initial state vector
   */
  createInitialState(numQubits, initialStates) {
    const size = Math.pow(2, numQubits);
    const state = Array(size).fill().map(() => ({ re: 0, im: 0 }));
    
    // Calculate the integer value of the basis state from qubit values
    let basisStateIndex = 0;
    for (let i = 0; i < numQubits; i++) {
      if (initialStates[i]?.value === '1') {
        basisStateIndex |= (1 << i);
      }
    }
    
    // Set the amplitude of the basis state
    state[basisStateIndex] = { re: 1, im: 0 };
    
    return state;
  }

  /**
   * Apply a single-qubit gate using matrix multiplication
   * @param {Array} state - Current quantum state
   * @param {Array} gateMatrix - 2x2 gate matrix
   * @param {number} qubit - Target qubit index
   * @param {number} numQubits - Total number of qubits
   */
  applySingleQubitGate(state, gateMatrix, qubit, numQubits) {
    const size = Math.pow(2, numQubits);
    const newState = Array(size).fill().map(() => ({ re: 0, im: 0 }));
    
    // For each basis state in the state vector
    for (let i = 0; i < size; i++) {
      // Determine if the qubit is 0 or 1 in this basis state
      const qubitValue = (i >> qubit) & 1;
      
      // Calculate the index with the qubit flipped
      const flippedIndex = i ^ (1 << qubit);
      
      // Calculate the contributions to the new amplitudes
      if (qubitValue === 0) {
        // |...0...⟩ maps to gateMatrix[0][0]|...0...⟩ + gateMatrix[0][1]|...1...⟩
        newState[i] = ComplexMath.add(
          newState[i], 
          ComplexMath.multiply(gateMatrix[0][0], state[i])
        );
        newState[flippedIndex] = ComplexMath.add(
          newState[flippedIndex], 
          ComplexMath.multiply(gateMatrix[0][1], state[i])
        );
      } else {
        // |...1...⟩ maps to gateMatrix[1][0]|...0...⟩ + gateMatrix[1][1]|...1...⟩
        newState[flippedIndex] = ComplexMath.add(
          newState[flippedIndex], 
          ComplexMath.multiply(gateMatrix[1][0], state[i])
        );
        newState[i] = ComplexMath.add(
          newState[i], 
          ComplexMath.multiply(gateMatrix[1][1], state[i])
        );
      }
    }
    
    // Copy the new state back to the original state array
    for (let i = 0; i < size; i++) {
      state[i] = newState[i];
    }
  }

  /**
   * Apply a controlled gate operation
   * @param {Array} state - Current quantum state
   * @param {Array} gateMatrix - 2x2 gate matrix for target qubit
   * @param {number} controlQubit - Control qubit index
   * @param {number} targetQubit - Target qubit index
   * @param {number} numQubits - Total number of qubits
   */
  applyControlledGate(state, gateMatrix, controlQubit, targetQubit, numQubits) {
    const size = Math.pow(2, numQubits);
    const newState = [...state];
    
    for (let i = 0; i < size; i++) {
      // Check if control qubit is 1
      const controlValue = (i >> controlQubit) & 1;
      
      if (controlValue === 1) {
        // Apply gate to target qubit
        const targetValue = (i >> targetQubit) & 1;
        const flippedIndex = i ^ (1 << targetQubit);
        
        if (targetValue === 0) {
          const temp = { ...state[i] };
          newState[i] = ComplexMath.add(
            ComplexMath.multiply(gateMatrix[0][0], temp),
            ComplexMath.multiply(gateMatrix[0][1], state[flippedIndex])
          );
          newState[flippedIndex] = ComplexMath.add(
            ComplexMath.multiply(gateMatrix[1][0], temp),
            ComplexMath.multiply(gateMatrix[1][1], state[flippedIndex])
          );
        }
      }
    }
    
    // Copy back to original state
    for (let i = 0; i < size; i++) {
      state[i] = newState[i];
    }
  }

  /**
   * Apply a SWAP gate between two qubits
   * @param {Array} state - Current quantum state
   * @param {number} qubit1 - First qubit
   * @param {number} qubit2 - Second qubit
   * @param {number} numQubits - Total number of qubits
   */
  applySwapGate(state, qubit1, qubit2, numQubits) {
    const size = Math.pow(2, numQubits);
    const newState = [...state];
    
    for (let i = 0; i < size; i++) {
      const bit1 = (i >> qubit1) & 1;
      const bit2 = (i >> qubit2) & 1;
      
      if (bit1 !== bit2) {
        // Swap the amplitudes
        const swappedIndex = i ^ (1 << qubit1) ^ (1 << qubit2);
        newState[swappedIndex] = state[i];
      }
    }
    
    // Copy back to original state
    for (let i = 0; i < size; i++) {
      state[i] = newState[i];
    }
  }

  /**
   * Process gates in a column and apply them to the state
   * @param {Array} state - Current quantum state
   * @param {Array} gates - Gates to apply in this step
   * @param {number} numQubits - Total number of qubits
   * @returns {Array} Descriptions of applied gates
   */
  applyGatesInColumn(state, gates, numQubits) {
    const gateDescriptions = [];
    
    // First apply single-qubit gates
    const singleQubitGates = gates.filter(g => !g.gate.control && !g.gate.target);
    for (const { qubit, gate } of singleQubitGates) {
      if (GATE_MATRICES[gate.id]) {
        this.applySingleQubitGate(state, GATE_MATRICES[gate.id], qubit, numQubits);
        gateDescriptions.push(`${gate.name} gate to qubit ${qubit}`);
        
        if (this.debugMode) {
          console.log(`Applied ${gate.id} to qubit ${qubit}`);
        }
      }
    }
    
    // Then apply multi-qubit gates
    const multiQubitGates = gates.filter(g => g.gate.control || g.gate.target);
    const processedPairs = new Set();
    
    for (const { qubit, gate } of multiQubitGates) {
      if (gate.control) {
        // Find corresponding target
        const targetGate = multiQubitGates.find(g => 
          g.gate.target && g.gate.id === gate.id && g.qubit !== qubit
        );
        
        if (targetGate && !processedPairs.has(`${qubit}-${targetGate.qubit}`)) {
          processedPairs.add(`${qubit}-${targetGate.qubit}`);
          processedPairs.add(`${targetGate.qubit}-${qubit}`);
          
          if (gate.id === 'swap') {
            this.applySwapGate(state, qubit, targetGate.qubit, numQubits);
            gateDescriptions.push(`SWAP between qubits ${qubit} and ${targetGate.qubit}`);
          } else if (gate.id === 'cx') {
            this.applyControlledGate(state, GATE_MATRICES.x, qubit, targetGate.qubit, numQubits);
            gateDescriptions.push(`CNOT with control=${qubit}, target=${targetGate.qubit}`);
          } else if (gate.id === 'cz') {
            this.applyControlledGate(state, GATE_MATRICES.z, qubit, targetGate.qubit, numQubits);
            gateDescriptions.push(`CZ with control=${qubit}, target=${targetGate.qubit}`);
          }
          
          if (this.debugMode) {
            console.log(`Applied ${gate.id} from qubit ${qubit} to ${targetGate.qubit}`);
          }
        }
      }
    }
    
    return gateDescriptions;
  }

  /**
   * Simulate the entire quantum circuit
   * @param {Array} circuit - Circuit representation
   * @param {number} numQubits - Number of qubits
   * @param {Array} initialStates - Initial states of qubits
   * @param {number} maxDepth - Maximum circuit depth
   * @returns {Array} Array of simulation steps
   */
  simulate(circuit, numQubits, initialStates, maxDepth) {
    const initialState = this.createInitialState(numQubits, initialStates);
    const steps = [{ 
      step: 0, 
      state: initialState, 
      description: 'Initial state' 
    }];
    
    // Check if the circuit has any gates
    const hasAnyGates = circuit.some(row => 
      row.some(cell => cell.gate !== null)
    );
    
    if (!hasAnyGates) {
      return steps;
    }
    
    // Process each column (time step) of the circuit
    for (let col = 0; col < maxDepth; col++) {
      const gatesInColumn = [];
      
      // Collect all gates in this column
      for (let row = 0; row < numQubits; row++) {
        if (circuit[row][col].gate !== null) {
          gatesInColumn.push({
            qubit: row,
            gate: circuit[row][col].gate
          });
        }
      }
      
      if (gatesInColumn.length > 0) {
        // Create a copy of the previous state
        const currentState = JSON.parse(JSON.stringify(steps[steps.length - 1].state));
        
        // Apply all gates in this column
        const gateDescriptions = this.applyGatesInColumn(currentState, gatesInColumn, numQubits);
        
        // Create description
        const description = gateDescriptions.length > 0 
          ? `Applied ${gateDescriptions.join(', ')}`
          : 'No gates applied';
        
        // Add the new state to steps
        steps.push({
          step: steps.length,
          state: currentState,
          description
        });
      }
    }
    
    return steps;
  }

  /**
   * Calculate measurement probabilities for the current state
   * @param {Array} state - Current quantum state
   * @returns {Array} Probabilities for each basis state
   */
  calculateProbabilities(state) {
    return state.map(amplitude => 
      ComplexMath.magnitude(amplitude) ** 2
    );
  }

  /**
   * Perform a measurement on a specific qubit
   * @param {Array} state - Current quantum state
   * @param {number} qubit - Qubit to measure
   * @param {number} numQubits - Total number of qubits
   * @returns {Object} Measurement result and collapsed state
   */
  measureQubit(state, qubit, numQubits) {
    const prob0 = state.reduce((sum, amplitude, idx) => {
      if ((idx & (1 << qubit)) === 0) {
        return sum + ComplexMath.magnitude(amplitude) ** 2;
      }
      return sum;
    }, 0);
    
    const measurementResult = Math.random() < prob0 ? 0 : 1;
    
    // Collapse the state
    const collapsedState = state.map((amplitude, idx) => {
      const qubitValue = (idx >> qubit) & 1;
      if (qubitValue === measurementResult) {
        const norm = measurementResult === 0 ? Math.sqrt(prob0) : Math.sqrt(1 - prob0);
        return ComplexMath.scale(amplitude, 1 / norm);
      }
      return { re: 0, im: 0 };
    });
    
    return {
      result: measurementResult,
      state: collapsedState,
      probability: measurementResult === 0 ? prob0 : 1 - prob0
    };
  }
}