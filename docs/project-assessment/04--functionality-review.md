# Functionality and visual review

> Task 1 baseline retained below. See the dated Task 2 update at the end for current implementation and verification status.

Evidence: repository inspection, relative-path diagnostics and syntax checks, not browser execution. **No user journey has been verified working and no browser failure was reproduced.** Confirmed source defects below mean demonstrable implementation problems, not runtime test results.

| Feature | Present | Verification / evidence |
| --- | --- | --- |
| List of 120 Pokémon | Yes | Untested; list loader and card generation exist |
| Shiny sprite, entry number, type color | Yes | Untested; details/color fetched separately |
| Case-insensitive search and clear | Yes | Untested; filter compares lowercase names |
| No-match search | Yes | Confirmed source defect: alert then early return leaves previous cards visible (`bs-script.js:89–96`) |
| Detail modal | Yes | Untested opening/closing/focus; Bootstrap data attributes and click handler |
| Height in metres | Yes | Confirmed source defect: raw API decimetres displayed with m (`243`, `254`, `295`); value is ten times metres. [API schema](https://pokeapi.co/docs/v2) |
| Abilities | Yes | Source couples ability count to type count (`238–256`); single-type branch omits further abilities; dual-type branch assumes index 1. Actual affected records/runtime failures not sampled |
| Loading state | Yes | Confirmed source defect: fixed 2-second timer independent of requests (`307–315`), not completion feedback |
| Offline/error feedback | No usable visible handling found | Catch blocks log to console and swallow rejection; detail consumers continue. README friendly-error claim unsupported (`281–302`) |
| Keyboard card activation | No | Confirmed source defect: clickable div with type=button, no tabindex/keyboard handler/native button (`143`, `205–229`) |
| Responsive layout | CSS present | Untested; competing w-25/grid/min-width classes, col-xxl-2 absent from Bootstrap 4; modal uses two columns with large text |
| External links/navigation | Yes | Untested; mobile collapse requires CDN Bootstrap |
| Alternate vanilla page | Files present | Confirmed missing CSS, script and favicon relative paths in v-index.html (filesystem check); not active root app |

Other accessibility evidence: search aria-label, page lang, modal labeling and close label are present. Modal image has no alt (`373–375`); card alt is generic. Loading/no-results feedback has no live status region. Focus return/trapping, contrast and screen-reader behavior are untested. Enter in the search form has no submit prevention; potential page reload requires browser check. Fast repeated modal clicks may show stale results because responses are not guarded; not reproduced.

## Visual design: Undetermined

No rendered UI or screenshot was available. Source suggests a coherent gradient background, rounded type-colored cards, hover shadows, search and one detail modal; this supports preserving the concept, not a judgment that the finished layout is presentable. White text on bright type backgrounds, colored modal text on white, card sizing and mobile modal fit warrant checks; no measured contrast/overflow defect is asserted.

Provisional approach: preserve visual identity and allow minor refinement after browser evidence. No evidence justifies redesign or Stitch work. Preserve browse/search/clear/detail/close and mobile navigation journeys. Technical stabilization can precede a design decision; substantial redesign would require separate approval and the workflow's Predev 4/Stitch route.

## Checks not completed

Local app/browser execution requires separate permission under the brief; no server was started. No installation was attempted or needed for source review. Automated tests/build/audit/outdated commands unavailable without manifests/test tooling. GitHub Pages lookup via web tool returned an internal retrieval error; not an HTTP outage finding. API/CDN runtime success, deployment revision, complete journeys, offline/slow-network states, mobile screenshots, browser compatibility, performance metrics, focus and contrast remain unverified. README IE11 claim conflicts with untranspiled arrow functions/template literals; provided Promise/fetch polyfills do not transform syntax.

## Task 2 implementation and verification — 2026-10-13

The preceding table is the historical Task 1 baseline. The following supersedes its active-source defect status without asserting browser verification.

### Runtime baseline evidence

A temporary Python HTTP server was started on loopback (sandbox socket access required an approved escalation). HTTP retrieval worked locally. Live HTML, bs-script.js and styles.css were retrieved successfully and matched the local baseline byte-for-byte. Two documented API GETs retrieved Bulbasaur and Charmander: height 7/6 decimetres; Bulbasaur grass/poison with overgrow/chlorophyll, Charmander fire with blaze/solar-power. No full live 120-item API batch was requested.

Browser tooling: Chrome creation failed because Chrome was unavailable; the surface inventory then returned no browsers/apps. Main journeys, desktop/narrow mobile rendering, console/network panels and before/after screenshots could not be inspected. HTTP/source comparison is not visual comparison. The earlier web-tool retrieval error was a tooling limitation, not an outage finding.

### Automated source-level results

`node tests/stabilization.test.cjs`: **11 tests passed, 0 failed**. Uses synthetic responses, public sample values and a minimal DOM double. Optional original-source comparison adds one passing baseline test (12 total). No application dependencies installed.

| Check | Result / evidence limits |
| --- | --- |
| 120 cards, IDs, shiny image URL and original grass color | Pass in fixture DOM; no image rendering/network transfer verification |
| Heights and varying type/ability counts | Pass: 0.7/0.6 metres; one/two types; zero/one/two/three abilities without invalid access |
| Matching/case-insensitive/clear/no-match search | Pass in DOM double; no-match hides all cards and exposes inline status |
| Form submission | Pass: handler calls preventDefault; real browser Enter not exercised |
| Accessible trigger and image alt | Native type=button with Bootstrap attributes; descriptive shiny alt asserted; CSS focus outlines added |
| Pending list/card/modal requests | Pass: overlay follows initial request, cards show pending feedback, busy state lasts until details settle |
| Empty list, network failure, non-2xx, malformed JSON/list/detail data | Pass: concise visible feedback and settled loading state; no unsafe modal rendering |
| Failed details and retry | Pass: failed cache entry removed, reopen retries, card/modal recover, successful repeat uses cache |
| Missing/failed sprites | Pass: fallback text and hidden failed card image |
| Rapid selections / close during request | Pass: older successes/errors do not replace a newer selection; closed modal is not populated late |
| Stalled request | Pass: simulated 15-second timeout aborts request and clears initial loading |
| Fetch count / concurrency | Fixture measurements: 361 old, 121 new, peak six; repeat cached access adds zero JSON calls |
| Syntax / patch whitespace | node --check and git diff --check pass |
| Actual Bootstrap focus trap/return, Escape, backdrop and keyboard Enter/Space | Untested; retained Bootstrap data API/native button semantics |
| Desktop/mobile layout, contrast, cross-browser, live console errors | Untested; no connected browser |

### Presentation and scope

Classification remains **Undetermined** because rendered evidence is unavailable. The gradient, rounded cards, layout classes, shiny sprites, original type palette and modal structure were retained. Buttons inherit the heading appearance; added focus outlines, neutral pending/failed card color and concise status text support the approved accessibility/loading fixes. No layout redesign or responsive CSS restructure was attempted. Visual equivalence is an implementation intention, not a verified screenshot result. Existing concerns about bright-color contrast and mobile modal fit remain for browser review.
