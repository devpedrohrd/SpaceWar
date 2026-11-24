"use strict";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const screens = {
  start: document.getElementById("start-screen"),
  game: document.getElementById("game-screen"),
  over: document.getElementById("game-over-screen")
};

const scoreValue = document.getElementById("score-value");
const livesValue = document.getElementById("lives-value");
const bestValue = document.getElementById("best-value");
const finalScore = document.getElementById("final-score");
const playerNameInput = document.getElementById("player-name");
const scoreForm = document.getElementById("score-form");
const saveScoreButton = document.getElementById("save-score-button");

const RANKING_KEY = "astroDefenderRanking";
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let animationId = 0;
let lastTime = 0;
let running = false;
let scoreSaved = false;
let score = 0;
let lives = 3;
let meteorTimer = 0;
let shootCooldown = 0;
let shake = 0;

const keys = { left: false, right: false, fire: false };
const player = { x: WIDTH / 2, y: HEIGHT - 70, width: 42, height: 58, speed: 300 };
let lasers = [];
let meteors = [];
let particles = [];

const stars = Array.from({ length: 90 }, () => ({
  x: Math.random() * WIDTH,
  y: Math.random() * HEIGHT,
  size: Math.random() * 1.8 + 0.4,
  speed: Math.random() * 35 + 18
}));

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function getRanking() {
  try {
    const data = JSON.parse(localStorage.getItem(RANKING_KEY) || "[]");
    if (!Array.isArray(data)) return [];

    return data
      .filter(item => item && typeof item.name === "string" && Number.isFinite(Number(item.score)))
      .map(item => ({ name: item.name.trim().slice(0, 12) || "Piloto", score: Math.max(0, Math.floor(Number(item.score))) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (error) {
    return [];
  }
}

function getBestScore() {
  return getRanking()[0]?.score || 0;
}

function renderRanking() {
  const ranking = getRanking();
  const containers = [document.getElementById("start-ranking"), document.getElementById("game-ranking")];

  containers.forEach(container => {
    container.innerHTML = "";

    if (ranking.length === 0) {
      container.innerHTML = '<p class="empty-ranking">Nenhuma pontuação ainda.</p>';
      return;
    }

    ranking.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = `ranking-row${index === 0 ? " top" : ""}`;
      row.innerHTML = `
        <span class="ranking-position">${String(index + 1).padStart(2, "0")}</span>
        <span>${escapeHtml(entry.name)}</span>
        <strong class="ranking-score">${entry.score}</strong>`;
      container.appendChild(row);
    });
  });

  bestValue.textContent = getBestScore();
}

function escapeHtml(text) {
  const element = document.createElement("span");
  element.textContent = text;
  return element.innerHTML;
}

function clearRanking() {
  if (!confirm("Deseja apagar todo o ranking local?")) return;
  localStorage.removeItem(RANKING_KEY);
  renderRanking();
}

function resetGame() {
  score = 0;
  lives = 3;
  meteorTimer = 0;
  shootCooldown = 0;
  shake = 0;
  lasers = [];
  meteors = [];
  particles = [];
  player.x = WIDTH / 2;
  player.y = HEIGHT - 70;
  keys.left = false;
  keys.right = false;
  keys.fire = false;
  scoreSaved = false;
  saveScoreButton.disabled = false;
  saveScoreButton.textContent = "SALVAR";
  playerNameInput.value = "";
  updateHud();
}

function startGame() {
  cancelAnimationFrame(animationId);
  resetGame();
  showScreen("game");
  running = true;
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  running = false;
  cancelAnimationFrame(animationId);
  finalScore.textContent = score;
  showScreen("over");
  renderRanking();
  setTimeout(() => playerNameInput.focus(), 100);
}

function updateHud() {
  scoreValue.textContent = score;
  livesValue.textContent = "♥ ".repeat(lives).trim() || "—";
  bestValue.textContent = Math.max(getBestScore(), score);
}

function fireLaser() {
  if (shootCooldown > 0) return;
  lasers.push({ x: player.x, y: player.y - 32, width: 4, height: 18, speed: 620 });
  shootCooldown = 0.24;
}

function spawnMeteor() {
  const radius = 15 + Math.random() * 22;
  const difficulty = Math.min(score / 800, 1);

  meteors.push({
    x: radius + Math.random() * (WIDTH - radius * 2),
    y: -radius - 10,
    radius,
    speed: 80 + Math.random() * 95 + difficulty * 180,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 2,
    points: generateMeteorPoints(radius)
  });
}

function generateMeteorPoints(radius) {
  const count = 9;
  const points = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const variation = radius * (0.74 + Math.random() * 0.28);
    points.push({ x: Math.cos(angle) * variation, y: Math.sin(angle) * variation });
  }
  return points;
}

function createExplosion(x, y, color = "#FF4D4D") {
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 180;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.45 + Math.random() * 0.45,
      maxLife: 0.9,
      size: 2 + Math.random() * 4,
      color
    });
  }
}

