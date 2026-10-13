# Pokédex — Pokémon Explorer

A responsive Pokémon explorer built with vanilla JavaScript and the PokéAPI REST API. This personal portfolio project demonstrates frontend development, external API integration and interactive data presentation.

**[Explore the live app](https://pokedex.marksavilledesigns.com/)**

## Features

- Browse the first 120 Pokémon in a responsive card grid with official artwork, Pokédex numbers and type badges.
- Search by name with case-insensitive matching, clear/reset controls and no-results feedback.
- Open an interactive detail modal to view types, all abilities, height in metres, weight in kilograms and a short English Pokédex description.
- Switch between normal and shiny artwork, with sprite fallbacks when artwork is unavailable.
- View six labelled base statistics with visual bars.
- Use native keyboard controls, visible focus states and loading, empty and error feedback across desktop and mobile layouts.

## Technology

HTML5, CSS3, vanilla JavaScript and the PokéAPI REST API. The interface uses CSS Grid/Flexbox, native browser fetch and an HTML `<dialog>`; no frontend framework or build step is required.

## Technical highlights

- Asynchronous requests share in-memory caches, reusing both pending requests and successful responses. A shared queue limits concurrency to six JSON requests.
- Species descriptions load only when details are opened. Selection guards prevent late responses from replacing the current Pokémon or artwork variant.
- The native dialog handles detail interactions, with Escape-to-close, scroll locking and focus restoration.
- Request timeouts, independent description retries and image fallbacks support partial failures. A 23-case regression suite covers data handling, search, caching, artwork and dialog handlers using fixtures and a DOM double.

Search is limited to the loaded 120 Pokémon. Current browsers with native dialog, fetch and AbortController are the intended target; the automated tests do not constitute a cross-browser or accessibility audit.

## Credits

Pokémon data comes from [PokéAPI](https://pokeapi.co/). Artwork and sprite resources are supplied through the [PokéAPI sprites repository](https://github.com/PokeAPI/sprites), including community-created shiny artwork variants.

This is an unofficial portfolio project and is not affiliated with Nintendo, Game Freak or The Pokémon Company.
