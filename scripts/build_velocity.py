"""Generates the <main> of velocity-ai.html (v2 spec, Oct 2026).
Image slots reference /images/velocity/v2/<asset>.webp; run `python3 scripts/assets.py velocity <folder>`
to convert dropped-in files and stamp real width/height into the page."""
import re, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / 'velocity-ai.html'
PROTO = 'https://www.figma.com/make/Sho1iwOvhDxAd0g1laSmdW/Velocity-AI?fullscreen=1'
LONGFORM = 'https://claude.ai/artifact/MZtPGgcvskxHiSCginxVDQ'
# Flip to True only once the long-form doc is shared publicly (otherwise reviewers hit a login).
LONGFORM_PUBLIC = False
# Production rule: a slot whose image file doesn't exist is left out entirely (no placeholders).
SHOW_PENDING = False

KIND = {  # default intrinsic size until the real file arrives
    'shot': (1600, 1000), 'sketch': (1200, 900), 'diagram': (1600, 900),
}

ASSETS = ROOT / 'public' / 'images' / 'velocity' / 'v2'

def size_of(asset):
    f = ASSETS / f'{asset}.webp'
    if f.exists():
        from PIL import Image
        return Image.open(f).size
    return KIND[asset.split('-')[0]]

def has(asset):
    return (ASSETS / f'{asset}.webp').exists()

def img(asset, alt, sample=False, sizes='(max-width: 860px) 92vw, 55vw', cls='', caption=None, eager=False):
    if not SHOW_PENDING and not has(asset):
        return ''
    w, h = size_of(asset)
    tag = '<span class="sample-tag">Sample data</span>' if sample else ''
    cap = f'<figcaption>{caption}</figcaption>' if caption else ''
    load = '' if eager else ' loading="lazy"'
    cap_w = f' style="--cap:{round(w * 0.62)}px"' if asset.startswith('shot-') else ''
    return (f'<figure class="shot {cls}" data-zoom data-asset="{asset}"{cap_w}>{tag}'
            f'<img srcset="{"/images/velocity/v2/" + asset + "-900.webp 900w, " if w > 900 else ""}/images/velocity/v2/{asset}.webp {w}w" '
            f'sizes="{sizes}" src="/images/velocity/v2/{asset}.webp" alt="{html.escape(alt)}"{load} '
            f'decoding="async" width="{w}" height="{h}">{cap}</figure>')

def scrub(sketch, sketch_alt, shot, shot_alt, cap):
    if not SHOW_PENDING and not has(shot):
        return ''
    if not SHOW_PENDING and not has(sketch):
        # no notebook page yet: show the final screen on its own
        return f'<div class="ss-solo reveal">{img(shot, shot_alt, sample=True, sizes="(max-width: 860px) 92vw, 80vw")}<p class="ss-cap">{cap}</p></div>'
    w, h = size_of(shot)
    def layer(asset, alt, cls, sample=False):
        aw, ah = size_of(asset)
        small = f'/images/velocity/v2/{asset}-900.webp 900w, ' if aw > 900 else ''
        tag = '<span class="sample-tag">Sample data</span>' if sample else ''
        return (f'<figure class="shot {cls}" data-asset="{asset}">{tag}<img srcset="{small}/images/velocity/v2/{asset}.webp {aw}w" '
                f'sizes="(max-width: 860px) 92vw, 80vw" src="/images/velocity/v2/{asset}.webp" alt="{html.escape(alt)}" '
                f'loading="lazy" decoding="async" width="{aw}" height="{ah}"></figure>')
    return (f'<div class="scrub reveal" data-scrub><div class="scrub-stage" style="--ar:{w/h:.3f}">'
            + layer(shot, shot_alt, 'scrub-screen', sample=True) + layer(sketch, sketch_alt, 'scrub-sketch')
            + '<span class="scrub-k scrub-k--l" aria-hidden="true">Notebook</span><span class="scrub-k scrub-k--r" aria-hidden="true">Final</span>'
            + '<span class="scrub-handle" aria-hidden="true"><i></i></span>'
            + f'<input class="scrub-range" type="range" min="0" max="100" value="100" aria-label="{html.escape(cap)}: slide between the notebook sketch and the final screen">'
            + f'</div><p class="ss-cap">{cap} <span>Drag to compare</span></p></div>')