function loseLife() {
  lives -= 1;
  shake = 12;
  updateHud();
  if (lives <= 0) endGame();
}

function circleCollision(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radius = b.radius || 0;
  return dx * dx + dy * dy < radius * radius;
}

function laserHitsMeteor(laser, meteor) {
  const closestX = Math.max(meteor.x - meteor.radius, Math.min(laser.x, meteor.x + meteor.radius));
  const closestY = Math.max(meteor.y - meteor.radius, Math.min(laser.y, meteor.y + meteor.radius));
  const dx = laser.x - closestX;
  const dy = laser.y - closestY;
  return dx * dx + dy * dy < (meteor.radius * meteor.radius);
}

function update(delta) {
  if (keys.left) player.x -= player.speed * delta;
  if (keys.right) player.x += player.speed * delta;
  player.x = Math.max(player.width / 2, Math.min(WIDTH - player.width / 2, player.x));

  shootCooldown = Math.max(0, shootCooldown - delta);
  if (keys.fire) fireLaser();

  stars.forEach(star => {
    star.y += star.speed * delta;
    if (star.y > HEIGHT) {
      star.y = 0;
      star.x = Math.random() * WIDTH;
    }
  });

  meteorTimer -= delta;
  if (meteorTimer <= 0) {
    spawnMeteor();
    const difficulty = Math.min(score / 700, 1);
    meteorTimer = 0.72 - difficulty * 0.38 + Math.random() * 0.25;
  }

  lasers.forEach(laser => { laser.y -= laser.speed * delta; });
  meteors.forEach(meteor => {
    meteor.y += meteor.speed * delta;
    meteor.rotation += meteor.rotationSpeed * delta;
  });

  for (let laserIndex = lasers.length - 1; laserIndex >= 0; laserIndex--) {
    const laser = lasers[laserIndex];

    if (laser.y + laser.height < 0) {
      lasers.splice(laserIndex, 1);
      continue;
    }

    for (let meteorIndex = meteors.length - 1; meteorIndex >= 0; meteorIndex--) {
      const meteor = meteors[meteorIndex];
      if (laserHitsMeteor(laser, meteor)) {
        lasers.splice(laserIndex, 1);
        meteors.splice(meteorIndex, 1);
        score += 10 + Math.round(meteor.radius);
        createExplosion(meteor.x, meteor.y);
        updateHud();
        break;
      }
    }
  }

  for (let meteorIndex = meteors.length - 1; meteorIndex >= 0; meteorIndex--) {
    const meteor = meteors[meteorIndex];

    const shipCircle = { x: player.x, y: player.y - 4, radius: 24 };
    if (circleCollision(shipCircle, meteor)) {
      meteors.splice(meteorIndex, 1);
      createExplosion(meteor.x, meteor.y, "#00F0FF");
      loseLife();
      if (!running) return;
      continue;
    }

    if (meteor.y - meteor.radius > HEIGHT) {
      meteors.splice(meteorIndex, 1);
      loseLife();
      if (!running) return;
    }
  }

  particles.forEach(particle => {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    particle.life -= delta;
  });
  particles = particles.filter(particle => particle.life > 0);
  shake = Math.max(0, shake - delta * 28);
}

