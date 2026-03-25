// src/services/quantumSimulation/QuantumSimulator.js
import { GATE_MATRICES, getRotationMatrix } from '../../constants/gates';
import { ComplexMath } from '../../utils/math/ComplexNumbers';

export class QuantumSimulator {
  constructor() {
    this.debugMode = process.env.NODE_ENV === 'development';
  }

  createInitialState(numQubits, initialStates) {
    const size = Math.pow(2, numQubits);
    const state = Array(size).fill(null).map(() => ({ re: 0, im: 0 }));
    let basisStateIndex = 0;
    for (let i = 0; i < numQubits; i++) {
      if (initialStates[i]?.value === '1') basisStateIndex |= (1 << i);
    }
    state[basisStateIndex] = { re: 1, im: 0 };
    return state;
  }

  /** Get the 2×2 matrix for a gate, handling parametric rotation gates. */
  getGateMatrix(gate) {
    if (gate.id === 'rx' || gate.id === 'ry' || gate.id === 'rz') {
      return getRotationMatrix(gate.id, gate.angle ?? Math.PI / 2);
    }
    return GATE_MATRICES[gate.id];
  }

  applySingleQubitGate(state, gateMatrix, qubit, numQubits) {
    const size = Math.pow(2, numQubits);
    const newState = Array(size).fill(null).map(() => ({ re: 0, im: 0 }));
    for (let i = 0; i < size; i++) {
      const qubitValue = (i >> qubit) & 1;
      const flippedIndex = i ^ (1 << qubit);
      if (qubitValue === 0) {
        newState[i] = ComplexMath.add(newState[i], ComplexMath.multiply(gateMatrix[0][0], state[i]));
        newState[flippedIndex] = ComplexMath.add(newState[flippedIndex], ComplexMath.multiply(gateMatrix[0][1], state[i]));
      } else {
        newState[flippedIndex] = ComplexMath.add(newState[flippedIndex], ComplexMath.multiply(gateMatrix[1][0], state[i]));
        newState[i] = ComplexMath.add(newState[i], ComplexMath.multiply(gateMatrix[1][1], state[i]));
      }
    }
    for (let i = 0; i < size; i++) state[i] = newState[i];
  }

  applyControlledGate(state, gateMatrix, controlQubit, targetQubit, numQubits) {
    const size = Math.pow(2, numQubits);
    const orig = state.map(c => ({ re: c.re, im: c.im }));
    const newState = state.map(c => ({ re: c.re, im: c.im }));
    for (let i = 0; i < size; i++) {
      if (((i >> controlQubit) & 1) !== 1) continue;
      if (((i >> targetQubit) & 1) !== 0) continue;
      const flippedIndex = i ^ (1 << targetQubit);
      newState[i] = ComplexMath.add(
        ComplexMath.multiply(gateMatrix[0][0], orig[i]),
        ComplexMath.multiply(gateMatrix[0][1], orig[flippedIndex])
      );
      newState[flippedIndex] = ComplexMath.add(
        ComplexMath.multiply(gateMatrix[1][0], orig[i]),
        ComplexMath.multiply(gateMatrix[1][1], orig[flippedIndex])
      );
    }
    for (let i = 0; i < size; i++) state[i] = newState[i];
  }

  applySwapGate(state, qubit1, qubit2, numQubits) {
    const size = Math.pow(2, numQubits);
    const orig = state.map(c => ({ re: c.re, im: c.im }));
    const newState = state.map(c => ({ re: c.re, im: c.im }));
    for (let i = 0; i < size; i++) {
      const bit1 = (i >> qubit1) & 1;
      const bit2 = (i >> qubit2) & 1;
      if (bit1 !== bit2) {
        const swappedIndex = i ^ (1 << qubit1) ^ (1 << qubit2);
        newState[swappedIndex] = { re: orig[i].re, im: orig[i].im };
      }
    }
    for (let i = 0; i < size; i++) state[i] = newState[i];
  }

