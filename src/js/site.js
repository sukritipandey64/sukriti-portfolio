import Lenis from 'lenis';

/* ------------------------------------------------------------------
   Environment
   ------------------------------------------------------------------ */
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
root.classList.toggle('is-touch', isTouch);
if (!isTouch) root.classList.add('has-cursor');

/* ------------------------------------------------------------------
   Smooth scroll — momentum makes scrolling feel like walking a gallery
   ------------------------------------------------------------------ */
let lenis = null;
if (!reduceMotion) {
  // Light-touch smoothing: responsive like native scroll, just without the jitter.
  // Touch devices keep their native momentum — it's already fast and familiar.
  lenis = new Lenis({
    lerp: 0.16,
    wheelMultiplier: 1.15,
    smoothWheel: true,
    syncTouch: false,
  });
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { duration: 0.9, offset: -40 });
    else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});

/* ------------------------------------------------------------------
   Cursor — desktop only
   ------------------------------------------------------------------ */
if (!isTouch) {
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor';
  ring.className = 'cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  document.body.append(dot, ring);

  let cx = -100, cy = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', (e) => {
    cx = e.clientX; cy = e.clientY;
    dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
  }, { passive: true });
  const loop = () => {
    rx += (cx - rx) * 0.11; ry += (cy - ry) * 0.11;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.querySelectorAll('a, button, summary, .glow').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('expand'));
    el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
  });
}

/* ------------------------------------------------------------------
   Nav state
   ------------------------------------------------------------------ */
const nav = document.querySelector('.nav');
let navTick = false;
window.addEventListener('scroll', () => {
  if (navTick || !nav) return;
  navTick = true;
  requestAnimationFrame(() => { nav.classList.toggle('scrolled', window.scrollY > 60); navTick = false; });
}, { passive: true });

/* ------------------------------------------------------------------
   Reveals
   ------------------------------------------------------------------ */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
}, { threshold: isTouch ? 0.04 : 0.12, rootMargin: isTouch ? '0px 0px -8% 0px' : '0px' });
document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

/* ------------------------------------------------------------------
   Glow cards — cursor on desktop, bloom-at-centre on touch
   ------------------------------------------------------------------ */
const glows = document.querySelectorAll('.glow');
if (isTouch) {
  const glowIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('lit', e.isIntersecting));
  }, { threshold: 0.55 });
  glows.forEach((g) => glowIO.observe(g));
} else {
  glows.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    }, { passive: true });
  });
}

/* ------------------------------------------------------------------
   Exhibit labels — hover/focus on desktop, tap to turn on touch
   ------------------------------------------------------------------ */
const plaques = document.querySelectorAll('.plaque');
if (isTouch) {
  plaques.forEach((p) => p.addEventListener('click', () => {
    const open = !p.classList.contains('open');
    plaques.forEach((o) => o.classList.remove('open'));
    p.classList.toggle('open', open);
  }));
}

/* ------------------------------------------------------------------
   Atmosphere — the light changes room by room
   ------------------------------------------------------------------ */
const atm = document.querySelector('.atmosphere');
const scrim = document.querySelector('.scrim');
const LOOKS = {
  warm:   { hue: 0,   sat: 1.0,  bright: 1.0,  scrim: 0.0 },
  near:   { hue: -6,  sat: 0.92, bright: 0.88, scrim: 0.2 },
  cool:   { hue: -24, sat: 0.72, bright: 0.72, scrim: 0.36 },
  focus:  { hue: -14, sat: 0.8,  bright: 0.64, scrim: 0.5 },
  flare:  { hue: 14,  sat: 1.05, bright: 0.82, scrim: 0.26 },
  quiet:  { hue: -4,  sat: 0.65, bright: 0.52, scrim: 0.58 },
  reading:{ hue: -10, sat: 0.7,  bright: 0.55, scrim: 0.72 },
};
let current = null;
const enter = (name) => {
  const look = LOOKS[name];
  if (!look || !atm || name === current) return;
  current = name;
  atm.style.filter = `hue-rotate(${look.hue}deg) saturate(${look.sat}) brightness(${look.bright})`;
  if (scrim) scrim.style.opacity = look.scrim;
};
const roomIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) enter(e.target.dataset.light); });
}, { threshold: 0.35 });
document.querySelectorAll('[data-light]').forEach((el) => roomIO.observe(el));
enter(document.querySelector('[data-light]')?.dataset.light || 'warm');

