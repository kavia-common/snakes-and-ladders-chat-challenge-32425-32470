import React from "react";

// Cell color cycle per design notes
const CELL_COLORS = ["#ffe14c", "#fd7d25", "#e94d3c"];
const BOARD_SIZE = 10;
const CELL_SIZE_PX = 56; // chosen for good fit/desktops

// Snakes and ladders definition, heads/tails and colors
const SNAKES = [
  { head: 99, tail: 7, color: "#25bbed" },     // Blue
  { head: 92, tail: 35, color: "#31c951" },    // Green
  { head: 89, tail: 53, color: "#25bbed" },    // Blue
  { head: 74, tail: 17, color: "#d42c27" },    // Red
  { head: 64, tail: 24, color: "#31c951" },    // Green
  { head: 62, tail: 19, color: "#9d3dcd" },    // Purple
  { head: 49, tail: 11, color: "#9d3dcd" },    // Purple
  { head: 46, tail: 5, color: "#25bbed" },     // Blue
  { head: 16, tail: 6, color: "#31c951" },     // Green
];

const LADDERS = [
  { base: 2, top: 23, color: "#ffe14c" },
  { base: 8, top: 34, color: "#ffe14c" },
  { base: 20, top: 77, color: "#ffe14c" },
  { base: 32, top: 68, color: "#ffe14c" },
  { base: 41, top: 79, color: "#ffe14c" },
  { base: 71, top: 91, color: "#ffe14c" },
  { base: 80, top: 100, color: "#ffe14c" },
  { base: 84, top: 98, color: "#ffe14c" },
];

// Convert 1-100 to [row, col] (0-based), considering boustrophedon order
function squareToGridPos(n) {
  const row = BOARD_SIZE - 1 - Math.floor((n - 1) / BOARD_SIZE);
  let col = (n - 1) % BOARD_SIZE;
  if ((BOARD_SIZE - 1 - row) % 2 === 1) {
    col = BOARD_SIZE - 1 - col;
  }
  return [row, col];
}

// Render a snake as an SVG cubic curve from head to tail
function SnakeSVG({ head, tail, color }) {
  const [headRow, headCol] = squareToGridPos(head);
  const [tailRow, tailCol] = squareToGridPos(tail);
  const startX = headCol * CELL_SIZE_PX + CELL_SIZE_PX / 2;
  const startY = headRow * CELL_SIZE_PX + CELL_SIZE_PX / 2;
  const endX = tailCol * CELL_SIZE_PX + CELL_SIZE_PX / 2;
  const endY = tailRow * CELL_SIZE_PX + CELL_SIZE_PX / 2;
  const dx = (endX - startX) * 0.3;
  const dy = (endY - startY) * 0.6;

  return (
    <path
      d={`M${startX},${startY} C${startX + dx},${startY + dy} ${endX - dx},${endY - dy} ${endX},${endY}`}
      stroke={color}
      strokeWidth="10"
      fill="none"
      style={{ filter: "drop-shadow(0 0 4px #0008)" }}
      markerEnd="url(#snakeHead)"
      markerStart="url(#snakeTail)"
    />
  );
}