function drawStars() {
  ctx.fillStyle = "#FFFFFF";
  stars.forEach(star => {
    ctx.globalAlpha = 0.35 + (star.size / 2);
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  ctx.shadowColor = "#00F0FF";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#00F0FF";
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(22, 22);
  ctx.lineTo(8, 16);
  ctx.lineTo(0, 28);
  ctx.lineTo(-8, 16);
  ctx.lineTo(-22, 22);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(8, 10);
  ctx.lineTo(0, 16);
  ctx.lineTo(-8, 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.moveTo(-10, 20);
  ctx.lineTo(-5, 34 + Math.random() * 8);
  ctx.lineTo(0, 20);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(10, 20);
  ctx.lineTo(5, 34 + Math.random() * 8);
  ctx.lineTo(0, 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMeteor(meteor) {
  ctx.save();
  ctx.translate(meteor.x, meteor.y);
  ctx.rotate(meteor.rotation);

  ctx.shadowColor = "#FF4D4D";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#777F84";
  ctx.strokeStyle = "#FF7755";
  ctx.lineWidth = 2;
  ctx.beginPath();
  meteor.points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(45, 50, 54, .85)";
  ctx.beginPath();
  ctx.arc(-meteor.radius * .22, -meteor.radius * .15, meteor.radius * .16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(meteor.radius * .28, meteor.radius * .2, meteor.radius * .11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawParticles() {
  particles.forEach(particle => {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#05070A";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

  drawStars();

  ctx.shadowColor = "#00F0FF";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#EFFFFF";
  lasers.forEach(laser => {
    ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
  });
  ctx.shadowBlur = 0;

  meteors.forEach(drawMeteor);
  drawParticles();
  drawPlayer();
  ctx.restore();

  ctx.fillStyle = "rgba(0, 240, 255, .08)";
  ctx.fillRect(0, HEIGHT - 18, WIDTH, 18);
}

function gameLoop(timestamp) {
  if (!running) return;
  const delta = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;

  update(delta);
  draw();

  if (running) animationId = requestAnimationFrame(gameLoop);
}

function saveRanking(event) {
  event.preventDefault();
  if (scoreSaved) return;

  const name = playerNameInput.value.trim().slice(0, 12) || "Piloto";
  const ranking = getRanking();
  ranking.push({ name, score });
  ranking.sort((a, b) => b.score - a.score);

  try {
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking.slice(0, 10)));
  } catch (error) {
    alert("Não foi possível acessar o armazenamento local deste navegador.");
    return;
  }

  scoreSaved = true;
  saveScoreButton.disabled = true;
  saveScoreButton.textContent = "SALVO";
  renderRanking();
}

function bindTouchButton(id, keyName, isFire = false) {
  const button = document.getElementById(id);

  const press = event => {
    event.preventDefault();
    keys[keyName] = true;
  };

  const release = event => {
    event.preventDefault();
    keys[keyName] = false;
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);

  if (isFire) {
    button.addEventListener("pointerdown", () => {
      if (running) fireLaser();
    });
  }
}

document.getElementById("play-button").addEventListener("click", startGame);
document.getElementById("play-again-button").addEventListener("click", startGame);
document.getElementById("clear-ranking-start").addEventListener("click", clearRanking);
document.getElementById("clear-ranking-game").addEventListener("click", clearRanking);
scoreForm.addEventListener("submit", saveRanking);

window.addEventListener("keydown", event => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = true;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = true;
  if (event.code === "Space") {
    if (!event.repeat) keys.fire = true;
  }
});

window.addEventListener("keyup", event => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") keys.left = false;
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") keys.right = false;
  if (event.code === "Space") keys.fire = false;
});

window.addEventListener("blur", () => {
  keys.left = false;
  keys.right = false;
  keys.fire = false;
});

bindTouchButton("move-left", "left");
bindTouchButton("move-right", "right");
bindTouchButton("fire-button", "fire", true);

renderRanking();
draw();
