"""Generates the <main> of velocity-ai.html (v2 spec, Oct 2026).
Image slots reference /images/velocity/v2/<asset>.webp; run scripts/velocity_assets.py
to convert dropped-in files and stamp real width/height into the page."""
import re, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / 'velocity-ai.html'
PROTO = 'https://www.figma.com/make/Sho1iwOvhDxAd0g1laSmdW/Velocity-AI?fullscreen=1'
LONGFORM = 'https://claude.ai/artifact/MZtPGgcvskxHiSCginxVDQ'

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

def img(asset, alt, sample=False, sizes='(max-width: 860px) 92vw, 55vw', cls='', caption=None, eager=False):
    w, h = size_of(asset)
    tag = '<span class="sample-tag">Sample data</span>' if sample else ''
    cap = f'<figcaption>{caption}</figcaption>' if caption else ''
    load = '' if eager else ' loading="lazy"'
    return (f'<figure class="shot {cls}" data-zoom data-asset="{asset}">{tag}'
            f'<img srcset="/images/velocity/v2/{asset}-900.webp 900w, /images/velocity/v2/{asset}.webp {w}w" '
            f'sizes="{sizes}" src="/images/velocity/v2/{asset}.webp" alt="{html.escape(alt)}"{load} '
            f'decoding="async" width="{w}" height="{h}">{cap}</figure>')

