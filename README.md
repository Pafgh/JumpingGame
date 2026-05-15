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

## Prerequisites

- A modern browser (Chrome, Firefox, Safari, or Edge)
- Node.js and pnpm (for local development)

No server setup required — the game runs entirely in the browser.

## Installation

1. Clone the repository:
   ```bash
   git clone https://gitlab.iti.upv.es/pedroaf/jumpinggame.git
   cd jumpinggame
   ```

2. Install pnpm if you have not already:
   ```bash
   npm install -g pnpm
   ```

3. Start the dev server:
   ```bash
   pnpm dev
   ```

4. Open http://localhost:3000 in your browser.

## Testing

This project uses manual browser testing. There are no automated tests.

1. Run `pnpm dev` and open the game in a browser.
2. Test controls: SPACE, click, and tap should all trigger jumps.
3. Verify gameplay: obstacles spawn correctly, score increments, difficulty increases.
4. Check persistence: best score should survive page reloads.
5. Test mobile: resize the window and verify responsive layout.

## Development Notes

### Key Files

- **`game.js`** — Full game engine (720 lines). Organized into sections A through I:
  - A: Constants (`CONFIG` object)
  - B: State management
  - C: DOM references
  - D: Audio engine (Web Audio API)
  - E: Player class (physics, trail, dash)
  - F: Obstacle class and spawner
  - G: Particle system
  - H: Background renderer
  - I: Game loop (`update` → `draw` → `requestAnimationFrame`)

- **`styles.css`** — Theme and layout (376 lines). Uses CSS custom properties in `:root` for colors and glow effects.

- **`index.html`** — Page structure (50 lines). Canvas + overlays (instructions, HUD, game over).

### Extending the Game

- **Add obstacle types**: Modify `spawnObstacle()` in `game.js:327-354`. Change the probability thresholds.
- **Change colors**: Edit CSS custom properties in `:root` (styles.css:6-18) and `CONFIG.PLAYER_COLOR` / `CONFIG.OBSTACLE_COLOR` (game.js:12-13).
- **Adjust difficulty**: Modify `CONFIG.INITIAL_SPEED`, `CONFIG.SPEED_INCREMENT`, or `CONFIG.SPEED_INTERVAL`.
- **Add sound effects**: Extend `AudioEngine` class (game.js:67-213) with new oscillator methods.

### Common Pitfalls

- Never add npm dependencies. Zero deps is a hard constraint.
- Never add build steps or bundlers.
- Always use the `CONFIG` object for constants — no magic numbers.
- Obstacle spawn logic depends on `rightmostRightEdge < player.x + CONFIG.OBSTACLE_MIN_GAP`. Changing this incorrectly will break multi-obstacle spawning.

## Roadmap

Potential future improvements:

- [ ] Multiple themes (cyberpunk, retro, pastel)
- [ ] Sound pack with more synthesized effects
- [ ] High score leaderboard (requires backend)
- [ ] Power-ups (shield, slow motion, double points)
- [ ] Parallax background layers
- [ ] Touch gesture support (swipe direction)
- [ ] Achievements system
