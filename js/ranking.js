import { RANKING_KEY } from "./config.js";
import { dom } from "./dom.js";
import { state } from "./state.js";

export function getRanking() {
  try {
    const data = JSON.parse(localStorage.getItem(RANKING_KEY) || "[]");
    if (!Array.isArray(data)) return [];

    return data
      .filter(item => item && typeof item.name === "string" && Number.isFinite(Number(item.score)))
      .map(item => ({
        name: item.name.trim().slice(0, 12) || "Piloto",
        score: Math.max(0, Math.floor(Number(item.score)))
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch {
    return [];
  }
}

export function getBestScore() {
  return getRanking()[0]?.score || 0;
}

export function escapeHtml(text) {
  const element = document.createElement("span");
  element.textContent = text;
  return element.innerHTML;
}

export function renderRanking() {
  const ranking = getRanking();
  const containers = [
    document.getElementById("start-ranking"),
    document.getElementById("game-ranking")
  ];

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

  dom.bestValue.textContent = getBestScore();
}

export function clearRanking() {
  if (!confirm("Deseja apagar todo o ranking local?")) return;
  localStorage.removeItem(RANKING_KEY);
  renderRanking();
}

export function saveRanking(event) {
  event.preventDefault();
  if (state.scoreSaved) return;

  const name = dom.playerName.value.trim().slice(0, 12) || "Piloto";
  const ranking = getRanking();
  ranking.push({ name, score: state.score });
  ranking.sort((a, b) => b.score - a.score);

  try {
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking.slice(0, 10)));
  } catch {
    alert("Não foi possível acessar o armazenamento local deste navegador.");
    return;
  }

  state.scoreSaved = true;
  dom.saveScoreButton.disabled = true;
  dom.saveScoreButton.textContent = "SALVO";
  renderRanking();
}
