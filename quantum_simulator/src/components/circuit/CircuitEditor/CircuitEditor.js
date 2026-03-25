// src/components/circuit/CircuitEditor/CircuitEditor.js
import React from 'react';
import styles from './CircuitEditor.module.css';

const CircuitEditor = ({ circuit, onCellClick, onRemoveGate, selectedGate, pendingMultiQubitGate }) => {
  return (
    <div className={styles.circuitGrid}>
      {/* Show pending gate hint */}
      {pendingMultiQubitGate && (
        <div className={styles.pendingHint}>
          Click a cell in column {pendingMultiQubitGate.col + 1} on a different qubit row to place the target
        </div>
      )}
      {circuit.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.qubitRow}>
          <div className={styles.qubitLabel}>
            Q{rowIndex}
          </div>
          <div className={styles.wireRow}>
            <div className={styles.cellContainer}>
              {row.map((cell, colIndex) => {
                const isPending = pendingMultiQubitGate &&
                  pendingMultiQubitGate.row === rowIndex &&
                  pendingMultiQubitGate.col === colIndex;

                return (
                  <div
                    key={colIndex}
                    className={`${styles.cell} ${!cell.gate ? styles.cellEmpty : ''} ${isPending ? styles.pendingCell : ''}`}
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
                      <GateElement
                        gate={cell.gate}
                        onRemove={(e) => {
                          e.stopPropagation();
                          onRemoveGate(rowIndex, colIndex);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Renders a single gate box with correct color and control/target symbols.
 */
const GateElement = ({ gate, onRemove }) => {
  const isControlOnly = gate.control && !gate.target;
  const isTargetOnly = !gate.control && gate.target;

  // Use the gate's own color for the background
  const bg = gate.color
    ? `linear-gradient(135deg, ${gate.color}, ${gate.color}cc)`
    : 'linear-gradient(135deg, #555, #333)';

  return (
    <div
      className={styles.gateElement}
      style={{ background: bg }}
    >
      {/* Control symbol: filled dot */}
      {isControlOnly && <div className={styles.controlSymbol}>●</div>}
      {/* Target symbol: circle-plus */}
      {isTargetOnly && <div className={styles.targetSymbol}>⊕</div>}

      <div className={styles.gateName}>{gate.name}</div>

      {isControlOnly && <div className={styles.roleLabel}>CTRL</div>}
      {isTargetOnly && <div className={styles.roleLabel}>TGT</div>}

      <button
        className={styles.removeBtn}
        onClick={onRemove}
        aria-label={`Remove ${gate.name} gate`}
        title="Remove gate"
      >
        ×
      </button>
    </div>
  );
};

export default CircuitEditor;
