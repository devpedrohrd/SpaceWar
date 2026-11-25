import { canvas } from "./dom.js";
import { dom } from "./dom.js";
import { AUTO_FIRE_KEY, WIDTH } from "./config.js";
import { state } from "./state.js";
import { fireLaser } from "./entities.js";
import { useBomb, spawnPowerUp } from "./powerups.js";

export function bindTouchButton(id, keyName, isFire = false) {
  const button = document.getElementById(id);
  if (!button) return;

  const press = event => {
    event.preventDefault();
    state.keys[keyName] = true;
  };

  const release = event => {
    event.preventDefault();
    state.keys[keyName] = false;
  };

  button.addEventListener("pointerdown", press);
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("pointerleave", release);

  if (isFire) {
    button.addEventListener("pointerdown", () => {
      if (state.running) fireLaser();
    });
  }
}

export function setupInput() {
  dom.autoFireToggle.checked = state.autoFireEnabled;

  dom.autoFireToggle.addEventListener("change", () => {
    state.autoFireEnabled = dom.autoFireToggle.checked;
    localStorage.setItem(AUTO_FIRE_KEY, String(state.autoFireEnabled));
  });

  canvas.addEventListener("mousemove", event => {
    if (event.pointerType === "touch") return;
    const rect = canvas.getBoundingClientRect();
    state.mouseTargetX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    state.mouseTargetX = Math.max(state.player.width / 2, Math.min(WIDTH - state.player.width / 2, state.mouseTargetX));
    state.mouseActive = true;
  });

  canvas.addEventListener("mouseleave", () => {
    state.mouseActive = false;
    state.mouseFiring = false;
  });

  canvas.addEventListener("mousedown", event => {
    if (event.button !== 0 || event.pointerType === "touch") return;
    event.preventDefault();
    state.mouseFiring = true;
    if (state.running) fireLaser();
  });

  window.addEventListener("mouseup", event => {
    if (event.button === 0) state.mouseFiring = false;
  });

  window.addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
      event.preventDefault();
    }

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.keys.left = true;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.keys.right = true;
    if (event.code === "Space") state.keys.fire = true;
    if (event.key.toLowerCase() === "b") useBomb();
    if (event.key.toLowerCase() === "p" && state.running && !event.repeat) {
      spawnPowerUp(WIDTH / 2 + (Math.random() - 0.5) * 180, 120);
    }
  });

  window.addEventListener("keyup", event => {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") state.keys.left = false;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") state.keys.right = false;
    if (event.code === "Space") state.keys.fire = false;
  });

  window.addEventListener("blur", resetInput);

  bindTouchButton("move-left", "left");
  bindTouchButton("move-right", "right");
  bindTouchButton("fire-button", "fire", true);
}

export function resetInput() {
  state.keys.left = false;
  state.keys.right = false;
  state.keys.fire = false;
  state.mouseFiring = false;
  state.mouseActive = false;
}