let galleryTurn = 0; // set by the gallery walk below: which wall you're facing
if (atm && !reduceMotion) {
  /* A slow camera move through the image: as you scroll, the view dollies in
     and pans across the room, so the background travels with you. On desktop
     the cursor adds a small parallax on top. */
  let p = 0, mx = 0, my = 0;            // targets
  let cp = 0, cmx = 0, cmy = 0;         // eased values
  let last = '';
  const readScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', readScroll, { passive: true });
  readScroll();
  if (!isTouch) {
    document.addEventListener('mousemove', (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * -1.6;
      my = (e.clientY / window.innerHeight - 0.5) * -1.0;
    }, { passive: true });
  }
  const drift = () => {
    cp += (p - cp) * 0.08; cmx += (mx - cmx) * 0.06; cmy += (my - cmy) * 0.06;
    // a gentle wave so the pan isn't a straight line — it reads as walking, not sliding
    const wave = Math.sin(cp * Math.PI * 2.2);
    const scale = 1.1 + cp * 0.22;                // dolly in ~20% over the page
    const tx = cmx + wave * 2.2 - cp * 2.5 + galleryTurn; // drift across the room, turning toward each wall
    const ty = cmy - cp * 4.5;                    // and slowly upward
    const rot = wave * 0.6 + galleryTurn * 0.18;  // a hint of a turning head
    const t = `scale(${scale.toFixed(4)}) translate3d(${tx.toFixed(3)}%, ${ty.toFixed(3)}%, 0) rotate(${rot.toFixed(3)}deg)`;
    if (t !== last) { atm.style.transform = t; last = t; }
    requestAnimationFrame(drift);
  };
  drift();
}

/* ------------------------------------------------------------------
   Image slots — show a labelled placeholder until the asset file exists
   ------------------------------------------------------------------ */
document.querySelectorAll('.shot[data-asset] img').forEach((im) => {
  const fig = im.closest('.shot');
  const w = +im.getAttribute('width'), h = +im.getAttribute('height');
  if (w && h) fig.style.setProperty('--ar', (w / h).toFixed(3));
  const miss = () => fig.classList.add('pending');
  if (im.complete && im.naturalWidth === 0 && im.currentSrc) miss();
  im.addEventListener('error', miss);
  im.addEventListener('load', () => fig.classList.remove('pending'));
});

/* ------------------------------------------------------------------
   Image lightbox (case studies)
   ------------------------------------------------------------------ */
const zoomables = document.querySelectorAll('[data-zoom]');
if (zoomables.length) {
  const box = document.createElement('dialog');
  box.className = 'lightbox';
  box.innerHTML = '<button class="lightbox-close" aria-label="Close image">Close <span aria-hidden="true">&times;</span></button><img alt="">';
  document.body.append(box);
  const img = box.querySelector('img');
  zoomables.forEach((el) => {
    el.addEventListener('click', () => {
      if (el.classList.contains('pending')) return;
      const src = el.getAttribute('data-zoom') || el.querySelector('img')?.src;
      img.src = src;
      img.alt = el.querySelector('img')?.alt || '';
      box.showModal();
      root.classList.add('lightbox-open');
      lenis?.stop();
    });
  });
  const close = () => { box.close(); };
  box.addEventListener('close', () => { root.classList.remove('lightbox-open'); lenis?.start(); });
  box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.lightbox-close')) close(); });
}

/* ------------------------------------------------------------------
   Prototype rail — arrows + counter
   ------------------------------------------------------------------ */
