#!/usr/bin/env python3
"""Editorial edition (exploration): builds the light, magazine-style pages.
   editorial.html (cover + contents), editorial-velocity.html, editorial-decaf.html,
   editorial-collection.html. Shared look lives in src/styles/editorial.css.
   Same content rules as the main site (see CLAUDE.md). Short copy, on purpose."""
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
MAKE = "https://www.figma.com/make/Sho1iwOvhDxAd0g1laSmdW/Velocity-AI?fullscreen=1"
V_NOTION = "https://concrete-dessert-15b.notion.site/Velocity-AI-Full-case-study-414a0e18a1df813cb99cf2b1359d1a88"
D_NOTION = "https://concrete-dessert-15b.notion.site/Ctrl-Alt-Decaf-Case-study-in-progress-414a0e18a1df810586dcfe31695092c4"
RESUME = "/files/Sukriti-Pandey-Resume.pdf"
V = "/images/velocity/v2/"

def page(title, desc, body, here=""):
    def nav(href, label, key):
        cur = ' aria-current="page"' if key == here else ""
        return f'<a href="{href}"{cur}>{label}</a>'
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#F4EFE7">
  <title>{title}</title>
  <meta name="description" content="{desc}">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="stylesheet" href="/src/styles/editorial.css">
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  <header class="bar">
    <a class="bar-logo" href="/editorial.html" aria-label="Sukriti Pandey, cover">SP</a>
    <p class="bar-issue">Issue 04 <span>·</span> Winter 2026 <span>·</span> Hyderabad</p>
    <nav aria-label="Pages">
      {nav("/editorial-velocity.html", "Velocity", "velocity")}
      {nav("/editorial-decaf.html", "Decaf", "decaf")}
      {nav("/editorial-collection.html", "Collection", "collection")}
      <a href="/curator.html" class="hide-sm">Play</a>
      <a href="{RESUME}" target="_blank" rel="noopener" class="bar-cta">Resume</a>
    </nav>
  </header>
  <main id="main">
{body}
  </main>
  <footer class="foot">
    <span>Sukriti Pandey — 2026</span>
    <span>Editorial edition, an exploration. <a href="/">See the gallery edition</a></span>
  </footer>
  <script type="module" src="/src/js/editorial.js"></script>
