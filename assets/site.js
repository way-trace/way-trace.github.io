// Shared content for all three prototype layouts. Numbers are copied from the paper (do not edit by hand without
// checking sections/05_results.tex in waytrace_overleaf). Clip and chapter times refer to the *_share.mp4 renders.
window.SITE = {
  title: "WayTrace",
  subtitle: "A Map-to-Language-to-Trace Hierarchy for Embodied Urban Navigation",
  authors: "Manthan Patel¹, Jonas Frey², Pascal Roth¹ ³, Marco Hutter¹, Cesar Cadena¹\n¹ETH Zurich ²UC Berkeley ³NVIDIA",
  tldr: "An off-the-shelf VLM turns web-map directions into one atomic command at a time, a trace predictor draws " +
        "the commanded path in the camera image, and an RL policy follows it, over kilometre-scale routes in Zurich.",
  links: [
    { label: "Paper", href: "https://arxiv.org/pdf/2611.05129", icon: "pdf" },
    { label: "arXiv", href: "https://arxiv.org/abs/2611.05129", icon: "archive" },
    { label: "Code", soon: true, icon: "code" },
    { label: "Demo", soon: true, icon: "demo" },
    { label: "Dataset", soon: true, icon: "dataset" },
    { label: "Video", href: "#summary", icon: "video" },
    { label: "BibTeX", href: "#cite", icon: "bibtex", ghost: true },
  ],
  colors: { route: "#1f9bd7", driven: "#f2c230", command: "#d9731f", trace: "#c2399f", robot: "#e5383b" },
  missions: [],      // filled in missions.js
  numbers: [],       // filled in missions.js
};

// Filter chips over S.moments: renders the chips into chipsEl and calls draw(list) with the selected moments. The first
// chip shows a random mix of `mix` clips from different categories; with `max`, a category shows that many of its clips
// at random. Every click (also on the chip that is already on) draws anew.
window.momentChips = function (chipsEl, draw, cls, mix = 10, max = Infinity) {
  const S = window.SITE, cats = [["mix", "Random mix"], ...S.categories];
  const count = c => c === "mix" ? mix : S.moments.filter(m => m.cat === c).length;
  chipsEl.innerHTML = cats.map(([k, l]) => `<button class="${cls}${k === "mix" ? " mix" : ""}" data-c="${k}">${l} <span>${count(k)}</span></button>`).join("");
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const randomMix = () => {
    const first = shuffle(S.categories).slice(0, mix).map(([k]) => shuffle(S.moments.filter(m => m.cat === k))[0]);
    const rest = shuffle(S.moments.filter(m => !first.includes(m))).slice(0, mix - first.length);
    return shuffle([...first, ...rest]);
  };
  const pick = c => {
    chipsEl.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.c === c));
    draw(c === "mix" ? randomMix() : shuffle(S.moments.filter(m => m.cat === c)).slice(0, max));
  };
  chipsEl.querySelectorAll("button").forEach(b => b.onclick = () => pick(b.dataset.c));
  pick("mix");
};
