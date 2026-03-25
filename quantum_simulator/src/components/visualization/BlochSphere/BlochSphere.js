import React from 'react';
import styles from './BlochSphere.module.css';

const R = 36;
const CX = 50;
const CY = 50;
const W = 100;
const H = 100;

// Oblique projection: X right, Z up, Y into screen (foreshortened)
const proj = (bx, by, bz) => ({
  x: CX + R * (bx - by * 0.38),
  y: CY - R * (bz + by * 0.22),
});

// Generate SVG polyline path through 3D points on a great circle
const greatCirclePath = (u, v, steps = 60) => {
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * Math.PI * 2;
    const bx = Math.cos(t) * u[0] + Math.sin(t) * v[0];
    const by = Math.cos(t) * u[1] + Math.sin(t) * v[1];
    const bz = Math.cos(t) * u[2] + Math.sin(t) * v[2];
    return proj(bx, by, bz);
  });
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
};

// Reduced density matrix element ρ[0][1] for qubit q
const computeBlochVector = (stateData, q) => {
  let rho00 = 0, rho11 = 0, rho01re = 0, rho01im = 0;
  for (let m = 0; m < stateData.length; m++) {
    if ((m >> q) & 1) continue; // only indices where qubit q = 0
    const m1 = m | (1 << q);   // same index but qubit q = 1
    const am = stateData[m], am1 = stateData[m1];
    rho00  += am.re * am.re + am.im * am.im;
    rho11  += am1.re * am1.re + am1.im * am1.im;
    // ρ[0][1] = state[m] * conj(state[m1])
    rho01re += am.re * am1.re + am.im * am1.im;
    rho01im += am.im * am1.re - am.re * am1.im;
  }
  return {
    x: 2 * rho01re,
    y: -2 * rho01im,
    z: rho00 - rho11,
  };
};

// Von Neumann entropy from Bloch vector length
const entropy = (bloch) => {
  const r = Math.sqrt(bloch.x ** 2 + bloch.y ** 2 + bloch.z ** 2);
  const l1 = (1 + r) / 2;
  const l2 = (1 - r) / 2;
  const h = p => (p < 1e-10 ? 0 : -p * Math.log2(p));
  return h(l1) + h(l2);
};

