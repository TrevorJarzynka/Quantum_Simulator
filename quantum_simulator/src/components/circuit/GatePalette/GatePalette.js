// src/components/circuit/GatePalette/GatePalette.js
import React from 'react';
import { GATE_CATEGORIES } from '../../../constants/gates';
import styles from './GatePalette.module.css';

const GatePalette = ({ onGateSelect, selectedGate }) => {
  const handleGateClick = (gate) => {
    onGateSelect(gate);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Gate Palette</h2>
      
      {GATE_CATEGORIES.map((category, index) => (
        <div key={index} className={styles.category}>
          <h3 className={styles.categoryTitle}>
            {category.title}
          </h3>
          
          <div className={styles.gateGrid}>
            {category.gates.map(gate => (
              <button
                key={gate.id}
                className={`${styles.gate} ${
                  selectedGate && selectedGate.id === gate.id ? styles.gateSelected : ''
                }`}
                onClick={() => handleGateClick(gate)}
                data-gate-id={gate.id}
                title={gate.tooltip || gate.description}
                aria-label={`${gate.name} gate - ${gate.description}`}
              >
                <div className={styles.gateName}>{gate.name}</div>
                <div className={styles.gateDescription}>{gate.description}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GatePalette;