#!/usr/bin/env python3
"""Editorial edition (exploration): builds the light, magazine-style pages.
   editorial.html (cover + how I think), editorial-velocity.html, editorial-decaf.html.
   The collection and the Curator belong to the Experience edition only (her split, Nov 2026). Shared look lives in src/styles/editorial.css.
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
    <a class="bar-logo" href="/editorial.html" aria-label="Sukriti Pandey, cover">Sukriti</a>
    <p class="bar-issue">Folio — Edition 04 <span>·</span> <span data-clock>Hyderabad</span></p>
    <nav aria-label="Pages">
      {nav("/editorial-velocity.html", "Velocity", "velocity")}
      {nav("/editorial-decaf.html", "Decaf", "decaf")}
      <a href="/editorial.html#letter" class="hide-sm">How I think</a>
      <a href="{RESUME}" target="_blank" rel="noopener" class="bar-cta">Resume</a>
    </nav>
  </header>
  <div class="rail" aria-hidden="true"><span data-rail>Sukriti Pandey · Folio — Edition 04</span></div>
  <main id="main">
{body}
  </main>
  <footer class="foot">
    <span>Sukriti Pandey — 2026</span>
    <span>The reading edition. <a href="/#top">Experience it instead</a></span>
  </footer>
  <script type="module" src="/src/js/editorial.js"></script>
</body>
</html>
'''

def fig(src, alt, cap="", cls="", w=2000, h=1250, sample=False):
    tag = '<span class="sample">Sample data</span>' if sample else ""
    c = f"<figcaption>{cap}</figcaption>" if cap else ""
    return f'<figure class="fig {cls}">{tag}<img src="{V}{src}" width="{w}" height="{h}" loading="lazy" alt="{alt}">{c}</figure>'

COLOPHON = f'''    <section class="next" id="contact" data-chapter="Next chapter">
      <p class="ch">Next chapter</p>
      <h2 class="next-h">Next<br>chapter</h2>
      <div class="next-row">
        <p class="next-p">Hiring a senior product designer, or just want to argue about type? Either is a good start.</p>
        <ul class="contact">
          <li><span>Email</span><a href="mailto:sukriti1908@gmail.com">sukriti1908@gmail.com</a></li>
          <li><span>LinkedIn</span><a href="https://www.linkedin.com/in/sukritipandey1908/" target="_blank" rel="noopener">Connect</a></li>
          <li><span>Resume</span><a href="{RESUME}" target="_blank" rel="noopener" download>Download PDF</a></li>
        </ul>
      </div>
    </section>'''

# ----------------------------------------------------------------- cover ----
HOME = f'''    <section class="cv" id="top" data-chapter="Sukriti Pandey · Folio — Edition 04">
      <div class="cv-main">
        <h1 class="cv-h" aria-label="Sukriti Pandey"><span>Sukriti</span><span>Pandey</span></h1>
        <p class="cv-meta"><span>Product designer · Hyderabad</span><a href="#work">The work, first <span aria-hidden="true">↓</span></a></p>
      </div>
      <aside class="cv-panel">
        <img src="/images/life/sculpture-red-900.webp" width="900" height="1599" alt="A tall stack of glossy red pillow-shaped sculptures between glass towers at night.">
        <div class="cv-copy">
          <p class="cv-line">I explore like there’s no map. <em>I ship like there is one.</em></p>
          <p class="cv-sub">UX Designer 2 at Deloitte. Four and a half years taking work from research to production.</p>
        </div>
      </aside>
    </section>

    <section class="work" id="work" data-chapter="Chapter I · The work">
      <p class="ch">Chapter I</p>
      <h2 class="work-h"><span>The</span>
        <span class="work-tiles" aria-hidden="true">
          <img src="{V}shot-dashboard-900.webp" alt=""><img src="{V}sketch-dashboard-900.webp" alt="">
          <img src="/images/barista/wireframe-two-picks.webp" alt=""><img src="{V}shot-ai-card-impact-panel-900.webp" alt="">
        </span><span>Work</span></h2>
    </section>

    <section class="entry" data-chapter="Chapter I · Velocity AI">
      <a class="entry-link" href="/editorial-velocity.html">
        <div class="entry-top">
          <div><h3 class="entry-t">Velocity AI</h3><p class="entry-m">Self-initiated · 2026<br>Concept, research, product design<br>AI-directed prototype</p></div>
          <p class="entry-p">Four projects. A teammate had one. Nobody could see it. A capacity tool where AI drafts the plan and a lead decides, and four interviews that exposed the problem I hadn’t designed for.</p>
        </div>
        <div class="entry-imgs">
          <figure class="e1"><img src="{V}shot-dashboard-900.webp" width="900" height="563" loading="lazy" alt="Velocity AI dashboard with team capacity and an AI suggestion."><figcaption>01 · Dashboard, sample data</figcaption></figure>
          <figure class="e2"><img src="{V}sketch-dashboard-900.webp" width="900" height="611" loading="lazy" alt="The same dashboard, hand-drawn."><figcaption>02 · The same screen, in ink</figcaption></figure>
          <figure class="e3"><img src="{V}shot-ai-card-impact-panel-900.webp" width="900" height="563" loading="lazy" alt="Impact panel showing hours before and after a change."><figcaption>03 · The maths before the decision</figcaption></figure>
        </div>
        <p class="more">Read the case study <span aria-hidden="true">→</span></p>
      </a>
    </section>

    <section class="entry entry--dark" data-chapter="Chapter I · Ctrl+Alt+Decaf">
      <a class="entry-link" href="/editorial-decaf.html">
        <div class="entry-top">
          <div><h3 class="entry-t">Ctrl+Alt+<em>Decaf</em></h3><p class="entry-m">In progress · Research phase<br>Solo: research, design, build<br>Phone web app</p></div>
          <p class="entry-p">Help for people who won’t ask. A specialty café menu, turned into two picks in plain words, so ordering doesn’t feel like an exam. Research first, this time.</p>
        </div>
        <div class="entry-imgs entry-imgs--phones">
          <figure><img src="/images/barista/wireframe-onboarding.webp" loading="lazy" alt="Lo-fi wireframe: one onboarding question."><figcaption>01 · One question</figcaption></figure>
          <figure><img src="/images/barista/wireframe-two-picks.webp" loading="lazy" alt="Lo-fi wireframe: two picks, safe and stretch."><figcaption>02 · Two picks</figcaption></figure>
          <figure><img src="/images/barista/wireframe-check-in.webp" loading="lazy" alt="Lo-fi wireframe: a two-tap check-in."><figcaption>03 · A two-tap check-in</figcaption></figure>
        </div>
        <p class="more">See the work in progress <span aria-hidden="true">→</span></p>
      </a>
    </section>

    <section class="think" id="letter" data-chapter="Chapter II · How I think">
      <p class="ch">Chapter II</p>
      <div class="think-grid">
        <h2 class="think-h">I joined as a developer and kept asking why.</h2>
        <div class="think-body">
          <p>Why a process lived in six inboxes. Why the tool everyone needed was a spreadsheet nobody trusted. At some point I was allowed to fix the why, and that became the job.</p>
          <p>Now I take the messy, manual thing a team has quietly put up with and turn it into something they open without being told to. I design it, direct the build, and stay after launch, because that’s when real people get their hands on it.</p>
          <p>It’s why I build learning games people finish on purpose, and why my Fridays go to helping colleagues, most of them nowhere near tech, find their own uses for AI.</p>
        </div>
      </div>
      <figure class="think-fig"><img src="/images/life/mirror-crop-900.webp" width="900" height="309" loading="lazy" alt="Sukriti taking a mirror photo in a café; the mirror reads ‘Sorry for what I said before this coffee!’"><figcaption>The editor, before her coffee.</figcaption></figure>
      <blockquote class="think-q">What I enjoy most is the question underneath every interface: what makes someone <em>actually</em> finish, adopt, or change how they work?</blockquote>
    </section>

    <section class="look" id="look" data-chapter="Chapter II · What I look at">
      <div class="look-head"><p class="ch">Psychology, architecture, fashion</p><h2 class="look-h">What I look at when I’m not looking at screens.</h2><p class="look-hint">Drag <span aria-hidden="true">→</span></p></div>
      <div class="strip" data-strip tabindex="0" aria-label="Photographs, scroll sideways"><figure class="lk"><img src="/images/life/sculpture-red-900.webp" width="900" height="1599" loading="lazy" alt="A tall stack of glossy red pillow-shaped sculptures between glass towers at night." draggable="false"><figcaption>Red, stacked, unbothered. Soft things in a hard city.</figcaption></figure>
        <figure class="lk"><img src="/images/life/hawa-mahal-900.webp" width="900" height="1200" loading="lazy" alt="The honeycomb facade of Hawa Mahal lit up at night." draggable="false"><figcaption>Hawa Mahal, Jaipur. Hundreds of windows, one idea: see without being seen.</figcaption></figure>
        <figure class="lk"><img src="/images/life/jaali-flowers-900.webp" width="900" height="1200" loading="lazy" alt="A terracotta jaali wall covered in flowering creepers, against an evening sky." draggable="false"><figcaption>A screen that lets the light in and keeps the street out.</figcaption></figure>
        <figure class="lk"><img src="/images/life/white-cafe-900.webp" width="900" height="1200" loading="lazy" alt="A white café interior with an arched window, a fiddle-leaf fig and a cloud of white flowers." draggable="false"><figcaption>Arches, a skylight, and nobody in a hurry.</figcaption></figure>
        <figure class="lk"><img src="/images/life/moon-trees-900.webp" width="900" height="1200" loading="lazy" alt="The moon behind clouds, framed by palm fronds and leaves." draggable="false"><figcaption>Framing, done by trees.</figcaption></figure>
        <figure class="lk"><img src="/images/life/hawa-mahal-street-900.webp" width="900" height="1200" loading="lazy" alt="Hawa Mahal from the street at night, with crowds and stalls below." draggable="false"><figcaption>Same building, street level. Context changes everything.</figcaption></figure>
        <figure class="lk"><img src="/images/life/jaipur-moon-900.webp" width="900" height="1200" loading="lazy" alt="Old buildings and a temple spire lit at night under a full moon, traffic blurred in front." draggable="false"><figcaption>A city lit from below, a moon lit from behind.</figcaption></figure></div>
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
        <h2 class="hed">Four projects. A teammate had one.</h2>
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
      <h2 class="hed">Four interviews. Four changes.</h2>
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
          <h2 class="hed">It started on paper.</h2>
          <p>One loop holds everything. Nothing moves until the lead has edited the plan and chosen to commit.</p>
          <ol class="loop"><li>Describe a project</li><li>AI drafts the tasks</li><li>AI recommends people</li><li>Lead edits</li><li>Commit</li></ol>
          <p class="math"><b>40h</b> available. Sarah has <b>48h</b>. <span>The AI suggests moving 8 hours of QA to Alex, and shows the maths before anyone says yes. Sample data.</span></p>
        </div>
      </div>
    </section>

    <section class="spread tint">
      <p class="folio"><span>iv</span> Onboarding</p>
      <h2 class="hed">One question broke the onboarding.</h2>
      <p class="dek dek--wide">I assumed teams would arrive through Jira. Then an audit director asked who would key the data in. The hard problem was never the dashboard.</p>
      <div class="ba">
        {fig("sketch-login-jira-first-900.webp", "Early sketch assuming login through a project tool.", "Before: one door, and it needed Jira.", "fig--paper", 900, 589)}
        {fig("shot-onboarding-add-team.webp", "Onboarding screen: add the team, or skip and come back.", "After: five ways in. Only one needs a project tool.", sample=True)}
      </div>
    </section>

    <section class="spread">
      <p class="folio"><span>v</span> Trust</p>
      <h2 class="hed">Trust is the product.</h2>
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
      <h2 class="hed">Every decision had a price.</h2>
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
      <h2 class="hed">What I’d tell myself in February.</h2>
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
        <h2 class="hed">The barrier isn’t information. It’s asking.</h2>
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
          <h2 class="hed">Two picks. Plain words.</h2>
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
      <h2 class="hed">Six rules for a nervous first order.</h2>
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
      <h2 class="hed">Heard at the counter, in Chennai.</h2>
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
        <h2 class="hed">Research first, this time.</h2>
        <div class="prose">
          <p>My last project taught me to validate before I build. So before anything grows, the flow gets tested in a café with five or six beginners.</p>
          <p class="side-k">What I’ll watch for (hypotheses, not results)</p>
          <ul class="ticks"><li>A first-timer orders without asking “what do you recommend?”</li><li>Some choose the stretch pick, and the check-in comes back “just right”.</li><li>Baristas notice better questions at the counter.</li></ul>
          <p class="links"><a class="more" href="{D_NOTION}" target="_blank" rel="noopener">The full write-up, in Notion <span aria-hidden="true">↗</span></a></p>
        </div>
      </div>
    </section>

    <section class="spread nextup">
      <a href="/editorial-velocity.html"><p class="folio"><span>→</span> Next</p><h2 class="hed hed--xl">AI drafts.<br><em>People decide.</em></h2><p class="dek">Velocity AI, and the four interviews that broke it.</p></a>
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


# The collection, in the gallery (dark) language: each work is a room with its own light.
PLATES = [
    ("01", "p-box", "Bronze Eroded Tiffany Blue Box", "Daniel Arsham × Tiffany &amp; Co.", "Sculpture · 2021", "The most recognisable box in retail, shown as if it had been dug up centuries from now. It breaks the box, literally. Packaging as fossil."),
    ("02", "p-roof", "Olympiapark roof", "Frei Otto with Behnisch &amp; Partner", "Architecture · Munich · 1972", "A stadium roof that behaves like a tent. Structure doing the least it can and getting away with it."),
    ("03", "p-nave", "Sagrada Família", "Antoni Gaudí", "Architecture · Barcelona · begun 1882", "Columns that branch like trees, light that arrives in colour. Also the world’s most patient deadline."),
    ("04", "p-fold", "SFMOMA, the rippled façade", "Snøhetta", "Architecture · San Francisco · 2016", "A building that looks like fog had a good idea. Quiet from far away, restless up close."),
    ("05", "p-lost", "Untitled (I forgot the title)", "Seen at SFMOMA", "Name misplaced · impression intact", "One piece stopped me in the gallery and I didn’t photograph the label. Rookie curator error. This wall is holding its place."),
]
LIGHTS = ["warm", "cool", "flare", "near", "quiet"]
def dark_collection():
    rooms = "".join(f'''
    <section class="room hang {cls}" data-light="{LIGHTS[i]}">
      <div class="hang-art reveal" aria-hidden="true"><span>{n}</span></div>
      <div class="hang-label reveal d2">
        <p class="label">No. {n}</p>
        <h2 class="h2">{title}</h2>
        <p class="hang-maker">{maker}</p>
        <p class="hang-meta">{meta}</p>
        <p class="body">{note}</p>
      </div>
    </section>''' for i, (n, cls, title, maker, meta, note) in enumerate(PLATES))
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0A1419">
  <title>The collection — Sukriti Pandey</title>
  <meta name="description" content="Five things Sukriti Pandey can't stop looking at.">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="stylesheet" href="/src/styles/base.css">
  <link rel="stylesheet" href="/src/styles/collection.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="atmosphere" aria-hidden="true"></div>
  <div class="vignette" aria-hidden="true"></div>
  <div class="scrim" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>
  <nav class="nav" aria-label="Collection">
    <a href="/" class="nav-logo">SP</a>
    <ul class="nav-links">
      <li><a href="/#work">All work</a></li>
      <li><a href="/curator.html">Play</a></li>
      <li><a href="/#contact">Contact</a></li>
    </ul>
  </nav>
  <main id="main">
    <section class="room hang-intro" data-light="warm">
      <p class="label reveal">The collection · Hung, not ranked</p>
      <h1 class="display reveal d1">Five things I can’t stop <em>looking at.</em></h1>
      <p class="body reveal d2">Not all of it is art. Some of it is a roof. All of it changed how I look at a screen.</p>
    </section>{rooms}
    <section class="room hang-next" data-light="flare">
      <a href="/curator.html" class="link-quiet reveal">Enough looking. Your turn to hang something</a>
    </section>
  </main>
  <footer class="site-footer"><span>Sukriti Pandey — 2026</span><em>Chaos, but curated.</em></footer>
  <script type="module" src="/src/js/site.js"></script>
</body>
</html>
'''
(ROOT / "collection.html").write_text(dark_collection())
print("wrote collection.html")

PAGES = {
    "editorial.html": ("Sukriti Pandey — The editorial edition", "A light, magazine-editorial edition of Sukriti Pandey's portfolio.", HOME, ""),
    "editorial-velocity.html": ("Velocity AI — AI drafts. People decide. · Sukriti Pandey", "Velocity AI case study, editorial edition.", VELOCITY, "velocity"),
    "editorial-decaf.html": ("Ctrl+Alt+Decaf — In progress · Sukriti Pandey", "Ctrl+Alt+Decaf, in progress. Editorial edition.", DECAF, "decaf"),
}
for name, (t, d, body, here) in PAGES.items():
    (ROOT / name).write_text(page(t, d, body, here))
    print("wrote", name)
