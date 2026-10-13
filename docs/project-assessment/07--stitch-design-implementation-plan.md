# Stitch design review and implementation plan

Date: 2026-10-13. **Status: approved and implemented locally; source review and browser verification pending.** The original plan below is retained as the approved specification; its approval requests describe the planning checkpoint, now satisfied. See section 10 for implementation results.

## 1. Scope and evidence

Implement the supplied Lumina Dex visual direction using HTML, standard CSS and vanilla JavaScript, preserving the stabilized 120-Pokémon app. Add only the explicitly required detail information and artwork toggle. No React/Next.js, Tailwind runtime/build, companion expansion, persistent storage or new application architecture.

Reviewed all four `screen.png`/`code.html` pairs and `lumina_dex/DESIGN.md` in [the Stitch reference directory](../../assets/design--stitch/), active HTML/CSS/JS, README, stabilization tests and assessment reports 01–06. Follow the [modernization workflow](../workflow--application-review-and-modernization.md), especially its design handoff, bounded planning and approval checkpoint. The user identifies these designs as approved; no new Stitch generation is proposed. Reopen the design approval route only if substantial changes to that approved direction are requested.

Repository baseline: `main`, HEAD `d849258`; stabilization is now committed in `90aae97`, superseding the historical reports' end-of-Task-2 “not committed” statement. Initial status was `?? assets/`; supplied references were preserved. The deferred planning directory is ignored by .gitignore and is outside this task.

Existing dependency-free regression suite rerun: **11 passed, 0 failed**. This verifies fixture/source behavior, not layout, actual images or browser modal focus. No application browser verification was performed during planning; the supplied screenshots are direct visual evidence of the target.

## 2. Design summary and desktop/mobile reconciliation

| Area | Desktop reference | Mobile reference | Proposed implementation |
| --- | --- | --- | --- |
| Shell | Fixed dark header, luminous Pokéball identity, large “National Catalog” hero, search console, four-card rows | Compact header, search near top, two-card rows, abbreviated introduction | One semantic page; sticky header, compact mobile introduction, centered container up to 1440px |
| Cards | ID/name/types at top, centered artwork, HP meter and arrow at bottom | ID/heart at top, taller artwork area, name/types at bottom; no HP meter | Same DOM: ID header, artwork, name/types footer; reposition identity metadata on desktop. Keep ambient type tint, rounded shape and whole-card activation; omit hearts and HP preview pending approval |
| Detail | Centered panel up to 1024px; artwork/variant controls left (5/12), information right (7/12), 92vh cap | Tall sheet-like panel, handle/close at top, artwork/types, metrics, description, stats and ability blocks stacked | One accessible modal: desktop 5:7 columns at 1024px; single-column mobile with contained scrolling and persistent close access |
| Typography | Plus Jakarta Sans, large hero, compact IDs and uppercase pills | Same family; smaller headings, compact labels | Fluid headings; tabular IDs/numbers, readable body text and consistent semantic hierarchy |
| Depth/color | Dark neutral surfaces, coral accent, teal/blue highlights, subtle glow/blur and background Pokéball watermark | Same, with larger tinted artwork areas | Small CSS token set, all type colors, low-opacity ambient gradients; optional decorative watermark with aria-hidden |

Screenshot exports are 954×1600 (explorer desktop), 390×1600 (explorer mobile), 1280×861 (detail desktop) and 343×1600 (detail mobile). Export dimensions alone do not establish runtime CSS breakpoints.

