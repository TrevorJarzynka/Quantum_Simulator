// src/constants/presets.js
import { GATES_BY_ID } from './gates';

export const PRESETS = [
  {
    id: 'bell',
    label: 'Bell State Φ+',
    numQubits: 2,
    description: 'Maximally entangled |00⟩+|11⟩ / √2',
    gates: [
      { row: 0, col: 0, id: 'h' },
      { row: 0, col: 1, id: 'cx', isControl: true },
      { row: 1, col: 1, id: 'cx', isTarget: true },
    ]
  },
  {
    id: 'ghz',
    label: 'GHZ State',
    numQubits: 3,
    description: '3-qubit cat state (|000⟩+|111⟩)/√2',
    gates: [
      { row: 0, col: 0, id: 'h' },
      { row: 0, col: 1, id: 'cx', isControl: true },
      { row: 1, col: 1, id: 'cx', isTarget: true },
      { row: 1, col: 2, id: 'cx', isControl: true },
      { row: 2, col: 2, id: 'cx', isTarget: true },
    ]
  },
  {
    id: 'qft2',
    label: 'QFT (2-qubit)',
    numQubits: 2,
    description: 'Quantum Fourier Transform',
    gates: [
      { row: 0, col: 0, id: 'h' },
      { row: 0, col: 1, id: 'cp', isControl: true },
      { row: 1, col: 1, id: 'cp', isTarget: true },
      { row: 1, col: 2, id: 'h' },
      { row: 0, col: 3, id: 'swap', isControl: true },
      { row: 1, col: 3, id: 'swap', isTarget: true },
    ]
  },
  {
    id: 'grover2',
    label: "Grover's Search",
    numQubits: 2,
    description: 'Grover oracle marking |11⟩',
    gates: [
      { row: 0, col: 0, id: 'h' },
      { row: 1, col: 0, id: 'h' },
      { row: 0, col: 1, id: 'cz', isControl: true },
      { row: 1, col: 1, id: 'cz', isTarget: true },
      { row: 0, col: 2, id: 'h' },
      { row: 1, col: 2, id: 'h' },
      { row: 0, col: 3, id: 'x' },
      { row: 1, col: 3, id: 'x' },
      { row: 0, col: 4, id: 'cz', isControl: true },
      { row: 1, col: 4, id: 'cz', isTarget: true },
      { row: 0, col: 5, id: 'x' },
      { row: 1, col: 5, id: 'x' },
      { row: 0, col: 6, id: 'h' },
      { row: 1, col: 6, id: 'h' },
    ]
  },
  {
    id: 'teleport',
    label: 'Teleportation',
    numQubits: 3,
    description: 'Quantum teleportation protocol',
    gates: [
      { row: 1, col: 0, id: 'h' },
      { row: 1, col: 1, id: 'cx', isControl: true },
      { row: 2, col: 1, id: 'cx', isTarget: true },
      { row: 0, col: 2, id: 'cx', isControl: true },
      { row: 1, col: 2, id: 'cx', isTarget: true },
      { row: 0, col: 3, id: 'h' },
    ]
  },
  {
    id: 'superposition',
    label: 'Full Superposition',
    numQubits: 3,
    description: 'All qubits in equal superposition',
    gates: [
      { row: 0, col: 0, id: 'h' },
      { row: 1, col: 0, id: 'h' },
      { row: 2, col: 0, id: 'h' },
    ]
  },
  {
    id: 'phaseKickback',
    label: 'Phase Kickback',
    numQubits: 2,
    description: 'Demonstrates phase kickback via T gate',
    gates: [
      { row: 0, col: 0, id: 'h' },
      { row: 1, col: 0, id: 'x' },
      { row: 0, col: 1, id: 'cx', isControl: true },
      { row: 1, col: 1, id: 'cx', isTarget: true },
      { row: 1, col: 2, id: 't' },
      { row: 0, col: 3, id: 'cx', isControl: true },
      { row: 1, col: 3, id: 'cx', isTarget: true },
      { row: 0, col: 4, id: 'h' },
    ]
  },
];

/**
 * Build the circuit array format from a preset definition.
 * @param {Object} preset - Preset object from PRESETS
 * @param {number} maxDepth - Maximum circuit depth
 * @returns {Array} Circuit in [[{gate}]] format
 */
export const buildPresetCircuit = (preset, maxDepth) => {
  const circuit = Array(preset.numQubits).fill(null).map(() =>
    Array(maxDepth).fill(null).map(() => ({ gate: null }))
  );

  for (const { row, col, id, isControl, isTarget } of preset.gates) {
    if (col >= maxDepth || row >= preset.numQubits) continue;
    const baseGate = GATES_BY_ID[id];
    if (!baseGate) continue;
    let gate = { ...baseGate };
    if (isControl) gate = { ...gate, target: false };
    if (isTarget) gate = { ...gate, control: false };
    circuit[row][col] = { gate };
  }

  return circuit;
};
