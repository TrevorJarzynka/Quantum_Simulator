import React, { useRef, useEffect, useState } from 'react';
import styles from './CircuitEditor.module.css';

const LABEL_W = 72;
const ROW_H = 64;
const ROW_GAP = 6;
const CELL_W = 60;
const CELL_GAP = 4;
const GRID_PAD = 16;
const COL_HEADER_H = 24;

const cellCenterX = col => GRID_PAD + LABEL_W + col * (CELL_W + CELL_GAP) + CELL_W / 2;
const cellCenterY = row => COL_HEADER_H + GRID_PAD + row * (ROW_H + ROW_GAP) + ROW_H / 2;

const CircuitEditor = ({
  circuit,
  onCellClick,
  onRemoveGate,
  selectedGate,
  pendingMultiQubitGate,
  activeColumn,
}) => {
  const gridRef = useRef(null);
  const [svgW, setSvgW] = useState(800);
  const [svgH, setSvgH] = useState(400);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => { setSvgW(el.scrollWidth); setSvgH(el.scrollHeight); };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [circuit]);

  // Find control→target pairs for connectors
  const connectors = (() => {
    if (!circuit.length) return [];
    const pairs = [];
    const numCols = circuit[0].length;
    for (let col = 0; col < numCols; col++) {
      let ctrl = null, tgt = null;
      for (let row = 0; row < circuit.length; row++) {
        const gate = circuit[row][col]?.gate;
        if (!gate) continue;
        if (gate.control && !gate.target) ctrl = { row, gate };
        if (!gate.control && gate.target) tgt = { row, gate };
      }
      if (ctrl && tgt && ctrl.gate.id === tgt.gate.id) {
        pairs.push({ col, controlRow: ctrl.row, targetRow: tgt.row, color: ctrl.gate.color });
      }
    }
    return pairs;
  })();

  const isMultiQubitSelected = selectedGate?.control && selectedGate?.target;
  const numCols = circuit[0]?.length || 0;

  return (
    <div className={styles.wrapper} ref={gridRef}>
      {pendingMultiQubitGate && (
        <div className={styles.hint}>
          ● Control placed on Q{pendingMultiQubitGate.row} · click a different qubit in column {pendingMultiQubitGate.col + 1} to place target
        </div>
      )}

      {/* Column headers */}
      <div className={styles.colHeaders}>
        <div className={styles.colHeaderSpacer} />
        {Array(numCols).fill(null).map((_, col) => (
          <div
            key={col}
            className={`${styles.colHeader} ${activeColumn === col ? styles.colHeaderActive : ''}`}
          >
            {col + 1}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {/* SVG connector overlay */}
        <svg className={styles.connectorSvg} width={svgW} height={svgH} aria-hidden="true">
          <defs>
            {connectors.map((c, i) => (
              <marker key={i} id={`dot-${i}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <circle cx="3" cy="3" r="2" fill={c.color} opacity="0.8" />
              </marker>
            ))}
          </defs>
          {connectors.map((c, i) => {
            const x = cellCenterX(c.col);
            const y1 = cellCenterY(c.controlRow);
            const y2 = cellCenterY(c.targetRow);
            const isCtrlAbove = c.controlRow < c.targetRow;
            return (
              <g key={i}>
                <line
                  x1={x} y1={isCtrlAbove ? y1 + 22 : y1 - 22}
                  x2={x} y2={isCtrlAbove ? y2 - 22 : y2 + 22}
                  stroke={c.color} strokeWidth="2" opacity="0.6" strokeDasharray="4 3"
                />
                <circle cx={x} cy={y1} r="6" fill={c.color} opacity="0.9" />
                <circle cx={x} cy={y2} r="10" fill="none" stroke={c.color} strokeWidth="2" opacity="0.85" />
                <line x1={x - 8} y1={y2} x2={x + 8} y2={y2} stroke={c.color} strokeWidth="2" opacity="0.85" />
                <line x1={x} y1={y2 - 8} x2={x} y2={y2 + 8} stroke={c.color} strokeWidth="2" opacity="0.85" />
              </g>
            );
          })}
        </svg>

        {/* Qubit rows */}
        {circuit.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            <div className={styles.qubitLabel}>Q{rowIndex}</div>
            <div className={styles.wire}>
              {row.map((cell, colIndex) => {
                const isPending = pendingMultiQubitGate?.row === rowIndex && pendingMultiQubitGate?.col === colIndex;
                const isDropTarget = isMultiQubitSelected && pendingMultiQubitGate &&
                  pendingMultiQubitGate.col === colIndex && pendingMultiQubitGate.row !== rowIndex && !cell.gate;
                const isActive = activeColumn === colIndex;

                return (
                  <div
                    key={colIndex}
                    className={[
                      styles.cell,
                      !cell.gate ? styles.cellEmpty : '',
                      isPending ? styles.cellPending : '',
                      isDropTarget ? styles.cellDropTarget : '',
                      isActive ? styles.cellActive : '',
                      isMultiQubitSelected && !cell.gate && !pendingMultiQubitGate ? styles.cellHint : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => onCellClick(rowIndex, colIndex)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') onCellClick(rowIndex, colIndex); }}
                    data-row={rowIndex}
                    data-col={colIndex}
                  >
                    {cell.gate && (
                      <GateChip
                        gate={cell.gate}
                        isActive={isActive}
                        onRemove={e => { e.stopPropagation(); onRemoveGate(rowIndex, colIndex); }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GateChip = ({ gate, isActive, onRemove }) => {
  const isCtrl = gate.control && !gate.target;
  const isTgt = !gate.control && gate.target;
  const bg = gate.color
    ? `linear-gradient(145deg, ${gate.color}ee, ${gate.color}99)`
    : 'rgba(255,255,255,0.1)';
  const glow = isActive
    ? `0 0 20px ${gate.color || '#38BDF8'}88, 0 0 8px ${gate.color || '#38BDF8'}44`
    : `0 0 12px ${gate.color || '#38BDF8'}44`;

  const label = gate.parametric && gate.angle != null
    ? `${gate.name}(${Math.round(gate.angle * 180 / Math.PI)}°)`
    : gate.name;

  return (
    <div className={styles.gateChip} style={{ background: bg, boxShadow: glow }}>
      {isCtrl && <span className={styles.ctrlDot}>●</span>}
      {isTgt && <span className={styles.tgtSymbol}>⊕</span>}
      <span className={styles.chipName}>{label}</span>
      {isCtrl && <span className={styles.roleTag}>CTRL</span>}
      {isTgt && <span className={styles.roleTag}>TGT</span>}
      <button className={styles.removeBtn} onClick={onRemove} title="Remove">×</button>
    </div>
  );
};

export default CircuitEditor;
