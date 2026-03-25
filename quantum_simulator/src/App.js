import React, { useState, useEffect, useMemo } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useCircuitState } from './hooks/useCircuitState';
import { useQuantumSimulation } from './hooks/useQuantumSimulation';
import { useQiskitIntegration } from './hooks/useQiskitIntegration';

import CircuitEditor from './components/circuit/CircuitEditor';
import GatePalette from './components/circuit/GatePalette';
import InitialStateControls from './components/circuit/InitialStateControls';
import VisualizationPanel from './components/visualization/VisualizationPanel';

import { buildPresetCircuit } from './constants/presets';
import styles from './App.module.css';

function App() {
  const [numQubits, setNumQubits] = useState(3);
  const maxDepth = 10;

  const circuitState = useCircuitState(numQubits, maxDepth);
  const simulation = useQuantumSimulation();
  const qiskitIntegration = useQiskitIntegration();

  // Preset loading: store pending preset, apply after circuit reinitializes
  const [pendingPreset, setPendingPreset] = useState(null);

  const handleLoadPreset = (preset) => {
    simulation.clearResults();
    qiskitIntegration.clearResults();
    setPendingPreset(preset);
    setNumQubits(preset.numQubits);
  };

  // Apply preset once circuit has the correct qubit count
  useEffect(() => {
    if (!pendingPreset) return;
    if (circuitState.circuit.length !== pendingPreset.numQubits) return;
    const built = buildPresetCircuit(pendingPreset, maxDepth);
    circuitState.importCircuit({
      numQubits: pendingPreset.numQubits,
      circuit: built,
      initialStates: Array(pendingPreset.numQubits).fill({ value: '0', phase: 0 }),
    });
    setPendingPreset(null);
  }, [pendingPreset, circuitState.circuit.length]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Determine which circuit column corresponds to the current simulation step
  const activeColumn = simulation.hasResults && simulation.currentStep > 0
    ? (simulation.simulationResults[simulation.currentStep]?.column ?? null)
    : null;

  const currentState = simulation.getCurrentState();
  const hasError = simulation.error;
  const isLoading = simulation.isLoading;
  const maxSteps = simulation.simulationResults ? simulation.simulationResults.length - 1 : 0;
  const dotCount = Math.min(maxSteps, 10);

  // Circuit statistics
  const circuitStats = useMemo(() => {
    let gates = 0, tCount = 0, cnotCount = 0, depth = 0;
    if (!circuitState.circuit.length) return { gates, tCount, cnotCount, depth };
    for (let col = 0; col < maxDepth; col++) {
      let hasGate = false;
      for (let row = 0; row < numQubits; row++) {
        const g = circuitState.circuit[row]?.[col]?.gate;
        if (g) {
          gates++;
          hasGate = true;
          if (g.id === 't' || g.id === 'tdg') tCount++;
          if (g.id === 'cx') cnotCount++;
        }
      }
      if (hasGate) depth++;
    }
    return { gates, tCount, cnotCount, depth };
  }, [circuitState.circuit, numQubits, maxDepth]);

  return (
    <>
    <Analytics />
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
                >◀</button>
                <div className={styles.stepDots}>
                  {Array(dotCount + 1).fill(null).map((_, i) => (
                    <span
                      key={i}
                      className={`${styles.dot} ${i <= simulation.currentStep ? styles.dotActive : ''}`}
                      onClick={() => simulation.jumpToStep(i)}
                      title={`Step ${i}`}
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
                >▶</button>
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
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
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

          {/* Left sidebar: gate palette + presets */}
          <aside className={styles.sidebar}>
            <GatePalette
              onGateSelect={circuitState.setSelectedGate}
              selectedGate={circuitState.selectedGate}
              onLoadPreset={handleLoadPreset}
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
                activeColumn={activeColumn}
              />
            </div>

            {/* Circuit statistics */}
            <div className={styles.mainCard}>
              <div className={styles.mainCardTitle}>Circuit Statistics</div>
              <div className={styles.statsBar}>
                <div className={styles.statChip}>
                  <span className={styles.statLabel}>Gates</span>
                  <span className={styles.statValue}>{circuitStats.gates}</span>
                </div>
                <div className={styles.statChip}>
                  <span className={styles.statLabel}>Depth</span>
                  <span className={styles.statValue}>{circuitStats.depth}</span>
                </div>
                <div className={styles.statChip}>
                  <span className={styles.statLabel}>CNOT</span>
                  <span className={styles.statValue}>{circuitStats.cnotCount}</span>
                </div>
                <div className={styles.statChip}>
                  <span className={styles.statLabel}>T-count</span>
                  <span className={styles.statValue}>{circuitStats.tCount}</span>
                </div>
                <div className={styles.statChip}>
                  <span className={styles.statLabel}>Qubits</span>
                  <span className={styles.statValue}>{numQubits}</span>
                </div>
                <div className={styles.statChip}>
                  <span className={styles.statLabel}>Hilbert dim</span>
                  <span className={styles.statValue}>2^{numQubits} = {Math.pow(2, numQubits)}</span>
                </div>
              </div>
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
    </>
  );
}

export default App;
