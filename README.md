# Snake — Phosphor Edition

A keyboard snake game built with TypeScript and Canvas 2D. Two CRT palettes, a walls toggle, and a high score saved in the browser.

Play: https://sajid506a.github.io/sajid506a.snake.github.io/

## Controls

- `WASD` or arrow keys: move
- `Space`: pause or resume

## Food

- Pale dot: 10 points
- Gold diamond: 50 points and raises the multiplier
- Blue ring: 20 points
- Pink square: 30 points and removes two segments

## Local development

```sh
bun install
bun run dev
```

Open http://localhost:3000. The dev server compiles `src/game.ts` when `/bundle.js` is requested.

## Static build

```sh
bun run build
```

This writes `bundle.js` next to `index.html`. GitHub Pages serves `index.html`, `bundle.js`, and `fonts/` directly from the `master` branch, so the built bundle is committed.

## Layout

- `index.html`, `bundle.js`, `fonts/` — the deployed site
- `src/` — game source
- `index.ts` — local development server
- `package.json` — scripts and dependencies
