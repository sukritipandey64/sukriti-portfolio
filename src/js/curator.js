/* ==========================================================================
   The Curator — an installation.
   Five pieces arrive out of place. The player arranges them, then calls it.
   The reveal reads HOW they decided (first-move hesitation, moves,
   revisions, what they moved first, time), not what they made.
   The grid stays invisible until a piece comes near it (emergent order);
   touching a piece straightens it; at the end every piece is snapped to the
   grid: their chaos, curated.
   ========================================================================== */

const root = document.querySelector('[data-curator]');
if (root) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = root.querySelector('[data-stage]');
  const gridEl = root.querySelector('.cur-grid');
  const pick = root.querySelector('[data-pick]');
  const caption = root.querySelector('[data-caption]');
  const panels = Object.fromEntries([...root.querySelectorAll('[data-panel]')].map((p) => [p.dataset.panel, p]));
  const doneBtn = root.querySelector('[data-done]');
  const ring = document.querySelector('.cursor-ring');

  const COLS = 6, ROWS = 8, MAGNET = 0.32;

  const frame = (art) => `<span class="cp-frame"><span class="cp-mat"><span class="art ${art}"></span></span></span>`;
  const MATERIALS = {
    wall: {
      name: 'gallery wall', verb: 'Hang it', cls: 'is-wall',
      pieces: [
        { id: 'sun', label: 'Large canvas', w: 3, h: 3, anchor: true, html: frame('art-sun') },
        { id: 'bands', label: 'Tall canvas', w: 2, h: 3, html: frame('art-bands') },
        { id: 'orb', label: 'Small canvas', w: 2, h: 2, html: frame('art-orb') },
        { id: 'horizon', label: 'Wide canvas', w: 3, h: 1, html: frame('art-horizon') },
        { id: 'label', label: 'Wall label', w: 2, h: 1, html: '<span class="cp-label"><b>Untitled (Restraint)</b><i>2026 · light on nothing</i></span>' },
      ],
    },
    spread: {
      name: 'editorial spread', verb: 'Send to print', cls: 'is-spread',
      pieces: [
        { id: 'image', label: 'Full-height image', w: 3, h: 5, anchor: true, html: '<span class="ed-img"></span>' },
        { id: 'head', label: 'Headline', w: 3, h: 2, html: '<span class="ed-head"><span>The Quiet <em>Season</em></span></span>' },
        { id: 'quote', label: 'Pull quote', w: 3, h: 2, html: '<span class="ed-quote">“Restraint is its own kind of intelligence.”</span>' },
        { id: 'cap', label: 'Caption', w: 2, h: 1, html: '<span class="ed-cap">Look 04 — wool, light, patience.</span>' },
        { id: 'folio', label: 'Folio', w: 1, h: 1, html: '<span class="ed-folio">No.<b>04</b></span>' },
      ],
    },
    screen: {
      name: 'product screen', verb: 'Ship it', cls: 'is-screen',
      pieces: [
        { id: 'chart', label: 'Chart card', w: 4, h: 3, anchor: true, html: '<span class="ui-card ui-chart"><b>This week</b><span class="ui-bars"><i style="--h:52%"></i><i style="--h:78%"></i><i style="--h:40%"></i><i style="--h:92%" class="hot"></i><i style="--h:64%"></i><i style="--h:30%"></i></span></span>' },
        { id: 'nav', label: 'Navigation bar', w: 6, h: 1, html: '<span class="ui-card ui-nav"><b>SP</b><i>Overview</i><i>Team</i><i>Plan</i></span>' },
        { id: 'kpi', label: 'Metric card', w: 2, h: 2, html: '<span class="ui-card ui-kpi"><b>12</b><i>open tasks</i></span>' },
        { id: 'btn', label: 'Primary button', w: 2, h: 1, html: '<span class="ui-btn">Review</span>' },
        { id: 'list', label: 'Team list', w: 2, h: 3, html: '<span class="ui-card ui-list"><i></i><i></i><i></i></span>' },
      ],
    },
  };

  const STYLES = {
    explorer: { name: 'an <em>Explorer.</em>', plain: 'an Explorer', line: 'You moved first and asked later. The layout turned up somewhere in the trying.', others: 'Explorers move first and ask later.' },
    editor: { name: 'an <em>Editor.</em>', plain: 'an Editor', line: 'You looked before you touched, then cut until it held.', others: 'Editors look before they touch, then cut.' },
    architect: { name: 'an <em>Architect.</em>', plain: 'an Architect', line: 'You placed the heaviest thing first, then built everything round it.', others: 'Architects place the heaviest piece, then build round it.' },
    decider: { name: 'a <em>Decider.</em>', plain: 'a Decider', line: 'About one move per piece. You knew before you started.', others: 'Deciders make one move per piece and stop.' },
  };

  // grid guides (lines 1..5 / 1..7)
  for (let i = 1; i < COLS; i++) gridEl.insertAdjacentHTML('beforeend', `<span class="g-v" data-v="${i}" style="left:${(i / COLS) * 100}%"></span>`);
  for (let j = 1; j < ROWS; j++) gridEl.insertAdjacentHTML('beforeend', `<span class="g-h" data-h="${j}" style="top:${(j / ROWS) * 100}%"></span>`);
  const guide = (axis, n) => gridEl.querySelector(`[data-${axis}="${n}"]`);

  let mat = null, pieces = [], m = null, z = 10;

  const setMode = (mode) => {
    root.dataset.mode = mode;
    Object.entries(panels).forEach(([k, p]) => { p.hidden = k !== mode; });
  };
  const now = () => performance.now();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const place = (p) => {
    p.el.style.left = `${(p.x / COLS) * 100}%`;
    p.el.style.top = `${(p.y / ROWS) * 100}%`;
    p.el.style.transform = `rotate(${p.rot}deg)`;
  };
  const showGuides = (p) => {
    gridEl.querySelectorAll('.on').forEach((g) => g.classList.remove('on'));
    if (!p) return;
    [[p.x, 'v'], [p.x + p.w, 'v'], [p.y, 'h'], [p.y + p.h, 'h']].forEach(([v, axis]) => {
      const n = Math.round(v);
      if (Math.abs(v - n) < MAGNET) guide(axis, n)?.classList.add('on');
    });
  };
  const magnet = (p) => {
    const nx = Math.round(p.x), ny = Math.round(p.y);
    if (Math.abs(p.x - nx) < MAGNET) p.x = nx;
    if (Math.abs(p.y - ny) < MAGNET) p.y = ny;
  };
  const where = (p) => `column ${Math.round(p.x) + 1}, row ${Math.round(p.y) + 1}`;

  // ---- measuring -------------------------------------------------------
  const startMove = (p) => {
    if (!m.first) { m.first = p.id; m.firstAt = Math.max(0, now() - m.t0); doneBtn.disabled = false; }
    m.moves++;
    if (p.moved) m.revisions++;
    p.moved = true;
  };

  // ---- build a round ---------------------------------------------------
  const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const scatter = () => {
    const placed = [];
    // biggest first, each at the least crowded of a few random spots: messy, but every piece can be grabbed
    [...pieces].sort((a, b) => b.w * b.h - a.w * a.h).forEach((p) => {
      let best = null, bestCost = Infinity;
      for (let k = 0; k < 14; k++) {
        const c = { w: p.w, h: p.h, x: Math.random() * (COLS - p.w), y: Math.random() * (ROWS - p.h) };
        // never start on the grid: it should look unresolved
        if (Math.abs(c.x - Math.round(c.x)) < 0.2) c.x = clamp(c.x + 0.38, 0, COLS - p.w);
        if (Math.abs(c.y - Math.round(c.y)) < 0.2) c.y = clamp(c.y + 0.41, 0, ROWS - p.h);
        const cost = placed.reduce((t, q) => t + overlap(c, q), 0);
        if (cost < bestCost) { best = c; bestCost = cost; }
      }
      p.x = best.x; p.y = best.y; p.rot = (Math.random() - 0.5) * 22;
      placed.push(best);
    });
  };

  const begin = (key) => {
    mat = MATERIALS[key];
    stage.classList.remove('is-wall', 'is-spread', 'is-screen', 'is-curated');
    stage.classList.add(mat.cls);
    stage.querySelectorAll('.cp').forEach((el) => el.remove());
    pick.hidden = true;
    doneBtn.textContent = mat.verb; doneBtn.disabled = true;
    m = { t0: now() + (reduce ? 0 : 900), first: null, firstAt: 0, moves: 0, revisions: 0, shuffles: 0 };
    pieces = mat.pieces.map((d, i) => {
      const el = document.createElement('div');
      el.className = 'cp'; el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-roledescription', 'movable piece');
      el.setAttribute('aria-label', `${d.label}. Arrow keys move it.`);
      el.style.width = `${(d.w / COLS) * 100}%`;
      el.style.height = `${(d.h / ROWS) * 100}%`;
      el.innerHTML = `<span class="cp-in">${d.html}</span>`;
      const p = { ...d, el, x: 0, y: 0, rot: 0, moved: false };
      el.style.zIndex = z + i;
      stage.append(el);
      bind(p);
      return p;
    });
    scatter();
    pieces.forEach((p, i) => {
      if (reduce) { place(p); return; }
      // arrive from outside the frame, then land unresolved
      const fromX = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 40);
      const fromY = (Math.random() - 0.5) * 80;
      p.el.style.left = `${(p.x / COLS) * 100}%`; p.el.style.top = `${(p.y / ROWS) * 100}%`;
      p.el.style.opacity = '0';
      p.el.style.transform = `translate(${fromX}%, ${fromY}%) rotate(${p.rot * 2.4}deg) scale(0.92)`;
      p.el.classList.add('is-arriving');
      setTimeout(() => { p.el.style.opacity = ''; place(p); }, 60 + i * 110);
      setTimeout(() => p.el.classList.remove('is-arriving'), 1000 + i * 110);
    });
    setMode('play');
    caption.textContent = `${/^[aeiou]/.test(mat.name) ? 'An' : 'A'} ${mat.name}, out of place. Arrange it.`;
  };

  // ---- interaction -----------------------------------------------------
  function bind(p) {
    const el = p.el;
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false, counted = false, id = null;
    el.addEventListener('pointerdown', (e) => {
      if (root.dataset.mode !== 'play' || e.button > 0) return;
      e.preventDefault();
      id = e.pointerId; el.setPointerCapture(id);
      dragging = true; counted = false;
      sx = e.clientX; sy = e.clientY; ox = p.x; oy = p.y;
      el.style.zIndex = ++z + 20;
      el.classList.add('is-dragging');
      p.rot = 0; place(p);                       // touching it straightens it
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging || e.pointerId !== id) return;
      const r = stage.getBoundingClientRect();
      const dx = (e.clientX - sx) / (r.width / COLS), dy = (e.clientY - sy) / (r.height / ROWS);
      if (!counted && Math.hypot(e.clientX - sx, e.clientY - sy) > 5) { counted = true; startMove(p); }
      p.x = clamp(ox + dx, 0, COLS - p.w); p.y = clamp(oy + dy, 0, ROWS - p.h);
      place(p); showGuides(p);
    });
    const end = (e) => {
      if (!dragging || e.pointerId !== id) return;
      dragging = false;
      el.classList.remove('is-dragging');
      if (counted) { magnet(p); place(p); caption.textContent = `${p.label} — ${where(p)}.`; }
      setTimeout(() => showGuides(null), 260);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    let lastKey = 0;
    el.addEventListener('keydown', (e) => {
      if (root.dataset.mode !== 'play') return;
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!d) return;
      e.preventDefault();
      if (now() - lastKey > 900) startMove(p);  // a burst of key presses is one move
      lastKey = now();
      p.rot = 0;
      p.x = clamp(Math.round(p.x) + d[0], 0, COLS - p.w);
      p.y = clamp(Math.round(p.y) + d[1], 0, ROWS - p.h);
      el.style.zIndex = ++z + 20;
      place(p); showGuides(p);
      caption.textContent = `${p.label} — ${where(p)}.`;
      clearTimeout(el._g); el._g = setTimeout(() => showGuides(null), 700);
    });
    if (ring) {
      el.addEventListener('pointerenter', () => ring.classList.add('expand'));
      el.addEventListener('pointerleave', () => ring.classList.remove('expand'));
    }
  }

  // ---- the reveal ------------------------------------------------------
  const read = () => {
    const n = pieces.length;
    const fm = m.firstAt / 1000, t = (now() - m.t0) / 1000;
    const per = m.moves / n;
    const anchor = pieces.find((p) => p.anchor);
    // each type needs its defining behaviour; extras only break ties
    const score = {
      explorer: fm < 2.5 && (per >= 1.5 || m.shuffles > 0) ? 3 + (per >= 2.5 ? 1 : 0) + m.shuffles : 0,
      editor: m.revisions >= 2 ? 2 + (fm >= 3 ? 1.5 : 0) + m.revisions * 0.3 : 0,
      architect: m.first === anchor.id ? 3 + (m.revisions <= 1 ? 1 : 0) : 0,
      decider: m.moves <= n + 1 && m.revisions <= 1 ? 3 + (t < 30 ? 0.5 : 0) : 0,
    };
    let type = Object.keys(score).reduce((a, b) => (score[b] > score[a] ? b : a), 'editor');
    if (!score[type]) type = m.revisions ? 'editor' : (fm < 2.5 ? 'explorer' : 'decider');
    const s = (v, w) => `${v} ${w}${v === 1 ? '' : 's'}`;
    const why = {
      explorer: `First move after ${fm.toFixed(1)}s, then ${s(m.moves, 'move')} for ${n} pieces${m.shuffles ? `, and ${s(m.shuffles, 'shuffle')}` : ''}.`,
      editor: `${fm.toFixed(1)} seconds before your first move, then ${s(m.revisions, 'revision')}.`,
      architect: `The first thing you moved was the ${anchor.label.toLowerCase()}, the heaviest piece in the room.`,
      decider: `${s(m.moves, 'move')} for ${n} pieces${m.revisions ? `, ${s(m.revisions, 'revision')}` : ', no second thoughts'}.`,
    }[type];
    const left = pieces.filter((p) => !p.moved).length;
    return { type, why, fm, t, left };
  };

  const finish = () => {
    const r = read();
    setMode('result');
    stage.classList.add('is-curated');
    // their composition, snapped to the grid and straightened
    pieces.forEach((p) => { p.x = Math.round(p.x); p.y = Math.round(p.y); p.rot = 0; place(p); });
    caption.innerHTML = 'Your composition, snapped to the grid. <em>Chaos, but curated.</em>';
    const st = STYLES[r.type];
    const others = Object.entries(STYLES).filter(([k]) => k !== r.type).map(([, v]) => `<li>${v.others}</li>`).join('');
    panels.result.innerHTML = `
      <p class="cur-k">Read from how you moved, not what you made</p>
      <h2 class="cur-type">You’re ${st.name}</h2>
      <p class="cur-line">${r.type === 'editor' && r.fm < 3 ? 'You placed things quickly, then went back and cut until it held.' : st.line}</p>
      <p class="cur-why">${r.why}${r.left ? ` You left ${r.left === 1 ? 'one piece' : `${r.left} pieces`} where ${r.left === 1 ? 'it' : 'they'} landed. That’s a decision too.` : ''}</p>
      <dl class="cur-stats">
        <div><dt>First move</dt><dd>${r.fm.toFixed(1)}s</dd></div>
        <div><dt>Moves</dt><dd>${m.moves}</dd></div>
        <div><dt>Revisions</dt><dd>${m.revisions}</dd></div>
        <div><dt>Time</dt><dd>${Math.round(r.t)}s</dd></div>
      </dl>
      <ul class="cur-others" aria-label="The other ways people decide">${others}</ul>
      <p class="cur-foot">A minute of dragging is a mirror, not a personality test. My own process: I explore like there’s no map. I ship like there is one.</p>
      <div class="cur-actions">
        <button type="button" class="btn-pill" data-again>Again</button>
        <button type="button" class="btn-pill btn-pill--ghost" data-back>Another material</button>
        <a class="cur-textbtn" href="/#work">Back to the work</a>
      </div>`;
    panels.result.querySelector('[data-again]').addEventListener('click', () => begin(Object.keys(MATERIALS).find((k) => MATERIALS[k] === mat)));
    panels.result.querySelector('[data-back]').addEventListener('click', back);
    // on a phone the reveal sits under the stage: let the curated layout land, then bring it up
    const stacked = window.matchMedia('(max-width: 899px)').matches;
    setTimeout(() => {
      panels.result.focus({ preventScroll: true });
      if (stacked) panels.result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, reduce ? 0 : 1100);
  };

  const back = () => {
    stage.querySelectorAll('.cp').forEach((el) => el.remove());
    stage.classList.remove('is-wall', 'is-spread', 'is-screen', 'is-curated');
    pieces = []; pick.hidden = false;
    caption.textContent = '';
    setMode('pick');
    pick.querySelector('button')?.focus({ preventScroll: true });
  };

  pick.querySelectorAll('[data-material]').forEach((b) => b.addEventListener('click', () => begin(b.dataset.material)));
  doneBtn.addEventListener('click', finish);
  root.querySelector('[data-shuffle]').addEventListener('click', () => {
    m.shuffles++;
    pieces.forEach((p) => { p.moved = false; });
    scatter(); pieces.forEach(place);
    caption.textContent = 'Shuffled. Start again from here.';
  });
  root.querySelectorAll('[data-panel="play"] [data-back]').forEach((b) => b.addEventListener('click', back));
}
