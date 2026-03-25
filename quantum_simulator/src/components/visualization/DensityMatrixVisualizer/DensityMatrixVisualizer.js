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

// Reduced density matrix for qubit q → compute Von Neumann entropy S = -Tr(ρ log ρ)
const qubitEntropy = (sv, q) => {
  let rho00 = 0, rho11 = 0, rho01re = 0, rho01im = 0;
  for (let m = 0; m < sv.length; m++) {
    if ((m >> q) & 1) continue;
    const m1 = m | (1 << q);
    const am = sv[m], am1 = sv[m1];
    rho00  += am.re * am.re + am.im * am.im;
    rho11  += am1.re * am1.re + am1.im * am1.im;
    rho01re += am.re * am1.re + am.im * am1.im;
    rho01im += am.im * am1.re - am.re * am1.im;
  }
  // Eigenvalues of 2×2 Hermitian matrix [[ρ00, ρ01],[ρ01*, ρ11]]
  const bMag = Math.sqrt(rho01re ** 2 + rho01im ** 2);
  const mu = Math.sqrt(((rho00 - rho11) / 2) ** 2 + bMag ** 2);
  const l1 = 0.5 + mu;
  const l2 = 0.5 - mu;
  const h = p => (p < 1e-10 ? 0 : -p * Math.log2(p));
  return { entropy: h(l1) + h(l2), purity: l1 ** 2 + l2 ** 2 };
};

const DensityMatrixVisualizer = ({ stateData, numQubits }) => {
  const dm = calcDensity(stateData);

  // Global purity = Tr(ρ²)
  const purity = dm.reduce((s, row, i) => {
    return s + dm[i].reduce((s2, _, k) => s2 + dm[i][k].re * dm[k][i].re - dm[i][k].im * dm[k][i].im, 0);
  }, 0);

  // Per-qubit Pauli-Z expectation
  const zExpect = Array(numQubits).fill(0).map((_, q) =>
    stateData.reduce((s, amp, idx) => s + prob(amp) * (((idx >> q) & 1) === 0 ? 1 : -1), 0)
  );

  // Per-qubit Pauli-X and Pauli-Y expectations from reduced DM
  const xyExpect = Array(numQubits).fill(null).map((_, q) => {
    let rho01re = 0, rho01im = 0;
    for (let m = 0; m < stateData.length; m++) {
      if ((m >> q) & 1) continue;
      const m1 = m | (1 << q);
      const am = stateData[m], am1 = stateData[m1];
      rho01re += am.re * am1.re + am.im * am1.im;
      rho01im += am.im * am1.re - am.re * am1.im;
    }
    return { x: 2 * rho01re, y: -2 * rho01im };
  });

  // Per-qubit entropy
  const qubitStats = Array(numQubits).fill(null).map((_, q) => qubitEntropy(stateData, q));

  const maxDim = Math.min(dm.length, 8);

  return (
    <div className={styles.container}>

      {/* Density matrix heatmap */}
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

      {/* Global purity */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>State Properties</div>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Global Purity  Tr(ρ²)</div>
          <div className={styles.infoValue}>{purity.toFixed(4)}</div>
          <div className={styles.infoNote}>
            {purity > 0.99 ? 'Pure state — maximum coherence' :
             purity > 0.7  ? 'Partially mixed — entanglement present' :
                             'Highly mixed state'}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Per-qubit entanglement entropy */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Entanglement Entropy (Von Neumann)</div>
        <div className={styles.entropyGrid}>
          {qubitStats.map(({ entropy: s }, q) => {
            const isEntangled = s > 0.01;
            const color = s < 0.05 ? '#22c55e' : s < 0.5 ? '#818CF8' : '#F472B6';
            return (
              <div key={q} className={styles.entropyCard}>
                <div className={styles.entropyCardLabel}>Q{q}</div>
                <div className={styles.entropyCardValue} style={{ color }}>
                  {s.toFixed(3)}
                </div>
                <div className={styles.entropyBar}>
                  <div
                    className={styles.entropyBarFill}
                    style={{ width: `${s * 100}%`, background: color }}
                  />
                </div>
                <div className={styles.entropyCardNote}>
                  {isEntangled ? 'Entangled' : 'Separable'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.divider} />

      {/* Pauli expectation values */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Pauli Expectations ⟨σ⟩</div>
        {zExpect.map((z, q) => {
          const x = xyExpect[q].x;
          const y = xyExpect[q].y;

          const makeBar = (val, labelX, labelY) => {
            const fillLeft = val >= 0 ? '50%' : `${((val + 1) / 2) * 100}%`;
            const fillWidth = `${Math.abs(val) * 50}%`;
            const fillColor = val >= 0
              ? 'linear-gradient(90deg, #38BDF8, #818CF8)'
              : 'linear-gradient(90deg, #F87171, #F472B6)';
            return (
              <div key={`${labelX}${q}`} className={styles.obsRow}>
                <span className={styles.obsLabel}>⟨{labelX}{q}⟩</span>
                <div className={styles.obsBar}>
                  <div className={styles.obsBarFill}
                    style={{ left: fillLeft, width: fillWidth, background: fillColor }} />
                </div>
                <span className={styles.obsValue}>{val.toFixed(3)}</span>
              </div>
            );
          };

          return (
            <React.Fragment key={q}>
              {makeBar(x, 'X', q)}
              {makeBar(y, 'Y', q)}
              {makeBar(z, 'Z', q)}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default DensityMatrixVisualizer;
