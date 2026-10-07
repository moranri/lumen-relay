# Lumen Relay

An original TECH3500 Week 6 Lab 6 strategy game. Built by Ricardo Moran, Ivelisse Wright, and Nicole Edzaguirre with AI-assisted development.

## Play

Move one or two spaces horizontally or vertically, collect destination energy, and permanently seal your departure tile. You cannot jump sealed tiles or the opponent. The middle tile of a two-space move is not harvested. If trapped, skip turns; when both players are trapped, compare total energy. The center core is worth 8; ties are draws.

ORBIT uses deterministic minimax with alpha-beta pruning, a bounded search, and an energy/mobility evaluation function. Difficulty selects 1, 3, or 5 plies. This is classical game AI, NOT a ChatGPT, Gemini, or Qwen API. No credentials, account, or paid service are needed. Search runs in a Web Worker. Undo restores your entire previous turn; restart cancels outdated AI work.

## Files

- index.html: accessible interface and rules
- style.css: responsive presentation
- engine.js: pure game state, validation, scoring, and AI search
- ai-worker.js: background search
- app.js: browser controls, rendering, and match history

Open index.html with Live Server. For tests in the local coursework folder, run `node --test tests/engine.test.cjs` from the parent of site. GitHub Pages hosts these site files at the repository root. Deploy from the main branch and root directory. Only public game source belongs in this repository; reports and screenshots remain local.

All grid art is generated with CSS. Google Fonts provides optional typefaces with system fallbacks. No player scores or moves are uploaded by the application.
