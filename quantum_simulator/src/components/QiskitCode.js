import React from 'react';
import styled from 'styled-components';

const CodeContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

const CodeTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 500;
`;

const CodeBlock = styled.pre`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  border-left: 4px solid #9b59b6;
  max-height: 500px;
  overflow-y: auto;
`;

const CopyButton = styled.button`
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: #2980b9;
  }
`;

/**
 * Component to display and copy Qiskit Python code
 */
const QiskitCode = ({ code }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        alert('Code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
        alert('Failed to copy code to clipboard');
      });
  };

  if (!code) {
    return null;
  }

  return (
    <CodeContainer>
      <CodeTitle>Qiskit Python Code</CodeTitle>
      <CodeBlock>
        {code}
      </CodeBlock>
      <CopyButton onClick={handleCopyCode}>
        Copy Code
      </CopyButton>
    </CodeContainer>
  );
};

export default QiskitCode;