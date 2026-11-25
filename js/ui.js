import { dom } from "./dom.js";
import { state } from "./state.js";
import { getBestScore } from "./ranking.js";

export function showScreen(name) {
  Object.values(dom.screens).forEach(screen => screen.classList.remove("active"));
  dom.screens[name].classList.add("active");
}

export function updateHud() {
  dom.scoreValue.textContent = state.score;
  dom.livesValue.textContent = "♥ ".repeat(state.lives).trim() || "—";
  dom.bestValue.textContent = Math.max(getBestScore(), state.score);
  dom.bombCount.textContent = state.bombInventory;
  dom.bombButton.disabled = state.bombInventory <= 0;
}

export function updatePowerStatus() {
  const now = performance.now();

  dom.tripleStatus.className = state.tripleUntil > now ? "active triple" : "";
  dom.tripleStatus.textContent = state.tripleUntil > now
    ? `TRIPLO ${(state.tripleUntil - now) / 1000 | 0}s`
    : "TRIPLO —";

  dom.rapidStatus.className = state.rapidUntil > now ? "active rapid" : "";
  dom.rapidStatus.textContent = state.rapidUntil > now
    ? `RÁPIDO ${(state.rapidUntil - now) / 1000 | 0}s`
    : "RÁPIDO —";

  dom.shieldStatus.className = state.shieldCharges > 0 ? "active shield" : "";
  dom.shieldStatus.textContent = state.shieldCharges > 0 ? "ESCUDO 1" : "ESCUDO —";

  if (state.statusMessageUntil <= now) state.statusMessage = "";
}
