# H1 palette implementation — static/unit review handoff

## Outcome and scope

**Static/unit stage complete; independent exact-diff review and browser acceptance remain open.** Resumed the surviving implementation under the accepted `palette-h1-plan-audit.md` and renewed user authorization. No browser, application server, build, install, publication or dependency edit was performed.

Production ownership remained `src/app/components/ColorPalette/ColorPalette.jsx`. Modified focused tests: `ColorPalette.test.jsx`, `ColorPalette.redesign.test.jsx`, and `Layout/Layout.hardening.test.jsx`. Layout production is unchanged. The existing H2 describe block is byte-identical to the retained pre-H1 snapshot; only the shared missing jsdom `ResizeObserver.unobserve` stub was completed. CLI, manifests, lockfile and other accepted dirty work were not edited.

## Implementation

- Stable module-local adapters preserve actual installed PointerSensor/KeyboardSensor behavior, distance 8, sortable keyboard coordinates and accessibility settings. Private coupling is explicitly bounded to **@dnd-kit/core 6.3.1**, not a supported upstream cancellation API.
- Each keyed context captures its own generation; constructor-time attach registers a unique session before native start/pending callbacks. Session identity, original activator event, retirement, terminal delivery and resource openness are distinct.
- Public cancellation invalidates local ownership/focus first, retires pending/active sessions and terminal pointer cleanup tails, then replaces only an affected DndContext. Idle repeated cancellation does not remount it. Teardown retires without scheduling replacement; StrictMode setup recovers a live generation and handle cleanup uses compare-and-clear.
- Keyboard detach closes per-instance listener registration before native removal. Deferred native add callbacks cannot resurrect listeners. Forced retirement follows native detach/internal-cancel ordering without fake Escape events.
- Pointer forced retirement follows native cancellation, including pending abort, and immediately removes document listeners. Ordinary successful drop retains native delayed click suppression; terminal instances remain tracked until cleanup.
- Event-entry and SensorProps guards reject retired work; component completion callbacks additionally match captured generation/session/activator ownership. Natural terminal delivery remains eligible exactly once despite detachment preceding completion.
- **Additional observed native identity trap repaired:** native pointer instances share a click-stop callback. DOM registration deduplicates identical callbacks; an old delayed removeAll can therefore remove a new sensor's suppression listener. Per-instance registration wrappers give each listener an independent identity without changing native timing or prototypes.

No production prototype patch, copied dependency sensor, extra timer, dependency change, Layout repair, publication-phase rewrite or root/controller remount was introduced.

## Evidence and exact diff

Evidence directory:

`/home/agent/.hermes/profiles/gloin/cache/scratch/palette-h1-implementation`

Its original four source/test snapshots and `baseline-red.log` remain untouched. The inherited baseline log is a serialized/truncated tool result; it is not presented as a complete native log. A fresh hash-checked replay against the exact original production source now retains the complete six failing regressions in `baseline-red-complete.log`, with final candidate restored in `finally` and rerun green afterward.

`implementation.patch` is the complete four-file unified diff against those original snapshots, **including the previously untracked Layout test file's H1 delta**, rather than a whole-dirty-tree patch. SHA256:

`1b7c089187136b4cc2e434bf543cfa3f9e5ad58a94766ced0498b5282c83655e`

`final/` retains the exact reviewed source/test bytes; `final-source-inventory.json` contains paths, lengths and hashes. Final live bytes were compared with all four snapshots after mutation and baseline restoration.

| File                           | SHA256                                                             |
| ------------------------------ | ------------------------------------------------------------------ |
| ColorPalette.jsx               | `1f985ea6b9f7794c916c1503f561ee994f5a9a89378fd69849cd7b57fe895cfe` |
| ColorPalette.test.jsx          | `3f145830dd952edb1b16bbf564d44cbdb6928c5ec614d4de7e31ed1ed895cfab` |
| ColorPalette.redesign.test.jsx | `3dd308c2384769a7eb2ff115acaf2668f936700065119155bd243b9ad13ca18d` |
| Layout.hardening.test.jsx      | `99728816b9519f195e3c93c34b625def30cde0fda3334f93b355bff46fe0fb05` |
| Layout.jsx (unchanged)         | `7c6cf79a55b37b896a41ee703dce6f4c7c8ef8de0b22e6a33b38787a04f8b40f` |

## Actual execution

All Vitest/ESLint/Prettier execution used direct terminal calls with:

`/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node`

Final focused command from the repository:

```sh
/home/agent/.npm/_npx/9f238deda7dc9c71/node_modules/node/bin/node \
  node_modules/vitest/vitest.mjs run \
  src/app/components/ColorPalette src/app/components/Layout --maxWorkers=1
```

**5 files / 84 tests passed, exit 0**, both `final-focused.log` and the post-restoration `final-restored-focused.log`. The latter is the last behavioral execution, after all mutations and original-source replay. No timeout/threshold was raised.

