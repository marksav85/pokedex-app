# Pokédex project instructions

## Project and architecture

- This repository contains a static Pokémon explorer for a personal portfolio. It uses HTML, CSS, vanilla JavaScript and the PokéAPI REST API; there is no frontend framework, production build step or Node server.
- `index.html` defines the page and native detail dialog. `src/css/styles.css` contains responsive layout, visual states and accessibility-related styles. `src/js/bs-script.js` loads and normalizes API data and implements search, cards, caching, error handling and dialog interactions. `tests/stabilization.test.cjs` contains the dependency-free Node regression suite.
- `img/` contains the favicon set and page overlay image. Pokémon artwork and sprites are fetched from PokéAPI-provided URLs.

## Development conventions

- Preserve the existing static architecture and keep changes focused. Do not add frameworks, build tooling or dependencies without explicit owner approval.
- Use the repository Prettier settings (`.prettierrc.json`). `npm run format:check` checks only `index.html`, `src/css/styles.css`, `src/js/bs-script.js` and `tests/stabilization.test.cjs`; `npm run format` writes only those files.
- Run the existing regression suite with `node --test tests/stabilization.test.cjs`. The applicable syntax checks are `node --check src/js/bs-script.js` and `node --check tests/stabilization.test.cjs`.
- npm dependencies are for development tooling. The deployed application is static and does not require npm installation or a build to serve.

## Workspace and external references

- Treat this repository as the only writable project repository in this session. Do not modify other repositories.
- `docs/planning/` contains deferred expansion plans. It is protected, excluded from Git, and must not be opened, formatted, moved, staged, deleted or otherwise changed unless the owner gives new explicit instructions.
- The MSD Projects Playbook reference checkout is `/home/marksav85-x1/Development/projects--development/msd-projects-playbook`. It is read-only from this project. Consult only relevant documents under the standing read authorization; do not copy its files, add it as a submodule, or change its Git state.
- Follow the active global workspace-safety instructions for repository boundaries, approvals, external access and deployment. Read access is not write authorization. Ask for owner approval before implementation or deployment when the task does not already authorize it.
