# Generated Code project prerequisite P — independent plan audit

## Verdict: ACCEPT

**Accept the conditional three-file prerequisite plan, including its dual-model packaging choice and separate consumer harness.** No material design revision is required. This is independent preimplementation acceptance of the exact plan below, not a finding that the predicted defect has been reproduced, permission to repair speculatively, or acceptance of a completed repair.

P remains conditional on an original-baseline **real, unmodified UI download** demonstrating the predicted production model omission. Implement only after accepted A and that diagnosis. A different failure requires an amended, independently accepted plan. If the original project works, do not implement P; obtain independent disposition of the actual evidence. B remains blocked until accepted P implementation/evidence or accepted no-repair disposition. The separate A/B plan can be accepted without pretending P has run.

## Reviewed identity and scope

- Checkout: `gloin/release-hardening`, HEAD `550842cab61002c7cc6563e50b9fcdeb17c9bf01`.
- Reviewed `generated-project-prerequisite-plan.md` SHA-256: `cbe1c30b99b0def5495d8bd56cd2e1c196d91f0b3a724a9ccd721a88d4fb520d`.
- Lock SHA-256: `74e61c99884661fd128be89ef813dabac5c24d25ec8a72d82c6e3e861c6f4724`.
- Read repository governance and web-product-development/dependency-review/browser-reliability guidance; independently inspected `codeExport.js`, its complete unit tests, export/browser specs and helpers, manifests/lock, runtime and CI/browser/test/build configuration, and installed Vite's public-directory defaults/copy operation. Official Vite asset documentation corroborates the packaging mechanism.
- Review was read-only except the two assigned audit reports. **No install, candidate resolution, build, test, browser run, application/config/manifest/lock edit, fixture replacement or remote mutation occurred.** Historical baseline reports are not this reviewer's executions.

## Diagnosis: credible, still requires measured baseline

`src/app/utils/codeExport.js` currently:

- Emits `fetch('./models/${modelName}')` and the existing File/load chain at lines 61–64.
- Emits a supplied model only into project-root `models/` at lines 75–77.
- Emits scripts `{ dev: 'vite', build: 'vite build', preview: 'vite preview' }`, Three `^0.182.0` and Vite `^7.2.4` at lines 87–89.
- Emits `defineConfig({})` at line 96 and README install/dev instructions at line 97.

There is no model import URL, `new URL(..., import.meta.url)`, public copy or copy plugin. Installed Vite's `dist/node/chunks/config.js` has default `publicDir: 'public'` at line 35245, `copyPublicDir: true` at line 33365 and `copyDir(publicDir, outDir)` at lines 33330–33332. This supports the expected distinction between project-root dev access and production asset emission. It does **not** constitute an executed reproduction; an install/build/server failure cannot be automatically blamed on asset packaging.

Existing Code ZIP coverage (`export.visual.spec.js:174–197`) copies parent Three modules, injects an import map and statically serves extracted source. It is useful retained coverage, not independent consumer npm/Vite proof. `ascii-generated.spec.js` separately instruments source-generated React/Web Component archives and uses the parent Vite host. Neither clears this prerequisite.

## Minimal compatibility-preserving repair: accepted

The chosen dual layout is appropriate for this exact scope:

| Generated path / behavior                 | Required invariant                                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `BitmapForge-export/models/<name>`        | Preserve existing extracted/static-host contract and exact input bytes                          |
| `BitmapForge-export/public/models/<name>` | Add the same input bytes for Vite's default public-copy mechanism                               |
| Consumer production `dist/models/<name>`  | Produced by the normal Vite build, never copied into evidence after the fact                    |
| Runtime `./models/<name>` fetch           | Unchanged; works relative to the generated document for the planned own-dev/own-preview targets |
| No supplied file                          | No new model payload entries; existing no-model scaffold behavior unchanged                     |

Vite public assets are copied as-is to the output root; adding `public/models` therefore supplies production bytes without changing the runtime, config or existing top-level path. Official documentation generally recommends root-absolute public URLs, but this generated document's existing relative fetch is deliberately preserved, and the plan requires actual own-dev/own-preview request identity to prove this concrete behavior. This review does not extend acceptance to arbitrary custom base/router/deployment layouts.