def ba():
    before = img('sketch-login-jira-first', 'Notebook sketch of the first login: product features beside a Jira and Asana sign-in', caption='Assumed teams would arrive through Jira')
    after = PATHS
    sides = ''.join(f'<div><span class="ba-k{k2}">{k}</span>{x}</div>' for k, k2, x in (('Before', '', before), ('After', ' ba-k--after', after)) if x)
    return f'<div class="ba reveal">{sides}</div>' if sides else ''

PATHS = """<figure class="paths" aria-label="Five ways into Velocity, all ending on the dashboard">
  <ol class="paths-in">
    <li><b>Sign up</b>and create a team</li>
    <li><b>Find your company</b>and join teammates</li>
    <li><b>Invite code</b>or link from an admin</li>
    <li><b>Email invite</b>from your lead</li>
    <li><b>Add a team later</b>from the team switcher</li>
  </ol>
  <div class="paths-join" aria-hidden="true"></div>
  <div class="paths-mid"><span>Then add your people, three ways</span><p>Type them in <i>·</i> Import a CSV <i>·</i> Paste rows and the AI drafts skills</p></div>
  <div class="paths-out"><span>Lands on</span>The dashboard</div>
  <figcaption>Five ways in, none of them need Jira</figcaption>
</figure>"""

CALC = """<div class="calc reveal" aria-label="How the capacity numbers work">
  <p class="calc-k">Under the hood, straight from the notebook</p>
  <div class="calc-flow">
    <div class="calc-box"><span>Recalculates when</span><ul><li>an assignment changes</li><li>a timesheet is submitted</li><li>leave is approved</li></ul></div>
    <div class="calc-box calc-box--f"><span>The math</span>
      <p><b>Available</b> = working days × hours a day − leave</p>
      <p><b>Load</b> = assigned hours ÷ available</p></div>
    <div class="calc-box"><span>Shows the lead</span><ul><li>free hours this week</li><li>load in hours and %</li><li>who is over capacity</li></ul></div>
  </div>
  <div class="calc-ex">
    <p class="calc-ex-k">Worked example <span class="sample-tag sample-tag--inline">Sample data</span></p>
    <p class="calc-ex-l">5 days × 8h − 0 leave = <b>40h available</b>. Sarah is assigned 48h, so her load is <b>120%</b>. The AI suggests moving 8h of Dashboard UI QA to Alex.</p>
    <div class="calc-bars">
      <div class="cb"><span class="cb-n">Sarah</span><span class="cb-t"><i style="width:80%" class="cb-before cb-over"></i><i style="width:66.7%" class="cb-after"></i><em class="cb-cap"></em></span><span class="cb-v">48h → 40h <small>120% → 100%</small></span></div>
      <div class="cb"><span class="cb-n">Alex</span><span class="cb-t"><i style="width:33.3%" class="cb-before"></i><i style="width:46.7%" class="cb-after"></i><em class="cb-cap"></em></span><span class="cb-v">20h → 28h <small>50% → 70%</small></span></div>
    </div>
    <p class="calc-legend">Upper bar now, lower bar after the move. The line is 40h.</p>
  </div>
</div>"""

def tcard(asset, alt, n, title, body, sample=False):
    fig = img(asset, alt, sample=sample, sizes='(max-width: 860px) 92vw, 30vw', cls='tcard-shot')
    return (f'<article class="tcard reveal">{fig}<div class="tcard-copy"><span class="pattern-n">{n}</span>'
            f'<h3 class="tcard-t">{title}</h3><p>{body}</p></div></article>')

