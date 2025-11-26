# HaHaGames Homepage Clone Workflow

This project snapshots `https://www.hahagames.com/`, renders the stored markup with Next.js, and provides scripts to compare screenshots for visual parity.

## 1. Environment Setup
- Install dependencies:
  ```bash
  npm install
  ```
- Download the Playwright Chromium binary (needed for screenshots):
  ```bash
  npx playwright install chromium
  ```

## 2. Sync the Latest Homepage Markup
1. Fetch and process the live HTML (一键获取):
   ```bash
   npm run fetch
   ```
   - Downloads the page from https://www.hahagames.com/
   - Rewrites root-relative asset URLs to absolute URLs so resources still load from hahagames.com when served locally
   - Extracts `<head>` and `<body>` fragments into `data/home-head.html` and `data/home-body.html`
   - Saves element attributes (html/body) and metadata to `data/markup-meta.json`

2. Regenerate the static snapshot used as the baseline HTML:
   ```bash
   npm run snapshot
   ```
   Writes the combined markup (with preserved attributes) to `public/original.html`.

## 3. Next.js Rendering Notes
- `app/layout.tsx` reads `data/home-head.html`, `data/home-body.html`, and `data/markup-meta.json` at runtime. It injects the original head and sets html/body attributes before streaming the stored body markup.
- If the data files are missing, a small placeholder message is rendered. Run `npm run fetch` to replace it with the real DOM.
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
2. Capture screenshots (Playwright Chromium, JavaScript disabled, 1440×900 viewport, full page):
   ```bash
   npm run screenshots
   ```
   Outputs:
   - `screenshots/original.png` → remote hahagames.com capture
   - `screenshots/clone.png` → local clone capture
3. Produce the diff overlay and statistics:
   ```bash
   npm run compare
   ```
   - Prints the number and percentage of differing pixels
   - Saves `screenshots/diff.png`
4. Narrow down the differing region (optional):
   ```bash
   npm run analyze-diff
   ```
   Reports the bounding box covering all differing pixels for easier inspection.

## 6. Typical Sources of Difference
- The live site loads ads, analytics, and other dynamic assets, so expect a small variance even with JavaScript disabled.
- To reduce noise you can block third-party requests before capturing screenshots or compare the local render against `public/original.html`, which mirrors the stored snapshot exactly.

Repeat these steps whenever you refresh the data or want an automated visual regression check on the HaHaGames homepage.
