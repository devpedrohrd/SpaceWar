import { ctx, canvas } from "./dom.js";
import { WIDTH, HEIGHT, COLORS } from "./config.js";
import { state, stars } from "./state.js";
import { POWER_UPS } from "./powerups.js";

export function drawStars() {
  ctx.fillStyle = COLORS.white;
  stars.forEach(star => {
    ctx.globalAlpha = 0.35 + star.size / 2;
    ctx.fillRect(star.x, star.y, star.size, star.size);
  });
  ctx.globalAlpha = 1;
}

export function drawPlayer() {
  ctx.save();
  ctx.translate(state.player.x, state.player.y);
  ctx.shadowColor = COLORS.cyan;
  ctx.shadowBlur = 18;
  ctx.fillStyle = COLORS.cyan;
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
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(8, 10);
  ctx.lineTo(0, 16);
  ctx.lineTo(-8, 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.gold;
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

export function drawMeteor(meteor) {
  ctx.save();
  ctx.translate(meteor.x, meteor.y);
  ctx.rotate(meteor.rotation);
  ctx.shadowColor = COLORS.red;
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
  ctx.arc(-meteor.radius * 0.22, -meteor.radius * 0.15, meteor.radius * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(meteor.radius * 0.28, meteor.radius * 0.2, meteor.radius * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPowerUps() {
  state.powerUps.forEach(powerUp => {
    const data = POWER_UPS[powerUp.type];
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    ctx.rotate(powerUp.rotation);
    ctx.shadowColor = data.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = "rgba(11,12,16,.92)";
    ctx.strokeStyle = data.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, powerUp.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(-powerUp.rotation);
    ctx.fillStyle = data.color;
    ctx.font = "bold 16px Orbitron, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(data.symbol, 0, 1);
    ctx.restore();
  });
}

export function drawShield() {
  if (state.shieldCharges <= 0) return;
  ctx.save();
  ctx.translate(state.player.x, state.player.y - 4);
  ctx.strokeStyle = COLORS.white;
  ctx.lineWidth = 3;
  ctx.shadowColor = COLORS.cyan;
  ctx.shadowBlur = 18;
  ctx.globalAlpha = 0.75 + Math.sin(performance.now() / 130) * 0.2;
  ctx.beginPath();
  ctx.arc(0, 0, 43, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawParticles() {
  state.particles.forEach(particle => {
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 8;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  });
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

export function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#05070A";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }

  drawStars();
  ctx.shadowColor = COLORS.cyan;
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#EFFFFF";
  state.lasers.forEach(laser => {
    ctx.fillRect(laser.x - laser.width / 2, laser.y, laser.width, laser.height);
  });
  ctx.shadowBlur = 0;

  state.meteors.forEach(drawMeteor);
  drawPowerUps();
  drawParticles();
  drawShield();
  drawPlayer();
  ctx.restore();

  ctx.fillStyle = "rgba(0, 240, 255, .08)";
  ctx.fillRect(0, HEIGHT - 18, WIDTH, 18);
}
