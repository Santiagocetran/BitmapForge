# Independent L1/L2 implementation re-review

## Verdict: REVISE — exact implementation/offline candidate for the actual R01–R07 matrix

**L1 ACCEPT; L2 REVISE for one remaining pre-envelope asynchronous boundary.** This is the implementation-stage verdict, not a new approval layer or a runtime verdict. The existing parent-approved scenario matrix and unchanged runtime budgets stand. No server-matrix attempt is authorized or accepted here.

Reviewed freeze: `69697b4e1acc40cd5cf25497f626b90ed80920beed76ee272a7abf436cc54c2a`.

Read repository AGENTS.md, web-product-development, the prior independent audit's L1/L2 requirements, repair handoff, actual controller/test source and freeze/reconstruction artifacts. No application/production repair, server, HTTP listener, browser, install, driver main or approval file was executed/created. Sole authored review file is this document; the authorized offline suites generated their normal fresh external fixture evidence.

## L1 — ACCEPT implementation correction

`tests/server-lifecycle-control.mjs:475–488` inventories and dispatches `R04 / unresolved-startup` separately from R03 in-flight, actual-preview before-ready/during-close and the controlled close fixture. `controlledFixtureBody:256–263` actually selects unresolved acquisition through the production lifecycle factory. Runtime uses the default9000ms startup and maximum8000ms close bounds; the offline test explicitly injects600ms only for its benign fixture.

`runControlledCase:298–313` waits for the acquisition-entry record bound to the retained child PID, rejects readiness/aliveness races and then SIGKILLs the supervisor. It does not substitute R03's SIGTERM. Finalization retains real supervisor exit/close, child-local failed terminal identity, actual retained-identity absence and the rejecting reserved supervisor telemetry/unchanged consumer. No orphan child exit/close is synthesized from absence. External emergency reap is still a failed observation.

Fresh actual-dispatch regression passed: matching acquisition PID, not ready, real supervisor SIGKILL exit and close, child-local disconnect/EOF error plus closeTimeout:true/closeCompleted:false, no owned identity remaining, no controller emergency reap and consumer1. This is finite benign-fixture evidence, not production-budget runtime acceptance.

## L2 — remaining bounded finding: runtime R06 awaits an import before installing either signal handler

The new envelope correctly contains work **once entered**. However, actual runtime dispatch follows:

```text
dispatchFixture R06 without refusalWork (483–488)
  -> runFixtureCase (394)
     -> await import('../server-supervisor.mjs') (395)
     -> refusalEnvelope(...) (413)
        -> SIGTERM/SIGINT handlers installed (353–354)
```

`main` awaits that dispatch in its special branch at514, returning at525; the ordinary controller handlers are still installed only later at531–532. Thus the actual R06 path has an asynchronous import window with neither ordinary nor refusal handlers. A SIGTERM/SIGINT there follows default termination rather than latching interruption and returning through the special branch's failed terminal persistence. No detached refusal child exists yet in that window, so this finding does **not** allege a demonstrated child leak there. It is the remaining interruption-before-setup/failed-record portion of existing L2, not new scope.

Independent read-only VM probe evaluated the exact `refusalEnvelope` and `runFixtureCase` bodies, substituting only an unresolved promise for the supervisor import; it invoked actual `runFixtureCase('R06', ...)` with an injected EventEmitter process. At that import await the probe returned:

```json
{
  "actualPath": "dispatchFixture -> runFixtureCase R06 before refusalEnvelope",
  "pendingBoundary": "await import('../server-supervisor.mjs')",
  "SIGTERMHandlers": 0,
  "SIGINTHandlers": 0,
  "failures": [],
  "serverLaunched": false
}
```

This is a source-ordering diagnostic, not an OS-signal/runtime acceptance result. It confirms the handoff's claim that the runtime envelope precedes imports is not true for the shared supervisor import.

**Required bounded correction:** enter the same R06 envelope before that first asynchronous import, retaining its single first-terminal deadline/ownership/finalization semantics and main's existing failed-record return path. For example, move the R06 supervisor import into enveloped work and leave R07's separate import in its existing branch. Do not wrap a second competing envelope or change budgets, runtime rows, production modules or stale-listener policy. Extend an offline actual runtime-routing/source-order test to cover this pre-import boundary, then refreeze the same candidate and return for bounded re-review. No live execution is requested.

### L2 mechanisms verified and retained

