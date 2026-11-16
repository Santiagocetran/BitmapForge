# IC1 re-entry plan — independent audit

## Verdict and identity

**ACCEPT — written private guard/re-entry repair and browserless regression plan only. No mandatory plan corrections remain.** This is not implementation acceptance, permission to launch a runner in this review, native cancellation acceptance, or a browser-lane transfer. Implementation still requires the stated explicit ownership transfer; native execution requires the separate new grant.

Reviewed `docs/hardening/ic1-reentry-plan.md`, SHA-256 `18225310c35002e0f4b0061e2944e8d84564eace6e2648f8f51cdcf0ee1171e3`, on `gloin/release-hardening`, HEAD `6966686455fce3baa9bc749a272f372b27a52441`.

Read AGENTS.md, web-product-development, prior IC1 plan re-audit, implementation audit and native failure report; inspected the actual private guard/config/relocation tests and installed runner source. Named COLLAB records and root HERMES.md are absent. The audit path is not ignored. No harness import, test/runner execution, browser, server, installation, build or remote operation occurred.

Roots below are under `/home/agent/.hermes/profiles/gloin/cache/scratch`: `R = bitmapforge-research`, `A = image-cancel-contract-v1`, proposed `B = image-cancel-contract-reentry-v1`.

## Installed lifecycle: diagnosis is correct

- `A/harness/config.mjs:76–78` guards, then writes `.keep` files under the attempt output. `A/harness/lib/env.mjs:57–59` subsequently rejects both that output and the populated run root. Exempting only one check cannot repair reload.
- Installed `playwright/lib/common/ipc.js:37–47` serializes config location, overrides, cache and metadata. It does not transfer a fully evaluated user config.
- `common/configLoader.js:101–120` deserializes through `loadConfig` and imports the config again. `worker/workerMain.js:162–180` performs that step before loading the test body.
- `runner/workerHost.js:64–68` creates worker artifacts and calls `ProcessHost.startRunner`; `runner/processHost.js:54–68` directly forks the worker with inherited environment and IPC. Thus the owner CLI and worker really are parent and direct child, and an environment capability issued during initial config evaluation reaches the worker.
- The out-of-process loader uses the same direct `ProcessHost` topology (`runner/loaderHost.js:59–75`) and deserializes config (`loader/loaderMain.js:37–45`). In-process discovery instead uses its existing config. Worker-index presence is therefore neither necessary for every valid reload nor sufficient authority.

Independently recomputed the plan's five installed runner source pins and private config/env pins: all match. Installed package metadata reports Playwright `1.59.1`. Node24 is the required future execution toolchain, not a runtime exercised by this audit.

## Ownership, freshness and containment

The proposed conjunctive checks are sufficient for the stated trusted-private-harness threat model:

1. Exclusive first claim and absent attempt output preserve freshness. Only safe preparatory tmp/cache directories are allowed beforehand; an inherited token cannot initialize a different fresh root.
2. The unpredictable capability, marker digest and complete canonical attempt identity prevent marker-only adoption, accidental token retargeting and cross-root/engine/attempt reuse.
3. Owner PID **and** Linux start ticks prevent recycled-PID acceptance. The same-process branch additionally requires locally issued state; the child branch requires independently observed direct parentage and the inherited capability. A sibling or unrelated CLI cannot become an owner through matching strings or spoofed worker indices.
4. Revalidation on every evaluation preserves graph, pinned inputs, helper destinations and real-path containment. Owned existing artifacts become permissible only after ownership succeeds; they are not cleared by config re-entry.
5. The marker sits outside runner-cleaned results/report subtrees. A new CLI after owner completion cannot adopt it. Discovery and native execution consume separate roots.

This is invocation ownership, not executable authentication: an intentionally spawned direct child given the full capability is trusted by this design, as the proposed benign-child positive explicitly requires. The claim that an independent CLI is unrelated assumes it is not deliberately launched as that authorized child. No argv allowlist, worker-index password, arbitrary ancestor walk, external coordinator or supervisor redesign is needed for this bounded repair. Malicious same-user token/file access is explicitly out of scope.

