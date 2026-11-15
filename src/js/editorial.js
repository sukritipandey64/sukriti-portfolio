/* Editorial edition (exploration): quiet reveals only. */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const els = document.querySelectorAll('.masthead, .cover-grid, .cover-foot, .folio, .hed, .letter-body, .letter-side, .feature-img, .feature-copy > div, .decaf-copy > *, .decaf-phones img, .play-card, .contact li, .dek--wide, .credits, .fig, .prose, .quotes li, .patterns li, .dtable, .refl li, .plate, .duo-card .dek');
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
  const TWINS = { '/': '/editorial.html', '/index.html': '/editorial.html', '/velocity-ai.html': '/editorial-velocity.html', '/digital-barista.html': '/editorial-decaf.html', '/collection.html': '/editorial-collection.html' };
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
    document.body.append(nav);
  }
}
