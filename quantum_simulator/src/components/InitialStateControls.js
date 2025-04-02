import React from 'react';
import styled from 'styled-components';

const ControlsContainer = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f7ff;
  border-radius: 8px;
  border-left: 4px solid #3498db;
`;

const Title = styled.h3`
  font-size: 1rem;
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
`;

const QubitStatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
`;

const QubitStateControl = styled.div`
  background-color: white;
  border-radius: 6px;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
`;

const QubitLabel = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const StateSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
`;

const PhaseControl = styled.div`
  margin-top: 10px;
  display: ${props => props.show ? 'block' : 'none'};
`;

const PhaseLabel = styled.div`
  font-size: 0.9rem;
  margin-bottom: 5px;
  color: #7f8c8d;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

/**
 * Component to control the initial states of qubits
 * @param {number} numQubits - The number of qubits
 * @param {Array} initialStates - Array of initial states for each qubit
 * @param {Function} onUpdateState - Callback when a state is updated
 */
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
  
  return (
    <ControlsContainer>
      <Title>Initial Qubit States</Title>
      <QubitStatesGrid>
        {Array(numQubits).fill().map((_, index) => (
          <QubitStateControl key={index}>
            <QubitLabel>Qubit {index}</QubitLabel>
            <StateSelector>
              <RadioOption>
                <input
                  type="radio"
                  name={`qubit-${index}`}
                  value="0"
                  checked={initialStates[index]?.value === '0'}
                  onChange={() => handleStateChange(index, '0')}
                />
                |0⟩
              </RadioOption>
              <RadioOption>
                <input
                  type="radio"
                  name={`qubit-${index}`}
                  value="1"
                  checked={initialStates[index]?.value === '1'}
                  onChange={() => handleStateChange(index, '1')}
                />
                |1⟩
              </RadioOption>
            </StateSelector>
            
            <PhaseControl show={false}> {/* Phase control - disabled for now */}
              <PhaseLabel>Phase</PhaseLabel>
              <StyledSelect
                value={initialStates[index]?.phase || 0}
                onChange={(e) => handlePhaseChange(index, e.target.value)}
              >
                {phaseOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </StyledSelect>
            </PhaseControl>
          </QubitStateControl>
        ))}
      </QubitStatesGrid>
    </ControlsContainer>
  );
};

export default InitialStateControls;