/* ==========================================================================
   Signature motion — one idea per page, all switched off under reduced motion.
   1. Headline: "Chaos, but" arrives scattered and snaps into order.
   2. Velocity film: the prototype walks itself through, like a product video.
   3. Sketch → screen scrub (Velocity).
   4. Tasting notes translate themselves (Digital Barista).
   ========================================================================== */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const rand = (a, b) => a + Math.random() * (b - a);

/* 1 · Chaos, but curated ------------------------------------------------- */
const chaos = document.querySelector('[data-chaos]');
if (chaos) {
  const text = chaos.textContent;
  chaos.setAttribute('aria-label', text);
  chaos.textContent = '';
  const chars = [...text].map((c, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = c === ' ' ? ' ' : c;
    s.style.setProperty('--i', i);
    chaos.append(s);
    return s;
  });
  const scatter = (amt) => chars.forEach((s) => {
    s.style.setProperty('--x', `${rand(-amt, amt) * 0.45}px`);
    s.style.setProperty('--y', `${rand(-amt, amt) * 1.0}px`);
    s.style.setProperty('--r', `${rand(-amt, amt) * 0.7}deg`);
  });
  const root = chaos.closest('.hero-title');
  if (reduce) {
    root.classList.add('is-curated');
  } else {
    scatter(9);
    root.classList.add('is-chaos');
    // a light stir, then it settles — the same gesture as the hover
    setTimeout(() => { root.classList.remove('is-chaos'); root.classList.add('is-curated'); }, 420);
    if (!touch) {
      // a little chaos comes back when you poke it
      chaos.addEventListener('mouseenter', () => { scatter(9); root.classList.add('is-stirred'); });
      chaos.addEventListener('mouseleave', () => root.classList.remove('is-stirred'));
    }
  }
}

