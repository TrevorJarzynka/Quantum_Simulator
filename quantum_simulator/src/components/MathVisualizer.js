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
  border-left: 4px solid #9b59b6;
`;

const MathSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 500;
`;

const StateEquation = styled.div`
  margin-bottom: 10px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
`;

const OperationDescription = styled.div`
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #9b59b6;
`;

const MatrixDisplay = styled.pre`
  font-family: 'Courier New', monospace;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  overflow-x: auto;
  white-space: pre-wrap;
`;

const formatComplexForDisplay = (complex) => {
  const { re, im } = complex;
  const absRe = Math.abs(re);
  const absIm = Math.abs(im);
  
  // Round to 3 decimal places
  const roundedRe = Math.round(re * 1000) / 1000;
  const roundedIm = Math.round(im * 1000) / 1000;
  
  // Format based on values
  if (absRe < 0.001 && absIm < 0.001) return "0";
  if (absRe < 0.001) {
    if (roundedIm === 1) return "i";
    if (roundedIm === -1) return "-i";
    return `${roundedIm}i`;
  }
  if (absIm < 0.001) return `${roundedRe}`;
  
  // Both real and imaginary parts present
  let imagPart = Math.abs(roundedIm);
  if (imagPart === 1) imagPart = "";
  
  const sign = im >= 0 ? "+" : "-";
  return `${roundedRe}${sign}${imagPart}i`;
};

const calculateProbability = (complex) => {
  const { re, im } = complex;
  return re * re + im * im;
};

