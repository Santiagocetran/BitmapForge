# ASCII A1 implementation audit

## Verdict

**Accept the bounded A1 implementation; no blocking A1 source or reproduced runtime defect found.** The canonical config preserves existing named ramps and explicit colored/monochrome choices, and freshly generated React and Web Component packages actually apply them in the supported model/static fixture. This is not full preview parity, release approval, or completion of #88/#90.

Independent audit performed on 2026-11-13, completed at 22:27 UTC, in `/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research`, branch `gloin/ui-output-improvements`, HEAD/base `298bdec17dcd1603add549118a743e5cd494ba08`, with uncommitted parallel work present. The worker's prior test report was not used as proof. Application code was not edited by this audit.

Authority: `AGENTS.md`, `creative-output.md` authoritative CO-R2/CO-R4 addenda, and `creative-output-acceptance.md` A1 (lines 19–35). Referenced CODEX/COLLAB bootstrap files were not found. Review ownership was limited to `exportConfig.js`, its tests, `asciiExport.test.js`, and `test/e2e/ascii-generated.spec.js`; generated templates/engine were inspected as dependencies, not claimed as this worker's changes.

## Source findings and acceptance mapping

| A1 requirement | Evidence | Assessment |
| --- | --- | --- |
| Only add existing settings | `src/app/utils/exportConfig.js:24–26`: `renderMode` unchanged; `charRamp: state.charRamp ?? 'classic'`, `asciiColored: state.asciiColored ?? false`. Actual production diff is three added lines replacing one line. | Pass. No coercion or truthy default that loses explicit `false`. |
| Preserve named IDs and renderer fallback | `exportConfig.test.js:81–108` covers classic/blocks/dense/minimal, both booleans, null/undefined/missing fields, unknown and empty IDs. `AsciiRenderer.js:109–111` retains `CHAR_RAMPS[id] ?? CHAR_RAMPS.classic`. | Pass. Config deliberately preserves unknown IDs; it does not add import validation. |
| Unrelated config and input unchanged | `exportConfig.test.js:110–138` checks unrelated effect/top-level values and frozen input against a snapshot. | Pass. No global store/rendering changes in the A1 source diff. |
| Fresh archive serialization and engine inclusion | `asciiExport.test.js:30–57`: React, Web Component and Code ZIP builders; parse fresh `config.js` JSON for named/unknown IDs and true/false; legacy defaults; all `ENGINE_SOURCES` entries equal archive contents. | Pass. This is serialization evidence, not runtime evidence. |
| Generated runtime applies settings | `ascii-generated.spec.js:47–94, 99–183`: build ZIPs in a browser, extract, import actual generated component/custom element, inspect active renderer, intercept real `fillText`, compare local-engine draw calls and PNG. | Pass for blocks, both color modes, each integration, in Chromium. |
| Supported/default fixture boundaries | Fixture loads `tiny.stl`, uses zero base rotation, implicit model scale 1, default duration 2500, no animation/post-effects, static `renderAtTime(3000)`. | Appropriate A1 boundary. No pose/scale/duration/post-effect repair is inferred. |

Both generated templates pass `config.effectOptions` into `SceneManager` and call `setRenderMode(config.effectOptions.renderMode)` (`reactComponentExport.js:37–39`, `webComponentExport.js:42–44`). `SceneManager.setRenderMode` forwards existing effect options to `createRenderer`. The runtime test wraps that method **after calling the original** to pause recurring animation and expose the instance. It does not inject the ramp/color into the generated instance. The independently created local reference explicitly requests blocks and the expected boolean, so dropping either new config field would not be concealed by comparing two identically missing values.

The reference does share the current engine/settings and therefore tests integration parity, not an independent glyph-density/brightness oracle. Existing renderer tests provide additional unit coverage; A2 correctness is not audited or approved here.

## Commands and observed results

Commands below ran from the repository root. Toolchain: `npx --yes --package=node@20 -c 'node --version'` returned `v20.20.2`; Vitest `4.0.18`; Playwright `1.59.1`, Chromium, software GL, viewport 1280×800, DPR 1.

### Targeted unit/export tests

