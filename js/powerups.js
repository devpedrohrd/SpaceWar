import { WIDTH, HEIGHT, COLORS, POWER_UP_DURATION, MAX_BOMBS, MAX_LIVES } from "./config.js";
import { state } from "./state.js";
import { createExplosion } from "./entities.js";
import { updateHud } from "./ui.js";

export const POWER_UPS = {
  triple: { color: COLORS.cyan, symbol: "III", label: "TIRO TRIPLO" },
  rapid: { color: COLORS.gold, symbol: "»", label: "TIRO RÁPIDO" },
  shield: { color: COLORS.white, symbol: "S", label: "ESCUDO" },
  life: { color: COLORS.green, symbol: "+", label: "VIDA EXTRA" },
  bomb: { color: COLORS.purple, symbol: "B", label: "BOMBA" }
};

export function spawnPowerUp(x, y) {
  const types = ["triple", "rapid", "shield", "life", "bomb"];
  const type = types[Math.floor(Math.random() * types.length)];
  state.powerUps.push({ x, y, radius: 17, speed: 82, type, rotation: 0 });
}

export function activatePowerUp(powerUp) {
  const now = performance.now();

  if (powerUp.type === "triple") {
    state.tripleUntil = now + POWER_UP_DURATION;
  } else if (powerUp.type === "rapid") {
    state.rapidUntil = now + POWER_UP_DURATION;
  } else if (powerUp.type === "shield") {
    state.shieldCharges = 1;
  } else if (powerUp.type === "life") {
    state.lives = Math.min(MAX_LIVES, state.lives + 1);
  } else if (powerUp.type === "bomb") {
    state.bombInventory = Math.min(MAX_BOMBS, state.bombInventory + 1);
  }

  state.statusMessage = POWER_UPS[powerUp.type].label;
  state.statusMessageUntil = now + 1800;
  createExplosion(powerUp.x, powerUp.y, POWER_UPS[powerUp.type].color);
  updateHud();
}

export function useBomb() {
  if (!state.running || state.bombInventory <= 0) return;

  state.bombInventory -= 1;
  const meteorsToDestroy = [...state.meteors];
  state.meteors = [];

  meteorsToDestroy.forEach(meteor => {
    state.score += Math.round(meteor.radius * 0.5);
    createExplosion(meteor.x, meteor.y, COLORS.purple);
  });

  state.statusMessage = "BOMBA ESPACIAL";
  state.statusMessageUntil = performance.now() + 1800;
  state.shake = 18;
  updateHud();
}

export function updatePowerUps(delta) {
  state.powerUps.forEach(powerUp => {
    powerUp.y += powerUp.speed * delta;
    powerUp.rotation += delta * 2;
  });

  for (let index = state.powerUps.length - 1; index >= 0; index--) {
    const powerUp = state.powerUps[index];

    if (powerUp.y - powerUp.radius > HEIGHT) {
      state.powerUps.splice(index, 1);
      continue;
    }

    const dx = powerUp.x - state.player.x;
    const dy = powerUp.y - (state.player.y - 4);
    if (dx * dx + dy * dy < (powerUp.radius + 24) ** 2) {
      state.powerUps.splice(index, 1);
      activatePowerUp(powerUp);
    }
  }
}