</body>
</html>
'''

def fig(src, alt, cap="", cls="", w=2000, h=1250, sample=False):
    tag = '<span class="sample">Sample data</span>' if sample else ""
    c = f"<figcaption>{cap}</figcaption>" if cap else ""
    return f'<figure class="fig {cls}">{tag}<img src="{V}{src}" width="{w}" height="{h}" loading="lazy" alt="{alt}">{c}</figure>'

COLOPHON = f'''    <section class="spread colophon" id="contact">
      <p class="folio"><span>¶</span> Colophon</p>
      <h2 class="hed hed--xl">Let’s build something <em>considered.</em></h2>
      <ul class="contact">
        <li><span>Email</span><a href="mailto:sukriti1908@gmail.com">sukriti1908@gmail.com</a></li>
        <li><span>LinkedIn</span><a href="https://www.linkedin.com/in/sukritipandey1908/" target="_blank" rel="noopener">Connect</a></li>
        <li><span>Resume</span><a href="{RESUME}" target="_blank" rel="noopener" download>Download PDF</a></li>
      </ul>
    </section>'''

# ----------------------------------------------------------------- cover ----
HOME = f'''    <section class="cover" id="top">
      <h1 class="masthead" aria-label="Sukriti Pandey"><span>Sukriti</span> <span>Pandey</span></h1>
      <div class="cover-grid">
        <ul class="coverlines coverlines--l">
          <li><a href="/editorial-velocity.html"><b>The capacity issue</b> Velocity AI: AI drafts. People decide.<i>p. 02</i></a></li>
          <li><a href="/editorial-decaf.html"><b>In progress</b> Ctrl+Alt+Decaf, and ordering coffee without the exam.<i>p. 03</i></a></li>
        </ul>
        <figure class="cover-img">
          <img src="{V}sketch-conceptual-model-900.webp" width="900" height="1396" alt="A notebook page of handwritten notes: inputs, employee data, and how an AI would plan a project.">
          <figcaption>On the cover: the notebook page a product started on.</figcaption>
          <p class="cover-title" aria-hidden="true">Chaos,<br><em>but curated.</em></p>
        </figure>
        <ul class="coverlines coverlines--r">
          <li><a href="/editorial-collection.html"><b>The collection</b> Five things I can’t stop looking at.<i>p. 04</i></a></li>
          <li><a href="/curator.html"><b>Play</b> The Curator: three rooms, one card with your name on it.<i>p. 05</i></a></li>
        </ul>
      </div>
      <p class="cover-foot"><span>Product designer</span><span>UX Designer 2, Deloitte</span><span>Open to relocation</span></p>
    </section>

    <section class="spread letter" id="letter">
      <p class="folio"><span>01</span> Editor’s letter</p>
      <div class="letter-grid">
        <h2 class="hed">My brain does not open <em>one tab.</em></h2>
        <div class="letter-body">
          <p class="dropcap">I explore wildly, then build the map. Psychology drew me to UX. Architecture showed me how systems hold together. Fashion taught me that restraint is its own kind of intelligence.</p>
          <p>By day I’m a UX Designer 2 at Deloitte, four and a half years in. I design the thing, build the thing, and stay for the bug reports.</p>
          <p class="signoff">Sukriti</p>
        </div>
        <aside class="letter-side">
          <p class="side-k">The day job, in four lines</p>
          <ul class="dayjob">
            <li><b>Tools</b> that rescue a process from someone’s inbox. Seven live, an eighth in the oven.</li>
            <li><b>Sites</b> for new portfolios, rebrands and firm-wide campaigns. Twenty-odd, and counting politely.</li>
            <li><b>Games</b> for learning, the kind people finish on purpose.</li>
            <li><b>A pipeline</b> from Figma to production, and a weekly session where colleagues find their own uses for AI.</li>
          </ul>
          <p class="side-note">Most of it lives behind a login. <a href="{RESUME}" target="_blank" rel="noopener">The resume has the receipts.</a></p>
        </aside>
      </div>
    </section>

    <section class="spread feature" id="features">
      <p class="folio"><span>02</span> The feature <i>Case study · Self-initiated</i></p>
      <a class="feature-link" href="/editorial-velocity.html">
        <figure class="feature-img">
          <img src="{V}shot-dashboard.webp" width="2000" height="1250" loading="lazy" alt="Velocity AI dashboard showing team capacity, with one person over their weekly hours and an AI suggestion to rebalance.">
          <img class="feature-inset" src="{V}sketch-dashboard-900.webp" width="900" height="611" loading="lazy" alt="The hand-drawn sketch of the same dashboard.">
          <figcaption>Above: the dashboard, sample data. Inset: the same screen, back when it was ink.</figcaption>
        </figure>
        <div class="feature-copy">
          <h2 class="hed hed--xl">AI drafts.<br><em>People decide.</em></h2>
          <div>
            <p class="dek"><b>Velocity AI.</b> A capacity-intelligence tool for teams juggling many projects, designed and prototyped end to end, and four interviews that exposed the problem I hadn’t designed for.</p>
            <p class="tags"><span>AI trust &amp; control</span><span>UX research</span><span>AI-directed prototype</span></p>
            <p class="more">Read the feature <span aria-hidden="true">→</span></p>
          </div>
        </div>
      </a>
    </section>

    <section class="spread decaf" id="decaf">
      <p class="folio"><span>03</span> Work in progress <i>In progress · Research phase</i></p>
      <a class="decaf-link" href="/editorial-decaf.html">
        <div class="decaf-copy">
          <h2 class="hed">Ctrl+Alt+<em>Decaf</em></h2>
          <p class="dek">Help for people who won’t ask. A phone web app that turns a specialty café menu into two picks in plain words, so ordering doesn’t feel like an exam. Research first, this time.</p>
          <div class="menu">
            <p class="menu-k">The menu says</p>
            <p class="menu-a">Attikan Estate, washed, V60 <i>blueberry · floral · bright</i></p>
            <p class="menu-k">In your words</p>
            <p class="menu-b">Light and juicy. More iced tea than cold coffee.</p>
          </div>
          <p class="more">See the work in progress <span aria-hidden="true">→</span></p>
        </div>
        <div class="decaf-phones">
          <img src="/images/barista/wireframe-onboarding.webp" alt="Lo-fi wireframe: onboarding.">
          <img src="/images/barista/wireframe-two-picks.webp" alt="Lo-fi wireframe: two picks in plain words.">
          <img src="/images/barista/wireframe-check-in.webp" alt="Lo-fi wireframe: check-in after ordering.">
        </div>
      </a>
    </section>

    <section class="spread duo">
      <a class="duo-card" href="/editorial-collection.html">
        <p class="folio"><span>04</span> The collection</p>
        <h2 class="hed">Five things I can’t stop <em>looking at.</em></h2>
        <p class="dek">A fossilised gift box, a roof pretending to be a tent, a church running fashionably late.</p>
        <p class="more">Walk the room <span aria-hidden="true">→</span></p>
      </a>
      <a class="duo-card duo-card--ink" href="/curator.html">
        <p class="folio"><span>05</span> The games page</p>
        <h2 class="hed">The <em>Curator</em></h2>
        <p class="dek">Three rooms, three briefs. It scores your layout, reads how you decide, and hands you a card to prove it.</p>
        <p class="more">Play on your phone <span aria-hidden="true">→</span></p>
      </a>
    </section>

