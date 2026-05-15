# Neon Dash: Agent Operating Guide

## Overview
One-button neon arcade game. Zero dependencies, zero build step. Vanilla HTML/CSS/JS served via `npx serve .`.

## Commands
- **Dev server:** `pnpm dev` → `npx serve .` → http://localhost:3000
- **Linting:** None configured. Rely on `lsp_diagnostics` (VSCode JS language server) for static analysis.
- **Testing:** Manual browser testing only. No automated test framework.
  - Test checklist: controls (SPACE/click/tap), obstacle spawning, score increment, speed ramp, localStorage persistence, mobile responsive layout.
- **No build step, no bundler, no transpiler.**

## Code Conventions
- `CONFIG` object (`game.js:8-26`) holds ALL constants. Never hardcode magic numbers.
- Sections labeled `// SECTION X: Name` in `game.js` (A through I). Preserve these section markers.
- Classes: `Player`, `Obstacle`, `Particle`, `AudioEngine`. Extend these, do not invent new patterns.
- Render cycle: `update()` then `draw()` then `requestAnimationFrame(render)`.
- CSS: custom properties in `:root` for colors/glow, `min()` + `aspect-ratio` for responsive sizing.
- State machine: `state.screen` cycles `'instructions'` → `'playing'` → `'gameover'`.
- localStorage keys: `'neondash_best'`, `'neondash_difficulty'`.
- No external deps, no build step. Keep it that way.

## Code Style (Derived from Existing Patterns)

### JavaScript (`game.js` — ~720 lines, single file)
- **Indentation:** 2 spaces, no trailing semicolons (consistent throughout).
- **Naming:** `UPPER_SNAKE_CASE` for constants/CONFIG keys, `camelCase` for variables/functions/classes, `snake_case` not used anywhere.
- **Comments:** Block comments with `// ---` dividers for major sections. Inline comments before logical blocks explaining *why*, not *what*.
- **Error handling:** Minimal — `try/catch` only around oscillator cleanup in `stopMusic()`. No custom error classes. Silent guards (`if (!this.ctx) return`) preferred over throwing.
- **Functions:** Named functions for all logic (`spawnObstacle`, `rectsOverlap`, `randInt`, `randFloat`). No arrow functions except event listener callbacks.
- **Loops:** `for` loops for indexed iteration, `forEach` for side-effect collections, `filter` for array reduction (particles, obstacles).
- **Random helpers:** `randInt(min, max)` inclusive, `randFloat(min, max)` exclusive-max. Used everywhere probabilistic logic.
- **No TypeScript.** Plain JavaScript. No type annotations.

### CSS (`styles.css` — ~376 lines)
- **Custom properties:** Design tokens in `:root` (`--bg-color`, `--neon-cyan`, glow definitions). All colors flow from these.
- **Selector style:** Element selectors (`body`, `canvas`), ID selectors for singletons (`#game-canvas`, `#overlay`), class selectors for reusable components (`.neon-btn`, `.overlay`).
- **Spacing:** 0.5rem–1.5rem increments. Consistent use of `gap` in flex containers.
- **Animations:** `@keyframes pulse` / `pulse-magenta` with `ease-in-out` timing. Glow effects via `text-shadow` + `box-shadow`.
- **Responsive:** Single `@media (max-width: 600px)` breakpoint. Scales font sizes, padding, button dimensions.
- **No preprocessors, no vendor prefixes beyond `-webkit-appearance`.**

### HTML (`index.html` — ~50 lines)
- Semantic structure: `<canvas>` + overlay `<div>`s for UI states.
- Scripts loaded at bottom of `<body>`. No `defer`/`async` (single file, no module system).
- `lang="en"`, `viewport` meta tag for mobile.

## Architecture
- **Game loop:** `render()` → `update()` → `draw()` → `requestAnimationFrame(render)`.
- **Player:** x=80, grounded at y = CANVAS_HEIGHT - 24 - 20, gravity 0.4, dash force -7, trail stores last 5 positions.
- **Obstacles:** spawn at CANVAS_WIDTH, scroll left at `effectiveSpeed = speed * difficultyMultiplier`.
- **Spawn logic** (`game.js:635`): `rightmostRightEdge < player.x + CONFIG.OBSTACLE_MIN_GAP`. Allows 2-3 obstacles on screen.
- **Collision:** AABB via `rectsOverlap()` comparing bounds from `getBounds()` methods.
- **Audio:** Web Audio API, oscillator-based sounds, master gain 0.3, muted until user interaction.
- **Obstacle types:** 60% ground, 25% floating, 15% small spike, randomized in `spawnObstacle()`.

## Key Details
- Canvas: 800×400 (2:1 aspect ratio).
- Initial speed: 3, increases by 0.5 every 5 points.
- Obstacle gaps: 200–350px.
- Difficulty multipliers: 1.0 (Easy), 1.4 (Medium), 1.8 (Hard).
- Max airborne dashes: 1 (`MAX_DASHES_AIRBORNE`).
- Particles: 5 on dash, 15 on death, 20 on milestone (every 5 points).
- Screen shake on death: 20 frames, intensity 8.

## Safety Rules
- NEVER add npm dependencies. Zero deps is a hard constraint.
- NEVER add build steps, bundlers, or transpilers.
- NEVER commit `tmp/`, `.sisyphus/`, `node_modules/`, `*.png`, `.env`, `*.log`, `.playwright-mcp/`.
- NEVER modify `.gitignore` without explicit approval.
- Keep changes in existing files. No new files without explicit request.
- Preserve the no-external-dependencies constraint.
- When extending `AudioEngine`, always guard with `if (!this.ctx || this.muted) return`.
- When modifying obstacle spawning, never break the `rightmostRightEdge` gap check.
