"""Generates digital-barista.html (in-progress case study, spec Nov 2026).
Images: /images/barista/<asset>.webp — add with `python3 scripts/assets.py barista <folder>`."""
import html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'public' / 'images' / 'barista'
LINKEDIN = 'https://www.linkedin.com/in/sukritipandey1908/'
U = 'https://sukritipandey.vercel.app'

# Flip to the second wording once conversations have actually started (spec §6).
CONVERSATIONS = 1  # first conversation: a specialty café co-founder (Nov 2026)
STATUS = ("Research underway: reaching out to 24 Indian baristas, coffee creators and educators."
          if CONVERSATIONS == 0 else
          "Conversations with baristas, café founders and coffee educators have started. Early signals are below.")

def size_of(asset, default):
    f = ASSETS / f'{asset}.webp'
    if f.exists():
        from PIL import Image
        return Image.open(f).size
    return default

def img(asset, alt, default=(780, 1600), sizes='(max-width: 860px) 80vw, 26vw', caption=None):
    if not (ASSETS / f'{asset}.webp').exists():
        return ''  # production rule: no placeholders
    w, h = size_of(asset, default)
    cap = f'<figcaption>{caption}</figcaption>' if caption else ''
    small = f'/images/barista/{asset}-900.webp 900w, ' if w > 900 else ''
    return (f'<figure class="shot" data-zoom data-asset="{asset}">'
            f'<img srcset="{small}/images/barista/{asset}.webp {w}w" sizes="{sizes}" src="/images/barista/{asset}.webp" '
            f'alt="{html.escape(alt)}" loading="lazy" decoding="async" width="{w}" height="{h}">{cap}</figure>')

DESC = "In progress: a phone web app that helps people new to specialty coffee order without having to ask. Research first, build second."
TITLE = "Digital Barista — In progress · Sukriti Pandey"

notes = (ASSETS / 'research-notes.webp').exists()
notes_fig = img('research-notes', 'Handwritten research notes and an anonymised outreach board', default=(1600, 1100), sizes='(max-width: 860px) 92vw, 40vw', caption='Working notes, anonymised') if notes else ''

WIRES = [img('wireframe-onboarding', 'Grayscale phone wireframe of the single onboarding question: What do you usually order?', caption='One question'),
         img('wireframe-two-picks', 'Grayscale phone wireframe showing two picks from today’s menu: a safe pick and a stretch pick, each explained in plain words', caption='Two picks: safe and stretch'),
         img('wireframe-check-in', 'Grayscale phone wireframe of the two-tap reaction after the cup, followed by the next suggestion', caption='Two-tap check-in')]
HAS_WIRES = any(WIRES)
LOFI = ('''    <section class="wip-room" id="wireframes" data-light="cool" data-toc="Wireframes">
      <p class="label reveal">03 — First look: lo-fi wireframes</p>
      <div class="wip-lofi">
      <div class="wires reveal">
        ''' + "\n        ".join(w for w in WIRES if w) + '''
      </div>
        <p class="wires-cap reveal">Grayscale structure first. The app gets its own design system once the research says what it needs.</p>
      </div>
    </section>
''') if HAS_WIRES else ''

PAGE = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#0A1419">
  <title>{TITLE}</title>
  <meta name="description" content="{DESC}">
  <link rel="canonical" href="{U}/digital-barista.html">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Sukriti Pandey">
  <meta property="og:url" content="{U}/digital-barista.html">
  <meta property="og:title" content="{TITLE}">
  <meta property="og:description" content="{DESC}">
  <meta property="og:image" content="{U}/images/og-home.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{TITLE}">
  <meta name="twitter:description" content="{DESC}">
  <meta name="twitter:image" content="{U}/images/og-home.jpg">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/src/styles/base.css">
  <link rel="stylesheet" href="/src/styles/case.css">
  <link rel="stylesheet" href="/src/styles/wip.css">
