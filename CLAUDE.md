# Sukriti Pandey — portfolio ("Chaos, but curated.")

Live: https://sukritipandey.vercel.app — Vercel auto-deploys every push to `main`.

## Who / why
- Sukriti Pandey, UX Designer 2 at Deloitte (US Offices), 4.5+ years, Hyderabad.
- Target: Senior / Staff Product Designer offer by December 2026.
- Concept: "Chaos, but curated." Dark, cinematic fashion-tech atelier; atmospheric amber/teal image background;
  the light shifts room by room as you scroll, like walking through a gallery. Must work on mobile too.

## Content rules (do not break)
- Title is **UX Designer 2** (Analyst before Jun 2025). Never "Senior Analyst".
- Never name or surface the internal-communications team she works in. The tracker is just "Project tracker".
- Never credit any developer collaborator. Velocity AI was designed and prototyped by her in Figma Make
  and lives there (no hosted build).
- Concepts come from her instincts — propose, don't impose. Keep case studies short and graphics-led.
- No paid subscriptions/services.

## Stack
- Vite multi-page static site, vanilla HTML/CSS/JS. Pages are registered in `vite.config.js` (`rollupOptions.input`).
- Lenis smooth scroll (lerp 0.16 desktop; native scroll on touch).
- Fonts self-hosted via @fontsource (Cormorant Garamond 300/400 + italics, Syne 400/500). Google Fonts is blocked in the build sandbox.
- `src/styles/base.css` — tokens + shared components. `home.css`, `case.css` — page styles.
- `src/js/site.js` — cursor, reveals, glow cards, room lighting (`data-light` → `LOOKS` map), scroll-driven
  background "camera" (zoom + pan + sway), lightbox for `[data-zoom]`.
- Images in `public/images/` (atmosphere.jpg, velocity/*.jpg). Resume at `public/files/Sukriti-Pandey-Resume.pdf`.

## Legibility floor
- Small uppercase text >= 0.74rem; amber text uses solid `--amber-soft` (#E0C49C); small text gets the dark halo
  text-shadow defined in base.css / case.css. Keep these when adding new text styles.

## Roadmap
- The Curator (gamified composition installation) — brainstorm first; open question: what it reveals about the player.
- Case study 02: speculative luxury e-commerce concept (brainstormed in a separate thread).
- Per-room atmosphere images (four more) if she generates them; richer background motion.
- v2: analog-camera style contact form (EmailJS/Formspree, free tier).

## Workflow
- `npm install && npm run dev` / `npm run build`. Check desktop 1440 and mobile 390 for overflow before pushing.
- Commit to `main` and push; confirm the deploy on the live URL.
