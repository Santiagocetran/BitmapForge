# CLI (source-checkout Linux boundary)

This CLI currently runs from this repository and its installed dependencies. It is
not certified as a standalone published package. Public engine declarations are
unchanged (CLI `>=20`, root `24.x`); prerequisite-P verification uses Node 24.22.3
and npm 11.21.2, without certifying every declared Node version.

```sh
npm run build --workspace=@bitmapforge/cli
node packages/cli/src/index.js render project.bforge --format apng --out output.apng
node packages/cli/src/index.js render project.bitmapforge --format webm --fps 10 --width 160 --height 120
node packages/cli/src/index.js batch projects --format apng --out 'batch output'
npm test --workspace=@bitmapforge/cli
```

An existing Puppeteer **22.15.0** compatible Chrome installation is required.
`CI=1` enables the existing no-sandbox launch flags; sandbox disabling is not a
recommended default for untrusted projects. Do not substitute another browser or
change dependencies to bypass a missing installation. Acquisition needs separate
authorization in this hardening task.

- Formats: APNG and WebM. Default: APNG, 12 fps, 400×400, basename in the current
  working directory. WebM pads odd dimensions to even dimensions. Batch processes
  `.bforge`/`.bitmapforge` files sequentially, stops on the first error, and keeps
  already written outputs. Default batch output is `<input directory>/out`.
  Historically, a nonexistent batch directory with default output is created and
  then reported empty; explicit external output instead exposes the read error.
- Successful writes print absolute output paths to stdout. Diagnostics and batch
  processing messages go to stderr. A printed path does not override a later
  cleanup failure/nonzero exit. There is no transactional output rollback.
- The harness currently makes **no frame-progress callbacks**. The exposed callback
  is retained, but no per-frame progress is promised or fabricated.
- Ordinary settled success/error paths independently close acquired browser and
  server owners. The harness disposes a successfully constructed manager once,
  resumes paused capture, and attempts every acquired stream track cleanup. Its
  recorder stop/error wait is bounded to five seconds. Constructor-internal leaks
  or a rejected `browser.close()` are not certified OS teardown.
- There are **no graceful signal/abort/cancellation guarantees**: SIGINT/SIGTERM,
  killed browsers, infinite/hung evaluation, host loss and SIGKILL are excluded.
  The integration helper's 60-second deadline/1 MiB per-stream cap and owned-group
  TERM→five-second grace→KILL containment mark a failed run, not cancellation
  acceptance. It never kills unrelated process groups.
- The local server intentionally exposes only seven exact raw routes:
  `/harness.html`, `/harness.js`, `/headless.js`, `/three.module.js`,
  `/three.core.js`, `/pako.js`, `/upng.js`. Query variants and other paths are 404.
  Classic pako loads before classic UPNG. It is not a general static-file server.
- Supported acceptance fixtures are a nested version-2 cube (`size:2`) and a
  self-contained embedded OBJ tetrahedron. Text/lazy fonts, image inputs, GLTF
  external resources and arbitrary model assets are unsupported/unverified in
  this boundary; do not widen routing to imply coverage. The frozen `bayer4`
  token exercises existing fallback behavior, not a Bayer-4×4 assertion.
- The historical flat `shape.bforge` fixture is deliberately unchanged. It reaches
  empty/default content and its legacy header/acTL smoke does not prove a box or
  meaningful/nonblank rendering.

See `docs/hardening/cli-prerequisite-verification.md` for checkpoint evidence and
outstanding real-browser/artifact gates. Dependency migration (Batch C), runtime
policy narrowing, publication and deployment are separate, unapproved work.
