# Independent audit — Batch C CLI migration plan

## Verdict: REVISE

**No preimplementation acceptance is granted.** The plan has a sound dependency/artifact-verification direction, but it still delegates material scope choices to implementation and misses two concrete baseline render blockers. Resolve the corrections and owner decisions below, then obtain a new independently delivered verdict. This audit does not authorize dependency installation or code changes.

Reviewed source: `550842cab61002c7cc6563e50b9fcdeb17c9bf01`, branch `gloin/release-hardening`. Reviewed `AGENTS.md`, the web-product-development skill and dependency-review reference, `cli-plan.md`, `dependency-triage.md`, actual root/CLI/embed manifests and lock entries, CLI entry/server/harness/build configuration/tests/fixtures, embed parser, and consuming scene/animation/model/shape code. The four governance-listed `COLLAB/` files are absent. The report path is not Git-ignored. No remote writes, installations, builds, browser launches, security payloads or application implementation were performed.

Evidence is source inspection plus the explicitly identified benign probes below, not successful candidate rendering or a fresh advisory audit. Registry metadata and tagged upstream source were retrieved read-only; tarballs/provenance were not independently verified.

## Required plan corrections

### R1 — Fix the fixture contract beyond nesting (blocking)

The plan correctly identifies the old fixture's wrong DTO shape, but repeatedly calls it a trusted “box concept.” Nesting its existing fields is still invalid:

- `packages/embed/src/projectParser.js:6–16` reads `settings`, not top-level shape fields.
- `src/engine/loaders/shapeGenerator.js:3–11,25–45` supports `cube`, **not `box`**. Cube uses `shapeParams.size`; arbitrary width/height/depth do not create an asymmetric box.
- `packages/cli/src/harness.js:125–126` passes that type directly to the generator.

Benign Node probes actually returned:

```text
old fixture: {"settings":{},"modelData":null,"inputType":"model","version":2}
box rejection: Unknown shape: "box". Valid types: cube, sphere, torus, cylinder, cone, icosahedron, torusKnot, plane
```

**Correction:** name a supported shape with its exact valid parameters, and separately specify a tiny self-contained asymmetric closed-volume OBJ (or reviewed equivalent) for the real model path. Do not extend the generator merely to preserve this malformed fixture. Verify parser output and real geometry before freezing pixel/rotation thresholds. A rotationally symmetric cone/cylinder around Y is not a useful changing-silhouette fixture. Explicitly set the background, palette, seed, effects, fade flag and animation speed; do not rely on ignored `frameCount`/project `fps`.

Retain the original fixture as historical/parser-regression evidence, not as a claimed valid box. Its existing header-only smoke may succeed on blank pixels after routing repairs, or fail earlier; neither outcome establishes meaningful shape output. Record that legacy result separately from the corrected fixture gate.

### R2 — Add the missing APNG compression prerequisite (blocking)

The plan finds the UPNG filename case and missing Three core route, but omits UPNG's browser compression dependency:

- Installed `node_modules/upng-js/UPNG.js:6–10` obtains `pako` from `window.pako` when loaded as a classic browser script.
- `harness.js:3–11` loads only UPNG; `harness.html` supplies no pako; the server has no pako asset route.
- The installed pako browser bundle exists at `node_modules/pako/dist/pako.min.js`; this is an existing dependency, not permission to add a new encoder/package family.

An isolated Node VM loaded the unmodified classic UPNG script with a browser-like `window` and encoded a benign 2×2 RGBA buffer. It returned **`Cannot read properties of undefined (reading 'deflate')`**. This establishes the script dependency failure without launching Chromium; it is not a completed CLI reproduction.

**Correction:** baseline prerequisite scope must cover a reviewed finite pako route plus loading it before UPNG, or another explicitly reviewed minimal bundling solution using the existing dependency. Merely fixing `upng.js` → `UPNG.js` cannot clear APNG. Add an actual encode regression and request/console evidence. Keep new dependency majors and encoder rewrites out of this repair.

Confirmed on disk: lowercase UPNG is absent, uppercase UPNG exists; installed Three's module imports/exports `./three.core.js` with no corresponding server route. Built headless output also contains lazy font imports. Shape/model acceptance needs the first two routes plus pako; general font serving remains deferred and must be documented as unsupported/unverified rather than silently expanded into arbitrary static serving.