const BlochSphereViz = ({ bloch, qubitIdx }) => {
  const tip = proj(bloch.x, bloch.y, bloch.z);
  const north = proj(0, 0, 1);
  const south = proj(0, 0, -1);
  const xPos = proj(1, 0, 0);
  const xNeg = proj(-1, 0, 0);
  const yPos = proj(0, 1, 0);
  const yNeg = proj(0, -1, 0);

  const purity = bloch.x ** 2 + bloch.y ** 2 + bloch.z ** 2;
  const ent = entropy(bloch);
  const vColor = purity > 0.98 ? '#38BDF8' : purity > 0.5 ? '#818CF8' : '#F472B6';

  // X-Z great circle (appears as main circle)
  const xzPath = greatCirclePath([1, 0, 0], [0, 0, 1]);
  // X-Y equatorial circle
  const xyPath = greatCirclePath([1, 0, 0], [0, 1, 0]);
  // Y-Z meridian
  const yzPath = greatCirclePath([0, 1, 0], [0, 0, 1]);

  return (
    <div className={styles.sphereWrapper}>
      <div className={styles.sphereLabel}>Q{qubitIdx}</div>
      <svg width={W} height={H} className={styles.svg}>
        {/* Background sphere fill */}
        <circle cx={CX} cy={CY} r={R} fill="rgba(5,12,30,0.7)" />

        {/* Great circles (drawn behind sphere edge) */}
        <path d={yzPath}  fill="none" stroke="rgba(56,189,248,0.10)" strokeWidth="0.8" strokeDasharray="2 2"/>
        <path d={xyPath}  fill="none" stroke="rgba(56,189,248,0.12)" strokeWidth="0.8" strokeDasharray="2 2"/>
        <path d={xzPath}  fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth="0.8"/>

        {/* Sphere boundary */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(56,189,248,0.35)" strokeWidth="1.2"/>

        {/* Axes */}
        <line x1={xNeg.x} y1={xNeg.y} x2={xPos.x} y2={xPos.y}
              stroke="rgba(255,255,255,0.18)" strokeWidth="0.8"/>
        <line x1={north.x} y1={north.y} x2={south.x} y2={south.y}
              stroke="rgba(255,255,255,0.22)" strokeWidth="0.8"/>
        <line x1={yNeg.x} y1={yNeg.y} x2={yPos.x} y2={yPos.y}
              stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" strokeDasharray="2 2"/>

        {/* Projection lines from tip to equator and z-axis */}
        <line x1={tip.x} y1={tip.y} x2={proj(bloch.x, bloch.y, 0).x} y2={proj(bloch.x, bloch.y, 0).y}
              stroke={vColor} strokeWidth="0.7" opacity="0.35" strokeDasharray="2 2"/>
        <line x1={proj(bloch.x, bloch.y, 0).x} y1={proj(bloch.x, bloch.y, 0).y}
              x2={CX} y2={CY}
              stroke={vColor} strokeWidth="0.7" opacity="0.25" strokeDasharray="2 2"/>

        {/* Bloch vector */}
        <line x1={CX} y1={CY} x2={tip.x} y2={tip.y}
              stroke={vColor} strokeWidth="2.2" strokeLinecap="round"/>
        <circle cx={tip.x} cy={tip.y} r="3.5" fill={vColor}
                filter="url(#glow)"/>

        {/* Center dot */}
        <circle cx={CX} cy={CY} r="2" fill="rgba(255,255,255,0.3)"/>

        {/* Axis labels */}
        <text x={xPos.x + 2} y={xPos.y + 3}
              fill="rgba(200,220,255,0.5)" fontSize="7" fontFamily="monospace">x</text>
        <text x={north.x + 2} y={north.y - 2}
              fill="rgba(200,220,255,0.7)" fontSize="7" fontFamily="monospace">|0⟩</text>
        <text x={south.x + 2} y={south.y + 8}
              fill="rgba(200,220,255,0.6)" fontSize="7" fontFamily="monospace">|1⟩</text>

        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      </svg>

      <div className={styles.coords}>
        <div className={styles.coordRow}>
          <span className={styles.coordLabel}>x</span>
          <span className={styles.coordVal}>{bloch.x.toFixed(3)}</span>
        </div>
        <div className={styles.coordRow}>
          <span className={styles.coordLabel}>y</span>
          <span className={styles.coordVal}>{bloch.y.toFixed(3)}</span>
        </div>
        <div className={styles.coordRow}>
          <span className={styles.coordLabel}>z</span>
          <span className={styles.coordVal}>{bloch.z.toFixed(3)}</span>
        </div>
        <div className={styles.coordRow} style={{ marginTop: 4, borderTop: '1px solid rgba(56,189,248,0.1)', paddingTop: 4 }}>
          <span className={styles.coordLabel}>S</span>
          <span className={styles.coordVal} style={{ color: ent > 0.01 ? '#818CF8' : '#22c55e' }}>
            {ent.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
};

const BlochSphere = ({ stateData, numQubits }) => {
  if (!stateData || !numQubits) return null;

  const blochVectors = Array(numQubits).fill(null).map((_, q) =>
    computeBlochVector(stateData, q)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>Bloch Sphere · Per-Qubit State</div>
        <div className={styles.headerNote}>
          Arrow tip on sphere = pure state · Inside sphere = mixed / entangled
        </div>
      </div>
      <div className={styles.spheresGrid}>
        {blochVectors.map((bloch, q) => (
          <BlochSphereViz key={q} bloch={bloch} qubitIdx={q} />
        ))}
      </div>
      <div className={styles.legend}>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{ background: '#38BDF8' }} />
          <span>Pure state (|b|≈1)</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{ background: '#818CF8' }} />
          <span>Partially mixed</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.legendDot} style={{ background: '#F472B6' }} />
          <span>Maximally mixed / entangled</span>
        </div>
        <div className={styles.legendRow}>
          <span style={{ color: 'rgba(56,189,248,0.6)', fontSize: 10 }}>S = Von Neumann entropy (0=pure, 1=max mixed)</span>
        </div>
      </div>
    </div>
  );
};

export default BlochSphere;
