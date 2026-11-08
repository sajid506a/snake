// src/themes.ts
var THEMES = {
  phosphor: {
    background: "#07120a",
    grid: "rgba(168, 240, 141, 0.045)",
    snakeHead: "#d8ffcc",
    snakeBody: "#8fe07a",
    snakeGlow: "rgba(168, 240, 141, 0.45)",
    particleColors: ["#d8ffcc", "#a8f08d", "#f0c35e"],
    foodColors: {
      NORMAL: "#eef5d8",
      GOLDEN: "#ffd166",
      SPEED: "#9ad7ff",
      SHRINK: "#ff9c9c"
    }
  },
  amber: {
    background: "#140f07",
    grid: "rgba(240, 179, 94, 0.05)",
    snakeHead: "#ffe3ad",
    snakeBody: "#e0a85a",
    snakeGlow: "rgba(240, 179, 94, 0.45)",
    particleColors: ["#ffe3ad", "#f0b35e", "#c97b2e"],
    foodColors: {
      NORMAL: "#cde9b8",
      GOLDEN: "#ffe08a",
      SPEED: "#9ad7ff",
      SHRINK: "#ff9c9c"
    }
  }
};

// src/game.ts
class SnakeGame {
  canvas;
  ctx;
  gridSize = 25;
  cellSize = 24;
  snake = [];
  direction = "RIGHT";
  nextDirection = "RIGHT";
  foods = [];
  particles = [];
  score = 0;
  highScore = 0;
  multiplier = 1;
  scoreMultiplierTimer = 0;
  gameInterval = 110;
  lastUpdateTime = 0;
  state = "START";
  wallCollision = true;
  currentTheme = THEMES.phosphor;
  scoreEl;
  highScoreEl;
  multiplierEl;
  startOverlay;
  pauseOverlay;
  gameOverOverlay;
  finalScoreText;
  startBtn;
  resumeBtn;
  restartBtn;
  themePhosphorBtn;
  themeAmberBtn;
  wallsBtn;
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.scoreEl = document.getElementById("score-val");
    this.highScoreEl = document.getElementById("high-score-val");
    this.multiplierEl = document.getElementById("multiplier-val");
    this.startOverlay = document.getElementById("start-overlay");
    this.pauseOverlay = document.getElementById("pause-overlay");
    this.gameOverOverlay = document.getElementById("gameover-overlay");
    this.finalScoreText = document.getElementById("final-score-text");
    this.startBtn = document.getElementById("start-btn");
    this.resumeBtn = document.getElementById("resume-btn");
    this.restartBtn = document.getElementById("restart-btn");
    this.themePhosphorBtn = document.getElementById("theme-btn-phosphor");
    this.themeAmberBtn = document.getElementById("theme-btn-amber");
    this.wallsBtn = document.getElementById("walls-btn");
    this.setTheme("phosphor");
    this.loadHighScore();
    this.initEventListeners();
    this.resetGame();
    this.render();
  }
  formatScore(value) {
    return value.toString().padStart(5, "0");
  }
  loadHighScore() {
    const saved = localStorage.getItem("neon_snake_high_score");
    if (saved) {
      this.highScore = parseInt(saved, 10);
      this.highScoreEl.textContent = this.formatScore(this.highScore);
    }
  }
  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("neon_snake_high_score", this.highScore.toString());
      this.highScoreEl.textContent = this.formatScore(this.highScore);
    }
  }
  initEventListeners() {
    window.addEventListener("keydown", (e) => this.handleKeyPress(e));
    this.startBtn.addEventListener("click", () => this.startGame());
    this.resumeBtn.addEventListener("click", () => this.resumeGame());
    this.restartBtn.addEventListener("click", () => this.startGame());
    this.themePhosphorBtn.addEventListener("click", () => {
      this.setTheme("phosphor");
    });
    this.themeAmberBtn.addEventListener("click", () => {
      this.setTheme("amber");
    });
    this.wallsBtn.addEventListener("click", () => {
      this.wallCollision = !this.wallCollision;
      this.wallsBtn.textContent = `Walls: ${this.wallCollision ? "ON" : "OFF"}`;
      this.wallsBtn.classList.toggle("active", this.wallCollision);
      this.wallsBtn.setAttribute("aria-pressed", String(this.wallCollision));
    });
  }
  setTheme(name) {
    this.currentTheme = THEMES[name];
    this.themePhosphorBtn.classList.toggle("active", name === "phosphor");
    this.themePhosphorBtn.setAttribute("aria-pressed", String(name === "phosphor"));
    this.themeAmberBtn.classList.toggle("active", name === "amber");
    this.themeAmberBtn.setAttribute("aria-pressed", String(name === "amber"));
    document.documentElement.dataset.theme = name;
    this.foods = this.foods.map((food) => ({
      ...food,
      color: this.currentTheme.foodColors[food.type]
    }));
  }
  handleKeyPress(e) {
    const key = e.key.toLowerCase();
    if (key === " " || e.code === "Space") {
      e.preventDefault();
      if (this.state === "RUNNING") {
        this.pauseGame();
      } else if (this.state === "PAUSED") {
        this.resumeGame();
      }
      return;
    }
    if (this.state !== "RUNNING")
      return;
    if ((key === "arrowup" || key === "w") && this.direction !== "DOWN") {
      this.nextDirection = "UP";
      e.preventDefault();
    } else if ((key === "arrowdown" || key === "s") && this.direction !== "UP") {
      this.nextDirection = "DOWN";
      e.preventDefault();
    } else if ((key === "arrowleft" || key === "a") && this.direction !== "RIGHT") {
      this.nextDirection = "LEFT";
      e.preventDefault();
    } else if ((key === "arrowright" || key === "d") && this.direction !== "LEFT") {
      this.nextDirection = "RIGHT";
      e.preventDefault();
    }
  }
  resetGame() {
    this.snake = [
      { x: 12, y: 12 },
      { x: 11, y: 12 },
      { x: 10, y: 12 }
    ];
    this.direction = "RIGHT";
    this.nextDirection = "RIGHT";
    this.score = 0;
    this.multiplier = 1;
    this.scoreMultiplierTimer = 0;
    this.foods = [];
    this.particles = [];
    this.scoreEl.textContent = this.formatScore(0);
    this.multiplierEl.textContent = "1×";
    this.spawnFood();
    this.spawnFood();
  }
  startGame() {
    this.resetGame();
    this.state = "RUNNING";
    this.startOverlay.classList.add("hidden");
    this.pauseOverlay.classList.add("hidden");
    this.gameOverOverlay.classList.add("hidden");
    this.lastUpdateTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  pauseGame() {
    this.state = "PAUSED";
    this.pauseOverlay.classList.remove("hidden");
  }
  resumeGame() {
    this.state = "RUNNING";
    this.pauseOverlay.classList.add("hidden");
    this.lastUpdateTime = performance.now();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  gameOver() {
    this.state = "GAMEOVER";
    this.saveHighScore();
    this.finalScoreText.textContent = `Score ${this.formatScore(this.score)} · Best ${this.formatScore(this.highScore)}`;
    this.gameOverOverlay.classList.remove("hidden");
  }
  spawnFood() {
    let x, y;
    let conflict = true;
    while (conflict) {
      x = Math.floor(Math.random() * this.gridSize);
      y = Math.floor(Math.random() * this.gridSize);
      conflict = this.snake.some((segment) => segment.x === x && segment.y === y) || this.foods.some((f) => f.x === x && f.y === y);
    }
    const rand = Math.random();
    let type = "NORMAL";
    let points = 10;
    if (rand < 0.15) {
      type = "GOLDEN";
      points = 50;
    } else if (rand < 0.25) {
      type = "SPEED";
      points = 20;
    } else if (rand < 0.32) {
      type = "SHRINK";
      points = 30;
    }
    this.foods.push({
      x,
      y,
      type,
      color: this.currentTheme.foodColors[type],
      points
    });
  }
  createParticles(x, y, color) {
    const px = x * this.cellSize + this.cellSize / 2;
    const py = y * this.cellSize + this.cellSize / 2;
    for (let i = 0;i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }
  update() {
    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };
    switch (this.direction) {
      case "UP":
        head.y--;
        break;
      case "DOWN":
        head.y++;
        break;
      case "LEFT":
        head.x--;
        break;
      case "RIGHT":
        head.x++;
        break;
    }
    if (this.wallCollision) {
      if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
        this.gameOver();
        return;
      }
    } else {
      if (head.x < 0)
        head.x = this.gridSize - 1;
      if (head.x >= this.gridSize)
        head.x = 0;
      if (head.y < 0)
        head.y = this.gridSize - 1;
      if (head.y >= this.gridSize)
        head.y = 0;
    }
    if (this.snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      this.gameOver();
      return;
    }
    this.snake.unshift(head);
    const foodIndex = this.foods.findIndex((f) => f.x === head.x && f.y === head.y);
    if (foodIndex !== -1) {
      const food = this.foods[foodIndex];
      this.createParticles(head.x, head.y, food.color);
      this.score += food.points * this.multiplier;
      this.scoreEl.textContent = this.formatScore(this.score);
      if (food.type === "GOLDEN") {
        this.multiplier++;
        this.multiplierEl.textContent = `${this.multiplier}×`;
      } else if (food.type === "SHRINK") {
        if (this.snake.length > 4) {
          this.snake.pop();
          this.snake.pop();
        }
      }
      this.foods.splice(foodIndex, 1);
      this.spawnFood();
      if (this.foods.length < 2) {
        this.spawnFood();
      }
    } else {
      this.snake.pop();
    }
    for (let i = this.particles.length - 1;i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  render() {
    const { width, height } = this.canvas;
    const theme = this.currentTheme;
    this.ctx.fillStyle = theme.background;
    this.ctx.fillRect(0, 0, width, height);
    this.ctx.strokeStyle = theme.grid;
    this.ctx.lineWidth = 1;
    for (let i = 0;i <= this.gridSize; i++) {
      const pos = i * this.cellSize + 0.5;
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(width, pos);
      this.ctx.stroke();
    }
    for (const food of this.foods) {
      const fx = food.x * this.cellSize + this.cellSize / 2;
      const fy = food.y * this.cellSize + this.cellSize / 2;
      const r = this.cellSize * 0.3;
      this.ctx.save();
      this.ctx.fillStyle = food.color;
      this.ctx.shadowColor = food.color;
      this.ctx.shadowBlur = 8;
      switch (food.type) {
        case "GOLDEN":
          this.ctx.beginPath();
          this.ctx.moveTo(fx, fy - r);
          this.ctx.lineTo(fx + r, fy);
          this.ctx.lineTo(fx, fy + r);
          this.ctx.lineTo(fx - r, fy);
          this.ctx.closePath();
          this.ctx.fill();
          break;
        case "SHRINK":
          this.ctx.beginPath();
          this.ctx.roundRect(fx - r, fy - r, r * 2, r * 2, 2);
          this.ctx.fill();
          break;
        case "SPEED":
          this.ctx.strokeStyle = food.color;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(fx, fy, r, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.beginPath();
          this.ctx.arc(fx, fy, r * 0.35, 0, Math.PI * 2);
          this.ctx.fill();
          break;
        default:
          this.ctx.beginPath();
          this.ctx.arc(fx, fy, r, 0, Math.PI * 2);
          this.ctx.fill();
      }
      this.ctx.restore();
    }
    this.snake.forEach((segment, index) => {
      const inset = index === 0 ? 2 : 3;
      const sx = segment.x * this.cellSize + inset;
      const sy = segment.y * this.cellSize + inset;
      const size = this.cellSize - inset * 2;
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0.35, 1 - index / (this.snake.length * 1.8));
      this.ctx.fillStyle = index === 0 ? theme.snakeHead : theme.snakeBody;
      this.ctx.shadowColor = index === 0 ? theme.snakeHead : theme.snakeBody;
      this.ctx.shadowBlur = index === 0 ? 10 : 4;
      this.ctx.beginPath();
      this.ctx.roundRect(sx, sy, size, size, index === 0 ? 4 : 3);
      this.ctx.fill();
      if (index === 0) {
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = theme.background;
        const cx = segment.x * this.cellSize + this.cellSize / 2;
        const cy = segment.y * this.cellSize + this.cellSize / 2;
        const offset = 4;
        const eyeRadius = 1.8;
        const eyes = this.direction === "UP" || this.direction === "DOWN" ? [
          { x: cx - offset, y: cy + (this.direction === "UP" ? -offset : offset) },
          { x: cx + offset, y: cy + (this.direction === "UP" ? -offset : offset) }
        ] : [
          { x: cx + (this.direction === "LEFT" ? -offset : offset), y: cy - offset },
          { x: cx + (this.direction === "LEFT" ? -offset : offset), y: cy + offset }
        ];
        for (const eye of eyes) {
          this.ctx.beginPath();
          this.ctx.arc(eye.x, eye.y, eyeRadius, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      this.ctx.restore();
    });
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
  gameLoop(timestamp) {
    if (this.state !== "RUNNING")
      return;
    const elapsed = timestamp - this.lastUpdateTime;
    if (elapsed > this.gameInterval) {
      this.lastUpdateTime = timestamp - elapsed % this.gameInterval;
      this.update();
    }
    this.render();
    requestAnimationFrame((time) => this.gameLoop(time));
  }
}
window.addEventListener("DOMContentLoaded", () => {
  new SnakeGame;
});
