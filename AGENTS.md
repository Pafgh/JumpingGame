# Neon Dash: Agent Operating Guide

## Overview
One-button neon arcade game. Zero dependencies, zero build step. Vanilla HTML/CSS/JS served via `npx serve .`.

## Code Conventions
- `CONFIG` object (game.js:8-26) holds ALL constants. Never hardcode magic numbers.
- Sections labeled `// SECTION X: Name` in game.js (A through I).
- Classes: `Player`, `Obstacle`, `Particle`, `AudioEngine`. Extend these, do not invent new patterns.
- Render cycle: `update()` then `draw()` then `requestAnimationFrame(render)`.
- CSS: custom properties in `:root` for colors/glow, `min()` + `aspect-ratio` for responsive sizing.
- State machine: `state.screen` cycles `'instructions'` to `'playing'` to `'gameover'`.
- localStorage keys: `'neondash_best'`, `'neondash_difficulty'`.
- No external deps, no build step. Keep it that way.

## Architecture
- Game loop: `render()` calls `update()` then `draw()`, looped via `requestAnimationFrame`.
- Player: x=80, grounded at y = CANVAS_HEIGHT - 24 - 20, gravity 0.4, dash force -7, trail stores last 5 positions.
- Obstacles: spawn at CANVAS_WIDTH, scroll left at `effectiveSpeed = speed * difficultyMultiplier`.
- Spawn logic (game.js:552): `rightmostRightEdge < player.x + CONFIG.OBSTACLE_MIN_GAP`. Allows 2-3 obstacles on screen simultaneously.
- Collision: AABB via `rectsOverlap()` comparing bounds.
- Audio: Web Audio API, oscillator-based sounds (dash chirp, score chime, death buzz), master gain 0.3, muted until user interaction.
- Obstacle types: 60% ground, 25% floating, 15% small spike, randomized in `spawnObstacle()`.

## Key Details
- Canvas: 800x400 (2:1 aspect ratio).
- Initial speed: 3, increases by 0.5 every 5 points.
- Obstacle gaps: 200-350px.
- Difficulty multipliers: 1.0 (Easy), 1.4 (Medium), 1.8 (Hard).
- Max airborne dashes: 1 (via `MAX_DASHES_AIRBORNE`).
- Particles: 5 on dash, 15 on death, 20 on milestone (every 5 points).
- Screen shake on death: 20 frames, intensity 8.

## Safety Rules
- NEVER add npm dependencies. Zero deps is a hard constraint.
- NEVER add build steps, bundlers, or transpilers.
- NEVER commit `tmp/`, `.sisyphus/`, `node_modules/`, `*.png`, `.env`, `*.log`.
- NEVER modify `.gitignore` without explicit approval.
- Keep changes in existing files. No new files without explicit request.
- Preserve the no-external-dependencies constraint.
