# Baseline-relative UI response observation

This is a small observational check, not an optimization claim or a statistical performance certification.

## Method

- Baseline: clean detached worktree at `8c6613279ed856e4933608e7e6c04e91dca2b331`; candidate: actual current redesign source on the isolated parent review server.
- Same installed dependencies, Node 20, headless Chromium/software GL and 1440×1000 viewport. Separate pages, sequential runs; other verification processes may be active on the host. No CPU/network throttling or physical-device input measurement.
- Both use the actual app, Cube/Bitmap source setup, existing pixel-size range, and twenty trusted native ArrowRight/ArrowLeft key actions alternating between values 3 and 4.
- An observational capture listener timestamps native `keydown`; an observational store subscriber records the synchronous pixelSize change. No app method is replaced, rendering forced, or action response synthesized. Setup selects the same source through existing store setters before measurement.
- The recorded interval is **DOM keydown capture → synchronous store notification**, not OS-to-paint latency, time to update the GPU, total React commit time, export speed or FPS. The main canvas exists and remains the identical node throughout each sequence. Existing Layout/engine lifetime tests and independent full-browser checks provide separate manager/cancellation coverage.

## Results

Raw values are retained in [input-to-store.json](evidence/input-to-store.json), including every sample, URL and baseline revision.

- Baseline: 20/20 state changes; median **1.30ms**, sampled p95 **2.90ms**.
- Redesign: 20/20 state changes; median **1.55ms**, sampled p95 **8.50ms**.
- Main preview node retained in both runs; no missing native actions.

The candidate is not faster in this small sample. Scheduling, source-transform warmup, animation phase and concurrent verification are uncontrolled; twenty sequential events cannot establish a general performance regression or equivalence guarantee. The observed sub-10ms sampled p95 is a report of this event/store phase only, not a new acceptance threshold. No FPS, speedup, battery or production-rendering claim follows. Real-device interaction/paint profiling remains a follow-up if users report latency.

External runner and detailed source provenance are preserved locally in `BitmapForge-redesign-research/latency-evidence/` and `cache/scratch/bitmapforge-redesign-latency.mjs`; these paths are execution records, not portable project commands. The baseline Vite server and benchmark Chromium closed in `finally`; the parent review server remains separately owned.
