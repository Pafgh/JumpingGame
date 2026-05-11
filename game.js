// ============================================================
// NEON DASH — Complete Game Engine
// ============================================================

// -----------------------------------------------------------
// SECTION A: Constants & Config
// -----------------------------------------------------------
const CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  PLAYER_SIZE: 24,
  PLAYER_COLOR: '#0ff',
  OBSTACLE_COLOR: '#f0f',
  PARTICLE_COUNT: 15,
  INITIAL_SPEED: 3,
  SPEED_INCREMENT: 0.5,
  SPEED_INTERVAL: 5,
  DIFFICULTY_MULTIPLIER_KEY: 'neondash_difficulty',
  OBSTACLE_MIN_GAP: 200,
  OBSTACLE_MAX_GAP: 350,
  GRAVITY: 0.4,
  DASH_FORCE: -7,
  MAX_DASHES_AIRBORNE: 1,
  BG_COLOR: '#0a0a1a',
  GRID_COLOR: 'rgba(0, 255, 255, 0.05)',
};

// -----------------------------------------------------------
// SECTION B: State
// -----------------------------------------------------------
const state = {
  screen: 'instructions',
  score: 0,
  bestScore: 0,
  speed: CONFIG.INITIAL_SPEED,
  difficultyMultiplier: 1.0,
  distance: 0,
  soundEnabled: true,
  shakeTimer: 0,
  shakeIntensity: 0,
};

// -----------------------------------------------------------
// SECTION C: DOM References
// -----------------------------------------------------------
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;

const overlay = document.getElementById('overlay');
const hud = document.getElementById('hud');
const gameOverOverlay = document.getElementById('game-over-overlay');
const scoreDisplay = document.getElementById('score-display');
const bestScoreDisplay = document.getElementById('best-score-display');
const soundToggleBtn = document.getElementById('sound-toggle');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const finalScoreEl = document.getElementById('final-score');
const bestScoreMsgEl = document.getElementById('best-score-msg');

// -----------------------------------------------------------
// SECTION D: Audio Engine (Web Audio API)
// -----------------------------------------------------------
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterGain = null;
    this.musicPlaying = false;
    this.musicNodes = [];
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.3;
  }

  playDash() {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playScore() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    [523, 659].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.12);
    });
  }

  playDeath() {
    if (!this.ctx || this.muted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  startMusic() {
    if (!this.ctx || this.muted || this.musicPlaying) return;
    this.musicPlaying = true;

    const bpm = 140;
    const beatDur = 60 / bpm;
    const eighth = beatDur / 2;

    // A-minor-pentatonic melody (16 eighth-notes, 2 phrases)
    const melody = [
      440, 523, 587, 660, 587, 523, 440, 392,
      440, 523, 587, 660, 587, 523, 440, 440
    ];

    // Bass: one note per 2 eighth-notes (8 entries)
    const bass = [220, 220, 262, 262, 294, 294, 330, 330];

    const SCHEDULE_LOOKAHEAD = 0.1; // seconds
    let nextTime = this.ctx.currentTime;
    let idx = 0;
    let bassIdx = 0;

    const tick = () => {
      while (nextTime < this.ctx.currentTime + SCHEDULE_LOOKAHEAD) {
        // melody voice
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = 'square';
        mOsc.frequency.value = melody[idx % melody.length];
        mGain.gain.setValueAtTime(0.1, nextTime);
        mGain.gain.exponentialRampToValueAtTime(0.01, nextTime + eighth * 0.85);
        mOsc.connect(mGain);
        mGain.connect(this.masterGain);
        mOsc.start(nextTime);
        mOsc.stop(nextTime + eighth);
        this.musicNodes.push(mOsc);

        // bass voice (every 2 eighth-notes)
        if (idx % 2 === 0) {
          const bOsc = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bOsc.type = 'square';
          bOsc.frequency.value = bass[bassIdx % bass.length];
          bGain.gain.setValueAtTime(0.08, nextTime);
          bGain.gain.exponentialRampToValueAtTime(0.01, nextTime + eighth * 1.9);
          bOsc.connect(bGain);
          bGain.connect(this.masterGain);
          bOsc.start(nextTime);
          bOsc.stop(nextTime + eighth * 2);
          this.musicNodes.push(bOsc);
          bassIdx++;
        }

        nextTime += eighth;
        idx++;
      }

      if (this.musicPlaying) {
        setTimeout(tick, 25);
      }
    };

    tick();
  }

  stopMusic() {
    if (!this.musicPlaying) return;
    this.musicPlaying = false;
    this.musicNodes.forEach(n => {
      try { n.stop(); } catch (_) {}
      try { n.disconnect(); } catch (_) {}
    });
    this.musicNodes = [];
  }

  toggle() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.3;
    }
    return this.muted;
  }
}

