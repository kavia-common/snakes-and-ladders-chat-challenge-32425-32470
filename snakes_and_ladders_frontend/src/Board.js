import React, { useEffect, useRef } from "react";
import boardImg from "./assets/snakes_and_ladders_board.jpg";

/**
 * PUBLIC_INTERFACE
 * Board component for Snakes & Ladders game.
 * Renders the game board as a background image only. 
 * Player tokens/avatars are the only overlays and are strictly placed within the board cells.
 *
 * Props expected:
 *   players: array of player objects, each with:
 *     { id, name, position (1-100), color, avatar (optional) }
 *   boardSize: number of cells per side (default 10 for 10x10)
 *   cellCount: total squares (default 100)
 * 
 * If no players prop is passed, uses mock tokens for demo.
 */
const BOARD_SIZE = 10; // 10x10
const CELL_COUNT = 100;

// Convert 1-100 to [row, col] (0-based, boustrophedon order)
function squareToGridPos(n) {
  const row = BOARD_SIZE - 1 - Math.floor((n - 1) / BOARD_SIZE);
  let col = (n - 1) % BOARD_SIZE;
  if ((BOARD_SIZE - 1 - row) % 2 === 1) {
    col = BOARD_SIZE - 1 - col;
  }
  return [row, col];
}

// Default token colors for demo (replace as needed)
const DEMO_PLAYERS = [
  { id: 1, name: "P1", color: "#d42c27", position: 1 },    // Red
  { id: 2, name: "P2", color: "#31c951", position: 1 },    // Green
];

/**
 * PlayerToken: renders a colored circle (or avatar) positioned on the board.
 */
function PlayerToken({ player, tokenIdx = 0, totalHere = 1 }) {
  const [row, col] = squareToGridPos(player.position);
  // To avoid overlap, offset tokens within the same square
  // Each token is 7vw (max 36px), board is 100vw max 560px
  const size = "clamp(22px, 7vw, 36px)";
  const overlayAdjust = 3 * (tokenIdx - (totalHere - 1) / 2); // px offset

  return (
    <div
      title={player.name}
      style={{
        position: "absolute",
        left: `calc(${(col / BOARD_SIZE) * 100}% + ${overlayAdjust}px)`,
        top: `calc(${(row / BOARD_SIZE) * 100}% + ${overlayAdjust}px)`,
        width: size,
        height: size,
        borderRadius: "50%",
        boxShadow: "0 2px 8px #0008",
        border: "2.5px solid #fff",
        background: player.avatar
          ? `url(${player.avatar}) center/cover no-repeat`
          : player.color || "#444",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: "clamp(12px, 2vw, 18px)",
        zIndex: 40,
        transition: "left 0.3s, top 0.3s",
        pointerEvents: "auto",
        userSelect: "none"
      }}
    >
      {!player.avatar && player.name?.slice(0, 2).toUpperCase()}
    </div>
  );
}

/**
 * Board – renders board image with responsive overlay for player tokens.
 */
const Board = ({
  players = DEMO_PLAYERS,
  boardSize = BOARD_SIZE,
  cellCount = CELL_COUNT,
  children // If supplied, overlays these as well
}) => {
  // Map player tokens per cell (to stack multiple tokens safetly)
  const tokenMap = {};
  players.forEach((p) => {
    if (!p.position) return;
    const pos = p.position;
    if (!tokenMap[pos]) tokenMap[pos] = [];
    tokenMap[pos].push(p);
  });

  // Diagnostic: check that the imported image is a string, and log its content.
  useEffect(() => {
    // eslint-disable-next-line
    if (!boardImg) {
      // This should never trigger unless the import failed (e.g., missing file in build)
      // eslint-disable-next-line
      console.error(
        "Board background image failed to import. 'boardImg':",
        boardImg
      );
    } else if (typeof boardImg !== "string" || !boardImg.match(/\.(jpg|jpeg|png|svg|webp)\b/i)) {
      // If the 'boardImg' is not a reasonable asset path
      // eslint-disable-next-line
      console.error(
        "Board image asset path appears to be invalid.",
        boardImg
      );
    } else {
      // Additionally, attempt preloading for more diagnostics
      const img = new window.Image();
      img.onload = () => {
        // eslint-disable-next-line
        // console.log("Board background image loaded successfully:", boardImg);
      };
      img.onerror = () => {
        // eslint-disable-next-line
        console.error(
          "Failed to load board background image (network or file error).",
          boardImg
        );
      };
      img.src = boardImg;
    }
  }, []);

  // For further diagnosis, we will add a unique test id to the board:
  const boardDivRef = useRef();

  // Detect if background image style is actually applied (run on first mount)
  useEffect(() => {
    if (boardDivRef.current) {
      // Check computed background-image
      const style = window.getComputedStyle(boardDivRef.current);
      const bg = style.getPropertyValue("background-image");
      if (!bg || bg === "none") {
        // eslint-disable-next-line
        console.error(
          "No background-image computed style is set on .game-board!",
          boardDivRef.current,
          boardDivRef.current.style.backgroundImage
        );
      } else if (bg && !(bg.includes(".jpg") || bg.includes("snakes_and_ladders_board"))) {
        // eslint-disable-next-line
        console.error(
          "Background-image is set, but doesn't look like the correct board image:",
          bg
        );
      }
    }
  }, []);

  return (
    <div className="game-board-outer">
      <div
        ref={boardDivRef}
        className="game-board"
        style={{
          minHeight: 320, // minimum to always make board visible
          minWidth: 320,
          width: "min(98vw, 560px)",
          maxWidth: "560px",
          aspectRatio: "1/1",
          position: "relative",
          backgroundImage: `url(${boardImg})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          border: "8px solid #ffe14c",
          boxShadow: "0 6px 32px #2227",
          margin: "0 auto",
          transition: "width 0.2s",
        }}
        data-testid="sl-board"
      >
        {/* Player tokens overlay */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            zIndex: 40,
            pointerEvents: "none",
          }}
        >
          {Object.entries(tokenMap).flatMap(([square, tokenList]) =>
            tokenList.map((player, idx) => (
              <PlayerToken
                key={player.id + '-' + square}
                player={player}
                tokenIdx={idx}
                totalHere={tokenList.length}
              />
            ))
          )}
        </div>

        {/* Custom overlays if supplied */}
        {children && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
