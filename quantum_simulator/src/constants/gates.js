// src/constants/gates.js
/**
 * Gate definitions and configurations for the quantum circuit simulator
 */

export const GATE_TYPES = {
    SINGLE_QUBIT: 'single_qubit',
    MULTI_QUBIT: 'multi_qubit',
    MEASUREMENT: 'measurement'
  };
  
  export const GATE_CATEGORIES = [
    {
      title: "Single-Qubit Gates",
      type: GATE_TYPES.SINGLE_QUBIT,
      gates: [
        { 
          id: 'h', 
          name: 'H', 
          description: 'Hadamard', 
          color: '#3498db',
          tooltip: 'Creates superposition: |0⟩ → (|0⟩ + |1⟩)/√2'
        },
        { 
          id: 'x', 
          name: 'X', 
          description: 'Pauli-X', 
          color: '#e74c3c',
          tooltip: 'NOT gate: |0⟩ → |1⟩, |1⟩ → |0⟩'
        },
        { 
          id: 'y', 
          name: 'Y', 
          description: 'Pauli-Y', 
          color: '#2ecc71',
          tooltip: 'Y rotation: |0⟩ → i|1⟩, |1⟩ → -i|0⟩'
        },
        { 
          id: 'z', 
          name: 'Z', 
          description: 'Pauli-Z', 
          color: '#f39c12',
          tooltip: 'Phase flip: |0⟩ → |0⟩, |1⟩ → -|1⟩'
        },
        { 
          id: 's', 
          name: 'S', 
          description: 'Phase', 
          color: '#9b59b6',
          tooltip: 'Phase gate: |0⟩ → |0⟩, |1⟩ → i|1⟩'
        },
        { 
          id: 't', 
          name: 'T', 
          description: 'π/8', 
          color: '#e67e22',
          tooltip: 'T gate: |0⟩ → |0⟩, |1⟩ → e^(iπ/4)|1⟩'
        },
      ]
    },
    {
      title: "Multi-Qubit Gates",
      type: GATE_TYPES.MULTI_QUBIT,
      gates: [
        { 
          id: 'cx', 
          name: 'CX', 
          description: 'CNOT', 
          color: '#16a085', 
          control: true, 
          target: true,
          tooltip: 'Controlled-X: flips target if control is |1⟩'
        },
        { 
          id: 'cz', 
          name: 'CZ', 
          description: 'Controlled-Z', 
          color: '#8e44ad', 
          control: true, 
          target: true,
          tooltip: 'Controlled-Z: applies Z to target if control is |1⟩'
        },
        { 
          id: 'swap', 
          name: 'SW', 
          description: 'Swap', 
          color: '#d35400', 
          control: true, 
          target: true,
          tooltip: 'Swaps the states of two qubits'
        },
        { 
          id: 'cp', 
          name: 'CP', 
          description: 'Controlled-Phase', 
          color: '#27ae60', 
          control: true, 
          target: true,
          tooltip: 'Controlled phase: applies phase to target if control is |1⟩'
        },
      ]
    },
    {
      title: "Measurement",
      type: GATE_TYPES.MEASUREMENT,
      gates: [
        { 
          id: 'measure', 
          name: 'M', 
          description: 'Measure', 
          color: '#7f8c8d',
          tooltip: 'Measures qubit in computational basis'
        },
      ]
    }
  ];
  
  // Flatten all gates for easy lookup
  export const ALL_GATES = GATE_CATEGORIES.reduce((acc, category) => {
    return [...acc, ...category.gates];
  }, []);
  
  // Gate lookup by ID
  export const GATES_BY_ID = ALL_GATES.reduce((acc, gate) => {
    acc[gate.id] = gate;
    return acc;
  }, {});
  
  // Gate matrices for simulation
  export const GATE_MATRICES = {
    h: [
      [{ re: 1/Math.sqrt(2), im: 0 }, { re: 1/Math.sqrt(2), im: 0 }],
      [{ re: 1/Math.sqrt(2), im: 0 }, { re: -1/Math.sqrt(2), im: 0 }]
    ],
    x: [
      [{ re: 0, im: 0 }, { re: 1, im: 0 }],
      [{ re: 1, im: 0 }, { re: 0, im: 0 }]
    ],
    y: [
      [{ re: 0, im: 0 }, { re: 0, im: -1 }],
      [{ re: 0, im: 1 }, { re: 0, im: 0 }]
    ],
    z: [
      [{ re: 1, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: -1, im: 0 }]
    ],
    s: [
      [{ re: 1, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: 0, im: 1 }]
    ],
    t: [
      [{ re: 1, im: 0 }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: Math.cos(Math.PI/4), im: Math.sin(Math.PI/4) }]
    ]
  };
  
  export const QASM_GATE_MAPPING = {
    h: 'h',
    x: 'x', 
    y: 'y',
    z: 'z',
    s: 's',
    t: 't',
    cx: 'cx',
    cz: 'cz',
    swap: 'swap',
    cp: 'cp',
    measure: 'measure'
  };
  
  export const QISKIT_GATE_MAPPING = {
    h: 'h',
    x: 'x',
    y: 'y', 
    z: 'z',
    s: 's',
    t: 't',
    cx: 'cx',
    cz: 'cz',
    swap: 'swap',
    cp: 'cp',
    measure: 'measure'
  };