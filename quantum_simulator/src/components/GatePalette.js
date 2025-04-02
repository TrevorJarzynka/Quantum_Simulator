// components/GatePalette.js
import React from 'react';
// Remove unused import
// import { useDrag } from 'react-dnd';
import styled from 'styled-components';

const PaletteContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #2c3e50;
`;

const GateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
`;

const GateCategory = styled.div`
  margin-bottom: 20px;
`;

const CategoryTitle = styled.h3`
  font-size: 0.9rem;
  margin-bottom: 10px;
  color: #7f8c8d;
  font-weight: 500;
`;

const Gate = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: ${props => props.color};
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  border: ${props => props.isSelected ? '3px solid #2c3e50' : 'none'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const GateName = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 2px;
`;

const GateDescription = styled.div`
  font-size: 0.7rem;
  text-align: center;
  padding: 0 2px;
`;

// Gate definitions
const gateCategories = [
  {
    title: "Single-Qubit Gates",
    gates: [
      { id: 'h', name: 'H', description: 'Hadamard', color: '#3498db' },
      { id: 'x', name: 'X', description: 'Pauli-X', color: '#e74c3c' },
      { id: 'y', name: 'Y', description: 'Pauli-Y', color: '#2ecc71' },
      { id: 'z', name: 'Z', description: 'Pauli-Z', color: '#f39c12' },
      { id: 's', name: 'S', description: 'Phase', color: '#9b59b6' },
      { id: 't', name: 'T', description: 'π/8', color: '#e67e22' },
    ]
  },
  {
    title: "Multi-Qubit Gates",
    gates: [
      { id: 'cx', name: 'CX', description: 'CNOT', color: '#16a085', control: true, target: true },
      { id: 'cz', name: 'CZ', description: 'Controlled-Z', color: '#8e44ad', control: true, target: true },
      { id: 'swap', name: 'SW', description: 'Swap', color: '#d35400', control: true, target: true },
      { id: 'cp', name: 'CP', description: 'Controlled-Phase', color: '#27ae60', control: true, target: true },
    ]
  },
  {
    title: "Measurement",
    gates: [
      { id: 'measure', name: 'M', description: 'Measure', color: '#7f8c8d' },
    ]
  }
];

const DraggableGate = ({ gate, isSelected, onClick }) => {
  return (
    <Gate 
      color={gate.color} 
      onClick={onClick}
      isSelected={isSelected}
    >
      <GateName>{gate.name}</GateName>
      <GateDescription>{gate.description}</GateDescription>
    </Gate>
  );
};

const GatePalette = ({ onGateSelect, selectedGate }) => {
  return (
    <PaletteContainer>
      <Title>Gate Palette</Title>
      
      {gateCategories.map((category, index) => (
        <GateCategory key={index}>
          <CategoryTitle>{category.title}</CategoryTitle>
          <GateGrid>
            {category.gates.map(gate => (
              <DraggableGate 
                key={gate.id}
                gate={gate}
                isSelected={selectedGate && selectedGate.id === gate.id}
                onClick={() => onGateSelect(gate)}
              />
            ))}
          </GateGrid>
        </GateCategory>
      ))}
    </PaletteContainer>
  );
};

export default GatePalette;