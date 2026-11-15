# PR96 basic-ftp security completion — proposed plan

## Evidence and target

PR96 claims5.2.1 but actually overrides get-uri's basic-ftp to6.2.4. Current main uses5.2.0 via CLI -> Puppeteer22.15 -> @puppeteer/browsers -> proxy-agent -> pac-proxy-agent -> get-uri6.0.5. The website has no direct FTP import; that does not prove the Node dependency is unreachable. get-uri decodes FTP URL pathname/credentials, calls Client.access/lastMod/list/downloadTo and uses FTPError codes.

CVE2026-39983/GHSA-chqc-8p9q-pq6q requires>=5.2.1. However published subsequent advisories also affect the old line (CRLF credential/MKD hardening5.2.2; listing bounds5.3.0; control response bounds5.3.1; parser/control-character fixes through6.2.4). Latest upstream6.2.6 fixes downloadToDir path traversal. Proposed target **exact6.2.6 under existing get-uri override**, not a blanket audit fix. Independent research must confirm the least-risk supported target before implementation.

Version6 changes the default to reject separate transfer hosts (FTP-bounce hardening). Keep this security default; do not enable allowSeparateTransferHost merely to silence compatibility tests. Same-host passive transfer used by get-uri should work and requires real verification. Preserve existing package API/CLI behavior or report a concrete incompatibility.

## Scope and coordination

- Work locally on gloin/pr96-security, preserving fork author's b0c10c3 original commit; merge current mainc3056bc for Node24 rather than rewriting history. Main integration already completed cleanly, not pushed.
- Amend only scoped basic-ftp override and lock entry/version/resolved/integrity metadata; assert no unrelated resolutions changed. Keep Node24 policy and full CI protections.
- Add bounded real loopback regression coverage in CLI tests: actual get-uri MDTM download; missing-MDTM LIST/MLSD fallback; cache and missing-file errors; EPSV and PASV same-host transfers; percent-encoded CR/LF/NUL paths and credentials rejected without injected commands, leaked synthetic passwords or process crashes (subprocess evidence). Exercise malicious MLSD `__proto__` facts and bounded multiline control responses. Explicitly test/accept the v6 separate-transfer-host restriction without allowing external connections. Use a minimal local test FTP responder, no external service or added dependency; close all sockets/listeners. Keep subprocess fixtures outside Vitest test discovery and preserve budgets.
- Historical verification limitation: the implementation worker was interrupted by a provider security filter before vulnerable-version before/after reproduction. That proof is not performed or claimed. Retain upstream advisory/version/source evidence and the real patched-version rejection/compatibility regressions; do not retry the unfinished reproduction or treat unrelated connection errors as vulnerability proof.
- No production app/engine changes, broad dependency upgrades, audit suppression, timeout increases, weaker browser assertions or deployment/protection mutations.

## Verification and delivery

1. Independent research/plan audit; resolve mandatory findings before implementation.
2. Fresh locked Node24/npm11 install under existing script policy, exact npm ls resolution and audit readback for basic-ftp (do not claim all28 historical findings fixed).
3. Real loopback adapter/security regressions, complete root/embed/decode/CLI suites, lint/format/policy, app/SDK/CLI builds and native smoke; compare35applicationfiles and SDKchecks to accepted main output.
4. Independent implementation audit of final diff, regression red/green proof, version metadata and preserved safeguards.
5. Update existing fork PR96 branch using maintainer edits without force push; read back exact head. If write denied, stop and report instead of replacing/closing another author's PR silently.
6. Update title/body to true target and scope, retain original attribution/history. Approve fork workflow execution only after reviewing exact source/workflow diff; wait for hosted CI, including browser suite.
7. Required approving GitHub review remains outstanding; no merge/admin bypass/deploy by agent. Final report contains actual PR link, tests, reachability limits and residual findings.
