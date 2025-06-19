// src/components/simulation/SimulationControls/SimulationControls.js
import React from 'react';
import styles from './SimulationControls.module.css';

const SimulationControls = ({ 
  onRun, 
  onClear, 
  onStepBack, 
  onStepForward, 
  currentStep, 
  maxSteps,
  hasResults,
  isLoading
}) => {
  


  return (
    <div className={styles.container}>
      {/* Main Control Buttons */}
      <div className={styles.buttonGroup}>
        <button 
          className={`${styles.button} ${styles.primaryButton} ${isLoading ? styles.loadingButton : ''}`}
          onClick={onRun} 
          disabled={isLoading}
          aria-label={isLoading ? 'Simulation running' : 'Run quantum simulation'}
        >
          {isLoading ? (
            <>
              <div className={styles.spinner} />
              Simulating...
            </>
          ) : (
            <>
              Run Simulation
            </>
          )}
        </button>
        
        <button 
          className={`${styles.button} ${styles.secondaryButton}`}
          onClick={onClear} 
          disabled={isLoading}
          aria-label="Clear circuit"
        >
          Clear Circuit
        </button>
      </div>
      
      
      {/* Step Controls */}
      {hasResults && (
        <div className={styles.stepControls}>
          <button
            className={styles.stepButton}
            onClick={onStepBack}
            disabled={currentStep === 0 || isLoading}
            aria-label="Previous step"
            title="Previous step"
          >
            ◀
          </button>
          
          <div className={styles.stepIndicator}>
            {currentStep} / {maxSteps}
          </div>
          
          <button
            className={styles.stepButton}
            onClick={onStepForward}
            disabled={currentStep === maxSteps || isLoading}
            aria-label="Next step"
            title="Next step"
          >
            ▶
          </button>
        </div>
      )}
      
      {/* Progress Bar */}
      {hasResults && (
        <div 
          className={styles.progressBar}
          style={{ 
            width: `${maxSteps > 0 ? (currentStep / maxSteps) * 100 : 0}%` 
          }}
        />
      )}
    </div>
  );
};

export default SimulationControls;