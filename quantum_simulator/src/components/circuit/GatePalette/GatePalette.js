import React from 'react';
import { GATE_CATEGORIES } from '../../../constants/gates';
import styles from './GatePalette.module.css';

const GatePalette = ({ onGateSelect, selectedGate }) => {
  return (
    <div className={styles.palette}>
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
                  style={{
                    background: bg,
                    boxShadow: isSelected ? glow : undefined,
                  }}
                  onClick={() => onGateSelect(gate)}
                  title={gate.tooltip || gate.description}
                  data-gate-id={gate.id}
                >
                  <span className={styles.gateName}>{gate.name}</span>
                  <span className={styles.gateDesc}>{gate.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GatePalette;