/* 2 · Velocity film: a product-video style walkthrough -------------------- */
document.querySelectorAll('[data-film]').forEach((film) => {
  const stage = film.querySelector('.film-stage');
  const layers = Object.fromEntries([...film.querySelectorAll('.film-layer')].map((l) => [l.dataset.scene, l]));
  const cursor = film.querySelector('.film-cursor'), ripple = film.querySelector('.film-ripple');
  const cap = film.querySelector('.film-cap'), capK = cap.querySelector('.film-cap-k'), capT = cap.querySelector('.film-cap-t');
  const end = film.querySelector('.film-end'), playBtn = film.querySelector('.film-play');
  const chapWrap = film.querySelector('.film-chapters');
  const AR = { dash: 1.6, imp: 1.311, app: 1.311, plan: 1.311, team: 1.311 };
  // Each shot: which screen, camera from -> to (focus x/y in % of the screen, zoom), cursor path, click moment.
  const SHOTS = [
    { ch: 0, scene: 'dash', d: 3600, k: 'The problem', t: 'Sarah is booked 48h of a 40h week.',
      cam: [[50, 50, 1], [58, 66, 2]], cur: [[40, 40, 0.15], [66.6, 67.8, 0.7]] },
    { ch: 1, scene: 'dash', d: 3600, k: 'The AI suggests', t: 'A fix appears, with its confidence. Review, or ignore.',
      cam: [[58, 66, 2], [82, 50, 2.1]], cur: [[66.6, 67.8, 0], [85.6, 56.1, 0.75]], click: 0.82 },
    { ch: 2, scene: 'imp', d: 3800, k: 'Impact before Apply', t: 'The math comes first: Sarah 48h → 40h.',
      cam: [[72, 60, 1.5], [80, 74, 2.1]], cur: [[70, 55, 0.1], [79.7, 75.9, 0.7]] },
    { ch: 2, scene: 'app', d: 3600, top: true, k: 'Applied', t: 'The numbers update, and Undo is one click away.',
      cam: [[45, 32, 1.9], [80, 88, 2]], cur: [[60, 60, 0.1], [92, 93, 0.75]] },
    { ch: 3, scene: 'plan', d: 3600, k: 'Plan a project', t: 'AI drafts the tasks. Every score shows its confidence.',
      cam: [[40, 45, 1.3], [19, 45, 2.1]], cur: [[45, 30, 0.1], [17, 44, 0.7]] },
    { ch: 3, scene: 'team', d: 3800, k: 'Staff it', t: 'The AI recommends people. The lead decides.',
      cam: [[55, 45, 1.25], [55, 32, 1.7]], cur: [[60, 60, 0.1], [50.8, 27.9, 0.65]], click: 0.72 },
  ];
  const CHAPTERS = ['Problem', 'Suggest', 'Review', 'Plan'];
  const END_MS = 1800;
  const total = SHOTS.reduce((a, s) => a + s.d, 0) + END_MS;
  const starts = []; SHOTS.reduce((a, s, i) => (starts[i] = a, a + s.d), 0);
  const chStart = CHAPTERS.map((_, c) => starts[SHOTS.findIndex((s) => s.ch === c)]);
  const chEnd = CHAPTERS.map((_, c) => { const last = SHOTS.map((s, i) => [s, i]).filter(([s]) => s.ch === c).pop()[1]; return starts[last] + SHOTS[last].d; });
  CHAPTERS.forEach((c, i) => chapWrap.insertAdjacentHTML('beforeend', `<button type="button" data-ch="${i}">${c}</button>`));
  const chBtns = [...chapWrap.querySelectorAll('button')];

  let W = 0, H = 0;
  const measure = () => { W = stage.clientWidth; H = stage.clientHeight; };
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const lerp = (a, b, k) => a + (b - a) * k;
  // place a screen so the focus point sits mid-stage, never showing past its edges
  const frame = (scene, fx, fy, z) => {
    const ar = AR[scene];
    const cw = Math.max(W, H * ar), chh = cw / ar;   // cover size at zoom 1
    const lw = cw * z, lh = chh * z;
    let tx = W / 2 - (fx / 100) * lw, ty = H * 0.4 - (fy / 100) * lh; // sit above the caption
    tx = Math.min(0, Math.max(W - lw, tx)); ty = Math.min(0, Math.max(H - lh, ty));
    return { cw, chh, tx, ty, z, lw, lh };
  };
  let shown = null, capShot = -1, clicked = -1;
  const render = (t) => {
    t = ((t % total) + total) % total;
    const atEnd = t >= total - END_MS;
    end.classList.toggle('is-on', atEnd);
    let i = SHOTS.length - 1;
    for (let j = 0; j < SHOTS.length; j++) if (t < starts[j] + SHOTS[j].d) { i = j; break; }
    const s = SHOTS[i], k = atEnd ? 1 : Math.min(1, (t - starts[i]) / s.d);
    const ck = ease(k);
    const [a, b] = s.cam;
    const f = frame(s.scene, lerp(a[0], b[0], ck), lerp(a[1], b[1], ck), lerp(a[2], b[2], ck));
    const L = layers[s.scene];
    if (shown !== s.scene) { Object.values(layers).forEach((l) => l.classList.toggle('is-on', l === L)); shown = s.scene; }
    L.style.width = `${f.cw}px`; L.style.height = `${f.chh}px`;
    L.style.transform = `translate3d(${f.tx.toFixed(1)}px, ${f.ty.toFixed(1)}px, 0) scale(${f.z.toFixed(4)})`;
    // cursor: eased between its two marks, carried by the camera
    const [c0, c1] = s.cur;
    const ckk = ease(Math.min(1, Math.max(0, (k - c0[2]) / Math.max(0.01, c1[2] - c0[2]))));
    const cx = lerp(c0[0], c1[0], ckk), cy = lerp(c0[1], c1[1], ckk);
    const px = f.tx + (cx / 100) * f.lw, py = f.ty + (cy / 100) * f.lh;
    cursor.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
    film.classList.toggle('has-cursor', !atEnd && k > c0[2] - 0.05);
    if (s.click && k >= s.click && clicked !== i) {
      clicked = i;
      ripple.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      ripple.classList.remove('go'); void ripple.offsetWidth; ripple.classList.add('go');
    }
    if (k < (s.click || 1)) { if (clicked === i) clicked = -1; }
    if (capShot !== i || atEnd) {
      if (atEnd) cap.classList.remove('is-on');
      else { capShot = i; capK.textContent = s.k; capT.textContent = s.t; cap.classList.toggle('is-top', !!s.top); cap.classList.add('is-on'); }
      if (atEnd) capShot = -1;
    }
    chBtns.forEach((btn, c) => {
      const fill = Math.min(1, Math.max(0, (t - chStart[c]) / (chEnd[c] - chStart[c])));
      btn.style.setProperty('--fill', fill.toFixed(3));
      const on = !atEnd && s.ch === c;
      btn.classList.toggle('is-on', on);
      if (on) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
    });
  };

  let t = 0, last = 0, playing = false, inView = false, raf = null, userPaused = false;
  const loop = (now) => {
    raf = null;
    if (!playing) return;
    t += Math.min(64, now - last); last = now;
    render(t);
    raf = requestAnimationFrame(loop);
  };
  const play = () => { if (playing || reduce) return; playing = true; last = performance.now(); raf = requestAnimationFrame(loop); playBtn.classList.remove('is-paused'); playBtn.setAttribute('aria-label', 'Pause the walkthrough'); };
  const pause = () => { playing = false; if (raf) cancelAnimationFrame(raf); raf = null; playBtn.classList.add('is-paused'); playBtn.setAttribute('aria-label', 'Play the walkthrough'); };
  const loadImgs = () => film.querySelectorAll('img[loading="lazy"]').forEach((im) => { im.loading = 'eager'; });

  playBtn.addEventListener('click', () => { if (playing) { userPaused = true; pause(); } else { userPaused = false; play(); } });
  chBtns.forEach((btn, c) => btn.addEventListener('click', () => {
    t = chStart[c] + 1; clicked = -1; render(t);
    if (reduce) return;
    userPaused = false; play();
  }));
  window.addEventListener('resize', () => { measure(); render(t); }, { passive: true });
  measure();
  if (reduce) {
    // still frames: each chapter shows its key screen, no movement
    playBtn.hidden = true;
    render(chEnd[0] - 1);
    return;
  }
  render(0);
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView) { loadImgs(); measure(); if (!userPaused) play(); } else pause();
  }, { threshold: 0.35, rootMargin: '200px 0px 0px 0px' }).observe(film);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); else if (inView && !userPaused) play(); });
});

