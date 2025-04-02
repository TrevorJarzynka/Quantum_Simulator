import React from 'react';
import styled from 'styled-components';

const MatrixContainer = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  overflow-x: auto;
  margin-bottom: 15px;
`;

const MatrixGrid = styled.div`
  display: inline-grid;
  grid-template-columns: repeat(${props => props.size}, minmax(60px, 1fr));
  gap: 2px;
  margin: 0 auto;
`;

const Cell = styled.div`
  width: 60px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => {
    // Color based on amplitude
    const magnitude = Math.sqrt(props.re * props.re + props.im * props.im);
    // Scale from white to blue based on magnitude
    const intensity = Math.floor(magnitude * 255);
    return `rgba(52, 152, 219, ${magnitude})`;
  }};
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: ${props => {
    const magnitude = Math.sqrt(props.re * props.re + props.im * props.im);
    return magnitude > 0.5 ? 'white' : 'black';
  }};
`;

const InfoSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 500;
`;

const EntanglementMeasure = styled.div`
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
`;

const Label = styled.div`
  font-weight: 500;
  margin-bottom: 5px;
`;

const Value = styled.div`
  font-family: 'Courier New', monospace;
`;

/**
 * Format complex number for display
 */
const formatComplex = (complex) => {
  const { re, im } = complex;
  const absRe = Math.abs(re);
  const absIm = Math.abs(im);
  
  // Round to 2 decimal places
  const roundedRe = Math.round(re * 100) / 100;
  const roundedIm = Math.round(im * 100) / 100;
  
  // Format based on values
  if (absRe < 0.01 && absIm < 0.01) return "0";
  if (absRe < 0.01) return `${roundedIm}i`;
  if (absIm < 0.01) return `${roundedRe}`;
  
  const sign = im >= 0 ? "+" : "";
  return `${roundedRe}${sign}${roundedIm}i`;
};

/**
 * Calculate the density matrix from a state vector
 */
const calculateDensityMatrix = (stateVector) => {
  const size = stateVector.length;
  const densityMatrix = Array(size).fill().map(() => Array(size).fill().map(() => ({ re: 0, im: 0 })));
  
  // ρ = |ψ⟩⟨ψ|
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // ρ_{ij} = ψ_i * ψ_j^*
      densityMatrix[i][j] = {
        re: stateVector[i].re * stateVector[j].re + stateVector[i].im * stateVector[j].im,
        im: stateVector[i].im * stateVector[j].re - stateVector[i].re * stateVector[j].im
      };
    }
  }
  
  return densityMatrix;
};

/**
 * Calculate partial trace over specified qubits
 */
const calculatePartialTrace = (densityMatrix, numQubits, traceOutQubits) => {
  const totalDim = densityMatrix.length;
  const remainingQubits = numQubits - traceOutQubits.length;
  const reducedDim = Math.pow(2, remainingQubits);
  
  const reducedMatrix = Array(reducedDim).fill().map(() => 
    Array(reducedDim).fill().map(() => ({ re: 0, im: 0 }))
  );
  
  // Create a mapping function from full indices to reduced indices
  const mapToReducedIndex = (fullIndex) => {
    let reducedIndex = 0;
    let bitPosition = 0;
    
    for (let qubit = 0; qubit < numQubits; qubit++) {
      // Skip qubits that we're tracing out
      if (traceOutQubits.includes(qubit)) continue;
      
      // If this qubit is 1 in the full index, set the corresponding bit in reduced index
      if ((fullIndex & (1 << qubit)) !== 0) {
        reducedIndex |= (1 << bitPosition);
      }
      
      bitPosition++;
    }
    
    return reducedIndex;
  };
  
  // Perform partial trace
  for (let i = 0; i < totalDim; i++) {
    for (let j = 0; j < totalDim; j++) {
      // Check if this pair should contribute to the reduced density matrix
      let shouldInclude = true;
      
      for (const qubit of traceOutQubits) {
        // If the traced-out qubit has different values in i and j, skip this pair
        if (((i >> qubit) & 1) !== ((j >> qubit) & 1)) {
          shouldInclude = false;
          break;
        }
      }
      
      if (shouldInclude) {
        const reducedI = mapToReducedIndex(i);
        const reducedJ = mapToReducedIndex(j);
        
        // Add to the reduced density matrix
        reducedMatrix[reducedI][reducedJ].re += densityMatrix[i][j].re;
        reducedMatrix[reducedI][reducedJ].im += densityMatrix[i][j].im;
      }
    }
  }
  
  return reducedMatrix;
};

/**
 * Calculate the von Neumann entropy of a density matrix
 */
