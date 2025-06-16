// src/components/circuit/InitialStateControls/InitialStateControls.js
import React from 'react';
import styles from './InitialStateControls.module.css';

const InitialStateControls = ({ numQubits, initialStates, onUpdateState }) => {
  // Phase options in radians
  const phaseOptions = [
    { value: 0, label: '0' },
    { value: Math.PI/4, label: 'π/4' },
    { value: Math.PI/2, label: 'π/2' },
    { value: 3*Math.PI/4, label: '3π/4' },
    { value: Math.PI, label: 'π' },
    { value: 5*Math.PI/4, label: '5π/4' },
    { value: 3*Math.PI/2, label: '3π/2' },
    { value: 7*Math.PI/4, label: '7π/4' }
  ];
  
  const handleStateChange = (qubitIndex, newValue) => {
    onUpdateState(qubitIndex, {
      ...initialStates[qubitIndex],
      value: newValue
    });
  };
  
  const handlePhaseChange = (qubitIndex, newPhase) => {
    onUpdateState(qubitIndex, {
      ...initialStates[qubitIndex],
      phase: parseFloat(newPhase)
    });
  };

  const generateStatePreview = () => {
    let stateString = '|';
    for (let i = 0; i < numQubits; i++) {
      stateString += initialStates[i]?.value || '0';
    }
    stateString += '⟩';
    return stateString;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Initial Qubit States</h3>
      
      <div className={styles.qubitStatesGrid}>
        {Array(numQubits).fill().map((_, index) => (
          <div 
            key={index} 
            className={styles.qubitStateControl}
            data-state={initialStates[index]?.value || '0'}
          >
            <div className={styles.qubitLabel}>
              Qubit {index}
            </div>
            
            <div className={styles.stateSelector}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name={`qubit-${index}`}
                  value="0"
                  checked={initialStates[index]?.value === '0'}
                  onChange={() => handleStateChange(index, '0')}
                />
                <span className={styles.stateLabel}>|0⟩</span>
              </label>
              
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name={`qubit-${index}`}
                  value="1"
                  checked={initialStates[index]?.value === '1'}
                  onChange={() => handleStateChange(index, '1')}
                />
                <span className={styles.stateLabel}>|1⟩</span>
              </label>
            </div>
            
            {/* Phase control - currently hidden but ready for future use */}
            <div className={`${styles.phaseControl} ${false ? styles.phaseControlVisible : ''}`}>
              <div className={styles.phaseLabel}>Phase</div>
              <select
                className={styles.styledSelect}
                value={initialStates[index]?.phase || 0}
                onChange={(e) => handlePhaseChange(index, e.target.value)}
              >
                {phaseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.statePreview}>
              |{initialStates[index]?.value || '0'}⟩
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.helperText}>
        Initial state: {generateStatePreview()}
      </div>
    </div>
  );
};

export default InitialStateControls;