### R3 — Separate bounded baseline repairs from dependency migration (blocking)

`cli-plan.md:50,98,139` leaves routing and cleanup conditional while demanding that every real gate pass. These are already visible defects in the pre-C tree, not speculative candidate regressions:

- `index.js:84–86`: real `process.exit(1)` bypasses `finally` after render failure.
- `index.js:93–95`: rejected browser close prevents server close.
- `index.js:140,146`: render/batch promises float without a structured top-level rejection path.
- `harness.js:113–158`: manager disposal occurs only on success.
- `harness.js:71–99`: recorder/stream lifetime has no complete error/finally cleanup; a capture failure can leave the recorder and tracks active until browser destruction.

**Correction:** introduce a separately accepted prerequisite slice/checkpoint with a strict allowlist: finite required server assets, UPNG/pako load ordering, CLI structured failure/independent close attempts, and harness manager/recorder/track cleanup. Reproduce each relevant failure with benign inputs/injection; retain before/after evidence under the same runtime. No engine, parser, shape-generator, font-server, signal architecture or all-loader rewrite belongs in that slice. Hand its independently accepted checkpoint to C, then measure the Puppeteer migration against that working baseline. If a prerequisite cannot be completed within this bound, stop and amend the plan rather than granting C open-ended repair permission.

A focused failure-injection test must account for the fact that a mocked `process.exit` throwing **does** unwind `finally`, unlike real process termination. Unit cleanup passes cannot establish the real exit path; keep subprocess evidence mandatory.

### R4 — Resolve the public runtime contract explicitly (owner decision)

Actual root engine is `24.x`; actual CLI and embed engines are `>=20`; locked CLI Puppeteer is `22.15.0`. Retrieved Puppeteer `25.17.0` and helper `3.2.7` metadata both require `>=22.12.0`. CLI `>=20` is incompatible with this target.

The proposed CLI `24.x` is a defensible **breaking narrowing**, not a logical consequence of a private root engine. It also excludes Node 22 and future majors. Conversely, advertising `>=22.12.0` requires the minimum/current-22/24 evidence the plan proposes, not just Node 24 success.

**Correction:** maintainer must approve one concrete policy before acceptance; record the exact root/CLI/lock/docs consistency rules and source-checkout support boundary. Keep embed's separate advertised engine untouched unless explicitly assigned to another workstream. Do not treat this audit as owner approval of `24.x`. Pin an actually available approved Node/npm pair in the execution handoff; runtime acquisition is a separate bounded action if necessary.

### R5 — Make installer backends and peer testing accurate (blocking scope/evidence correction)

Read-only registry verification confirms helper `3.2.7` depends on `modern-tar ^0.8.6` and has optional peers `yauzl ^2.10.0 || ^3.4.0`, `proxy-agent >=8.0.1`. Installed proxy-agent 6.5.0 does not satisfy that peer. Retrieved candidate proxy-agent 8.0.1 brings agent-base 9, HTTP(S) agents 9, PAC agent 9 and SOCKS agent 10: this is a new closure requiring review, not a leaf patch.

Tagged upstream `packages/browsers/src/fileUtil.ts` shows:

1. ZIP extraction tries native tools first (`unzip` on this platform), then yauzl **only for an archiver-unavailable error**.
2. `modern-tar/fs` handles decompressed `.tar.bz2`/`.tar.xz`; it does not implement ZIP extraction.
3. `httpUtil.ts` catches proxy-agent import/construction failures and falls back to Node agents.
4. Public `install.mjs` warns on download failure, so exit zero alone is not installation proof.

**Correction:** fix the ambiguous modern-tar/ZIP description at plan line 27. Distinguish a native-unzip fresh Chrome installation from a forced, isolated **benign yauzl fallback** test. A tiny ZIP through `unpackArchive` with native unzip available does not test the peer. Select a supported exposed API or approved isolated PATH arrangement; do not patch installed helper code or disable security checks. Record native backend/tool identity and test tar with the supported compressed suffix/decompressor, not a generic unsupported `.tar` invocation.

Exact audited peer versions and metadata-derived path inventory remain an approval deliverable, not an implementation TODO. Optional peer resolution must be proven from the helper's location, not just the CLI root. Clarify “isolated consumer layout”: this can test the dependency/helper closure, but cannot certify standalone BitmapForge CLI installation while its server requires repository-root assets. Keep npm publication/portable packaging out of C.