**Explicitly accept one extra model payload in the archive** as the bounded cost of maintaining static-host compatibility while repairing the ordinary Vite production path. Record actual archive size and uncompressed totals; no fictional exact compressed multiplier is assumed. A single-copy migration, imported/hashed asset scheme, plugin or runtime URL rewrite would be a different design requiring new acceptance.

## Exact ownership and regression contract: accepted

Only these three source/test paths are permitted for conditional P:

1. `src/app/utils/codeExport.js`: add the second model entry only when a supplied file exists; no changes to dependencies/floors/scripts/config/README, engine/runtime/sizing/disposal or unrelated export behavior.
2. `src/app/utils/codeExport.test.js`: actual JSZip byte assertions for both entries and missing-model behavior; retain all existing tests and add exact emitted package/config/fetch invariants.
3. New `test/e2e/generated-code-project.spec.js`: dedicated real-download and prepared unmodified consumer runtime cases. No existing helper/spec/config/workflow edit is included.

Current unit tests establish top-level model entry/name handling at lines 300–317, scaffold/config files at lines 70–100, fetch flow at lines 115–126 and extensive actual-emitted-runtime sizing/lifetime contracts at lines 129–298. P explicitly retains synchronous sizing before fetch, container ResizeObserver behavior, deduplication, hidden/reveal handling, invalid-size rejection, pagehide/persisted lifetime, idempotent teardown and late-load expectations. Replacing these assertions with simple file-presence checks is not authorized.

The new tests must compare both ZIP entries **byte-for-byte** with a trusted supplied Blob/input buffer, not just each other or their filenames. The generated config stays default, scripts stay exact, Three stays `^0.182.0`, and P's Vite floor remains **`^7.2.4`**. Later B advances only that floor assertion to `^7.3.7`; it must not remove the package assertions or dual layout. Repository manifests/lock must remain hash-identical throughout P. No filename-security redesign, null-model UX repair, dependency remediation, SDK/engine change or generated README expansion is hidden inside this allowance.

## Original immutable evidence before edits: mandatory and adequate

The baseline sequence is specified sufficiently to separate diagnosis from environmental failures:

1. Build the original editor, record source/manifest/lock/full build identity, and obtain an actual Code ZIP through UI export using `test/fixtures/models/export-visual-cube.stl`. Save original bytes/hash/suggested filename. A builder-generated or historical fixture ZIP is not equivalent.
2. Safely extract into a new external project with contained paths and no parent node_modules resolution, aliases or symlinks. Verify original source/fixture bytes and declared package/scripts. Preserve original ZIP and extracted-source hashes.
3. Run the README's **`npm install`** under Node24/npm11 and unchanged effective lifecycle policy. Preserve separate exit/log, newly generated consumer lock, actual Vite/Three/esbuild/PostCSS graph and advisory findings. A fresh no-lock install may already resolve a patched Vite under the old floor; declaration is not installed-version evidence.
4. Run its own **`npm run build`**, with a separate exit/log and dist file/hash inventory. Check actual production model existence and bytes. A zero build exit is not production runtime success.
5. Serve **only that consumer's own dist** through its own installed Vite preview, on a strict owned loopback port. Capture the real model response URL/status/content type/body bytes. A 200 HTML fallback fails. Record geometry/meaningful pixels, initial backing/client dimensions, container-only resizing, page errors/unhandled rejection and runtime request failures.
6. Run its own advertised dev server independently and capture equivalent observations. Dev success cannot clear preview failure. Close all owned processes/contexts even on failure.

Do not edit downloaded runtime, HTML, config, engine or model; inject an import map; copy dependencies/assets from the parent; overlay project-root serving; use parent Vite; or repair dist after the build. Keep the original failed ZIP/source and install/build/runtime results rather than replacing them with repaired evidence. Normal new node_modules/consumer lock/dist outputs are expected preparation products, not permission to mutate archive source files.

