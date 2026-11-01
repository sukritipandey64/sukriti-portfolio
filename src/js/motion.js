/* ==========================================================================
   Signature motion — one idea per page, all switched off under reduced motion.
   1. Headline: "Chaos, but" arrives scattered and snaps into order.
   2. Living Velocity card: the prototype plays on a loop.
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

/* 2 · Living Velocity card ------------------------------------------------ */
document.querySelectorAll('[data-reel]').forEach((reel) => {
  const frames = [...reel.querySelectorAll('.reel-frame')];
  if (frames.length < 2 || reduce) return;
  let i = 0, timer = null;
  const step = () => {
    frames[i].classList.remove('is-on');
    i = (i + 1) % frames.length;
    frames[i].classList.add('is-on');
    reel.style.setProperty('--progress', `${((i + 1) / frames.length) * 100}%`);
  };
  const play = () => { if (!timer) { reel.classList.add('is-playing'); timer = setInterval(step, 2300); } };
  const stop = () => { clearInterval(timer); timer = null; reel.classList.remove('is-playing'); };
  const card = reel.closest('.work-card') || reel;
  if (touch) {
    new IntersectionObserver(([e]) => (e.isIntersecting ? play() : stop()), { threshold: 0.6 }).observe(reel);
  } else {
    card.addEventListener('mouseenter', play);
    card.addEventListener('mouseleave', stop);
    card.addEventListener('focusin', play);
    card.addEventListener('focusout', stop);
  }
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