// -----------------------------------------------------------
// SECTION E: Player Class
// -----------------------------------------------------------
class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 80;
    this.y = CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE - 20;
    this.vy = 0;
    this.width = CONFIG.PLAYER_SIZE;
    this.height = CONFIG.PLAYER_SIZE;
    this.grounded = true;
    this.dashCount = 0;
    this.trail = [];
  }

  dash() {
    if (this.dashCount <= CONFIG.MAX_DASHES_AIRBORNE) {
      this.vy = CONFIG.DASH_FORCE;
      this.grounded = false;
      this.dashCount++;
      return true;
    }
    return false;
  }

  update() {
    this.vy += CONFIG.GRAVITY;
    this.y += this.vy;

    const groundY = CONFIG.CANVAS_HEIGHT - this.height - 20;
    if (this.y >= groundY) {
      this.y = groundY;
      this.vy = 0;
      this.grounded = true;
      this.dashCount = 0;
    }

    // Trail: store recent positions
    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > 5) this.trail.pop();
  }

  draw(ctx) {
    // Draw trail
    for (let i = 1; i < this.trail.length; i++) {
      const alpha = 1 - (i / this.trail.length);
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = CONFIG.PLAYER_COLOR;
      ctx.shadowColor = CONFIG.PLAYER_COLOR;
      ctx.shadowBlur = 10;
      ctx.fillRect(this.trail[i].x, this.trail[i].y, this.width, this.height);
    }

    // Draw player
    ctx.globalAlpha = 1;
    ctx.shadowColor = CONFIG.PLAYER_COLOR;
    ctx.shadowBlur = 20;
    ctx.fillStyle = CONFIG.PLAYER_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Inner bright core
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x + 6, this.y + 6, this.width - 12, this.height - 12);
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }
}

// -----------------------------------------------------------
// SECTION F: Obstacle Class & Spawner
// -----------------------------------------------------------
class Obstacle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.passed = false;
  }

  update(speed) {
    this.x -= speed;
  }

  draw(ctx) {
    ctx.shadowColor = CONFIG.OBSTACLE_COLOR;
    ctx.shadowBlur = 15;
    ctx.fillStyle = CONFIG.OBSTACLE_COLOR;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Inner highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
  }

  getBounds() {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

function spawnObstacle(spawnPoint) {
  // spawnPoint is the x position where this obstacle should appear
  const x = spawnPoint;

  // Randomize: ground obstacle or floating obstacle
  const type = Math.random();
  let w, h, y;

  if (type < 0.6) {
    // Ground obstacle - small and clearly on the ground
    h = randInt(20, 35);
    w = randInt(10, 16);
    y = CONFIG.CANVAS_HEIGHT - h - 20;
  } else if (type < 0.85) {
    // Floating obstacle - clearly above ground, can pass under
    h = randInt(12, 20);
    w = randInt(8, 14);
    // Position well above ground (at least 60px clearance)
    y = CONFIG.CANVAS_HEIGHT - 20 - h - randInt(50, 80);
  } else {
    // Small ground spike
    h = randInt(15, 25);
    w = randInt(6, 12);
    y = CONFIG.CANVAS_HEIGHT - h - 20;
  }

  return new Obstacle(x, y, w, h);
}

// -----------------------------------------------------------
// SECTION G: Particle System
// -----------------------------------------------------------
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = randFloat(-3, 3);
    this.vy = randFloat(-4, 1);
    this.life = 1;
    this.decay = randFloat(0.02, 0.05);
    this.size = randFloat(2, 5);
    this.color = color;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // gravity
    this.life -= this.decay;
    this.size *= 0.98;
  }

  draw(ctx) {
    if (this.life <= 0) return;
    ctx.globalAlpha = this.life;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

let particles = [];

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) {
    particles.push(new Particle(x, y, color));
  }
}