  applyGatesInColumn(state, gates, numQubits) {
    const descriptions = [];

    // Single-qubit gates first
    const single = gates.filter(g => !g.gate.control && !g.gate.target && g.gate.id !== 'measure');
    for (const { qubit, gate } of single) {
      const mat = this.getGateMatrix(gate);
      if (mat) {
        this.applySingleQubitGate(state, mat, qubit, numQubits);
        const label = gate.parametric && gate.angle != null
          ? `${gate.name}(${(gate.angle * 180 / Math.PI).toFixed(0)}°)`
          : gate.name;
        descriptions.push(`${label} on Q${qubit}`);
      }
    }

    // Multi-qubit gates
    const multi = gates.filter(g => g.gate.control || g.gate.target);
    const processed = new Set();
    for (const { qubit, gate } of multi) {
      if (!gate.control) continue;
      const target = multi.find(g => g.gate.target && g.gate.id === gate.id && g.qubit !== qubit);
      if (!target) continue;
      const key = `${qubit}-${target.qubit}`;
      if (processed.has(key)) continue;
      processed.add(key);
      processed.add(`${target.qubit}-${qubit}`);

      switch (gate.id) {
        case 'cx':
          this.applyControlledGate(state, GATE_MATRICES.x, qubit, target.qubit, numQubits);
          descriptions.push(`CNOT ctrl=Q${qubit} tgt=Q${target.qubit}`);
          break;
        case 'cy':
          this.applyControlledGate(state, GATE_MATRICES.y, qubit, target.qubit, numQubits);
          descriptions.push(`CY ctrl=Q${qubit} tgt=Q${target.qubit}`);
          break;
        case 'cz':
          this.applyControlledGate(state, GATE_MATRICES.z, qubit, target.qubit, numQubits);
          descriptions.push(`CZ ctrl=Q${qubit} tgt=Q${target.qubit}`);
          break;
        case 'ch':
          this.applyControlledGate(state, GATE_MATRICES.h, qubit, target.qubit, numQubits);
          descriptions.push(`CH ctrl=Q${qubit} tgt=Q${target.qubit}`);
          break;
        case 'cp':
          this.applyControlledGate(state, GATE_MATRICES.s, qubit, target.qubit, numQubits);
          descriptions.push(`CP ctrl=Q${qubit} tgt=Q${target.qubit}`);
          break;
        case 'swap':
          this.applySwapGate(state, qubit, target.qubit, numQubits);
          descriptions.push(`SWAP Q${qubit}↔Q${target.qubit}`);
          break;
        default:
          break;
      }
    }

    return descriptions;
  }

  simulate(circuit, numQubits, initialStates, maxDepth) {
    const initialState = this.createInitialState(numQubits, initialStates);
    const steps = [{
      step: 0,
      column: null,
      state: initialState,
      description: 'Initial state'
    }];

    const hasAnyGates = circuit.some(row => row.some(cell => cell.gate !== null));
    if (!hasAnyGates) return steps;

    for (let col = 0; col < maxDepth; col++) {
      const gatesInColumn = [];
      for (let row = 0; row < numQubits; row++) {
        if (circuit[row][col]?.gate !== null && circuit[row][col]?.gate !== undefined) {
          gatesInColumn.push({ qubit: row, gate: circuit[row][col].gate });
        }
      }
      if (gatesInColumn.length > 0) {
        const currentState = JSON.parse(JSON.stringify(steps[steps.length - 1].state));
        const descriptions = this.applyGatesInColumn(currentState, gatesInColumn, numQubits);
        steps.push({
          step: steps.length,
          column: col,   // which circuit column this step corresponds to
          state: currentState,
          description: descriptions.length > 0 ? `Applied: ${descriptions.join(', ')}` : 'No gates'
        });
      }
    }

    return steps;
  }

  calculateProbabilities(state) {
    return state.map(amp => ComplexMath.magnitude(amp) ** 2);
  }

  measureQubit(state, qubit, numQubits) {
    const prob0 = state.reduce((sum, amp, idx) => {
      if ((idx & (1 << qubit)) === 0) return sum + ComplexMath.magnitude(amp) ** 2;
      return sum;
    }, 0);
    const result = Math.random() < prob0 ? 0 : 1;
    const norm = result === 0 ? Math.sqrt(prob0) : Math.sqrt(1 - prob0);
    const collapsed = state.map((amp, idx) => {
      if (((idx >> qubit) & 1) === result) return ComplexMath.scale(amp, 1 / norm);
      return { re: 0, im: 0 };
    });
    return { result, state: collapsed, probability: result === 0 ? prob0 : 1 - prob0 };
  }
}