```sh
npx --yes --package=node@20 -c 'node node_modules/vitest/vitest.mjs run src/app/utils/exportConfig.test.js src/app/utils/asciiExport.test.js src/app/utils/reactComponentExport.test.js src/app/utils/webComponentExport.test.js src/app/utils/codeExport.test.js src/engine/renderers/AsciiRenderer.test.js'
```

Exit 0: **6 files / 158 tests passed** (14.09s): config 16, ASCII archive 21, React 33, Web Component 31, Code ZIP 15, renderer 42. This independently observed total differs from the prior worker's reported 155; this audit reports the actual selected command, not a reconstructed worker run.

```sh
npx --yes --package=node@20 -c 'node node_modules/vitest/vitest.mjs run --config vitest.export.config.js'
```

Exit 0: **3 files / 66 tests passed** (8.29s): sprite-sheet decode 13, APNG decode 14, ZIP config 39. No video/GIF decode coverage is implied.

```sh
npx --yes --package=node@20 -c 'node node_modules/eslint/bin/eslint.js src/app/utils/exportConfig.js src/app/utils/exportConfig.test.js src/app/utils/asciiExport.test.js test/e2e/ascii-generated.spec.js; node node_modules/prettier/bin/prettier.cjs --check src/app/utils/exportConfig.js src/app/utils/exportConfig.test.js src/app/utils/asciiExport.test.js test/e2e/ascii-generated.spec.js'
git diff --check -- src/app/utils/exportConfig.js src/app/utils/exportConfig.test.js
```

ESLint emitted no diagnostics; Prettier reported all matched files conform; commands exited 0. These are scoped checks, not root lint/format acceptance.

### Fresh generated browser execution

Did **not** use the default config's reusable port-5173 app server. An audit-only config outside the repository imports the existing Playwright config and overrides:

```js
export default {
  ...base,
  testDir: '/home/agent/.hermes/profiles/gloin/cache/scratch/bitmapforge-research/test/e2e',
  webServer: undefined,
  outputDir: '/home/agent/.hermes/profiles/gloin/cache/scratch/ascii-a1-audit-playwright-results',
  reporter: [['list']],
  use: { ...base.use, trace: 'on', screenshot: 'only-on-failure' }
}
```

The spec itself starts its own `configFile: false` Vite server on `127.0.0.1`, port `0`, derives the actual origin from that server's address, and closes it in teardown. Fresh archive files use a private temporary fixture directory removed on completion. The generated README's Vite/bundler path is exercised; the plain-HTML/CDN path is not.

```sh
npx --yes --package=node@20 -c 'node node_modules/@playwright/test/cli.js test test/e2e/ascii-generated.spec.js --config=/home/agent/.hermes/profiles/gloin/cache/scratch/ascii-a1-audit.playwright.config.mjs'
```

Initial independent run: **4 passed**, exit 0 (37.6s). Vite reported a concurrent `modelLoader.js` edit, so it was not treated as stable-tree proof. Final rerun used an external Python wrapper to hash implementation/dependency files before and after while executing the same command:

```sh
python3 /home/agent/.hermes/profiles/gloin/cache/scratch/ascii-a1-audit-recheck.py
```

Final result: **4 passed**, exit 0 (59.3s). Of 86 hashed utility/engine/spec/model files, only the unrelated `SceneManager.safety.test.js` changed; no hashed implementation or A1 target changed during this rerun. This establishes a stable runtime dependency window, not a clean or frozen whole repository.

Parsed actual evaluation results from the final Playwright traces (not inferred from test titles):

| Integration | `asciiColored` | Actual renderer/ramp | `fillText` calls | Distinct colors | Draw calls / PNG equal local reference |
| --- | --- | --- | --- | --- | --- |
| React | true | AsciiRenderer / blocks | 84 | 43 | yes / yes |
| React | false | AsciiRenderer / blocks | 84 | 1 (`#ffffff`) | yes / yes |
| Web Component | true | AsciiRenderer / blocks | 84 | 43 | yes / yes |
| Web Component | false | AsciiRenderer / blocks | 84 | 1 (`#ffffff`) | yes / yes |