References are not a single finished responsive specification: desktop explorer HTML uses 1/2/3/4 columns, mobile HTML always two; DESIGN.md specifies two tablet cards. Card ordering and padding of IDs also differ (#001 vs #0001). Recommend two columns from 360px through tablet, four at 1024px+, and a one-column safety layout below 360px/when enlarged text cannot fit. Use three-digit IDs consistently for this scope. Main gaps: 12px on phones, 20px tablet, 28px desktop; outer padding 16/32/48px. Confirm these adaptations during approval/visual review rather than mechanically joining the two exports.

DESIGN.md's YAML canvas (#111319) differs from its prose (#0B0D12); HTML largely uses YAML tokens. Prefer YAML/HTML surface values and screenshot appearance: background #111319, cards #1d1f26, elevated panels #282a30, text #e2e2ea, muted text #94a3b8, coral action #fa6555, teal #57dcbe, blue #9acbff. Apply the documented elemental palette as accent/wash tokens, not automatically as readable text. Validate contrast before choosing badge text colors.

### Elements outside approved functionality

Omit these controls/sections in the proposed baseline, rather than shipping inert buttons:

- Type filters, name-or-number search, ID sorting, density/list-view toggle and back-to-top control.
- Favorites/bookmarks, account/profile, Regions and Type Chart navigation.
- Party/battle roster assignment, comparison, evolution chains, combat weaknesses and audio cries.
- Gender distribution, imperial measurements, Japanese names, genus/category labels and ability-effect prose. Ability names and an optional “Hidden” label use existing detail data; ability descriptions would need extra requests and approval.
- Card HP preview and modal total-stat summary: feasible from already-fetched stats, but not explicitly required; exclude unless approved.

Replace “Gen IX”, “Kanto & Paldea”, 151/1,025 totals and sample entries above #120 with accurate “First 120 Pokémon” wording. Keep API order; search remains by name. Do not reproduce “24h cache TTL”, “Stream Online”, “Live Sync” or latency guarantees: existing caching is in-memory per page session. Footer should identify the portfolio demo and link to PokéAPI/Bulbapedia, preserving useful existing links without a collapsed navigation menu. Do not copy the generated “© 2025 Pokémon Database” ownership claim.

The desktop explorer contains a separate right-hand drawer with incomplete stats and roster actions; use the dedicated desktop/mobile detail designs instead. Shiny toggles in generated HTML only hue-rotate the same image; replace this with actual variant image URLs. Generated `data-alt` is not an accessible alt attribute. These mockup scripts/labels are references, not application code to import.

## 3. Current versus proposed functionality

Preserve: first 120 list, case-insensitive substring name search, clearing/restored cards, no-results feedback, real pending/error/empty states, detail retries, native keyboard activation, request timeouts, shared successful/in-flight caches, six-request concurrency and selection invalidation on close/new selection.

| Current interface/data | Proposed interface/data |
| --- | --- |
| Light gradient, solid type-colored cards, small shiny sprite, name and number | Dark tinted grid cards with normal official artwork, ID, name and all type badges |
| Bootstrap modal with shiny sprite, height/types/abilities | Native responsive dialog with artwork, name/number, types, metres, kilograms, all abilities, English description, six labelled base-stat bars and normal/shiny selector |
| Search cleared by editing input; visible status paragraphs | Explicit clear button and no-results reset action, both clearing the same existing search; themed status areas |
| One cached detail response per Pokémon | Same detail cache extended with artwork/weight/stats/species URL; species cache fetched only for opened details |

New approved requirements are weight, description, base-stat display, card type badges, official artwork and actual normal/shiny selection. Default proposal: normal artwork on cards; modal resets to normal for each new selection. This intentionally changes the old shiny-only presentation and needs confirmation with the plan.

## 4. Files and implementation structure

| File | Bounded proposed changes |
| --- | --- |
| `index.html` | Replace Bootstrap shell/classes with header/main/footer; labelled search form and clear button; status/empty-state regions; grid container; one native dialog with static controls/section scaffolding. Remove approved CDN UI references only after their behavior is replaced |
| `src/css/styles.css` | Translate reference styling into ordinary CSS; replace obsolete active Bootstrap-dependent rules; keep all styling here without a new build system |
| `src/js/bs-script.js` | Retain IIFE, API list and request scheduler; extend normalized detail data, add lazy species cache, card/status renderers, clear-search control, dialog lifecycle and variant state |
| `tests/stabilization.test.cjs` | Preserve behavioral regression cases, adapt Bootstrap/class-specific assertions and DOM double; add artwork/species/stat/weight/variant/close-race cases |
| `README.md` | Document updated interface, browser expectations, dependency decision and optional species requests; retain static-server setup |
| Assessment reports | After implementation, append completed changes and measured verification results; do not rewrite historical findings as browser-verified |

Proposed HTML outline: `header` brand → `main` introduction + labelled search form + status/empty region + `ul` grid of `li` cards → `footer` attribution/reference links; sibling `dialog` contains close button, labelled identity, artwork stage/variant controls, type list, description, `dl` measurements, abilities list and stat rows. Use a native button with phrasing content for each card, or a button within its heading with a CSS overlay; avoid invalid nested buttons, headings/divs inside a button, or duplicating separate mobile/desktop controls.

CSS sections: tokens/reset; shell/typography; search/status; grid/cards/type badges; dialog/content/artwork; stats/controls; responsive/accessibility overrides. Tokens cover surfaces/text/actions/focus/error, 18 types, spacing (4–64px), radii (12/16/24px/pill), container widths and short transition durations. No need to reproduce every generated theme token. CSS Grid/Flexbox replace layout utilities; custom properties supply per-Pokémon type tint. Keep system-font fallback; load Plus Jakarta Sans once. Use a few inline SVG/CSS icons rather than Material Symbols and a second font dependency. Reduced-motion preference disables pulse/shimmer/lift; blur has a readable solid-surface fallback.

## 5. Dependency recommendation and modal behavior

**Recommend removing Bootstrap CSS/JS, external jQuery and Popper from the active page during the approved implementation.** They are no longer necessary once standard CSS and native dialog replace their responsibilities. No package removal is needed: these are CDN tags, not installed dependencies.

Replace every dependency on their grid/utilities, `.d-none`/`.d-inline-flex`, stretched-link, spinner/status utilities, screen-reader class, navbar collapse, modal attributes and `hide.bs.modal` event. Use an explicit hidden-state rule to prevent grid/flex overriding hidden elements. Render existing external links as wrapping plain links; no collapse behavior is necessary. The single application jQuery call listens for modal hide. No application tooltip/popover/dropdown requires Popper.

Use `<dialog>` with `showModal()`, `close()` and `::backdrop`, not a styled div or `open` attribute alone. Native modal dialogs provide background inertness and modality; still implement/test close-button access, sensible initial focus, Escape `cancel`, trigger focus restoration and scroll locking. See [native dialog documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog). Centralize cleanup on close: increment selection token, reset pending UI, unlock scroll, restore saved trigger if visible/connected, otherwise search. Keep close controls outside asynchronously replaced content. Background click closes only when pointer-down/up are outside the actual panel; dragging from content must not accidentally dismiss. Do not claim mobile swipe-to-dismiss; the sheet handle is decorative.

Native dialog is the smallest approach for the current-browser target. If an older-browser requirement emerges, pause to agree a fallback rather than installing a polyfill automatically. Verify keyboard containment, shift-Tab, Escape, background inertness and focus restoration in actual browsers before removing the old modal dependency.

`tota11y.min.js` contains an embedded jQuery 2.2.4 header: removing the external jQuery tag alone does not eliminate all shipped jQuery code. Recommend discontinuing the active tota11y script include as part of the dependency decision, while retaining its file for historical/manual use; it is a developer tool, not required app behavior. Promise/fetch polyfills can remain for this bounded pass; no vendored files/assets are deleted.

## 6. PokéAPI data and request plan

Use existing Pokémon detail responses for the fields below; height is decimetres and weight hectograms. Description comes from a species response. [PokéAPI schema and caching guidance](https://pokeapi.co/docs/v2).

| Requirement | Source / transformation | Additional JSON requests |
| --- | --- | --- |
| Name, number, types, abilities | `name`, `id`, `types[].type.name`, `abilities[].ability.name`; retain all entries, `is_hidden` if labelled | None |
| Artwork variants | `sprites.other['official-artwork'].front_default` / `.front_shiny` | None; images fetched separately |
| Height / weight | `height / 10` metres; `weight / 10` kilograms | None |
| Six stats | Match `stats[].stat.name` to `base_stat`, not array position | None |
| English description | Follow `species.url`; choose first nonempty English `flavor_text_entries` entry, normalize whitespace/control characters | One per uniquely opened species, cached |

The two retained public API samples from Task 2 confirm normal/shiny official-artwork fields, weight, stats and species URLs for Bulbasaur/Charmander. Artwork is also documented in the [PokéAPI sprite repository](https://github.com/PokeAPI/sprites#official-artwork); that repository credits custom shiny artwork contributors, so avoid implying every shiny rendering was publisher-issued. No new bulk API requests were made for this plan.

Keep initial successful JSON count at **121 = 1 list + 120 details**. Fetch species lazily, never 120 upfront: calculated session count becomes **121 + U**, where U is distinct opened species (0–120), excluding failures/retries, images/fonts. Repeat opens/variant toggles add no JSON requests once cached. Maintain successful/in-flight promise caching and failure eviction for both resources, and the shared maximum of six active JSON requests with the existing timeout. A small queue-priority flag can put interactive detail/species work before unstarted background card requests; do not cancel a shared request just because its modal closes.

Render cached core detail information immediately while description loads. Missing English entries show “Description unavailable”; a species request failure shows a local retry action without discarding working core data. Optional missing weight/stats/artwork must not invalidate an otherwise usable detail response. Required list/core failures retain clear feedback and retry behavior. Validate schemas and insert external text through textContent. Every species/render/image callback checks current selection/variant; closing invalidates selection immediately.

Stats order: HP, Attack, Defense, Special Attack, Special Defense, Speed. Use full accessible labels and unambiguous short labels (HP/ATK/DEF/SPA/SPD/SPE); screenshots inconsistently use SPD for Speed. Proposed reference scale: `clamp(value / 255 × 100, 0, 100)%`, preserving the actual numeric value separately. This is a display scale, not calculated battle stats. A missing stat is unavailable, never zero. Use labelled `<meter>` elements styled as bars, or numeric rows with decorative aria-hidden bars. Threshold colors follow DESIGN.md (<50 coral, 50–89 amber, 90–119 teal, 120+ blue); omit continuous shimmer. Color never replaces the numeric label.

## 7. Artwork, states and accessibility

Use normal official artwork on cards; reserve variant selection for the modal. Images use object-fit: contain with reserved aspect-ratio/dimensions, descriptive alt and lazy loading below the first visible row. Load shiny images only when selected. Never use generated Google-hosted reference illustrations or CSS hue rotation.

Recommended fallback per variant: requested official-artwork URL → matching normal/shiny default sprite → labelled image-unavailable placeholder. Announce “Sprite fallback” when applicable. Never label a normal image as shiny. Bound onerror fallbacks to avoid loops; missing shiny sources disable that option with an explanation, and a failed selected image can fall back/show unavailable while Normal remains reachable. This fallback policy requires approval.

State styling must fill gaps in the references: explorer desktop includes an empty state, but screenshots provide no initial loading, offline/HTTP failure or partial-detail examples. Retain existing concise status behavior, themed in dark surfaces: initial pending, individual card pending/error, empty API list, no matches, complete list failure, core modal failure, description-only failure and image failure. Keep pending/error content in reserved card/artwork regions to reduce layout shifts; do not copy static “online” indicators or simulate delays.

Accessibility acceptance: visible search label (not placeholder only); named clear/close/variant controls; native Enter/Space card activation; strong focus ring; no hidden focusable controls; 44px action targets where practical; restrained live-status announcements; dialog title naming; full stat labels/values; badge text plus color; text contrast 4.5:1 (3:1 large text), meaningful controls/focus 3:1. Check 200% zoom/reflow and reduced motion. Avoid reference-wide hidden scrollbars and body overscroll suppression. Mobile dialog fits dynamic viewport height, safe-area padding and internal scrolling; no content clipping, horizontal overflow or duplicated inaccessible panel.

## 8. Implementation stages and verification gates

| Stage | Scope / effort | Gate |
| --- | --- | --- |
| 1 | Approved scope/tokens and fixtures — Small | Record decisions below; retain passing stabilization baseline |
| 2 | Extend data/artwork and lazy species cache — Medium | Correct units/stat mapping/description normalization; missing data and retries pass; unchanged initial request budget |
| 3 | Explorer HTML/CSS/card/search translation — Medium | All 120 cards, name search/clear/empty states and native activation remain correct; compare supplied screenshots with approved omissions |
| 4 | Responsive native dialog and variants — Medium | Core/species partial states, latest-selection guards, real normal/shiny images, focus/Escape/scroll behavior pass |
| 5 | Remove approved active CDN/tool includes, update tests/README — Small | No remaining Bootstrap utilities/data attributes, `$` call or required Popper behavior; UI works without those requests |
| 6 | Final browser regression and handoff — Medium | Desktop/mobile screenshots, keyboard/accessibility/network checks and concise results; stop before publishing |

Changes stay within the existing files; no framework/module migration or new build command. Avoid mixing historical-file cleanup into these stages. Use the committed stabilization version as the comparison/rollback reference; keep changes reviewable and revert locally if a gate fails. Commit/push/deployment remain separate approvals.

Retain all 11 behavioral scenarios, updating only assertions tied to obsolete classes/Bootstrap handlers. Add tests for weight, reordered/missing stats, normal/shiny/fallback URLs, English/non-English/empty descriptions, species success/in-flight sharing/retry, independent core/species failures and delayed description/image results after selection/close. Measure combined request peak ≤6, initial 121 and lazy 121+U counts; toggle/reopen cached details adds zero JSON calls.

Actual browser verification is required for dialog focus containment/return/Escape/backdrop, mouse and Enter/Space activation, no-reload search, image failure, scroll locking and layout. Compare at 390px explorer, 343px detail, 320px safety width, tablet widths and 1280/1440px desktop; test portrait/landscape, long names/abilities/text, 200% zoom and reduced motion. Check console/network errors and reserve image space; use fixtures for repeated failure tests and a few live samples rather than repeatedly fetching the whole catalog. Do not claim browser results from the Node DOM double.

## 9. Risks and decisions requiring approval

Largest risks: replacing Bootstrap's modal behavior without browser coverage; heavier artwork; long stacked mobile content; partial species failures; design/source inconsistencies; inaccessible muted/type colors. Mitigations above keep these within a small static app. Native dialog and optional-data handling need fixtures plus real-browser checks; dependency removal is conditional on those checks, not presumed safe solely from source inspection.

Approve implementation only after accepting or revising:

1. Native dialog and removal of active Bootstrap/jQuery/Popper plus tota11y include, retaining vendored/historical files and current-browser expectations.
2. Normal artwork default, three-digit IDs, responsive column proposal, and same-variant sprite fallback policy.
3. Omission of the out-of-scope controls/sections listed in section 2; accurate 120-item branding/status/footer and name-only search copy.
4. Ability names without effect prose, six bars without optional card HP/total summaries, and deterministic English description selection without a game-version selector.

The required modal fields and 120-item/stabilization constraints are already decided; they need no new feature approval. No decision here authorizes deferred companion functionality, design regeneration or repository publishing. **Stop after this plan; proceed only on explicit implementation approval.**


## 10. Implementation completion record — 2026-10-13

All four section 9 decisions were explicitly approved by the user. Implemented in index.html, src/css/styles.css and src/js/bs-script.js; README, tests/stabilization.test.cjs and reports 01–07 are updated. No commit, push or deployment was performed. Supplied references, historical files and deferred expansion documents are unchanged.

- Data stage: existing request scheduler/cache retained, optional weight/artwork/stats normalized, lazy species promise cache added; 14 checks passed including the original 11.
- Explorer/dialog stage: one semantic page with dark standard-CSS layout, accessible search/clear/status controls and native card buttons; one responsive native dialog with all approved fields, real normal/shiny artwork and same-variant fallbacks. Existing regression cases pass against new markup.
- Dependency stage: active Bootstrap CSS/JS, jQuery, Popper and tota11y includes removed after replacing their source-level responsibilities; no required hooks/utilities remain. Vendored helper/historical files retained; no installed dependencies/framework/build system added. Browser behavior could not be verified because no browser was connected; removal is source/fixture verified, not a native-browser claim.
- Final verification: **23 regression cases passed, 0 failed**. Syntax, CSS parsing, static HTML IDs/labels/anchors/assets, selected opaque contrast pairs and diff whitespace passed. Combined request fixtures measured 121 initial JSON calls and 123 with two distinct species opened, maximum six concurrent. Reopen/toggle added no JSON requests. These are fixture counts, not measured live traffic.

Approved departures from literal screenshots: official images replace generated illustrations; extra controls/sections and fabricated totals/status copy omitted; name-only search and 120-item identity; normal default; three-digit IDs; plan's column breakpoints; abilities as names/hidden label; full accessible stat labels with unambiguous abbreviations; no stat totals/card HP, hue filters or simulated audio. Badge text remains high-contrast neutral with elemental border/wash rather than low-contrast type-colored text. Icons use simple CSS/SVG and native controls. No unapproved functional expansion was introduced.

Native dialog handler tests cover close/cancel/backdrop guards, scroll-lock class, trigger/search focus restoration, delayed close events and latest-selection/variant invalidation. The double does not establish native tab containment, background inertness, actual keyboard activation or browser focus behavior. Desktop/mobile visual comparison, real artwork/font loading, mobile scrolling, zoom, reduced-motion rendering, cross-browser support and live console/network panels remain **unverified**. Browser tooling inventory was empty; no runtime visual evidence is asserted. See report 04 for the concrete review checklist.

Implementation is complete within available verification capabilities. Stop for review; committing, publishing or beginning deferred expansion requires a separate instruction.


## Publication approval — 2026-10-13

The developer reports visually reviewing the available preview: main interface, Pokémon artwork, search and detail modal appear correct. This is user-reported preview validation, not an automated browser/accessibility audit. Commit, push and deployment of the current implementation are explicitly approved. Final production desktop/mobile checks will be performed by the developer. Final pre-publication regression suite: 23 passed, 0 failed; syntax and patch-whitespace checks passed.

Existing GitHub Pages configuration was read from GitHub: branch gh-pages, root /, legacy branch build, HTTPS enabled, official URL https://marksav85.github.io/pokedex-app/. Publication will advance the existing branch without changing hosting configuration. Nine Stitch reference files (approximately 1.8 MB total) are included; deferred docs/planning content remains ignored and untracked. Deployment completion is reported separately in the conversation after GitHub build/live-file verification.