/* 3 · Sketch → screen scrub ------------------------------------------------ */
document.querySelectorAll('[data-scrub]').forEach((el) => {
  const range = el.querySelector('.scrub-range');
  const set = (p) => { el.style.setProperty('--p', `${p}%`); if (range) range.value = p; };
  let touched = false;
  range?.addEventListener('input', () => { touched = true; set(+range.value); });
  // until someone drags it, scrolling does the reveal: sketch on entry, screen by mid-viewport
  if (reduce) { set(50); return; }
  set(100);
  let raf = null;
  const onScroll = () => {
    if (touched || raf) return;
    raf = requestAnimationFrame(() => {
      raf = null;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      const t = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.85)));
      set(Math.round(100 - t * 62)); // ends at 38%: mostly screen, sketch still showing
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
});

/* 4 · Tasting notes, translated ------------------------------------------- */
document.querySelectorAll('[data-translate]').forEach((el) => {
  const words = el.querySelector('.tr-words');
  const label = el.querySelector('.tr-label');
  const from = el.dataset.from, to = el.dataset.to;
  const fromLabel = el.dataset.fromLabel, toLabel = el.dataset.toLabel;
  if (reduce) return; // static markup already shows both lines
  el.classList.add('is-live');
  const glyphs = 'abcdefghijklmnopqrstuvwxyz';
  const decode = (target, ms = 1100) => new Promise((done) => {
    const start = performance.now();
    const len = Math.max(target.length, words.textContent.length);
    const tick = (now) => {
      const k = Math.min(1, (now - start) / ms);
      let out = '';
      for (let j = 0; j < len; j++) {
        const settled = j / len < k;
        const c = target[j] ?? '';
        out += settled || c === ' ' || c === '·' ? c : (c ? glyphs[(Math.random() * 26) | 0] : '');
      }
      words.textContent = out;
      k < 1 ? requestAnimationFrame(tick) : done();
    };
    requestAnimationFrame(tick);
  });
  let running = false, visible = false;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const loop = async () => {
    if (running) return; running = true;
    while (visible) {
      label.textContent = fromLabel; el.classList.remove('is-to'); words.textContent = from;
      await wait(1800);
      label.textContent = toLabel; el.classList.add('is-to');
      await decode(to);
      await wait(3200);
      await decode(from, 700);
    }
    running = false;
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }, { threshold: 0.5 }).observe(el);
});
