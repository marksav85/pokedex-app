# Pokédex

A small portfolio app for browsing the first 120 Pokémon from [PokéAPI](https://pokeapi.co/).

[Open the live application](https://marksav85.github.io/pokedex-app/).

- Type-colored cards show shiny sprites and Pokédex entry numbers.
- Search names within the loaded list; matching is case-insensitive. Clear search to restore all cards.
- Open a card with the mouse, Enter or Space to view height in metres, types and all listed abilities.
- Loading, no-results and request failures have visible feedback. Open a failed card again to retry details; reload to retry the initial list.
- Details are cached in memory for the current page session, with at most six concurrent JSON requests.

Built with HTML, CSS and vanilla JavaScript, Bootstrap 4.3.1, jQuery 3.3.1 and Popper.js 1.14.7. UI libraries and fonts load from CDNs; Promise/fetch polyfills and tota11y are included locally. There is no backend, package installation or build step.

## Run locally

From the repository root, with Python 3 installed:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000/`. Stop the server with Ctrl+C. Active files are `index.html`, `src/js/bs-script.js` and `src/css/styles.css`; `dist/` and `vanilla/` contain historical work and are not used by the main page.

Optional dependency-free source-level regression checks require Node.js 18 or newer:

```sh
node tests/stabilization.test.cjs
```

These checks use fixture responses and a small DOM double; they do not verify visual layout or Bootstrap/browser keyboard and focus behavior.

## Limitations

Internet access to PokéAPI, sprite hosting and CDN assets is required. Search covers only the first 120 Pokémon. Cached details are cleared on reload; missing sprites display an image-unavailable message.

Target current Chrome, Firefox, Safari and Edge with native fetch and AbortController support. Internet Explorer 11 is unsupported. Cross-browser, desktop/mobile visual and modal focus verification remains pending; previous blanket compatibility claims were not verified. Bootstrap/jQuery versions are intentionally retained for this stabilization stage; dependency modernization is deferred.

The live deployment may lag local changes; this stabilization work does not deploy automatically.
