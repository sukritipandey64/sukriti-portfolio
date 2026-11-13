/* ==========================================================================
   The Curator — a small game.
   Three rooms (gallery wall, editorial spread, product screen). In each,
   five pieces arrive out of place and the player has a three-line brief.
   Score = brief met (100 a line) + grid snaps (with a streak multiplier)
   + time under par. Stars = lines of the brief met; stars add up to a rank.
   The grid stays invisible until a piece comes near it; touching a piece
   straightens it; at the end everything snaps: their chaos, curated.
   The result also reads HOW they decided (Explorer / Editor / Architect /
   Decider) from first-move delay, moves, revisions and what moved first.
   ========================================================================== */

const root = document.querySelector('[data-curator]');
if (root) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = root) => el.querySelector(s);
  const stage = $('[data-stage]'), gridEl = $('.cur-grid'), pick = $('[data-pick]'), caption = $('[data-caption]');
  const hud = $('[data-hud]'), hudRoom = $('[data-hud-room]'), hudScore = $('[data-hud-score]'), hudTime = $('[data-hud-time]');
  const briefEl = $('[data-brief]'), doneBtn = $('[data-done]');
  const panels = Object.fromEntries([...root.querySelectorAll('[data-panel]')].map((p) => [p.dataset.panel, p]));
  const ring = document.querySelector('.cursor-ring');

  const COLS = 6, ROWS = 8, MAGNET = 0.32, PAR = 45, SNAP_CAP = 150;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const now = () => performance.now();

  // ---- geometry the briefs are judged with -------------------------------
  const T = 0.2;
  const span = (a0, a1, b0, b1) => Math.min(a1, b1) - Math.max(a0, b0);
  const overlap = (a, b) => Math.max(0, span(a.x, a.x + a.w, b.x, b.x + b.w)) * Math.max(0, span(a.y, a.y + a.h, b.y, b.y + b.h));
  const noOverlap = (all) => all.every((a, i) => all.slice(i + 1).every((b) => overlap(a, b) < 0.06));
  const beside = (a, b) => overlap(a, b) < 0.06 && (
    ((Math.abs(a.x + a.w - b.x) < T || Math.abs(b.x + b.w - a.x) < T) && span(a.y, a.y + a.h, b.y, b.y + b.h) > 0.3) ||
    ((Math.abs(a.y + a.h - b.y) < T || Math.abs(b.y + b.h - a.y) < T) && span(a.x, a.x + a.w, b.x, b.x + b.w) > 0.3));
  const under = (a, b) => Math.abs(b.y + b.h - a.y) < T && span(a.x, a.x + a.w, b.x, b.x + b.w) > 0.3;
  const above = (a, b) => a.y + a.h <= b.y + 0.15;
  const onOneLine = (list) => list.some((a, i) => list.slice(i + 1).some((b) => overlap(a, b) < 0.06 && (Math.abs(a.y - b.y) < 0.15 || Math.abs(a.y + a.h - b.y - b.h) < 0.15)));

  const frame = (art) => `<span class="cp-frame"><span class="cp-mat"><span class="art ${art}"></span></span></span>`;
  const ROOMS = ['wall', 'spread', 'screen'];
  const MATERIALS = {
    wall: {
      title: 'The gallery wall', name: 'gallery wall', verb: 'Hang it', cls: 'is-wall', icon: 'wall', sub: 'Four works and a label',
      brief: [
        { t: 'Nothing overlaps', f: (P, all) => noOverlap(all) },
        { t: 'The label sits right beside the large canvas', f: (P) => beside(P.label, P.sun) },
        { t: 'Two works hang on one line', f: (P) => onOneLine([P.sun, P.bands, P.orb, P.horizon]) },
      ],
      pieces: [
        { id: 'sun', label: 'Large canvas', w: 3, h: 3, anchor: true, html: frame('art-sun') },
        { id: 'bands', label: 'Tall canvas', w: 2, h: 3, html: frame('art-bands') },
        { id: 'orb', label: 'Small canvas', w: 2, h: 2, html: frame('art-orb') },
        { id: 'horizon', label: 'Wide canvas', w: 3, h: 1, html: frame('art-horizon') },
        { id: 'label', label: 'Wall label', w: 2, h: 1, html: '<span class="cp-label"><b>Untitled (Restraint)</b><i>2026 · light on nothing</i></span>' },
      ],
    },
    spread: {
      title: 'The editorial spread', name: 'editorial spread', verb: 'Send to print', cls: 'is-spread', icon: 'spread', sub: 'Five pieces of a magazine page',
      brief: [
        { t: 'Nothing overlaps', f: (P, all) => noOverlap(all) },
        { t: 'The image bleeds to a side edge', f: (P) => P.image.x < 0.15 || P.image.x + P.image.w > COLS - 0.15 },
        { t: 'The headline sits above the pull quote', f: (P) => above(P.head, P.quote) },
      ],
      pieces: [
        { id: 'image', label: 'Full-height image', w: 3, h: 5, anchor: true, html: '<span class="ed-img"></span>' },
        { id: 'head', label: 'Headline', w: 3, h: 2, html: '<span class="ed-head"><span>The Quiet <em>Season</em></span></span>' },
        { id: 'quote', label: 'Pull quote', w: 3, h: 2, html: '<span class="ed-quote">“Restraint is its own kind of intelligence.”</span>' },
        { id: 'cap', label: 'Caption', w: 2, h: 1, html: '<span class="ed-cap">Look 04 — wool, light, patience.</span>' },
        { id: 'folio', label: 'Folio', w: 1, h: 1, html: '<span class="ed-folio">No.<b>04</b></span>' },
      ],
    },
    screen: {
      title: 'The product screen', name: 'product screen', verb: 'Ship it', cls: 'is-screen', icon: 'screen', sub: 'Five parts of an interface',
      brief: [
        { t: 'Nothing overlaps', f: (P, all) => noOverlap(all) },
        { t: 'Navigation runs along the top', f: (P) => P.nav.y < 0.15 },
        { t: 'The button sits directly under the chart', f: (P) => under(P.btn, P.chart) },
      ],
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
    explorer: { plain: 'an Explorer', line: 'You moved first and asked later. The layout turned up somewhere in the trying.' },
    editor: { plain: 'an Editor', line: 'You looked before you touched, then cut until it held.' },
    architect: { plain: 'an Architect', line: 'You placed the heaviest thing first, then built everything round it.' },
    decider: { plain: 'a Decider', line: 'About one move per piece. You knew before you started.' },
  };
  const RANKS = [[9, 'Chief curator'], [6, 'Curator'], [3, 'Assistant curator'], [0, 'Intern']];

  // best stars per room: a per-visitor convenience, so the game still works without storage
  const KEY = 'curator-best-v1';
  let best = {};
  try { best = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { best = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(best)); } catch (e) { /* fine */ } };
  const totalStars = () => ROOMS.reduce((t, k) => t + (best[k]?.stars || 0), 0);
  const rank = () => RANKS.find(([n]) => totalStars() >= n)[1];
  const stars = (n, cls = '') => `<span class="cur-stars ${cls}" aria-label="${n} of 3 stars">${[0, 1, 2].map((i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('')}</span>`;

  // grid guides (lines 1..5 / 1..7)
  for (let i = 1; i < COLS; i++) gridEl.insertAdjacentHTML('beforeend', `<span class="g-v" data-v="${i}" style="left:${(i / COLS) * 100}%"></span>`);
  for (let j = 1; j < ROWS; j++) gridEl.insertAdjacentHTML('beforeend', `<span class="g-h" data-h="${j}" style="top:${(j / ROWS) * 100}%"></span>`);
  const guide = (axis, n) => gridEl.querySelector(`[data-${axis}="${n}"]`);

  let key = null, mat = null, pieces = [], m = null, z = 10, tick = null;

  const setMode = (mode) => {
    root.dataset.mode = mode;
    Object.entries(panels).forEach(([k, p]) => { p.hidden = k !== mode; });
    hud.hidden = mode === 'pick';
  };
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
  const buzz = (ms) => { try { navigator.vibrate?.(ms); } catch (e) { /* no haptics */ } };

  // ---- feedback ----------------------------------------------------------
  const pop = (p, text, cls = '') => {
    const el = document.createElement('span');
    el.className = `cur-pop ${cls}`; el.textContent = text;
    el.style.left = `${((p.x + p.w / 2) / COLS) * 100}%`; el.style.top = `${(p.y / ROWS) * 100}%`;
    stage.append(el);
    setTimeout(() => el.remove(), 1100);
  };
  const burst = (n = 18) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'cur-spark';
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, d = 22 + Math.random() * 30;
      s.style.setProperty('--dx', `${Math.cos(a) * d}cqw`); s.style.setProperty('--dy', `${Math.sin(a) * d}cqw`);
      s.style.animationDelay = `${Math.random() * 120}ms`;
      stage.append(s);
      setTimeout(() => s.remove(), 1500);
    }
  };
  const setScore = () => { hudScore.textContent = m.snapPts; };
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  // ---- the brief, judged live ---------------------------------------------
  const judge = () => {
    const P = Object.fromEntries(pieces.map((p) => [p.id, p]));
    return mat.brief.map((r) => !!r.f(P, pieces));
  };
  const evaluate = (announce = true) => {
    const met = judge();
    met.forEach((ok, i) => {
      const li = briefEl.children[i];
      if (ok && !m.met[i] && announce) { li.classList.add('just'); setTimeout(() => li.classList.remove('just'), 700); buzz(20); }
      li.classList.toggle('on', ok);
      li.querySelector('.sr-only').textContent = ok ? 'Met: ' : 'Not yet: ';
    });
    const all = met.every(Boolean), was = m.met.every(Boolean);
    m.met = met;
    doneBtn.classList.toggle('is-ready', all);
    stage.classList.toggle('is-met', all);
    if (all && !was && announce) { caption.textContent = `Brief met. ${mat.verb} when you’re ready.`; buzz([30, 40, 30]); }
  };

  // ---- measuring -----------------------------------------------------------
  const startMove = (p) => {
    if (!m.first) { m.first = p.id; m.firstAt = Math.max(0, now() - m.t0); doneBtn.disabled = false; }
    m.moves++;
    if (p.moved) m.revisions++;
    p.moved = true;
  };
  const scoreSnap = (p, viaKeys) => {
    const snapped = Number.isInteger(p.x) && Number.isInteger(p.y);
    const cell = `${p.x},${p.y}`;
    if (!snapped) { m.streak = 0; return; }
    if (cell === p.cell || m.snapPts >= SNAP_CAP) return;   // no farming the same spot
    p.cell = cell;
    m.streak = viaKeys ? 1 : Math.min(m.streak + 1, 3);
    const pts = 10 * m.streak;
    m.snapPts = Math.min(SNAP_CAP, m.snapPts + pts);
    pop(p, `+${pts}${m.streak > 1 ? ` ×${m.streak}` : ''}`, m.streak > 1 ? 'hot' : '');
    p.el.classList.add('is-snapped'); setTimeout(() => p.el.classList.remove('is-snapped'), 450);
    buzz(12); setScore();
  };

  // ---- build a round -------------------------------------------------------
  const scatter = () => {
    const placed = [];
    // biggest first, each at the least crowded of a few random spots: messy, but every piece can be grabbed
    [...pieces].sort((a, b) => b.w * b.h - a.w * a.h).forEach((p) => {
      let bestC = null, cost = Infinity;
      for (let k = 0; k < 14; k++) {
        const c = { w: p.w, h: p.h, x: Math.random() * (COLS - p.w), y: Math.random() * (ROWS - p.h) };
        // never start on the grid: it should look unresolved
        if (Math.abs(c.x - Math.round(c.x)) < 0.2) c.x = clamp(c.x + 0.38, 0, COLS - p.w);
        if (Math.abs(c.y - Math.round(c.y)) < 0.2) c.y = clamp(c.y + 0.41, 0, ROWS - p.h);
        const cst = placed.reduce((t, q) => t + overlap(c, q), 0);
        if (cst < cost) { bestC = c; cost = cst; }
      }
      p.x = bestC.x; p.y = bestC.y; p.rot = (Math.random() - 0.5) * 22; p.cell = null;
      placed.push(bestC);
    });
  };

  const begin = (k) => {
    key = k; mat = MATERIALS[k];
    stage.classList.remove('is-wall', 'is-spread', 'is-screen', 'is-curated', 'is-met');
    stage.classList.add(mat.cls);
    stage.querySelectorAll('.cp, .cur-pop, .cur-spark').forEach((el) => el.remove());
    pick.hidden = true;
    doneBtn.textContent = mat.verb; doneBtn.disabled = true; doneBtn.classList.remove('is-ready');
    m = { t0: now() + (reduce ? 0 : 900), first: null, firstAt: 0, moves: 0, revisions: 0, shuffles: 0, snapPts: 0, streak: 0, met: [false, false, false] };
    hudRoom.textContent = `Room ${ROOMS.indexOf(k) + 1}/3 · ${mat.title.replace('The ', '')}`;
    setScore(); hudTime.textContent = '0:00';
    clearInterval(tick);
    tick = setInterval(() => {
      const s = Math.max(0, (now() - m.t0) / 1000);
      hudTime.textContent = fmt(s);
      hudTime.classList.toggle('over', s > PAR);
    }, 250);
    briefEl.innerHTML = mat.brief.map((r) => `<li><i aria-hidden="true"></i><span><span class="sr-only">Not yet: </span>${r.t}</span><b aria-hidden="true">100</b></li>`).join('');
    pieces = mat.pieces.map((d, i) => {
      const el = document.createElement('div');
      el.className = 'cp'; el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-roledescription', 'movable piece');
      el.setAttribute('aria-label', `${d.label}. Arrow keys move it.`);
      el.style.width = `${(d.w / COLS) * 100}%`;
      el.style.height = `${(d.h / ROWS) * 100}%`;
      el.innerHTML = `<span class="cp-in">${d.html}</span>`;
      const p = { ...d, el, x: 0, y: 0, rot: 0, moved: false, cell: null };
      el.style.zIndex = z + i;
      stage.append(el);
      bind(p);
      return p;
    });
    scatter();
    pieces.forEach((p, i) => {
      if (reduce) { place(p); return; }
      // arrive from outside the frame, then land unresolved
      const fromX = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 40), fromY = (Math.random() - 0.5) * 80;
      p.el.style.left = `${(p.x / COLS) * 100}%`; p.el.style.top = `${(p.y / ROWS) * 100}%`;
      p.el.style.opacity = '0';
      p.el.style.transform = `translate(${fromX}%, ${fromY}%) rotate(${p.rot * 2.4}deg) scale(0.92)`;
      p.el.classList.add('is-arriving');
      setTimeout(() => { p.el.style.opacity = ''; place(p); }, 60 + i * 110);
      setTimeout(() => p.el.classList.remove('is-arriving'), 1000 + i * 110);
    });
    setMode('play');
    evaluate(false);
    caption.textContent = `${/^[aeiou]/.test(mat.name) ? 'An' : 'A'} ${mat.name}, out of place. Meet the brief.`;
  };

  // ---- interaction ---------------------------------------------------------
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
      if (counted) {
        magnet(p); place(p);
        caption.textContent = `${p.label} — ${where(p)}.`;
        scoreSnap(p, false); evaluate();
      }
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
      clearTimeout(el._g);
      el._g = setTimeout(() => { showGuides(null); scoreSnap(p, true); evaluate(); }, 700);
    });
    if (ring) {
      el.addEventListener('pointerenter', () => ring.classList.add('expand'));
      el.addEventListener('pointerleave', () => ring.classList.remove('expand'));
    }
  }

  // ---- how they decided ----------------------------------------------------
  const read = () => {
    const n = pieces.length, fm = m.firstAt / 1000, t = Math.max(0, (now() - m.t0) / 1000), per = m.moves / n;
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
    let line = STYLES[type].line;
    if (type === 'editor' && fm < 3) line = 'You placed things quickly, then went back and cut until it held.';
    return { type, line, fm, t };
  };

  const countUp = (el, to) => {
    if (reduce) { el.textContent = to; return; }
    const t0 = now(), dur = 900;
    const step = () => { const k = Math.min(1, (now() - t0) / dur); el.textContent = Math.round(to * (1 - (1 - k) ** 3)); if (k < 1) requestAnimationFrame(step); };
    step();
  };

  const finish = () => {
    clearInterval(tick);
    evaluate(false);
    const r = read();
    const metN = m.met.filter(Boolean).length;
    const briefPts = metN * 100;
    const timePts = metN >= 2 ? Math.round(Math.max(0, PAR - r.t) * 4) : 0;
    const total = briefPts + m.snapPts + timePts;
    const prev = best[key];
    const isBest = !prev || total > prev.score;
    best[key] = { stars: Math.max(prev?.stars || 0, metN), score: Math.max(prev?.score || 0, total) };
    save();

    setMode('result');
    stage.classList.remove('is-met'); stage.classList.add('is-curated');
    // their composition, snapped to the grid and straightened
    pieces.forEach((p) => { p.x = Math.round(p.x); p.y = Math.round(p.y); p.rot = 0; place(p); });
    caption.innerHTML = 'Your composition, snapped to the grid. <em>Chaos, but curated.</em>';
    if (metN === 3) { setTimeout(() => burst(), 500); buzz([20, 50, 20, 50, 60]); }

    const next = ROOMS[(ROOMS.indexOf(key) + 1) % ROOMS.length];
    const allDone = ROOMS.every((k) => best[k]);
    const verdict = ['The brief got away from you.', 'One line of the brief. A start.', 'Two of three. Nearly a show.', 'Brief met, in full.'][metN];
    panels.result.innerHTML = `
      <p class="cur-k">Room ${ROOMS.indexOf(key) + 1}/3 · ${mat.title.replace('The ', '')}${isBest && prev ? ' · <b class="cur-new">New best</b>' : ''}</p>
      ${stars(metN, 'cur-stars--big is-in')}
      <h2 class="cur-type"><span data-total>0</span> <small>pts</small></h2>
      <p class="cur-line">${verdict}</p>
      <dl class="cur-stats">
        <div><dt>Brief</dt><dd>${briefPts}</dd></div>
        <div><dt>Snaps</dt><dd>${m.snapPts}</dd></div>
        <div><dt>Time ${fmt(r.t)}</dt><dd>${timePts}</dd></div>
        <div><dt>Moves</dt><dd>${m.moves}</dd></div>
      </dl>
      ${metN < 2 ? '<p class="cur-why">The time bonus only counts once two lines of the brief are met.</p>' : ''}
      <p class="cur-how"><b>How you played: ${STYLES[r.type].plain}.</b> ${r.line} <span>First move ${r.fm.toFixed(1)}s · ${m.revisions} revision${m.revisions === 1 ? '' : 's'}.</span></p>
      <p class="cur-rank">Rank: <b>${rank()}</b> · ${totalStars()}/9 stars${allDone && totalStars() === 9 ? ' · every brief met' : ''}</p>
      <div class="cur-actions">
        <button type="button" class="btn-pill" data-next>${metN === 3 || !allDone ? 'Next room' : 'Next room'} <span aria-hidden="true">→</span></button>
        <button type="button" class="btn-pill btn-pill--ghost" data-again>Replay</button>
        <button type="button" class="cur-textbtn" data-back>All rooms</button>
      </div>`;
    countUp($('[data-total]', panels.result), total);
    $('[data-next]', panels.result).addEventListener('click', () => begin(next));
    $('[data-again]', panels.result).addEventListener('click', () => begin(key));
    $('[data-back]', panels.result).addEventListener('click', back);
    // on a phone the result sits under the stage: let the curated layout land, then bring it up
    const stacked = window.matchMedia('(max-width: 899px)').matches;
    setTimeout(() => {
      panels.result.focus({ preventScroll: true });
      if (stacked) panels.result.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, reduce ? 0 : 1300);
  };

  // ---- room select ---------------------------------------------------------
  const renderPick = () => {
    pick.innerHTML = `<p class="cur-pick-k">Choose a room</p>${ROOMS.map((k, i) => {
      const r = MATERIALS[k], b = best[k];
      return `<button type="button" class="cur-opt" data-material="${k}">
        <span class="cur-opt-icon cur-opt-icon--${r.icon}" aria-hidden="true"><i></i><i></i><i></i></span>
        <span class="cur-opt-t"><small>0${i + 1}</small> ${r.title}</span>
        <span class="cur-opt-d">${b ? `Best ${b.score} pts` : r.sub} ${stars(b?.stars || 0)}</span>
      </button>`;
    }).join('')}<p class="cur-pick-rank">Rank: <b>${rank()}</b> · ${totalStars()}/9 stars</p>`;
    pick.querySelectorAll('[data-material]').forEach((b) => b.addEventListener('click', () => begin(b.dataset.material)));
  };
  const back = () => {
    clearInterval(tick);
    stage.querySelectorAll('.cp, .cur-pop, .cur-spark').forEach((el) => el.remove());
    stage.classList.remove('is-wall', 'is-spread', 'is-screen', 'is-curated', 'is-met');
    pieces = []; renderPick(); pick.hidden = false;
    caption.textContent = '';
    setMode('pick');
    pick.querySelector('button')?.focus({ preventScroll: true });
  };

  doneBtn.addEventListener('click', finish);
  $('[data-shuffle]').addEventListener('click', () => {
    m.shuffles++; m.streak = 0;
    pieces.forEach((p) => { p.moved = false; });
    scatter(); pieces.forEach(place);
    evaluate(false);
    caption.textContent = 'Shuffled. Start again from here.';
  });
  $('[data-panel="play"] [data-back]').addEventListener('click', back);
  renderPick();
}
