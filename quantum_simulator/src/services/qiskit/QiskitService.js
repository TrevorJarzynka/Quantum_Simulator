// src/services/qiskit/QiskitService.js
import { QISKIT_GATE_MAPPING } from '../../constants/gates';

/**
 * Qiskit integration service
 * Handles communication with Qiskit backend and code generation
 */
export class QiskitService {
  static API_URL = process.env.REACT_APP_QISKIT_API_URL || 'http://localhost:5000/api/qiskit';

  /**
   * Get available Qiskit backends
   * @returns {Promise<Array>} Available backends
   */
  static async getBackends() {
    try {
      const response = await fetch(`${this.API_URL}/backends`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const backends = await response.json();
      return backends;
    } catch (error) {
      console.error('Error fetching Qiskit backends:', error);
      throw error;
    }
  }

  /**
   * Convert circuit to Qiskit format
   * @param {Array} circuit - Circuit representation
   * @param {number} numQubits - Number of qubits
   * @param {Array} initialStates - Initial states
   * @returns {Object} Qiskit circuit data
   */
  static convertToQiskitFormat(circuit, numQubits, initialStates) {
    const qiskitCircuitData = {
      numQubits,
      initialStates: initialStates.map(state => state.value),
      gates: []
    };
    
    // Process each column (time step) of the circuit
    for (let col = 0; col < circuit[0].length; col++) {
      // First process single-qubit gates
      for (let row = 0; row < numQubits; row++) {
        const cell = circuit[row][col];
        if (cell.gate && !cell.gate.control && !cell.gate.target) {
          qiskitCircuitData.gates.push({
            name: QISKIT_GATE_MAPPING[cell.gate.id] || cell.gate.id,
            qubits: [row],
            position: col
          });
        }
      }
      
      // Then process multi-qubit gates
      const processedPairs = new Set();
      for (let row = 0; row < numQubits; row++) {
        const cell = circuit[row][col];
        if (cell.gate && cell.gate.control) {
          // Find the target qubit
          for (let targetRow = 0; targetRow < numQubits; targetRow++) {
            const targetCell = circuit[targetRow][col];
            if (targetCell.gate && targetCell.gate.target && 
                targetCell.gate.id === cell.gate.id &&
                !processedPairs.has(`${row}-${targetRow}`)) {
              
              processedPairs.add(`${row}-${targetRow}`);
              processedPairs.add(`${targetRow}-${row}`);
              
              qiskitCircuitData.gates.push({
                name: QISKIT_GATE_MAPPING[cell.gate.id] || cell.gate.id,
                qubits: [row, targetRow], // control, target
                position: col
              });
              break;
            }
          }
        }
      }
    }
    
    return qiskitCircuitData;
  }

  /**
   * Run simulation on Qiskit backend
   * @param {Object} circuitData - Qiskit circuit data
   * @param {Object} options - Simulation options
   * @returns {Promise<Object>} Simulation results
   */
  static async runSimulation(circuitData, options = {}) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          circuit: circuitData,
          options: {
            backend: options.backend || 'simulator',
            shots: options.shots || 1024,
            ...options
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error running Qiskit simulation:', error);
      throw error;
    }
  }

  /**
   * Generate Python code using Qiskit
   * @param {Array} circuit - Circuit representation
   * @param {number} numQubits - Number of qubits
   * @param {Array} initialStates - Initial states
   * @returns {string} Python code
   */
  static generatePythonCode(circuit, numQubits, initialStates) {
    let pythonCode = `
from qiskit import QuantumCircuit, Aer, transpile, assemble
from qiskit.visualization import plot_histogram, plot_bloch_multivector
import numpy as np

# Create a Quantum Circuit with ${numQubits} qubits and classical bits
qc = QuantumCircuit(${numQubits}, ${numQubits})

# Initialize qubits based on initial states
`;

    // Initialize qubits
    for (let i = 0; i < numQubits; i++) {
      if (initialStates[i].value === '1') {
        pythonCode += `qc.x(${i})  # Initialize qubit ${i} to |1⟩\n`;
      }
    }
    
    pythonCode += '\n# Add gates to the circuit\n';
    
    // Process each column (time step) of the circuit
    for (let col = 0; col < circuit[0].length; col++) {
      let hasGatesInColumn = false;
      
      // First process single-qubit gates
      for (let row = 0; row < numQubits; row++) {
        const cell = circuit[row][col];
        if (cell.gate && !cell.gate.control && !cell.gate.target) {
          hasGatesInColumn = true;
          pythonCode += this.getQiskitPythonGate(cell.gate.id, row);
        }
      }
      
      // Then process multi-qubit gates
      const processedPairs = new Set();
      for (let row = 0; row < numQubits; row++) {
        const cell = circuit[row][col];
        if (cell.gate && cell.gate.control) {
          // Find the target qubit
          for (let targetRow = 0; targetRow < numQubits; targetRow++) {
            const targetCell = circuit[targetRow][col];
            if (targetCell.gate && targetCell.gate.target && 
                targetCell.gate.id === cell.gate.id &&
                !processedPairs.has(`${row}-${targetRow}`)) {
              
              hasGatesInColumn = true;
              processedPairs.add(`${row}-${targetRow}`);
              processedPairs.add(`${targetRow}-${row}`);
              
              pythonCode += this.getQiskitPythonControlGate(cell.gate.id, row, targetRow);
              break;
            }
          }
        }
      }
      
      if (hasGatesInColumn) {
        pythonCode += '\n';
      }
    }
    
    // Add code to run simulation and analyze results
    pythonCode += `
# Draw the circuit
print(qc)

# Execute the circuit on a statevector simulator
simulator = Aer.get_backend('statevector_simulator')
job = assemble(transpile(qc, simulator))
result = simulator.run(job).result()
statevector = result.get_statevector(qc)

# Print the state vector
print("State vector:")
print(statevector)

# Visualize the state vector
plot_bloch_multivector(statevector)

# Execute the circuit on a qasm simulator
simulator = Aer.get_backend('qasm_simulator')
job = assemble(transpile(qc, simulator), shots=1024)
result = simulator.run(job).result()
counts = result.get_counts(qc)

# Plot the results
plot_histogram(counts)
`;

    return pythonCode;
  }

