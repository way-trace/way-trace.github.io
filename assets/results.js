// Results charts in plain SVG. Every number is copied from the paper (waytrace_overleaf/tables/*.tex and
// sections/05_results.tex, appendix tab:datascale); do not change one without changing the paper.
(() => {
  const root = document.getElementById("results-root");
  if (!root) return;
  const C = { ours: "var(--trace)", oracle: "#d27cbf", base: "#8f949b", grid: "var(--grid)", axis: "var(--axis)" };
  // one muted hue per baseline model, the same in every chart (CityWalker + RL and CityWalker† share CityWalker's)
  const MODEL = { CityWalker: "#5b8db8", VAMOS: "#c98c55", OmniVLA: "#74a06e", "TIC-VLA": "#9585c2", Foresight: "#4f9c95", VENTURA: "#ad9746" };
  const colorOf = name => MODEL[name.replace("†", "").replace(" + RL", "")] || C.base;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const f1 = v => v.toFixed(1);

  // ---------- data
  const Q1 = [
    { group: "Route as GNSS sub-goals", rows: [["CityWalker", 20.0], ["VAMOS", 13.3], ["OmniVLA", 0.0]] },
    { group: "Language-conditioned, oracle commands", rows: [["TIC-VLA", 6.7], ["Foresight", 3.3], ["VENTURA", 6.7]] },
    { group: "WayTrace", rows: [["WayTrace", 83.3, "ours"], ["with oracle orchestrator", 90.0, "oracle"]] },
  ];
  const NOISE = [0, 2, 5, 7];
  const Q2 = {
    series: [
      { name: "WayTrace", color: C.ours, shape: "circle", ours: true,
        sr: [83.3, 80.0, 73.3, 63.3], cw: [2.2, 4.7, 2.4, 5.4], rd: [0.8, 0.9, 1.0, 0.9] },
      { name: "CityWalker + RL", color: MODEL.CityWalker, shape: "square",
        sr: [36.7, 40.0, 20.0, 23.3], cw: [54.8, 47.6, 47.6, 55.6], rd: [7.6, 5.6, 6.3, 8.0] },
      { name: "VAMOS + RL", color: MODEL.VAMOS, shape: "diamond",
        sr: [63.3, 60.0, 16.7, 10.0], cw: [31.8, 37.0, 52.9, 68.8], rd: [1.8, 3.9, 7.5, 9.6] },
    ],
    oracle: { sr: 90.0, cw: 4.2, rd: 1.2 },
  };
  const Q3 = [
    { name: "Starbucks", env: "City centre, stairs, construction, tram tracks", m: 426, v: 1.12, c: 26, i: "0", a: 100, k: 0 },
    { name: "Snipes", env: "Old town, pedestrian streets", m: 248, v: 1.01, c: 13, i: "0", a: 100, k: 1 },
    { name: "Dieci", env: "River, footbridge, tram tracks", m: 312, v: 1.11, c: 19, i: "0", a: 100, k: 2 },
    { name: "Mendokoro", env: "Fields, woods, campus", m: 1368, v: 1.19, c: 21, i: "2 (36 s, 37 m)", a: 97.2, k: 3 },
  ];
  const OPEN = {
    methods: ["WayTrace", "CityWalker†", "VAMOS†", "Foresight", "VENTURA", "TIC-VLA"],
    human: { nt: [83.2, 57.0, 56.6, 50.5, 45.2, 22.6], side: [97.9, 90.4, 97.7, 77.4, 65.6, 66.3] },
    walks: { nt: [70.4, 50.9, 48.8, 41.8, 33.2, 10.5], side: [92.6, 87.3, 92.5, 75.1, 70.2, 80.3] },
  };
  const HIST = [["All episodes", 74.7, 94.7], ["Turns", 56.0, 94.7], ["Controls", 93.3, 94.7]];
  const SCALE = [["Hand-labelled + walks", 327.8, 79.33, "base"], ["+ 10k intent", 337.8, 80.66, "+10k"],
                 ["+ 100k intent", 427.8, 82.57, "+100k"], ["+ 863k intent", 1190.6, 83.32, "+863k"]];
  const VLM = [["Qwen3.8-Flash-Next", 1.38, 5.1, true, "self-hosted"], ["Gemini 3.5 Flash-Lite", 5.12, 5.9, false, "API"],
               ["Gemini 3.8 Flash", 6.53, 3.2, false, "API"], ["GPT-6 Sol", 4.52, 3.2, false, "API"]];

  // ---------- tooltip
  const tip = document.createElement("div"); tip.id = "tip"; document.body.appendChild(tip);
  function showTip(e, head, rows) {
    tip.innerHTML = (head ? `<div class="h">${esc(head)}</div>` : "") + rows.map(([n, v, c]) =>
      `<div class="r"><span>${c ? `<i style="background:${c}"></i>` : ""}${esc(n)}</span><b>${esc(v)}</b></div>`).join("");
    const r = tip.getBoundingClientRect();
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14;
    if (y + r.height > innerHeight - 8) y = e.clientY - r.height - 14;
    tip.style.left = x + "px"; tip.style.top = y + "px"; tip.classList.add("on");
  }
  const hideTip = () => tip.classList.remove("on");
  function hover(node, fn) {
    node.addEventListener("pointermove", fn); node.addEventListener("pointerleave", hideTip);
    node.addEventListener("focus", e => { const b = node.getBoundingClientRect(); fn({ clientX: b.right, clientY: b.top, target: node }); });
    node.addEventListener("blur", hideTip);
  }

  // ---------- helpers
  const block = (q, title, html, chartsCls = "") => {
    const d = document.createElement("div"); d.className = "rq";
    d.innerHTML = `<div><div class="q">${q}</div><h3>${title}</h3>${html}</div><div class="charts ${chartsCls}"></div>`;
    root.appendChild(d); return d.querySelector(".charts");
  };
  const chartBox = (parent, title, sub) => {
    const c = document.createElement("div"); c.className = "chart";
    c.innerHTML = `<h4>${title}</h4>${sub ? `<p class="cs">${sub}</p>` : ""}`; parent.appendChild(c); return c;
  };
  const tableView = (parent, head, rows) => {
    const d = document.createElement("details"); d.className = "tv";
    d.innerHTML = `<summary>Table</summary><table><tr>${head.map(h => `<th>${esc(h)}</th>`).join("")}</tr>${rows.map(r =>
      `<tr>${r.map(x => `<td>${esc(x)}</td>`).join("")}</tr>`).join("")}</table>`;
    parent.appendChild(d);
  };
  const svgEl = (parent, w, h) => { parent.insertAdjacentHTML("beforeend", `<svg viewBox="0 0 ${w} ${h}" role="img"></svg>`); return parent.lastElementChild; };
  const marker = (shape, x, y, color, r = 4.5) => shape === "square"
    ? `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" rx="1.5" fill="${color}" stroke="#fff" stroke-width="2"/>`
    : shape === "diamond"
      ? `<path d="M${x} ${y - r - 1}L${x + r + 1} ${y}L${x} ${y + r + 1}L${x - r - 1} ${y}Z" fill="${color}" stroke="#fff" stroke-width="2"/>`
      : `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="#fff" stroke-width="2"/>`;
  const legend = (parent, items) => parent.insertAdjacentHTML("beforeend", `<div class="legend-row">${items.map(s =>
    `<span><svg viewBox="0 0 22 12"><line x1="1" x2="21" y1="6" y2="6" stroke="${s.color}" stroke-width="2"/>${marker(s.shape, 11, 6, s.color, 3.5)}</svg>${esc(s.name)}</span>`).join("")}</div>`);

  // horizontal bars with group headers; value at the bar tip
  function hbars(parent, groups, { unit = "%", max = 100, W = 760 } = {}) {
    const L = 196, R = 48, bh = 18, rowH = 28, gh = 26;
    const rows = groups.reduce((n, g) => n + g.rows.length, 0);
    const H = rows * rowH + groups.length * gh + 24;
    const svg = svgEl(parent, W, H), x = v => L + (W - L - R) * v / max;
    let s = "", y = 0;
    for (let t = 0; t <= max; t += 20) s += `<line x1="${x(t)}" x2="${x(t)}" y1="0" y2="${H - 20}" stroke="${C.grid}"/><text class="ax" x="${x(t)}" y="${H - 4}" text-anchor="middle">${t}${t === max ? " " + unit : ""}</text>`;
    const hits = [];
    groups.forEach(g => {
      y += gh; s += `<text class="grp" x="0" y="${y - 8}">${esc(g.group)}</text>`;
      g.rows.forEach(([name, v, kind]) => {
        const col = kind === "ours" ? C.ours : kind === "oracle" ? C.oracle : colorOf(name), cy = y + (rowH - bh) / 2, w = Math.max(0, x(v) - L);
        s += `<text class="lb ${kind === "ours" ? "strong" : ""}" x="${L - 10}" y="${cy + 13}" text-anchor="end">${esc(name)}</text>`;
        s += w > 0 ? `<path class="mark" d="M${L} ${cy}h${Math.max(0, w - 4)}a4 4 0 0 1 4 4v${bh - 8}a4 4 0 0 1 -4 4h${-Math.max(0, w - 4)}Z" fill="${col}"/>`
                   : `<line x1="${L}" x2="${L}" y1="${cy}" y2="${cy + bh}" stroke="${C.axis}" stroke-width="2"/>`;
        s += `<text class="val" x="${x(v) + 6}" y="${cy + 13}" ${kind === "ours" ? 'font-weight="600"' : ""}>${f1(v)}</text>`;
        hits.push({ y: y, name, v, col }); y += rowH;
      });
    });
    s += `<line x1="${L}" x2="${L}" y1="0" y2="${H - 20}" stroke="${C.axis}"/>`;
    svg.innerHTML = s + hits.map((h, i) => `<rect class="hit" tabindex="0" data-i="${i}" x="0" y="${h.y}" width="${W}" height="${rowH}"/>`).join("");
    svg.querySelectorAll(".hit").forEach(r => hover(r, e => { const h = hits[+r.dataset.i]; showTip(e, "Success rate", [[h.name, f1(h.v) + " %", h.col]]); }));
  }

  // small-multiple line chart with a crosshair that lists every series at the nearest x
  function lines(parent, key, { yMax, yStep, title, oracle }) {
    const W = 320, H = 230, L = 34, R = 34, T = 10, B = 30;
    const x = v => L + (W - L - R) * v / 7, y = v => T + (H - T - B) * (1 - v / yMax);
    const svg = svgEl(parent, W, H + 6);
    let s = "";
    for (let t = 0; t <= yMax + 1e-9; t += yStep) s += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${C.grid}"/><text class="ax" x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`;
    NOISE.forEach(n => s += `<text class="ax" x="${x(n)}" y="${H - 12}" text-anchor="middle">${n}</text>`);
    s += `<text class="ax" x="${W - R}" y="${H}" text-anchor="end">GNSS noise, RMS [m]</text>`;
    s += `<line x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}" stroke="${C.axis}"/>`;
    // baselines first so WayTrace is drawn on top
    [...Q2.series].reverse().forEach(se => {
      s += `<polyline class="mark" points="${se[key].map((v, i) => `${x(NOISE[i])},${y(v)}`).join(" ")}" fill="none" stroke="${se.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
      se[key].forEach((v, i) => s += marker(se.shape, x(NOISE[i]), y(v), se.color));
    });
    if (oracle != null) s = `<line x1="${L}" x2="${W - R}" y1="${y(oracle)}" y2="${y(oracle)}" stroke="${C.oracle}" stroke-width="2" stroke-dasharray="5 4"/>
      <text class="ax" x="${W - R}" y="${y(oracle) - 6}" text-anchor="end">oracle orchestrator ${f1(oracle)}</text>` + s;
    // end labels for the 7 m values, nudged apart only when they would overlap
    const ends = Q2.series.map(se => ({ se, yy: y(se[key][3]) })).sort((a, b) => a.yy - b.yy);
    for (let i = 1; i < ends.length; i++) if (ends[i].yy - ends[i - 1].yy < 12) ends[i].yy = ends[i - 1].yy + 12;
    ends.forEach(({ se, yy }) => s += `<text class="val" x="${x(7) + 8}" y="${yy + 4}" ${se.ours ? 'font-weight="600"' : ""}>${f1(se[key][3])}</text>`);
    s += `<line class="xh" x1="0" x2="0" y1="${T}" y2="${H - B}" stroke="var(--ink)" stroke-width="1" opacity="0"/>`;
    s += `<rect class="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}"/>`;
    svg.innerHTML = s;
    const xh = svg.querySelector(".xh"), hit = svg.querySelector(".hit");
    hit.addEventListener("pointermove", e => {
      const b = svg.getBoundingClientRect(), px = (e.clientX - b.left) * W / b.width;
      const i = NOISE.reduce((bi, n, k) => Math.abs(x(n) - px) < Math.abs(x(NOISE[bi]) - px) ? k : bi, 0);
      xh.setAttribute("x1", x(NOISE[i])); xh.setAttribute("x2", x(NOISE[i])); xh.setAttribute("opacity", .35);
      const rows = Q2.series.map(se => [se.name, f1(se[key][i]) + " %", se.color]);
      if (oracle != null) rows.push(["Oracle orchestrator, perfect GNSS", f1(oracle) + " %", C.oracle]);
      showTip(e, `${title}, ${NOISE[i]} m noise`, rows);
    });
    hit.addEventListener("pointerleave", () => { hideTip(); xh.setAttribute("opacity", 0); });
  }

  // ---------- Q1
  let ch = block("Q1 · long range", "Long missions need both the route and the sidewalk",
    `<div class="hero-n">83.3 %</div><div class="hero-l">success of WayTrace over 10 missions of 152 to 864 m, 30 runs</div>
     <p style="margin-top:14px">A run succeeds when the robot stops within 5 m of the destination and crosses every road at
     the zebra crossing. Navigation models that follow the route as GNSS sub-goals reach at most 20 %, and language-conditioned
     path predictors reach at most 6.7 % even with oracle commands tuned for each method. They leave the route within the
     first 10 to 130 m on all but the shortest mission.</p>`);
  let c = chartBox(ch, "Success rate, perfect GNSS", "Ten simulated missions in Zurich, 4.68 km in total, three seeds each");
  hbars(c, Q1);
  c.insertAdjacentHTML("beforeend", `<p class="note">CityWalker, VAMOS and OmniVLA follow the route as GNSS waypoints with their
    released control loops. The language-conditioned methods receive their commands from an oracle orchestrator.</p>`);
  tableView(c, ["Method", "Group", "SR [%]"], Q1.flatMap(g => g.rows.map(r => [r[0], g.group, f1(r[1])])));

  // ---------- Q2
  ch = block("Q2 · GNSS robustness", "Robust to GNSS noise, and it stays on crosswalks and sidewalks",
    `<p>GNSS errors are emulated as a slowly drifting bias. From perfect GNSS to 7 m RMS, WayTrace goes from 83.3 to
     63.3 %, while the point-goal baselines fall to 23.3 and 10.0 %. Even with perfect GNSS and our RL policy, the
     baselines succeed in only 36.7 and 63.3 % of the runs, since they often cross the road outside the zebra crossing.</p>
     <p>WayTrace takes 2.2 to 5.4 % of crossings outside the zebra crossing, against 31.8 to 68.8 % for the baselines, and
     spends about 1 % of its path on the road.</p>
     <p>With an oracle orchestrator that issues each command at the right place, WayTrace reaches 90.0 %.</p>`, "three");
  const lg = document.createElement("div"); lg.style.gridColumn = "1 / -1"; ch.appendChild(lg); legend(lg, Q2.series);
  c = chartBox(ch, "Success rate [%]", "higher is better"); lines(c, "sr", { yMax: 100, yStep: 20, title: "Success rate", oracle: Q2.oracle.sr });
  c = chartBox(ch, "Crosswalk violations [%]", "crossings outside the zebra, lower is better"); lines(c, "cw", { yMax: 70, yStep: 10, title: "Crosswalk violations" });
  c = chartBox(ch, "Road violations [%]", "share of the path on the road, lower is better"); lines(c, "rd", { yMax: 10, yStep: 2, title: "Road violations" });
  const tq2 = document.createElement("div"); tq2.style.gridColumn = "1 / -1"; ch.appendChild(tq2);
  tq2.insertAdjacentHTML("beforeend", `<p class="note">CityWalker + RL and VAMOS + RL: the paths predicted by CityWalker and
    VAMOS are lifted to 3D and followed by our RL policy, the same low-level controller as WayTrace.</p>`);
  tableView(tq2, ["Method", "SR 0/2/5/7 m", "Crosswalk viol. 0/2/5/7 m", "Road viol. 0/2/5/7 m"],
    Q2.series.map(se => [se.name, se.sr.map(f1).join(" / "), se.cw.map(f1).join(" / "), se.rd.map(f1).join(" / ")])
      .concat([["Oracle orchestrator", f1(Q2.oracle.sr) + " (0 m)", "", ""]]));

  // ---------- Q3
  ch = block("Q3 · real world", "2.35 km through Zurich on a wheeled-legged robot",
    `<p>Four missions through a busy city centre, the old town, rural trails and a university campus, at about 1.1 m/s.
     Three missions ran without any intervention. On the 1.37 km Mendokoro mission, an operator overrode the orchestrator
     command twice, for 36 s and 37 m in total.</p>`);
  c = chartBox(ch, "Missions", "Full runs with every command are in the mission player above");
  c.insertAdjacentHTML("beforeend", `<div class="rw-wrap"><table class="rw"><tr><th>Mission</th><th>Route [m]</th><th>Speed [m/s]</th><th>Commands</th><th>Interventions</th><th>Autonomy [%]</th><th></th></tr>${Q3.map(r =>
    `<tr><td><b>${r.name}</b><small>${r.env}</small></td><td>${r.m}</td><td>${r.v.toFixed(2)}</td><td>${r.c}</td><td>${r.i}</td><td>${f1(r.a)}</td><td><button data-k="${r.k}">watch ▸</button></td></tr>`).join("")}</table></div>`);
  c.querySelectorAll("button[data-k]").forEach(b => b.onclick = () => window.playMission && window.playMission(+b.dataset.k));

  // ---------- Q4
  ch = block("Q4 · components", "Why each component matters",
    `<p><b>Open loop.</b> On 953 hand-drawn reference traces, the trace predictor scores 83.2 on the NaviTrace score
     against at most 57.0 for prior path predictors, and picks the correct side of a turn in 97.9 % of cases.</p>
     <p><b>History.</b> With five past frames and the walked path, the robot completes single commands in 94.7 % of runs,
     against 74.7 % from the current frame alone, which keeps turning after a turn is complete.</p>
     <p><b>Data.</b> Adding intent-conditioned samples to the hand-labelled data and the reconstructed walks raises the
     score steadily, from 79.3 to 83.3 at 1.19M samples.</p>
     <p><b>Orchestrator.</b> Stronger API models make fewer critical decisions, but take 3 to 5 times longer per call.</p>`, "two");

  // open loop with a dataset toggle
  const olc = chartBox(ch, "Open-loop trace prediction", "NaviTrace score, higher is better. † given our predicted goal");
  c = olc;
  c.insertAdjacentHTML("beforeend", `<div class="seg" role="tablist"><button class="on" data-d="human">Human-Test</button><button data-d="walks">Walks-Test</button></div><div class="ol"></div>`);
  const drawOpen = d => {
    const box = olc.querySelector(".ol"); box.innerHTML = "";
    hbars(box, [{ group: d === "human" ? "953 hand-drawn traces" : "31,012 auto-labelled traces", rows: OPEN.methods.map((m, i) => [m, OPEN[d].nt[i], i === 0 ? "ours" : ""]) }], { unit: "", W: 440 });
    box.querySelectorAll(".hit").forEach((r, i) => { r.replaceWith(r.cloneNode()); });
    box.querySelectorAll(".hit").forEach((r, i) => hover(r, e => showTip(e, d === "human" ? "Human-Test" : "Walks-Test",
      [["NaviTrace score", f1(OPEN[d].nt[i]), i ? colorOf(OPEN.methods[i]) : C.ours], ["correct turn side", f1(OPEN[d].side[i]) + " %"]])));
  };
  olc.querySelectorAll(".seg button").forEach(b => b.onclick = () => { olc.querySelectorAll(".seg button").forEach(x => x.classList.toggle("on", x === b)); drawOpen(b.dataset.d); });
  drawOpen("human");
  tableView(c, ["Method", "NT Human", "Side Human [%]", "NT Walks", "Side Walks [%]"], OPEN.methods.map((m, i) => [m, f1(OPEN.human.nt[i]), f1(OPEN.human.side[i]), f1(OPEN.walks.nt[i]), f1(OPEN.walks.side[i])]));

  // history dumbbell
  c = chartBox(ch, "Temporal history", "Closed-loop success [%], 50 single-command episodes × 3 seeds");
  legend(c, [{ name: "current frame only", color: C.base, shape: "circle" }, { name: "with history", color: C.ours, shape: "circle" }]);
  {
    const W = 440, L = 104, R = 40, rowH = 40, H = HIST.length * rowH + 26, x = v => L + (W - L - R) * (v - 50) / 50;
    const svg = svgEl(c, W, H); let s = "";
    for (let t = 50; t <= 100; t += 10) s += `<line x1="${x(t)}" x2="${x(t)}" y1="0" y2="${H - 20}" stroke="${C.grid}"/><text class="ax" x="${x(t)}" y="${H - 4}" text-anchor="middle">${t}</text>`;
    HIST.forEach(([n, a, b], i) => {
      const y = i * rowH + 20;
      s += `<text class="lb" x="${L - 12}" y="${y + 4}" text-anchor="end">${n}</text>`;
      s += `<line x1="${x(a)}" x2="${x(b)}" y1="${y}" y2="${y}" stroke="${C.axis}" stroke-width="2"/>`;
      s += marker("circle", x(a), y, C.base, 5) + marker("circle", x(b), y, C.ours, 5);
      s += `<text class="val" x="${x(b) + 10}" y="${y + 4}" font-weight="600">${f1(b)}</text>`;
      s += `<text class="val" x="${x(a) - 10}" y="${y + 4}" text-anchor="end" ${a > 90 ? 'visibility="hidden"' : ""}>${f1(a)}</text>`;
      s += `<rect class="hit" tabindex="0" data-i="${i}" x="0" y="${y - rowH / 2}" width="${W}" height="${rowH}"/>`;
    });
    svg.innerHTML = s;
    svg.querySelectorAll(".hit").forEach(r => hover(r, e => { const [n, a, b] = HIST[+r.dataset.i]; showTip(e, n, [["current frame only", f1(a) + " %", C.base], ["with history", f1(b) + " %", C.ours]]); }));
    tableView(c, ["Episodes", "Current frame [%]", "With history [%]"], HIST.map(([n, a, b]) => [n, f1(a), f1(b)]));
  }

  // data scale: one series over ordered training sets
  c = chartBox(ch, "Training data scale", "NaviTrace score on Human-Test, one epoch per arm. Each arm adds intent-conditioned samples to the base of hand-labelled data and reconstructed walks");
  {
    const W = 440, H = 220, L = 34, R = 44, T = 14, B = 48, lo = 78, hi = 84;
    const x = i => L + (W - L - R) * i / (SCALE.length - 1), y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
    const svg = svgEl(c, W, H); let s = "";
    for (let t = lo; t <= hi; t += 2) s += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${C.grid}"/><text class="ax" x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`;
    s += `<polyline points="${SCALE.map((d, i) => `${x(i)},${y(d[2])}`).join(" ")}" fill="none" stroke="${C.ours}" stroke-width="2" stroke-linejoin="round"/>`;
    SCALE.forEach((d, i) => {
      s += marker("circle", x(i), y(d[2]), C.ours, 4.5);
      const [tx, ta] = i === 0 ? [x(i) - 12, "start"] : i === SCALE.length - 1 ? [x(i) + 12, "end"] : [x(i), "middle"];   // outer labels stay inside
      s += `<text class="ax" x="${tx}" y="${H - 28}" text-anchor="${ta}">${d[3]}</text><text class="ax" x="${tx}" y="${H - 14}" text-anchor="${ta}">${d[1] >= 1000 ? (d[1] / 1000).toFixed(2) + "M" : d[1] + "k"}</text>`;
      s += `<rect class="hit" tabindex="0" data-i="${i}" x="${x(i) - 30}" y="${T}" width="60" height="${H - T - B}"/>`;
    });
    const last = SCALE[SCALE.length - 1];
    s += `<text class="val" x="${x(SCALE.length - 1)}" y="${y(last[2]) - 10}" text-anchor="end" font-weight="600">${last[2].toFixed(1)}</text>`;
    svg.innerHTML = s;
    svg.querySelectorAll(".hit").forEach(r => hover(r, e => { const d = SCALE[+r.dataset.i]; showTip(e, d[0], [["NaviTrace score", d[2].toFixed(2), C.ours], ["samples", d[1] + "k"]]); }));
    tableView(c, ["Training data", "Samples [k]", "NT"], SCALE.map(d => [d[0], d[1], d[2].toFixed(2)]));
  }

  // orchestrator VLMs: critical-error rate against latency
  c = chartBox(ch, "Orchestrator VLM", "957 replayed decisions: critical-error rate against median time per call");
  {
    const W = 440, H = 230, L = 34, R = 20, T = 14, B = 34, x = v => L + (W - L - R) * v / 7, y = v => T + (H - T - B) * (1 - v / 7);
    const svg = svgEl(c, W, H + 6); let s = "";
    for (let t = 0; t <= 7; t++) s += `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" stroke="${C.grid}"/><text class="ax" x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text><text class="ax" x="${x(t)}" y="${H - 16}" text-anchor="middle">${t}</text>`;
    s += `<text class="ax" x="${W - R}" y="${H}" text-anchor="end">seconds per call</text><text class="ax" x="${L}" y="${T - 4}">critical errors [%]</text>`;
    const pos = { "Qwen3.8-Flash-Next": [10, -10, "start"], "Gemini 3.5 Flash-Lite": [-10, -10, "end"], "Gemini 3.8 Flash": [-10, 18, "end"], "GPT-6 Sol": [-10, 18, "end"] };
    VLM.forEach(([n, sec, err, ours], i) => {
      const [dx, dy, a] = pos[n];
      s += marker("circle", x(sec), y(err), ours ? C.ours : C.base, 6);
      s += `<text class="lb ${ours ? "strong" : ""}" x="${x(sec) + dx}" y="${y(err) + dy}" text-anchor="${a}">${n}</text>`;
      s += `<circle class="hit" tabindex="0" data-i="${i}" cx="${x(sec)}" cy="${y(err)}" r="16"/>`;
    });
    svg.innerHTML = s;
    svg.querySelectorAll(".hit").forEach(r => hover(r, e => { const [n, sec, err, ours, host] = VLM[+r.dataset.i]; showTip(e, n + " · " + host, [["critical errors", f1(err) + " %", ours ? C.ours : C.base], ["time per call", sec.toFixed(2) + " s"]]); }));
    tableView(c, ["Model", "Critical errors [%]", "s/call"], VLM.map(([n, sec, err]) => [n, f1(err), sec.toFixed(2)]));
  }

  // qualitative open-loop examples (paper Fig. openloop)
  c = chartBox(ch, "Qualitative open-loop results", "Single atomic commands covering turns, forks, crossings, junctions and objects, including one failure");
  c.style.gridColumn = "1 / -1";
  c.insertAdjacentHTML("beforeend", `<figure><img src="assets/fig/fig_openloop.jpg" alt="Open-loop trace prediction examples" loading="lazy"></figure>`);

  // ---------- Q5
  ch = block("Q5 · applications", "Rerouting and human directions through language",
    `<p>Because the levels communicate through language, the same system can, in simulation, reroute around a closed street,
     recover from a missed turn, and follow directions given by a person over a 127 m mission without any map, route or GNSS.</p>`);
  c = chartBox(ch, "", "");
  c.insertAdjacentHTML("beforeend", `<figure><img src="assets/fig/fig_demos.jpg" alt="Application demos"></figure>`);
})();
