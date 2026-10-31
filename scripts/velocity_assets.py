"""Drop-in for the Velocity v2 images.
Usage: python3 scripts/velocity_assets.py <folder-with-files>
Files are matched by name (e.g. shot-dashboard.png, sketch-roles-flow.HEIC.jpg) to the 19 slots,
converted to compressed WebP (full + 900w), then the page is regenerated with real dimensions."""
import sys, subprocess
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'images' / 'velocity' / 'v2'
SLOTS = [
 'sketch-conceptual-model', 'sketch-login-jira-first', 'sketch-roles-flow', 'sketch-dashboard', 'sketch-timesheet',
 'shot-dashboard', 'shot-plan-step1-tasks', 'shot-plan-step2-allocate', 'shot-ai-card-collapsed',
 'shot-ai-card-impact-panel', 'shot-ai-thresholds', 'shot-thin-input-refusal', 'shot-empty-insights',
 'shot-team-switcher', 'shot-create-team-paste-ai-skills', 'shot-onboarding-add-team', 'shot-people-drawer',
 'shot-employee-time', 'diagram-onboarding-five-paths',
]
MAXW = {'shot': 2000, 'sketch': 1600, 'diagram': 2000}

def norm(s): return s.lower().replace('_', '-').replace(' ', '-')

src = Path(sys.argv[1])
files = [f for f in src.rglob('*') if f.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp', '.heic')]
OUT.mkdir(parents=True, exist_ok=True)
done, missing = [], []
for slot in SLOTS:
    match = [f for f in files if norm(f.stem).startswith(slot) or slot in norm(f.stem)]
    if not match: missing.append(slot); continue
    im = ImageOps.exif_transpose(Image.open(match[0])).convert('RGB')
    cap = MAXW[slot.split('-')[0]]
    if im.width > cap: im = im.resize((cap, round(im.height * cap / im.width)), Image.LANCZOS)
    im.save(OUT / f'{slot}.webp', 'WEBP', quality=80, method=6)
    sm = im.resize((900, round(im.height * 900 / im.width)), Image.LANCZOS) if im.width > 900 else im
    sm.save(OUT / f'{slot}-900.webp', 'WEBP', quality=80, method=6)
    done.append(f'{slot}  ←  {match[0].name}  ({im.width}x{im.height})')
subprocess.run([sys.executable, str(ROOT / 'scripts' / 'build_velocity.py')], check=True)
print('\n'.join(done)); print(f'{len(done)} placed, {len(missing)} still missing:', ', '.join(missing) or 'none')
