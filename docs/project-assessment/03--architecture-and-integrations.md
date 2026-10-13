# Architecture and integrations

> Task 1 baseline retained below. See the dated Task 2 update at the end for current implementation and verification status.

```text
index.html + active CSS + CDN UI libraries + local helpers
  -> bs-script.js IIFE: in-memory Pokémon array
  -> PokéAPI list (limit=120)
  -> per-item details / primary type colors
  -> DOM cards -> search visibility / Bootstrap modal
  -> remote sprite images
```

The initial list response populates names/details URLs (`bs-script.js:265–284`). Card creation starts two detail requests: color and sprite/data (`140–224`). The outer loop starts a third request for color whose result is discarded (`405–410`). Thus source initiates 1 + 3×120 = 361 API fetch calls on a successful full list, excluding sprites/CDNs; actual transfers/cache reuse were not measured. Modal clicks fetch details and color again. Stored details are not reused to avoid fetching; there is no explicit resource/promise cache or concurrency bound.

Search is case-insensitive substring filtering of the loaded 120 records, not an API-wide search. Data lives only in memory. No routes beyond the static pages, backend, write API, accounts or persistent application storage.

External dependencies: PokéAPI JSON, sprite URLs supplied by it, jsDelivr (Bootstrap/Popper), code.jquery.com, Google Fonts, and outbound Bulbapedia/PokéAPI links. UI depends on CDN scripts loading; API and image availability affect content. The font is requested but active CSS does not explicitly apply Roboto. Bootstrap assets, Popper and jQuery have integrity/crossorigin attributes; hashes and runtime load success were not validated.

PokéAPI is a public consumption-only API without authentication; its fair-use guidance asks clients to cache resources. [Official API documentation](https://pokeapi.co/docs/v2). No application secrets are needed. Text uses innerText rather than API-derived HTML, reducing injection exposure; remote URLs are still trusted and no response.ok/schema checks are present. No observed user-controlled HTML injection path; this is not a penetration test.

Hosting appears intended to be static GitHub Pages from README/remote. Publish source, settings, headers and actual deployment revision are unknown; no deployment automation exists in the repository. No infrastructure changes are needed to assess the basic design.

## Task 2 data-flow update — 2026-10-13

The earlier 361-call description is the preserved pre-change baseline. Current flow remains the same IIFE/static DOM architecture, with a small shared JSON request queue (maximum six active) and a Map keyed by detailsUrl caching both pending promises and successful details. Failed entries are removed so reopening a card can retry. Color derives from the already-loaded first type; opening a cached card does not refetch details or color. Cache is page-session memory only.

Full successful initialization now calculates 1 list + 120 details = 121 JSON requests, excluding sprites/CDNs. The fixture-based call counter measured the same: 361 old / 121 new and a peak of six new concurrent JSON requests. This is not a measurement of live network transfers or performance. Failed details add a request only when explicitly retried; reload starts a new session.

Responses require HTTP success and usable JSON schemas; active requests have a 15-second AbortController timeout. Current browsers with native fetch/AbortController are the supported target; no IE11 support is claimed. Height stays in decimetres in cached data and is divided by ten for display. Types and abilities are mapped independently. A selection counter invalidated by a new selection or modal hide prevents late results/errors from replacing the current view. Bootstrap's data API continues to handle modal opening, closing and focus; actual focus behavior remains unverified.
