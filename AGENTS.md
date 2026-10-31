# Pokédex project

## Overview

Pokédex is a static Pokémon explorer for a personal portfolio. It uses HTML, CSS and vanilla JavaScript with PokéAPI; the production site has no frontend framework, server or build step.

## Key files

- `index.html` — catalog page, UI hooks and native detail dialog.
- `src/js/bs-script.js` — PokéAPI requests and normalization, search, card rendering and dialog behavior.
- `src/css/styles.css` — responsive layout and visual states.
- `tests/stabilization.test.cjs` — regression coverage for application logic and UI handlers.
- `img/` — favicon set and page overlay asset.

## Architecture constraint

The page markup and script share element IDs and dialog structure used by the application and regression harness. Preserve those integration points and the direct static delivery model when changing the interface. The browser retrieves catalog data and artwork from PokéAPI.