const rail = document.querySelector('.rail');
if (rail) {
  const items = [...rail.querySelectorAll('.rail-item')];
  const count = document.querySelector('.rail-count');
  const [prev, next] = document.querySelectorAll('.rail-btn');
  const current = () => {
    const left = rail.scrollLeft;
    let idx = 0, best = Infinity;
    items.forEach((it, i) => { const d = Math.abs(it.offsetLeft - rail.offsetLeft - left - parseFloat(getComputedStyle(rail).scrollPaddingLeft || 0)); if (d < best) { best = d; idx = i; } });
    return idx;
  };
  const update = () => {
    const i = current();
    if (count) count.textContent = `${i + 1} / ${items.length}`;
    if (prev) prev.disabled = rail.scrollLeft < 4;
    if (next) next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
  };
  let t = null;
  rail.addEventListener('scroll', () => { cancelAnimationFrame(t); t = requestAnimationFrame(update); }, { passive: true });
  document.querySelectorAll('.rail-btn').forEach((b) => b.addEventListener('click', () => {
    const i = Math.max(0, Math.min(items.length - 1, current() + Number(b.dataset.dir)));
    rail.scrollTo({ left: items[i].offsetLeft - rail.offsetLeft - parseFloat(getComputedStyle(rail).scrollPaddingLeft || 0), behavior: reduceMotion ? 'auto' : 'smooth' });
  }));
  update();
}
/* ------------------------------------------------------------------
   Gallery walk — track lights you pass under, partitions you walk past,
   dust in the light, and a turn toward a different wall in each room.
   Built on the one atmosphere image; all off under reduced motion.
   ------------------------------------------------------------------ */
