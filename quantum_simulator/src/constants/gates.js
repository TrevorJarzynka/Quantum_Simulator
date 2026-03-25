// src/constants/gates.js

export const GATE_TYPES = {
  SINGLE_QUBIT: 'single_qubit',
  MULTI_QUBIT: 'multi_qubit',
  MEASUREMENT: 'measurement'
};

export const GATE_CATEGORIES = [
  {
    title: "Pauli & Clifford",
    type: GATE_TYPES.SINGLE_QUBIT,
    gates: [
      { id: 'h',   name: 'H',  description: 'Hadamard',  color: '#3b82f6', tooltip: 'Creates equal superposition: |0⟩ → (|0⟩+|1⟩)/√2' },
      { id: 'x',   name: 'X',  description: 'Pauli-X',   color: '#ef4444', tooltip: 'Quantum NOT: |0⟩↔|1⟩' },
      { id: 'y',   name: 'Y',  description: 'Pauli-Y',   color: '#22c55e', tooltip: 'Y rotation: |0⟩→i|1⟩, |1⟩→-i|0⟩' },
      { id: 'z',   name: 'Z',  description: 'Pauli-Z',   color: '#f59e0b', tooltip: 'Phase flip: |1⟩→-|1⟩' },
      { id: 's',   name: 'S',  description: 'Phase (S)', color: '#a855f7', tooltip: 'S gate: |1⟩→i|1⟩' },
      { id: 'sdg', name: 'S†', description: 'S-dagger',  color: '#7c3aed', tooltip: 'S† gate: inverse of S, |1⟩→-i|1⟩' },
      { id: 't',   name: 'T',  description: 'T (π/8)',   color: '#f97316', tooltip: 'T gate: |1⟩→e^(iπ/4)|1⟩' },
      { id: 'tdg', name: 'T†', description: 'T-dagger',  color: '#c2410c', tooltip: 'T† gate: inverse of T' },
      { id: 'sx',  name: '√X', description: '√X gate',   color: '#0891b2', tooltip: 'Square root of X: half NOT' },
    ]
  },
  {
    title: "Rotation Gates",
    type: GATE_TYPES.SINGLE_QUBIT,
    gates: [
      { id: 'rx', name: 'Rx', description: 'X-Rotation', color: '#dc2626', tooltip: 'Rotate about X-axis by θ', parametric: true, defaultAngle: Math.PI / 2 },
      { id: 'ry', name: 'Ry', description: 'Y-Rotation', color: '#16a34a', tooltip: 'Rotate about Y-axis by θ', parametric: true, defaultAngle: Math.PI / 2 },
      { id: 'rz', name: 'Rz', description: 'Z-Rotation', color: '#ca8a04', tooltip: 'Rotate about Z-axis by θ', parametric: true, defaultAngle: Math.PI / 2 },
    ]
  },
  {
    title: "Multi-Qubit Gates",
    type: GATE_TYPES.MULTI_QUBIT,
    gates: [
      { id: 'cx',   name: 'CX', description: 'CNOT',           color: '#0d9488', control: true, target: true, tooltip: 'Controlled-X: flip target if control=|1⟩' },
      { id: 'cz',   name: 'CZ', description: 'Controlled-Z',   color: '#7c3aed', control: true, target: true, tooltip: 'Controlled-Z: phase flip if control=|1⟩' },
      { id: 'swap', name: 'SW', description: 'SWAP',           color: '#d97706', control: true, target: true, tooltip: 'Swap two qubit states' },
      { id: 'cp',   name: 'CP', description: 'Ctrl-Phase',     color: '#059669', control: true, target: true, tooltip: 'Controlled phase shift' },
      { id: 'cy',   name: 'CY', description: 'Controlled-Y',   color: '#be185d', control: true, target: true, tooltip: 'Controlled-Y gate' },
      { id: 'ch',   name: 'CH', description: 'Controlled-H',   color: '#1d4ed8', control: true, target: true, tooltip: 'Controlled-Hadamard' },
    ]
  },
  {
    title: "Measurement",
    type: GATE_TYPES.MEASUREMENT,
    gates: [
      { id: 'measure', name: 'M', description: 'Measure', color: '#64748b', tooltip: 'Measure in computational basis' },
    ]
  }
];

export const ALL_GATES = GATE_CATEGORIES.reduce((acc, cat) => [...acc, ...cat.gates], []);

export const GATES_BY_ID = ALL_GATES.reduce((acc, gate) => {
  acc[gate.id] = gate;
  return acc;
}, {});

// Static gate matrices (non-parametric)
export const GATE_MATRICES = {
  h: [
    [{ re: 1 / Math.sqrt(2), im: 0 }, { re: 1 / Math.sqrt(2), im: 0 }],
    [{ re: 1 / Math.sqrt(2), im: 0 }, { re: -1 / Math.sqrt(2), im: 0 }]
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
  sdg: [
    [{ re: 1, im: 0 }, { re: 0, im: 0 }],
    [{ re: 0, im: 0 }, { re: 0, im: -1 }]
  ],
  t: [
    [{ re: 1, im: 0 }, { re: 0, im: 0 }],
    [{ re: 0, im: 0 }, { re: Math.cos(Math.PI / 4), im: Math.sin(Math.PI / 4) }]
  ],
  tdg: [
    [{ re: 1, im: 0 }, { re: 0, im: 0 }],
    [{ re: 0, im: 0 }, { re: Math.cos(Math.PI / 4), im: -Math.sin(Math.PI / 4) }]
  ],
  sx: [
    [{ re: 0.5, im: 0.5 }, { re: 0.5, im: -0.5 }],
    [{ re: 0.5, im: -0.5 }, { re: 0.5, im: 0.5 }]
  ],
};

// Compute matrix for rotation gates given angle in radians
export const getRotationMatrix = (gateId, angle) => {
  const c = Math.cos(angle / 2);
  const s = Math.sin(angle / 2);
  switch (gateId) {
    case 'rx': return [
      [{ re: c, im: 0 }, { re: 0, im: -s }],
      [{ re: 0, im: -s }, { re: c, im: 0 }]
    ];
    case 'ry': return [
      [{ re: c, im: 0 }, { re: -s, im: 0 }],
      [{ re: s, im: 0 }, { re: c, im: 0 }]
    ];
    case 'rz': return [
      [{ re: Math.cos(angle / 2), im: -Math.sin(angle / 2) }, { re: 0, im: 0 }],
      [{ re: 0, im: 0 }, { re: Math.cos(angle / 2), im: Math.sin(angle / 2) }]
    ];
    default: return GATE_MATRICES[gateId];
  }
};

export const QASM_GATE_MAPPING = {
  h: 'h', x: 'x', y: 'y', z: 'z',
  s: 's', sdg: 'sdg', t: 't', tdg: 'tdg', sx: 'sx',
  rx: 'rx', ry: 'ry', rz: 'rz',
  cx: 'cx', cz: 'cz', cy: 'cy', ch: 'ch', swap: 'swap', cp: 'cp',
  measure: 'measure'
};

export const QISKIT_GATE_MAPPING = {
  h: 'h', x: 'x', y: 'y', z: 'z',
  s: 's', sdg: 'sdg', t: 't', tdg: 'tdg', sx: 'sx',
  rx: 'rx', ry: 'ry', rz: 'rz',
  cx: 'cx', cz: 'cz', cy: 'cy', ch: 'ch', swap: 'swap', cp: 'cp',
  measure: 'measure'
};