## Failure and cleanup semantics

The plan's requirements that **any partial initialization remains consumed**, reload performs no initialization writes, and stale ownership is never refreshed are acceptance conditions, not optional wording. In particular, a complete marker alone must not make a caught `.keep` write failure reloadable while its owner is still alive. Implementation must withhold usable issued authority until initialization succeeds, or equivalently retain a fail-closed local failure state and prevent capability use after failure. This can remain within the allowed env/config files; it does not require a recovery protocol or new service.

Similarly, “live owner” means an executable live process, not merely an extant `/proc/PID` entry: unreadable/malformed proc identity or a zombie/dead state cannot establish liveness. Parse start ticks and parent identity correctly rather than splitting the whole stat record on whitespace without accounting for its parenthesized command field. These are implementation details of the already specified live-owner/complete-record contract, not new plan gates.

The proposed bounded child tests, real exit/close records, absence checks and forced-cleanup-as-failure policy are appropriate. Installed `ProcessHost` emits its own exit event after `onExit`; that is not an OS ChildProcess close event. Future evidence must keep these concepts distinct, as the plan already requires. Preserve partial markers and failed attempts; clean up only owned verification processes, not evidence to permit reuse.

## Browserless runner regression: discriminating and feasible

The adapter calls the actual guarded config before replacing server/discovery settings. This keeps the real defect on both CLI and worker paths without executing the smoke route. Its exact diff and isolated old-source projection are required evidence, not permission to introduce a production bypass.

Installed `playwright/lib/index.js:79–116` confirms that automatic browser-options setup does not launch a browser; the `browser` fixture launches only when requested through the fixture graph. Automatic context-options/trace recording also install instrumentation rather than requesting a browser. A plain test with no browser/page/context/request or custom auto-browser fixture can therefore execute a real worker without native browser setup. Retaining ordinary tracing is compatible with this approach.

The required evidence distinguishes success from discovery or unrelated failure:

- Distinct parent-config and worker-config identities, exact live parent match, actual fixture-body execution, one executed passing test and exit0.
- Identical adapter with retained old guard/config fails specifically at existing-attempt refusal during worker initialization; no body execution. An import, selection or graph failure does not count.
- New CLI reuse of the consumed successful root fails before the body, with sentinel evidence unchanged and logs written elsewhere.
- Selective ownership mutants fail their corresponding negatives, not merely the aggregate command. Existing-root, nonce, tuple, liveness/start-tick and ancestry checks each remain independently observable.
- Separate Chromium/Firefox `--list` checks retain exact native selection, but prove neither worker reload nor cancellation.

Place preservation sentinels outside runner-owned folders that Playwright legitimately clears. Adapter evaluation diagnostics must also stay outside those folders so parent evidence survives startup. This follows the plan's explicit distinction between read-only guard re-entry and unchanged runner output management.

## Scope and preserved gates

The finite edit allowlist is adequate: copied env/config/relocation test plus the new re-entry suite and two test fixtures. No oracle, route, server/supervisor, runtime, dependency or production edit is justified. Preserve the accepted eight-field equality, positive invitation ordering, downloads, return-cube preview and successor assertions unchanged; do not use this repair to waive the possible artwork-hash mismatch.

The preservation inventory, exact candidate diffs, old-source and mutation discrimination, syntax/offline/discovery checks, and independent implementation audit remain outstanding execution requirements. They are not results of this static review. The historical Chromium worker-init failure and secondary EADDRINUSE observer failure remain unchanged; no native route result is inferred. No new approval framework or observer repair belongs on this fix's critical path.

Only this audit document was created. Prior plans, accepted candidate, historical evidence and installed packages were not modified. No implementation or runtime acceptance is claimed.
