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
  lenis = new Lenis({
    duration: isTouch ? 0.9 : 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: isTouch,
    syncTouchLerp: 0.09,
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
    if (lenis) lenis.scrollTo(target, { duration: 1.4, offset: -40 });
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

if (atm && !reduceMotion) {
  let tx = 0, ty = 0, x = 0, y = 0, lastX = null, lastY = null;
  if (isTouch) {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      tx = -2.4 * p; ty = -3.2 * p;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  } else {
    document.addEventListener('mousemove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * -1.1;
      ty = (e.clientY / window.innerHeight - 0.5) * -0.7;
    }, { passive: true });
  }
  const drift = () => {
    x += (tx - x) * 0.06; y += (ty - y) * 0.06;
    const rx = Math.round(x * 1000) / 1000, ry = Math.round(y * 1000) / 1000;
    if (rx !== lastX || ry !== lastY) {
      atm.style.transform = `scale(1.08) translate3d(${rx}%, ${ry}%, 0)`;
      lastX = rx; lastY = ry;
    }
    requestAnimationFrame(drift);
  };
  drift();
}

/* ------------------------------------------------------------------
   Image lightbox (case studies)
   ------------------------------------------------------------------ */
const zoomables = document.querySelectorAll('[data-zoom]');
if (zoomables.length) {
  const box = document.createElement('dialog');
  box.className = 'lightbox';
  box.innerHTML = '<button class="lightbox-close" aria-label="Close">Close</button><img alt="">';
  document.body.append(box);
  const img = box.querySelector('img');
  zoomables.forEach((el) => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-zoom') || el.querySelector('img')?.src;
      img.src = src;
      img.alt = el.querySelector('img')?.alt || '';
      box.showModal();
      lenis?.stop();
    });
  });
  const close = () => { box.close(); };
  box.addEventListener('close', () => lenis?.start());
  box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lightbox-close')) close(); });
}
