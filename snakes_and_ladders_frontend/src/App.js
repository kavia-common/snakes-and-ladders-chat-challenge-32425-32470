import React, { useState, useEffect } from "react";
import "./App.css";
import Board from "./Board";
import Chat from "./Chat";

/**
 * PUBLIC_INTERFACE
 * Main app for Snakes and Ladders game UI with board and chat integration.
 */
function App() {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((th) => (th === "light" ? "dark" : "light"));
  };

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
        <section>
          <Board />
        </section>
        {/* Optionally, add player info or controls here */}
        <section>
          <Chat />
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
