# Pokédex

A small portfolio app for exploring the first 120 Pokémon from [PokéAPI](https://pokeapi.co/), using the approved Lumina Dex / Stitch visual direction.

[Open the live application](https://marksav85.github.io/pokedex-app/). Deployment uses the existing GitHub Pages source: the root of the `gh-pages` branch.

- Responsive dark card grid with normal PokéAPI Official Artwork, three-digit numbers, names and type badges.
- Case-insensitive name search, clear/reset controls and no-results feedback within the loaded 120 Pokémon.
- Keyboard-accessible cards open a native dialog with artwork, types, height in metres, weight in kilograms, all abilities, a general English Pokédex description and six labelled base-stat bars.
- Normal/shiny controls use actual image URLs, not color filters. Artwork falls back to the matching variant's default sprite, then a visible unavailable message. Missing shiny sources disable that option.
- Pending, empty and failed requests have visible feedback. Reopen a failed card to retry core details; retry a failed description inside the dialog; reload to retry the initial list.

Built with HTML, standard CSS and vanilla JavaScript. No Bootstrap, jQuery, Popper, active tota11y, Tailwind, frontend framework, backend or build step. Plus Jakarta Sans loads from Google Fonts with a system fallback. Native Promise and fetch are required; no compatibility polyfills are loaded.

## Run locally

From the repository root with Python 3 installed:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Stop with Ctrl+C. Active files are `index.html`, `src/js/bs-script.js` and `src/css/styles.css`; no application dependency installation is required.

Dependency-free regression checks require Node.js 18 or newer:

```sh
node tests/stabilization.test.cjs
```

The tests use fixture responses and a small DOM/dialog double populated from the actual HTML. They verify data, caching, search, errors, artwork variants and dialog handlers. They do not verify native keyboard activation, focus containment/background inertness, visual layout or real image/font loading.

## Data and limitations

Successful initial loading uses one list request and 120 detail requests. English descriptions load only when a Pokémon is opened: one additional JSON request per distinct species, cached for the page session. At most six JSON requests run concurrently; stalled requests abort after 15 seconds. Reopening cached details and changing artwork variants add no JSON requests. Images are separate network requests, with below-the-first-row artwork lazy-loaded.

Descriptions are general Pokédex entries, without a selected game version. Base-stat bars use a 255-point display scale alongside actual numeric values; they are not calculated battle stats. PokéAPI's official-artwork directory supplies both variants; its sprite repository credits community contributors for custom shiny renderings.

Internet access to PokéAPI, artwork hosting and fonts is required. Search is name-only and limited to the first 120 Pokémon. No filters, sorting, accounts, favorites, parties, evolution, comparison or companion expansion are included.

Target current Chrome, Firefox, Safari and Edge with native HTML dialog, fetch and AbortController. Internet Explorer 11 is unsupported. Browser tooling was unavailable during implementation. The developer subsequently reviewed the preview and confirmed the main interface, artwork, search and detail modal appear correct. Production desktop/mobile checks, detailed modal accessibility and cross-browser verification remain pending.
