/* Editorial edition (exploration): quiet reveals only. */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = document.querySelectorAll('.cv-h, .cv-meta, .cv-copy, .work-h, .entry-top, .entry-imgs figure, .think-h, .think-body, .think-fig, .think-q, .look-h, .next-h, .next-row, .folio, .hed, .credits, .fig, .prose, .quotes li, .patterns li, .dtable, .refl li, .dek--wide');
if (reduce || !('IntersectionObserver' in window)) {
  els.forEach((el) => el.classList.add('in'));
} else {
  document.documentElement.classList.add('js');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
}

/* Edition switch: every page has a twin in the other design language. */
{
  const TWINS = { '/': '/editorial.html', '/index.html': '/editorial.html', '/velocity-ai.html': '/editorial-velocity.html', '/digital-barista.html': '/editorial-decaf.html' };
  const here = location.pathname.replace(/\/$/, '') || '/';
  const dark = TWINS[here];
  const light = Object.keys(TWINS).find((k) => TWINS[k] === here && k !== '/index.html');
  if (dark || light) {
    const nav = document.createElement('nav');
    nav.className = 'edition'; nav.setAttribute('aria-label', 'Edition');
    // "Read" = the editorial (know the work first), "Experience" = the gallery (experience it first).
    // Going to the gallery home from here skips the front door: the choice has just been made.
    const lightHref = light === '/' ? '/#top' : light;
    nav.innerHTML = dark
      ? `<a href="${dark}">Read</a><span aria-current="true">Experience</span>`
      : `<span aria-current="true">Read</span><a href="${lightHref}">Experience</a>`;
    // In the top bar on wide screens; on phones a small floating switch that tucks away while you read (scrolling down)
    // and comes back when you scroll up or reach the end, so it never sits on top of text.
    const bar = document.querySelector('.bar nav');
    if (bar && matchMedia('(min-width: 900px)').matches) {
      nav.classList.add('edition--bar');
      bar.prepend(nav);
    } else {
      document.body.append(nav);
      let lastY = scrollY;
      addEventListener('scroll', () => {
        const y = scrollY, end = y + innerHeight > document.documentElement.scrollHeight - 80;
        nav.classList.toggle('is-tucked', y > 160 && y > lastY && !end);
        lastY = y;
      }, { passive: true });
    }
  }
}

/* Live Hyderabad time in the top bar. */
{
  const els = document.querySelectorAll('[data-clock]');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  const tick = () => els.forEach((el) => { el.textContent = `Hyderabad ${fmt.format(new Date())}`; });
  if (els.length) { tick(); setInterval(tick, 30000); }
}

/* Chapter rail: names the chapter you are in. */
{
  const rail = document.querySelector('[data-rail]');
  const secs = document.querySelectorAll('[data-chapter]');
  if (rail && secs.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) rail.textContent = e.target.dataset.chapter; });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach((s) => io.observe(s));
  }
}

/* Lookbook strip: drag sideways with a mouse (touch and trackpads scroll natively). */
document.querySelectorAll('[data-strip]').forEach((strip) => {
  let down = false, sx = 0, sl = 0, moved = false;
  strip.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.setPointerCapture(e.pointerId); });
  strip.addEventListener('pointermove', (e) => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 3) { moved = true; strip.classList.add('is-drag'); } strip.scrollLeft = sl - dx; });
  const up = () => { down = false; strip.classList.remove('is-drag'); };
  strip.addEventListener('pointerup', up); strip.addEventListener('pointercancel', up);
  strip.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: 'smooth' }); if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: 'smooth' }); });
});
