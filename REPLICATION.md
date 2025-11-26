# HaHaGames Page Clone Workflow

This project snapshots pages from `https://www.hahagames.com/`, renders the stored markup with Next.js, and provides scripts to compare screenshots for visual parity.

## 1. Environment Setup
- Install dependencies:
  ```bash
  npm install
  ```
- Download the Playwright Chromium binary (needed for screenshots):
  ```bash
  npx playwright install chromium
  ```

## 2. Sync the Latest Markup
1. Fetch and process the live HTML:
   ```bash
   # Homepage (defaults)
   npm run fetch

   # a-shedletsky-pov game page
   npm run fetch -- --url https://www.hahagames.com/game/a-shedletsky-pov --prefix a-shedletsky-pov
   ```
   - Rewrites root-relative asset URLs to absolute URLs so resources still load from hahagames.com when served locally
   - Extracts `<head>` and `<body>` fragments into `data/<prefix>-head.html` and `data/<prefix>-body.html`
   - Saves element attributes (html/body) and metadata to `data/<prefix>-meta.json`

2. Regenerate the static snapshot used as the baseline HTML (defaults to `public/original.html` for the `home` prefix):
   ```bash
   npm run snapshot -- --prefix a-shedletsky-pov
   ```
   This writes `public/a-shedletsky-pov-original.html` (or `public/original.html` when the prefix is `home`).

## 3. Next.js Rendering Notes
- Middleware writes the request pathname into headers; `app/layout.tsx` reads it and loads the matching snapshot:
  - `/` → `data/home-head.html`, `data/home-body.html`, `data/home-meta.json`
  - `/game/a-shedletsky-pov` → `data/a-shedletsky-pov-head.html`, `data/a-shedletsky-pov-body.html`, `data/a-shedletsky-pov-meta.json`
- If the data files are missing, a small placeholder message is rendered. Run `npm run fetch` for the desired URL/prefix to replace it with the real DOM.
- `app/globals.css` only includes Tailwind’s base utilities to avoid altering the captured styles.

## 4. Build Verification
Compile the project in production mode to make sure everything is valid:
```bash
npm run build
```

## 5. Screenshot Capture and Pixel Diff
1. Launch the local server (after building):
   ```bash
   npm run start
   ```
2. Capture screenshots (Playwright Chromium, JavaScript disabled, 1440×900 viewport, full page). Pass `--path` to target a specific page and `--name` to avoid overwriting the defaults:
   ```bash
   npm run screenshots -- --path /game/a-shedletsky-pov --name a-shedletsky-pov
   ```
   Outputs:
   - `screenshots/original[-<name>].png` – remote hahagames.com capture
   - `screenshots/clone[-<name>].png` – local clone capture
3. Produce the diff overlay and statistics:
   ```bash
   npm run compare -- --name a-shedletsky-pov
   ```
   - Prints the number and percentage of differing pixels
   - Saves `screenshots/diff[-<name>].png`
4. Narrow down the differing region (optional):
   ```bash
   npm run analyze-diff -- --name a-shedletsky-pov
   ```
   Reports the bounding box covering all differing pixels for easier inspection.

## 6. Typical Sources of Difference
- The live site loads ads, analytics, and other dynamic assets, so expect a small variance even with JavaScript disabled.
- To reduce noise you can block third-party requests before capturing screenshots or compare the local render against the snapshot HTML in `public/`.

Repeat these steps whenever you refresh the data or want an automated visual regression check on the HaHaGames pages.