function updateParticles() {
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => p.update());
}

function drawParticles(ctx) {
  particles.forEach(p => p.draw(ctx));
}

// -----------------------------------------------------------
// SECTION H: Background Renderer
// -----------------------------------------------------------
let gridOffset = 0;

function drawBackground(ctx) {
  // Clear
  ctx.fillStyle = CONFIG.BG_COLOR;
  ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

  // Grid lines (scrolling)
  ctx.strokeStyle = CONFIG.GRID_COLOR;
  ctx.lineWidth = 1;

  // Vertical lines
  const gridSize = 40;
  for (let x = -gridSize + (gridOffset % gridSize); x < CONFIG.CANVAS_WIDTH + gridSize; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Horizontal lines (perspective-ish)
  for (let y = 0; y < CONFIG.CANVAS_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Ground line
  const groundY = CONFIG.CANVAS_HEIGHT - 20;
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.shadowColor = CONFIG.PLAYER_COLOR;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(CONFIG.CANVAS_WIDTH, groundY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Grid scroll
  gridOffset += state.speed;
}

// -----------------------------------------------------------
// SECTION I: Game Loop Functions
// -----------------------------------------------------------
const player = new Player();
let obstacles = [];
let spawnTimer = 0;
let audio;
let animFrameId;
let scoreCooldown = 0;

function init() {
  // Load best score
  state.bestScore = parseInt(localStorage.getItem('neondash_best') || '0', 10);
  bestScoreDisplay.textContent = state.bestScore;

  // Init audio
  audio = new AudioEngine();

  // Event listeners
  startBtn.addEventListener('click', () => {
    audio.init();
    startGame();
  });

  restartBtn.addEventListener('click', () => startGame());
  menuBtn.addEventListener('click', () => showInstructions());

  soundToggleBtn.addEventListener('click', () => {
    audio.init();
    const muted = audio.toggle();
    soundToggleBtn.textContent = muted ? '🔇' : '🔊';
  });

  // Game input
  document.addEventListener('keydown', handleKeyDown);
  canvas.addEventListener('mousedown', handleCanvasClick);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleCanvasClick(e); }, { passive: false });

  // Hide HUD until game starts
  hud.style.display = 'none';

  // Load saved difficulty into dropdown
  const savedDifficulty = localStorage.getItem(CONFIG.DIFFICULTY_MULTIPLIER_KEY);
  if (savedDifficulty) {
    document.getElementById('difficulty-select').value = savedDifficulty;
  }

  // Listen for difficulty changes
  document.getElementById('difficulty-select').addEventListener('change', (e) => {
    localStorage.setItem(CONFIG.DIFFICULTY_MULTIPLIER_KEY, e.target.value);
  });

  // Initial render
  drawBackground(ctx);
}

function handleKeyDown(e) {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    if (state.screen === 'playing') {
      player.dash();
      audio.playDash();
      spawnParticles(player.x + player.width / 2, player.y + player.height, CONFIG.PLAYER_COLOR, 5);
    }
  }
}

function handleCanvasClick(e) {
  if (state.screen === 'playing') {
    player.dash();
    audio.playDash();
    spawnParticles(player.x + player.width / 2, player.y + player.height, CONFIG.PLAYER_COLOR, 5);
  }
}

function startGame() {
  // Reset state
  state.screen = 'playing';
  state.score = 0;
  state.speed = CONFIG.INITIAL_SPEED;
  state.distance = 0;
  state.shakeTimer = 0;

  player.reset();

  // Load saved difficulty
  const savedDiff = parseFloat(localStorage.getItem(CONFIG.DIFFICULTY_MULTIPLIER_KEY)) || 1.0;
  state.difficultyMultiplier = savedDiff;

  obstacles = [];
  spawnTimer = randInt(CONFIG.OBSTACLE_MIN_GAP, CONFIG.OBSTACLE_MAX_GAP);
  particles = [];
  gridOffset = 0;

  // UI
  overlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  hud.style.display = 'flex';
  updateHUD();

  // Start loop
  if (animFrameId) cancelAnimationFrame(animFrameId);
  render();
}

