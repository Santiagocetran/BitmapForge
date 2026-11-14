# A1 project callback contract migration — independent audit

## Verdict: ACCEPT A1 functional repair; narrow formatting finding remains

The obsolete-owner failure identified in `integration-independent-audit.md` A1 is resolved. Save/Load contracts are now exercised on the actual `ProjectActions.propTypes` owner, not restored to output-only ExportPanel. This accepts the bounded contract-test migration, **not** the combined redesign or its final mandatory formatting/root/artifact gates.

Reviewed branch `gloin/editor-redesign`, HEAD `496f0d1f494e928c54f8fef2321835ccd5141917`, in the shared dirty checkout. Read repository governance, the original A1 finding, actual test diff and both production ownership declarations. Loaded the web-product-development skill. `CODEX.md` and COLLAB records are absent. This reviewer edited no application, validator, test, configuration or other worker-owned file; this document is the sole output. No dependency install, build, browser run, commit, push, deployment or polling of the parent's shared test process was performed.

## Exact acceptance boundary

- ExportPanel retains direct callable-positive tests for `onSelectFormat` and `exportSelected`.
- `saveProject` and `loadProject` receive equivalent direct callable-positive tests through `ProjectActions.propTypes`.
- **Each of all four callbacks** retains every original negative input: `undefined`, `null`, `false`, `'callback'`, and `{}`. None was removed or weakened.
- Added explicit absence assertions prevent either project callback contract from leaking back onto ExportPanel.
- Production declarations confirm ProjectActions owns both required-function validators, while ExportPanel owns the six output-only contracts. No production change is needed to satisfy A1.
- React 19 semantics remain explicit: the suite directly calls `.propTypes` metadata validators. It does not claim automatic function-component runtime validation.
- The historical HEAD diff also includes the separately introduced frozen navigation/presentation-contract case. It is not attributed to this narrow A1 repair; its assertions and the remaining tests remain present.

## Independent execution

Used installed Node `v20.20.2` at `/home/agent/.npm/_npx/ebaba8b9e55fd0a9/node_modules/node/bin/node` and direct installed CLI entrypoints; no package-manager indirection.

| Gate                                                                                            | Result                                                          |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `node node_modules/vitest/vitest.mjs run src/app/utils/uiPropValidators.test.js --maxWorkers=1` | Exit 0; **35 passed**, 1 file; 5.96s total, 60ms test execution |
| `node node_modules/eslint/bin/eslint.js src/app/utils/uiPropValidators.test.js`                 | Exit 0; no diagnostics                                          |
| `node node_modules/prettier/bin/prettier.cjs --check src/app/utils/uiPropValidators.test.js`    | **Exit 1**; formatting required                                 |
| `git diff --check -- src/app/utils/uiPropValidators.test.js`                                    | Exit 0                                                          |

Commands above use `node` as shorthand for the exact Node 20 path. The parent's independent full shared four-file run is outside this review; its process was not polled or awaited. Whole-root and artifact acceptance remain parent-owned.

## F1 — actionable formatting-only finding

At reviewed test lines 105–113, shortening the ExportPanel parameter list makes Prettier require the `it.each` invocation to collapse to the same layout as the new ProjectActions case:

```js
it.each(['onSelectFormat', 'exportSelected'])('requires callable ExportPanel.%s', (key) => {
  const validator = ExportPanel.propTypes[key]
  expect(validator({ [key]: () => {} }, key)).toBeNull()
  for (const value of [undefined, null, false, 'callback', {}])
    expect(validator({ [key]: value }, key)).toBeInstanceOf(Error)
})
```

The reviewer generated the expected formatted text in memory and inspected its unified diff: only this invocation's wrapping/indentation differs. Parent should format the owned test and rerun its narrow formatter/test gate. This is not a semantic A1 defect, but **do not report the reviewed file's formatting gate as green**. No source repair was applied by this reviewer.

## Reviewed source identities (SHA-256)

These hashes were checked before and after execution and were unchanged:

```text
093a48b2951d7fc6bdd132e58d2b958de46570cf27fbaeabf196946b972e712c  src/app/utils/uiPropValidators.test.js
6b4cbd4427d2149ab3e45e75b8f3aff19c58aa6b9d6e13116672531e06560911  src/app/utils/uiPropValidators.js
e0f3f8c17fb5569271148c1b5c9c4682264838988de424bb701fdc9e037ae82c  src/app/components/Layout/ProjectActions.jsx
e0b39c7420d71673f7dd3af82a2e5954d2b7d2c07cc2c6c3328a6c8b78db89d1  src/app/components/ExportPanel/ExportPanel.jsx
```

**Disposition:** A1's wrong-owner TypeError and lost-coverage risk are independently cleared for this exact test snapshot. F1 remains a small parent-owned formatting correction; this report does not clear unrelated combined-audit blockers.
