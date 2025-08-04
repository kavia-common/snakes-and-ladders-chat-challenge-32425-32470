import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Board from "./Board";
import Chat from "./Chat";

// Snakes and ladders configuration
const BOARD_SIZE = 10;
const END_CELL = 100;

// These must match the provided design notes for game logic
const SNAKES = [
  { head: 99, tail: 7 },
  { head: 92, tail: 35 },
  { head: 89, tail: 53 },
  { head: 74, tail: 17 },
  { head: 64, tail: 24 },
  { head: 62, tail: 19 },
  { head: 49, tail: 11 },
  { head: 46, tail: 5 },
  { head: 16, tail: 6 },
];
const LADDERS = [
  { base: 2, top: 23 },
  { base: 8, top: 34 },
  { base: 20, top: 77 },
  { base: 32, top: 68 },
  { base: 41, top: 79 },
  { base: 71, top: 91 },
  { base: 80, top: 100 },
  { base: 84, top: 98 },
];

// Util: returns a new idx if there's a snake or ladder; else returns the same idx
function resolveSnakesAndLadders(pos) {
  for (let s of SNAKES) if (s.head === pos) return s.tail;
  for (let l of LADDERS) if (l.base === pos) return l.top;
  return pos;
}

// Die roll utility
function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

// PUBLIC_INTERFACE
// Main app for Snakes and Ladders game UI with board and chat integration,
// now with gameplay, state, and OpenAI-powered taunt messages.
function App() {
  // Theme
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Game state
  const [players, setPlayers] = useState([
    { id: 1, name: "You", color: "#d42c27", position: 1, isUser: true },
    { id: 2, name: "AI", color: "#31c951", position: 1, isUser: false },
  ]);
  const [turn, setTurn] = useState(0); // 0: user, 1: AI
  const [gameOver, setGameOver] = useState(false);
  const [diceValue, setDiceValue] = useState(null);
  const [message, setMessage] = useState(""); // Winner message
  const chatRef = useRef();

  // For handling auto-turn sequence
  const [processing, setProcessing] = useState(false);

  // Reset game function
  // PUBLIC_INTERFACE
  function resetGame() {
    setPlayers([
      { id: 1, name: "You", color: "#d42c27", position: 1, isUser: true },
      { id: 2, name: "AI", color: "#31c951", position: 1, isUser: false },
    ]);
    setTurn(0);
    setGameOver(false);
    setDiceValue(null);
    setMessage("");
    chatRef.current?.resetToWelcome?.();
  }

  // Utility: get player obj for the current turn
  function currentPlayerObj() {
    return players[turn];
  }

  // Utility: get other player obj (not turn)
  function otherPlayerObj() {
    return players[turn === 0 ? 1 : 0];
  }

  // Game move/turn handler
  async function handlePlayTurn() {
    if (processing || gameOver) return;
    setProcessing(true);

    const nowPlayer = currentPlayerObj();
    const otherPlayer = otherPlayerObj();

    // 1. Roll dice
    const dice = rollDice();
    setDiceValue(dice);

    // 2. Calculate new position, respecting boundaries
    let newPos = nowPlayer.position + dice;
    // If over END_CELL, stay in place and skip to taunt
    if (newPos > END_CELL) {
      chatRef.current?.aiEmoteTaunt?.(nowPlayer, dice, nowPlayer.position, nowPlayer.position, false, false);
      setTimeout(() => {
        setProcessing(false);
        setTurn(turn === 0 ? 1 : 0);
      }, 1300);
      return;
    }

    // 3. Check for snake/ladder, animate movement, update token position
    let finalPos = resolveSnakesAndLadders(newPos);

    // 4. Update state for move
    let statePlayers = players.map((p, idx) =>
      idx === turn ? { ...p, position: finalPos } : p
    );
    setPlayers(statePlayers);

    // 5. Check win
    let won = finalPos === END_CELL;
    if (won) {
      setGameOver(true);
      setMessage(`${nowPlayer.isUser ? "You" : "AI"} win${nowPlayer.isUser ? "!" : "s!"} 🏆`);
      // Sassy comment for victory
      setTimeout(() => {
        chatRef.current?.aiEmoteTaunt?.(nowPlayer, dice, nowPlayer.position, finalPos, true, false);
      }, 650);
      setProcessing(false);
      return;
    }

    // 6. Trash talk: sassy comment about the result, using chat module to inject
    setTimeout(async () => {
      if (nowPlayer.isUser) {
        // If user, prompt AI ("React" to user's move with a sassy emote)
        await chatRef.current?.aiEmoteTaunt?.(nowPlayer, dice, nowPlayer.position, finalPos,
          false,
          // Is it snake or ladder?
          (finalPos < newPos ? true : false),
          (finalPos > newPos ? true : false)
        );
      } else {
        // If AI moved, prompt the AI to brag about its own move against you
        await chatRef.current?.aiEmoteTaunt?.(nowPlayer, dice, nowPlayer.position, finalPos,
          false,
          (finalPos < newPos ? true : false),
          (finalPos > newPos ? true : false)
        );
      }
      setProcessing(false);

      // AI's turn triggers automatically after user, so flip
      setTurn((prev) => (prev === 0 ? 1 : 0));
    }, 1100);
  }

  // Automatically let the AI play after user, but only if it's AI's turn & not gameover/processing
  useEffect(() => {
    if (turn === 1 && !gameOver && !processing) {
      // Small delay for realism and UI update
      setTimeout(() => {
        handlePlayTurn();
      }, 1200);
    }
    // eslint-disable-next-line
  }, [turn, gameOver, processing]);
  
  // PUBLIC_INTERFACE
  // Theme toggle
  const toggleTheme = () => {
    setTheme((th) => (th === "light" ? "dark" : "light"));
  };

  // Dice emoji for UI
  const diceDisplay = diceValue !== null ? (
    <span style={{ fontSize: 28, marginLeft: 12 }}>{["", "⚀","⚁","⚂","⚃","⚄","⚅"][diceValue]}</span>
  ) : null;

  return (
    <div className="App" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
        <h2
          style={{
            fontFamily: '"Comic Sans MS", Helvetica Neue, Arial, sans-serif',
            fontWeight: 800,
            margin: "18px 0 10px 0",
            color: "#e94d3c",
            textShadow: "0 5px 18px #0003,0 1px 0 #fff6",
            letterSpacing: "0.04em",
            fontSize: 32,
          }}
        >
          Snakes & Ladders Showdown 🎲
        </h2>

        {/* PLAY TURN BUTTON & game status */}
        <section>
          <div style={{ margin: "10px 0" }}>
            {gameOver ? (
              <>
                <span style={{
                  color: "#31c951",
                  fontWeight: 800,
                  fontSize: 24,
                  marginRight: 7,
                  textShadow: "0 2px 6px #1113",
                }}>{message}</span>
                <button
                  style={{
                    marginLeft: 12,
                    background: "#e94d3c",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 25px",
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: "0 3px 8px #1115",
                  }}
                  onClick={resetGame}
                >Reset Game</button>
              </>
            ) : (
              turn === 0 ? (
                <button
                  style={{
                    background: processing ? "#aaa" : "#fd7d25",
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "11px 32px",
                    fontWeight: 800,
                    fontSize: 20,
                    letterSpacing: "0.05em",
                    boxShadow: processing ? undefined : "0 4px 16px #e94d3c44",
                    cursor: processing ? "not-allowed" : "pointer",
                    opacity: processing ? 0.7 : 1,
                    outline: "none"
                  }}
                  onClick={handlePlayTurn}
                  disabled={gameOver || processing}
                  aria-disabled={gameOver || processing}
                  tabIndex={0}
                >{processing ? "Rolling…" : "🎲 Play Turn"}
                </button>
              ) : (
                <span style={{ color: "#ffd72b", fontSize: 19, fontWeight: 700, marginLeft: 6, textShadow: "0 1px 4px #0007" }}>
                  AI is making its move…
                </span>
              )
            )}
            {diceDisplay}
          </div>
        </section>

        {/* Board, passing player state */}
        <section>
          <Board
            players={players}
            boardSize={BOARD_SIZE}
            cellCount={END_CELL}
          />
        </section>

        {/* Player info row */}
        <section style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
            {players.map((pl, idx) => (
              <span key={pl.id} title={pl.name} style={{
                display: "flex", alignItems: "center",
                fontWeight: 700, fontSize: 17,
                color: pl.color, background: "#fff8", borderRadius: 9, padding: "5px 16px"
              }}>
                <span style={{
                  display: "inline-block",
                  width: 19, height: 19,
                  borderRadius: "50%",
                  background: pl.color,
                  border: "2px solid #fafafa",
                  marginRight: 6,
                  marginTop: -2
                }} />
                {pl.name} ({pl.position})
                {turn === idx && !gameOver && (
                  <span style={{ fontWeight: 900, color: "#e94d3c", marginLeft: 8 }}>
                    ▲
                  </span>
                )}
              </span>
            ))}
          </div>
        </section>

        {/* Chat Area, pass ref for sassy ai taunt injection */}
        <section>
          <Chat ref={chatRef} />
        </section>
        <footer style={{
          marginTop: 38,
          fontSize: 13,
          color: "var(--text-secondary)",
          opacity: 0.8,
        }}>
          <span>
            <b>Note:</b> You must set an OpenAI API key in <code>.env</code> as <b>REACT_APP_OPENAI_API_KEY</b> for chat functionality.
          </span>
        </footer>
      </header>
    </div>
  );
}

export default App;
