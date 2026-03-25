import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useCircuitState } from './hooks/useCircuitState';
import { useQuantumSimulation } from './hooks/useQuantumSimulation';
import { useQiskitIntegration } from './hooks/useQiskitIntegration';

import CircuitEditor from './components/circuit/CircuitEditor';
import GatePalette from './components/circuit/GatePalette';
import InitialStateControls from './components/circuit/InitialStateControls';
import VisualizationPanel from './components/visualization/VisualizationPanel';

import styles from './App.module.css';

function App() {
  const [numQubits, setNumQubits] = useState(3);
  const maxDepth = 10;

  const circuitState = useCircuitState(numQubits, maxDepth);
  const simulation = useQuantumSimulation();
  const qiskitIntegration = useQiskitIntegration();

  const handleRunSimulation = async () => {
    await simulation.runSimulation(
      circuitState.circuit,
      numQubits,
      circuitState.initialStates,
      maxDepth
    );
  };

  const handleClearCircuit = () => {
    circuitState.clearCircuit();
    simulation.clearResults();
    qiskitIntegration.clearResults();
  };

  const currentState = simulation.getCurrentState();
  const hasError = simulation.error;
  const isLoading = simulation.isLoading;
  const maxSteps = simulation.simulationResults ? simulation.simulationResults.length - 1 : 0;
  const dotCount = Math.min(maxSteps, 10); // show at most 10 dots

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.app}>

        {/* ── HEADER ── */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚛</span>
            <span className={styles.title}>Quantum Simulator</span>
          </div>

          <div className={styles.headerCenter}>
            {simulation.hasResults ? (
              <div className={styles.stepTrack}>
                <button
                  className={styles.stepBtn}
                  onClick={simulation.stepBack}
                  disabled={simulation.currentStep === 0 || isLoading}
                  title="Previous step"
                >
                  ◀
                </button>
                <div className={styles.stepDots}>
                  {Array(dotCount + 1).fill(null).map((_, i) => (
                    <span
                      key={i}
                      className={`${styles.dot} ${i <= simulation.currentStep ? styles.dotActive : ''}`}
                    />
                  ))}
                  {maxSteps > 10 && <span className={styles.stepLabel}>…</span>}
                </div>
                <span className={styles.stepLabel}>
                  {simulation.currentStep} / {maxSteps}
                </span>
                <button
                  className={styles.stepBtn}
                  onClick={simulation.stepForward}
                  disabled={simulation.currentStep === maxSteps || isLoading}
                  title="Next step"
                >
                  ▶
                </button>
              </div>
            ) : (
              <span className={styles.stepLabel} style={{ opacity: 0.35 }}>
                Build your circuit, then hit Run
              </span>
            )}
          </div>

          <div className={styles.headerRight}>
            <span className={styles.qubitLabel}>Qubits</span>
            <select
              className={styles.qubitSelect}
              value={numQubits}
              onChange={e => setNumQubits(parseInt(e.target.value))}
            >
              {[1,2,3,4,5,6,7,8].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>

            <button
              className={styles.runBtn}
              onClick={handleRunSimulation}
              disabled={isLoading}
            >
              {isLoading ? (
                <><span className={styles.runBtnSpinner} /> Simulating…</>
              ) : (
                <>▶ Run</>
              )}
            </button>

            <button
              className={styles.clearBtn}
              onClick={handleClearCircuit}
              disabled={isLoading}
            >
              ✕ Clear
            </button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className={styles.body}>

          {/* Left sidebar: gate palette */}
          <aside className={styles.sidebar}>
            <GatePalette
              onGateSelect={circuitState.setSelectedGate}
              selectedGate={circuitState.selectedGate}
            />
          </aside>

          {/* Center: circuit editor */}
          <main className={styles.main}>
            {hasError && (
              <div className={styles.errorBanner}>{simulation.error}</div>
            )}

            <div className={styles.mainCard}>
              <div className={styles.mainCardTitle}>Initial States</div>
              <InitialStateControls
                numQubits={numQubits}
                initialStates={circuitState.initialStates}
                onUpdateState={circuitState.updateInitialState}
              />
            </div>

            <div className={styles.mainCard}>
              <div className={styles.mainCardTitle}>Circuit</div>
              <CircuitEditor
                circuit={circuitState.circuit}
                onCellClick={circuitState.handleCellClick}
                onRemoveGate={circuitState.removeGate}
                selectedGate={circuitState.selectedGate}
                pendingMultiQubitGate={circuitState.pendingMultiQubitGate}
              />
            </div>
          </main>

          {/* Right panel: visualizations */}
          <aside className={styles.panel}>
            <VisualizationPanel
              currentState={currentState}
              numQubits={numQubits}
              currentStep={simulation.currentStep}
            />
          </aside>
        </div>

      </div>
    </DndProvider>
  );
}

export default App;
