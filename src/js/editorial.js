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
