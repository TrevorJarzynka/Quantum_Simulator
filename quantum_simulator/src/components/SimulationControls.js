import React from 'react';
import styled from 'styled-components';

const ControlsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-right: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.primary ? '#3498db' : '#95a5a6'};
  color: white;
  font-weight: 500;
  cursor: ${props => (props.disabled || props.isLoading) ? 'not-allowed' : 'pointer'};
  opacity: ${props => (props.disabled || props.isLoading) ? 0.6 : 1};
  transition: background-color 0.2s;
  position: relative;
  
  &:hover {
    background-color: ${props => (props.disabled || props.isLoading) ? 
      (props.primary ? '#3498db' : '#95a5a6') : 
      (props.primary ? '#2980b9' : '#7f8c8d')};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.5);
  }
`;

const StepControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StepButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background-color: ${props => props.disabled ? '#ecf0f1' : '#3498db'};
  color: white;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? '#ecf0f1' : '#2980b9'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.5);
  }
`;

const StepIndicator = styled.div`
  padding: 8px 16px;
  background-color: #ecf0f1;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 8px;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

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
    <ControlsContainer>
      <ButtonGroup>
        <Button primary onClick={onRun} isLoading={isLoading} disabled={isLoading}>
          {isLoading && <LoadingSpinner />}
          {isLoading ? 'Simulating...' : 'Run Simulation'}
        </Button>
        <Button onClick={onClear} disabled={isLoading}>
          Clear Circuit
        </Button>
      </ButtonGroup>
      
      {hasResults && (
        <StepControls>
          <StepButton 
            onClick={onStepBack}
            disabled={currentStep === 0 || isLoading}
          >
            ◀
          </StepButton>
          
          <StepIndicator>
            Step {currentStep} / {maxSteps}
          </StepIndicator>
          
          <StepButton 
            onClick={onStepForward}
            disabled={currentStep === maxSteps || isLoading}
          >
            ▶
          </StepButton>
        </StepControls>
      )}
    </ControlsContainer>
  );
};

export default SimulationControls;