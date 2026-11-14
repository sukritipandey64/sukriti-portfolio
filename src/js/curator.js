/* ==========================================================================
   The Curator — a phone-first game.
   Three rooms in order (gallery wall, editorial spread, product screen).
   Each has five pieces and a three-line brief judged live. Each finished
   room reveals one line of the player's card (Pace, Method, Eye); three
   rooms complete the card, which can be downloaded as an image.

   The hooks, on purpose:
   - a card with three hidden lines on the home screen (curiosity, a set to complete)
   - rooms unlock in order (a visible path, the goal gets closer)
   - a speed bonus that drains while you play (loss feels bigger than gain)
   - snap streaks and ticking brief lines (instant, earned feedback)
   - something of your own to keep at the end (the card, with your name)

   Score = 100 per brief line + grid snaps (streak multiplier, capped)
   + what is left of the speed bonus (only once two lines are met).
   ========================================================================== */

const root = document.querySelector('[data-curator]');
if (root) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = root) => el.querySelector(s);
  const $$ = (s, el = root) => [...el.querySelectorAll(s)];
  const screens = Object.fromEntries($$('[data-scr]').map((el) => [el.dataset.scr, el]));
  const stage = $('[data-stage]'), gridEl = $('.cur-grid'), caption = $('[data-caption]'), coach = $('[data-coach]');
  const hudRoom = $('[data-hud-room]'), hudScore = $('[data-hud-score]'), bonusBar = $('[data-bonus-bar]'), bonusN = $('[data-bonus-n]');
  const briefEl = $('[data-brief]'), doneBtn = $('[data-done]'), resultEl = $('[data-result]');
  const deckEl = $('[data-deck]'), pathEl = $('[data-path]'), startBtn = $('[data-start]'), cardEl = $('[data-card]'), nameInput = $('[data-name]');
  const ring = document.querySelector('.cursor-ring');

  const COLS = 6, ROWS = 8, MAGNET = 0.32, PAR = 45, BONUS = 180, SNAP_CAP = 150;
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
      title: 'Gallery wall', verb: 'Hang it', cls: 'is-wall', trait: 'Pace', bg: '#1c1a18',
      brief: [
        { t: 'Nothing overlaps', f: (P, all) => noOverlap(all) },
        { t: 'Label right beside the large canvas', f: (P) => beside(P.label, P.sun) },
        { t: 'Two works hang on one line', f: (P) => onOneLine([P.sun, P.bands, P.orb, P.horizon]) },
      ],
      pieces: [
        { id: 'sun', label: 'Large canvas', w: 3, h: 3, anchor: true, c: '#E8A15A', html: frame('art-sun') },
        { id: 'bands', label: 'Tall canvas', w: 2, h: 3, c: '#3D7A7A', html: frame('art-bands') },
        { id: 'orb', label: 'Small canvas', w: 2, h: 2, c: '#B88A95', html: frame('art-orb') },
        { id: 'horizon', label: 'Wide canvas', w: 3, h: 1, c: '#E0C49C', html: frame('art-horizon') },
        { id: 'label', label: 'Wall label', w: 2, h: 1, c: '#EFEBE3', html: '<span class="cp-label"><b>Untitled (Restraint)</b><i>2026 · light on nothing</i></span>' },
      ],
    },
    spread: {
      title: 'Editorial spread', verb: 'Send to print', cls: 'is-spread', trait: 'Method', bg: '#E6DED0',
      brief: [
        { t: 'Nothing overlaps', f: (P, all) => noOverlap(all) },
        { t: 'The image bleeds to a side edge', f: (P) => P.image.x < 0.15 || P.image.x + P.image.w > COLS - 0.15 },
        { t: 'Headline sits above the pull quote', f: (P) => above(P.head, P.quote) },
      ],
      pieces: [
        { id: 'image', label: 'Full-height image', w: 3, h: 5, anchor: true, c: '#8a5d3f', html: '<span class="ed-img"></span>' },
        { id: 'head', label: 'Headline', w: 3, h: 2, c: '#1A1A18', html: '<span class="ed-head"><span>The Quiet <em>Season</em></span></span>' },
        { id: 'quote', label: 'Pull quote', w: 3, h: 2, c: '#B5492F', html: '<span class="ed-quote">“Restraint is its own kind of intelligence.”</span>' },
        { id: 'cap', label: 'Caption', w: 2, h: 1, c: '#9a9388', html: '<span class="ed-cap">Look 04 — wool, light, patience.</span>' },
        { id: 'folio', label: 'Folio', w: 1, h: 1, c: '#5e584e', html: '<span class="ed-folio">No.<b>04</b></span>' },
      ],
    },
    screen: {
      title: 'Product screen', verb: 'Ship it', cls: 'is-screen', trait: 'Eye', bg: '#0E181D',
      brief: [
        { t: 'Nothing overlaps', f: (P, all) => noOverlap(all) },
        { t: 'Navigation runs along the top', f: (P) => P.nav.y < 0.15 },
        { t: 'Button directly under the chart', f: (P) => under(P.btn, P.chart) },
      ],
      pieces: [
        { id: 'chart', label: 'Chart card', w: 4, h: 3, anchor: true, c: '#2E5F61', html: '<span class="ui-card ui-chart"><b>This week</b><span class="ui-bars"><i style="--h:52%"></i><i style="--h:78%"></i><i style="--h:40%"></i><i style="--h:92%" class="hot"></i><i style="--h:64%"></i><i style="--h:30%"></i></span></span>' },
        { id: 'nav', label: 'Navigation bar', w: 6, h: 1, c: '#3a5560', html: '<span class="ui-card ui-nav"><b>SP</b><i>Overview</i><i>Team</i><i>Plan</i></span>' },
        { id: 'kpi', label: 'Metric card', w: 2, h: 2, c: '#E0C49C', html: '<span class="ui-card ui-kpi"><b>12</b><i>open tasks</i></span>' },
        { id: 'btn', label: 'Primary button', w: 2, h: 1, c: '#F0D9B5', html: '<span class="ui-btn">Review</span>' },
        { id: 'list', label: 'Team list', w: 2, h: 3, c: '#6fb3ae', html: '<span class="ui-card ui-list"><i></i><i></i><i></i></span>' },
      ],
    },
  };

  // the four ways people decide: pace (leap / look) x method (edit / commit)
  const TYPES = {
    'leap-edit': { name: 'The Explorer', line: 'Moves first, asks later. The layout turns up somewhere in the trying.' },
    'look-edit': { name: 'The Editor', line: 'Looks before touching, then cuts until it holds.' },
    'look-commit': { name: 'The Architect', line: 'Reads the room, places each piece once, and means it.' },
    'leap-commit': { name: 'The Decider', line: 'Fast, final, unbothered. Knew before starting.' },
  };
  const RANKS = [[9, 'Chief curator'], [6, 'Curator'], [3, 'Assistant curator'], [0, 'Intern']];

  // saved progress: a per-visitor convenience, the game works without it
  const KEY = 'curator-v2';
  let save = { rooms: {}, name: '', coached: false };
  try { save = { ...save, ...(JSON.parse(localStorage.getItem(KEY) || '{}') || {}) }; } catch (e) { /* fine */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* fine */ } };
  const done = (k) => save.rooms[k];
  const totalStars = () => ROOMS.reduce((t, k) => t + (done(k)?.stars || 0), 0);
  const totalScore = () => ROOMS.reduce((t, k) => t + (done(k)?.score || 0), 0);
  const rank = () => RANKS.find(([n]) => totalStars() >= n)[1];
  const allDone = () => ROOMS.every(done);
  const nextRoom = () => ROOMS.find((k) => !done(k));
  const typeOf = () => TYPES[`${done('wall')?.trait.k || 'look'}-${done('spread')?.trait.k || 'commit'}`];
  const stars = (n, cls = '') => `<span class="cur-stars ${cls}" aria-label="${n} of 3 stars">${[0, 1, 2].map((i) => `<i class="${i < n ? 'on' : ''}">★</i>`).join('')}</span>`;
  const thumb = (k) => {
    const r = done(k); if (!r) return '';
    return `<span class="thumb" style="background:${MATERIALS[k].bg}">${r.layout.map((p) => `<i style="left:${(p.x / COLS) * 100}%;top:${(p.y / ROWS) * 100}%;width:${(p.w / COLS) * 100}%;height:${(p.h / ROWS) * 100}%;background:${p.c}"></i>`).join('')}</span>`;
  };

  // grid guides (lines 1..5 / 1..7)
  for (let i = 1; i < COLS; i++) gridEl.insertAdjacentHTML('beforeend', `<span class="g-v" data-v="${i}" style="left:${(i / COLS) * 100}%"></span>`);
  for (let j = 1; j < ROWS; j++) gridEl.insertAdjacentHTML('beforeend', `<span class="g-h" data-h="${j}" style="top:${(j / ROWS) * 100}%"></span>`);
  const guide = (axis, n) => gridEl.querySelector(`[data-${axis}="${n}"]`);

  let key = null, mat = null, pieces = [], m = null, z = 10, tick = null;

  const show = (name) => {
    root.dataset.screen = name;
    Object.entries(screens).forEach(([k, el]) => { el.hidden = k !== name; });
    $$('[data-rank]').forEach((el) => { el.textContent = `${rank()} · ${totalStars()}/9 ★`; });
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
  const burst = (n = 20) => {
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
  const bonusNow = () => Math.round(BONUS * clamp(1 - Math.max(0, now() - m.t0) / 1000 / PAR, 0, 1));
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
    if (all && !was && announce) { caption.textContent = `Brief met. ${mat.verb} before the bonus drains.`; buzz([30, 40, 30]); }
  };

  // ---- measuring -----------------------------------------------------------
  const startMove = (p) => {
    if (!m.first) {
      m.first = p.id; m.firstAt = Math.max(0, now() - m.t0); doneBtn.disabled = false;
      coach.hidden = true; if (!save.coached) { save.coached = true; persist(); }
    }
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
    buzz(12); hudScore.textContent = m.snapPts;
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
    resultEl.hidden = true; resultEl.classList.remove('is-up');
    doneBtn.textContent = mat.verb; doneBtn.disabled = true; doneBtn.classList.remove('is-ready');
    m = { t0: now() + (reduce ? 0 : 900), first: null, firstAt: 0, moves: 0, revisions: 0, shuffles: 0, snapPts: 0, streak: 0, met: [false, false, false] };
    const idx = ROOMS.indexOf(k);
    hudRoom.textContent = `Room ${idx + 1} · ${mat.title}`;
    $$('[data-steps] li').forEach((li, i) => { li.className = i < idx ? 'done' : i === idx ? 'now' : ''; });
    hudScore.textContent = '0';
    coach.hidden = save.coached;
    clearInterval(tick);
    const paint = () => { const b = bonusNow(); bonusN.textContent = b; bonusBar.style.transform = `scaleX(${b / BONUS})`; bonusBar.parentElement.classList.toggle('low', b < BONUS * 0.3); };
    paint(); tick = setInterval(paint, 200);
    briefEl.innerHTML = mat.brief.map((r) => `<li><i aria-hidden="true"></i><span><span class="sr-only">Not yet: </span>${r.t}</span><b aria-hidden="true">+100</b></li>`).join('');
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
    show('play');
    evaluate(false);
    caption.textContent = 'Five pieces, out of place. Meet the brief.';
  };

  // ---- interaction ---------------------------------------------------------
  function bind(p) {
    const el = p.el;
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false, counted = false, id = null;
    const live = () => root.dataset.screen === 'play' && resultEl.hidden;
    el.addEventListener('pointerdown', (e) => {
      if (!live() || e.button > 0) return;
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
      if (!live()) return;
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

  // ---- what each room reveals ----------------------------------------------
  const traitFor = (k) => {
    const fm = m.firstAt / 1000, anchor = pieces.find((p) => p.anchor);
    if (k === 'wall') {
      return fm < 2.5
        ? { k: 'leap', title: 'You leap.', line: `First move in ${fm.toFixed(1)}s. You think in motion.` }
        : { k: 'look', title: 'You look first.', line: `${fm.toFixed(1)}s before your first move. You read the room.` };
    }
    if (k === 'spread') {
      return m.revisions >= 2
        ? { k: 'edit', title: 'You edit.', line: `${m.revisions} revisions. Nothing is final until it holds.` }
        : { k: 'commit', title: 'You commit.', line: `${m.moves} moves, barely a second thought.` };
    }
    return m.first === anchor.id
      ? { k: 'big', title: 'Big things first.', line: 'You placed the heaviest piece, then built round it.' }
      : { k: 'small', title: 'Details first.', line: 'You started small and let the big piece find its place.' };
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
    const t = Math.max(0, (now() - m.t0) / 1000);
    const metN = m.met.filter(Boolean).length;
    const briefPts = metN * 100;
    const timePts = metN >= 2 ? bonusNow() : 0;
    const total = briefPts + m.snapPts + timePts;
    const prev = done(key);
    const trait = traitFor(key);
    // their composition, snapped to the grid and straightened
    pieces.forEach((p) => { p.x = Math.round(p.x); p.y = Math.round(p.y); p.rot = 0; place(p); });
    save.rooms[key] = {
      stars: Math.max(prev?.stars || 0, metN), score: Math.max(prev?.score || 0, total), trait,
      layout: pieces.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h, c: p.c })),
    };
    persist();
    stage.classList.remove('is-met'); stage.classList.add('is-curated');
    caption.innerHTML = 'Snapped to the grid. <em>Chaos, but curated.</em>';
    if (metN === 3) { setTimeout(() => burst(), 300); buzz([20, 50, 20, 50, 60]); }

    const last = allDone();
    const verdict = ['The brief got away from you.', 'One line of the brief. A start.', 'Two of three. Nearly a show.', 'Brief met, in full.'][metN];
    const n = ROOMS.filter(done).length;
    resultEl.innerHTML = `
      <div class="result-grab" aria-hidden="true"></div>
      ${stars(metN, 'cur-stars--big is-in')}
      <p class="result-score"><b data-total>0</b> pts${prev && total > prev.score ? ' <span class="cur-new">New best</span>' : ''}</p>
      <p class="result-verdict">${verdict}</p>
      <p class="result-break"><span>Brief ${briefPts}</span><span>Snaps ${m.snapPts}</span><span>Speed ${timePts}</span><span>${fmt(t)}</span></p>
      ${metN < 2 ? '<p class="result-note">The speed bonus only counts once two lines of the brief are met.</p>' : ''}
      <div class="reveal-card">
        <p class="reveal-k">Card line ${n}/3 revealed · ${mat.trait}</p>
        <p class="reveal-t">${trait.title}</p>
        <p class="reveal-l">${trait.line}</p>
      </div>
      <button type="button" class="cta" data-next>${last ? 'Reveal my card' : `Next: room ${ROOMS.indexOf(nextRoom()) + 1}`} <span aria-hidden="true">→</span></button>
      <button type="button" class="ghost ghost--wide" data-again>Replay this room</button>`;
    resultEl.hidden = false;
    requestAnimationFrame(() => resultEl.classList.add('is-up'));
    countUp($('[data-total]', resultEl), total);
    $('[data-next]', resultEl).addEventListener('click', () => (last ? showCard() : begin(nextRoom())));
    $('[data-again]', resultEl).addEventListener('click', () => begin(key));
    setTimeout(() => resultEl.focus({ preventScroll: true }), 400);
  };

  // ---- home: the card you're filling, the path you're on --------------------
  const home = () => {
    clearInterval(tick);
    stage.querySelectorAll('.cp, .cur-pop, .cur-spark').forEach((el) => el.remove());
    const n = ROOMS.filter(done).length;
    deckEl.innerHTML = `
      <div class="deck-card ${allDone() ? 'is-full' : ''}">
        <p class="deck-k">Your Curator’s card <span>${n}/3</span></p>
        <p class="deck-type">${allDone() ? typeOf().name : '? ? ?'}</p>
        <ul>${ROOMS.map((k) => {
          const r = done(k);
          return `<li class="${r ? 'on' : ''}"><span>${MATERIALS[k].trait}</span><b>${r ? r.trait.title : 'Hidden'}</b></li>`;
        }).join('')}</ul>
      </div>`;
    const nx = nextRoom();
    pathEl.innerHTML = ROOMS.map((k, i) => {
      const r = done(k), open = r || k === nx;
      return `<li><button type="button" data-room="${k}" ${open ? '' : 'disabled'} class="${r ? 'is-done' : k === nx ? 'is-next' : 'is-locked'}">
        <span class="path-n">${open ? i + 1 : '🔒'}</span>
        <span class="path-t">${MATERIALS[k].title}</span>
        ${r ? stars(r.stars) : `<span class="path-s">${k === nx ? 'Up next' : 'Locked'}</span>`}
      </button></li>`;
    }).join('');
    $$('[data-room]', pathEl).forEach((b) => b.addEventListener('click', () => begin(b.dataset.room)));
    startBtn.textContent = allDone() ? 'See my card' : n ? `Continue: room ${ROOMS.indexOf(nx) + 1}` : 'Start room 1';
    show('home');
  };

  // ---- the card --------------------------------------------------------------
  const cardHTML = () => {
    const t = typeOf();
    return `<div class="kard">
      <p class="kard-k"><span>The Curator’s card</span><span>${rank()}</span></p>
      <p class="kard-name" data-kname>${save.name ? save.name : 'A curator'}</p>
      <p class="kard-type">${t.name}</p>
      <p class="kard-line">${t.line}</p>
      <ul class="kard-traits">${ROOMS.map((k) => `<li><span>${MATERIALS[k].trait}</span><b>${done(k).trait.title}</b></li>`).join('')}</ul>
      <div class="kard-thumbs">${ROOMS.map(thumb).join('')}</div>
      <p class="kard-foot"><span>${totalStars()}/9 ★ · ${totalScore()} pts</span><span>sukritipandey.vercel.app</span></p>
    </div>`;
  };
  const showCard = () => {
    clearInterval(tick);
    cardEl.innerHTML = cardHTML();
    nameInput.value = save.name || '';
    show('card');
    cardEl.querySelector('.kard').classList.add('is-in');
  };
  nameInput.addEventListener('input', () => {
    save.name = nameInput.value.trim().slice(0, 22); persist();
    const el = $('[data-kname]', cardEl); if (el) el.textContent = save.name || 'A curator';
  });

  // the same card, drawn to a canvas so it can be saved as an image
  const drawCard = async () => {
    const W = 1080, H = 1350, cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    try { await Promise.all(['300 100px "Cormorant Garamond"', 'italic 300 100px "Cormorant Garamond"', '400 30px "Syne"'].map((f) => document.fonts.load(f))); } catch (e) { /* fall back to system fonts */ }
    const serif = '"Cormorant Garamond", Georgia, serif', sans = '"Syne", system-ui, sans-serif';
    const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#12222a'); g.addColorStop(0.55, '#0A1419'); g.addColorStop(1, '#1d1610');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const glow = c.createRadialGradient(W * 0.8, H * 0.1, 0, W * 0.8, H * 0.1, W * 0.9); glow.addColorStop(0, 'rgba(224,160,90,0.28)'); glow.addColorStop(1, 'rgba(224,160,90,0)');
    c.fillStyle = glow; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(224,196,156,0.5)'; c.lineWidth = 2; c.strokeRect(40, 40, W - 80, H - 80);
    const M = 96, amber = '#E0C49C', text = '#F0EDE6', dim = '#9aa3a6';
    const caps = (s, x, y, col = dim, size = 24, align = 'left') => { c.font = `400 ${size}px ${sans}`; c.fillStyle = col; c.textAlign = align; try { c.letterSpacing = '5px'; } catch (e) { /* older browsers */ } c.fillText(s.toUpperCase(), x, y); try { c.letterSpacing = '0px'; } catch (e) { /* */ } };
    caps('The Curator’s card', M, 140, amber); caps(rank(), W - M, 140, dim, 24, 'right');
    c.textAlign = 'left';
    c.font = `300 44px ${serif}`; c.fillStyle = dim; c.fillText(save.name || 'A curator', M, 250);
    const t = typeOf();
    c.font = `italic 300 132px ${serif}`; c.fillStyle = amber; c.fillText(t.name, M - 4, 390);
    c.font = `300 40px ${serif}`; c.fillStyle = text;
    const words = t.line.split(' '); let line = '', y = 470;
    words.forEach((w) => { if (c.measureText(`${line}${w} `).width > W - M * 2) { c.fillText(line.trim(), M, y); y += 54; line = ''; } line += `${w} `; });
    c.fillText(line.trim(), M, y);
    let ty = 640;
    ROOMS.forEach((k) => {
      c.strokeStyle = 'rgba(240,237,230,0.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(M, ty - 52); c.lineTo(W - M, ty - 52); c.stroke();
      caps(MATERIALS[k].trait, M, ty, dim, 22);
      c.font = `300 50px ${serif}`; c.fillStyle = text; c.textAlign = 'right'; c.fillText(done(k).trait.title, W - M, ty + 6); c.textAlign = 'left';
      ty += 96;
    });
    const tw = 232, th = tw * 1.25, gap = (W - M * 2 - tw * 3) / 2, y0 = 900;
    ROOMS.forEach((k, i) => {
      const x0 = M + i * (tw + gap);
      c.fillStyle = MATERIALS[k].bg; c.fillRect(x0, y0, tw, th);
      c.strokeStyle = 'rgba(240,237,230,0.25)'; c.strokeRect(x0, y0, tw, th);
      done(k).layout.forEach((p) => { c.fillStyle = p.c; c.fillRect(x0 + (p.x / COLS) * tw + 3, y0 + (p.y / ROWS) * th + 3, (p.w / COLS) * tw - 6, (p.h / ROWS) * th - 6); });
    });
    caps(`${totalStars()}/9 ★ · ${totalScore()} pts`, M, H - 100, amber, 22);
    caps('sukritipandey.vercel.app', W - M, H - 100, dim, 22, 'right');
    return cv;
  };
  const cardBlob = async () => { const cv = await drawCard(); return new Promise((res) => cv.toBlob(res, 'image/png')); };
  const fileName = () => `curators-card-${typeOf().name.replace('The ', '').toLowerCase()}.png`;
  $('[data-download]').addEventListener('click', async (e) => {
    const btn = e.currentTarget, label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Printing…';
    try {
      const blob = await cardBlob(), url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = fileName(); document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      btn.textContent = 'Saved. Frame it.';
    } catch (err) { btn.textContent = 'Couldn’t save. Try again'; }
    setTimeout(() => { btn.disabled = false; btn.textContent = label; }, 2200);
  });
  const shareBtn = $('[data-share]');
  if (navigator.canShare) {
    try { if (navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] })) shareBtn.hidden = false; } catch (e) { /* no file sharing */ }
  }
  shareBtn.addEventListener('click', async () => {
    try {
      const file = new File([await cardBlob()], fileName(), { type: 'image/png' });
      await navigator.share({ files: [file], title: 'My Curator’s card', text: `I’m ${typeOf().name}. What are you?` });
    } catch (e) { /* cancelled */ }
  });

  // ---- wiring ---------------------------------------------------------------
  doneBtn.addEventListener('click', finish);
  $('[data-shuffle]').addEventListener('click', () => {
    m.shuffles++; m.streak = 0;
    pieces.forEach((p) => { p.moved = false; });
    scatter(); pieces.forEach(place);
    evaluate(false);
    caption.textContent = 'Shuffled. The bonus is still draining.';
  });
  $$('[data-home]').forEach((b) => b.addEventListener('click', home));
  startBtn.addEventListener('click', () => (allDone() ? showCard() : begin(nextRoom())));
  home();
}
