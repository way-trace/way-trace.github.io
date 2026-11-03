// Step-by-step animation of one logged decision (Snipes mission, orchestrator call 35, 11:21:25).
// Data: assets/decision/decision.json, exported from waytrace_overleaf/figures/fig_overview_src/snipes35b/meta.json.
(() => {
  const root = document.getElementById("decision");
  if (!root) return;
  const A = "assets/decision/";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // step -> active card and caption; the three trace-predictor steps last 2 s each (user, 2 Nov 2026; were 4.2, 3.8, 4.6 s)
  const STEPS = [
    { card: 0, dur: 5200, cap: "<b>Once per mission</b>, the web map provides the walking route and turn-by-turn directions. GNSS, which can be several metres off, only selects the next direction and its distance: <i>turn left onto the pedestrian street in about 4 m</i>." },
    { card: 1, dur: 5200, cap: "<b>Every 2 s</b>, the off-the-shelf orchestrator VLM on a remote server receives the directions, a heading-up satellite map of 50 m width and the camera images of the last 15 m." },
    { card: 1, dur: 6200, cap: "It reasons about <b>which</b> manoeuvre comes next from the directions and the map, and <b>when</b> it is due from the camera images, then answers with one atomic command." },
    { card: 2, dur: 2000, cap: "Onboard, the <b>trace predictor</b> receives the command, five past frames taken 1.8 m apart, the current frame and the path walked over the last 16 m." },
    { card: 2, dur: 2000, cap: "It first decodes a <b>goal point</b>, where the commanded path leaves the view, which commits it to a single branch." },
    { card: 2, dur: 2000, cap: "An MLP head then regresses the <b>ten-point trace</b> from the hidden state at the end of the goal, without decoding about 140 trace tokens. This request took 1.37 s." },
    { card: 3, dur: 9000, cap: "The trace is lifted to 3D with <b>stereo depth</b>, and an <b>RL navigation policy</b> follows a carrot 4.5 m ahead along it at 5 Hz, avoiding obstacles and pedestrians. The clips show the next 9 s in real time. The robot keeps moving while new commands and traces are computed." },
  ];
  const STAGES = ["Web map", "Orchestrator VLM", "Trace predictor", "RL policy"];

  fetch(A + "decision.json").then(r => r.json()).then(build);

  function build(D) {
    const pts = (arr, w, h) => arr.map(([u, v]) => `${(u * w).toFixed(1)},${(v * h).toFixed(1)}`).join(" ");
    const W = 800, H = 1111;                                   // route_map.jpg
    const nextIdx = D.directions.findIndex(d => d.at_m > D.s_m);
    const dirs = D.directions.map((d, i) => `<li class="${i === nextIdx ? "next" : ""}"><i>${i + 1}</i><span>${esc(d.label)}</span><em>${Math.round(d.at_m)} m</em></li>`).join("");
    const markers = D.directions.map((d, i) => `<g><circle cx="${d.uv[0] * W}" cy="${d.uv[1] * H}" r="17" fill="var(--route)" stroke="#fff" stroke-width="4"/>
      <text x="${d.uv[0] * W}" y="${d.uv[1] * H + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="#fff" font-family="Inter">${i + 1}</text></g>`).join("");
    const cams = [15, 12, 9, 6, 3, 0].map((m, i) => `<figure data-s="1" style="transition-delay:${i * 120}ms"><img src="${A}orch_cam_${String(m).padStart(2, "0")}m.jpg" alt=""><figcaption>${m ? "−" + m + " m" : "now"}</figcaption></figure>`).join("");
    const hist = [1, 2, 3, 4, 5].map((k, i) => `<figure data-s="3" style="transition-delay:${i * 110}ms"><img src="${A}tp_hist_${k}.jpg" alt=""><figcaption>−${((6 - k) * 1.8).toFixed(1)} m</figcaption></figure>`).join("");
    // walked path map: robot at the top centre, 16 m of path behind it
    const bev = D.bev_walked_xy_m.map(([x, y]) => `${(50 + x * 5).toFixed(1)},${(12 - y * 5).toFixed(1)}`).join(" ");
    const trace = D.trace_uv, tp = pts(trace, 640, 360);
    const tracePts = trace.map(([u, v], i) => `<circle class="dz-pt" data-i="${i}" cx="${u * 640}" cy="${v * 360}" r="6" fill="var(--trace)" stroke="#fff" stroke-width="2.5"/>`).join("");
    const reqText = D.request.split("\n").filter(l => !l.startsWith("Distance from")).join("\n");

    root.innerHTML = `<div class="dz">
    <div class="dz-bar">
      <button class="dz-play" id="dz-play" aria-label="Pause">❚❚</button>
      <div class="dz-prog" id="dz-prog">${STAGES.map((n, c) => `<div class="dz-grp" style="flex:${STEPS.filter(x => x.card === c).length};--c:${["var(--route)", "var(--cmd)", "var(--trace)", "var(--driven)"][c]}">
        <span>${c + 1} · ${n}</span><div>${STEPS.map((x, k) => x.card === c ? `<button data-k="${k}" aria-label="${n}, step ${k + 1}"><i></i></button>` : "").join("")}</div></div>`).join("")}</div>
    </div>
    <div class="dz-cap" id="dz-cap" aria-live="polite"></div>
    <div class="dz-stages">
      <div class="dz-card" data-card="0" style="--c:var(--route)">
        <div class="dz-head"><b>Web map</b><small>once per mission</small></div>
        <div class="dz-map">
          <img src="${A}route_map.jpg" alt="Satellite map with the route">
          <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
            <polyline class="dz-route" data-s="0" pathLength="1" points="${pts(D.route_map_uv, W, H)}" fill="none" stroke="var(--route)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline data-s="0" points="${pts(D.driven_map_uv, W, H)}" fill="none" stroke="var(--driven)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" style="transition-delay:1.6s"/>
            <g data-s="0" style="transition-delay:1.8s">${markers}</g>
            <circle data-s="0" cx="${D.robot_map_uv[0] * W}" cy="${D.robot_map_uv[1] * H}" r="14" fill="var(--robot)" stroke="#fff" stroke-width="4" style="transition-delay:2.2s"/>
          </svg>
        </div>
        <div class="dz-more">
          <ul class="dz-dirs" data-s="0" style="transition-delay:2.4s">${dirs}</ul>
          <div class="dz-stat" data-s="0" style="transition-delay:2.6s">GNSS progress <b>${Math.round(D.s_m)} m</b> of ${Math.round(D.route_length_m)} m</div>
        </div>
      </div>
      <div class="dz-arrow" style="--c:var(--route)"><span class="dz-token"></span></div>

      <div class="dz-card" data-card="1" style="--c:var(--cmd)">
        <div class="dz-head"><b>Orchestrator VLM</b><small>every 2 s · remote · off-the-shelf</small></div>
        <div class="dz-mini"><img src="${A}orch_map.jpg" alt=""><p>Reads the directions, a satellite map and recent images, and issues the next atomic command.</p></div>
        <div class="dz-more">
          <div class="dz-label">camera images, last 15 m</div>
          <div class="dz-cams">${cams}</div>
          <div class="dz-orow">
            <div><div class="dz-label">heading-up map</div><img data-s="1" src="${A}orch_map.jpg" alt="Heading-up satellite map" style="transition-delay:.7s"></div>
            <div><div class="dz-label">directions in the prompt</div><div class="dz-text" data-s="1" data-type="req" style="transition-delay:.9s"></div></div>
          </div>
          <div class="dz-label" data-s="2">reasoning</div>
          <div class="dz-reason" data-s="2" data-type="reason"></div>
          <div class="dz-cmd" data-s="2" data-late="1">${esc(D.command)}<small>atomic command</small></div>
        </div>
      </div>
      <div class="dz-arrow" style="--c:var(--cmd)"><span class="dz-token"></span></div>

      <div class="dz-card" data-card="2" style="--c:var(--trace)">
        <div class="dz-head"><b>Trace predictor</b><small>onboard · RynnBrain-9B</small></div>
        <div class="dz-mini"><img src="${A}tp_current.jpg" alt=""><p>Draws the commanded path as ten points in the current image.</p></div>
        <div class="dz-more">
          <div class="dz-cmd" data-s="3" style="margin:0 0 6px">${esc(D.command)}</div>
          <div class="dz-label" data-s="3">history: five past frames and the walked path</div>
          <div class="dz-hist">${hist}
            <figure data-s="3" style="transition-delay:.6s"><svg class="dz-bev" viewBox="0 0 100 100"><line x1="50" y1="4" x2="50" y2="96" stroke="var(--grid)"/>
              <polyline points="${bev}" fill="none" stroke="var(--driven)" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="12" r="5" fill="var(--robot)"/></svg><figcaption>walked 16 m</figcaption></figure>
          </div>
          <div class="dz-label" data-s="3">current frame → goal → trace</div>
          <div class="dz-cur" data-s="3">
            <img src="${A}tp_current.jpg" alt="Current camera frame">
            <svg viewBox="0 0 640 360" preserveAspectRatio="none">
              <circle class="dz-goal" data-s="4" cx="${D.goal_uv[0] * 640}" cy="${D.goal_uv[1] * 360}" r="8" fill="none" stroke="#fff" stroke-width="3"/>
              <circle data-s="4" cx="${D.goal_uv[0] * 640}" cy="${D.goal_uv[1] * 360}" r="8" fill="var(--trace)" stroke="#fff" stroke-width="3"/>
              <polyline class="dz-tline" data-s="5" pathLength="1" points="${tp}" fill="none" stroke="var(--trace)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              ${tracePts}
            </svg>
          </div>
          <div class="dz-stat" data-s="5">goal (${D.goal_uv.map(x => x.toFixed(2)).join(", ")}) · 10 points · latency <b>${D.trace_latency_s.toFixed(2)} s</b></div>
        </div>
      </div>
      <div class="dz-arrow" style="--c:var(--trace)"><span class="dz-token"></span></div>

      <div class="dz-card" data-card="3" style="--c:var(--driven)">
        <div class="dz-head"><b>RL policy</b><small>onboard · 5 Hz</small></div>
        <div class="dz-mini"><img src="${A}tpv.jpg" alt=""><p>Follows the trace lifted to 3D and avoids obstacles on its own.</p></div>
        <div class="dz-more dz-exec">
          <div class="dz-label">stereo depth, the trace lifted to 3D</div>
          <div class="pair" data-s="6"><video id="dz-depth" muted playsinline preload="auto" poster="${A}depth_current.jpg" src="assets/clips/dz_depth.mp4"></video>
            <svg class="dz-ov" viewBox="0 0 640 360" preserveAspectRatio="none"><polyline points="${tp}" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="dz-label" data-s="6">execution, real time <span class="dz-tick" id="dz-tick"><i></i><i></i><i></i><i></i><i></i></span></div>
          <div class="pair" data-s="6"><video id="dz-tpv" muted playsinline preload="auto" poster="${A}tpv.jpg" src="assets/clips/dz_tpv.mp4"></video></div>
        </div>
      </div>
    </div>
    <div class="dz-time"><svg id="dz-time" viewBox="0 0 1000 118"></svg></div>
    </div>`;

    const cards = [...root.querySelectorAll(".dz-card")], arrows = [...root.querySelectorAll(".dz-token")];
    const segs = [...root.querySelectorAll("#dz-prog button")], vids = [root.querySelector("#dz-depth"), root.querySelector("#dz-tpv")];
    const typed = { req: reqText, reason: D.reason };
    let step = -1, playing = true, visible = false, elapsed = 0, typers = [];

    function typeInto(node, text, ms) {
      node.textContent = "";
      let i = 0; const n = text.length, dt = Math.max(8, ms / n);
      const id = setInterval(() => {
        i = Math.min(n, i + Math.ceil(n / (ms / dt))); node.textContent = text.slice(0, i); node.scrollTop = node.scrollHeight;
        if (i >= n) clearInterval(id);
      }, dt);
      typers.push(id);
    }
    function show(k, animate = true) {
      typers.forEach(clearInterval); typers = [];
      const prevStep = step; step = k; elapsed = 0;
      const s = STEPS[k];
      cards.forEach((c, i) => c.classList.toggle("on", i === s.card));
      root.querySelectorAll("[data-s]").forEach(e => e.classList.toggle("in", +e.dataset.s <= k));
      // text that is typed out when its step starts, and shown in full when jumping past it
      root.querySelectorAll("[data-type]").forEach(e => {
        const t = typed[e.dataset.type], at = +e.dataset.s;
        if (k === at && animate) typeInto(e, t, e.dataset.type === "reason" ? 2600 : 1600);
        else { e.textContent = k >= at ? t : ""; e.scrollTop = 0; }
      });
      const late = root.querySelector("[data-late]"); late.style.transitionDelay = k === 2 && animate ? "2.8s" : "0s";
      // trace points appear one after the other
      root.querySelectorAll(".dz-pt").forEach(p => {
        p.classList.remove("in");
        if (k >= 5) { const d = k === 5 && animate ? 120 + 150 * +p.dataset.i : 0; typers.push(setTimeout(() => p.classList.add("in"), d)); }
      });
      // a token runs along the arrow into the newly active card
      if (animate && prevStep >= 0 && STEPS[prevStep].card !== s.card && s.card > 0) {
        const t = arrows[s.card - 1]; t.classList.remove("go"); void t.offsetWidth; t.classList.add("go");
      }
      // execution clips start with the step; the trace overlay fades once the robot moves
      root.querySelector(".dz-ov").classList.remove("off");
      vids.forEach(v => { v.pause(); try { v.currentTime = 0; } catch (e) {} });
      if (k === 6) { syncVideos(); typers.push(setTimeout(() => root.querySelector(".dz-ov").classList.add("off"), 1500)); }
      segs.forEach((b, i) => { b.classList.toggle("done", i < k); b.classList.toggle("on", i === k); b.firstChild.style.width = i < k ? "100%" : "0%"; });
      document.getElementById("dz-cap").innerHTML = s.cap;
    }
    const syncVideos = () => vids.forEach(v => { if (playing && visible && step === 6) v.play().catch(() => {}); else v.pause(); });
    function setPlaying(p) {
      playing = p; const b = document.getElementById("dz-play");
      b.textContent = p ? "❚❚" : "▶"; b.setAttribute("aria-label", p ? "Pause" : "Play"); syncVideos();
    }
    // one clock drives the progress bar and advances the steps
    let last = performance.now();
    setInterval(() => {
      const now = performance.now(), dt = now - last; last = now;
      if (step >= 0 && playing && visible) {
        elapsed += dt;
        if (elapsed >= STEPS[step].dur) show((step + 1) % STEPS.length);
        else segs[step].firstChild.style.width = (100 * elapsed / STEPS[step].dur) + "%";
      }
    }, 50);

    document.getElementById("dz-play").onclick = () => setPlaying(!playing);
    segs.forEach(b => b.onclick = () => { show(+b.dataset.k); syncVideos(); });
    cards.forEach((c, i) => c.addEventListener("click", () => { if (!c.classList.contains("on")) { show(STEPS.findIndex(s => s.card === i)); syncVideos(); } }));

    // ?step=N opens the animation paused at step N (1-based), for linking to one step
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const deep = +new URLSearchParams(location.search).get("step");
    if (deep >= 1 && deep <= STEPS.length) { root.scrollIntoView(); setPlaying(false); show(deep - 1, false); }
    // visible while the animation overlaps the middle half of the screen (a ratio fails on phones, where it is taller than the screen)
    new IntersectionObserver(es => es.forEach(e => {
      visible = e.isIntersecting;
      if (visible && step < 0) show(0);
      syncVideos();
    }), { rootMargin: "-25% 0px -25% 0px" }).observe(root);
    if (reduced) setPlaying(false);

    // 5 Hz policy ticks
    let tk = 0; setInterval(() => { const t = document.querySelectorAll("#dz-tick i"); t.forEach((x, i) => x.classList.toggle("on", i === tk % 5)); tk++; }, 200);

    timingStrip(D);
  }

  // Three loops on a 10 s window: orchestrator calls every 2 s (~1.3 s each), trace requests as logged, policy at 5 Hz.
  function timingStrip(D) {
    const svg = document.getElementById("dz-time"), X0 = 150, X1 = 985, T = 10, x = t => X0 + (X1 - X0) * t / T;
    const lanes = [["Orchestrator VLM", "var(--cmd)", 14], ["Trace predictor", "var(--trace)", 44], ["RL policy", "var(--driven)", 74]];
    let s = lanes.map(([l, c, y]) => `<text class="lab" x="0" y="${y + 12}">${l}</text><line x1="${X0}" x2="${X1}" y1="${y + 8}" y2="${y + 8}" stroke="var(--grid)"/>`).join("");
    for (let t = 0; t < T; t += 2) s += `<rect x="${x(t + .1)}" y="14" width="${x(1.3) - X0}" height="16" rx="4" fill="var(--cmd)"><title>orchestrator call, about 1.3 s</title></rect>`;
    D.trace_requests_window_s.forEach(([t, l]) => s += `<rect x="${x(t)}" y="44" width="${x(l) - X0}" height="16" rx="4" fill="var(--trace)"><title>trace request, ${l.toFixed(2)} s</title></rect>`);
    for (let t = 0; t < T; t += .2) s += `<rect x="${x(t)}" y="76" width="3" height="12" rx="1.5" fill="var(--driven)"/>`;
    for (let t = 0; t <= T; t += 2) s += `<text class="tick" x="${x(t)}" y="112" text-anchor="middle">${t} s</text>`;
    s += `<text class="tick" x="${X1}" y="6" text-anchor="end">orchestrator calls schematic · trace requests as logged · 10 s window</text>`;
    s += `<line id="dz-head" x1="${X0}" x2="${X0}" y1="8" y2="96" stroke="var(--ink)" stroke-width="1.5"/>`;
    svg.innerHTML = s;
    const head = document.getElementById("dz-head"); let t0 = performance.now();
    (function loop(now) { const t = ((now - t0) / 1000) % T; head.setAttribute("x1", x(t)); head.setAttribute("x2", x(t)); requestAnimationFrame(loop); })(t0);
  }
})();
