# PR96 — basic-ftp remediation and verification

## Decision and scope

Existing PR96 claimed5.2.1 while actually installing6.2.4. This revision pins **get-uri -> basic-ftp6.2.6** using the existing narrow override. Preserve original author's commit and attribution; current Node24 main was merged locally without rewriting the fork's history.

Independent research `deleg_091b2fbe` confirmed6.2.6 as the latest upstream release containing the published fixes.5.2.1 fixes [CVE-2026-39983](https://nvd.nist.gov/vuln/detail/CVE-2026-39983) but predates further fixes; latestv5/5.3.1 has no published backports of later v6 fixes. Proposed6.2.4 predates the [6.2.6 traversal repair](https://github.com/patrickjuchli/basic-ftp/releases/tag/v6.2.6). This is not a claim that6.2.6 is vulnerability-free. The traversal advisory's affected/patched boundary is inconsistent; the explicitly fixed6.2.6 release was selected, not an inferred6.2.5.

Only the basic-ftp lock entry's version, tarball URL and integrity differ from main. Root package differs only by the scoped override. Official registry tarball/integrity match the lock. No unrelated package resolutions, app/engine code, Node24 policy, existing assertions/budgets, CI or deployment protections changed.

## Reachability and compatibility

Dependency path: CLI -> Puppeteer22.15 -> @puppeteer/browsers2.3 -> proxy-agent6.5 -> pac-proxy-agent7.2 -> get-uri6.0.5 -> basic-ftp. PAC+FTP configuration can invoke this Node path; the browser-only editor having no direct FTP imports does not prove it unreachable. Exploitability depends on configuration, server and input control; no active exploit in BitmapForge was established.

get-uri decodes paths/credentials and uses access, MDTM, listing fallback and downloadTo; it does not call downloadToDir. Its declared basic-ftp ^5.0.2 range does not include6, so this is an **intentional tested major override**. Version6 defaults to rejecting separate FTP transfer hosts (bounce hardening); that restriction is retained, not bypassed. Unusual multi-host FTP configurations may no longer work. The adapter's existing download-promise rejection handling was not repaired or comprehensively tested here; separate-host rejection is exercised through its pre-download listing path. Do not claim every transfer-error path is covered.

## Real local checks (Node24.22.3 / npm11.21.2)

- Fresh locked install and npm ls resolve6.2.6 under get-uri.
- **16 subprocess/loopback cases**: normal EPSV/PASV downloads; MDTM and listing fallback; cache; missing files; invalid path/credential rejection; malformed listing/control-response handling; listing bounds; separate-transfer-host rejection. No external FTP service or added test dependency. Child processes bounded at3seconds; original Vitest budgets retained. Fixture blocks non-loopback connection attempts, closes sockets/listeners, and checks subprocess error output.
- Complete root **853/61files**, embed **23**, decode/archive **66**, CLI **26 passed/1 existing optional skip** (16new plus10existing).
- Native runtime policy **6/6**, root lint/format, app/SDK/CLI builds and **two native bitmap cases** passed.
- **35/35 built app files identical** to exact merged-main CI artifact. SDK package/public/app bytes match, no alias leakage; gzip **46,708<=51,200**.
- npm audit reports **zero basic-ftp entries**, with **27 other findings** remaining (2low,4moderate,19high,2critical). This is not a claim to fix the repository's entire audit backlog.

Raw outputs and scope comparison: `/home/agent/BitmapForge-redesign-research/pr96-security-evidence/`.

## Interruption and verification boundary

The implementation worker read/reviewed the parent plan and completed dependency changes and16 passing cases, then was interrupted by a provider security filter before its handoff/baseline reproduction completed. Parent recovered the actual files and logs, removed the unused private Module.\_load substitution hook, fixed a missing Buffer import, and reran all gates above. **No vulnerable-version before/after exploit reproduction is claimed.** Patched-version regressions plus upstream advisory/source/version evidence are the demonstrated boundary.

Final independent implementation review **deleg_25c7486d: ACCEPT**, no blocking findings; reviewer independently reran six benign adapter cases on Node22 and checked the parent Node24 full-gate evidence. This is final implementation/evidence acceptance, **not a completed preimplementation plan approval**. Existing fork PR must be updated without force, title/body corrected, exact remote head read back and all hosted gates passed before recommending approval. Required approving GitHub review remains; no merge/deploy/admin bypass performed.