const rooms = [...document.querySelectorAll('[data-light]')];
if (atm && rooms.length && !reduceMotion) {
  const fx = document.createElement('div');
  fx.className = 'gallery-fx'; fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = '<i class="g-beam"><b></b></i><i class="g-beam"><b></b></i><i class="g-pool"></i><i class="g-pool"></i><i class="g-wall"></i><i class="g-wall"></i><canvas class="g-dust"></canvas>';
  (document.querySelector('.scrim') || atm).after(fx);
  const beams = [...fx.querySelectorAll('.g-beam')], pools = [...fx.querySelectorAll('.g-pool')], walls = [...fx.querySelectorAll('.g-wall')];
  const cv = fx.querySelector('canvas'), ctx = cv.getContext('2d');
  let W = 0, H = 0;
  const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  size(); addEventListener('resize', size, { passive: true });
  /* The swarm: one cloud of fine particles that follows you through the rooms and re-forms in each.
     Loose while you scroll (chaos), settled into a shape when you stop (curated). It parts around the cursor. */
  const N = isTouch ? 900 : 2600;
  const P = Array.from({ length: N }, (_, i) => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: 0, vy: 0, u: i / N, r: Math.random(), q: Math.random(), s: Math.random() < 0.14 ? 2.2 : 1.35 }));
  const gauss = (p) => (p.r + p.q + ((p.u * 7.13) % 1) - 1.5) * 0.9;          // roughly bell-shaped, fixed per particle
  let whyPts = [], whyKey = '';
  const sampleWhy = () => {
    const key = `${W}x${H}`; if (key === whyKey) return; whyKey = key;
    const c = document.createElement('canvas'), fs = Math.min(W * 0.26, H * 0.5);
    c.width = Math.ceil(fs * 2.6); c.height = Math.ceil(fs * 1.3);
    const x = c.getContext('2d');
    x.font = `italic 300 ${fs}px "Cormorant Garamond", Georgia, serif`; x.textBaseline = 'middle'; x.fillStyle = '#fff';
    x.fillText('why?', fs * 0.08, c.height / 2);
    const d = x.getImageData(0, 0, c.width, c.height).data; whyPts = [];
    for (let yy = 0; yy < c.height; yy += 3) for (let xx = 0; xx < c.width; xx += 3) if (d[(yy * c.width + xx) * 4 + 3] > 120) whyPts.push([xx, yy]);
    const ox = isTouch ? (W - c.width) / 2 : W * 0.06, oy = H * 0.62 - c.height / 2;
    whyPts = whyPts.map(([xx, yy]) => [xx + ox, yy + oy]);
  };
  const rectPt = (u, cx, cy, w, h, rot) => {      // a point on a rectangle's outline
    const per = 2 * (w + h); let d = u * per, x, y;
    if (d < w) { x = -w / 2 + d; y = -h / 2; } else if ((d -= w) < h) { x = w / 2; y = -h / 2 + d; }
    else if ((d -= h) < w) { x = w / 2 - d; y = h / 2; } else { d -= w; x = -w / 2; y = h / 2 - d; }
    const c = Math.cos(rot), sn = Math.sin(rot);
    return [cx + x * c - y * sn, cy + x * sn + y * c];
  };
  const PIECES = [[0.62, 0.3, 0.2, 0.3, -0.12], [0.84, 0.36, 0.12, 0.34, 0.09], [0.7, 0.68, 0.14, 0.2, 0.06], [0.88, 0.74, 0.16, 0.08, -0.07], [0.54, 0.78, 0.1, 0.07, 0.14]];
  const SHAPES = {
    cloud: (p) => [p.r * W, p.q * H],
    // hero: an empty picture frame, waiting
    frame: (p, t) => {
      if (p.s > 2) return [p.r * W, p.q * H];
      const cx = isTouch ? W * 0.5 : W * 0.74, w = isTouch ? W * 0.62 : Math.min(W * 0.24, H * 0.5), h = w * 1.3;
      const [x, y] = rectPt((p.u * 5) % 1, cx, H * 0.5 + Math.sin(t * 0.0004) * 6, w, h, 0.03);
      return [x + gauss(p) * 5, y + gauss({ r: p.q, q: p.u, u: p.r }) * 5];
    },
    // how I think: a slow ring
    ring: (p, t) => {
      const a = p.u * 6.283 * 3 + t * 0.00008 * (0.6 + p.r), R = Math.min(W, H) * (isTouch ? 0.34 : 0.3) * (0.82 + gauss(p) * 0.12);
      return [(isTouch ? W * 0.5 : W * 0.72) + Math.cos(a) * R, H * 0.52 + Math.sin(a) * R * 0.92];
    },
    // work: a ribbon running through the room
    ribbon: (p, t) => {
      const x = p.u * W * 1.1 - W * 0.05, k = p.u * 6.283;
      return [x, H * 0.5 + Math.sin(k * 1.1 + t * 0.0003) * H * 0.22 + Math.sin(k * 2.7 - t * 0.0002) * H * 0.05 + gauss(p) * H * 0.03 * (0.4 + Math.abs(Math.cos(k)))];
    },
    // the work I do: the question it starts with
    why: (p) => { const q = whyPts[Math.floor(p.u * 9973) % (whyPts.length || 1)]; return q ? [q[0] + (p.r - 0.5) * 3, q[1] + (p.q - 0.5) * 3] : [p.r * W, p.q * H]; },
    // installation: five pieces, out of place
    pieces: (p) => {
      const k = Math.floor(p.u * 5) % 5, [cx, cy, w, h, rot] = PIECES[k];
      const X = isTouch ? 0.5 + (cx - 0.72) * 1.6 : cx;
      const [x, y] = rectPt((p.u * 5 * 7) % 1, X * W, cy * H, w * W * (isTouch ? 1.6 : 1), h * H, rot);
      return [x + gauss(p) * 3, y + (p.q - 0.5) * 6];
    },
    // contact: everything settles on one line
    line: (p, t) => [W * 0.08 + p.u * W * 0.84, H * 0.86 + gauss(p) * 4 + Math.sin(p.u * 20 + t * 0.0006) * 2],
  };
  // on a phone the text fills the screen, so the shapes that would sit on top of it give way to ones that pass behind
  const ROOM_SHAPE = isTouch
    ? { top: 'ribbon', think: 'ring', work: 'ribbon', practice: 'cloud', lab: 'pieces', contact: 'line' }
    : { top: 'frame', think: 'ring', work: 'ribbon', practice: 'why', lab: 'pieces', contact: 'line' };
  let mxp = -9999, myp = -9999, lastY = scrollY, stir = 0;
  if (!isTouch) addEventListener('mousemove', (e) => { mxp = e.clientX; myp = e.clientY; }, { passive: true });
  let turn = 0, lastT = performance.now(), running = true;
  const lit = [];
  const frame = (now) => {
    if (!running) return;
    const dt = Math.min(50, now - lastT); lastT = now;
    const vh = innerHeight, vw = innerWidth;
    const info = rooms.map((el, i) => { const r = el.getBoundingClientRect(); return { i, top: r.top, c: (r.top + r.height / 2 - vh / 2) / vh }; });
    // One track light per room, alternating walls. Fixture k shows the nearest room of its parity,
    // so a light never jumps sides while you can see it.
    lit.length = 0;
    [0, 1].forEach((k) => {
      let o = null;
      info.forEach((r) => { if (r.i % 2 === k && (!o || Math.abs(r.c) < Math.abs(o.c))) o = r; });
      if (!o || Math.abs(o.c) > 1.4) { beams[k].style.opacity = 0; pools[k].style.opacity = 0; return; }
      const x = (o.i % 2 ? 0.72 : 0.28) * vw;
      const y = Math.max(-0.1, Math.min(1.15, 0.55 + o.c * 0.85)) * vh;
      const a = Math.exp(-o.c * o.c * 2.6);
      // the beam hangs from the ceiling and leans as you walk under it
      beams[k].style.height = `${Math.max(0, y).toFixed(0)}px`;
      beams[k].style.transform = `translate3d(${x.toFixed(0)}px, 0, 0) translateX(-50%) skewX(${(o.c * -14).toFixed(2)}deg)`;
      beams[k].style.opacity = (a * 0.85).toFixed(3);
      pools[k].style.transform = `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0) translate(-50%, -50%)`;
      pools[k].style.opacity = a.toFixed(3);
      lit.push({ x, y, a });
    });
    // Partitions: each room boundary sweeps past as a wall edge, quicker than the page (foreground parallax).
    [0, 1].forEach((k) => {
      let f = null;
      info.forEach((r) => { if (r.i > 0 && r.i % 2 === k) { const t = r.top / vh; if (t > -0.6 && t < 1.6 && (f === null || Math.abs(t - 0.5) < Math.abs(f - 0.5))) f = t; } });
      if (f === null) { walls[k].style.opacity = 0; return; }
      const x = (f * 1.6 - 0.3) * vw;               // right → left as you walk on
      walls[k].style.transform = `translate3d(${x.toFixed(0)}px, 0, 0)`;
      walls[k].style.opacity = Math.max(0, 1 - Math.abs(f - 0.5) * 1.25).toFixed(3);
    });
    // turn toward the wall of the room you're in
    const cur = info.reduce((m, r) => (Math.abs(r.c) < Math.abs(m.c) ? r : m), info[0]);
    turn += ((cur.i % 2 ? 1.4 : -1.4) - turn) * 0.025; galleryTurn = turn;
    // the swarm
    const shapeName = ROOM_SHAPE[rooms[cur.i].id] || 'cloud';
    if (shapeName === 'why') sampleWhy();
    const shape = SHAPES[shapeName];
    const dy = scrollY - lastY; lastY = scrollY;
    stir = Math.min(1, stir * 0.94 + Math.abs(dy) * 0.012);          // scrolling loosens it
    const pull = 0.012 + (1 - stir) * 0.03, R = 110, R2 = R * R;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#F6E3C6';
    const reach = Math.min(W, H) * 0.6;
    for (let i = 0; i < N; i++) {
      const p = P[i], tg = shape(p, now);
      p.vx += (tg[0] - p.x) * pull + (Math.random() - 0.5) * (0.25 + stir * 2.2);
      p.vy += (tg[1] - p.y) * pull + (Math.random() - 0.5) * (0.25 + stir * 2.2) - dy * 0.02 * (0.3 + p.r);
      const ddx = p.x - mxp, ddy = p.y - myp, d2 = ddx * ddx + ddy * ddy;
      if (d2 < R2) { const f = (1 - d2 / R2) * 2.4, d = Math.sqrt(d2) || 1; p.vx += (ddx / d) * f; p.vy += (ddy / d) * f; }
      p.vx *= 0.86; p.vy *= 0.86; p.x += p.vx; p.y += p.vy;
      let glow = 0.62;
      for (let k = 0; k < lit.length; k++) { const l = lit[k], d = Math.hypot(p.x - l.x, p.y - l.y) / reach; glow += l.a * Math.max(0, 1 - d * d) * 0.5; }
      ctx.globalAlpha = Math.min(0.95, glow * (0.5 + p.q * 0.5)) * (isTouch ? 0.7 : 1);
      ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { lastT = performance.now(); requestAnimationFrame(frame); }
  });
}
import './motion.js';