MAIN = f'''
  <main id="main">

    <!-- 1 · Cover + metadata (one screen) -->
    <header class="cs-cover" data-light="warm">
      <p class="cs-kicker">Case study 01 — Self-initiated design exploration</p>
      <h1 class="display cs-title">
        <span class="line-mask"><span>Velocity</span></span>
        <span class="line-mask"><span><em>AI</em></span></span>
      </h1>
      <p class="cs-lede">Capacity intelligence that shows a team lead who can take on more work, before anyone is committed to it.</p>
      <div class="cs-ctas">
        <a class="btn-pill" href="{PROTO}" target="_blank" rel="noopener">Try the prototype</a>
        <a class="link-quiet" href="#problem">Read the story</a>
      </div>
      <dl class="meta-row">
        <div><dt>Role</dt><dd>Product concept, user research, product design, AI-directed prototype — end to end</dd></div>
        <div><dt>Idea partner</dt><dd>Anant Mishra, early conversations</dd></div>
        <div><dt>Timeline</dt><dd>Feb–Mar 2026, visual refresh Oct 2026</dd></div>
        <div><dt>Research</dt><dd>4 interviews: delivery, audit, product, UX</dd></div>
        <div><dt>Tools</dt><dd>Figma Make, iterative prompting</dd></div>
      </dl>
    </header>

    <!-- 2 · The problem -->
    <section class="room" id="problem" data-light="near">
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

    <!-- 3 · Sketch to system -->
    <section class="room" id="system" data-light="cool">
      <p class="label reveal">02 — Sketch → system</p>
      <div class="split">
        {img('sketch-conceptual-model', 'Notebook sketch of the conceptual model: inputs feed a synthesis step, which feeds Plan My Project and the capacity engine', cls='reveal', caption='The first conceptual model, in a notebook')}
        <div>
          <h2 class="h2 reveal d1">It started <em>on paper.</em></h2>
          <p class="body reveal d2">One loop holds the whole product. A lead describes a project, the AI drafts the tasks and recommends people, and nothing moves until the lead has edited the plan and chosen to commit it.</p>
          <ol class="loop reveal d3" aria-label="The core loop">
            <li>Describe a project</li><li>AI drafts tasks</li><li>AI recommends people</li><li>Lead edits</li><li>Commit</li>
          </ol>
        </div>
      </div>
    </section>

    <!-- 4 · Research -->
    <section class="room" id="research" data-light="reading">
      <p class="label reveal">03 — Research</p>
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

    <!-- 5 · AI trust and control (centrepiece) -->
    <section class="room" id="trust" data-light="focus">
      <p class="label reveal">04 — AI trust and control</p>
      <div class="trust-head">
        <h2 class="h2 reveal d1">AI assists. <em>A human decides.</em></h2>
        <p class="body reveal d2">Velocity's AI plans projects and recommends people. Every output is designed to be checked by a person before it changes anything. Five patterns carry that principle.</p>
      </div>

      <article class="pattern pattern--wide reveal">
        <div class="pattern-copy">
          <span class="pattern-n">a</span>
          <h3 class="h3">Impact <em>before</em> Apply.</h3>
          <p class="body">Each suggestion reads what → why → impact → decide. Review opens an impact panel: people and projects affected, hours moved, the effect on the timeline, a risk level. Apply lives only inside that panel. There is no way to act on a suggestion without seeing what it does.</p>
        </div>
        <div class="pair">
          {img('shot-ai-card-collapsed', 'A collapsed AI suggestion card with a High confidence pill, a category edge, a two-line reason, and Review and Ignore buttons', sample=True, caption='Collapsed: Review or Ignore, never Apply')}
          {img('shot-ai-card-impact-panel', 'The suggestion expanded into an impact analysis panel listing people and projects affected, hours moved, timeline effect and risk, with Apply inside it', sample=True, caption='Expanded: the consequences, then Apply')}
        </div>
      </article>

      <article class="pattern reveal">
        {img('shot-plan-step1-tasks', 'Plan My Project, step one: AI-generated tasks with hour estimates, and a feasibility score shown beside the model’s confidence')}
        <div class="pattern-copy">
          <span class="pattern-n">b</span>
          <h3 class="h3">Confidence on <em>every</em> AI number.</h3>
          <p class="body">Scores never appear alone: <span class="mono">Feasibility 87 · Model confidence 91%</span>. The confidence sits beside the number as a quiet footnote, not a headline.</p>
        </div>
      </article>

      <article class="pattern pattern--flip reveal">
        {img('shot-ai-thresholds', 'AI Thresholds settings: flag tasks below 70% confidence, warn on health below 60, treat a delay over 7 days as a risk')}
        <div class="pattern-copy">
          <span class="pattern-n">c</span>
          <h3 class="h3">Leads set when the AI <em>speaks up.</em></h3>
          <p class="body">Flag anything under 70% confidence, warn below a health score of 60, treat a seven-day slip as risk. A team tunes the system to its own tolerance instead of accepting mine.</p>
        </div>
      </article>

      <article class="pattern reveal">
        {img('shot-thin-input-refusal', 'Plan My Project declining a too-short description with the message "Need more data to run this request" and an option to upload a requirements document')}
        <div class="pattern-copy">
          <span class="pattern-n">d</span>
          <h3 class="h3">It refuses <em>thin input.</em></h3>
          <p class="body">Under 50 characters, Plan My Project says "Need more data to run this request" and asks for a requirements document instead. A confident plan built on too little is worse than no plan.</p>
        </div>
      </article>

      <article class="pattern pattern--flip reveal">
        {img('shot-empty-insights', 'The AI Insights panel on an empty workspace reading "No insights yet. Insights will appear as your team data grows."')}
        <div class="pattern-copy">
          <span class="pattern-n">e</span>
          <h3 class="h3">It admits it <em>doesn't know yet.</em></h3>
          <p class="body">An earlier version showed sample insights about named people on an empty workspace. On a real team, invented insights would cost trust on day one. Now the panel just says so.</p>
        </div>
      </article>

      <div class="reasoning reveal" aria-label="Staged reasoning lines that replace the loading spinner">
        <p class="reasoning-k">And no spinner. While it works, the AI says what it's weighing:</p>
        <ol><li>Analyzing similar projects…</li><li>Mapping task structure…</li><li>Simulating capacity constraints…</li><li>Evaluating feasibility…</li></ol>
      </div>

      <div class="support reveal">
        {img('shot-plan-step2-allocate', 'Plan My Project, step two: recommended people with skill match and availability; Commit Project stays disabled until the lead selects someone', sample=True, sizes='(max-width: 860px) 92vw, 70vw')}
        <p class="support-cap"><b>The AI recommends. The lead selects.</b> Commit Project stays blocked until someone is chosen.</p>
      </div>
    </section>

    <!-- 6 · Onboarding -->
    <section class="room" id="onboarding" data-light="cool">
      <p class="label reveal">05 — Onboarding</p>
      <h2 class="h2 reveal d1 narrow-title">The assumption <em>the research broke.</em></h2>
      <div class="ba reveal">
        <div><span class="ba-k">Before</span>{img('sketch-login-jira-first', 'Notebook sketch of the first login: product features beside a Jira and Asana sign-in', caption='Assumed teams would arrive through Jira')}</div>
        <div><span class="ba-k ba-k--after">After</span>{img('diagram-onboarding-five-paths', 'Diagram of five onboarding paths: email signup with a new team, invite code, email invite, connecting a project tool, and adding another team later', caption='Five ways in')}</div>
      </div>
      <p class="pull reveal">The hard design problem wasn't the dashboard. <em>It was who keys the data in.</em></p>
      <div class="pair pair--loose reveal">
        {img('shot-onboarding-add-team', 'Onboarding step to add a team: a table of name, email, role and skills, with Import from CSV and a skip option', sample=True, caption='Add the team, or skip and come back')}
        {img('shot-create-team-paste-ai-skills', 'Create a team by pasting rows from a spreadsheet; the AI suggests skills from each role for the lead to edit before saving', sample=True, caption='Paste from a spreadsheet; AI drafts the skills, the lead checks them')}
      </div>
    </section>

    <!-- 7 · Key decisions -->
    <section class="room" id="decisions" data-light="near">
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

    <!-- 8 · Sketches beside final screens -->
    <section class="room" id="evolution" data-light="cool">
      <p class="label reveal">07 — Notebook to screen</p>
      <h2 class="h2 reveal d1 narrow-title">Same idea, <em>fewer crossings-out.</em></h2>
      <div class="ss reveal">
        {img('sketch-dashboard', 'Notebook sketch of the manager dashboard with a capacity formula', sizes='(max-width: 860px) 45vw, 30vw')}
        {img('shot-dashboard', 'The final manager dashboard: KPI cards, capacity by person and week, deadlines and AI insights', sample=True)}
        <p class="ss-cap">Manager dashboard</p>
      </div>
      <div class="ss reveal">
        {img('sketch-timesheet', 'Notebook sketch of a timesheet with a time block', sizes='(max-width: 860px) 45vw, 30vw')}
        {img('shot-employee-time', 'The employee Time area: timesheets, leave and company holidays in three tabs', sample=True)}
        <p class="ss-cap">Employee time</p>
      </div>
      <div class="ss reveal">
        {img('sketch-roles-flow', 'Notebook sketch of the roles flow: a user becomes a manager, an employee or an individual contributor', sizes='(max-width: 860px) 45vw, 30vw')}
        {img('shot-people-drawer', 'People and capacity with a person’s side drawer open: four-week capacity, projects, skills and AI recommendations', sample=True)}
        <p class="ss-cap">People and roles</p>
      </div>
    </section>

    <!-- 9 · Reflections + next -->
    <section class="room" id="reflections" data-light="quiet">
      <p class="label reveal">08 — Reflections</p>
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

      <div class="cs-end reveal">
        <a class="btn-pill" href="{PROTO}" target="_blank" rel="noopener">Try the prototype</a>
        <a class="link-quiet" href="{LONGFORM}" target="_blank" rel="noopener">Read the full case study</a>
        <a class="link-quiet" href="/#work">Back to all work</a>
      </div>
      <p class="end-note reveal">The full case study covers the design system, the visual evolution and the accessibility audit.</p>
    </section>
  </main>
'''

s = PAGE.read_text()
s = re.sub(r'\n  <main id="main">.*?</main>\n', MAIN, s, flags=re.S)
PAGE.write_text(s)
print('written', len(MAIN))