| Evidence                    | Actual result / disposition                                                                                                                                                                                                                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseline-red-complete.log` | Original source hash `7636969…54d2`: 6 failed / 27 skipped, exit 1. Full keyboard history, deferred cancel/unmount, pending pointer and both pointer cleanup paths fail.                                                                                                                                                                                 |
| `post-change-01.log`        | 49 pass / 2 fail. Both failures exposed old pointer cleanup removing a newer native shared click listener; repaired with instance-local listener identity.                                                                                                                                                                                               |
| `post-change-02.log`        | 48 pass / 15 fail. One test checked queued focus before its real microtask; corrected by awaiting that job. A slow broad Layout role query timed out and left subsequent async-act tests empty; narrowed lookup to a prefetched native button's parent while retaining the actual accessible-role assertion. No deadline increase or assertion deletion. |
| `post-change-03.log`        | All 64 tests passed at that intermediate stage.                                                                                                                                                                                                                                                                                                          |
| `post-change-04.log`        | All 33 palette tests passed after additional callback and drop coverage.                                                                                                                                                                                                                                                                                 |
| `lint-final.log`            | Scoped ESLint with explicit `--ext .js,.jsx`: exit 0, no diagnostics.                                                                                                                                                                                                                                                                                    |
| `format-final.log`          | Prettier check of all four changed JSX files: exit 0.                                                                                                                                                                                                                                                                                                    |
| scoped `git diff --check`   | Exit 0.                                                                                                                                                                                                                                                                                                                                                  |

Earlier mutation attempts and their logs are retained separately from final mutation evidence. Scripts restore production bytes even on failure; mutants are not left installed.

### Required discriminating mutations

| Independent mutation                                                         | Final retained result                                                                                                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Remove context/session/activator completion checks, retain native retirement | `final-context-mutation/mutation-context-ownership.log`: captured old context end causes **one forbidden color-store write**; 1 selected test fails, exit 1. |
| Remove native session/generation liveness checks, retain retirement          | `final-mutations/mutation-guards.log`: captured old native keyboard entry prevents default; 1 selected test fails, exit 1.                                   |
| Omit resource retirement, retain callback guards                             | `final-mutations/mutation-retirement.log`: 4 selected failures, deferred registration and immediate click delivery; exit 1.                                  |
| Remove only deferred-add registration gate                                   | `final-mutations/mutation-deferred-add.log`: 3 selected failures, cancel/unmount/natural terminal before deferred attach; exit 1.                            |
| Omit immediate pointer document cleanup                                      | `final-mutations/mutation-pointer-cleanup.log`: 2 selected failures, active and ordinary-drop cleanup-tail rail clicks swallowed; exit 1.                    |

Mutant source snapshots and executable drivers accompany each result. Failure is at the named behavioral assertion, not import/startup failure.

## Coverage boundaries

Real installed sensors cover full Escape/parent/repeated-cancel/new-pickup history with duplicate order and zero writes; deferred registration on cancel/unmount/natural terminal; constructor-time reentrant retirement; captured old key/start/move/cancel and SensorProps callbacks; pending pointer retirement and subsequent pointer/keyboard activation; pointerdown-capture cancellation and immediate rail click; natural drop tail and old delayed cleanup isolation; pending/active/keyboard StrictMode teardown and newer handle preservation; legitimate subsequent native keyboard drop with exactly one write and moved-swatch focus.

One call-through DndContext props observer in the palette test captures genuine component callbacks for deliberate stale delivery. It renders the actual DndContext and does not substitute sensor logic. Native constructor spies likewise call through. The separate **real Layout integration has no dnd/Dialog/palette mocks**: desktop full history with and without StrictMode, narrow fresh/task-hide/external-mutation first Escape retaining Settings and focusing the handle, second Escape dismissal, and Help retirement/recovery. Existing H2 assertions remain unchanged and pass in the same final run.

The redesign test retains the same root and controlled name/browse state across hide→cancel→reveal before captured focus jobs drain. Existing name/transaction regressions remain intact. No handle-publication phase changed, so the conditional new layout-effect publication requirement does not apply; existing Layout controller tests ran unchanged.

The jsdom drop test explicitly documents tied zero-size rectangles selecting the first item. It proves real sensor→store→focus completion, **not spatial browser drag correctness**.

## Outstanding gates — not cleared here

1. Independent review of this exact source/test diff and retained mutation evidence.
2. Broader root/cross-component verification after independent acceptance, as required by the accepted plan; only the focused palette/Layout suites and scoped lint/format ran here.
3. Separately authorized browser-test preparation/execution and immutable-build Chromium/Firefox acceptance: exact historical Escape→Motion→Look→third active pickup→collapse/reveal, active-before-hide assertions, real pointer capture/click and native rail **Enter and Space independently**, preserved root/controller/canvas/drafts, stale-key isolation, rail focus across frames, genuine spatial move/drop and moved-item focus, fresh/history narrow two-Escape behavior.
4. Native platform/assistive-technology checks remain unverified. No full H1 browser, whole hardening, release, build or publication clearance is claimed.