If install/platform/browser/build prerequisites prevent a meaningful asset diagnosis, record the exact blocker and stop before source repair. That is a bounded execution prerequisite, not evidence that the conditional repair is needed.

## Dedicated consumer browser harness: accepted, not exercised

Exactly **three explicit cases**, separately selected by external orchestration, are specified:

| Case                              | Target and required evidence                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Real download / dual model layout | Fresh built-editor UI action; original ZIP/hash; safe extraction; exact model/package/config/runtime bytes                                                                           |
| Unmodified production preview     | Prepared project's own built dist/preview; true model response/body; initial canvas dimensions; meaningful render; container-only resize; no errors/failing requests/source mutation |
| Unmodified advertised dev         | Same separately installed project's own dev server with independent corresponding assertions                                                                                         |

The download invocation precedes a separately logged install/build preparation; production and dev run sequentially against independently owned strict servers. They are not tests with hidden dependence on another test executing in the same invocation. The frozen contract names `BITMAPFORGE_GENERATED_ZIP`, `BITMAPFORGE_GENERATED_PROJECT`, `BITMAPFORGE_GENERATED_EVIDENCE`, `BITMAPFORGE_GENERATED_URL` and `BITMAPFORGE_UI_URL`; missing inputs fail rather than skip. Server identity and project/source hashes are checked before/after.

Installation ≤300 seconds and build ≤120 seconds are separate operation limits, not increases to browser budgets. Browser cases retain **90 seconds, one worker, zero retries, forbidOnly**, installed repository Playwright/software GL/DPR conventions, fresh accepted-A browser cache and **runner-owned retain-on-failure traces**. Consumer cases disable the unnecessary root webServer; the download invocation alone owns strict built-editor preview. All output/report paths are absolute and external. Cleanup in finally and failed-run diagnostics remain mandatory.

The existing six CI cases, four complementary built-route cases and four source-generated cases stay distinct. Adding these three consumer cases does not change the nine-output-route count, substitute consumer evidence for existing assertions, or authorize enlarging an existing 90-second test. Reuse current image analysis thresholds without weakening them: `isBlank` rejects occupancy below 0.01 or fewer than five colors; preserve the applicable meaningful entropy check as well.

## Full acceptance and rollback boundaries: preserved

- Post-P and final B rerun the complete accepted A/B static/runtime/root/embed/CLI/decode/coverage/watch/build/SDK/native/browser/graph-audit ledger, plus the new three-case sequence. A targeted archive test or passing build is insufficient.
- Preserve Node/runtime guards and workspace public minima, lifecycle/security policy, exact get-uri/basic-ftp override/integrity and adapter coverage, SDK three-copy equality/alias checks/≤51200-byte gzip budget, existing assertions/snapshots, native bitmap lifetimes, strict server isolation and trace evidence.
- P makes no dependency/security-remediation claim. B must obtain a new real UI ZIP and prove its own patched Vite 7 resolution and full runtime/graph gates after the floor change.
- Independent P implementation review must inspect the exact three-file diff, original failing download versus fresh repaired download, source-byte preservation, separate phase results, full reruns and accepted A+P hashes before serial handoff to B.
- Save accepted A owned-path snapshots including absence of the new spec. P rollback restores only those paths, preserves failure evidence and leaves B blocked. B rollback targets accepted A+P, not unrepaired A. No destructive whole-tree reset, documentation overwrite or publication/deployment permission is implied.

## Outstanding execution prerequisites versus blockers

**No material plan-design blocker remains.** Outstanding work is bounded and explicitly gated: actual immutable baseline diagnosis; policy-compatible isolated consumer installation/build; fresh browser/platform availability; exact external config/orchestration validation; conditional P implementation; independently accepted real runtime and complete final-suite evidence. Unexpected blockers cannot be repaired by expanding this plan's file scope.

**Final decision: ACCEPT conditional P plan and duplication/layout cost. Do not implement unless the specified original-baseline omission is reproduced; no P implementation or consumer runtime success is asserted here.**