// Render a ladder as two lines (rails) and rungs
function LadderSVG({ base, top, color }) {
  const [row1, col1] = squareToGridPos(base);
  const [row2, col2] = squareToGridPos(top);
  const x1 = col1 * CELL_SIZE_PX + CELL_SIZE_PX * 0.38;
  const y1 = row1 * CELL_SIZE_PX + CELL_SIZE_PX * 0.38;
  const x2 = col2 * CELL_SIZE_PX + CELL_SIZE_PX * 0.62;
  const y2 = row2 * CELL_SIZE_PX + CELL_SIZE_PX * 0.62;

  // Ladder offset for rails
  const dx = (x2 - x1) * 0.16, dy = (y2 - y1) * 0.16;
  const rail1 = {
    x1: x1 - dx, y1: y1 - dy,
    x2: x2 - dx, y2: y2 - dy,
  };
  const rail2 = {
    x1: x1 + dx, y1: y1 + dy,
    x2: x2 + dx, y2: y2 + dy,
  };

  // Rungs
  const rungCount = Math.max(3, Math.floor(Math.hypot(x2 - x1, y2 - y1) / CELL_SIZE_PX * 2));
  let rungs = [];
  for (let i = 1; i < rungCount; ++i) {
    const t = i / rungCount;
    const rx1 = rail1.x1 + t * (rail1.x2 - rail1.x1);
    const ry1 = rail1.y1 + t * (rail1.y2 - rail1.y1);
    const rx2 = rail2.x1 + t * (rail2.x2 - rail2.x1);
    const ry2 = rail2.y1 + t * (rail2.y2 - rail2.y1);
    rungs.push(<line key={i} x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#b37029" strokeWidth="5" />);
  }

  return (
    <g>
      <line {...rail1} stroke={color} strokeWidth="10" />
      <line {...rail2} stroke={color} strokeWidth="10" />
      {rungs}
    </g>
  );
}

// Main board rendering
/**
 * PUBLIC_INTERFACE
 * Board component for Snakes & Ladders game.
 * Renders the game board as a 10x10 grid, overlays SVG snakes/ladders, and applies the provided
 * image as a responsive background. All overlays are layered above the real image.
 */
const Board = ({ children }) => (
  <div
    className="game-board-outer"
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "80vh",
      background: "#282c34",
      position: "relative",
      width: "100%",
      overflowX: "auto"
    }}
  >
    {/* BOARD WRAPPER WITH RESPONSIVE BACKGROUND */}
    <div
      className="game-board"
      style={{
        position: "relative",
        width: "min(98vw, " + (BOARD_SIZE * CELL_SIZE_PX) + "px)",
        maxWidth: BOARD_SIZE * CELL_SIZE_PX,
        aspectRatio: "1",
        backgroundImage: "url('/snakes_and_ladders_board.jpg')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        border: "8px solid #ffe14c",
        boxShadow: "0 6px 32px #2227",
        margin: "0 auto"
      }}
    >
      {/* Board cells */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        {[...Array(100)].map((_, idx) => {
          const row = Math.floor(idx / BOARD_SIZE);
          const col = idx % BOARD_SIZE;
          // For boustrophedon order
          const num = (row % 2 === 0)
            ? 100 - (row * BOARD_SIZE) - (BOARD_SIZE - 1 - col)
            : 100 - (row * BOARD_SIZE) - col;
          const cidx = (row * BOARD_SIZE + col) % 3;
          return (
            <div
              key={idx}
              style={{
                border: "1px solid #222",
                background: CELL_COLORS[cidx],
                opacity: 0.94,
                position: "relative",
                fontFamily: '"Comic Sans MS", "Helvetica Neue", Arial, sans-serif',
                fontWeight: "bold",
                fontSize: "clamp(13px, 3vw, " + (CELL_SIZE_PX * 0.41) + "px)",
                color: "#000",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                padding: "min(2px, 0.08vw)",
                boxSizing: "border-box",
                overflow: "hidden"
              }}
            >
              <span style={{
                opacity: 0.75,
                position: "absolute",
                left: 7,
                top: 0,
                fontSize: "clamp(10px, 2vw, " + (CELL_SIZE_PX * 0.34) + "px)",
                zIndex: 2,
              }}>{num}</span>
            </div>
          );
        })}
      </div>
      <svg
        viewBox={`0 0 ${BOARD_SIZE * CELL_SIZE_PX} ${BOARD_SIZE * CELL_SIZE_PX}`}
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          pointerEvents: "none",
          zIndex: 10,
        }}
        preserveAspectRatio="none"
      >
        {/* snake svg head definition */}
        <defs>
          <marker
            id="snakeHead"
            markerWidth="22"
            markerHeight="22"
            refX="12"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <ellipse cx="12" cy="8" rx="8" ry="8" fill="#0006" />
            <ellipse cx="12" cy="7" rx="7" ry="7" fill="#fff4" />
          </marker>
          <marker
            id="snakeTail"
            markerWidth="16"
            markerHeight="12"
            refX="5"
            refY="9"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <ellipse cx="5" cy="8" rx="5" ry="5" fill="#000a" />
          </marker>
        </defs>
        {/* Draw snakes */}
        {SNAKES.map((sn, i) =>
          <SnakeSVG key={i} {...sn} />
        )}
        {/* Draw ladders */}
        {LADDERS.map((lad, i) =>
          <LadderSVG key={i} {...lad} />
        )}
      </svg>
      {children && (
        <div style={{
          position: "absolute",
          left: 0, top: 0, width: "100%", height: "100%", zIndex: 30,
          pointerEvents: "none"
        }}>
          {children}
        </div>
      )}
    </div>
  </div>
);

export default Board;
