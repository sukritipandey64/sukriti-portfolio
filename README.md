# Sukriti Pandey — Portfolio

*Chaos, but curated.*

A static, multi-page site built with Vite, plain HTML/CSS/JS and Lenis for smooth scrolling.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
```

## Structure

```
index.html            Homepage
velocity-ai.html      Case study 01 — Velocity AI
src/styles/base.css   Shared tokens, atmosphere, nav, buttons, motion
src/styles/home.css   Homepage sections
src/styles/case.css   Case-study layout
src/js/site.js        Smooth scroll, cursor, reveals, the room-by-room light shift
public/images/        Atmosphere image + Velocity AI screens
```

## Deploy

Import the repo on vercel.com. Vercel detects Vite automatically
(build `npm run build`, output `dist`). Every push to `main` redeploys.
