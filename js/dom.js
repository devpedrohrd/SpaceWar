export const canvas = document.getElementById("game-canvas");
export const ctx = canvas.getContext("2d");

export const dom = {
  screens: {
    start: document.getElementById("start-screen"),
    game: document.getElementById("game-screen"),
    over: document.getElementById("game-over-screen")
  },
  scoreValue: document.getElementById("score-value"),
  livesValue: document.getElementById("lives-value"),
  bestValue: document.getElementById("best-value"),
  finalScore: document.getElementById("final-score"),
  playerName: document.getElementById("player-name"),
  scoreForm: document.getElementById("score-form"),
  saveScoreButton: document.getElementById("save-score-button"),
  autoFireToggle: document.getElementById("auto-fire-toggle"),
  tripleStatus: document.getElementById("triple-status"),
  rapidStatus: document.getElementById("rapid-status"),
  shieldStatus: document.getElementById("shield-status"),
  bombCount: document.getElementById("bomb-count"),
  bombButton: document.getElementById("bomb-button")
};