</head>
<body class="wip-page">
  <a class="skip-link" href="#main">Skip to content</a>

  <div class="atmosphere" aria-hidden="true"></div>
  <div class="vignette" aria-hidden="true"></div>
  <div class="scrim" aria-hidden="true"></div>
  <div class="grain" aria-hidden="true"></div>

  <nav class="nav" aria-label="Case study">
    <a href="/" class="nav-logo">SP</a>
    <ul class="nav-links">
      <li><a href="/#work">All work</a></li>
      <li class="hide-sm"><a href="#wireframes">Wireframes</a></li>
      <li><a href="#research">Research</a></li>
      <li class="hide-sm"><a href="#signals">Signals</a></li>
    </ul>
  </nav>

  <main id="main" data-toc-root>

    <!-- 1 · Cover + 2 · metadata -->
    <header class="wip-cover" data-light="warm" id="top" data-toc="Overview">
      <div class="wip-cover-grid">
        <div>
          <p class="wip-status"><span aria-hidden="true"></span>In progress · Research phase</p>
          <p class="wip-kicker">Case study 02 · {{READ}} min read</p>
          <h1 class="display wip-title">Digital Barista <em>(working title)</em></h1>
          <p class="cs-lede">Ordering coffee shouldn't feel like an oral exam.</p>
          <ol class="stages" aria-label="Where the project is">
            <li class="is-now"><b>Discover</b><span>Now</span></li><li><b>Define</b><span>Next</span></li><li><b>Design</b><span>Lo-fi started</span></li><li><b>Test</b><span>In a café</span></li>
          </ol>
        </div>
        {img('wireframe-two-picks', 'Grayscale phone wireframe of the two picks screen: a safe pick and a stretch pick from today’s menu', sizes='(max-width: 860px) 50vw, 20vw')}
      </div>
      <dl class="meta-row meta-row--3">
        <div><dt>Role</dt><dd>Solo — research, product design, build</dd></div>
        <div><dt>Platform</dt><dd>Phone web app, opened from a café table QR code, no download</dd></div>
        <div><dt>Timeline</dt><dd>Oct 2026 – ongoing</dd></div>
      </dl>
    </header>

    <!-- At a glance -->
    <section class="glance-room glance-room--wip" id="glance" data-light="near" aria-label="At a glance">
      <div class="glance reveal">
        <div><span>The problem</span><p>People new to specialty coffee hand the decision to the barista, or fall back on what they already know.</p></div>
        <div><span>What I'm making</span><p>Scan the table QR, say what you usually drink, get two picks from today's menu in plain words.</p></div>
        <div><span>Where it stands</span><p>Research first. Conversations have started, and early signals are already shaping the picks.</p></div>
      </div>
    </section>

    <!-- 3 · Insight + 4 · Idea -->
    <section class="wip-room" id="insight" data-light="near" data-toc="Insight">
      <div class="wip-insight">
        <div>
          <p class="label reveal">01 — The insight</p>
          <p class="own-line reveal d1">I still ask the barista <q>what would you recommend?</q> Tasting notes confuse me too.</p>
          <ul class="insight-list reveal d1">
            <li>Specialty coffee is growing fast in India, but menus assume you already speak coffee: brew methods, estates, processing, roast levels, tasting notes.</li>
            <li>Beginners feel judged asking the barista, so they default to a hazelnut latte, or guess.</li>
            <li>Tasting notes describe the coffee, not whether you'll like it. You can love blueberries and hate blueberry coffee.</li>
          </ul>
        </div>
        <div>
          <p class="pull reveal d1">The barrier isn't information. <em>It's asking.</em></p>
          <p class="idea reveal d2"><span>02 — The idea</span>Scan the QR code on the table, say what you usually drink, and get two picks from today's menu, explained in plain words. A two-tap check-in after the cup makes the next pick better.</p>
          <div class="translate reveal d3" data-translate data-from="blueberry · floral · bright" data-to="jamun · jaggery · filter coffee"
               data-from-label="The menu says" data-to-label="In your words">
            <p class="tr-label">The menu says</p>
            <p class="tr-words" aria-hidden="true">blueberry · floral · bright</p>
            <p class="tr-static"><span>The menu says</span> blueberry · floral · bright <span>In your words</span> jamun · jaggery · filter coffee</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Lo-fi, right after the idea (only once wireframe images exist) -->
{LOFI}
    <!-- 5 · Key decisions -->
    <section class="wip-room" id="decisions" data-light="cool" data-toc="Decisions">
      <p class="label reveal">04 — Decisions so far</p>
      <div class="dcards">
        <div class="dcard reveal"><b>No prompt needed</b><p>Scan, one tap, two picks. Good help shouldn't require knowing what to ask.</p></div>
        <div class="dcard reveal d1"><b>One onboarding question</b><p>"What do you usually order?" It starts from what people already know.</p></div>
        <div class="dcard reveal d2"><b>Always two picks: safe and stretch</b><p>The user keeps the choice, and a miss is framed as part of the experiment.</p></div>
        <div class="dcard reveal"><b>Tasting notes, translated</b><p>Into Indian food memories: jamun, jaggery, filter coffee. Unfamiliar language becomes familiar taste.</p></div>
        <div class="dcard reveal d1"><b>A two-tap check-in</b><p>It returns the next suggestion right away. The tone: come back and we'll explore together.</p></div>
        <div class="dcard reveal d2"><b>Cold start</b><p>Seeded with barista knowledge and a small tasting session. Real reactions take over as data grows.</p></div>
        <div class="dcard dcard--wide reveal"><b>Why not just ask a chatbot?</b><p>Picks come from the café's actual menu today. And the record of how beginners react to specific coffees is data no general chatbot has.</p></div>
      </div>
    </section>

    <!-- 6 · Research -->
    <section class="wip-room" id="research" data-light="reading" data-toc="Research">
      <p class="label reveal">05 — Research, before building</p>
      <div class="wip-research">
        <div>
          <p class="lead-line reveal d1">My last project taught me to validate before I build. <em>This time, research comes first.</em></p>
          <p class="status-line reveal d2"><span aria-hidden="true"></span>{STATUS}</p>
          <p class="body reveal d2">The outreach asks about the problem, not the solution. Alongside it, I'm reading reel comments by hand to hear how beginners describe the experience in their own words.</p>
          {notes_fig}
        </div>
        <div class="qh reveal d2">
          <p class="qh-k">Questions I'm trying to answer</p>
          <ul><li>What makes beginners hesitate at the counter?</li><li>Where do they look for help today, if anywhere?</li><li>What do baristas wish customers felt comfortable asking?</li></ul>
          <p class="qh-k qh-k--hyp">Hypotheses to test <i>— not findings</i></p>
          <ul class="hyp"><li>The barrier is social, not informational.<small>Early signal: people hand the decision to the barista</small></li><li>Beginners want a starting point, not an education.<small>Early signal: they start from what they already drink</small></li><li>Baristas would welcome better questions from customers.</li></ul>
        </div>
      </div>
    </section>

    <!-- 6b · First conversation -->
    <section class="wip-room" id="signals" data-light="near" data-toc="Early signals">
      <p class="label reveal">06 — Early signals</p>
      <div class="sig-head">
        <h2 class="h2 reveal d1">A specialty café co-founder in Chennai, <em>on what happens at the counter.</em></h2>
        <p class="body reveal d2">The conversations have started, and this is what's coming through so far. Each point is a signal to check against the next conversations, not a finding. Two already echo what I'd seen elsewhere: people asking "what do you recommend?", and confusion over tasting notes.</p>
      </div>
      <div class="itable reveal" role="table" aria-label="Early signals from the conversations, and what each changes">
        <div class="ir ir--head" role="row"><span role="columnheader">What it shows</span><span role="columnheader">In his words</span><span role="columnheader">What it changes</span></div>
        <div class="ir ir--key" role="row"><span role="cell">The decision gets handed over</span><q role="cell">A lot of them just end up asking ‘what do you recommend?’</q><span role="cell">That moment is the problem. The app gives the recommendation people would otherwise have to ask a stranger for.</span></div>
        <div class="ir" role="row"><span role="cell">People start from the familiar</span><q role="cell">Most people look for something familiar first, like a cappuccino or a cold coffee.</q><span role="cell">The first question stays "what do you usually drink?", and the safe pick stays close to the answer.</span></div>
        <div class="ir" role="row"><span role="cell">Three questions, every day</span><q role="cell">What's the difference from espresso? Which is less bitter? Are the tasting notes added flavours?</q><span role="cell">Every pick answers all three. Bitterness becomes the main scale to compare on, and each card says the notes come from the bean, nothing added.</span></div>
        <div class="ir" role="row"><span role="cell">The words that trip people</span><q role="cell">Some don't know what a specific processing is, like a washed, natural or honey… or a thermal shock.</q><span role="cell">The plain-words glossary covers processing methods, not just flavours.</span></div>
        <div class="ir" role="row"><span role="cell">No two menus alike</span><q role="cell">We don't add any flavour into our coffee… we do cream tops or cold foams.</q><span role="cell">A hazelnut cold brew fan has no exact match here. Picks have to come from each café's own menu, not a generic drink list.</span></div>
      </div>
      <div class="tension reveal">
        <div class="tension-copy">
          <p class="tension-k">The tension I'm working through</p>
          <p class="tension-q"><q>I don't force anyone to get into specialty coffee… Once they ask a question, we go on explaining.</q></p>
          <p class="body">Good baristas invite curiosity; they don't push it. So the stretch pick has to read as an invitation, never a nudge, and the safe pick is always there.</p>
        </div>
        <div class="ladder" aria-label="How he moves people, one step at a time">
          <p class="ladder-k">One step at a time, the way he does it</p>
          <ol>
            <li><b>A milk drink</b><span>cappuccino, latte, cold coffee</span></li>
            <li><b>A cortado</b><span>less milk, more coffee</span></li>
            <li><b>A pour-over</b><span>black, when they're open to it</span></li>
          </ol>
          <p class="ladder-n">This becomes the logic for the stretch pick.</p>
        </div>
      </div>
    </section>


    <!-- How I'll know it works -->
    <section class="wip-room" id="measure" data-light="cool" data-toc="How I'll know">
      <p class="label reveal">07 — How I'll know it works</p>
      <div class="measure-head">
        <h2 class="h2 reveal d1">No usage numbers yet. <em>So these are the signals I'll watch.</em></h2>
        <p class="body reveal d2">Before anything is built further, the flow gets tested in a café with five or six beginners. These are what I expect to see if it works.</p>
      </div>
      <div class="qh measure reveal">
        <p class="qh-k qh-k--hyp">What I'll watch <i>— hypotheses, not results</i></p>
        <ul class="hyp">
          <li>A first-timer orders without asking "what do you recommend?"</li>
          <li>Some people choose the stretch pick, and the check-in comes back "just right".</li>
          <li>People answer the two-tap check-in after the cup.</li>
          <li>Baristas notice better questions at the counter.</li>
        </ul>
      </div>
    </section>

    <!-- 8 · Next + 9 · footer -->
    <section class="wip-room wip-room--end" id="next" data-light="quiet" data-toc="What's next">
      <p class="label reveal">08 — What's next</p>
      <ol class="tl reveal" aria-label="Next steps, in order">
        <li class="tl-now">Research synthesis</li><li>Refine the flow</li><li>Design system</li><li>Micro-interactions</li><li>Build</li><li>Café test with 5–6 beginners</li>
      </ol>
      <a class="next-cs glow reveal" href="/velocity-ai.html">
        <span class="next-cs-copy">
          <span class="next-cs-k">Next case study</span>
          <span class="next-cs-t">Velocity AI</span>
          <span class="next-cs-l">Capacity intelligence where AI drafts the plan and a team lead decides. Research, AI trust patterns and a working prototype.</span>
          <span class="next-cs-go">Read the case study <span aria-hidden="true">→</span></span>
        </span>
        <img class="next-cs-img next-cs-img--wide" src="/images/velocity/v2/shot-dashboard-900.webp" alt="" loading="lazy" width="900" height="562">
      </a>
      <div class="cs-end reveal">
        <a class="btn-pill btn-pill--ghost" href="/#work">Back to work</a>
        <a class="link-quiet" href="{LINKEDIN}" target="_blank" rel="noopener">Follow along on LinkedIn</a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <span>Sukriti Pandey — 2026</span>
    <em>Chaos, but curated.</em>
  </footer>

  <script type="module" src="/src/js/site.js"></script>
</body>
</html>
'''
import re
_main = PAGE[PAGE.index('<main'):PAGE.index('</main>')]
PAGE = PAGE.replace('{READ}', str(max(1, round(len(re.sub(r'<[^>]+>', ' ', _main).split()) / 230))))
(ROOT / 'digital-barista.html').write_text(PAGE)
print('written digital-barista.html', 'status:', STATUS)