- Once entered, handlers latch first SIGTERM/SIGINT and cannot extend an earlier armed10000ms deadline. Interrupt races pending work; active checks prohibit later refusal spawning.
- Runtime Vite refusal child is tracked in `control.owned`; ordinary polling and finalization share retained PID/startTicks/PGID/SID. Retained descendants remain reappable after leader exit.
- Cleanup is ownership-checked, disposable-listener-only, idempotent and bounded by the same deadline; actual child exit/close and identity absence remain distinct. Emergency cleanup is explicitly failed, not successful lifecycle evidence.
- Actual special-branch dispatcher, failed outcome persistence and new-freeze approval wiring exist. The envelope's normal refusal poll retains its9000/10000ms boundary. Real Playwright reuse refusal, separate Vite strictPort refusal and stale-target preservation remain in source.

## Nine new regressions: verified, with precise coverage limit

Fresh offline execution passed all nine additions: named scenario/main wiring; actual R04 unresolved dispatch; retained-descendant cleanup after leader exit; real benign controller OS SIGTERM and SIGINT; injected pre-work SIGTERM/SIGINT; and detached-child SIGTERM/SIGINT with repeated-deadline nonextension/disposal/real events/emergency-failure labels.

The six pre/during interruption tests and two real-controller tests exercise `dispatchFixture` using **injected `refusalWork`**, which selects line486 directly. Actual runtime, with no injected work, instead selects `runFixtureCase` at487 and its uncovered import await. The static inventory test checks strings proving eventual envelope/main wiring, but does not enforce envelope-before-first-await ordering. Thus all161 passing tests are compatible with the bounded L2 finding; they must not be presented as proof of interruption coverage throughout actual R06 setup.

## Independently verified freeze, preservation and execution

- Recomputed exact freeze hash above and complete30-file inventory `3556f997137d7fe9804916aecf6a7c8b5699cb3b8273418c16acf4c26a150bfb`.
- All five canonical/frozen-source/complete-patch reconstruction/delta reconstruction source hashes match. Controller `ccf074f8e00906d15fc4cdba4414b117e2f6865e052392ce8b59dd1583438045`; lifecycle tests `2fc235b5652fbda5a6f1e079df498372d169a27a4c3dd437399ce01e9aa5ff5e`.
- All three production lifecycle modules match the independently audited prior candidate. Original28 archival files and25 protected canonical original files match; the original compact inventory remains `2c57180b05869fc80336f0ce647fae4153e118dcf548844ec43304c649b7c096`. All five retained B01 files and historical driver freeze match recorded hashes. B01 remains historical red, not replayed or reclassified.
- Regenerated complete and delta patch bytes in memory from their declared original/revision3 and prior-candidate bases: exact equality. Complete patch `5e4ca8dbfa328cc40233921b19d1e53e8daebfda392c76a1fc82bd3bd27ffe13`; delta `f92f691c9f554af43dbcff8489ddd0836aa6e73cca19677c75def1054ffc2ebc`. Both retained mechanical reconstructions match all five targets and fresh reverse-apply checks exit0. Retained forward-check/apply evidence hashes match the freeze; no copied runtime executed.
- Every freeze-referenced evidence hash and retained final log hash match. Prior test body is byte-preserved after removing only the inserted import/tests.
- Five fresh locked-Node syntax checks exit0. Fresh independent command using `/home/agent/.npm/_npx/17533ff5f2b7389f/node_modules/.bin/node --test --test-reporter=tap QA/harness/tests/repair.test.mjs QA/harness/tests/server-lifecycle.test.mjs`: **exit0;161 tests,161 pass,0 fail/cancelled/skipped;119 top-level entries**. Literal results returned by terminal. Repair-suite fresh evidence: profile scratch `qa-repair-offline-XGfUmB/`; lifecycle suite creates its own fresh `driver-stage/offline-*` evidence.
- D1 old-extension counterexample, all seven D2 selective accepting-validator mutants, installed-source EOF/refusal diagnostics, exact consumer checks and missing-close rejection remain passing. Explicit parent disconnect still does not receive synthesized close success.

## Existing matrix and remaining gate

The executable inventory retains B01 SIGTERM; R01 SIGTERM; R02 SIGINT/repeated/shell-group; R03 pre-ready/in-flight; R04 before-ready/during-close/during-close-fixture/unresolved-startup; R05 child143/childSIGKILL/protocol-failure/close-reject/persistence-failure; R06 stale-listener; R07 snapshot-change. No scenario is removed or replaced and no acceptance budget is relaxed.

**Implementation-stage REVISE concerns only the remaining L2 pre-import interruption window.** L1 and the verified post-entry L2 mechanisms need not be redesigned. After its bounded correction/source-offline re-review, the parent can separately approve fresh per-scenario server-only attempts under the existing approval interface. Actual production-budget orphan containment, real preview close windows, real listener refusals and all other R01–R07 runtime outcomes remain unaccepted here. Chromium/WebGL, H1/Q3, WebKit and complete-baseline gates are unchanged and outside this review.
