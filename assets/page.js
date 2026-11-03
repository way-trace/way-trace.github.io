// Header text, mission player, moments grid, modal and demo card of the main page.
(() => {
  const S = window.SITE;
  const $ = id => document.getElementById(id);
  const KC = { manoeuvre: "var(--cmd)", crossing: "var(--route)", arrival: "var(--ok)", override: "var(--robot)",
               stop: "var(--robot)", failure: "var(--robot)" };
  const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  $("t-title").textContent = S.title;
  $("t-sub").textContent = S.subtitle;
  $("t-authors").textContent = S.authors;
  $("t-tldr").innerHTML = S.tldrHtml || S.tldr;
  $("t-abstract").textContent = S.abstract;
  // header buttons (DeFM style): optional inline icon; soon = shown without a link, with a "coming soon" tag
  const SVG = d => `<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.4" ` +
    `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICON = {
    pdf: SVG('<path d="M4 1.5h5l3.5 3.5v9.5H4z"/><path d="M9 1.5V5h3.5M6 8.5h4M6 11h4"/>'),
    archive: SVG('<rect x="1.5" y="2.5" width="13" height="3.5" rx="1"/><path d="M2.8 6v7.5h10.4V6M6.3 8.8h3.4"/>'),
    code: '<svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 ' +
      '8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82' +
      '-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-' +
      '3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 ' +
      '1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 ' +
      '0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>',
    demo: SVG('<rect x="2.5" y="2.5" width="11" height="7.5" rx="1"/><path d="M1 13.5h14M6.8 4.6v3.3l2.8-1.65z"/>'),
    dataset: SVG('<ellipse cx="8" cy="3.5" rx="5" ry="2"/><path d="M3 3.5v9c0 1.1 2.2 2 5 2s5-.9 5-2v-9M3 8c0 1.1 2.2 2 5 2s5-.9 5-2"/>'),
    video: SVG('<rect x="1.5" y="3.5" width="13" height="9" rx="2.5"/><path d="M6.6 6.1v3.8l3.3-1.9z" fill="currentColor"/>'),
    bibtex: SVG('<path d="M3 13V9.5C3 6.5 4.2 4.6 6.5 4M3 9.5h3.2V13H3M9.5 13V9.5c0-3 1.2-4.9 3.5-5.5M9.5 9.5h3.2V13H9.5"/>'),
  };
  S.links.forEach(l => {
    const a = el(l.soon ? "span" : "a", [l.soon && "soon", l.ghost && "ghost"].filter(Boolean).join(" ") || null);
    if (l.icon && ICON[l.icon]) a.insertAdjacentHTML("beforeend", ICON[l.icon]);
    a.append(document.createTextNode(l.label));
    if (l.soon) { a.title = "coming soon"; a.append(el("small", null, "coming soon")); }
    else { a.href = l.href; if (/^https?:/.test(l.href)) { a.target = "_blank"; a.rel = "noopener"; } }
    $("t-links").appendChild(a);
  });

  // ---- mission player: starts when the pointer first enters the console and keeps playing after it leaves
  const v = $("mc-video");
  let cur = null, started = false;
  S.missions.forEach((m, i) => {
    const b = el("button"); b.setAttribute("aria-label", m.name);
    const img = el("img"); img.src = m.poster; img.alt = "";
    const t = el("div"); t.append(el("b", null, m.name), el("small", null, `${m.dist} · ${m.speed}`));
    b.append(img, t); b.onclick = () => pick(i); $("mc-sel").appendChild(b);
  });
  function pick(i) {
    cur = S.missions[i];
    document.querySelectorAll("#mc-sel button").forEach((b, j) => b.classList.toggle("on", i === j));
    v.poster = cur.poster; v.src = cur.video;
    $("mc-meta").innerHTML = "";
    $("mc-meta").append(el("b", null, `${cur.dist} · ${cur.speed} · ${cur.cmds} commands`),
      document.createTextNode(` · ${cur.area}` + (cur.interventions ? ` · ${cur.interventions} operator overrides` : " · no intervention")));
    const chs = $("mc-chs"); chs.innerHTML = ""; chs.scrollTop = 0;
    cur.chapters.forEach(c => {
      const r = el("div", "ch"); r.style.setProperty("--c", KC[c.kind]); r.dataset.t = c.t; r.tabIndex = 0;
      const body = el("div"); body.append(el("b", null, c.label)); if (c.note) body.append(el("small", null, c.note));
      r.append(el("span", "ts", fmt(c.t)), body);
      r.onclick = () => seek(c.t); r.onkeydown = e => { if (e.key === "Enter") seek(c.t); };
      chs.appendChild(r);
    });
    v.addEventListener("loadedmetadata", () => { drawMarks(); if (started) v.play(); }, { once: true });
  }
  function drawMarks() {
    $("mc-tl").querySelectorAll(".mk").forEach(m => m.remove());
    cur.chapters.forEach(c => {
      const m = el("div", "mk"); m.style.left = (100 * c.t / v.duration) + "%"; m.style.color = KC[c.kind];
      m.dataset.label = c.label; m.onclick = () => seek(c.t); $("mc-tl").appendChild(m);
    });
  }
  function seek(t) { v.currentTime = t; v.play(); }
  $("mc-track").onclick = e => { const r = e.currentTarget.getBoundingClientRect(); v.currentTime = v.duration * (e.clientX - r.left) / r.width; };
  $("mc").addEventListener("mouseenter", () => { if (started) return; started = true; if (v.readyState >= 1) v.play(); });
  let lastOn = null;
  v.addEventListener("timeupdate", () => {
    $("mc-fill").style.width = (100 * v.currentTime / (v.duration || 1)) + "%";
    let on = null; document.querySelectorAll("#mc-chs .ch").forEach(c => { if (+c.dataset.t <= v.currentTime + .3) on = c; });
    document.querySelectorAll("#mc-chs .ch").forEach(c => c.classList.toggle("on", c === on));
    if (on && on !== lastOn) { const box = $("mc-chs"); box.scrollTo({ top: on.offsetTop - box.clientHeight / 3, behavior: "smooth" }); }
    lastOn = on;
  });
  pick(0);
  window.playMission = i => { pick(i); $("missions").scrollIntoView(); v.addEventListener("loadedmetadata", () => v.play(), { once: true }); };

  // ---- moments
  momentChips($("mo-chips"), list => {
    const g = $("mo-grid"); g.innerHTML = "";
    list.forEach(c => {
      const card = el("div", "moment" + (c.kind === "failure" ? " failure" : ""));
      const vid = el("video"); Object.assign(vid, { muted: true, loop: true, playsInline: true, preload: "none", poster: c.poster, src: c.clip });
      vid.onmouseenter = () => vid.play(); vid.onmouseleave = () => vid.pause(); vid.onclick = () => openModal(c.clip);
      const d = el("div");
      d.append(el("span", "tag", S.categories.find(k => k[0] === c.cat)[1]), el("b", null, c.title), document.createTextNode(c.text),
               el("span", "cmd", `→ "${c.cmd}"`));
      card.append(vid, d); g.appendChild(card);
    });
  }, "chip", 4, 4);

  // ---- modal
  window.openModal = src => { const m = $("modal-video"); m.src = src; $("modal").classList.add("on"); m.play(); };
  window.closeModal = () => { $("modal-video").pause(); $("modal").classList.remove("on"); };
  $("modal").onclick = e => { if (e.target.id === "modal") closeModal(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  // ---- demo card: live Space if configured, otherwise a logged example as preview
  if (S.hfSpace) {
    const a = $("demo-link"); a.href = S.hfSpace.page; a.textContent = "Open on Hugging Face"; a.removeAttribute("aria-disabled");
    const f = el("iframe"); f.src = S.hfSpace.embed; f.title = "Trace predictor demo"; $("demo-box").appendChild(f);
  }
  fetch("assets/decision/decision.json").then(r => r.json()).then(D => {
    const fig = $("demo-preview");
    fig.innerHTML = `<div style="position:relative"><img src="assets/decision/tp_current.jpg" alt="Example image">
      <svg viewBox="0 0 640 360" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
      <polyline points="${D.trace_uv.map(([u, w]) => `${u * 640},${w * 360}`).join(" ")}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>
      <polyline points="${D.trace_uv.map(([u, w]) => `${u * 640},${w * 360}`).join(" ")}" fill="none" stroke="var(--trace)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      ${D.trace_uv.map(([u, w]) => `<circle cx="${u * 640}" cy="${w * 360}" r="5" fill="var(--trace)" stroke="#fff" stroke-width="2"/>`).join("")}
      <circle cx="${D.goal_uv[0] * 640}" cy="${D.goal_uv[1] * 360}" r="9" fill="none" stroke="#fff" stroke-width="3"/></svg></div>
      <figcaption>"${D.command}" · output of the trace predictor on the robot (Snipes mission).</figcaption>`;
  });
})();
