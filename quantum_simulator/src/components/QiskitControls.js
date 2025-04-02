import React from 'react';
import styled from 'styled-components';

const ControlsContainer = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #9b59b6;
`;

const Title = styled.h3`
  font-size: 1rem;
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
`;

const QiskitOption = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const BackendSelector = styled.div`
  margin-top: 10px;
  margin-bottom: 15px;
`;

const StyledSelect = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  width: 100%;
  max-width: 300px;
`;

const GenerateCodeButton = styled.button`
  padding: 8px 16px;
  background-color: #9b59b6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #8e44ad;
  }
  
  &:disabled {
    background-color: #d1d1d1;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 10px;
  font-size: 0.9rem;
`;

/**
 * Qiskit integration controls component
 */
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
    <ControlsContainer>
      <Title>Qiskit Integration</Title>
      
      <QiskitOption>
        <input
          type="checkbox"
          id="useQiskit"
          checked={useQiskit}
          onChange={(e) => setUseQiskit(e.target.checked)}
          disabled={isLoading}
        />
        <label htmlFor="useQiskit" style={{ marginLeft: '8px' }}>
          Use Qiskit for simulation
        </label>
      </QiskitOption>
      
      {useQiskit && (
        <>
          <BackendSelector>
            <label htmlFor="backendSelect">Select Qiskit Backend:</label>
            <StyledSelect
              id="backendSelect"
              value={selectedBackend}
              onChange={(e) => setSelectedBackend(e.target.value)}
              disabled={isLoading}
            >
              {backends.map((backend) => (
                <option key={backend.name} value={backend.name}>
                  {backend.name} - {backend.description}
                </option>
              ))}
            </StyledSelect>
          </BackendSelector>
          
          <GenerateCodeButton 
            onClick={onGenerateCode}
            disabled={isLoading}
          >
            Generate Qiskit Code
          </GenerateCodeButton>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </>
      )}
    </ControlsContainer>
  );
};

export default QiskitControls;