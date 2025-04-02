// utils/CircuitConverter.js
/**
 * This file provides utilities to convert between our internal circuit representation
 * and various quantum computing frameworks like Qiskit, Cirq, and Q#
 */

/**
 * Converts our circuit to OpenQASM 2.0 format
 * @param {Array} circuit - Our circuit representation
 * @param {number} numQubits - Number of qubits
 * @returns {string} - OpenQASM 2.0 code
 */
export const convertToOpenQASM = (circuit, numQubits) => {
    try {
      let qasm = 'OPENQASM 2.0;\ninclude "qelib1.inc";\n\n';
      
      // Declare quantum and classical registers
      qasm += `qreg q[${numQubits}];\n`;
      qasm += `creg c[${numQubits}];\n\n`;
      
      // Process each column (time step) of the circuit
      for (let col = 0; col < circuit[0].length; col++) {
        // First process single-qubit gates
        for (let row = 0; row < numQubits; row++) {
          const cell = circuit[row][col];
          if (cell.gate && !cell.gate.control && !cell.gate.target) {
            qasm += getQASMGate(cell.gate.id, row);
          }
        }
        
        // Then process multi-qubit gates
        for (let row = 0; row < numQubits; row++) {
          const cell = circuit[row][col];
          if (cell.gate && cell.gate.control) {
            // Find the target qubit
            for (let targetRow = 0; targetRow < numQubits; targetRow++) {
              const targetCell = circuit[targetRow][col];
              if (targetCell.gate && targetCell.gate.target && 
                  targetCell.gate.id === cell.gate.id) {
                qasm += getQASMControlGate(cell.gate.id, row, targetRow);
                break;
              }
            }
          }
        }
        
        // Process measurements
        for (let row = 0; row < numQubits; row++) {
          const cell = circuit[row][col];
          if (cell.gate && cell.gate.id === 'measure') {
            qasm += `measure q[${row}] -> c[${row}];\n`;
          }
        }
      }
      
      return qasm;
    } catch (error) {
      console.error('Error converting to OpenQASM:', error);
      throw error;
    }
  };
  
  /**
   * Gets the QASM representation of a single-qubit gate
   * @param {string} gateId - Gate ID (h, x, y, z, etc.)
   * @param {number} qubit - Target qubit
   * @returns {string} - QASM gate string
   */
  const getQASMGate = (gateId, qubit) => {
    switch (gateId) {
      case 'h':
        return `h q[${qubit}];\n`;
      case 'x':
        return `x q[${qubit}];\n`;
      case 'y':
        return `y q[${qubit}];\n`;
      case 'z':
        return `z q[${qubit}];\n`;
      case 's':
        return `s q[${qubit}];\n`;
      case 't':
        return `t q[${qubit}];\n`;
      default:
        return `// Unknown gate ${gateId} on qubit ${qubit}\n`;
    }
  };
  
  /**
   * Gets the QASM representation of a controlled gate
   * @param {string} gateId - Gate ID (cx, cz, etc.)
   * @param {number} controlQubit - Control qubit
   * @param {number} targetQubit - Target qubit
   * @returns {string} - QASM gate string
   */
  const getQASMControlGate = (gateId, controlQubit, targetQubit) => {
    switch (gateId) {
      case 'cx':
        return `cx q[${controlQubit}], q[${targetQubit}];\n`;
      case 'cz':
        return `cz q[${controlQubit}], q[${targetQubit}];\n`;
      case 'swap':
        return `swap q[${controlQubit}], q[${targetQubit}];\n`;
      case 'cp':
        return `// Custom controlled-phase gate\ncp(pi/4) q[${controlQubit}], q[${targetQubit}];\n`;
      default:
        return `// Unknown controlled gate ${gateId} from ${controlQubit} to ${targetQubit}\n`;
    }
  };
  
  /**
   * Converts the circuit to Python code using Qiskit
   * @param {Array} circuit - Our circuit representation
   * @param {number} numQubits - Number of qubits
   * @returns {string} - Python code with Qiskit
   */
  export const convertToQiskitPython = (circuit, numQubits) => {
    try {
      let python = 'from qiskit import QuantumCircuit, Aer, execute\n';
      python += 'from qiskit.visualization import plot_histogram, plot_bloch_multivector\n\n';
      
      // Create circuit
      python += `# Create a Quantum Circuit with ${numQubits} qubits\n`;
      python += `circuit = QuantumCircuit(${numQubits}, ${numQubits})\n\n`;
      
      // Process each column (time step) of the circuit
      for (let col = 0; col < circuit[0].length; col++) {
        // First process single-qubit gates
        for (let row = 0; row < numQubits; row++) {
          const cell = circuit[row][col];
          if (cell.gate && !cell.gate.control && !cell.gate.target) {
            python += getPythonGate(cell.gate.id, row);
          }
        }
        
        // Then process multi-qubit gates
        for (let row = 0; row < numQubits; row++) {
          const cell = circuit[row][col];
          if (cell.gate && cell.gate.control) {
            // Find the target qubit
            for (let targetRow = 0; targetRow < numQubits; targetRow++) {
              const targetCell = circuit[targetRow][col];
              if (targetCell.gate && targetCell.gate.target && 
                  targetCell.gate.id === cell.gate.id) {
                python += getPythonControlGate(cell.gate.id, row, targetRow);
                break;
              }
            }
          }
        }
        
        // Process measurements
        for (let row = 0; row < numQubits; row++) {
          const cell = circuit[row][col];
          if (cell.gate && cell.gate.id === 'measure') {
            python += `circuit.measure(${row}, ${row})\n`;
          }
        }
      }
      
      // Add simulation code
      python += '\n# Simulate the circuit\n';
      python += 'simulator = Aer.get_backend("statevector_simulator")\n';
      python += 'job = execute(circuit, simulator)\n';
      python += 'result = job.result()\n';
      python += 'statevector = result.get_statevector()\n\n';
      
      // Add visualization code
      python += '# Print the state vector\n';
      python += 'print("State Vector:", statevector)\n\n';
      
      python += '# Visualize the state vector\n';
      python += 'plot_bloch_multivector(statevector)\n\n';
      
      python += '# Run on qasm simulator for measurement results\n';
      python += 'qasm_simulator = Aer.get_backend("qasm_simulator")\n';
      python += 'qasm_job = execute(circuit, qasm_simulator, shots=1024)\n';
      python += 'qasm_result = qasm_job.result()\n';
      python += 'counts = qasm_result.get_counts(circuit)\n';
      python += 'plot_histogram(counts)\n';
      
      return python;
    } catch (error) {
      console.error('Error converting to Python Qiskit:', error);
      throw error;
    }
  };
  
  /**
   * Gets the Python Qiskit representation of a single-qubit gate
   * @param {string} gateId - Gate ID (h, x, y, z, etc.)
   * @param {number} qubit - Target qubit
   * @returns {string} - Python Qiskit gate string
   */
  const getPythonGate = (gateId, qubit) => {
    switch (gateId) {
      case 'h':
        return `circuit.h(${qubit})\n`;
      case 'x':
        return `circuit.x(${qubit})\n`;
      case 'y':
        return `circuit.y(${qubit})\n`;
      case 'z':
        return `circuit.z(${qubit})\n`;
      case 's':
        return `circuit.s(${qubit})\n`;
      case 't':
        return `circuit.t(${qubit})\n`;
      default:
        return `# Unknown gate ${gateId} on qubit ${qubit}\n`;
    }
  };
  
  /**
   * Gets the Python Qiskit representation of a controlled gate
   * @param {string} gateId - Gate ID (cx, cz, etc.)
   * @param {number} controlQubit - Control qubit
   * @param {number} targetQubit - Target qubit
   * @returns {string} - Python Qiskit gate string
   */
  const getPythonControlGate = (gateId, controlQubit, targetQubit) => {
    switch (gateId) {
      case 'cx':
        return `circuit.cx(${controlQubit}, ${targetQubit})\n`;
      case 'cz':
        return `circuit.cz(${controlQubit}, ${targetQubit})\n`;
      case 'swap':
        return `circuit.swap(${controlQubit}, ${targetQubit})\n`;
      case 'cp':
        return `circuit.cp(3.14159/4, ${controlQubit}, ${targetQubit})  # pi/4\n`;
      default:
        return `# Unknown controlled gate ${gateId} from ${controlQubit} to ${targetQubit}\n`;
    }
  };