import { WIDTH, HEIGHT } from "./config.js";
import { canvas } from "./dom.js";
import { dom } from "./dom.js";
import { state, resetState, stars } from "./state.js";
import { fireLaser, spawnMeteor, loseLife, createExplosion, circleCollision, laserHitsMeteor } from "./entities.js";
import { spawnPowerUp, updatePowerUps } from "./powerups.js";
import { draw } from "./renderer.js";
import { showScreen, updateHud, updatePowerStatus } from "./ui.js";
import { renderRanking } from "./ranking.js";
import { resetInput } from "./input.js";

export function resetGame() {
  resetState();
  dom.saveScoreButton.disabled = false;
  dom.saveScoreButton.textContent = "SALVAR";
  dom.playerName.value = "";
  updateHud();
  updatePowerStatus();
}

export function startGame() {
  cancelAnimationFrame(state.animationId);
  resetGame();
  showScreen("game");
  state.running = true;
  state.lastTime = performance.now();
  state.animationId = requestAnimationFrame(gameLoop);
}

export function endGame() {
  state.running = false;
  cancelAnimationFrame(state.animationId);
  dom.finalScore.textContent = state.score;
  showScreen("over");
  renderRanking();
  setTimeout(() => dom.playerName.focus(), 100);
}

export function update(delta) {
  if (state.keys.left) state.player.x -= state.player.speed * delta;
  if (state.keys.right) state.player.x += state.player.speed * delta;

  if (!state.keys.left && !state.keys.right && state.mouseActive) {
    const difference = state.mouseTargetX - state.player.x;
    state.player.x += difference * Math.min(1, delta * 12);
  }

  state.player.x = Math.max(state.player.width / 2, Math.min(WIDTH - state.player.width / 2, state.player.x));

  state.shootCooldown = Math.max(0, state.shootCooldown - delta);
  if (state.autoFireEnabled || state.keys.fire || state.mouseFiring) fireLaser();

  stars.forEach(star => {
    star.y += star.speed * delta;
    if (star.y > HEIGHT) {
      star.y = 0;
      star.x = Math.random() * WIDTH;
    }
  });

  state.meteorTimer -= delta;
  if (state.meteorTimer <= 0) {
    spawnMeteor();
    const difficulty = Math.min(state.score / 700, 1);
    state.meteorTimer = 0.72 - difficulty * 0.38 + Math.random() * 0.25;
  }

  state.lasers.forEach(laser => {
    laser.y -= laser.speed * delta;
    laser.x += (laser.vx || 0) * delta;
  });

  updatePowerUps(delta);

  state.meteors.forEach(meteor => {
    meteor.y += meteor.speed * delta;
    meteor.rotation += meteor.rotationSpeed * delta;
  });

  for (let laserIndex = state.lasers.length - 1; laserIndex >= 0; laserIndex--) {
    const laser = state.lasers[laserIndex];

    if (laser.y + laser.height < 0) {
      state.lasers.splice(laserIndex, 1);
      continue;
    }

    for (let meteorIndex = state.meteors.length - 1; meteorIndex >= 0; meteorIndex--) {
      const meteor = state.meteors[meteorIndex];
      if (laserHitsMeteor(laser, meteor)) {
        state.lasers.splice(laserIndex, 1);
        state.meteors.splice(meteorIndex, 1);
        state.score += 10 + Math.round(meteor.radius);
        createExplosion(meteor.x, meteor.y);
        if (Math.random() < 0.12) spawnPowerUp(meteor.x, meteor.y);
        updateHud();
        break;
      }
    }
  }

  for (let meteorIndex = state.meteors.length - 1; meteorIndex >= 0; meteorIndex--) {
    const meteor = state.meteors[meteorIndex];
    const shipCircle = { x: state.player.x, y: state.player.y - 4, radius: 24 };

    if (circleCollision(shipCircle, meteor)) {
      state.meteors.splice(meteorIndex, 1);
      createExplosion(meteor.x, meteor.y, "#00F0FF");

      if (state.shieldCharges > 0) {
        state.shieldCharges -= 1;
        state.statusMessage = "ESCUDO ATIVO";
        state.statusMessageUntil = performance.now() + 1000;
        updateHud();
      } else {
        loseLife();
      }

      if (!state.running) {
        endGame();
        return;
      }
      continue;
    }

    if (meteor.y - meteor.radius > HEIGHT) {
      state.meteors.splice(meteorIndex, 1);
      loseLife();
      if (!state.running) {
        endGame();
        return;
      }
    }
  }

  state.particles.forEach(particle => {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    particle.life -= delta;
  });
  state.particles = state.particles.filter(particle => particle.life > 0);
  state.shake = Math.max(0, state.shake - delta * 28);
  updatePowerStatus();
}

export function gameLoop(timestamp) {
  if (!state.running) return;
  const delta = Math.min((timestamp - state.lastTime) / 1000, 0.033);
  state.lastTime = timestamp;
  update(delta);
  draw();
  if (state.running) state.animationId = requestAnimationFrame(gameLoop);
}