const calculateVonNeumannEntropy = (densityMatrix) => {
  // In a real implementation, we would calculate eigenvalues of the density matrix
  // and compute S = -Tr(ρ log ρ) = -Σ λ_i log λ_i
  // For this demo, we'll use a simplified approach for 2×2 matrices
  
  if (densityMatrix.length === 2) {
    // For a 2×2 matrix, we can calculate the entropy based on the purity
    const purity = densityMatrix[0][0].re * densityMatrix[1][1].re - 
                  densityMatrix[0][1].re * densityMatrix[1][0].re -
                  densityMatrix[0][1].im * densityMatrix[1][0].im;
    
    // 1/2 to normalize for λ_max = 1
    const lambda = 0.5 * (1 + Math.sqrt(2 * purity - 1));
    
    if (lambda <= 0 || lambda >= 1) return 0;
    
    return -lambda * Math.log2(lambda) - (1 - lambda) * Math.log2(1 - lambda);
  }
  
  // For larger matrices, we'd need a proper eigenvalue decomposition
  return "Calculation requires eigenvalue decomposition";
};

/**
 * Calculate entanglement entropy between specified qubits and the rest
 */
const calculateEntanglementEntropy = (stateVector, numQubits, qubitsA) => {
  const densityMatrix = calculateDensityMatrix(stateVector);
  
  // Find complement of qubitsA (the qubits to trace out)
  const qubitsB = [];
  for (let i = 0; i < numQubits; i++) {
    if (!qubitsA.includes(i)) {
      qubitsB.push(i);
    }
  }
  
  // Calculate reduced density matrix by tracing out qubits B
  const reducedDensityMatrix = calculatePartialTrace(densityMatrix, numQubits, qubitsB);
  
  // Calculate von Neumann entropy
  return calculateVonNeumannEntropy(reducedDensityMatrix);
};

/**
 * Calculate expectation value of Z (Pauli-Z) for each qubit
 */
const calculateExpectationValues = (stateVector, numQubits) => {
  const expectationValues = [];
  
  for (let qubit = 0; qubit < numQubits; qubit++) {
    let expectationZ = 0;
    
    for (let i = 0; i < stateVector.length; i++) {
      const probability = stateVector[i].re * stateVector[i].re + stateVector[i].im * stateVector[i].im;
      
      // If the qubit is 0, add probability; if 1, subtract probability
      const qubitValue = (i >> qubit) & 1;
      expectationZ += qubitValue === 0 ? probability : -probability;
    }
    
    expectationValues.push({
      qubit,
      z: expectationZ
    });
  }
  
  return expectationValues;
};

/**
 * DensityMatrixVisualizer component
 */
const DensityMatrixVisualizer = ({ stateData, numQubits }) => {
  // Calculate density matrix
  const densityMatrix = calculateDensityMatrix(stateData);
  
  // Calculate expectation values for observables
  const expectationValues = calculateExpectationValues(stateData, numQubits);
  
  // Calculate entanglement entropy for first qubit (as an example)
  const firstQubitEntanglement = calculateEntanglementEntropy(stateData, numQubits, [0]);
  
  return (
    <div>
      <InfoSection>
        <SectionTitle>Density Matrix</SectionTitle>
        <MatrixContainer>
          <MatrixGrid size={densityMatrix.length}>
            {densityMatrix.map((row, i) =>
              row.map((cell, j) => (
                <Cell key={`${i}-${j}`} re={cell.re} im={cell.im}>
                  {formatComplex(cell)}
                </Cell>
              ))
            )}
          </MatrixGrid>
        </MatrixContainer>
        <p>
          The density matrix ρ = |ψ⟩⟨ψ| contains all information about the quantum state,
          including potential mixture and decoherence effects.
        </p>
      </InfoSection>
      
      <InfoSection>
        <SectionTitle>Entanglement Measures</SectionTitle>
        <EntanglementMeasure>
          <Label>Entanglement entropy between qubit 0 and rest:</Label>
          <Value>S = {typeof firstQubitEntanglement === 'number' 
                    ? firstQubitEntanglement.toFixed(4) 
                    : firstQubitEntanglement}</Value>
          <p>
            {firstQubitEntanglement === 0 
              ? "No entanglement detected - the state is separable."
              : "Entanglement detected - the qubit is not in a pure state when considered alone."}
          </p>
        </EntanglementMeasure>
      </InfoSection>
      
      <InfoSection>
        <SectionTitle>Expectation Values (Observables)</SectionTitle>
        <div>
          {expectationValues.map(({ qubit, z }) => (
            <EntanglementMeasure key={qubit}>
              <Label>⟨Z{qubit}⟩ (Pauli-Z on qubit {qubit}):</Label>
              <Value>{z.toFixed(4)}</Value>
              <p>
                {z > 0.9 
                  ? "Strongly in |0⟩ state"
                  : z < -0.9 
                    ? "Strongly in |1⟩ state" 
                    : Math.abs(z) < 0.1 
                      ? "In equal superposition of |0⟩ and |1⟩"
                      : "In partial superposition"}
              </p>
            </EntanglementMeasure>
          ))}
        </div>
      </InfoSection>
    </div>
  );
};

export default DensityMatrixVisualizer;