Retain the existing basic-ftp override and adapter tests whenever get-uri survives. If new majors eliminate the path, make that an explicit graph-removal decision with a bounded historical-test execution strategy; neither deleting regressions nor reintroducing an obsolete runtime dependency is an acceptable default.

### R6 — Freeze finite artifact and failure acceptance (blocking)

The real subprocess/APNG/WebM matrix is substantially stronger than existing tests and should be retained. Root Vitest discovery omits CLI tests; existing CLI tests mock Puppeteer/evaluate/server/filesystem, and legacy integration checks only PNG header/acTL. None clears migration compatibility.

Before acceptance, replace remaining alternatives with a finite test ledger: fixture hash, command/options, format, target baseline/candidate, expected dimensions/timing, decode method, deadline and evidence location. Validate thresholds on the corrected baseline fixtures before freezing them. Preserve independent FFmpeg decode, composited APNG frames, rational timing, wall-clock-tolerant WebM cadence, meaningful occupancy/colors/change and actual subprocess-written files. Do not weaken these to signatures or a second encoder invocation.

Concrete corrections:

- Distinguish missing batch directory from empty batch. `index.js:101–106` creates the default `<target>/out` **before** `readdir`, so a nonexistent target can become an empty directory. Test this observed behavior; changing it requires a separately bounded baseline disposition, not migration attribution. A missing-directory case with an external explicit output directory can exercise the actual read failure.
- Decide the existing no-frame-progress contract now. Minimal recommendation: preserve/document absent progress and test stderr processing/output-path separation. Wiring callbacks is optional follow-up, not a prerequisite for fixing Puppeteer.
- Distinguish deterministic thrown/returned render failure from externally killed/hung jobs. Normal error cleanup is mandatory; an emergency kill is a failed application-cleanup result, never a pass. The plan both demands timeout/abort cleanup and defers signal handling: name the exact interruption contract/owner, or explicitly keep externally signalled cancellation outside C without claiming it verified.
- Existing legacy smoke needs a bounded child kill/output capture and rejection on spawn errors; its test-level timeout alone does not reap descendants. Preserve its original fixture/assertions and report limitations rather than claiming it is a valid shape gate.
- Failed-item no-output assertions must use fresh destinations and sequential batch policy: completed prior items remain. Assert the final child exit and cleanup independently of an earlier stdout path.

## Minimal bounded sequence and owner decisions

1. **Coordinator:** receive accepted A/B checkpoint and serial ownership transfer; refresh exact manifests/lock/runtime evidence. No concurrent mutation of manifests, lock or node_modules.
2. **Maintainer:** select CLI engine policy, Linux/source-checkout verification boundary, explicit zip/proxy compatibility policy, absence-of-progress documentation and cancellation boundary.
3. **Prerequisite author + independent reviewer:** approve and complete only corrected trusted fixtures, required finite routing/compression repairs, bounded cleanup repairs and their real regressions. Record original baseline debt separately. Stop for scope amendment on anything larger.
4. **C plan author:** append exact peer/closure inventory, backend-specific tests, frozen real-artifact ledger, thresholds and prerequisite checkpoint. Submit revised plan for independent ACCEPT **before candidate install**.
5. **C implementer after acceptance:** targeted resolution, graph review before hooks, fresh isolated locked install/browser proof, real render/failure/decode tests, residual audits and full inherited A/B gates. Then separate implementation review. Candidate behavioral evidence is expected after approval; successful candidate installs/renders are not demanded during this plan-only review.

## Audit limitations and completion

No candidate was installed, no browser was downloaded/launched, no APNG/WebM artifact was generated/decoded, and no fresh vulnerability count was claimed. A read-only upstream retrieval command initially failed due to Python quoting; a corrected read-only retrieval succeeded. Two initially guessed source paths differed in case/location; actual lowercase loader and animation-subdirectory files were then read. These are collection corrections, not application failures.

Only this audit report was written. **Outcome remains REVISE** until the blocking corrections and explicit owner dispositions are incorporated and independently re-reviewed. Issue #94 completion, hosted enforcement, publishing and deployment remain separate gates.
