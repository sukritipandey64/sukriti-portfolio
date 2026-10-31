"""Image drop-in for case study pages.
Usage: python3 scripts/assets.py <velocity|barista> <folder-with-files>
Files are matched to slots by name (e.g. shot-dashboard.png, wireframe-two-picks.jpg), converted to
compressed WebP (full + 900w variant), then the page is regenerated with real dimensions."""
import sys, subprocess
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PAGES = {
  'velocity': {
    'out': 'velocity/v2', 'build': 'build_velocity.py',
    'slots': ['sketch-conceptual-model', 'sketch-login-jira-first', 'sketch-roles-flow', 'sketch-dashboard',
              'sketch-timesheet', 'shot-dashboard', 'shot-plan-step1-tasks', 'shot-plan-step2-allocate',
              'shot-ai-card-collapsed', 'shot-ai-card-impact-panel', 'shot-ai-thresholds', 'shot-thin-input-refusal',
              'shot-empty-insights', 'shot-team-switcher', 'shot-create-team-paste-ai-skills',
              'shot-onboarding-add-team', 'shot-people-drawer', 'shot-employee-time', 'diagram-onboarding-five-paths'],
  },
  'barista': {
    'out': 'barista', 'build': 'build_barista.py',
    'slots': ['wireframe-onboarding', 'wireframe-two-picks', 'wireframe-check-in', 'research-notes'],
  },
}
MAXW = 2000

def norm(s): return s.lower().replace('_', '-').replace(' ', '-')

page, src = sys.argv[1], Path(sys.argv[2])
cfg = PAGES[page]
out = ROOT / 'public' / 'images' / cfg['out']; out.mkdir(parents=True, exist_ok=True)
files = [f for f in src.rglob('*') if f.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')]
done, missing = [], []
for slot in cfg['slots']:
    match = [f for f in files if slot in norm(f.stem)]
    if not match: missing.append(slot); continue
    im = ImageOps.exif_transpose(Image.open(match[0])).convert('RGB')
    if im.width > MAXW: im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
    im.save(out / f'{slot}.webp', 'WEBP', quality=80, method=6)
    if im.width > 900:
        im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS).save(out / f'{slot}-900.webp', 'WEBP', quality=80, method=6)
    done.append(f'{slot}  <-  {match[0].name}  ({im.width}x{im.height})')
subprocess.run([sys.executable, str(ROOT / 'scripts' / cfg['build'])], check=True)
print('\n'.join(done)); print(f'{len(done)} placed; still missing: {", ".join(missing) or "none"}')
