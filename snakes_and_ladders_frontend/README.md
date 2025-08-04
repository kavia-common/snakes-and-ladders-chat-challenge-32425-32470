# Snakes and Ladders Frontend (React)

This React app is a playful, modern implementation of the Snakes and Ladders board game with:

- A visually-accurate board based on a designer image background
- Exact position overlay of snakes/ladders per provided design notes
- A trash-talking AI chat panel powered by OpenAI (see setup below)

## Setup

### 1. Install dependencies

    npm install

### 2. Image assets

The player-facing board uses a photographic background:  
Public asset: `public/snakes_and_ladders_board.jpg`

### 3. Environment variables

To enable chat with the AI (trash talk), you **must** provide your OpenAI API key:
- Copy `.env.example` to `.env` and fill in your key.

```
cp .env.example .env
# Edit .env to set REACT_APP_OPENAI_API_KEY=...
```
If no key is provided, the chat panel will show an error and not be functional.

### 4. Run

    npm start

Open http://localhost:3000 to access the game.

## Implementation Notes

- The board is rendered with CSS grid and overlays SVG for snakes and ladders based on the extracted design.
- The chat interface sends messages to OpenAI (gpt-3.5-turbo) with a 'trash talk' system prompt.
- All styles are in `src/App.css`, the board is in `src/Board.js`, and chat/AI is in `src/Chat.js`.

## Credits

- Board design and placement from assets/snakes_and_ladders_board_design_notes.md
- Board image: public/snakes_and_ladders_board.jpg

