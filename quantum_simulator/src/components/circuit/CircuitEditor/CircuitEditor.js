import React, { useRef, useEffect, useState } from 'react';
import styles from './CircuitEditor.module.css';

const LABEL_W = 72;   // qubit label width + margin (must match CSS)
const ROW_H = 64;     // row height (must match CSS)
const ROW_GAP = 6;    // gap between rows (must match CSS)
const CELL_W = 60;    // cell width (must match CSS)
const CELL_GAP = 4;   // gap between cells (must match CSS)
const GRID_PAD = 16;  // grid padding (must match CSS)
const COL_HEADER_H = 24; // column header height

const cellCenterX = col =>
  GRID_PAD + LABEL_W + col * (CELL_W + CELL_GAP) + CELL_W / 2;

const cellCenterY = row =>
  COL_HEADER_H + GRID_PAD + row * (ROW_H + ROW_GAP) + ROW_H / 2;

const CircuitEditor = ({
  circuit,
  onCellClick,
  onRemoveGate,
  selectedGate,
  pendingMultiQubitGate,
}) => {
  const gridRef = useRef(null);
  const [svgW, setSvgW] = useState(800);
  const [svgH, setSvgH] = useState(400);

  // Track grid dimensions for SVG overlay
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => { setSvgW(el.scrollWidth); setSvgH(el.scrollHeight); };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [circuit]);

  // Find control→target pairs for drawing connectors
  const connectors = (() => {
    if (!circuit.length) return [];
    const pairs = [];
    const numCols = circuit[0].length;
    for (let col = 0; col < numCols; col++) {
      let ctrl = null;
      let tgt = null;
      for (let row = 0; row < circuit.length; row++) {
        const gate = circuit[row][col]?.gate;
        if (!gate) continue;
        if (gate.control && !gate.target) ctrl = { row, gate };
        if (!gate.control && gate.target) tgt = { row, gate };
      }
      if (ctrl && tgt && ctrl.gate.id === tgt.gate.id) {
        pairs.push({
          col,
          controlRow: ctrl.row,
          targetRow: tgt.row,
          color: ctrl.gate.color,
        });
      }
    }
    return pairs;
  })();

  const isMultiQubitSelected = selectedGate?.control && selectedGate?.target;
  const numCols = circuit[0]?.length || 0;

  return (
    <div className={styles.wrapper} ref={gridRef}>
      {/* Pending gate hint */}
      {pendingMultiQubitGate && (
        <div className={styles.hint}>
          ● Control placed on Q{pendingMultiQubitGate.row} · now click a different qubit in column {pendingMultiQubitGate.col + 1} to place the target
        </div>
      )}

      {/* Column number headers */}
      <div className={styles.colHeaders}>
        <div className={styles.colHeaderSpacer} />
        {Array(numCols).fill(null).map((_, col) => (
          <div key={col} className={styles.colHeader}>{col + 1}</div>
        ))}
      </div>

      {/* Circuit grid */}
      <div className={styles.grid}>
        {/* SVG connector overlay */}
        <svg
          className={styles.connectorSvg}
          width={svgW}
          height={svgH}
          aria-hidden="true"
        >
          <defs>
            {connectors.map((c, i) => (
              <marker
                key={i}
                id={`arrow-${i}`}
                markerWidth="6"
                markerHeight="6"
                refX="3"
                refY="3"
                orient="auto"
              >
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
                {/* Connecting line */}
                <line
                  x1={x} y1={isCtrlAbove ? y1 + 22 : y1 - 22}
                  x2={x} y2={isCtrlAbove ? y2 - 22 : y2 + 22}
                  stroke={c.color}
                  strokeWidth="2"
                  opacity="0.6"
                  strokeDasharray="4 3"
                />
                {/* Control dot */}
                <circle cx={x} cy={y1} r="6" fill={c.color} opacity="0.9" />
                {/* Target circle + cross (CNOT style) */}
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
                const isPending =
                  pendingMultiQubitGate?.row === rowIndex &&
                  pendingMultiQubitGate?.col === colIndex;
                const isDropTarget =
                  isMultiQubitSelected &&
                  pendingMultiQubitGate &&
                  pendingMultiQubitGate.col === colIndex &&
                  pendingMultiQubitGate.row !== rowIndex &&
                  !cell.gate;

                return (
                  <div
                    key={colIndex}
                    className={`${styles.cell}
                      ${!cell.gate ? styles.cellEmpty : ''}
                      ${isPending ? styles.cellPending : ''}
                      ${isDropTarget ? styles.cellDropTarget : ''}
                      ${isMultiQubitSelected && !cell.gate && !pendingMultiQubitGate ? styles.cellHint : ''}
                    `}
                    onClick={() => onCellClick(rowIndex, colIndex)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={e => {
                      if (e.key === 'Enter' || e.key === ' ') onCellClick(rowIndex, colIndex);
                    }}
                    data-row={rowIndex}
                    data-col={colIndex}
                  >
                    {cell.gate && (
                      <GateChip
                        gate={cell.gate}
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

const GateChip = ({ gate, onRemove }) => {
  const isCtrl = gate.control && !gate.target;
  const isTgt = !gate.control && gate.target;
  const bg = gate.color
    ? `linear-gradient(145deg, ${gate.color}ee, ${gate.color}99)`
    : 'rgba(255,255,255,0.1)';

  return (
    <div
      className={styles.gateChip}
      style={{ background: bg, boxShadow: `0 0 12px ${gate.color || '#38BDF8'}44` }}
    >
      {isCtrl && <span className={styles.ctrlDot}>●</span>}
      {isTgt && <span className={styles.tgtSymbol}>⊕</span>}
      <span className={styles.chipName}>{gate.name}</span>
      {isCtrl && <span className={styles.roleTag}>CTRL</span>}
      {isTgt && <span className={styles.roleTag}>TGT</span>}
      <button className={styles.removeBtn} onClick={onRemove} title="Remove">×</button>
    </div>
  );
};

export default CircuitEditor;