function updateHUD() {
  scoreDisplay.textContent = state.score;
  bestScoreDisplay.textContent = state.bestScore;
}

function showInstructions() {
  state.screen = 'instructions';
  overlay.classList.remove('hidden');
  gameOverOverlay.classList.add('hidden');
  hud.style.display = 'none';
}

function gameOver() {
  state.screen = 'gameover';

  // Save best score
  if (state.score > state.bestScore) {
    state.bestScore = state.score;
    localStorage.setItem('neondash_best', state.bestScore.toString());
    bestScoreMsgEl.textContent = '★ NEW BEST! ★';
    bestScoreMsgEl.style.display = 'block';
  } else {
    bestScoreMsgEl.style.display = 'none';
  }

  bestScoreDisplay.textContent = state.bestScore;

  // Effects
  audio.playDeath();
  spawnParticles(player.x + player.width / 2, player.y + player.height / 2, CONFIG.OBSTACLE_COLOR, CONFIG.PARTICLE_COUNT);
  state.shakeTimer = 20;
  state.shakeIntensity = 8;

  // UI
  finalScoreEl.textContent = state.score;
  gameOverOverlay.classList.remove('hidden');
}

// collision detection helper — AABB overlap check
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function update() {
  if (state.screen !== 'playing') return;

  // Update player
  player.update();

  // Apply difficulty multiplier to speed
  const effectiveSpeed = state.speed * state.difficultyMultiplier;

  // Spawn obstacles
  // Find the rightmost obstacle on screen
  let rightmostRightEdge = 0;
  for (let i = 0; i < obstacles.length; i++) {
    rightmostRightEdge = Math.max(rightmostRightEdge, obstacles[i].x + obstacles[i].width);
  }
  
  // Only spawn if no obstacles on screen or the last one has scrolled off screen
  if (obstacles.length === 0 || rightmostRightEdge < player.x + CONFIG.OBSTACLE_MIN_GAP) {
    const obs = spawnObstacle(CONFIG.CANVAS_WIDTH);
    obstacles.push(obs);
  }

  // Update obstacles
  obstacles.forEach(obs => {
    obs.update(effectiveSpeed);

    // Score when passed
    if (!obs.passed && obs.x + obs.width < player.x) {
      obs.passed = true;
      state.score++;

      // Speed ramp
      if (state.score % CONFIG.SPEED_INTERVAL === 0) {
        state.speed += CONFIG.SPEED_INCREMENT;
      }

      audio.playScore();
      updateHUD();

      // Milestone particles
      if (state.score % 5 === 0) {
        spawnParticles(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, CONFIG.OBSTACLE_COLOR, 20);
      }
    }

    // Collision
    const playerBounds = player.getBounds();
    const obsBounds = obs.getBounds();
    if (rectsOverlap(playerBounds, obsBounds)) {
      gameOver();
    }
  });

  // Remove off-screen obstacles
  obstacles = obstacles.filter(obs => !obs.isOffScreen());

  // Update particles
  updateParticles();

  // Screen shake
  if (state.shakeTimer > 0) {
    state.shakeTimer--;
  }

  // Distance for scoring
  state.distance += effectiveSpeed;
}

function draw() {
  ctx.save();

  // Screen shake
  if (state.shakeTimer > 0) {
    const sx = (Math.random() - 0.5) * state.shakeIntensity * (state.shakeTimer / 20);
    const sy = (Math.random() - 0.5) * state.shakeIntensity * (state.shakeTimer / 20);
    ctx.translate(sx, sy);
  }

  // Background
  drawBackground(ctx);

  // Player
  if (state.screen === 'playing' || state.screen === 'gameover') {
    player.draw(ctx);
  }

  // Obstacles
  obstacles.forEach(obs => obs.draw(ctx));

  // Particles
  drawParticles(ctx);

  ctx.restore();
}

function render() {
  update();
  draw();
  animFrameId = requestAnimationFrame(render);
}

// Boot
init();