All four observed the expected ramp and nonempty `░▒▓█` glyph set; all page-error assertions passed. Renderer PNGs extracted from the trace evaluation were visually inspected: nonblank small horizontal model silhouette, blue/green/white palette coloration versus white monochrome on dark background. The fixture is a small technical model, not a broad visual-quality reference.

Audit evidence outside the repository:

- `../ascii-a1-audit-evidence/browser.log`: final browser output.
- `../ascii-a1-audit-evidence/source-manifest.json`: command, exit code, before/after SHA-256 values and changed-file list.
- `../ascii-a1-audit-evidence/runtime-summary.json`: four parsed actual/reference results and image-data hashes.
- `../ascii-a1-audit-evidence/*.png`: actual renderer captures.
- `../ascii-a1-audit-playwright-results/*/trace.zip`: four final managed-context traces.
- `../ascii-a1-audit.playwright.config.mjs`, `../ascii-a1-audit-recheck.py`: isolated runner and provenance wrapper.

Trace screencast JPEGs happened to capture blank pre-render pages; they are not evidence of rendered-output failure or visual success. The PNGs come from the actual renderer's `toDataURL` after the deterministic render. Extracted package directories are intentionally deleted by spec teardown; traces and captured evaluation output retain the audit evidence.

Reviewed A1 source SHA-256 values:

```text
c4417f12faac9fd2e914da0fd6f62902ce89ededeec2887c4f0845e9b52f6537  src/app/utils/exportConfig.js
ae6f1c26a962087de830df50cd768b09f0768de2a97c2860bd510b6b8ebe69be  src/app/utils/exportConfig.test.js
0ac05325afa4fc0d958c36115321c3faec4cef0df69c75c09979642387dc6cca  src/app/utils/asciiExport.test.js
446bdb14c9050b0cefb7bc68a84991533157a7973af31037ae0c5861f678fced  test/e2e/ascii-generated.spec.js
```

## Actionable findings and remaining gates

1. **No blocking A1 application finding.** Keep this patch limited to the two canonical effect options and scoped tests. No brightness, typography, source/pose parity or lifecycle fix is justified by this audit.
2. **Low priority — make isolated invocation durable.** The spec header recommends the default Playwright invocation, but `playwright.config.js:27–31` also starts/reuses an unnecessary app server on 5173 despite this spec owning its own host. The separate test/CI owner should provide a repository-supported isolated generated-artifact config/command with server reuse disabled and managed-context traces. This audit's external override avoided that risk; the default invocation was not validated.
3. **Release gate, not an A1 regression — run final integrated checks.** Root lint/format/unit/build, SDK tests/build/size/alias checks, CLI tests/build, and final CI/release provenance were not run here. Parallel UI/palette/engine work remains outside this audit. The integration owner must execute applicable exact-final-tree checks after those edits settle; this bounded acceptance must not be used as deployment approval. No unrelated suite failures were attributed to ASCII.
4. **Preserve evidence/publication visibility.** `git check-ignore docs/plans/ascii-a1-implementation-audit.md` confirms this audit document is ignored locally. Parent must explicitly include it in the intended review artifact or arrange authorized tracking; its existence is not evidence it will be included in a commit. Scratch evidence is local/ephemeral and should be retained separately if durable review evidence is required.

Coverage intentionally unavailable/not claimed: other named ramps in generated runtime (all four are covered in config/archive tests); unknown-ID fallback through generated browser runtime; second browser/DPR 2; animation/fade/static brightness parity; custom ramps/fonts; GPU/performance changes; generated Code ZIP ASCII selection (serialization only); SDK Embed application (project data is a different path); CLI rendering parity; non-root production builds, offline/CDN behavior, StrictMode/reconnect/motion policy; full seed/scale/pose/post-effects/duration/source parity. These do not block the accepted A1 fixture; they prohibit broader completion claims.

One invocation issue was encountered and corrected: nesting `npx vitest` within the outer `npx ... -c` produced npm `EUSAGE` before test execution. Calling the installed tool's JS entrypoint with Node 20 resolved it; no failed command was counted as a test pass.

Only this audit document was authored inside the repository. No application, workflow or test source was modified; no reset/stash/commit/push, remote write or deployment was performed.
