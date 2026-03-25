import React from 'react';
import styles from './InitialStateControls.module.css';

const InitialStateControls = ({ numQubits, initialStates, onUpdateState }) => {
  const handleStateChange = (idx, val) => {
    onUpdateState(idx, { ...initialStates[idx], value: val });
  };

  const summary = '|' + Array(numQubits).fill(0).map((_, i) => initialStates[i]?.value || '0').join('') + '⟩';

  return (
    <div className={styles.container}>
      <div className={styles.qubitRow}>
        {Array(numQubits).fill(null).map((_, i) => {
          const val = initialStates[i]?.value || '0';
          return (
            <div key={i} className={styles.qubitChip}>
              <span className={styles.qubitName}>Q{i}</span>
              <div className={styles.toggleGroup}>
                <button
                  className={`${styles.toggleBtn} ${val === '0' ? styles.toggleBtnActive : ''}`}
                  onClick={() => handleStateChange(i, '0')}
                >|0⟩</button>
                <button
                  className={`${styles.toggleBtn} ${val === '1' ? styles.toggleBtnActive : ''}`}
                  onClick={() => handleStateChange(i, '1')}
                >|1⟩</button>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.summary}>{summary}</div>
    </div>
  );
};

export default InitialStateControls;
