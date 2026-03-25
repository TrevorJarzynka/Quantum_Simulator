import React from 'react';
import styles from './MathVisualizer.module.css';

const fmtC = ({ re, im }) => {
  const r = Math.round(re * 1000) / 1000;
  const i = Math.round(im * 1000) / 1000;
  if (Math.abs(r) < 0.001 && Math.abs(i) < 0.001) return '0';
  if (Math.abs(r) < 0.001) {
    if (i === 1) return 'i'; if (i === -1) return '-i'; return `${i}i`;
  }
  if (Math.abs(i) < 0.001) return `${r}`;
  const sign = i >= 0 ? '+' : '-';
  const absI = Math.abs(i);
  return `${r}${sign}${absI === 1 ? '' : absI}i`;
};

const p = ({ re, im }) => re * re + im * im;

const MATRICES = {
  h: `H = 1/√2 · | 1  1 |\n             | 1 -1 |`,
  x: `X = | 0  1 |\n    | 1  0 |`,
  y: `Y = | 0 -i |\n    | i  0 |`,
  z: `Z = | 1  0 |\n    | 0 -1 |`,
  s: `S = | 1  0 |\n    | 0  i |`,
  t: `T = | 1     0      |\n    | 0  e^(iπ/4) |`,
};

const GATE_OPS = {
  Hadamard: { short: 'H|0⟩ = (|0⟩ + |1⟩)/√2  ·  Creates equal superposition', key: 'h' },
  'X gate':  { short: 'X|0⟩ = |1⟩  ·  Quantum NOT gate',                       key: 'x' },
  'Y gate':  { short: 'Y|0⟩ = i|1⟩  ·  Y-axis rotation',                        key: 'y' },
  'Z gate':  { short: 'Z|1⟩ = -|1⟩  ·  Phase flip',                             key: 'z' },
  'S gate':  { short: 'S|1⟩ = i|1⟩  ·  π/2 phase shift',                        key: 's' },
  'T gate':  { short: 'T|1⟩ = e^(iπ/4)|1⟩  ·  π/4 phase shift',                key: 't' },
};

const MathVisualizer = ({ stateData, numQubits, step, description }) => {
  const terms = stateData
    .map((amp, idx) => ({ amp, idx, prob: p(amp) }))
    .filter(t => t.prob > 0.001)
    .map(({ amp, idx }) => {
      const bin = idx.toString(2).padStart(numQubits, '0');
      const c = fmtC(amp);
      return c === '1' ? `|${bin}⟩` : `${c} |${bin}⟩`;
    });
  const equation = `|ψ⟩ = ${terms.length ? terms.join('\n    + ') : '0'}`;

  const nonZero = stateData.filter(a => p(a) > 0.001);
  let stateDesc = `Superposition of ${nonZero.length} basis states.`;
  if (nonZero.length === 1) {
    const idx = stateData.findIndex(a => p(a) > 0.001);
    stateDesc = `Pure computational basis state |${idx.toString(2).padStart(numQubits, '0')}⟩.`;
  } else if (nonZero.length === 2) {
    const ps = nonZero.map(a => p(a));
    if (Math.abs(ps[0] - 0.5) < 0.01 && Math.abs(ps[1] - 0.5) < 0.01) {
      stateDesc = 'Equal superposition — Bell state candidate.';
    }
  }

  const matchedGate = Object.entries(GATE_OPS).find(([k]) => description?.includes(k));
  const normSum = stateData.reduce((s, a) => s + p(a), 0);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Dirac Notation</div>
        <div className={styles.equation}>{equation}</div>
        <p className={styles.explanation}>{stateDesc}</p>
      </div>

      <div className={styles.divider} />

      {matchedGate && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Gate Matrix</div>
            <div className={styles.matrix}>{MATRICES[matchedGate[1].key] || ''}</div>
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Operation</div>
            <div className={styles.opBox}>{matchedGate[1].short}</div>
          </div>
          <div className={styles.divider} />
        </>
      )}

      {description?.includes('CNOT') && (
        <>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Operation</div>
            <div className={styles.opBox}>
              {'CNOT: flips target when control is |1⟩\n|00⟩→|00⟩  |01⟩→|01⟩\n|10⟩→|11⟩  |11⟩→|10⟩'}
            </div>
          </div>
          <div className={styles.divider} />
        </>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Normalization</div>
        <div className={styles.equation}>Σ|αᵢ|² = {normSum.toFixed(6)}</div>
      </div>
    </div>
  );
};

export default MathVisualizer;
