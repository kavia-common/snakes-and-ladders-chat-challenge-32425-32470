import React, { useState, useRef, useImperativeHandle, forwardRef } from "react";

/**
 * PUBLIC_INTERFACE
 * Chat UI component for user/AI conversation.
 * Uses fetch to call OpenAI's completion endpoint with env-provided API key.
 * Now supports imperative API via ref: .aiEmoteTaunt(player, dice, from, to, isWin, isSnake, isLadder)
 */
const Chat = forwardRef((props, ref) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Ha! Ready to get schooled in Snakes and Ladders?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For imperative control from game logic (App.js)
  useImperativeHandle(ref, () => ({
    // Triggers a sassy/taunt chat message based on game situation
    async aiEmoteTaunt(player, dice, from, to, isWin = false, isSnake = false, isLadder = false) {
      let moveDesc = "";
      if (isWin) {
        if (!player.isUser) {
          moveDesc = "AI won the game!";
        } else {
          moveDesc = "Player won the game!";
        }
      } else if (isSnake) {
        moveDesc = `${player.name} rolled a ${dice} (from ${from} to ${to}) and went down a snake!`;
      } else if (isLadder) {
        moveDesc = `${player.name} rolled a ${dice} (from ${from} to ${to}) and climbed a ladder!`;
      } else if (from === to) {
        moveDesc = `${player.name} rolled a ${dice} and could not move.`;
      } else {
        moveDesc = `${player.name} rolled a ${dice} and moved to ${to}.`;
      }
      // System prompt
      let systemPrompt;
      if (!player.isUser) {
        // AI's own move, trash-talk the user, gloat
        systemPrompt =
          "You are a trash-talking, boastful Snakes & Ladders champion AI. Respond in one witty line, always bragging about your superiority and mocking the user's misfortune or your own brilliance. Be snarky and funny, never helpful.";
      } else {
        // Player's move, AI should comment, insult, tease
        systemPrompt =
          "You're a sassy, chatty Snakes & Ladders AI. Respond in one short, clever, taunting comment—either laugh at the user's fail (e.g., down snake), mock achievement (lucky ladder), or undermine any progress. Be family-friendly.";
      }
      await aiAddMessage(moveDesc, systemPrompt);
    },
    // Resets chat to welcome message
    resetToWelcome() {
      setMessages([
        {
          role: "assistant",
          content: "Ha! Ready to get schooled in Snakes and Ladders?",
        },
      ]);
      setInput("");
      setError(null);
    }
  }));

  // Ensure env var is present via REACT_APP_OPENAI_API_KEY in .env
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const chatContainerRef = useRef(null);

  // Default trash talk prompt for manual chat
  const systemPrompt = "You are a playful, cheeky Snakes and Ladders champion. Respond in very short, witty, and taunting lines. Never offer helpful advice—always gloat and make fun (but family-friendly).";

  const aiAddMessage = async (userMessage, systemP = systemPrompt) => {
    setMessages((msgs) => [...msgs, { role: "user", content: userMessage }]);
    setLoading(true);
    setError(null);
    try {
      if (!openaiApiKey) {
        throw new Error("OPENAI_API_KEY missing! Set REACT_APP_OPENAI_API_KEY in .env.");
      }
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemP },
          ...messages.slice(-5),
          { role: "user", content: userMessage },
        ],
        max_tokens: 38,
        temperature: 0.95,
      };
      const result = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!result.ok) throw new Error("OpenAI response error");
      const data = await result.json();
      const resp = data.choices?.[0]?.message?.content || "…";
      setMessages((msgs) => [...msgs, { role: "assistant", content: resp }]);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
      // Scroll chat into view
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 250);
    }
  };

  // Manual chat send (user input)
  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      if (!openaiApiKey) {
        throw new Error("OPENAI_API_KEY missing! Set REACT_APP_OPENAI_API_KEY in .env.");
      }
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-5),
          { role: "user", content: input },
        ],
        max_tokens: 38,
        temperature: 0.95,
      };
      const result = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!result.ok) throw new Error("OpenAI response error");
      const data = await result.json();
      const resp = data.choices?.[0]?.message?.content || "…";
      setMessages((msgs) => [...msgs, { role: "assistant", content: resp }]);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
      // Scroll chat into view
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 250);
    }
  };

  return (
    <div className="chat-panel" style={{
      borderTop: "3px solid #e87a41",
      background: "#1a1f2b",
      color: "#fff",
      width: "100%",
      maxWidth: 560,
      margin: "16px auto 0",
      borderRadius: "0 0 14px 14px",
      padding: "10px 0 0 0",
      boxShadow: "0 8px 28px #0004"
    }}>
      <div
        ref={chatContainerRef}
        style={{
          maxHeight: 220,
          minHeight: 120,
          overflowY: "auto",
          padding: "0 18px",
        }}
      >
        {messages.map((msg, i) =>
          <div key={i} style={{
            textAlign: msg.role === "assistant" ? "left" : "right",
            margin: "6px 0"
          }}>
            <span style={{
              display: "inline-block",
              background: msg.role === "assistant" ? "#282c34" : "#4caf5055",
              color: "#fff",
              padding: "7px 16px",
              borderRadius: "14px",
              fontSize: 16,
              fontFamily: "inherit",
              boxShadow: msg.role === "assistant" ? "0 2px 6px #1116" : "0 2px 4px #fff2"
            }}>{msg.content}</span>
          </div>
        )}
        {loading &&
          <div style={{ color: "#e87a41", fontStyle: "italic", fontSize: 15, margin: "7px 0" }}>AI is typing…</div>
        }
      </div>
      {error &&
        <div style={{ color: "#d42c27", padding: "4px 20px", fontWeight: "bold" }}>{error}</div>
      }
      <div style={{
        display: "flex",
        borderTop: "1px solid #15181d",
        padding: "12px 18px",
        background: "#232742",
        borderRadius: "0 0 14px 14px"
      }}>
        <input
          aria-label="Send a message"
          style={{
            flex: 1,
            padding: 9,
            border: "1px solid #212",
            borderRadius: 7,
            fontSize: 16,
            background: "#14151b",
            color: "#fff"
          }}
          disabled={loading}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Say something to the AI…"
        />
        <button
          style={{
            marginLeft: 9,
            background: "#e94d3c",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0 19px",
            fontWeight: 700,
            fontSize: 17,
            boxShadow: "0 1px 4px #111b"
          }}
          disabled={loading || !input.trim()}
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
});

export default Chat;
