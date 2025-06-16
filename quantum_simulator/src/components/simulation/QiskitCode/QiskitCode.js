// src/components/simulation/QiskitCode/QiskitCode.js
import React, { useState } from 'react';
import styles from './QiskitCode.module.css';

const QiskitCode = ({ code }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
        alert('Failed to copy code to clipboard');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum_circuit.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCodeStats = () => {
    const lines = code.split('\n').length;
    const characters = code.length;
    const gates = (code.match(/qc\.[hxyzt]/g) || []).length;
    return { lines, characters, gates };
  };

  if (!code) {
    return null;
  }

  const stats = getCodeStats();

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Generated Qiskit Code</h3>
      
      <div className={styles.codeHeader}>
        <div className={styles.codeLanguage}>
          Python • Qiskit
        </div>
        <div className={styles.codeStats}>
          <div className={styles.codeStat}>
            📝 {stats.lines} lines
          </div>
          <div className={styles.codeStat}>
            🎯 {stats.gates} gates
          </div>
          <div className={styles.codeStat}>
            📊 {stats.characters} chars
          </div>
        </div>
      </div>

      <div className={styles.codeWrapper}>
        <div 
          className={`${styles.codeBlock} ${isExpanded ? styles.expanded : ''}`}
          role="region"
          aria-label="Generated Python code"
        >
          <div className={styles.codeContent}>
            {code}
          </div>
        </div>
        
        {!isExpanded && stats.lines > 20 && (
          <button 
            className={styles.expandButton}
            onClick={() => setIsExpanded(true)}
            title="Expand code view"
            aria-label="Expand code view"
          >
            ⬇
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
        <button 
          className={`${styles.copyButton} ${copySuccess ? styles.copyButtonSuccess : ''}`}
          onClick={handleCopyCode}
          aria-label={copySuccess ? 'Code copied!' : 'Copy code to clipboard'}
        >
          {copySuccess ? 'Copied!' : 'Copy Code'}
        </button>
        
        <button 
          className={styles.downloadButton}
          onClick={handleDownloadCode}
          aria-label="Download Python file"
        >
          Download .py
        </button>
      </div>
    </div>
  );
};

export default QiskitCode;