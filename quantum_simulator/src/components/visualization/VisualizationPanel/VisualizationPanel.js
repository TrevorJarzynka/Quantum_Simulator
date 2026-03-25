import React, { useState } from 'react';
import StateVisualizer from '../StateVisualizer';
import MathVisualizer from '../MathVisualizer';
import DensityMatrixVisualizer from '../DensityMatrixVisualizer';
import styles from './VisualizationPanel.module.css';

const TABS = [
  { id: 'state',   label: 'State Vector' },
  { id: 'math',    label: 'Math' },
  { id: 'density', label: 'Analysis' },
];

const VisualizationPanel = ({ currentState, numQubits, currentStep }) => {
  const [activeTab, setActiveTab] = useState('state');

  const tabBar = (
    <div className={styles.tabs}>
      {TABS.map(t => (
        <button
          key={t.id}
          className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
          onClick={() => setActiveTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  if (!currentState) {
    return (
      <div className={styles.panel}>
        {tabBar}
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>⚛</span>
          <span className={styles.emptyText}>
            Build a circuit and click Run to see the quantum state visualized here.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {tabBar}
      <div className={styles.content}>
        <div className={styles.stepBadge}>
          <span className={styles.stepDot} />
          Step {currentStep}: {currentState.description}
        </div>

        {activeTab === 'state' && (
          <StateVisualizer
            stateData={currentState.state}
            numQubits={numQubits}
            step={currentStep}
            description={currentState.description}
          />
        )}
        {activeTab === 'math' && (
          <MathVisualizer
            stateData={currentState.state}
            numQubits={numQubits}
            step={currentStep}
            description={currentState.description}
          />
        )}
        {activeTab === 'density' && (
          <DensityMatrixVisualizer
            stateData={currentState.state}
            numQubits={numQubits}
          />
        )}
      </div>
    </div>
  );
};

export default VisualizationPanel;
