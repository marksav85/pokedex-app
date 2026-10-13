# Project overview

> Historical Task 1/2 records retained below. See the dated Task 3 update at the end for current implementation and verification status.

Assessment date: 2026-10-13. Assessment-only; workflow: `../workflow--application-review-and-modernization.md`.

## Project brief

Originally a JavaScript learning/portfolio demonstration; one of 14 projects under review and an additional rather than featured project. Intended audience: prospective employers, clients and portfolio visitors. Objective: establish current condition and whether limited maintenance improves its suitability, including the possibility of leaving it unchanged. No defects were reported beforehand; functionality, dependencies, accessibility, presentation, deployment and documentation were investigation areas.

Preserve purpose, browsing/search/detail journeys and simple architecture. Prefer minor improvements; no new major features, technology replacement for novelty, or assumed redesign. Authorized: repository/history inspection, non-destructive diagnostics, external reference review and these reports. Not authorized: application/configuration edits, installation, local application execution, fixes, branch changes, commits, pushes or deployment changes.

## Actual application

A static, client-rendered Pokédex: fetch the first 120 Pokémon, display shiny sprites and entry numbers in type-colored cards, filter names and show height/types/abilities in a Bootstrap modal. Root `index.html` is the active entry point.

Stack: HTML, CSS, plain JavaScript with an IIFE repository module; Bootstrap 4.3.1, jQuery 3.3.1 and Popper.js 1.14.7 via CDN; local Promise/fetch polyfills and tota11y 0.1.6. No React, backend, authentication, database, package manifest, lockfile or build pipeline. No required environment variables were identified.

README claims GitHub Pages deployment but supplies no URL. The conventional URL inferred from the remote could not be retrieved by the web tool; availability and deployed revision remain unknown. This is not evidence of an outage.

No documented development/test/build commands. A static HTTP server would be sufficient for a future approved local check; no dependency installation is inherently required.

## Current apparent condition

Small and understandable architecture, HTTPS integrations and text-based DOM insertion are sound foundations. Static findings justify bounded maintenance, but successful user journeys and visual presentation have not been verified. Do not describe it as fully working or ready to showcase on present evidence.

See [functionality](04--functionality-review.md), [risks](05--technical-risks.md) and [recommendations](06--recommendations-and-plan.md).

## Task 2 stabilization update — 2026-10-13

Task 2 supersedes the assessment-only permissions for this stage: active source edits, local static serving, browser inspection and proportionate tests were authorized. Only stabilization was approved; expansion, redesign and architecture evaluation remain future work.

The user confirmed https://marksav85.github.io/pokedex-app/ as the official live URL. HTTP retrieval of its HTML, active script and CSS succeeded via an approved network diagnostic. All three matched the pre-change local files byte-for-byte. Local static serving also succeeded. No browser was connected, so there is still no rendered visual or browser journey verification.

Targeted fixes are implemented locally: correct height/all abilities, native card buttons and image alt, complete search states and submit prevention, real pending/failure feedback, shared cached details, six-request concurrency and stale-modal guards. Stack and 120-item scope remain unchanged. README now documents actual setup/features/limitations and the live link. Source-level tests pass; this does not establish production readiness or browser accessibility. Changes are not committed or deployed. See the Task 2 verification in report 04.

## Approved Task 3 implementation — 2026-10-13

The approved Lumina Dex / Stitch redesign is implemented locally using standard CSS and the existing vanilla-JavaScript repository module. The first 120 Pokémon, name-only search and stabilization protections remain. Cards now show normal official artwork, three-digit IDs and type badges; a native dialog adds normal/shiny selection, kilograms, a general English description and six labelled base-stat bars while retaining metres, types and all abilities.

Bootstrap, external jQuery, Popper and tota11y are no longer loaded. Native dialog/standard CSS replace their active behavior; Promise/fetch polyfills and historical files remain. Documentation and tests are updated. 23 fixture/source regression cases pass; no browser is connected, so rendering, native focus/inertness and cross-browser behavior remain unverified. Changes are uncommitted and undeployed. See report 07's completion record.
