import { WIDTH, HEIGHT, COLORS, NORMAL_SHOOT_COOLDOWN, RAPID_SHOOT_COOLDOWN } from "./config.js";
import { state } from "./state.js";
import { dom } from "./dom.js";
import { updateHud } from "./ui.js";

export function fireLaser() {
  const now = performance.now();
  if (state.shootCooldown > 0) return;

  if (state.tripleUntil > now) {
    state.lasers.push(
      { x: state.player.x, y: state.player.y - 32, width: 4, height: 18, speed: 620, vx: 0 },
      { x: state.player.x - 12, y: state.player.y - 24, width: 4, height: 18, speed: 620, vx: -85 },
      { x: state.player.x + 12, y: state.player.y - 24, width: 4, height: 18, speed: 620, vx: 85 }
    );
  } else {
    state.lasers.push({ x: state.player.x, y: state.player.y - 32, width: 4, height: 18, speed: 620, vx: 0 });
  }

  state.shootCooldown = state.rapidUntil > now ? RAPID_SHOOT_COOLDOWN : NORMAL_SHOOT_COOLDOWN;
}

export function generateMeteorPoints(radius) {
  const points = [];
  for (let i = 0; i < 9; i++) {
    const angle = (i / 9) * Math.PI * 2;
    const variation = radius * (0.74 + Math.random() * 0.28);
    points.push({ x: Math.cos(angle) * variation, y: Math.sin(angle) * variation });
  }
  return points;
}

export function spawnMeteor() {
  const radius = 15 + Math.random() * 22;
  const difficulty = Math.min(state.score / 800, 1);
  state.meteors.push({
    x: radius + Math.random() * (WIDTH - radius * 2),
    y: -radius - 10,
    radius,
    speed: 80 + Math.random() * 95 + difficulty * 180,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 2,
    points: generateMeteorPoints(radius)
  });
}

export function createExplosion(x, y, color = COLORS.red) {
  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 180;
    state.particles.push({
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

export function loseLife() {
  state.lives -= 1;
  state.shake = 12;
  updateHud();
  if (state.lives <= 0) {
    state.running = false;
  }
}

export function circleCollision(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < b.radius * b.radius;
}

export function laserHitsMeteor(laser, meteor) {
  const closestX = Math.max(meteor.x - meteor.radius, Math.min(laser.x, meteor.x + meteor.radius));
  const closestY = Math.max(meteor.y - meteor.radius, Math.min(laser.y, meteor.y + meteor.radius));
  const dx = laser.x - closestX;
  const dy = laser.y - closestY;
  return dx * dx + dy * dy < meteor.radius * meteor.radius;
}
