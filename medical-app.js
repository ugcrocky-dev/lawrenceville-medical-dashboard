(() => {
  const ideas = window.MEDICAL_IDEAS || [];
  const cardsEl = document.getElementById("cards");
  const visibleCount = document.getElementById("visibleCount");
  const sortBy = document.getElementById("sortBy");
  const searchEl = document.getElementById("search");
  let topOnly = false;

  const capitalLabel = {
    under5k: "Under $5k",
    "5to12k": "$5k–$12k",
    "12to20k": "$12k–$20k",
  };
  const speedLabel = {
    now: "This week / month",
    "30": "About 30 days",
    "60": "30–60+ days",
  };

  function checkedValues(name) {
    return [...document.querySelectorAll(`input[data-filter="${name}"]:checked`)].map((el) => el.value);
  }

  function sortIdeas(list) {
    const key = sortBy.value;
    return [...list].sort((a, b) => {
      if (key === "money") return b.money - a.money || b.score - a.score;
      if (key === "risk") return a.risk - b.risk || b.score - a.score;
      if (key === "speed") return b.speedScore - a.speedScore || b.score - a.score;
      if (key === "capital") return b.fit - a.fit || b.score - a.score;
      return b.score - a.score;
    });
  }

  function render() {
    const speeds = checkedValues("speed");
    const capitals = checkedValues("capital");
    const cats = checkedValues("category");
    const q = (searchEl.value || "").trim().toLowerCase();

    let list = ideas.filter((idea) =>
      speeds.includes(String(idea.speed)) &&
      capitals.includes(idea.capital) &&
      cats.includes(idea.category)
    );

    if (q) {
      list = list.filter((idea) =>
        `${idea.title} ${idea.category} ${idea.summary} ${idea.doNow}`.toLowerCase().includes(q)
      );
    }

    if (topOnly) list = list.filter((idea) => idea.top);
    list = sortIdeas(list);
    visibleCount.textContent = String(list.length);

    cardsEl.innerHTML = list.map((idea) => `
      <article class="card ${idea.top ? "top-pick" : ""}">
        <div class="card-head">
          <div class="rank">#${idea.rank} · Score ${idea.score}</div>
          <div class="badges">
            <span class="badge go">${idea.category}</span>
            <span class="badge">${capitalLabel[idea.capital] || idea.capital}</span>
            <span class="badge money">${idea.margin} margin</span>
            ${idea.top ? '<span class="badge money">Top pick</span>' : ""}
            ${idea.risk >= 7 ? '<span class="badge warn">Higher compliance</span>' : ""}
          </div>
        </div>
        <h3>${idea.title}</h3>
        <p>${idea.summary}</p>
        <div class="metrics">
          <div class="metric"><span>Start</span><strong>${speedLabel[idea.speed] || idea.speed}</strong></div>
          <div class="metric"><span>Capital</span><strong>${capitalLabel[idea.capital] || idea.capital}</strong></div>
          <div class="metric"><span>Margin</span><strong>${idea.margin}</strong></div>
          <div class="metric"><span>Risk</span><strong>${idea.risk}/10</strong></div>
        </div>
        <div class="bars">
          <div class="bar-row"><span>Profit</span><div class="track"><div class="fill" style="width:${idea.money * 10}%"></div></div><span>${idea.money}/10</span></div>
          <div class="bar-row"><span>Speed</span><div class="track"><div class="fill" style="width:${idea.speedScore * 10}%"></div></div><span>${idea.speedScore}/10</span></div>
          <div class="bar-row"><span>$ fit</span><div class="track"><div class="fill" style="width:${idea.fit * 10}%"></div></div><span>${idea.fit}/10</span></div>
          <div class="bar-row"><span>Risk</span><div class="track"><div class="fill risk" style="width:${idea.risk * 10}%"></div></div><span>${idea.risk}/10</span></div>
        </div>
        <details>
          <summary>First move + Georgia note</summary>
          <div class="detail-grid">
            <div class="detail-box">
              <h4>Do now</h4>
              <ul><li>${idea.doNow}</li></ul>
            </div>
            <div class="detail-box">
              <h4>Georgia / PA note</h4>
              <ul>
                <li>PA cannot own the clinical entity — use MD-owned PC + your MSO where needed</li>
                <li>Supervising physician + board job description required for clinical work</li>
                <li>High-risk categories (IV, GLP-1, TRT, peptides) need attorney + real MD oversight</li>
              </ul>
            </div>
          </div>
        </details>
      </article>
    `).join("");
  }

  document.querySelectorAll("input[data-filter]").forEach((el) => {
    el.addEventListener("change", () => { topOnly = false; render(); });
  });
  sortBy.addEventListener("change", render);
  searchEl.addEventListener("input", render);
  document.getElementById("resetFilters").addEventListener("click", () => {
    document.querySelectorAll("input[data-filter]").forEach((el) => { el.checked = true; });
    searchEl.value = "";
    topOnly = false;
    sortBy.value = "score";
    render();
  });
  document.getElementById("showTop").addEventListener("click", () => {
    topOnly = true;
    render();
  });

  render();
})();
