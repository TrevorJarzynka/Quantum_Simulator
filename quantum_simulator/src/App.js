import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';

// Import custom hooks
import { useCircuitState } from './hooks/useCircuitState';
import { useQuantumSimulation } from './hooks/useQuantumSimulation';
import { useQiskitIntegration } from './hooks/useQiskitIntegration';

// Import constants
import { COLORS } from './constants/colors';

// Import components
import CircuitEditor from './components/circuit/CircuitEditor';
import GatePalette from './components/circuit/GatePalette';
import StateVisualizer from './components/visualization/StateVisualizer';
import MathVisualizer from './components/visualization/MathVisualizer';
import SimulationControls from './components/simulation/SimulationControls';
import InitialStateControls from './components/circuit/InitialStateControls';
import DensityMatrixVisualizer from './components/visualization/DensityMatrixVisualizer';
import QiskitControls from './components/simulation/QiskitControls';
import QiskitCode from './components/simulation/QiskitCode';

// Styled components for layout
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 500;
  color: ${COLORS.TEXT_PRIMARY};
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 20px;
  margin-bottom: 20px;
`;

const CircuitSection = styled.div`
  grid-column: 1 / 3;
  background: ${COLORS.BACKGROUND};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const VisualizationSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  grid-column: 1 / 3;
`;

const Panel = styled.div`
  background: ${COLORS.BACKGROUND};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
  color: ${COLORS.DANGER};
`;

function App() {
  // Application state
  const [numQubits, setNumQubits] = useState(3);
  const maxDepth = 10;

  // Custom hooks for state management
  const circuitState = useCircuitState(numQubits, maxDepth);
  const simulation = useQuantumSimulation();
  const qiskitIntegration = useQiskitIntegration();

  // Handle simulation run
  const handleRunSimulation = async () => {
    if (qiskitIntegration.useQiskit) {
      // Run with Qiskit
      const qiskitResults = await qiskitIntegration.runQiskitSimulation(
        circuitState.circuit,
        numQubits,
        circuitState.initialStates
      );
      
      // If Qiskit returns results, use them in local simulation
      if (qiskitResults?.statevector) {
        const steps = [{
          step: 0,
          state: qiskitResults.statevector,
          description: 'Qiskit simulation result'
        }];
        // Note: We need to manually set these since useQuantumSimulation doesn't expose setters
        // This is a limitation we'll address in the next iteration
        simulation.runSimulation(
          circuitState.circuit,
          numQubits,
          circuitState.initialStates,
          maxDepth
        ).then(() => {
          // Override with Qiskit results if available
          if (qiskitResults.statevector) {
            // For now, we'll use the local simulation
            // In a production app, we'd need better integration between hooks
          }
        });
      }
    } else {
      // Run local simulation
      await simulation.runSimulation(
        circuitState.circuit,
        numQubits,
        circuitState.initialStates,
        maxDepth
      );
    }
  };

  // Handle circuit clear
  const handleClearCircuit = () => {
    circuitState.clearCircuit();
    simulation.clearResults();
    qiskitIntegration.clearResults();
  };

  // Get current state for visualization
  const currentState = simulation.getCurrentState();
  const hasError = simulation.error || qiskitIntegration.error;
  const isLoading = simulation.isLoading || qiskitIntegration.isLoading;

  return (
    <DndProvider backend={HTML5Backend}>
      <AppContainer>
        <Header>
          <Title>Quantum Circuit Simulator</Title>
          <Controls>
            <label>
              Qubits:
              <select 
                value={numQubits} 
                onChange={(e) => setNumQubits(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </Controls>
        </Header>
        
        <MainContent>
          <GatePalette 
            onGateSelect={circuitState.setSelectedGate} 
            selectedGate={circuitState.selectedGate} 
          />
          
          <CircuitSection>
            <h2>Quantum Circuit</h2>
            
            {/* Display errors */}
            {hasError && (
              <ErrorMessage>
                {simulation.error || qiskitIntegration.error}
              </ErrorMessage>
            )}
            
            {/* Initial state controls */}
            <InitialStateControls 
              numQubits={numQubits}
              initialStates={circuitState.initialStates}
              onUpdateState={circuitState.updateInitialState}
            />
            
            {/* Qiskit integration controls */}
            <QiskitControls
              useQiskit={qiskitIntegration.useQiskit}
              setUseQiskit={qiskitIntegration.setUseQiskit}
              backends={qiskitIntegration.backends}
              selectedBackend={qiskitIntegration.selectedBackend}
              setSelectedBackend={qiskitIntegration.setSelectedBackend}
              onGenerateCode={() => qiskitIntegration.generateCode(
                circuitState.circuit, 
                numQubits, 
                circuitState.initialStates
              )}
              isLoading={isLoading}
              error={qiskitIntegration.error}
            />
            
            {/* Circuit editor */}
            <CircuitEditor 
              circuit={circuitState.circuit}
              onCellClick={circuitState.handleCellClick}
              onRemoveGate={circuitState.removeGate}
              selectedGate={circuitState.selectedGate}
            />
            
            {/* Simulation controls */}
            <SimulationControls 
              onRun={handleRunSimulation}
              onClear={handleClearCircuit}
              onStepBack={simulation.stepBack}
              onStepForward={simulation.stepForward}
              currentStep={simulation.currentStep}
              maxSteps={simulation.simulationResults ? simulation.simulationResults.length - 1 : 0}
              hasResults={simulation.hasResults}
              isLoading={isLoading}
            />
            
            {/* Display Qiskit code if available */}
            {qiskitIntegration.qiskitCode && (
              <QiskitCode code={qiskitIntegration.qiskitCode} />
            )}
          </CircuitSection>
          
          <VisualizationSection>
            <Panel>
              <h2>Quantum State</h2>
              {currentState ? (
                <StateVisualizer 
                  stateData={currentState.state}
                  numQubits={numQubits}
                  step={simulation.currentStep}
                  description={currentState.description}
                />
              ) : (
                <p>Run the simulation to see quantum states</p>
              )}
            </Panel>
            
            <Panel>
              <h2>Mathematical Representation</h2>
              {currentState ? (
                <MathVisualizer 
                  stateData={currentState.state}
                  numQubits={numQubits}
                  step={simulation.currentStep}
                  description={currentState.description}
                />
              ) : (
                <p>Run the simulation to see mathematical representation</p>
              )}
            </Panel>
            
            <Panel>
              <h2>Advanced Quantum Analysis</h2>
              {currentState ? (
                <DensityMatrixVisualizer 
                  stateData={currentState.state}
                  numQubits={numQubits}
                />
              ) : (
                <p>Run the simulation to see density matrix and entanglement measures</p>
              )}
            </Panel>
          </VisualizationSection>
        </MainContent>
      </AppContainer>
    </DndProvider>
  );
}

export default App;