TABS = [('Manager dashboard', 'sketch-dashboard', 'Notebook sketch of the manager dashboard: four summary boxes, an AI recommendation panel and upcoming deadlines', 'shot-dashboard', 'The final manager dashboard: KPI cards, capacity by person and week, deadlines and AI insights'),
        ('Employee time', 'sketch-timesheet', 'Notebook sketch of a timesheet with a time block', 'shot-employee-time', 'The employee Time area: timesheets, leave and company holidays in three tabs'),
        ('People and roles', 'sketch-roles-flow', 'Notebook sketch of the roles flow: a user becomes a manager, an employee or an individual contributor', 'shot-people-drawer', 'People and capacity with a person’s detail panel open: four-week capacity, projects, skills and AI suggestions')]
def ftabs():
    btns = ''.join(f'<button type="button" role="tab" id="ftb-{i}" aria-controls="ft-{i}" aria-selected="{"true" if i == 0 else "false"}" tabindex="{0 if i == 0 else -1}">{t[0]}</button>' for i, t in enumerate(TABS))
    panels = ''.join(f'<div role="tabpanel" id="ft-{i}" aria-labelledby="ftb-{i}"{"" if i == 0 else " hidden"}>{scrub(t[1], t[2], t[3], t[4], t[0])}</div>' for i, t in enumerate(TABS))
    return f'<div class="ftabs reveal" data-tabs><div class="ftabs-list" role="tablist" aria-label="Final screens">{btns}</div>{panels}</div>'

PROTO_CTA = f'<a class="btn-pill" href="{PROTO}" target="_blank" rel="noopener">Try the prototype<span class="sr-only"> (opens Figma Make in a new tab)</span></a><span class="cta-note">Opens in Figma Make</span>'

