import React, { useState, useEffect } from 'react';
import { GATE_CATEGORIES } from '../../../constants/gates';
import { PRESETS } from '../../../constants/presets';
import styles from './GatePalette.module.css';

const ANGLE_PRESETS = [
  { label: 'π/8', value: Math.PI / 8 },
  { label: 'π/4', value: Math.PI / 4 },
  { label: 'π/2', value: Math.PI / 2 },
  { label: 'π',   value: Math.PI },
];

const GatePalette = ({ onGateSelect, selectedGate, onLoadPreset }) => {
  const [angleDeg, setAngleDeg] = useState(90);
  const [selectedPresetId, setSelectedPresetId] = useState('bell');

  const angleRad = (angleDeg * Math.PI) / 180;
  const isParametric = selectedGate?.parametric;

  // When angle changes while a parametric gate is selected, update the gate
  useEffect(() => {
    if (isParametric) {
      onGateSelect({ ...selectedGate, angle: (angleDeg * Math.PI) / 180 });
    }
  }, [angleDeg]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGateClick = (gate) => {
    if (gate.parametric) {
      onGateSelect({ ...gate, angle: angleRad });
    } else {
      onGateSelect(gate);
    }
  };

  const handleAnglePreset = (val) => {
    const deg = Math.round((val * 180) / Math.PI);
    setAngleDeg(deg);
    if (isParametric) {
      onGateSelect({ ...selectedGate, angle: val });
    }
  };

  const selectedPreset = PRESETS.find(p => p.id === selectedPresetId);

  return (
    <div className={styles.palette}>

      {/* Preset Circuits */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Preset Circuits</div>
        <div className={styles.presetSection}>
          <select
            className={styles.presetSelect}
            value={selectedPresetId}
            onChange={e => setSelectedPresetId(e.target.value)}
          >
            {PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
          {selectedPreset && (
            <div className={styles.presetInfo}>{selectedPreset.description} · {selectedPreset.numQubits} qubits</div>
          )}
          <button
            className={styles.presetLoad}
            onClick={() => selectedPreset && onLoadPreset(selectedPreset)}
          >
            ↓ Load Circuit
          </button>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Gate Categories */}
      {GATE_CATEGORIES.map((category, catIdx) => (
        <div key={catIdx} className={styles.section}>
          {catIdx > 0 && <div className={styles.divider} />}
          <div className={styles.sectionTitle}>{category.title}</div>
          <div className={category.gates.length === 1 ? styles.gateGrid1 : styles.gateGrid}>
            {category.gates.map(gate => {
              const isSelected = selectedGate?.id === gate.id;
              const bg = `linear-gradient(145deg, ${gate.color}, ${gate.color}bb)`;
              const glow = `0 0 18px ${gate.color}55`;
              return (
                <button
                  key={gate.id}
                  className={`${styles.gate} ${isSelected ? styles.gateSelected : ''}`}
                  style={{ background: bg, boxShadow: isSelected ? glow : undefined }}
                  onClick={() => handleGateClick(gate)}
                  title={gate.tooltip || gate.description}
                >
                  <span className={styles.gateName}>{gate.name}</span>
                  <span className={styles.gateDesc}>{gate.description}</span>
                </button>
              );
            })}
          </div>

          {/* Show angle input when a parametric gate from this category is selected */}
          {isParametric && category.gates.some(g => g.id === selectedGate.id) && (
            <div className={styles.angleBox}>
              <div className={styles.angleLabel}>Rotation angle θ</div>
              <div className={styles.angleRow}>
                <input
                  type="range"
                  className={styles.angleSlider}
                  min={1}
                  max={360}
                  value={angleDeg}
                  onChange={e => setAngleDeg(Number(e.target.value))}
                />
                <span className={styles.angleValue}>{angleDeg}°</span>
              </div>
              <div className={styles.anglePresets}>
                {ANGLE_PRESETS.map(ap => (
                  <button
                    key={ap.label}
                    className={styles.anglePreset}
                    onClick={() => handleAnglePreset(ap.value)}
                  >
                    {ap.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GatePalette;
