import React from 'react';
import styles from './StateVisualizer.module.css';

const fmt = ({ re, im }) => {
  const r = Math.round(re * 1000) / 1000;
  const i = Math.round(im * 1000) / 1000;
  if (Math.abs(r) < 0.001 && Math.abs(i) < 0.001) return '0';
  if (Math.abs(r) < 0.001) return `${i}i`;
  if (Math.abs(i) < 0.001) return `${r}`;
  return `${r}${i >= 0 ? '+' : ''}${i}i`;
};

const prob = ({ re, im }) => re * re + im * im;

const StateVisualizer = ({ stateData, numQubits }) => {
  const qubitProbs = Array(numQubits).fill(0).map((_, q) => {
    const p0 = stateData.reduce((s, amp, idx) =>
      (idx & (1 << q)) === 0 ? s + prob(amp) : s, 0);
    return { q, p0, p1: 1 - p0 };
  });

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>State Vector</div>
        {stateData.map((amp, idx) => {
          const p = prob(amp);
          const pct = Math.round(p * 10000) / 100;
          const bin = idx.toString(2).padStart(numQubits, '0');
          const isHigh = pct > 5;
          return (
            <div key={idx} className={styles.stateRow}>
              <span className={styles.basis}>|{bin}⟩</span>
              <span className={styles.amplitude}>{fmt(amp)}</span>
              <div className={styles.barTrack}>
                <div
                  className={`${styles.barFill} ${isHigh ? '' : styles.barFillLow}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={styles.prob}>{pct}%</span>
            </div>
          );
        })}
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Per-Qubit Probabilities</div>
        <div className={styles.qubitGrid}>
          {qubitProbs.map(({ q, p0, p1 }) => (
            <div key={q} className={styles.qubitCard}>
              <div className={styles.qubitCardTitle}>Qubit {q}</div>
              <div className={styles.qubitBarRow}>
                <span className={styles.qubitState}>|0⟩</span>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.bar0}`} style={{ width: `${p0 * 100}%` }} />
                </div>
                <span className={styles.prob}>{Math.round(p0 * 1000) / 10}%</span>
              </div>
              <div className={styles.qubitBarRow}>
                <span className={styles.qubitState}>|1⟩</span>
                <div className={styles.barTrack}>
                  <div className={`${styles.barFill} ${styles.bar1}`} style={{ width: `${p1 * 100}%` }} />
                </div>
                <span className={styles.prob}>{Math.round(p1 * 1000) / 10}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StateVisualizer;
