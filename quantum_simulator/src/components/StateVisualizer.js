import React from 'react';
import styled from 'styled-components';

const VisualizerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StepDescription = styled.div`
  font-size: 1rem;
  margin-bottom: 15px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #3498db;
`;

const StateSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 500;
`;

const StateVectorContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  padding-right: 10px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const StateRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const StateBasis = styled.div`
  width: 80px;
  font-family: 'Courier New', monospace;
  font-weight: 500;
`;

const StateValue = styled.div`
  width: 150px;
  font-family: 'Courier New', monospace;
`;

const ProbabilityBar = styled.div`
  flex-grow: 1;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const BarFill = styled.div`
  height: 100%;
  background-color: ${props => props.color || '#3498db'};
  width: ${props => props.width || '0%'};
  transition: width 0.3s ease;
`;

const ProbabilityValue = styled.div`
  width: 60px;
  text-align: right;
  margin-left: 10px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
`;

const QubitStatesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
`;

const QubitStateCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 10px;
`;

const QubitLabel = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
  color: #2c3e50;
`;

const BlochSphere = styled.div`
  width: 100%;
  height: 120px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  font-style: italic;
  color: #7f8c8d;
  margin-top: 10px;
`;

const formatComplex = (complex) => {
  const { re, im } = complex;
  const absRe = Math.abs(re);
  const absIm = Math.abs(im);
  
  // Round to 3 decimal places
  const roundedRe = Math.round(re * 1000) / 1000;
  const roundedIm = Math.round(im * 1000) / 1000;
  
  // Format based on values
  if (absRe < 0.001 && absIm < 0.001) return "0";
  if (absRe < 0.001) return `${roundedIm}i`;
  if (absIm < 0.001) return `${roundedRe}`;
  
  const sign = im >= 0 ? "+" : "";
  return `${roundedRe}${sign}${roundedIm}i`;
};

const calculateProbability = (complex) => {
  const { re, im } = complex;
  return re * re + im * im;
};

const StateVisualizer = ({ stateData, numQubits, step, description }) => {
  // Calculate probabilities for individual qubits
  const calculateQubitProbabilities = () => {
    const qubitStates = [];
    
    // For each qubit
    for (let q = 0; q < numQubits; q++) {
      const prob0 = stateData.reduce((sum, amplitude, idx) => {
        // If the q-th bit of idx is 0, add the probability
        if ((idx & (1 << q)) === 0) {
          return sum + calculateProbability(amplitude);
        }
        return sum;
      }, 0);
      
      const prob1 = 1 - prob0;
      
      qubitStates.push({
        qubit: q,
        prob0,
        prob1
      });
    }
    
    return qubitStates;
  };
  
  const qubitStates = calculateQubitProbabilities();
  
  // Format step description - add initial state details for step 0
  const getStepDescription = () => {
    if (step === 0) {
      // Find the initial state (which basis state has amplitude 1)
      const initialStateIdx = stateData.findIndex(amp => 
        Math.abs(calculateProbability(amp) - 1) < 0.001
      );
      
      if (initialStateIdx !== -1) {
        const binaryRep = initialStateIdx.toString(2).padStart(numQubits, '0');
        return `Initial state: |${binaryRep}⟩`;
      }
    }
    
    return description;
  };
  
  return (
    <VisualizerContainer>
      <StepDescription>
        Step {step}: {getStepDescription()}
      </StepDescription>
      
      <StateSection>
        <SectionTitle>State Vector</SectionTitle>
        <StateVectorContainer>
          {stateData.map((amplitude, idx) => {
            const binaryRep = idx.toString(2).padStart(numQubits, '0');
            const probability = calculateProbability(amplitude);
            const probabilityPercent = Math.round(probability * 10000) / 100;
            
            return (
              <StateRow key={idx}>
                <StateBasis>|{binaryRep}⟩</StateBasis>
                <StateValue>{formatComplex(amplitude)}</StateValue>
                <ProbabilityBar>
                  <BarFill 
                    width={`${probabilityPercent}%`} 
                    color={probabilityPercent > 10 ? '#3498db' : '#b3e0ff'}
                  />
                </ProbabilityBar>
                <ProbabilityValue>{probabilityPercent}%</ProbabilityValue>
              </StateRow>
            );
          })}
        </StateVectorContainer>
      </StateSection>
      
      <StateSection>
        <SectionTitle>Individual Qubit States</SectionTitle>
        <QubitStatesContainer>
          {qubitStates.map(({ qubit, prob0, prob1 }) => (
            <QubitStateCard key={qubit}>
              <QubitLabel>Qubit {qubit}</QubitLabel>
              <StateRow>
                <StateBasis>|0⟩</StateBasis>
                <ProbabilityBar>
                  <BarFill 
                    width={`${prob0 * 100}%`} 
                    color="#2ecc71"
                  />
                </ProbabilityBar>
                <ProbabilityValue>{Math.round(prob0 * 10000) / 100}%</ProbabilityValue>
              </StateRow>
              <StateRow>
                <StateBasis>|1⟩</StateBasis>
                <ProbabilityBar>
                  <BarFill 
                    width={`${prob1 * 100}%`} 
                    color="#e74c3c"
                  />
                </ProbabilityBar>
                <ProbabilityValue>{Math.round(prob1 * 10000) / 100}%</ProbabilityValue>
              </StateRow>
              <BlochSphere>
                Bloch sphere visualization
              </BlochSphere>
            </QubitStateCard>
          ))}
        </QubitStatesContainer>
      </StateSection>
    </VisualizerContainer>
  );
};

export default StateVisualizer;