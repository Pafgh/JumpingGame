# Neon Dash

A one-button neon arcade game. Jump over obstacles, survive as long as you can, and beat your best score.

## Play

- **SPACE / Click / Tap** — Dash/jump over obstacles
- **🔊 button** — Toggle sound on/off
- **RETRY** — Restart game
- **MENU** — Return to instructions screen

Easy to understand in 5 seconds. Hard to master.

## Run Locally

```bash
pnpm dev
```

Then open http://localhost:3000 in your browser.

## Tech Stack

- **HTML5 Canvas** — Game rendering
- **CSS3** — Neon glow effects, responsive layout
- **Vanilla JavaScript** — Game engine, no frameworks
- **Web Audio API** — Synthesized sound effects
- **localStorage** — Persistent best score

## File Structure

```
├── index.html      # Game page with canvas and UI overlays
├── styles.css      # Dark neon theme with glow effects
├── game.js         # Complete game engine
├── package.json    # Dev server script
└── README.md       # This file
```

## Features

- Glowing neon square player with trail effect
- Procedurally generated obstacles (ground and floating)
- Particle effects on dash and death
- Screen shake on collision
- Synthesized sound effects (dash, score, death)
- Score tracking with localStorage persistence
- Increasing difficulty (speed ramps every 5 points)
- Responsive layout for desktop and mobile

## No External Dependencies

Zero libraries, zero build step, zero CDN links. Pure HTML, CSS, and JavaScript.