MAIN = f'''
  <main id="main" data-toc-root>

    <!-- Cover: title, teaser screen, metadata (one screen) -->
    <header class="cs-cover cs-cover--bleed" data-light="warm" id="top" data-toc="Overview">
      <div class="cover-grid">
        <div class="cover-copy">
          <p class="cs-kicker">Case study 01 · Self-initiated · {{READ}} min read</p>
          <h1 class="display cs-title">
            <span class="line-mask"><span>Velocity</span></span>
            <span class="line-mask"><span><em>AI</em></span></span>
          </h1>
          <p class="cs-lede">Capacity intelligence that shows a team lead who can take on more work, before anyone is committed to it.</p>
          <div class="cs-ctas">
            <span class="cta-wrap">{PROTO_CTA}</span>
            <a class="link-quiet" href="#glance">Read the story</a>
          </div>
        </div>
      </div>
      <div class="cover-bleed" aria-hidden="true">
        <img src="/images/velocity/v2/shot-dashboard.webp" srcset="/images/velocity/v2/shot-dashboard-900.webp 900w, /images/velocity/v2/shot-dashboard.webp 2000w" sizes="(max-width: 860px) 100vw, 70vw" alt="" width="2000" height="1250" fetchpriority="high">
        <span class="sample-tag">Sample data</span>
      </div>
      <dl class="meta-row">
        <div><dt>Role</dt><dd>Product concept, user research, product design, AI-directed prototype — end to end</dd></div>
        <div><dt>Idea partner</dt><dd>Anant Mishra, early conversations</dd></div>
        <div><dt>Timeline</dt><dd>Feb–Mar 2026, visual refresh Oct 2026</dd></div>
        <div><dt>Research</dt><dd>4 interviews: delivery, audit, product, UX</dd></div>
        <div><dt>Tools</dt><dd>Figma Make, iterative prompting</dd></div>
      </dl>
    </header>

    <!-- At a glance -->
    <section class="glance-room" id="glance" data-light="near" aria-label="At a glance">
      <div class="glance reveal">
        <div><span>The problem</span><p>Work gets assigned on gut feel. Nobody can see who actually has room until a deadline slips.</p></div>
        <div><span>What I made</span><p>A capacity tool where AI drafts the plan and recommends people, and a lead checks every change before it happens.</p></div>
        <div><span>What it shows</span><p>How I design AI people can trust, and how four interviews changed what I built.</p></div>
      </div>
    </section>

    <!-- 01 · The problem -->
    <section class="room" id="problem" data-light="near" data-toc="Problem">
      <p class="label reveal">01 — The problem</p>
      <div class="two-col">
        <h2 class="h2 reveal d1">Four projects. A teammate had one. <em>Nobody could see it.</em></h2>
        <div>
          <p class="body reveal d2">Velocity started as a conversation with Anant Mishra about how companies could measure the return on their AI spend. You can't measure that without knowing where time goes, and that led me to a problem I was living with every week.</p>
          <p class="body reveal d2">I was running four projects while a teammate had one, and nobody could see it. Work was assigned on gut feel.</p>
          <p class="body reveal d3">From there, I shaped the idea into a product, designed it, ran the interviews and built the prototype.</p>
        </div>
      </div>
      <div class="contrast reveal">
        <div><span>Project tracking asks</span><p>What work exists?</p><em>Answered well by task tools and spreadsheets.</em></div>
        <div><span>Capacity intelligence asks</span><p>Can we realistically <i>take this on?</i></p><em>Answered by nobody. It lives in a lead's head.</em></div>
      </div>
      <p class="goal reveal"><span>Design goal</span>Move the capacity conversation to <em>before</em> a commitment is made.</p>
    </section>

    <!-- 02 · Research -->
    <section class="room" id="research" data-light="reading" data-toc="Research">
      <p class="label reveal">02 — Research</p>
      <h2 class="h2 reveal d1 narrow-title">Four interviews. <em>Each one moved something.</em></h2>
      <div class="itable reveal" role="table" aria-label="What each interview changed">
        <div class="ir ir--head" role="row"><span role="columnheader">Who</span><span role="columnheader">What they said</span><span role="columnheader">What changed</span></div>
        <div class="ir" role="row"><span role="cell">Senior delivery professional</span><q role="cell">You see yourself doing the same kind of work because only the same two, three people see your availability.</q><span role="cell">Human-in-the-loop got stronger. An "I'm interested" signal went on the roadmap.</span></div>
        <div class="ir ir--key" role="row"><span role="cell">Audit director</span><q role="cell">Somebody would have to key in something.</q><span role="cell">Onboarding hadn't been thought through. I redesigned it around getting data in with little effort.</span></div>
        <div class="ir" role="row"><span role="cell">Product manager</span><q role="cell">It's just that I'm not the ICP for that.</q><span role="cell">The audience narrowed to teams that allocate people across many projects.</span></div>
        <div class="ir" role="row"><span role="cell">UX director</span><q role="cell">Most of the time service-based companies tend to run over-utilized.</q><span role="cell">I stopped claiming Velocity predicts every risk. It shows the effect of a change.</span></div>
      </div>
      <ol class="strip reveal" aria-label="Order of work">
        <li><span>Built first</span>The core loop</li>
        <li class="strip-mid"><span>Then</span>Four interviews</li>
        <li><span>Built after</span>Onboarding, five ways in</li>
      </ol>
    </section>

    <!-- 03 · The system -->
    <section class="room" id="system" data-light="cool" data-toc="The system">
      <p class="label reveal">03 — Sketch → system</p>
      <div class="split">
        {img('sketch-conceptual-model', 'Notebook sketch of the conceptual model: project and employee data feed a synthesis step, and Plan My Project turns a description into tasks, skills and a timeline', cls='reveal', caption='The first conceptual model, in a notebook')}
        <div>
          <h2 class="h2 reveal d1">It started <em>on paper.</em></h2>
          <p class="body reveal d2">One loop holds the whole product. A lead describes a project, the AI drafts the tasks and recommends people, and nothing moves until the lead has edited the plan and chosen to commit it.</p>
          <ol class="loop reveal d3" aria-label="The core loop">
            <li>Describe a project</li><li>AI drafts tasks</li><li>AI recommends people</li><li>Lead edits</li><li>Commit</li>
          </ol>
        </div>
      </div>
      {CALC}
    </section>

    <!-- 04 · Onboarding -->
    <section class="room" id="onboarding" data-light="cool" data-toc="Onboarding">
      <p class="label reveal">04 — Onboarding</p>
      <h2 class="h2 reveal d1 narrow-title">The assumption <em>the research broke.</em></h2>
      {ba()}
      <p class="pull reveal">The hard design problem wasn't the dashboard. <em>It was who keys the data in.</em></p>
      <div class="pair pair--loose reveal">
        {img('shot-onboarding-add-team', 'Onboarding step to add a team: a table of name, email and role, with Import from CSV and a skip option', sample=True, caption='Add the team, or skip and come back')}
        {img('shot-create-team-paste-ai-skills', 'Create a team by pasting rows from a spreadsheet; the AI suggests skills from each role for the lead to edit before saving', sample=True, caption='Paste from a spreadsheet; AI drafts the skills, the lead checks them')}
      </div>
    </section>

    <!-- 05 · AI trust and control -->
    <section class="room" id="trust" data-light="focus" data-toc="AI trust">
      <p class="label reveal">05 — AI trust and control</p>
      <div class="trust-head">
        <h2 class="h2 reveal d1">AI assists. <em>A human decides.</em></h2>
        <p class="body reveal d2">Velocity's AI plans projects and recommends people. Every output is designed to be checked by a person before it changes anything. Six patterns carry that principle.</p>
      </div>

      <article class="pattern pattern--wide reveal">
        <div class="pattern-copy">
          <span class="pattern-n">a</span>
          <h3 class="h3">Impact <em>before</em> Apply.</h3>
          <p class="body">Each suggestion reads what → why → impact → decide. Review opens an impact panel: who is affected, the hours that move, the effect on the timeline. Apply lives only inside that panel, and every change can be undone.</p>
        </div>
        <div class="steps3">
          {img('shot-ai-card-collapsed', 'A collapsed AI suggestion card with a High confidence pill, a category edge, a two-line reason, and Review and Ignore buttons', sample=True, caption='1 · Review or Ignore, never Apply')}
          {img('shot-ai-card-impact-panel', 'Review open: the impact panel lists the tasks that move and each person’s hours before and after, while the timeline shows the proposed bars and new totals', sample=True, caption='2 · The math before the decision: 48h → 40h')}
          {img('shot-ai-applied', 'After Apply: the dashboard KPIs show what changed, and a confirmation offers Undo', sample=True, caption='3 · Applied, with the change shown and an Undo')}
        </div>
      </article>

      <div class="tgrid">
        {tcard('shot-plan-step1-tasks', 'Plan My Project, step one: AI-generated tasks with hour estimates, and a feasibility score shown beside the model’s confidence', 'b', 'Confidence on <em>every</em> AI number.', 'Scores never appear alone: <span class="mono">Feasibility 87 · Model confidence 91%</span>. The confidence sits beside the number as a quiet footnote.')}
        {tcard('shot-ai-thresholds', 'AI Thresholds settings: flag tasks below 70% confidence, warn on health below 60, treat a delay over 7 days as a risk', 'c', 'Leads set when the AI <em>speaks up.</em>', 'Flag anything under 70% confidence, warn below a health score of 60, treat a seven-day slip as risk. Each team sets its own tolerance.')}
        {tcard('shot-thin-input-refusal', 'Plan My Project declining a too-short description with the message "Need more data to run this request" and an option to upload a requirements document', 'd', 'It refuses <em>thin input.</em>', 'Under 50 characters, Plan My Project asks for more detail or a requirements document. A confident plan built on too little is worse than no plan.')}
        {tcard('shot-low-confidence', 'A low-confidence suggestion: the card says two of five people haven’t logged time this week, asks the lead to check before applying, and offers Remind team to log time', 'e', 'It says when it <em>isn’t sure.</em>', 'Below 70%, a card says why and offers to remind the team to log time; Apply becomes Apply anyway. With no data at all, the panel says "No insights yet" instead of inventing some.', sample=True)}
        {tcard('shot-plan-step2-allocate', 'Plan My Project, step two: recommended people with skill match and availability; the lead selects who joins', 'f', 'The AI recommends. <em>The lead selects.</em>', 'Skill match and availability sit side by side, and nothing is committed until the lead has chosen the people.', sample=True)}
        <article class="tcard tcard--text reveal">
          <div class="tcard-copy"><span class="pattern-n">g</span><h3 class="tcard-t">No spinner. <em>It says what it's weighing.</em></h3>
          <ol class="reason-lines"><li>Analyzing similar projects…</li><li>Mapping task structure…</li><li>Simulating capacity constraints…</li><li>Evaluating feasibility…</li></ol></div>
        </article>
      </div>
    </section>

    <!-- 06 · Key decisions -->
    <section class="room" id="decisions" data-light="near" data-toc="Decisions">
      <p class="label reveal">06 — Key decisions</p>
      <h2 class="h2 reveal d1 narrow-title">Four decisions, <em>and what each cost.</em></h2>
      <div class="decisions">
        <div class="dtable reveal" role="table" aria-label="Key decisions and trade-offs">
          <div class="dr dr--head" role="row"><span role="columnheader">Decision</span><span role="columnheader">Why</span><span role="columnheader">Trade-off accepted</span></div>
          <div class="dr" role="row"><b role="cell">Plan before you commit</b><span role="cell">Capacity is most useful before work is promised, not after a deadline slips.</span><span role="cell">Planning becomes an extra step before execution.</span></div>
          <div class="dr" role="row"><b role="cell">Roles belong to teams</b><span role="cell">One person can lead one team and contribute on another.</span><span role="cell">The switcher became a team switcher, not a simple role toggle.</span></div>
          <div class="dr" role="row"><b role="cell">Hours and utilisation, not task counts</b><span role="cell">Fifteen small tasks can be lighter than two large ones.</span><span role="cell">Every task needs an effort estimate.</span></div>
          <div class="dr" role="row"><b role="cell">No monitoring</b><span role="cell">No activity tracking, payroll or attendance. It must not feel like surveillance.</span><span role="cell">Less data for the AI to learn from.</span></div>
        </div>
        {img('shot-team-switcher', 'The team switcher at the foot of the sidebar, listing each team with the person’s role on it and a Create New Team option', sample=True, cls='reveal d1 decisions-shot', sizes='(max-width: 860px) 92vw, 30vw', caption='Roles belong to teams')}
      </div>
      <p class="deferred reveal"><span>Deliberately not built yet</span>An "I'm interested" signal, so people can flag projects they'd like to join. Valuable, and it only helps once the capacity view is trusted. Adding it early would have widened the scope without strengthening the core loop.</p>
    </section>

    <!-- 07 · Final design -->
    <section class="room" id="final" data-light="cool" data-toc="Final design">
      <p class="label reveal">07 — Final design</p>
      <div class="final-head">
        <h2 class="h2 reveal d1">Same idea, <em>fewer crossings-out.</em></h2>
        <div class="final-cta reveal d2"><p class="body">Drag across each screen to see the notebook page underneath. Or click through the real thing.</p><span class="cta-wrap">{PROTO_CTA}</span></div>
      </div>
      {ftabs()}
    </section>

    <!-- 08 · What this shows -->
    <section class="room" id="shows" data-light="near" data-toc="What it shows">
      <p class="label reveal">08 — What this shows</p>
      <h2 class="h2 reveal d1 narrow-title">The evidence is the work, <em>not a usage number.</em></h2>
      <div class="shows reveal">
        <div><b>A working prototype</b><p>Manager and employee views, built by directing AI in Figma Make, clickable end to end.</p></div>
        <div><b>Six trust patterns</b><p>Impact before Apply, visible confidence, team-set thresholds, refusing thin input, admitting uncertainty, the lead selects.</p></div>
        <div><b>Four decisions, each with its cost</b><p>Every choice names the trade-off I accepted, from an extra planning step to less data for the AI.</p></div>
        <div><b>A redesign that came from research</b><p>One interview line, "somebody would have to key in something", became five ways in.</p></div>
      </div>
    </section>

    <!-- 09 · Reflections + next -->
    <section class="room" id="reflections" data-light="quiet" data-toc="Reflections">
      <p class="label reveal">09 — Reflections</p>
      <h2 class="h2 reveal d1 narrow-title">What I'd tell myself <em>in February.</em></h2>
      <div class="refs">
        <div class="ref glow reveal d1"><span>01</span><h3>Validate the edges, not just the core</h3><p>I designed the core experience before validating it. The interviews didn't change that core, but they exposed what I'd missed: how the data gets in. That became the onboarding redesign.</p></div>
        <div class="ref glow reveal d2"><span>02</span><h3>Data needs a counterweight</h3><p>Availability data alone can box people in. Showing it makes allocation faster, and it can also keep sending the same people the same work.</p></div>
        <div class="ref glow reveal d3"><span>03</span><h3>Directing AI is still design</h3><p>I didn't draw these screens by hand. I wrote the briefs, judged the output and pushed it through six rounds. The decisions lived in the briefs.</p></div>
      </div>

      <div class="next reveal">
        <p class="next-k">What's next</p>
        <ul>
          <li><b>Learn from rejections.</b> Every ignored suggestion carries a reason. The next suggestion should use it.</li>
          <li><b>An "I'm interested" signal,</b> so allocation reflects growth as well as free hours.</li>
          <li><b>Show how fresh progress data is,</b> so a dashboard can't claim 90% done when it's 50%.</li>
          <li><b>Move to semantic tokens,</b> so a theme change is one edit, not a patch.</li>
        </ul>
      </div>

      <a class="next-cs glow reveal" href="/digital-barista.html">
        <span class="next-cs-copy">
          <span class="next-cs-k">Next case study</span>
          <span class="next-cs-t">Ctrl+Alt+<em>Decaf</em></span>
          <span class="next-cs-l">In progress · Research phase. Helping people new to specialty coffee order without having to ask.</span>
          <span class="next-cs-go">Read the case study <span aria-hidden="true">→</span></span>
        </span>
        <img class="next-cs-img" src="/images/barista/wireframe-two-picks.webp" alt="" loading="lazy" width="780" height="1688">
      </a>

      <div class="cs-end reveal">
        <span class="cta-wrap">{PROTO_CTA}</span>
        {f'<a class="link-quiet" href="{LONGFORM}" target="_blank" rel="noopener">Read the full case study</a>' if LONGFORM_PUBLIC else ''}
        <a class="link-quiet" href="/#work">Back to all work</a>
      </div>
      {'<p class="end-note reveal">The full case study covers the design system, the visual evolution and the accessibility audit.</p>' if LONGFORM_PUBLIC else ''}
    </section>
  </main>
'''
_words = len(re.sub(r'<[^>]+>', ' ', MAIN).split())
MAIN = MAIN.replace('{READ}', str(max(1, round(_words / 230))))

s = PAGE.read_text()
s, n = re.subn(r'\n  <main id="main"[^>]*>.*?</main>\n', lambda m: MAIN, s, flags=re.S)
assert n == 1, 'main block not found in velocity-ai.html'
PAGE.write_text(s)
print('written', len(MAIN))
