# Consolidated findings

> Historical Task 1/2 records retained below. See the dated Task 3 update at the end for current implementation and verification status.

Date: 2026-10-13. Priorities reflect a secondary portfolio demonstration. No critical exposure or data-loss issue established.

| ID / finding | Evidence and status | Impact | Priority | Suggested action |
| --- | --- | --- | --- | --- |
| F1 Keyboard-inaccessible cards; missing modal image alt | Confirmed source defects, bs-script.js:143,205–229,373–375 | Excludes keyboard browsing; incomplete image semantics | High | Native accessible trigger, descriptive alt, verify focus |
| F2 Mislabelled height | Confirmed source defect, :243,254,295; API schema in report 04 | Incorrect displayed information | Medium | Convert decimetres to metres |
| F3 Error handling/loading disconnected from requests | Confirmed source, :281–315; visible failures untested | Blank/incomplete UI and possible follow-on exceptions | Medium | Check HTTP response, propagate/handle errors visibly; real pending state |
| F4 No-match search retains previous result | Confirmed source, :89–96 | Misleading results and intrusive alerts | Medium | Render inline empty state and update visibility |
| F5 Ability rendering follows type count | Confirmed source logic, :238–256; affected records unverified | Omitted abilities / potential undefined access | Medium | Map all ability entries independently |
| F6 Redundant unbounded fetches | Confirmed call graph, :146,221,334,409; 361 initial API calls calculated | Avoidable load, races and slow rendering risk | Medium | Reuse details/promise and derive color from fetched type |
| F7 Old CDN UI dependencies | Bootstrap 4.3.1, jQuery 3.3.1, Popper 1.14.7, index.html | Maintenance/security risk; exploitability not established | Medium | Review advisories and smallest compatible dependency change |
| F8 README claims and no validation instructions | README vs code/configuration | Misleads portfolio reviewers and maintainers | Medium | Correct compatibility/error claims, document static setup/live URL |
| F9 Historical alternate assets missing | v-index.html local paths absent | Alternate entry cannot load intended implementation | Low | Decide archival/public role before correction/removal |
| F10 Tooling/artifact ambiguity | No tests/manifests/build; unused dist; ESLint single quotes vs active double quotes | Harder reproducibility; risk editing wrong entry | Low | Identify active source, document lightweight checks |
| F11 Visual/mobile/contrast uncertainty | CSS/HTML only; report 04 | Portfolio presentation unknown | Investigation | Approved rendered desktop/mobile/accessibility check |

## Dependency and security interpretation

Bootstrap 4 is end-of-life since 2023-01-01: [official support status](https://getbootstrap.com/docs/4.6/end-of-life/). This is a confirmed maintenance concern, not proof the app is broken. Updating within Bootstrap 4 does not restore upstream support; assess a bounded supported-library path separately if necessary, without changing the visual design.

jQuery 3.5.0 fixed an HTML-processing security issue relevant to older releases: [official release note](https://blog.jquery.com/2020/04/10/jquery-3-5-0-released/). The app loads 3.3.1, but inspected application code inserts API text through innerText. Presence of an older affected library does not establish an exploitable application input path. No complete advisory scan, precise Popper vulnerability finding or vendored-polyfill version audit was performed. Avoid a claim that dependencies are secure or actively exploited.

CDN integrity attributes and HTTPS are strengths. Browser-specific security behavior, response headers/CSP, CDN failures and third-party script supply chain remain unverified. No accounts, secrets or sensitive stored data identified in active source. The included tota11y developer tool adds approximately 256 KiB uncompressed on disk; network/compression/runtime cost unmeasured. Consider making it development-only if browser evidence supports doing so.

## Maintainability strengths and limits

One small module and static page are appropriate; no framework migration is needed. Names/data and text DOM construction are straightforward. Mixed networking/rendering/search responsibilities, repetitive type table creation (unused effectiveness strings), debug logs and unused variables are modest cleanup candidates. Split responsibilities only where it directly simplifies fixes; a broad refactor is disproportionate. Fetch completion ordering/modal staleness and API schema assumptions need targeted verification.

## Task 2 finding disposition — 2026-10-13

The consolidated table above remains the assessment baseline. Current dispositions:

| Finding | Current state |
| --- | --- |
| F1 | Native stretched-link button, focus outlines and descriptive image alt implemented; Bootstrap keyboard/focus journey still needs browser review |
| F2 / F5 | Height conversion and independent ability/type mapping corrected; fixture checks pass |
| F3 | HTTP/schema/timeout checks, pending and failure messages, image fallback and retry behavior implemented; source-level checks pass |
| F4 | No-match hides old results, shows inline status, clear restores cards and form submit is prevented; fixture checks pass |
| F6 | Shared detail promise/data cache, six-request queue and stale-modal guard implemented; call-count/concurrency/race tests pass |
| F7 | Intentionally unchanged per Task 2 direction; dependency support/advisory concerns remain deferred |
| F8 | README corrected; official live URL supplied and HTTP availability verified; browser support described as a target, not a verified matrix |
| F9 | Historical vanilla/ untouched, as required |
| F10 | Dependency-free regression tests added; historical dist/tooling and existing lint-style mismatch remain outside scope |
| F11 | Rendering/contrast/mobile/focus evidence still unavailable; no browser connected |

No new framework or build tool was introduced. AbortController requires a current supported browser; retained compatibility polyfills do not imply IE11 support. Cache is not persistent and request failures can be retried by reopening a card; initial failure asks for page reload. CDN failures remain an external dependency risk, and the old libraries/tota11y, bright type-color contrast and historical asset paths remain candidates for later review rather than unapproved changes here.

## Task 3 risk disposition — 2026-10-13

Active Bootstrap/jQuery/Popper/tota11y dependencies and associated hooks/utilities are removed; files remain for historical use. This resolves the application's dependence on their old CDN UI versions, without claiming a complete security audit of retained helpers. No new framework/dependency or publisher workflow was introduced.

Core safeguards remain: HTTP/schema/timeout checks, failure eviction, bounded requests, in-flight/success caching, accessible native controls, visible errors and latest-selection guards. Missing weight/stats/artwork do not invalidate otherwise usable core data. Species-only failure is local and retryable. General descriptions carry no game-version claim; actual variant URLs replace generated hue-rotation behavior.

Highest remaining uncertainty is native-browser accessibility/rendering: dialog focus/inertness/scroll behavior, narrow layouts, real images and visual fidelity have not been tested. Artwork is larger than former sprites, mitigated by reserved image areas/lazy loading; network cost is unmeasured. Current-browser dialog/fetch/AbortController support is required; no IE11 fallback was added. Keep external API/font/image reliability and retained vendored-helper review separate from the approved scope. Historical files and companion expansion remain untouched.
