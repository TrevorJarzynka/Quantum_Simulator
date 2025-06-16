// src/components/simulation/QiskitControls/QiskitControls.js
import React from 'react';
import styles from './QiskitControls.module.css';

const QiskitControls = ({
  useQiskit,
  setUseQiskit,
  backends,
  selectedBackend,
  setSelectedBackend,
  onGenerateCode,
  isLoading,
  error
}) => {
  return (
    <div className={`${styles.container} ${isLoading ? styles.loading : ''}`}>
      <h3 className={styles.title}>Qiskit Integration</h3>
      
      <div className={styles.qiskitOption}>
        <input
          type="checkbox"
          id="useQiskit"
          checked={useQiskit}
          onChange={(e) => setUseQiskit(e.target.checked)}
          disabled={isLoading}
        />
        <label htmlFor="useQiskit">
          Use Qiskit for simulation
        </label>
      </div>
      
      {useQiskit && (
        <>
          <div className={`${styles.backendSelector} ${useQiskit ? styles.backendSelectorVisible : ''}`}>
            <label htmlFor="backendSelect">Select Qiskit Backend:</label>
            <select
              id="backendSelect"
              className={styles.styledSelect}
              value={selectedBackend}
              onChange={(e) => setSelectedBackend(e.target.value)}
              disabled={isLoading}
            >
              {backends.map((backend) => (
                <option key={backend.name} value={backend.name}>
                  {backend.name} - {backend.description}
                  {backend.available !== undefined && (
                    <span className={backend.available ? styles.statusOnline : styles.statusOffline}>
                      {backend.available ? ' (Online)' : ' (Offline)'}
                    </span>
                  )}
                </option>
              ))}
            </select>
            
            {selectedBackend && (
              <div className={styles.backendInfo}>
                <div>
                  <strong>Selected:</strong> {selectedBackend}
                  <span className={styles.backendStatus}>
                    <span className={styles.statusOnline}>Online</span>
                  </span>
                </div>
                <div>
                  Run quantum circuits on IBM's quantum computers and simulators
                </div>
              </div>
            )}
          </div>
          
          <button 
            className={styles.generateCodeButton}
            onClick={onGenerateCode}
            disabled={isLoading}
            aria-label="Generate Qiskit Python code"
          >
            Generate Qiskit Code
          </button>
          
          <div className={styles.featureList}>
            <div className={styles.feature}>
              Real quantum hardware access
            </div>
            <div className={styles.feature}>
              Advanced quantum simulators
            </div>
            <div className={styles.feature}>
              Python code generation
            </div>
            <div className={styles.feature}>
              Industry-standard platform
            </div>
          </div>
        </>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

export default QiskitControls;