# Operations Runbook

## Service overview

Pokédex is a static website published at [pokedex.marksavilledesigns.com](https://pokedex.marksavilledesigns.com/). The owner reports that it is hosted by GitHub-connected Cloudflare Pages. This repository contains no Cloudflare configuration, deployment workflow, production branch setting, monitoring setup or rollback record; confirm those details in the authorized Cloudflare/GitHub project before an operational change.

The production site is HTML, CSS and JavaScript files. It requires no Node server, npm install or build step to run in production. Browser access to PokéAPI and referenced artwork/font hosts is required for the complete experience.

## Local development

Requirements: a modern browser; Node.js 18 or newer and npm for the formatter and built-in test runner. A local static server is useful because it exercises the same file-serving model as deployment.

From the repository root:

```sh
npm ci
python3 -m http.server 8000
```

Open `http://localhost:8000/`. Stop the server with Ctrl+C. `npm ci` installs the development tooling from the lockfile; it is not needed to serve the production site.

## Checks before release

Run the checks relevant to the change:

```sh
npm run format:check
node --test tests/stabilization.test.cjs
node --check src/js/bs-script.js
node --check tests/stabilization.test.cjs
git diff --check
```

`npm run format` writes only the four approved HTML, CSS, JavaScript and test paths. Review its diff before release. The tests use a DOM double and do not verify real browser layout, native dialog behavior or live API availability.

## Deployment and post-deployment checks

The owner reports a GitHub-connected Cloudflare Pages deployment. Verify the configured production branch and environment in the project dashboard; the repository does not establish which branch triggers production deployments. Release only through the approved repository workflow and authorized account. Do not change dashboard settings as part of routine source work.

After the Pages deployment reports success, open the production URL and check that the page loads, the catalog populates from PokéAPI, name search filters results, a detail dialog opens and closes, and normal/shiny artwork controls behave when those assets are available. Check a narrow and wide viewport manually. A successful deployment status alone does not verify these user paths.

No automated monitoring, alerting, backup or tested rollback procedure is documented here. If a release causes a problem, inspect the Pages deployment/build status and browser console/network errors, identify whether the issue is static asset delivery or an external provider, and use Cloudflare Pages' available deployment controls only with owner authorization. Confirm the available rollback procedure with the project owner before relying on it; it has not been verified in this repository.

## Troubleshooting

| Symptom | Checks and response |
| --- | --- |
| Catalog does not load | Check browser connectivity and the PokéAPI request in the network panel. The app reports a load error; retry after the API/network recovers. |
| Some details or descriptions fail | Check the corresponding PokéAPI response. Detail failures can be retried by reopening a card; description failures have a separate retry control. |
| Artwork is missing | Check the image request and API-provided URL. The app tries the same variant's sprite where available; a missing shiny asset may be unavailable. |
| Recent static changes do not appear | Confirm the deployed Pages revision, then reload without the browser cache. The repository does not document custom cache headers or a CDN purge procedure. |
| Formatting check fails | Run `npm ci` if development dependencies are absent, then `npm run format:check`. Review the four-path diff before using `npm run format`. |

## Maintenance and ownership gaps

Keep application changes in the source files and run the checks above. Update the Handbook when implementation decisions or important constraints change; update this Runbook when verified operating or release steps change. Keep secrets out of the repository; no application secrets or server-side configuration are currently identified.

The current repository does not identify Cloudflare account owners, configured production branch, monitoring, deployment notifications, cache policy or verified rollback steps. Confirm these with the project owner/operator before relying on them.
