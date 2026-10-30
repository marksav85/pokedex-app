# Development Handbook

## Project context and scope

Pokédex is a static portfolio application for browsing the first 120 Pokémon. The current implementation uses HTML, CSS and vanilla JavaScript with PokéAPI. There is no framework, backend, persistence layer or production build process. The public URL listed in the README is `https://pokedex.marksavilledesigns.com/`; deployment history and live behavior are not verified by this source review.

## Architecture and data flow

- `index.html` provides the catalog shell, search form, status regions, footer and native `<dialog>`. It loads `src/js/bs-script.js` after the page markup and links `src/css/styles.css` directly.
- `src/js/bs-script.js` requests the Pokémon list (`limit=120`), validates its response and creates in-memory catalog entries. It loads details for cards, normalizes optional fields, and creates DOM nodes with text content for API-derived strings.
- Details and species data are cached by URL as pending promises and successful responses. A shared queue caps JSON request concurrency at six. Interactive requests can be moved forward in the queue; failed cache entries are removed to allow retry.
- Species descriptions are fetched on demand when a detail dialog opens. The UI normalizes description whitespace, selects an English entry and leaves core details usable if the species request fails.
- `src/css/styles.css` owns layout and presentation, including responsive grid breakpoints and dialog layout changes.

## Implemented features

The page supports name search across the loaded catalog, progressive card loading, type badges, Pokémon details and base statistics, metric height/weight, normal and shiny artwork, and sprite fallbacks. Request timeouts and loading/error states cover failed and stalled API requests. Selection counters guard against late detail, species and image callbacks updating a newer or closed dialog. The native dialog supports close-button and Escape dismissal, backdrop handling, scroll locking and focus restoration.

The HTML and generated interface include a skip link, semantic landmarks, labelled controls, live status regions, visible focus styles, reduced-motion handling and responsive layouts. These features are implementation evidence, not a substitute for a manual accessibility or cross-browser review.

## Engineering decisions and constraints

- The application remains framework-free and serves directly as static files.
- Native `fetch`, `AbortController` and `<dialog>` provide browser capabilities without a UI runtime dependency.
- PokéAPI is the source of catalog, detail and species data; artwork URLs are presented from API response fields with same-variant sprite fallback.
- Search only covers the first 120 loaded records. Catalog content depends on network access to PokéAPI; fonts also reference Google Fonts.
- The repository currently has no server-side secrets, account flow or application database.

Historical modernization details, including the prior UI dependency and hosting transition, are owner-reported context and are not independently established by the current source tree.

## Development and verification

Install the locked development tooling with `npm ci`. The available checks are:

```sh
npm run format:check
node --test tests/stabilization.test.cjs
node --check src/js/bs-script.js
node --check tests/stabilization.test.cjs
```

`npm run format` applies Prettier only to the four approved active HTML, CSS, JavaScript and test files. Formatting does not include Markdown documentation.

The regression suite has 23 named test cases using Node's built-in test runner, fixtures, a VM and a small DOM double. It exercises API validation and failures, data normalization, caching/concurrency, search, card and dialog handlers, artwork switching/fallbacks and stale asynchronous responses. It does not emulate browser layout, real native dialog focus containment, actual image loading or production networking. See [the Operations Runbook](operations-runbook.md) for local serving and release checks.

## Issues, limitations and future work

No significant historical incidents are recorded in the evidence available for this handbook. Current technical limitations include the fixed 120-item search scope, reliance on external API/assets, and lack of a browser automation or cross-browser suite. Desktop/mobile appearance, real artwork availability, live API behavior and production deployment have not been independently verified in this documentation task. Deferred expansion plans remain in the protected `docs/planning/` directory and are intentionally not reproduced here.

## Evidence and references

- Main source: `index.html`, `src/css/styles.css`, `src/js/bs-script.js`
- Tests: `tests/stabilization.test.cjs`
- Tooling: `package.json`, `package-lock.json`, `.prettierrc.json`
- Public overview: `README.md`
- Operations: [Operations Runbook](operations-runbook.md)
