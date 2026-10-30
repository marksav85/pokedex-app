# Reference Case: Pokédex Static API Explorer

**Status:** Local draft for owner review; not approved for central Playbook inclusion.

**Scope:** Small static portfolio application using HTML, CSS, vanilla JavaScript and PokéAPI.

## Starting situation

The current project is a static Pokémon explorer that loads a fixed catalog and detail data from PokéAPI. This case records techniques visible in the current implementation and owner-reported finalization history. Historical migration details have not been independently verified against earlier source snapshots.

## What worked

- **Keep the architecture proportionate.** The finished application uses browser-native HTML, CSS, `fetch`, `AbortController` and `<dialog>` without a frontend framework or production build step. For a small static experience, this keeps deployment and runtime requirements modest.
- **Share API work.** The implementation caches pending and successful detail/species requests by URL and limits concurrent JSON requests to six. This avoids duplicate in-session requests and bounds parallelism; it does not establish a quantified production performance gain.
- **Design for partial API failure.** Details and species descriptions fail independently, unsuccessful cache entries can be retried, and artwork has a same-variant sprite fallback. Selection guards prevent late asynchronous results from replacing a newer dialog view.
- **Use lightweight regression coverage.** A dependency-free Node test file exercises data handling, errors, request limits, search, card/dialog handlers and stale-response scenarios. Its DOM double is explicitly limited, so manual browser checks remain necessary for layout and native behavior.
- **Add formatting at finalization.** Prettier was added as development tooling with an explicit four-file allowlist. This makes formatting repeatable while avoiding a repository-wide command over deferred planning content.

## Reported transition and evidence limits

The owner reports that the project was modernized without adding a framework, that legacy UI dependencies were replaced with native browser features, and that static hosting moved to GitHub-connected Cloudflare Pages. Current source confirms the framework-free/native implementation; the previous dependency state and hosting migration history are not evidenced by this checkout. The current README names the production domain, but the deployment configuration and live behavior were not verified for this case.

## Transferable lessons

1. For a small static frontend, first check whether browser-native APIs meet the interaction needs before adding a UI framework or runtime dependency.
2. Cache in-flight promises as well as successful responses when multiple UI paths can request the same resource; remove failed entries when retries should be possible.
3. Bound external request concurrency and give user-triggered work queue priority when background catalog loading competes with detail interactions.
4. Keep automated tests focused on logic and asynchronous edge cases, and state clearly what a DOM double cannot prove about a real browser.
5. When introducing a formatter to an existing repository, scope the scripts to maintained source paths and exclude protected planning material by construction.
6. Treat hosting migration and production readiness as separate evidence questions: record the platform and domain, but verify the configured branch, live journey and rollback path with the operator.

## Significant issues and Playbook follow-up

No significant incident or failed approach is established by the available evidence. This case recommends that finalization procedures continue to distinguish source-verified implementation from owner-reported deployment history and require focused production/browser checks. It does not propose changing a Playbook standard.

## Boundaries

This is a single-project example, not evidence that six concurrent requests or a DOM-double suite is suitable for every application. It contains no secrets or private account details. Obtain owner approval and confirm the central reference location before copying or adapting this draft into the standalone Playbook.