  /**
   * Get Python code for single-qubit gate
   * @param {string} gateId - Gate ID
   * @param {number} qubit - Target qubit
   * @returns {string} Python code line
   */
  static getQiskitPythonGate(gateId, qubit) {
    switch (gateId) {
      case 'h':
        return `qc.h(${qubit})  # Hadamard gate on qubit ${qubit}\n`;
      case 'x':
        return `qc.x(${qubit})  # X gate on qubit ${qubit}\n`;
      case 'y':
        return `qc.y(${qubit})  # Y gate on qubit ${qubit}\n`;
      case 'z':
        return `qc.z(${qubit})  # Z gate on qubit ${qubit}\n`;
      case 's':
        return `qc.s(${qubit})  # S gate on qubit ${qubit}\n`;
      case 't':
        return `qc.t(${qubit})  # T gate on qubit ${qubit}\n`;
      case 'measure':
        return `qc.measure(${qubit}, ${qubit})  # Measure qubit ${qubit}\n`;
      default:
        return `# Unknown gate ${gateId} on qubit ${qubit}\n`;
    }
  }

  /**
   * Get Python code for controlled gate
   * @param {string} gateId - Gate ID
   * @param {number} controlQubit - Control qubit
   * @param {number} targetQubit - Target qubit
   * @returns {string} Python code line
   */
  static getQiskitPythonControlGate(gateId, controlQubit, targetQubit) {
    switch (gateId) {
      case 'cx':
        return `qc.cx(${controlQubit}, ${targetQubit})  # CNOT with control=${controlQubit}, target=${targetQubit}\n`;
      case 'cz':
        return `qc.cz(${controlQubit}, ${targetQubit})  # CZ with control=${controlQubit}, target=${targetQubit}\n`;
      case 'swap':
        return `qc.swap(${controlQubit}, ${targetQubit})  # SWAP qubits ${controlQubit} and ${targetQubit}\n`;
      case 'cp':
        return `qc.cp(np.pi/4, ${controlQubit}, ${targetQubit})  # Controlled-phase with control=${controlQubit}, target=${targetQubit}\n`;
      default:
        return `# Unknown controlled gate ${gateId} from qubit ${controlQubit} to ${targetQubit}\n`;
    }
  }

  /**
   * Mock simulation for development/fallback
   * @param {Object} circuitData - Circuit data
   * @param {Object} options - Options
   * @returns {Object} Mock results
   */
  static mockSimulation(circuitData, options = {}) {
    const numQubits = circuitData.numQubits;
    const size = Math.pow(2, numQubits);
    
    // Create state vector based on initial states
    const stateVector = Array(size).fill().map(() => ({ re: 0, im: 0 }));
    
    // Calculate initial state index
    let initialStateIdx = 0;
    circuitData.initialStates.forEach((state, idx) => {
      if (state === '1') {
        initialStateIdx |= (1 << idx);
      }
    });
    
    // Initialize initial state
    stateVector[initialStateIdx] = { re: 1, im: 0 };
    
    // Apply simple gate transformations
    for (const gate of circuitData.gates) {
      if (gate.name === 'h' && gate.qubits.length === 1) {
        // Simplified Hadamard simulation
        const qubit = gate.qubits[0];
        for (let i = 0; i < size; i++) {
          if ((i & (1 << qubit)) === 0) {
            const i1 = i | (1 << qubit);
            const temp0 = { ...stateVector[i] };
            const temp1 = { ...stateVector[i1] };
            
            stateVector[i] = {
              re: (temp0.re + temp1.re) / Math.sqrt(2),
              im: (temp0.im + temp1.im) / Math.sqrt(2)
            };
            
            stateVector[i1] = {
              re: (temp0.re - temp1.re) / Math.sqrt(2),
              im: (temp0.im - temp1.im) / Math.sqrt(2)
            };
          }
        }
      }
      // Add other gates as needed for mock simulation
    }
    
    // Generate probabilities and mock measurements
    const probabilities = stateVector.map(amplitude => 
      amplitude.re * amplitude.re + amplitude.im * amplitude.im
    );
    
    const shots = options.shots || 1024;
    const counts = {};
    
    for (let i = 0; i < size; i++) {
      if (probabilities[i] > 0.001) {
        const binary = i.toString(2).padStart(numQubits, '0');
        counts[binary] = Math.round(probabilities[i] * shots);
      }
    }
    
    return {
      statevector: stateVector,
      counts,
      probabilities,
      backend: 'mock_simulator',
      shots
    };
  }
}