/* ------------------------------------------------------------------
   Case studies: section index (progress bar, dot rail, mobile chip) and tabs
   ------------------------------------------------------------------ */
const tocRoot = document.querySelector('[data-toc-root]');
if (tocRoot) {
  const secs = [...tocRoot.querySelectorAll('[data-toc]')];
  const bar = document.createElement('div'); bar.className = 'toc-bar'; bar.setAttribute('aria-hidden', 'true');
  const rail = document.createElement('nav'); rail.className = 'toc-rail'; rail.setAttribute('aria-label', 'Sections');
  const chip = document.createElement('div'); chip.className = 'toc-chip';
  chip.innerHTML = '<button type="button" aria-expanded="false" aria-controls="toc-list"><b></b><span></span></button><ol id="toc-list" hidden></ol>';
  const list = chip.querySelector('ol'), btn = chip.querySelector('button');
  secs.forEach((s, i) => {
    if (!s.id) s.id = `sec-${i}`;
    const label = s.dataset.toc;
    rail.insertAdjacentHTML('beforeend', `<a href="#${s.id}"><span>${label}</span><i></i></a>`);
    list.insertAdjacentHTML('beforeend', `<li><a href="#${s.id}"><i>${String(i).padStart(2, '0')}</i>${label}</a></li>`);
  });
  document.body.append(bar, rail, chip);
  const go = (e) => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const t = document.querySelector(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); list.hidden = true; btn.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.scrollTo(t, { duration: 0.9, offset: -40 }); else t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  rail.addEventListener('click', go); list.addEventListener('click', go);
  btn.addEventListener('click', () => { list.hidden = !list.hidden; btn.setAttribute('aria-expanded', String(!list.hidden)); });
  document.addEventListener('click', (e) => { if (!chip.contains(e.target)) { list.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  const railLinks = [...rail.querySelectorAll('a')], listLinks = [...list.querySelectorAll('a')];
  let cur = -1, tick = false;
  const update = () => {
    tick = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--read', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    let idx = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.4) idx = i; });
    if (idx !== cur) {
      cur = idx;
      railLinks.forEach((a, i) => a.classList.toggle('is-on', i === idx));
      listLinks.forEach((a, i) => { a.classList.toggle('is-on', i === idx); if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      btn.querySelector('b').textContent = `${String(idx).padStart(2, '0')} / ${String(secs.length - 1).padStart(2, '0')}`;
      btn.querySelector('span').textContent = secs[idx].dataset.toc;
    }
    // the chip stays out of the way on the cover and at the very end
    chip.classList.toggle('is-hidden', idx === 0 || scrollY > max - 40);
  };
  window.addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

document.querySelectorAll('[data-tabs]').forEach((wrap) => {
  const tabs = [...wrap.querySelectorAll('[role="tab"]')];
  const select = (t, focus) => {
    tabs.forEach((x) => {
      const on = x === t;
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) t.focus();
    const p = document.getElementById(t.getAttribute('aria-controls')).querySelector('[data-scrub]');
    if (p) { p.style.setProperty('--p', '50%'); const r = p.querySelector('.scrub-range'); if (r) r.value = 50; }
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
    });
  });
});

/* Edition switch: every page has a twin in the other design language. */
{
  const TWINS = { '/': '/editorial.html', '/index.html': '/editorial.html', '/velocity-ai.html': '/editorial-velocity.html', '/digital-barista.html': '/editorial-decaf.html', '/collection.html': '/editorial-collection.html' };
  const here = location.pathname.replace(/\/$/, '') || '/';
  const dark = TWINS[here];
  const light = Object.keys(TWINS).find((k) => TWINS[k] === here && k !== '/index.html');
  if (dark || light) {
    const nav = document.createElement('nav');
    nav.className = 'edition'; nav.setAttribute('aria-label', 'Edition');
    nav.innerHTML = dark
      ? `<span aria-current="true">Chaos</span><a href="${dark}">Curated</a>`
      : `<a href="${light}">Chaos</a><span aria-current="true">Curated</span>`;
    document.body.append(nav);
  }
}
