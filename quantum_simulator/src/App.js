import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';

// Import core components
import CircuitEditor from './components/CircuitEditor';
import GatePalette from './components/GatePalette';
import StateVisualizer from './components/StateVisualizer';
import MathVisualizer from './components/MathVisualizer';
import SimulationControls from './components/SimulationControls';
import InitialStateControls from './components/InitialStateControls';
import DensityMatrixVisualizer from './components/DensityMatrixVisualizer';
import QiskitControls from './components/QiskitControls'; // For Qiskit integration
import QiskitCode from './components/QiskitCode'; // For displaying Qiskit code
import QiskitIntegration from './services/QiskitIntegration'; // Import Qiskit service

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
  color: #2c3e50;
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
  background: white;
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
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
`;

function App() {
  // State for the quantum circuit
  const [numQubits, setNumQubits] = useState(3);
  const [maxDepth] = useState(10);
  const [circuit, setCircuit] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationResults, setSimulationResults] = useState(null);
  const [selectedGate, setSelectedGate] = useState(null);
  const [initialStates, setInitialStates] = useState([]); // For initial qubit states
  const [qiskitBackends, setQiskitBackends] = useState([]); // Available Qiskit backends
  const [selectedBackend, setSelectedBackend] = useState('simulator'); // Default to local simulator
  const [qiskitCode, setQiskitCode] = useState(''); // Python code for Qiskit
  const [useQiskit, setUseQiskit] = useState(false); // Whether to use Qiskit for simulations
  const [isLoading, setIsLoading] = useState(false); // Loading state for Qiskit operations
  const [qiskitResults, setQiskitResults] = useState(null); // Results from Qiskit
  const [error, setError] = useState(null); // Error state
  
  // Initialize circuit when parameters change
  useEffect(() => {
    initializeCircuit();
  }, [numQubits, maxDepth]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Fetch available Qiskit backends on component mount
  useEffect(() => {
    fetchQiskitBackends();
  }, []);
  
  // Initialize empty circuit and set default initial states
  const initializeCircuit = () => {
    const newCircuit = Array(numQubits).fill().map(() => 
      Array(maxDepth).fill().map(() => ({ gate: null }))
    );
    setCircuit(newCircuit);
    
    // Initialize all qubits to |0⟩ state
    const newInitialStates = Array(numQubits).fill().map(() => ({ 
      value: '0',  // Default to |0⟩ state
      phase: 0      // No additional phase
    }));
    setInitialStates(newInitialStates);
    
    setSimulationResults(null);
    setCurrentStep(0);
  };
  
  // Update a specific qubit's initial state
  const updateInitialState = (qubitIndex, newState) => {
    const newInitialStates = [...initialStates];
    newInitialStates[qubitIndex] = newState;
    setInitialStates(newInitialStates);
    setSimulationResults(null); // Reset simulation when initial state changes
  };
  
  // Fetch available Qiskit backends
  const fetchQiskitBackends = async () => {
    try {
      // For development, we'll use mock data unless API is available
      try {
        const backends = await QiskitIntegration.getQiskitBackends();
        setQiskitBackends(backends);
      } catch (err) {
        console.log('Using mock backends:', err);
        // Mock backends if API is not available
        setQiskitBackends([
          { name: 'simulator', type: 'simulator', description: 'Local simulator' },
          { name: 'ibmq_qasm_simulator', type: 'simulator', description: 'IBM QASM Simulator' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching backends:', error);
      setError('Failed to load Qiskit backends');
    }
  };

  // Generate Qiskit code for the current circuit
  const generateQiskitCode = () => {
    const code = QiskitIntegration.generateQiskitCode(circuit, numQubits, initialStates);
    setQiskitCode(code);
  };

  // Run simulation either locally or with Qiskit
  const runSimulation = async () => {
    setError(null);
    
    if (useQiskit) {
      setIsLoading(true);
      try {
        // Convert circuit to Qiskit format
        const qiskitCircuitData = QiskitIntegration.convertToQiskitCircuit(
          circuit, numQubits, initialStates
        );
        
        // Generate code for reference
        generateQiskitCode();
        
        // Try to run on actual Qiskit API
        try {
          const results = await QiskitIntegration.runQiskitSimulation(
            qiskitCircuitData,
            { backend: selectedBackend, shots: 1024 }
          );
          setQiskitResults(results);
          
          // If we got statevector back, we can use it in our local visualizer too
          if (results.statevector) {
            const steps = [{
              step: 0,
              state: results.statevector,
              description: 'Qiskit simulation result'
            }];
            setSimulationResults(steps);
            setCurrentStep(0);
          }
        } catch (apiError) {
          console.log('Using mock simulation:', apiError);
          // Fall back to mock simulation
          const mockResults = QiskitIntegration.mockQiskitSimulation(
            qiskitCircuitData,
            { shots: 1024 }
          );
          setQiskitResults(mockResults);
          
          // Create steps format for visualizer
          const steps = [{
            step: 0,
            state: mockResults.statevector,
            description: 'Mock Qiskit simulation result'
          }];
          setSimulationResults(steps);
          setCurrentStep(0);
        }
      } catch (error) {
        console.error('Error running Qiskit simulation:', error);
        setError('Failed to run Qiskit simulation');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Run local simulation
      const localResults = simulateCircuit(circuit, initialStates);
      setSimulationResults(localResults);
      setCurrentStep(0);
    }
  };
  
  // Debug function to log the current state
  const debugState = (state, message) => {
    console.log(message, JSON.parse(JSON.stringify(state)));
  };
  
  // Create initial quantum state based on initialStates array
  const createInitialState = (numQubits, initialStates) => {
    const size = Math.pow(2, numQubits);
    const state = Array(size).fill().map(() => ({ re: 0, im: 0 }));
    
    // Calculate the integer value of the basis state from qubit values
    let basisStateIndex = 0;
    for (let i = 0; i < numQubits; i++) {
      if (initialStates[i].value === '1') {
        basisStateIndex |= (1 << i);
      }
    }
    
    // Set the amplitude of the basis state
    state[basisStateIndex] = { re: 1, im: 0 };
    
    return state;
  };
  
  // Gate matrices
  // Identity matrix is defined for completeness but not directly used in this version
  // const identityMatrix = [
  //   [{ re: 1, im: 0 }, { re: 0, im: 0 }],
  //   [{ re: 0, im: 0 }, { re: 1, im: 0 }]
  // ];
  
  const hadamardMatrix = [
    [{ re: 1/Math.sqrt(2), im: 0 }, { re: 1/Math.sqrt(2), im: 0 }],
    [{ re: 1/Math.sqrt(2), im: 0 }, { re: -1/Math.sqrt(2), im: 0 }]
  ];
  
  const xMatrix = [
    [{ re: 0, im: 0 }, { re: 1, im: 0 }],
    [{ re: 1, im: 0 }, { re: 0, im: 0 }]
  ];
  
  const yMatrix = [
    [{ re: 0, im: 0 }, { re: 0, im: -1 }],
    [{ re: 0, im: 1 }, { re: 0, im: 0 }]
  ];
  
  const zMatrix = [
    [{ re: 1, im: 0 }, { re: 0, im: 0 }],
    [{ re: 0, im: 0 }, { re: -1, im: 0 }]
  ];
  
  const sMatrix = [
    [{ re: 1, im: 0 }, { re: 0, im: 0 }],
    [{ re: 0, im: 0 }, { re: 0, im: 1 }]
  ];
  
  const tMatrix = [
    [{ re: 1, im: 0 }, { re: 0, im: 0 }],
    [{ re: 0, im: 0 }, { re: Math.cos(Math.PI/4), im: Math.sin(Math.PI/4) }]
  ];
  
  // Complex number operations
  const complexAdd = (a, b) => ({ 
    re: a.re + b.re, 
    im: a.im + b.im 
  });
  
  const complexMultiply = (a, b) => ({ 
    re: (a.re * b.re) - (a.im * b.im), 
    im: (a.re * b.im) + (a.im * b.re) 
  });
  
  // Apply a single-qubit gate using matrix multiplication
  const applySingleQubitGate = (state, gateMatrix, qubit, numQubits) => {
    const size = Math.pow(2, numQubits);
    const newState = Array(size).fill().map(() => ({ re: 0, im: 0 }));
    
    // For each basis state in the state vector
    for (let i = 0; i < size; i++) {
      // Determine if the qubit is 0 or 1 in this basis state
      const qubitValue = (i >> qubit) & 1;
      
      // Calculate the index with the qubit flipped
      const flippedIndex = i ^ (1 << qubit);
      
      // Calculate the contributions to the new amplitudes
      if (qubitValue === 0) {
        // |...0...⟩ maps to gateMatrix[0][0]|...0...⟩ + gateMatrix[0][1]|...1...⟩
        newState[i] = complexAdd(
          newState[i], 
          complexMultiply(gateMatrix[0][0], state[i])
        );
        newState[flippedIndex] = complexAdd(
          newState[flippedIndex], 
          complexMultiply(gateMatrix[0][1], state[i])
        );
      } else {
        // |...1...⟩ maps to gateMatrix[1][0]|...0...⟩ + gateMatrix[1][1]|...1...⟩
        newState[flippedIndex] = complexAdd(
          newState[flippedIndex], 
          complexMultiply(gateMatrix[1][0], state[i])
        );
        newState[i] = complexAdd(
          newState[i], 
          complexMultiply(gateMatrix[1][1], state[i])
        );
      }
    }
    
    // Copy the new state back to the original state array
    for (let i = 0; i < size; i++) {
      state[i] = newState[i];
    }
  };
  
  // Improved simulation function with correct gate application
  const simulateCircuit = (circuit, initialStates) => {
    // Create the initial state based on initialStates
    const initialState = createInitialState(numQubits, initialStates);
    const steps = [{ 
      step: 0, 
      state: initialState, 
      description: 'Initial state' 
    }];
    
    // Check if the circuit has any gates at all
    let hasAnyGates = false;
    for (let col = 0; col < maxDepth; col++) {
      for (let row = 0; row < numQubits; row++) {
        if (circuit[row][col].gate !== null) {
          hasAnyGates = true;
          break;
        }
      }
      if (hasAnyGates) break;
    }
    
    if (!hasAnyGates) {
      // If no gates, just return the initial state
      return steps;
    }
    
    // For each column (time step) of the circuit
    for (let col = 0; col < maxDepth; col++) {
      let hasGatesInColumn = false;
      let gatesApplied = [];
      
      // Check if this column has any gates and collect them
      for (let row = 0; row < numQubits; row++) {
        if (circuit[row][col].gate !== null) {
          hasGatesInColumn = true;
          gatesApplied.push({
            qubit: row,
            gate: circuit[row][col].gate
          });
        }
      }
      
      if (hasGatesInColumn) {
        // Get the previous state
        const prevState = JSON.parse(JSON.stringify(steps[steps.length - 1].state));
        debugState(prevState, "Starting column " + col + " with state:");
        
        // Start with a copy of the previous state
        let newState = JSON.parse(JSON.stringify(prevState));
        let gateDescriptions = [];
        
        // Apply each gate in sequence
        for (const { qubit, gate } of gatesApplied) {
          debugState(newState, `Before applying ${gate.id} to qubit ${qubit}:`);
          
          // Apply the gate to the specific qubit
          switch (gate.id) {
            case 'h':
              applySingleQubitGate(newState, hadamardMatrix, qubit, numQubits);
              gateDescriptions.push(`Hadamard (H) to qubit ${qubit}`);
              break;
            case 'x':
              applySingleQubitGate(newState, xMatrix, qubit, numQubits);
              gateDescriptions.push(`X gate to qubit ${qubit}`);
              break;
            case 'y':
              applySingleQubitGate(newState, yMatrix, qubit, numQubits);
              gateDescriptions.push(`Y gate to qubit ${qubit}`);
              break;
            case 'z':
              applySingleQubitGate(newState, zMatrix, qubit, numQubits);
              gateDescriptions.push(`Z gate to qubit ${qubit}`);
              break;
            case 's':
              applySingleQubitGate(newState, sMatrix, qubit, numQubits);
              gateDescriptions.push(`S gate to qubit ${qubit}`);
              break;
            case 't':
              applySingleQubitGate(newState, tMatrix, qubit, numQubits);
              gateDescriptions.push(`T gate to qubit ${qubit}`);
              break;
            case 'measure':
              // Measurement would collapse the state, but we'll just record it
              gateDescriptions.push(`Measurement on qubit ${qubit}`);
              break;
            default:
              gateDescriptions.push(`${gate.name} gate to qubit ${qubit}`);
          }
          
          debugState(newState, `After applying ${gate.id} to qubit ${qubit}:`);
        }
        
        // Create a description of the applied gates
        const description = `Applied ${gateDescriptions.join(', ')}`;
        
        // Add the new state to our steps
        steps.push({
          step: steps.length,
          state: newState,
          description
        });
      }
    }
    
    return steps;
  };

  // Update circuit with a new gate
  const placeGate = (row, col, gate) => {
    const newCircuit = [...circuit];
    newCircuit[row][col] = { gate };
    setCircuit(newCircuit);
    setSimulationResults(null); // Reset simulation when circuit changes
  };
  
  // Handle gate palette selection
  const handleGateSelect = (gate) => {
    setSelectedGate(gate);
  };
  
  // Handle circuit cell click
  const handleCellClick = (row, col) => {
    if (selectedGate) {
      placeGate(row, col, selectedGate);
    }
  };
  
  // Remove a gate from the circuit
  const removeGate = (row, col) => {
    const newCircuit = [...circuit];
    newCircuit[row][col] = { gate: null };
    setCircuit(newCircuit);
    setSimulationResults(null);
  };
  
  // Clear the entire circuit
  const clearCircuit = () => {
    initializeCircuit();
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <AppContainer>
        <Header>
          <Title>Quantum Circuit Simulator</Title>
          <Controls>
            <label>
              Qubits:
              <select value={numQubits} onChange={(e) => setNumQubits(parseInt(e.target.value))}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
          </Controls>
        </Header>
        
        <MainContent>
          <GatePalette onGateSelect={handleGateSelect} selectedGate={selectedGate} />
          
          <CircuitSection>
            <h2>Quantum Circuit</h2>
            
            {/* Initial state controls */}
            <InitialStateControls 
              numQubits={numQubits}
              initialStates={initialStates}
              onUpdateState={updateInitialState}
            />
            
            {/* Qiskit integration controls */}
            <QiskitControls
              useQiskit={useQiskit}
              setUseQiskit={setUseQiskit}
              backends={qiskitBackends}
              selectedBackend={selectedBackend}
              setSelectedBackend={setSelectedBackend}
              onGenerateCode={generateQiskitCode}
              isLoading={isLoading}
              error={error}
            />
            
            <CircuitEditor 
              circuit={circuit}
              onCellClick={handleCellClick}
              onRemoveGate={removeGate}
              selectedGate={selectedGate}
            />
            
            <SimulationControls 
              onRun={runSimulation}
              onClear={clearCircuit}
              onStepBack={() => setCurrentStep(Math.max(0, currentStep - 1))}
              onStepForward={() => setCurrentStep(Math.min(
                simulationResults ? simulationResults.length - 1 : 0, 
                currentStep + 1
              ))}
              currentStep={currentStep}
              maxSteps={simulationResults ? simulationResults.length - 1 : 0}
              hasResults={!!simulationResults}
              isLoading={isLoading}
            />
            
            {/* Display Qiskit code if available */}
            {qiskitCode && <QiskitCode code={qiskitCode} />}
          </CircuitSection>
          
          <VisualizationSection>
            <Panel>
              <h2>Quantum State</h2>
              {simulationResults ? (
                <StateVisualizer 
                  stateData={simulationResults[currentStep].state}
                  numQubits={numQubits}
                  step={currentStep}
                  description={simulationResults[currentStep].description}
                />
              ) : (
                <p>Run the simulation to see quantum states</p>
              )}
            </Panel>
            
            <Panel>
              <h2>Mathematical Representation</h2>
              {simulationResults ? (
                <MathVisualizer 
                  stateData={simulationResults[currentStep].state}
                  numQubits={numQubits}
                  step={currentStep} 
                  description={simulationResults[currentStep].description}
                />
              ) : (
                <p>Run the simulation to see mathematical representation</p>
              )}
            </Panel>
            
            {/* Add the new Density Matrix Visualizer */}
            <Panel>
              <h2>Advanced Quantum Analysis</h2>
              {simulationResults ? (
                <DensityMatrixVisualizer 
                  stateData={simulationResults[currentStep].state}
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