# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment

Push to `main` → GitHub Actions deploys automatically to GitHub Pages. There is no build step — raw files are served directly. The site requires an HTTP server (not `file://`) because JS uses `fetch()` to load `books.json`.

To preview locally: `python -m http.server 8000` or any static file server.

## Architecture

**No frameworks, no build tooling.** HTML + CSS + vanilla JS served directly by GitHub Pages.

### Data flow

All book and category data lives in `books.json`. Every page fetches it at runtime via `fetch()`. The JS modules each call `fetch('books.json')` independently (no shared module loader).

### JS load order (index.html)

Scripts are loaded in dependency order at the bottom of `<body>`:
1. `main.js` — nav, scroll, animations, hamburger menu
2. `books-engine.js` — renders Featured section, hero stats, hero book stack, footer nav, and nav links from `books.json`
3. `catalog-controls.js` — injects the "All Books" catalog section after `#featured`, handles filtering/search/sort/pagination (delays 100ms to run after books-engine)
4. `social-proof.js` — injects `#testimonials` section before `.cta-banner`, region detection banner, animated counters, share buttons (delays 200ms)

### Category pages

Each category has its own HTML page (`coloring-books.html`, `journals.html`, etc.) that renders only books for that category. Nav links from `books-engine.js` point to these pages (e.g. `coloring-books.html`), not to anchor IDs on `index.html`.

### `books.json` schema

Top-level keys: `meta`, `categories`, `books`.

Key book fields:
- `id` — URL-safe slug
- `category` — must match a `categories[].id`
- `season_tag` — used for seasonal featured rotation (e.g. `"christmas"`, `"easter"`)
- `featured` + `featured_badge` — controls Featured section on `index.html`
- `display_order` — sort order within category (lower = first)
- `amazon_urls` — object with keys `us`, `uk`, `ca`, `au`

Category `subcategories` array drives the subcategory filter buttons in `catalog-controls.js`. Each subcategory has `season_months` (1-12 array) that highlights it as "In Season".

### CSS

All styles in `assets/css/styles.css` using CSS custom properties. Design tokens are defined at the top of the file under `:root`. Color themes per category are applied via `.category-section--{id}` classes.

## Content update locations

| What | Where |
|------|-------|
| Book catalog | `books.json` |
| Testimonials | `assets/js/social-proof.js` → `SP_CONFIG.testimonials` array |
| Author bio | `index.html` → `#about` section |
| Site colors/fonts | `assets/css/styles.css` → `:root` custom properties |
| GA Measurement ID | `index.html` → replace both `GA_MEASUREMENT_ID` instances |

## Adding a book

1. Add cover JPG to `assets/covers/` (600×800px, under 200KB)
2. Add entry to `books.json` `books` array — `category` must match an existing category `id`
3. Commit and push to `main`
