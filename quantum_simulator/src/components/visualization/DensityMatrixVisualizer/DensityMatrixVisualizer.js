import React from 'react';
import styles from './DensityMatrixVisualizer.module.css';

const prob = ({ re, im }) => re * re + im * im;

const fmt = ({ re, im }) => {
  const r = Math.round(re * 100) / 100;
  const i = Math.round(im * 100) / 100;
  if (Math.abs(r) < 0.01 && Math.abs(i) < 0.01) return '0';
  if (Math.abs(r) < 0.01) return `${i}i`;
  if (Math.abs(i) < 0.01) return `${r}`;
  return `${r}${i >= 0 ? '+' : ''}${i}i`;
};

const calcDensity = (sv) => {
  const n = sv.length;
  return Array(n).fill(0).map((_, i) =>
    Array(n).fill(0).map((_, j) => ({
      re: sv[i].re * sv[j].re + sv[i].im * sv[j].im,
      im: sv[i].im * sv[j].re - sv[i].re * sv[j].im,
    }))
  );
};

const DensityMatrixVisualizer = ({ stateData, numQubits }) => {
  const dm = calcDensity(stateData);

  // Purity = Tr(ρ²)
  const purity = dm.reduce((s, row, i) => {
    const rho2ii = dm[i].reduce((s2, _, k) => {
      return s2 + (dm[i][k].re * dm[k][i].re - dm[i][k].im * dm[k][i].im);
    }, 0);
    return s + rho2ii;
  }, 0);

  // ⟨Z⟩ per qubit
  const zExpect = Array(numQubits).fill(0).map((_, q) =>
    stateData.reduce((s, amp, idx) => {
      const bit = (idx >> q) & 1;
      return s + prob(amp) * (bit === 0 ? 1 : -1);
    }, 0)
  );

  const maxDim = Math.min(dm.length, 8);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Density Matrix ρ = |ψ⟩⟨ψ|</div>
        <div className={styles.matrixScroll}>
          <div
            className={styles.matrixGrid}
            style={{ gridTemplateColumns: `repeat(${maxDim}, 62px)` }}
          >
            {dm.slice(0, maxDim).map((row, i) =>
              row.slice(0, maxDim).map((cell, j) => {
                const mag = Math.sqrt(prob(cell));
                return (
                  <div
                    key={`${i}-${j}`}
                    className={styles.matrixCell}
                    style={{
                      background: `rgba(56, 189, 248, ${mag * 0.55 + 0.03})`,
                      color: mag > 0.4 ? 'rgba(255,255,255,0.95)' : 'rgba(147,210,240,0.7)',
                    }}
                  >
                    {fmt(cell)}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionTitle}>State Properties</div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Purity  Tr(ρ²)</div>
          <div className={styles.infoValue}>{purity.toFixed(4)}</div>
          <div className={styles.infoNote}>
            {purity > 0.99
              ? 'Pure state — no decoherence'
              : purity > 0.5
              ? 'Partially mixed state'
              : 'Highly mixed state'}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Pauli-Z Expectation Values</div>
        {zExpect.map((z, q) => {
          const fillLeft = z >= 0 ? '50%' : `${((z + 1) / 2) * 100}%`;
          const fillWidth = `${Math.abs(z) * 50}%`;
          const fillColor = z >= 0
            ? 'linear-gradient(90deg, #38BDF8, #818CF8)'
            : 'linear-gradient(90deg, #F87171, #F472B6)';
          return (
            <div key={q} className={styles.obsRow}>
              <span className={styles.obsLabel}>⟨Z{q}⟩</span>
              <div className={styles.obsBar}>
                <div
                  className={styles.obsBarFill}
                  style={{ left: fillLeft, width: fillWidth, background: fillColor }}
                />
              </div>
              <span className={styles.obsValue}>{z.toFixed(3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DensityMatrixVisualizer;
