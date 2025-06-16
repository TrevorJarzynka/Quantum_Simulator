// src/components/circuit/CircuitEditor/CircuitEditor.js
import React from 'react';
import styles from './CircuitEditor.module.css';

const CircuitEditor = ({ circuit, onCellClick, onRemoveGate, selectedGate }) => {
  return (
    <div className={styles.circuitGrid}>
      {circuit.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.qubitRow}>
          <div className={styles.qubitLabel}>
            Q{rowIndex}
          </div>
          <div className={styles.wireRow}>
            <div className={styles.cellContainer}>
              {row.map((cell, colIndex) => (
                <div 
                  key={colIndex} 
                  className={`${styles.cell} ${!cell.gate ? styles.cellEmpty : ''}`}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onCellClick(rowIndex, colIndex);
                    }
                  }}
                  aria-label={cell.gate ? `${cell.gate.name} gate` : 'Empty cell'}
                >
                  {cell.gate && (
                    <div 
                      className={styles.gateElement}
                      data-gate-id={cell.gate.id}
                    >
                      <div className={styles.gateName}>{cell.gate.name}</div>
                      {cell.gate.description && (
                        <div className={styles.gateDescription}>
                          {cell.gate.description}
                        </div>
                      )}
                      <button 
                        className={styles.removeBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveGate(rowIndex, colIndex);
                        }}
                        aria-label={`Remove ${cell.gate.name} gate`}
                        title="Remove gate"
                      >
                        ×
                      </button>
                      {cell.gate.control && (
                        <div className={styles.controlDot} />
                      )}
                      {cell.gate.target && (
                        <div className={styles.targetCircle} />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CircuitEditor;