{COLOPHON}'''

# -------------------------------------------------------------- velocity ----
def q(role, quote, changed):
    return f'<li><span class="q-role">{role}</span><blockquote>“{quote}”</blockquote><p><b>So I</b> {changed}</p></li>'
def pat(n, t, d):
    return f'<li><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></li>'
def row(a, b, c):
    return f'<tr><th scope="row">{a}</th><td>{b}</td><td>{c}</td></tr>'

VELOCITY = f'''    <section class="case-cover">
      <p class="folio"><span>02</span> The feature <i>Case study · Self-initiated · 4 min read</i></p>
      <div class="case-top">
        <div>
          <h1 class="hed hed--xl">AI drafts.<br><em>People decide.</em></h1>
          <p class="dek dek--wide"><b>Velocity AI.</b> Capacity intelligence that shows a team lead who can take on more work, before anyone is promised to anything.</p>
          <p class="links"><a class="btn" href="{MAKE}" target="_blank" rel="noopener">Try the prototype <span aria-hidden="true">↗</span></a><a class="more" href="{V_NOTION}" target="_blank" rel="noopener">The long read, in Notion <span aria-hidden="true">↗</span></a></p>
        </div>
        <dl class="credits">
          <div><dt>Role</dt><dd>Concept, research, product design, AI-directed prototype</dd></div>
          <div><dt>Idea partner</dt><dd>Anant Mishra, early conversations</dd></div>
          <div><dt>When</dt><dd>Feb–Mar 2026, refreshed Oct 2026</dd></div>
          <div><dt>Research</dt><dd>Four interviews: delivery, audit, product, UX</dd></div>
          <div><dt>Made in</dt><dd>Figma Make, by iterative prompting</dd></div>
        </dl>
      </div>
      {fig("shot-dashboard.webp", "Velocity AI dashboard: team capacity, with one person over their weekly hours and an AI suggestion to rebalance.", "The manager’s dashboard. One person is carrying 48 hours of a 40-hour week.", "fig--hero", sample=True)}
    </section>

    <section class="spread">
      <p class="folio"><span>i</span> The problem</p>
      <div class="cols">
        <h2 class="hed">Four projects. A teammate had <em>one.</em></h2>
        <div class="prose">
          <p>It began as a chat with Anant about measuring the return on AI spend. You can’t measure that without knowing where time goes, which led straight to a problem I was living in: work assigned on gut feel, and nobody able to see who had room.</p>
          <div class="versus">
            <p><b>Project tracking asks</b> What work exists? <i>Answered well, by tools and spreadsheets.</i></p>
            <p><b>Capacity asks</b> Can we actually take this on? <i>Answered by nobody. It lives in a lead’s head.</i></p>
          </div>
        </div>
      </div>
    </section>

    <section class="spread tint">
      <p class="folio"><span>ii</span> Research</p>
      <h2 class="hed">Four interviews. Each one <em>moved</em> something.</h2>
      <ul class="quotes">
        {q("Senior delivery professional", "You see yourself doing the same kind of work because only the same two, three people see your availability.", "kept a human in every loop, and put an “I’m interested” signal on the roadmap.")}
        {q("Audit director", "Somebody would have to key in something.", "redesigned onboarding around getting data in with almost no effort.")}
        {q("Product manager", "It’s just that I’m not the ICP for that.", "narrowed the audience to teams that allocate people across many projects.")}
        {q("UX director", "Most of the time service-based companies tend to run over-utilized.", "stopped claiming it predicts every risk. It shows the effect of a change.")}
      </ul>
    </section>

    <section class="spread">
      <p class="folio"><span>iii</span> Sketch to system</p>
      <div class="cols cols--img">
        {fig("sketch-conceptual-model-900.webp", "The first conceptual model, handwritten in a notebook.", "The whole product, on one page of a notebook.", "fig--paper", 900, 1396)}
        <div class="prose">
          <h2 class="hed">It started on <em>paper.</em></h2>
          <p>One loop holds everything. Nothing moves until the lead has edited the plan and chosen to commit.</p>
          <ol class="loop"><li>Describe a project</li><li>AI drafts the tasks</li><li>AI recommends people</li><li>Lead edits</li><li>Commit</li></ol>
          <p class="math"><b>40h</b> available. Sarah has <b>48h</b>. <span>The AI suggests moving 8 hours of QA to Alex, and shows the maths before anyone says yes. Sample data.</span></p>
        </div>
      </div>
    </section>

    <section class="spread tint">
      <p class="folio"><span>iv</span> Onboarding</p>
      <h2 class="hed">The assumption research <em>broke.</em></h2>
      <p class="dek dek--wide">I assumed teams would arrive through Jira. Then an audit director asked who would key the data in. The hard problem was never the dashboard.</p>
      <div class="ba">
        {fig("sketch-login-jira-first-900.webp", "Early sketch assuming login through a project tool.", "Before: one door, and it needed Jira.", "fig--paper", 900, 589)}
        {fig("shot-onboarding-add-team.webp", "Onboarding screen: add the team, or skip and come back.", "After: five ways in. Only one needs a project tool.", sample=True)}
      </div>
    </section>

    <section class="spread">
      <p class="folio"><span>v</span> Trust</p>
      <h2 class="hed">AI assists. A human <em>decides.</em></h2>
      <div class="shots3">
        {fig("shot-ai-card-collapsed.webp", "AI suggestion card with Review and Ignore.", "1 · Review or Ignore. Never Apply.", sample=True)}
        {fig("shot-ai-card-impact-panel.webp", "Impact panel showing hours before and after.", "2 · The maths before the decision.", sample=True)}
        {fig("shot-ai-applied.webp", "Applied change with an Undo.", "3 · Applied, with an Undo.", sample=True)}
      </div>
      <ol class="patterns">
        {pat("a", "Impact before Apply", "What, why, impact, then decide. Apply lives only inside the impact panel.")}
        {pat("b", "Confidence on every number", "No score appears alone. The confidence sits beside it like a quiet footnote.")}
        {pat("c", "Leads set the volume", "Each team chooses when the AI speaks up.")}
        {pat("d", "It refuses thin input", "A confident plan built on fifty characters is worse than no plan.")}
        {pat("e", "It says when it isn’t sure", "Below 70%, Apply becomes Apply anyway. With no data, it says so.")}
        {pat("f", "The AI recommends. The lead selects.", "Skill and availability, side by side. Nothing commits itself.")}
      </ol>
    </section>

    <section class="spread tint">
      <p class="folio"><span>vi</span> Decisions</p>
      <h2 class="hed">Four decisions, and what each <em>cost.</em></h2>
      <table class="dtable">
        <thead><tr><th scope="col">Decision</th><th scope="col">Why</th><th scope="col">The price</th></tr></thead>
        <tbody>
          {row("Plan before you commit", "Capacity is most useful before work is promised.", "An extra step before execution.")}
          {row("Roles belong to teams", "One person can lead one team and contribute on another.", "A team switcher, not a simple toggle.")}
          {row("Hours, not task counts", "Fifteen small tasks can be lighter than two large ones.", "Every task needs an estimate.")}
          {row("No monitoring", "It must not feel like surveillance.", "Less data for the AI to learn from.")}
        </tbody>
      </table>
    </section>

    <section class="spread">
      <p class="folio"><span>vii</span> Reflections</p>
      <h2 class="hed">What I’d tell myself in <em>February.</em></h2>
      <ol class="refl">
        <li><h3>Validate the edges, not just the core.</h3><p>The interviews left the core alone and exposed what I’d missed: how the data gets in.</p></li>
        <li><h3>Data needs a counterweight.</h3><p>Showing availability speeds up allocation. It can also keep sending the same people the same work.</p></li>
        <li><h3>Directing AI is still design.</h3><p>I didn’t draw these screens by hand. The decisions lived in the briefs, through six rounds.</p></li>
      </ol>
      <p class="links"><a class="btn" href="{MAKE}" target="_blank" rel="noopener">Try the prototype <span aria-hidden="true">↗</span></a><a class="more" href="{V_NOTION}" target="_blank" rel="noopener">The long read, in Notion <span aria-hidden="true">↗</span></a></p>
    </section>

    <section class="spread nextup">
      <a href="/editorial-decaf.html"><p class="folio"><span>→</span> Next <i>In progress · Research phase</i></p><h2 class="hed hed--xl">Ctrl+Alt+<em>Decaf</em></h2><p class="dek">Ordering coffee shouldn’t feel like an oral exam.</p></a>
    </section>'''

# ----------------------------------------------------------------- decaf ----
def sig(a, quote, c):
    return f'<li><span class="q-role">{a}</span><blockquote>“{quote}”</blockquote><p><b>So</b> {c}</p></li>'

DECAF = f'''    <section class="case-cover">
      <p class="folio"><span>03</span> Work in progress <i>In progress · Research phase · 3 min read</i></p>
      <div class="case-top">
        <div>
          <h1 class="hed hed--xl">Ctrl+Alt+<em>Decaf</em></h1>
          <p class="dek dek--wide">Ordering coffee shouldn’t feel like an oral exam. <span class="wt">Working title.</span></p>
          <p class="links"><a class="more" href="{D_NOTION}" target="_blank" rel="noopener">The full write-up, in Notion <span aria-hidden="true">↗</span></a></p>
        </div>
        <dl class="credits">
          <div><dt>Role</dt><dd>Solo: research, product design, build</dd></div>
          <div><dt>Platform</dt><dd>Phone web app from a table QR code. No download.</dd></div>
          <div><dt>When</dt><dd>Oct 2026, ongoing</dd></div>
          <div><dt>Stage</dt><dd>Discover now. Lo-fi started. Café test to come.</dd></div>
        </dl>
      </div>
    </section>

    <section class="spread">
      <p class="folio"><span>i</span> The insight</p>
      <div class="cols">
        <h2 class="hed">The barrier isn’t information. It’s <em>asking.</em></h2>
        <div class="prose">
          <p>Specialty menus assume you already speak coffee: estates, processes, tasting notes. Beginners feel judged asking, so they order the hazelnut latte, or guess.</p>
          <p>I still ask the barista what they’d recommend. Tasting notes confuse me too. You can love blueberries and hate blueberry coffee.</p>
        </div>
      </div>
    </section>

    <section class="spread tint">
      <p class="folio"><span>ii</span> The idea</p>
      <div class="cols cols--phones">
        <div class="prose">
          <h2 class="hed">Two picks, in <em>plain words.</em></h2>
          <p>Scan the QR on the table, say what you usually drink, get a safe pick and a stretch pick from today’s menu. A two-tap check-in after the cup makes the next one better.</p>
          <div class="menu">
            <p class="menu-k">The menu says</p>
            <p class="menu-a">Attikan Estate, washed, V60 <i>blueberry · floral · bright</i></p>
            <p class="menu-k">In your words</p>
            <p class="menu-b">Light and juicy. More iced tea than cold coffee.</p>
          </div>
        </div>
        <div class="decaf-phones">
          <img src="/images/barista/wireframe-onboarding.webp" alt="Lo-fi wireframe: one onboarding question.">
          <img src="/images/barista/wireframe-two-picks.webp" alt="Lo-fi wireframe: two picks, safe and stretch.">
          <img src="/images/barista/wireframe-check-in.webp" alt="Lo-fi wireframe: two-tap check-in.">
        </div>
      </div>
      <p class="cap-line">Lo-fi wireframes. Grayscale first; the design system arrives when the research says what it needs.</p>
    </section>

    <section class="spread">
      <p class="folio"><span>iii</span> Decisions so far</p>
      <h2 class="hed">Small rules, <em>strongly brewed.</em></h2>
      <ol class="patterns">
        {pat("a", "No prompt needed", "Scan, one tap, two picks. Good help shouldn’t require knowing what to ask.")}
        {pat("b", "One question", "“What do you usually order?” It starts from what people already know.")}
        {pat("c", "Always two picks", "Safe and stretch. A miss is part of the experiment, not a failure.")}
        {pat("d", "Notes, translated", "Into food memories: jamun, jaggery, filter coffee.")}
        {pat("e", "A two-tap check-in", "The tone: come back and we’ll explore together.")}
        {pat("f", "Why not a chatbot?", "Picks come from this café’s menu, today. No general chatbot has that.")}
      </ol>
    </section>

    <section class="spread tint">
      <p class="folio"><span>iv</span> Early signals <i>Signals to check, not findings</i></p>
      <h2 class="hed">What a café co-founder in Chennai hears at the <em>counter.</em></h2>
      <ul class="quotes">
        {sig("The decision gets handed over", "A lot of them just end up asking ‘what do you recommend?’", "the app gives the recommendation people would otherwise ask a stranger for.")}
        {sig("People start from the familiar", "Most people look for something familiar first, like a cappuccino or a cold coffee.", "the first question stays “what do you usually drink?”")}
        {sig("The words that trip people", "Some don’t know what a specific processing is, like a washed, natural or honey… or a thermal shock.", "the glossary covers processing, not just flavours.")}
        {sig("Curiosity is invited, never pushed", "I don’t force anyone to get into specialty coffee… Once they ask a question, we go on explaining.", "the stretch pick reads as an invitation, and the safe pick is always there.")}
      </ul>
      <p class="cap-line">The conversations have started. Each point is a signal to test against the next ones.</p>
    </section>

    <section class="spread">
      <p class="folio"><span>v</span> What’s next</p>
      <div class="cols">
        <h2 class="hed">Research first, <em>this time.</em></h2>
        <div class="prose">
          <p>My last project taught me to validate before I build. So before anything grows, the flow gets tested in a café with five or six beginners.</p>
          <p class="side-k">What I’ll watch for (hypotheses, not results)</p>
          <ul class="ticks"><li>A first-timer orders without asking “what do you recommend?”</li><li>Some choose the stretch pick, and the check-in comes back “just right”.</li><li>Baristas notice better questions at the counter.</li></ul>
          <p class="links"><a class="more" href="{D_NOTION}" target="_blank" rel="noopener">The full write-up, in Notion <span aria-hidden="true">↗</span></a></p>
        </div>
      </div>
    </section>

    <section class="spread nextup">
      <a href="/editorial-collection.html"><p class="folio"><span>→</span> Next</p><h2 class="hed hed--xl">The <em>collection</em></h2><p class="dek">Five things I can’t stop looking at.</p></a>
    </section>'''

# ------------------------------------------------------------ collection ----
def plate(n, cls, title, maker, meta, note, link="", linktext="See the work"):
    l = f'<a class="more" href="{link}" target="_blank" rel="noopener">{linktext} <span aria-hidden="true">↗</span></a>' if link else ""
    return f'''<li class="plate {cls}">
          <div class="plate-art" aria-hidden="true"><span>{n}</span></div>
          <div class="plate-label">
            <p class="plate-no">No. {n}</p>
            <h2>{title}</h2>
            <p class="plate-maker">{maker}</p>
            <p class="plate-meta">{meta}</p>
            <p class="plate-note">{note}</p>
            {l}
          </div>
        </li>'''

COLLECTION = f'''    <section class="case-cover">
      <p class="folio"><span>04</span> The collection <i>Hung, not ranked</i></p>
      <h1 class="hed hed--xl">Five things I can’t stop <em>looking at.</em></h1>
      <p class="dek dek--wide">Not all of it is art. Some of it is a roof. All of it changed how I look at a screen.</p>
    </section>
    <section class="spread wall">
      <ol class="plates">
        {plate("01", "p-box", "Bronze Eroded Tiffany Blue Box", "Daniel Arsham × Tiffany &amp; Co.", "Sculpture · 2021", "The most recognisable box in retail, shown as if it had been dug up centuries from now. It breaks the box, literally. Packaging as fossil.")}
        {plate("02", "p-roof", "Olympiapark roof", "Frei Otto with Behnisch &amp; Partner", "Architecture · Munich · 1972", "A stadium roof that behaves like a tent. Structure doing the least it can and getting away with it.")}
        {plate("03", "p-nave", "Sagrada Família", "Antoni Gaudí", "Architecture · Barcelona · begun 1882", "Columns that branch like trees, light that arrives in colour. Also the world’s most patient deadline.")}
        {plate("04", "p-fold", "SFMOMA, the rippled façade", "Snøhetta", "Architecture · San Francisco · 2016", "A building that looks like fog had a good idea. Quiet from far away, restless up close.")}
        {plate("05", "p-lost", "Untitled (I forgot the title)", "Seen at SFMOMA", "Name misplaced · impression intact", "One piece stopped me in the gallery and I didn’t photograph the label. Rookie curator error. This wall is holding its place.")}
      </ol>
      <p class="cap-line">Images to come. Until then the labels do the talking, which is very on brand for a wall label.</p>
    </section>
    <section class="spread nextup nextup--ink">
      <a href="/curator.html"><p class="folio"><span>→</span> Next</p><h2 class="hed hed--xl">The <em>Curator</em></h2><p class="dek">Enough looking. Your turn to hang something.</p></a>
    </section>'''

PAGES = {
    "editorial.html": ("Sukriti Pandey — The editorial edition", "A light, magazine-editorial edition of Sukriti Pandey's portfolio.", HOME, ""),
    "editorial-velocity.html": ("Velocity AI — AI drafts. People decide. · Sukriti Pandey", "Velocity AI case study, editorial edition.", VELOCITY, "velocity"),
    "editorial-decaf.html": ("Ctrl+Alt+Decaf — In progress · Sukriti Pandey", "Ctrl+Alt+Decaf, in progress. Editorial edition.", DECAF, "decaf"),
    "editorial-collection.html": ("The collection — Sukriti Pandey", "Five things Sukriti Pandey can't stop looking at.", COLLECTION, "collection"),
}
for name, (t, d, body, here) in PAGES.items():
    (ROOT / name).write_text(page(t, d, body, here))
    print("wrote", name)
