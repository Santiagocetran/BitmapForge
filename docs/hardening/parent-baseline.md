# Shipped baseline — parent observations

- Main550842cab61002c7cc6563e50b9fcdeb17c9bf01; latest main workflow43666289022 succeeded, including deployment. No open PRs at milestone start; no COLLAB coordination files present.
- Downloaded that exact run's dist artifact into /home/agent/BitmapForge-hardening-research/baseline/dist. ci-revision.txt matches main; complete ci-sha256sums.txt verifies successfully. Preserve this immutable baseline rather than rebuilding while research reports are being written.
- Current paired local toolchain Node24.22.3/npm11.21.2. Locked Playwright1.59.1 has Chromium147/revision1217 installed. A separate NPX Playwright1.62.1 cache also exists but is NOT the project's locked runner and must not be substituted accidentally. Firefox/WebKit were not listed as installed. axe-core/@axe-core/playwright are not project dependencies; no accessibility tool was installed during baseline collection.
- Real production desktop empty editor inspected at1280x800. No horizontal document overflow. Artwork-first graphite/cobalt hierarchy, four task controls, readable source controls and central source actions are present. No cosmetic redesign is justified by this screen.
- Chrome Accessibility tree returned22 button nodes and no unnamed nonignored buttons. In particular icon-only history buttons are correctly named by their titles; a DOM text/aria-label-only check would have falsely reported missing names. This is NOT a complete accessibility audit or screen-reader certification.
- Observed text colors: primary rgb(243,241,235), secondary rgb(184,192,204); source instructions12px, supporting empty copy14px, empty heading28px. No contrast calculation or all-state pass is claimed from those values alone.
- Screenshot retained at /home/agent/BitmapForge-hardening-research/baseline/desktop-empty.png.

Existing accepted evidence includes main CI browser/export checks and previous real production model/exports/mobile smoke. Manual Safari, physical touch/keyboard, screen readers and actual browser-menu200% zoom remain unverified. New checks must distinguish those from viewport emulation, automated browser engines and structural AX inspection.
