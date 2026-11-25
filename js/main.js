import { dom } from "./dom.js";
import { state } from "./state.js";
import { setupInput } from "./input.js";
import { startGame, endGame } from "./game.js";
import { clearRanking, renderRanking, saveRanking } from "./ranking.js";
import { showScreen, updateHud, updatePowerStatus } from "./ui.js";
import { useBomb } from "./powerups.js";
import { draw } from "./renderer.js";

setupInput();

document.getElementById("play-button")?.addEventListener("click", startGame);
document.getElementById("play-again-button")?.addEventListener("click", startGame);
document.getElementById("clear-ranking-start")?.addEventListener("click", clearRanking);
document.getElementById("clear-ranking-game")?.addEventListener("click", clearRanking);
dom.scoreForm.addEventListener("submit", saveRanking);
dom.bombButton.addEventListener("click", useBomb);
document.getElementById("bomb-touch-button")?.addEventListener("click", useBomb);

window.addEventListener("keydown", event => {
  if (event.key === "Escape" && state.running) endGame();
  if (event.key === "Enter" && !state.running) startGame();
});

renderRanking();
updateHud();
updatePowerStatus();
showScreen("start");
draw();