const MathVisualizer = ({ stateData, numQubits, step, description }) => {
  // Generate the state vector representation in Dirac notation
  const generateStateVectorDisplay = () => {
    let displayText = "|ψ⟩ = ";
    let terms = [];
    
    stateData.forEach((amplitude, idx) => {
      const probability = calculateProbability(amplitude);
      
      // Only include terms with non-negligible probability
      if (probability > 0.001) {
        const binaryRep = idx.toString(2).padStart(numQubits, '0');
        const coefficient = formatComplexForDisplay(amplitude);
        
        if (coefficient !== "0") {
          // If coefficient is 1, just show the basis state
          if (coefficient === "1") {
            terms.push(`|${binaryRep}⟩`);
          } else {
            terms.push(`${coefficient} |${binaryRep}⟩`);
          }
        }
      }
    });
    
    if (terms.length === 0) {
      terms.push("0");
    }
    
    displayText += terms.join(" + ");
    
    return displayText;
  };

  // Generate matrix representations for common gates
  const getGateMatrixHTML = (gateName) => {
    switch (gateName.toLowerCase()) {
      case 'h':
        return `
          H = 1/√2 * | 1  1 |
                     | 1 -1 |
        `;
      case 'x':
        return `
          X = | 0 1 |
              | 1 0 |
        `;
      case 'y':
        return `
          Y = | 0 -i |
              | i  0 |
        `;
      case 'z':
        return `
          Z = | 1  0 |
              | 0 -1 |
        `;
      case 's':
        return `
          S = | 1 0 |
              | 0 i |
        `;
      case 't':
        return `
          T = | 1 0       |
              | 0 e^iπ/4  |
        `;
      default:
        return `Matrix representation not available for ${gateName}`;
    }
  };
  
  // Generate operation description based on step description
  const generateOperationDescription = () => {
    if (step === 0) {
      // Find the initial state (which basis state has amplitude 1)
      const initialStateIdx = stateData.findIndex(amp => 
        Math.abs(calculateProbability(amp) - 1) < 0.001
      );
      
      if (initialStateIdx !== -1) {
        const binaryRep = initialStateIdx.toString(2).padStart(numQubits, '0');
        return (
          <div>
            <p>Initial state preparation: All qubits initialized to specific states</p>
            <p>Initial state: |{binaryRep}⟩</p>
          </div>
        );
      } else {
        return (
          <div>
            <p>Initial state preparation: System in a superposition state</p>
          </div>
        );
      }
    }
    
    // For other steps, extract gate name from description
    if (description.includes("Hadamard")) {
      return (
        <div>
          <p>Hadamard gate applied, which creates a superposition:</p>
          <p>H|0⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = (|0⟩ - |1⟩)/√2</p>
          <p>Matrix representation:</p>
          <MatrixDisplay>{getGateMatrixHTML('h')}</MatrixDisplay>
        </div>
      );
    }
    
    if (description.includes("X gate")) {
      return (
        <div>
          <p>Pauli-X gate (NOT gate) flips the qubit state:</p>
          <p>X|0⟩ = |1⟩ and X|1⟩ = |0⟩</p>
          <p>Matrix representation:</p>
          <MatrixDisplay>{getGateMatrixHTML('x')}</MatrixDisplay>
        </div>
      );
    }
    
    if (description.includes("Y gate")) {
      return (
        <div>
          <p>Pauli-Y gate applies rotation around Y-axis:</p>
          <p>Y|0⟩ = i|1⟩ and Y|1⟩ = -i|0⟩</p>
          <p>Matrix representation:</p>
          <MatrixDisplay>{getGateMatrixHTML('y')}</MatrixDisplay>
        </div>
      );
    }
    
    if (description.includes("Z gate")) {
      return (
        <div>
          <p>Pauli-Z gate applies phase flip:</p>
          <p>Z|0⟩ = |0⟩ and Z|1⟩ = -|1⟩</p>
          <p>Matrix representation:</p>
          <MatrixDisplay>{getGateMatrixHTML('z')}</MatrixDisplay>
        </div>
      );
    }
    
    if (description.includes("S gate")) {
      return (
        <div>
          <p>S gate (phase gate) applies π/2 phase shift:</p>
          <p>S|0⟩ = |0⟩ and S|1⟩ = i|1⟩</p>
          <p>Matrix representation:</p>
          <MatrixDisplay>{getGateMatrixHTML('s')}</MatrixDisplay>
        </div>
      );
    }
    
    if (description.includes("T gate")) {
      return (
        <div>
          <p>T gate (π/8 gate) applies π/4 phase shift:</p>
          <p>T|0⟩ = |0⟩ and T|1⟩ = e^(iπ/4)|1⟩</p>
          <p>Matrix representation:</p>
          <MatrixDisplay>{getGateMatrixHTML('t')}</MatrixDisplay>
        </div>
      );
    }
    
    return <p>Operation applied to transform the quantum state.</p>;
  };
  
  // Generate explanation of the current quantum state
  const generateStateExplanation = () => {
    // Count the number of basis states with non-zero amplitude
    const nonZeroStates = stateData.filter(
      amp => calculateProbability(amp) > 0.001
    );
    
    const numNonZeroStates = nonZeroStates.length;
    
    if (numNonZeroStates === 1) {
      // Find the basis state
      const idx = stateData.findIndex(
        amp => calculateProbability(amp) > 0.001
      );
      const binaryRep = idx.toString(2).padStart(numQubits, '0');
      
      return `The system is in a pure computational basis state |${binaryRep}⟩.`;
    } else if (numNonZeroStates === Math.pow(2, numQubits)) {
      // Check if all amplitudes have equal magnitude (uniform superposition)
      const firstProb = calculateProbability(nonZeroStates[0]);
      const isUniform = nonZeroStates.every(
        amp => Math.abs(calculateProbability(amp) - firstProb) < 0.01
      );
      
      if (isUniform) {
        return `The system is in a uniform superposition of all ${Math.pow(2, numQubits)} computational basis states.`;
      }
    } else if (numNonZeroStates === 2) {
      // Check if this might be a Bell state or similar
      const indices = stateData
        .map((amp, idx) => ({ idx, probability: calculateProbability(amp) }))
        .filter(item => item.probability > 0.001)
        .map(item => item.idx);
      
      // If the two states have equal probability (approximately 0.5)
      if (Math.abs(calculateProbability(stateData[indices[0]]) - 0.5) < 0.01 &&
          Math.abs(calculateProbability(stateData[indices[1]]) - 0.5) < 0.01) {
        const state1 = indices[0].toString(2).padStart(numQubits, '0');
        const state2 = indices[1].toString(2).padStart(numQubits, '0');
        return `The system is in an equal superposition of states |${state1}⟩ and |${state2}⟩.`;
      }
    }
    
    return `The system is in a superposition of ${numNonZeroStates} computational basis states.`;
  };

  const stateVectorDisplay = generateStateVectorDisplay();
  
  return (
    <VisualizerContainer>
      <StepDescription>
        Step {step}: {description}
      </StepDescription>
      
      <MathSection>
        <SectionTitle>State Vector Equation</SectionTitle>
        <StateEquation>
          {stateVectorDisplay}
        </StateEquation>
        <p>{generateStateExplanation()}</p>
      </MathSection>
      
      <MathSection>
        <SectionTitle>Quantum Operation</SectionTitle>
        <OperationDescription>
          {generateOperationDescription()}
        </OperationDescription>
      </MathSection>
      
      <MathSection>
        <SectionTitle>Advanced Information</SectionTitle>
        <p>
          For a more complete understanding of the quantum state, we can consider:
        </p>
        <ul>
          <li>The density matrix, which provides information about mixed states and decoherence</li>
          <li>Entanglement measures between qubits</li>
          <li>Expectation values of observables</li>
        </ul>
      </MathSection>
    </VisualizerContainer>
  );
};

export default MathVisualizer;