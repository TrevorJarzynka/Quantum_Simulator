// components/CircuitEditor.js
import React from 'react';
// Remove unused import
// import { useDrop } from 'react-dnd';
import styled from 'styled-components';

const CircuitGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 20px;
  overflow-x: auto;
`;

const QubitRow = styled.div`
  display: flex;
  align-items: center;
  height: 60px;
`;

const QubitLabel = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  background-color: #f0f0f0;
  border-radius: 4px;
`;

const WireRow = styled.div`
  display: flex;
  flex-grow: 1;
  height: 60px;
  background-color: #f9f9f9;
  border-radius: 4px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: #2c3e50;
    z-index: 1;
  }
`;

const CellContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 60px);
  gap: 2px;
  flex-grow: 1;
  height: 100%;
  z-index: 2;
`;

const Cell = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isActive ? 'pointer' : 'default'};
  position: relative;
  
  &:hover {
    background-color: ${props => props.isActive ? 'rgba(44, 62, 80, 0.1)' : 'transparent'};
    border-radius: 4px;
  }
`;

const GateElement = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  background-color: ${props => props.color || '#3498db'};
  position: relative;
  z-index: 3;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover .remove-btn {
    opacity: 1;
  }
`;

const GateName = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const GateDescription = styled.div`
  font-size: 10px;
  margin-top: 2px;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #e74c3c;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 4;
  font-size: 12px;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const ControlDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: black;
  position: absolute;
`;

const TargetCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid black;
  position: absolute;
`;

// CircuitEditor component
const CircuitEditor = ({ circuit, onCellClick, onRemoveGate, selectedGate }) => {
  return (
    <CircuitGrid>
      {circuit.map((row, rowIndex) => (
        <QubitRow key={rowIndex}>
          <QubitLabel>Q{rowIndex}</QubitLabel>
          <WireRow>
            <CellContainer>
              {row.map((cell, colIndex) => (
                <Cell 
                  key={colIndex} 
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  isActive={!cell.gate}
                >
                  {cell.gate && (
                    <GateElement color={cell.gate.color}>
                      <GateName>{cell.gate.name}</GateName>
                      {cell.gate.description && (
                        <GateDescription>{cell.gate.description}</GateDescription>
                      )}
                      <RemoveButton 
                        className="remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveGate(rowIndex, colIndex);
                        }}
                      >
                        ×
                      </RemoveButton>
                      {cell.gate.control && <ControlDot />}
                      {cell.gate.target && <TargetCircle />}
                    </GateElement>
                  )}
                </Cell>
              ))}
            </CellContainer>
          </WireRow>
        </QubitRow>
      ))}
    </CircuitGrid>
  );
};

export default CircuitEditor;