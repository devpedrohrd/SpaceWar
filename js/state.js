import { WIDTH, HEIGHT } from "./config.js";
import { AUTO_FIRE_KEY } from "./config.js";

export const state = {
  animationId: 0,
  lastTime: 0,
  running: false,
  scoreSaved: false,
  score: 0,
  lives: 3,
  meteorTimer: 0,
  shootCooldown: 0,
  shake: 0,
  autoFireEnabled: localStorage.getItem(AUTO_FIRE_KEY) === "true",
  mouseFiring: false,
  mouseTargetX: WIDTH / 2,
  mouseActive: false,
  keys: { left: false, right: false, fire: false },
  player: { x: WIDTH / 2, y: 650, width: 42, height: 58, speed: 300 },
  lasers: [],
  meteors: [],
  particles: [],
  powerUps: [],
  bombInventory: 0,
  tripleUntil: 0,
  rapidUntil: 0,
  shieldCharges: 0,
  statusMessage: "",
  statusMessageUntil: 0
};

export const stars = Array.from({ length: 90 }, () => ({
  x: Math.random() * WIDTH,
  y: Math.random() * HEIGHT,
  size: Math.random() * 1.8 + 0.4,
  speed: Math.random() * 35 + 18
}));

export function resetState() {
  state.score = 0;
  state.lives = 3;
  state.meteorTimer = 0;
  state.shootCooldown = 0;
  state.shake = 0;
  state.lasers = [];
  state.meteors = [];
  state.particles = [];
  state.powerUps = [];
  state.bombInventory = 0;
  state.tripleUntil = 0;
  state.rapidUntil = 0;
  state.shieldCharges = 0;
  state.statusMessage = "";
  state.statusMessageUntil = 0;
  state.player.x = WIDTH / 2;
  state.player.y = 650;
  state.keys.left = false;
  state.keys.right = false;
  state.keys.fire = false;
  state.mouseFiring = false;
  state.mouseActive = false;
  state.mouseTargetX = state.player.x;
  state.scoreSaved = false;
}
