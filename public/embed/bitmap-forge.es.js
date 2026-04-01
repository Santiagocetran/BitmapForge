import * as S from "three";
import { Loader as pe, FileLoader as ne, BufferGeometry as te, Color as U, SRGBColorSpace as V, BufferAttribute as X, Vector3 as N, Float32BufferAttribute as H, TrianglesDrawMode as gt, TriangleFanDrawMode as Me, TriangleStripDrawMode as st, LoaderUtils as Q, MeshPhysicalMaterial as k, Vector2 as nt, LinearSRGBColorSpace as B, SpotLight as _t, PointLight as bt, DirectionalLight as xt, Matrix4 as de, Quaternion as it, InstancedMesh as yt, InstancedBufferAttribute as Tt, Object3D as rt, TextureLoader as wt, ImageBitmapLoader as Rt, InterleavedBuffer as St, InterleavedBufferAttribute as Mt, LinearMipmapLinearFilter as ot, NearestMipmapLinearFilter as Ct, LinearMipmapNearestFilter as Et, NearestMipmapNearestFilter as vt, LinearFilter as Ce, NearestFilter as at, RepeatWrapping as Ee, MirroredRepeatWrapping as At, ClampToEdgeWrapping as Lt, PointsMaterial as Z, Material as ee, LineBasicMaterial as le, MeshStandardMaterial as ct, DoubleSide as It, MeshBasicMaterial as J, PropertyBinding as Ft, SkinnedMesh as Ot, Mesh as ve, LineSegments as Ae, Line as Pt, LineLoop as Nt, Points as he, Group as ue, PerspectiveCamera as Dt, MathUtils as kt, OrthographicCamera as jt, Skeleton as Ut, AnimationClip as Bt, Bone as Gt, InterpolateDiscrete as Ht, InterpolateLinear as lt, Texture as Fe, VectorKeyframeTrack as Oe, NumberKeyframeTrack as Pe, QuaternionKeyframeTrack as Ne, ColorManagement as De, FrontSide as zt, Interpolant as Vt, Box3 as Kt, Sphere as Xt, MeshPhongMaterial as Wt, ExtrudeGeometry as Yt, ShapePath as $t } from "three";
function se(u) {
  let e = u >>> 0 || 1;
  return function() {
    return e = Math.imul(e, 1664525) + 1013904223 >>> 0, e / 4294967296;
  };
}
class qt {
  constructor(e, t = {}) {
    this.renderer = e, this.options = {
      colors: ["#074434", "#ABC685", "#E8FF99", "#F7F9CE", "#FFF6E7"],
      backgroundColor: "transparent",
      invert: !1,
      minBrightness: 0.05,
      animationDuration: 2500,
      seed: null,
      ...t
    }, this.width = 1, this.height = 1, this.animationPhase = "fadeIn", this.animationProgress = 0, this.animationStartTime = 0, this.isAnimating = !1, this.particles = [], this.particlesInitialized = !1, this.domElement = document.createElement("div"), this.domElement.style.cursor = "default", this._colorLUT = null, this._buildColorLUT(), this._rng = this._createRNG();
  }
  _createRNG() {
    return this.options.seed != null ? se(this.options.seed) : null;
  }
  setSize(e, t) {
    this.width = Math.max(1, Math.floor(e)), this.height = Math.max(1, Math.floor(t)), this.renderer.setSize(this.width, this.height), this.resetParticles();
  }
  updateOptions(e = {}) {
    const t = this.options.pixelSize, n = this.options.seed;
    this.options = { ...this.options, ...e }, e.pixelSize && t !== e.pixelSize ? this.onStructuralOptionChange() : "seed" in e && e.seed !== n ? (this._rng = this._createRNG(), this.resetParticles()) : this.onOptionChange(), (e.colors || e.invert !== void 0) && this._buildColorLUT();
  }
  onOptionChange() {
  }
  onStructuralOptionChange() {
  }
  startAnimation(e = "fadeIn") {
    this.animationPhase = e, e === "fadeIn" || e === "fadeOut" ? (this.isAnimating = !0, this.animationStartTime = performance.now(), this.animationProgress = 0, this.resetParticles()) : (this.isAnimating = !1, this.animationProgress = 1);
  }
  isAnimationComplete() {
    return (this.animationPhase === "fadeIn" || this.animationPhase === "fadeOut") && this.animationProgress >= 1;
  }
  getAnimationPhase() {
    return this.animationPhase;
  }
  setAnimationPhase(e) {
    this.animationPhase = e, e === "show" && (this.isAnimating = !1);
  }
  // Set phase and progress directly for frame-stepping during export.
  // Adjusts animationStartTime so tickAnimation() stays consistent.
  setPhaseProgress(e, t) {
    const n = Math.max(0, Math.min(1, t));
    this.animationPhase = e, e === "fadeIn" || e === "fadeOut" ? (this.isAnimating = !0, this.animationStartTime = performance.now() - n * this.options.animationDuration, this.animationProgress = n, n === 0 && this.resetParticles()) : (this.isAnimating = !1, this.animationProgress = 1);
  }
  tickAnimation() {
    if (!this.isAnimating) return;
    const e = performance.now() - this.animationStartTime;
    this.animationProgress = Math.min(e / this.options.animationDuration, 1);
  }
  resetParticles() {
    this.particles = [], this.particlesInitialized = !1, this._rng = this._createRNG();
  }
  getBrightness(e, t, n) {
    return (0.3 * e + 0.59 * t + 0.11 * n) / 255;
  }
  easeInOutCubic(e) {
    return e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
  }
  lerpColor(e, t, n) {
    const s = parseInt(e.slice(1, 3), 16), i = parseInt(e.slice(3, 5), 16), r = parseInt(e.slice(5, 7), 16), o = parseInt(t.slice(1, 3), 16), a = parseInt(t.slice(3, 5), 16), c = parseInt(t.slice(5, 7), 16), l = Math.round(s + (o - s) * n), h = Math.round(i + (a - i) * n), f = Math.round(r + (c - r) * n);
    return `rgb(${l},${h},${f})`;
  }
  _computeColorForBrightness(e) {
    const t = this.options.colors;
    if (!t || t.length === 0) return "#000000";
    if (t.length === 1) return t[0];
    const n = e * (t.length - 1), s = Math.floor(n), i = Math.min(s + 1, t.length - 1), r = n - s;
    return this.lerpColor(t[s], t[i], r);
  }
  _buildColorLUT() {
    const e = new Array(256);
    for (let t = 0; t < 256; t++)
      e[t] = this._computeColorForBrightness(t / 255);
    this._colorLUT = e;
  }
  getColorForBrightness(e) {
    return this._colorLUT || this._buildColorLUT(), this._colorLUT[Math.round(e * 255)];
  }
  applyAlpha(e, t) {
    if (t >= 1) return e;
    if (e.startsWith("#")) {
      const n = parseInt(e.slice(1, 3), 16), s = parseInt(e.slice(3, 5), 16), i = parseInt(e.slice(5, 7), 16);
      return `rgba(${n},${s},${i},${t})`;
    }
    return e.startsWith("rgb(") ? e.replace("rgb(", "rgba(").replace(")", `,${t})`) : e;
  }
  initializeParticles(e, t, n, s, i) {
    this.particles = [];
    let r = 0;
    const o = Math.sqrt(this.width * this.width + this.height * this.height) / 2;
    for (let a = 0; a < t; a++)
      for (let c = 0; c < e; c++) {
        const l = (a * e + c) * 4, h = s[l], f = s[l + 1], d = s[l + 2], g = s[l + 3], p = this.getBrightness(h, f, d);
        if (g === 0 || p < this.options.minBrightness) {
          r++;
          continue;
        }
        const m = this.options.invert ? 1 - p : p;
        if (!i(m, c, a)) {
          r++;
          continue;
        }
        const _ = c * n, x = a * n;
        let T, b;
        if (this._rng)
          T = this._rng() * Math.PI * 2, b = 300 + this._rng() * 500;
        else {
          const E = r * 0.1, L = Math.sin(E * 12.9898 + E * 78.233) * 43758.5453, I = L - Math.floor(L);
          T = I * Math.PI * 2, b = 300 + I * 500;
        }
        const R = this.width / 2 + Math.cos(T) * b, y = this.height / 2 + Math.sin(T) * b, w = _ - this.width / 2, v = x - this.height / 2, C = Math.sqrt(w * w + v * v), A = C / o * 0.4;
        this.particles.push({
          idx: r,
          startX: R,
          startY: y,
          finalX: _,
          finalY: x,
          delay: A,
          distFromCenter: C,
          brightness: m,
          color: this.getColorForBrightness(m)
        }), r++;
      }
    this.particlesInitialized = !0;
  }
  dispose() {
    this.particles = [], this.particlesInitialized = !1, this.isAnimating = !1, this.animationProgress = 0;
  }
}
class me {
  constructor(e = {}) {
    this.options = e;
  }
  /**
   * Called once after particles are (re-)initialized at the start of each phase.
   * Use this to compute and attach any per-particle metadata your variant needs.
   *
   * @param {object[]} particles
   * @param {number} canvasWidth
   * @param {number} canvasHeight
   * @param {number} pixelSize
   * @param {number} gridWidth
   * @param {number} gridHeight
   */
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(e, t, n, s, i, r) {
  }
  /**
   * Called every frame while animating. Returns an array of pixel descriptors
   * that BitmapEffect will draw via drawPixel().
   *
   * @param {object[]} particles
   * @param {number} progress - 0–1 overall animation progress for this phase
   * @param {'fadeIn'|'fadeOut'} phase
   * @param {function(number): number} easeInOutCubic
   * @returns {{ x: number, y: number, brightness: number, color: string, alpha: number }[]}
   */
  // eslint-disable-next-line no-unused-vars
  getVisiblePixels(e, t, n, s) {
    return [];
  }
}
class Zt extends me {
  initVariantMetadata(e) {
    for (const t of e)
      t.bloomThreshold = 1 - t.brightness;
  }
  getVisiblePixels(e, t, n) {
    const i = [];
    for (const r of e) {
      let o;
      if (n === "fadeIn")
        o = Math.min(1, Math.max(0, (t - r.bloomThreshold + 0.18) / 0.18));
      else if (n === "fadeOut")
        o = Math.min(1, Math.max(0, (r.bloomThreshold - t + 0.18) / 0.18));
      else
        continue;
      o <= 0 || i.push({ x: r.finalX, y: r.finalY, brightness: r.brightness, color: r.color, alpha: o });
    }
    return i;
  }
}
class Jt extends me {
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(e, t, n, s, i, r) {
    const o = this.options.seed ?? 1, a = 0.4, c = new Float32Array(i);
    for (let l = 0; l < i; l++) {
      const h = Math.sin(l * 127.1 + o * 311.7) * 43758.5453;
      c[l] = (h - Math.floor(h)) * a;
    }
    for (const l of e) {
      const h = Math.floor(l.finalX / s);
      l.cascadeDelay = c[Math.min(h, i - 1)], l.cascadeStartY = l.finalY - n - s;
    }
  }
  getVisiblePixels(e, t, n, s) {
    const i = [];
    for (const r of e) {
      const o = 1 - r.cascadeDelay, a = o <= 0 ? 1 : Math.min(1, Math.max(0, (t - r.cascadeDelay) / o)), c = s(a);
      let l, h, f;
      if (n === "fadeIn")
        h = Math.round(r.cascadeStartY + (r.finalY - r.cascadeStartY) * c), l = r.finalX, f = a > 0 ? 1 : 0;
      else if (n === "fadeOut") {
        const d = r.finalY + (r.finalY - r.cascadeStartY);
        h = Math.round(r.finalY + (d - r.finalY) * c), l = r.finalX, f = a < 1 ? 1 : 0;
      } else
        continue;
      f <= 0 || i.push({ x: l, y: h, brightness: r.brightness, color: r.color, alpha: f });
    }
    return i;
  }
}
class Qt extends me {
  initVariantMetadata(e, t, n, s, i, r) {
    const o = this.options.seed ?? 2;
    for (const a of e) {
      const c = r > 1 ? Math.floor(a.finalY / s) / (r - 1) : 0, l = Math.sin(a.idx * 43.9898 + o * 127.233) * 43758.5453, h = l - Math.floor(l);
      a.staticThreshold = c * 0.7 + h * 0.3;
    }
  }
  getVisiblePixels(e, t, n) {
    const i = [];
    for (const r of e) {
      let o;
      if (n === "fadeIn")
        o = Math.min(1, Math.max(0, (t - r.staticThreshold + 0.06) / 0.06));
      else if (n === "fadeOut")
        o = Math.min(1, Math.max(0, (r.staticThreshold - (1 - t) + 0.06) / 0.06));
      else
        continue;
      o <= 0 || i.push({ x: r.finalX, y: r.finalY, brightness: r.brightness, color: r.color, alpha: o });
    }
    return i;
  }
}
class es extends me {
  initVariantMetadata(e) {
    const t = this.options.seed ?? 0;
    for (const n of e) {
      const s = Math.sin(n.idx * 12.9898 + t * 78.233) * 43758.5453;
      n.glitchNoise = s - Math.floor(s);
    }
  }
  getVisiblePixels(e, t, n) {
    const s = [];
    for (const i of e) {
      let r;
      if (n === "fadeIn")
        r = i.glitchNoise < t;
      else if (n === "fadeOut")
        r = i.glitchNoise >= t;
      else
        continue;
      r && s.push({ x: i.finalX, y: i.finalY, brightness: i.brightness, color: i.color, alpha: 1 });
    }
    return s;
  }
}
function ke(u, e = {}) {
  switch (u) {
    case "cascade":
      return new Jt(e);
    case "static":
      return new Qt(e);
    case "glitch":
      return new es(e);
    default:
      return new Zt(e);
  }
}
class Y {
  constructor(e = {}) {
    this.options = e;
  }
  /**
   * Initialize renderer-specific resources at a given size.
   * Called once after construction and again on renderer swaps.
   * @param {number} width
   * @param {number} height
   */
  init(e, t) {
  }
  // eslint-disable-line no-unused-vars
  /**
   * Render one frame from downsampled imageData to the renderer's canvas.
   * Called every frame when not in a fade animation.
   * @param {Uint8ClampedArray} imageData - flat RGBA pixel data (gridW × gridH)
   * @param {number} gridW
   * @param {number} gridH
   * @param {(brightness: number) => string} getColor - maps brightness [0,1] → CSS color
   */
  render(e, t, n, s) {
    throw new Error("BaseRenderer.render() not implemented");
  }
  /**
   * Draw a single pre-computed pixel to the renderer's canvas.
   * Called by BitmapEffect during fade animation — one call per visible particle.
   * @param {number} x - canvas x in CSS pixels (pre-multiplied by pixelSize)
   * @param {number} y - canvas y in CSS pixels (pre-multiplied by pixelSize)
   * @param {number} brightness - adjusted brightness [0,1]
   * @param {string} color - pre-computed CSS color string
   * @param {number} [alpha=1]
   */
  drawPixel(e, t, n, s, i = 1) {
  }
  // eslint-disable-line no-unused-vars
  /**
   * Called once before render() or the particle draw loop each frame.
   * Fills/clears the background. No-op hook — enables batching in future renderers.
   * @param {string} backgroundColor - CSS color or 'transparent'
   */
  beginFrame(e) {
  }
  // eslint-disable-line no-unused-vars
  /** Called after render() / particle draw loop. Reserved for future batching. */
  endFrame() {
  }
  /**
   * Whether a given pixel should be drawn, used for particle initialization.
   * Default: simple brightness threshold. Override for dithering-aware behavior.
   * @param {number} brightness - adjusted brightness [0,1]
   * @param {number} x - grid x
   * @param {number} y - grid y
   * @returns {boolean}
   */
  shouldDraw(e, t, n) {
    return e > (this.options.minBrightness ?? 0.05);
  }
  /**
   * Resize the renderer's output canvas.
   * @param {number} width
   * @param {number} height
   */
  setSize(e, t) {
  }
  // eslint-disable-line no-unused-vars
  /**
   * Merge new options into the renderer's current options.
   * Called whenever visual settings change.
   * @param {object} options
   */
  updateOptions(e) {
    Object.assign(this.options, e);
  }
  /**
   * Return a JSON Schema describing renderer-specific configurable parameters.
   * @deprecated Use `pluginRegistry.getRenderer(id).schema` instead.
   *   The schema is now the single source of truth, registered via builtinPlugins.js.
   *   This method is kept for backward compatibility with any subclass overrides.
   */
  getParameterSchema() {
    return {};
  }
  /**
   * The renderer's visible output canvas.
   * @type {HTMLCanvasElement | null}
   */
  get canvas() {
    return null;
  }
  /**
   * Fully dispose renderer resources. Removes the canvas from the DOM.
   * Safe to call multiple times (idempotent).
   */
  dispose() {
  }
}
const ts = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
].map((u) => u.map((e) => e / 16)), ss = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
].map((u) => u.map((e) => e / 64));
function ns(u, e, t) {
  const n = Float32Array.from(u), s = new Uint8Array(e * t);
  for (let i = 0; i < t; i++)
    for (let r = 0; r < e; r++) {
      const o = i * e + r, a = n[o], c = a > 0.5 ? 1 : 0;
      s[o] = c;
      const l = a - c;
      r + 1 < e && (n[o + 1] += l * (7 / 16)), i + 1 < t && (r > 0 && (n[o + e - 1] += l * (3 / 16)), n[o + e] += l * (5 / 16), r + 1 < e && (n[o + e + 1] += l * (1 / 16)));
    }
  return s;
}
function is(u, e, t) {
  const n = Float32Array.from(u), s = new Uint8Array(e * t);
  for (let i = 0; i < t; i++)
    for (let r = 0; r < e; r++) {
      const o = i * e + r, a = n[o], c = a > 0.5 ? 1 : 0;
      s[o] = c;
      const l = (a - c) / 8;
      r + 1 < e && (n[o + 1] += l), r + 2 < e && (n[o + 2] += l), i + 1 < t && (r > 0 && (n[o + e - 1] += l), n[o + e] += l, r + 1 < e && (n[o + e + 1] += l)), i + 2 < t && (n[o + e * 2] += l);
    }
  return s;
}
const re = {
  bayer4x4: {
    type: "threshold",
    getThreshold: (u, e) => ts[e % 4][u % 4]
  },
  bayer8x8: {
    type: "threshold",
    getThreshold: (u, e) => ss[e % 8][u % 8]
  },
  variableDot: {
    type: "variableDot"
  },
  floydSteinberg: {
    type: "errorDiffusion",
    processGrid: ns
  },
  atkinson: {
    type: "errorDiffusion",
    processGrid: is
  }
};
function rs(u, e) {
  if (e >= 1) return u;
  if (u.startsWith("#")) {
    const t = parseInt(u.slice(1, 3), 16), n = parseInt(u.slice(3, 5), 16), s = parseInt(u.slice(5, 7), 16);
    return `rgba(${t},${n},${s},${e})`;
  }
  return u.startsWith("rgb(") ? u.replace("rgb(", "rgba(").replace(")", `,${e})`) : u;
}
function je(u, e, t) {
  return (0.3 * u + 0.59 * e + 0.11 * t) / 255;
}
class ht extends Y {
  constructor(e = {}) {
    super({
      pixelSize: 3,
      ditherType: "bayer4x4",
      minBrightness: 0.05,
      invert: !1,
      backgroundColor: "transparent",
      ...e
    }), this._bitmapCanvas = document.createElement("canvas"), this._bitmapCanvas.style.display = "block", this._bitmapCtx = this._bitmapCanvas.getContext("2d"), this._lastFillStyle = null;
  }
  get canvas() {
    return this._bitmapCanvas;
  }
  init(e, t) {
    this.setSize(e, t);
  }
  setSize(e, t) {
    this._bitmapCanvas && (this._bitmapCanvas.width = Math.max(1, Math.floor(e)), this._bitmapCanvas.height = Math.max(1, Math.floor(t)));
  }
  beginFrame(e) {
    this._bitmapCtx && (this._lastFillStyle = null, e !== "transparent" ? (this._bitmapCtx.fillStyle = e, this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)) : this._bitmapCtx.clearRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height));
  }
  endFrame() {
  }
  getThreshold(e, t) {
    const n = re[this.options.ditherType];
    return n?.type === "threshold" ? n.getThreshold(e, t) : 0.5;
  }
  shouldDraw(e, t, n) {
    const s = re[this.options.ditherType];
    return !s || s.type === "variableDot" ? e > this.options.minBrightness : s.type === "errorDiffusion" ? e > 0.5 : e > this.getThreshold(t, n);
  }
  drawPixel(e, t, n, s, i = 1) {
    if (!this._bitmapCtx) return;
    const r = i < 1 ? rs(s, i) : s;
    r !== this._lastFillStyle && (this._bitmapCtx.fillStyle = r, this._lastFillStyle = r);
    const { pixelSize: o, ditherType: a } = this.options;
    if (a === "variableDot") {
      const c = o * 0.5, l = Math.max(o * 0.12, c * (1 - n));
      if (l <= 0.2) return;
      this._bitmapCtx.beginPath(), this._bitmapCtx.arc(e + o / 2, t + o / 2, l, 0, Math.PI * 2), this._bitmapCtx.fill();
      return;
    }
    this._bitmapCtx.fillRect(e, t, o, o);
  }
  render(e, t, n, s) {
    const i = re[this.options.ditherType] ?? re.bayer4x4;
    i.type === "errorDiffusion" ? this._renderErrorDiffusion(e, t, n, i, s) : this._renderThreshold(e, t, n, s);
  }
  _renderThreshold(e, t, n, s) {
    const { pixelSize: i, minBrightness: r, invert: o } = this.options;
    for (let a = 0; a < n; a++)
      for (let c = 0; c < t; c++) {
        const l = (a * t + c) * 4, h = e[l], f = e[l + 1], d = e[l + 2], g = e[l + 3], p = je(h, f, d);
        if (g === 0 || p < r) continue;
        const m = o ? 1 - p : p;
        if (!this.shouldDraw(m, c, a)) continue;
        const _ = s(m);
        this.drawPixel(c * i, a * i, m, _, 1);
      }
  }
  _renderErrorDiffusion(e, t, n, s, i) {
    const { pixelSize: r, minBrightness: o, invert: a } = this.options, c = t * n, l = new Float32Array(c), h = new Uint8Array(c);
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = (d * t + g) * 4, m = e[p], _ = e[p + 1], x = e[p + 2];
        if (e[p + 3] === 0) continue;
        const b = je(m, _, x);
        if (b < o) continue;
        const R = a ? 1 - b : b, y = d * t + g;
        l[y] = R, h[y] = 1;
      }
    const f = s.processGrid(l, t, n);
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = d * t + g;
        if (!f[p] || !h[p]) continue;
        const m = l[p], _ = i(m);
        this.drawPixel(g * r, d * r, m, _, 1);
      }
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class os {
  constructor() {
    this._effects = [];
  }
  /**
   * Register an effect instance.
   * @param {string} id - unique identifier
   * @param {object} effect - must implement apply(ctx, width, height, params)
   */
  addEffect(e, t) {
    this._effects.push({ id: e, effect: t, enabled: !0 });
  }
  /**
   * Enable or disable a registered effect by id.
   * @param {string} id
   * @param {boolean} enabled
   */
  setEnabled(e, t) {
    const n = this._effects.find((s) => s.id === e);
    n && (n.enabled = t);
  }
  /**
   * Returns true if at least one registered effect is enabled.
   * @returns {boolean}
   */
  hasEnabledEffects() {
    return this._effects.some((e) => e.enabled);
  }
  /**
   * Apply all enabled effects in registration order.
   * @param {CanvasRenderingContext2D|null} ctx
   * @param {number} width
   * @param {number} height
   * @param {object} params - post-processing params from the store
   */
  apply(e, t, n, s) {
    if (e)
      for (const { enabled: i, effect: r } of this._effects)
        i && r.apply(e, t, n, s);
  }
}
class as {
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   * @param {object} params
   * @param {number} [params.scanlineGap=4] - rows between scanlines (2–8)
   * @param {number} [params.scanlineOpacity=0.4] - darkness of scanline bands (0.1–0.8)
   * @param {number} [params.chromaticAberration=0] - R/B channel pixel shift (0–5)
   * @param {number} [params.crtVignette=0.3] - vignette corner strength (0–1)
   */
  apply(e, t, n, s) {
    if (!e || t <= 0 || n <= 0) return;
    const { scanlineGap: i = 4, scanlineOpacity: r = 0.4, chromaticAberration: o = 0, crtVignette: a = 0.3 } = s;
    if (i > 0 && r > 0) {
      e.fillStyle = `rgba(0,0,0,${r})`;
      for (let c = 0; c < n; c += i)
        e.fillRect(0, c, t, 1);
    }
    if (o > 0) {
      const c = e.getImageData(0, 0, t, n);
      this._applyCA(c.data, t, n, Math.round(o)), e.putImageData(c, 0, 0);
    }
    if (a > 0) {
      const c = t * 0.5, l = n * 0.5, h = Math.min(t, n) * 0.3, f = Math.max(t, n) * 0.75, d = e.createRadialGradient(c, l, h, c, l, f);
      d.addColorStop(0, "rgba(0,0,0,0)"), d.addColorStop(1, `rgba(0,0,0,${Math.min(a * 0.85, 0.85)})`), e.fillStyle = d, e.fillRect(0, 0, t, n);
    }
  }
  /**
   * Shift the red channel left by `shift` pixels and blue channel right by `shift` pixels.
   * Works on a copy of the original data to avoid reading already-modified pixels.
   * @param {Uint8ClampedArray} data - flat RGBA pixel array (modified in-place)
   * @param {number} width
   * @param {number} height
   * @param {number} shift - pixel shift amount
   */
  _applyCA(e, t, n, s) {
    const i = new Uint8ClampedArray(e);
    for (let r = 0; r < n; r++)
      for (let o = 0; o < t; o++) {
        const a = (r * t + o) * 4, c = o - s;
        c >= 0 && (e[a] = i[(r * t + c) * 4]);
        const l = o + s;
        l < t && (e[a + 2] = i[(r * t + l) * 4 + 2]);
      }
  }
}
class cs {
  /**
   * @param {object} [opts]
   * @param {number} [opts.noiseAmount=0.15] - strength 0–0.5
   * @param {boolean} [opts.noiseMonochrome=true] - same offset for all channels
   */
  constructor({ noiseAmount: e = 0.15, noiseMonochrome: t = !0 } = {}) {
    this.noiseAmount = e, this.noiseMonochrome = t;
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   * @param {object} params
   * @param {number} [params.noiseAmount]
   * @param {boolean} [params.noiseMonochrome]
   */
  apply(e, t, n, s) {
    const i = s.noiseAmount ?? this.noiseAmount;
    if (i === 0 || !e || t <= 0 || n <= 0) return;
    const r = s.noiseMonochrome ?? this.noiseMonochrome, o = e.getImageData(0, 0, t, n), a = o.data, c = i * 255 * 2;
    for (let l = 0; l < a.length; l += 4)
      if (a[l + 3] !== 0)
        if (r) {
          const h = (Math.random() - 0.5) * c;
          a[l] = Math.max(0, Math.min(255, a[l] + h)), a[l + 1] = Math.max(0, Math.min(255, a[l + 1] + h)), a[l + 2] = Math.max(0, Math.min(255, a[l + 2] + h));
        } else
          a[l] = Math.max(0, Math.min(255, a[l] + (Math.random() - 0.5) * c)), a[l + 1] = Math.max(0, Math.min(255, a[l + 1] + (Math.random() - 0.5) * c)), a[l + 2] = Math.max(0, Math.min(255, a[l + 2] + (Math.random() - 0.5) * c));
    e.putImageData(o, 0, 0);
  }
}
class ls {
  /**
   * @param {object} [opts]
   * @param {number} [opts.colorShiftHue=0] - hue rotation in degrees (0–360)
   * @param {number} [opts.colorShiftSaturation=1.0] - saturation multiplier (0–2)
   */
  constructor({ colorShiftHue: e = 0, colorShiftSaturation: t = 1 } = {}) {
    this.colorShiftHue = e, this.colorShiftSaturation = t;
  }
  /**
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   * @param {object} params
   * @param {number} [params.colorShiftHue]
   * @param {number} [params.colorShiftSaturation]
   */
  apply(e, t, n, s) {
    const i = s.colorShiftHue ?? this.colorShiftHue, r = s.colorShiftSaturation ?? this.colorShiftSaturation;
    if (i === 0 && r === 1 || !e || t <= 0 || n <= 0) return;
    typeof e.filter < "u" ? this._applyWithFilter(e, t, n, i, r) : this._applyManual(e, t, n, i, r);
  }
  /**
   * Fast path — use CSS canvas filters.
   */
  _applyWithFilter(e, t, n, s, i) {
    const r = document.createElement("canvas");
    r.width = t, r.height = n, r.getContext("2d").drawImage(e.canvas, 0, 0), e.clearRect(0, 0, t, n), e.filter = `hue-rotate(${s}deg) saturate(${i})`, e.drawImage(r, 0, 0), e.filter = "none";
  }
  /**
   * Fallback — manual per-pixel RGB -> HSL -> RGB.
   */
  _applyManual(e, t, n, s, i) {
    const r = e.getImageData(0, 0, t, n), o = r.data, a = s / 360;
    for (let c = 0; c < o.length; c += 4) {
      if (o[c + 3] === 0) continue;
      const l = o[c] / 255, h = o[c + 1] / 255, f = o[c + 2] / 255;
      let [d, g, p] = hs(l, h, f);
      d = (d + a) % 1, d < 0 && (d += 1), g = Math.max(0, Math.min(1, g * i));
      const [m, _, x] = us(d, g, p);
      o[c] = Math.round(m * 255), o[c + 1] = Math.round(_ * 255), o[c + 2] = Math.round(x * 255);
    }
    e.putImageData(r, 0, 0);
  }
}
function hs(u, e, t) {
  const n = Math.max(u, e, t), s = Math.min(u, e, t), i = (n + s) / 2;
  if (n === s) return [0, 0, i];
  const r = n - s, o = i > 0.5 ? r / (2 - n - s) : r / (n + s);
  let a;
  return n === u ? a = ((e - t) / r + (e < t ? 6 : 0)) / 6 : n === e ? a = ((t - u) / r + 2) / 6 : a = ((u - e) / r + 4) / 6, [a, o, i];
}
function us(u, e, t) {
  if (e === 0) return [t, t, t];
  const n = t < 0.5 ? t * (1 + e) : t + e - t * e, s = 2 * t - n;
  return [_e(s, n, u + 1 / 3), _e(s, n, u), _e(s, n, u - 1 / 3)];
}
function _e(u, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? u + (e - u) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? u + (e - u) * (2 / 3 - t) * 6 : u;
}
class fs extends qt {
  constructor(e, t = {}) {
    super(e, {
      pixelSize: 3,
      ditherType: "bayer4x4",
      colors: [
        "#021a15",
        "#053a2a",
        "#074434",
        "#0a5845",
        "#1a7a5e",
        "#4d9977",
        "#ABC685",
        "#E8FF99",
        "#F7F9CE",
        "#FFF6E7"
      ],
      backgroundColor: "transparent",
      invert: !1,
      minBrightness: 0.05,
      animationDuration: 2500,
      ...t
    }), this.sampleCanvas = document.createElement("canvas"), this.sampleCtx = this.sampleCanvas.getContext("2d", { willReadFrequently: !0 }), this.gridWidth = 1, this.gridHeight = 1, this._activeRenderer = new ht(this.options), this._pendingRenderer = null, this.domElement.appendChild(this._activeRenderer.canvas), this._postChain = new os(), this._postChain.addEffect("crt", new as()), this._postChain.addEffect("noise", new cs()), this._postChain.addEffect("colorShift", new ls());
    const n = this.options.fadeVariant ?? "bloom";
    this.fadeVariant = ke(n), this._currentFadeVariantKey = n;
  }
  /** The visible output canvas from the active renderer. */
  get bitmapCanvas() {
    return this._activeRenderer?.canvas ?? null;
  }
  /**
   * Swap the active renderer. If a fade animation is in progress, the swap is
   * queued and applied at the next frame boundary after the fade completes.
   * @param {import('../renderers/BaseRenderer.js').BaseRenderer} newRenderer
   */
  setRenderer(e) {
    if (this.isAnimating) {
      this._pendingRenderer = e;
      return;
    }
    this._swapRenderer(e);
  }
  _swapRenderer(e) {
    const t = this._activeRenderer?.canvas;
    t?.parentNode && t.parentNode.removeChild(t), this._activeRenderer?.dispose(), this._activeRenderer = e, this._activeRenderer.updateOptions(this.options), this._activeRenderer.init(this.width, this.height), this.domElement.appendChild(this._activeRenderer.canvas), this._pendingRenderer = null, this.resetParticles();
  }
  setSize(e, t) {
    super.setSize(e, t), this.gridWidth = Math.max(1, Math.floor(this.width / this.options.pixelSize)), this.gridHeight = Math.max(1, Math.floor(this.height / this.options.pixelSize)), this.sampleCanvas.width = this.gridWidth, this.sampleCanvas.height = this.gridHeight, this._activeRenderer?.setSize(this.width, this.height);
  }
  onStructuralOptionChange() {
    this.setSize(this.width, this.height);
  }
  updateOptions(e = {}) {
    super.updateOptions(e), this._activeRenderer?.updateOptions(e);
  }
  render(e, t) {
    this.renderer.render(e, t), this.tickAnimation(), this.renderBitmap();
  }
  renderBitmap() {
    if (!this.sampleCtx || !this._activeRenderer) return;
    this._pendingRenderer && !this.isAnimating && this._swapRenderer(this._pendingRenderer);
    const e = this.options.fadeVariant ?? "bloom";
    e !== this._currentFadeVariantKey && (this._currentFadeVariantKey = e, this.fadeVariant = ke(e), this.startAnimation("fadeIn")), this.sampleCtx.clearRect(0, 0, this.gridWidth, this.gridHeight), this.sampleCtx.drawImage(this.renderer.domElement, 0, 0, this.gridWidth, this.gridHeight);
    const t = this.sampleCtx.getImageData(0, 0, this.gridWidth, this.gridHeight).data;
    if (this._activeRenderer.beginFrame(this.options.backgroundColor), this.isAnimating) {
      this.particlesInitialized || (this.initializeParticles(
        this.gridWidth,
        this.gridHeight,
        this.options.pixelSize,
        t,
        (s, i, r) => this._activeRenderer.shouldDraw(s, i, r)
      ), this.fadeVariant.initVariantMetadata(
        this.particles,
        this.width,
        this.height,
        this.options.pixelSize,
        this.gridWidth,
        this.gridHeight
      ));
      const n = this.fadeVariant.getVisiblePixels(
        this.particles,
        this.animationProgress,
        this.animationPhase,
        (s) => this.easeInOutCubic(s)
      );
      for (const s of n)
        this._activeRenderer.drawPixel(s.x, s.y, s.brightness, s.color, s.alpha);
    }
    if ((!this.isAnimating || this.particles.length === 0) && this._activeRenderer.render(t, this.gridWidth, this.gridHeight, (n) => this.getColorForBrightness(n)), this._activeRenderer.endFrame(), this._postChain.setEnabled("crt", !!this.options.crtEnabled), this._postChain.setEnabled("noise", !!this.options.noiseEnabled), this._postChain.setEnabled("colorShift", !!this.options.colorShiftEnabled), this._postChain.hasEnabledEffects()) {
      const n = this._activeRenderer.canvas?.getContext("2d");
      n && this._postChain.apply(n, this.width, this.height, this.options);
    }
  }
  dispose() {
    this._postChain = null, this._activeRenderer?.dispose(), this._activeRenderer = null, this._pendingRenderer = null, this.sampleCanvas = null, this.sampleCtx = null, super.dispose();
  }
}
class ds extends pe {
  /**
   * Constructs a new STL loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(e) {
    super(e);
  }
  /**
   * Starts loading from the given URL and passes the loaded STL asset
   * to the `onLoad()` callback.
   *
   * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
   * @param {function(BufferGeometry)} onLoad - Executed when the loading process has been finished.
   * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
   * @param {onErrorCallback} onError - Executed when errors occur.
   */
  load(e, t, n, s) {
    const i = this, r = new ne(this.manager);
    r.setPath(this.path), r.setResponseType("arraybuffer"), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, function(o) {
      try {
        t(i.parse(o));
      } catch (a) {
        s ? s(a) : console.error(a), i.manager.itemError(e);
      }
    }, n, s);
  }
  /**
   * Parses the given STL data and returns the resulting geometry.
   *
   * @param {ArrayBuffer} data - The raw STL data as an array buffer.
   * @return {BufferGeometry} The parsed geometry.
   */
  parse(e) {
    function t(c) {
      const l = new DataView(c), h = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8, f = l.getUint32(80, !0);
      if (80 + 32 / 8 + f * h === l.byteLength)
        return !0;
      const g = [115, 111, 108, 105, 100];
      for (let p = 0; p < 5; p++)
        if (n(g, l, p)) return !1;
      return !0;
    }
    function n(c, l, h) {
      for (let f = 0, d = c.length; f < d; f++)
        if (c[f] !== l.getUint8(h + f)) return !1;
      return !0;
    }
    function s(c) {
      const l = new DataView(c), h = l.getUint32(80, !0);
      let f, d, g, p = !1, m, _, x, T, b;
      for (let E = 0; E < 70; E++)
        l.getUint32(E, !1) == 1129270351 && l.getUint8(E + 4) == 82 && l.getUint8(E + 5) == 61 && (p = !0, m = new Float32Array(h * 3 * 3), _ = l.getUint8(E + 6) / 255, x = l.getUint8(E + 7) / 255, T = l.getUint8(E + 8) / 255, b = l.getUint8(E + 9) / 255);
      const R = 84, y = 50, w = new te(), v = new Float32Array(h * 3 * 3), C = new Float32Array(h * 3 * 3), A = new U();
      for (let E = 0; E < h; E++) {
        const L = R + E * y, I = l.getFloat32(L, !0), K = l.getFloat32(L + 4, !0), ie = l.getFloat32(L + 8, !0);
        if (p) {
          const F = l.getUint16(L + 48, !0);
          (F & 32768) === 0 ? (f = (F & 31) / 31, d = (F >> 5 & 31) / 31, g = (F >> 10 & 31) / 31) : (f = _, d = x, g = T);
        }
        for (let F = 1; F <= 3; F++) {
          const ge = L + F * 12, j = E * 3 * 3 + (F - 1) * 3;
          v[j] = l.getFloat32(ge, !0), v[j + 1] = l.getFloat32(ge + 4, !0), v[j + 2] = l.getFloat32(ge + 8, !0), C[j] = I, C[j + 1] = K, C[j + 2] = ie, p && (A.setRGB(f, d, g, V), m[j] = A.r, m[j + 1] = A.g, m[j + 2] = A.b);
        }
      }
      return w.setAttribute("position", new X(v, 3)), w.setAttribute("normal", new X(C, 3)), p && (w.setAttribute("color", new X(m, 3)), w.hasColors = !0, w.alpha = b), w;
    }
    function i(c) {
      const l = new te(), h = /solid([\s\S]*?)endsolid/g, f = /facet([\s\S]*?)endfacet/g, d = /solid\s(.+)/;
      let g = 0;
      const p = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source, m = new RegExp("vertex" + p + p + p, "g"), _ = new RegExp("normal" + p + p + p, "g"), x = [], T = [], b = [], R = new N();
      let y, w = 0, v = 0, C = 0;
      for (; (y = h.exec(c)) !== null; ) {
        v = C;
        const A = y[0], E = (y = d.exec(A)) !== null ? y[1] : "";
        for (b.push(E); (y = f.exec(A)) !== null; ) {
          let K = 0, ie = 0;
          const F = y[0];
          for (; (y = _.exec(F)) !== null; )
            R.x = parseFloat(y[1]), R.y = parseFloat(y[2]), R.z = parseFloat(y[3]), ie++;
          for (; (y = m.exec(F)) !== null; )
            x.push(parseFloat(y[1]), parseFloat(y[2]), parseFloat(y[3])), T.push(R.x, R.y, R.z), K++, C++;
          ie !== 1 && console.error("THREE.STLLoader: Something isn't right with the normal of face number " + g), K !== 3 && console.error("THREE.STLLoader: Something isn't right with the vertices of face number " + g), g++;
        }
        const L = v, I = C - v;
        l.userData.groupNames = b, l.addGroup(L, I, w), w++;
      }
      return l.setAttribute("position", new H(x, 3)), l.setAttribute("normal", new H(T, 3)), l;
    }
    function r(c) {
      return typeof c != "string" ? new TextDecoder().decode(c) : c;
    }
    function o(c) {
      if (typeof c == "string") {
        const l = new Uint8Array(c.length);
        for (let h = 0; h < c.length; h++)
          l[h] = c.charCodeAt(h) & 255;
        return l.buffer || l;
      } else
        return c;
    }
    const a = o(e);
    return t(a) ? s(a) : i(r(e));
  }
}
function Ue(u, e) {
  if (e === gt)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), u;
  if (e === Me || e === st) {
    let t = u.getIndex();
    if (t === null) {
      const r = [], o = u.getAttribute("position");
      if (o !== void 0) {
        for (let a = 0; a < o.count; a++)
          r.push(a);
        u.setIndex(r), t = u.getIndex();
      } else
        return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), u;
    }
    const n = t.count - 2, s = [];
    if (e === Me)
      for (let r = 1; r <= n; r++)
        s.push(t.getX(0)), s.push(t.getX(r)), s.push(t.getX(r + 1));
    else
      for (let r = 0; r < n; r++)
        r % 2 === 0 ? (s.push(t.getX(r)), s.push(t.getX(r + 1)), s.push(t.getX(r + 2))) : (s.push(t.getX(r + 2)), s.push(t.getX(r + 1)), s.push(t.getX(r)));
    s.length / 3 !== n && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    const i = u.clone();
    return i.setIndex(s), i.clearGroups(), i;
  } else
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", e), u;
}
class ps extends pe {
  /**
   * Constructs a new glTF loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new xs(t);
    }), this.register(function(t) {
      return new ys(t);
    }), this.register(function(t) {
      return new As(t);
    }), this.register(function(t) {
      return new Ls(t);
    }), this.register(function(t) {
      return new Is(t);
    }), this.register(function(t) {
      return new ws(t);
    }), this.register(function(t) {
      return new Rs(t);
    }), this.register(function(t) {
      return new Ss(t);
    }), this.register(function(t) {
      return new Ms(t);
    }), this.register(function(t) {
      return new bs(t);
    }), this.register(function(t) {
      return new Cs(t);
    }), this.register(function(t) {
      return new Ts(t);
    }), this.register(function(t) {
      return new vs(t);
    }), this.register(function(t) {
      return new Es(t);
    }), this.register(function(t) {
      return new gs(t);
    }), this.register(function(t) {
      return new Fs(t);
    }), this.register(function(t) {
      return new Os(t);
    });
  }
  /**
   * Starts loading from the given URL and passes the loaded glTF asset
   * to the `onLoad()` callback.
   *
   * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
   * @param {function(GLTFLoader~LoadObject)} onLoad - Executed when the loading process has been finished.
   * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
   * @param {onErrorCallback} onError - Executed when errors occur.
   */
  load(e, t, n, s) {
    const i = this;
    let r;
    if (this.resourcePath !== "")
      r = this.resourcePath;
    else if (this.path !== "") {
      const c = Q.extractUrlBase(e);
      r = Q.resolveURL(c, this.path);
    } else
      r = Q.extractUrlBase(e);
    this.manager.itemStart(e);
    const o = function(c) {
      s ? s(c) : console.error(c), i.manager.itemError(e), i.manager.itemEnd(e);
    }, a = new ne(this.manager);
    a.setPath(this.path), a.setResponseType("arraybuffer"), a.setRequestHeader(this.requestHeader), a.setWithCredentials(this.withCredentials), a.load(e, function(c) {
      try {
        i.parse(c, r, function(l) {
          t(l), i.manager.itemEnd(e);
        }, o);
      } catch (l) {
        o(l);
      }
    }, n, o);
  }
  /**
   * Sets the given Draco loader to this loader. Required for decoding assets
   * compressed with the `KHR_draco_mesh_compression` extension.
   *
   * @param {DRACOLoader} dracoLoader - The Draco loader to set.
   * @return {GLTFLoader} A reference to this loader.
   */
  setDRACOLoader(e) {
    return this.dracoLoader = e, this;
  }
  /**
   * Sets the given KTX2 loader to this loader. Required for loading KTX2
   * compressed textures.
   *
   * @param {KTX2Loader} ktx2Loader - The KTX2 loader to set.
   * @return {GLTFLoader} A reference to this loader.
   */
  setKTX2Loader(e) {
    return this.ktx2Loader = e, this;
  }
  /**
   * Sets the given meshopt decoder. Required for decoding assets
   * compressed with the `EXT_meshopt_compression` extension.
   *
   * @param {Object} meshoptDecoder - The meshopt decoder to set.
   * @return {GLTFLoader} A reference to this loader.
   */
  setMeshoptDecoder(e) {
    return this.meshoptDecoder = e, this;
  }
  /**
   * Registers a plugin callback. This API is internally used to implement the various
   * glTF extensions but can also used by third-party code to add additional logic
   * to the loader.
   *
   * @param {function(parser:GLTFParser)} callback - The callback function to register.
   * @return {GLTFLoader} A reference to this loader.
   */
  register(e) {
    return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this;
  }
  /**
   * Unregisters a plugin callback.
   *
   * @param {Function} callback - The callback function to unregister.
   * @return {GLTFLoader} A reference to this loader.
   */
  unregister(e) {
    return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this;
  }
  /**
   * Parses the given FBX data and returns the resulting group.
   *
   * @param {string|ArrayBuffer} data - The raw glTF data.
   * @param {string} path - The URL base path.
   * @param {function(GLTFLoader~LoadObject)} onLoad - Executed when the loading process has been finished.
   * @param {onErrorCallback} onError - Executed when errors occur.
   */
  parse(e, t, n, s) {
    let i;
    const r = {}, o = {}, a = new TextDecoder();
    if (typeof e == "string")
      i = JSON.parse(e);
    else if (e instanceof ArrayBuffer)
      if (a.decode(new Uint8Array(e, 0, 4)) === ut) {
        try {
          r[M.KHR_BINARY_GLTF] = new Ps(e);
        } catch (h) {
          s && s(h);
          return;
        }
        i = JSON.parse(r[M.KHR_BINARY_GLTF].content);
      } else
        i = JSON.parse(a.decode(e));
    else
      i = e;
    if (i.asset === void 0 || i.asset.version[0] < 2) {
      s && s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const c = new Ws(i, {
      path: t || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    c.fileLoader.setRequestHeader(this.requestHeader);
    for (let l = 0; l < this.pluginCallbacks.length; l++) {
      const h = this.pluginCallbacks[l](c);
      h.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), o[h.name] = h, r[h.name] = !0;
    }
    if (i.extensionsUsed)
      for (let l = 0; l < i.extensionsUsed.length; ++l) {
        const h = i.extensionsUsed[l], f = i.extensionsRequired || [];
        switch (h) {
          case M.KHR_MATERIALS_UNLIT:
            r[h] = new _s();
            break;
          case M.KHR_DRACO_MESH_COMPRESSION:
            r[h] = new Ns(i, this.dracoLoader);
            break;
          case M.KHR_TEXTURE_TRANSFORM:
            r[h] = new Ds();
            break;
          case M.KHR_MESH_QUANTIZATION:
            r[h] = new ks();
            break;
          default:
            f.indexOf(h) >= 0 && o[h] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + h + '".');
        }
      }
    c.setExtensions(r), c.setPlugins(o), c.parse(n, s);
  }
  /**
   * Async version of {@link GLTFLoader#parse}.
   *
   * @async
   * @param {string|ArrayBuffer} data - The raw glTF data.
   * @param {string} path - The URL base path.
   * @return {Promise<GLTFLoader~LoadObject>} A Promise that resolves with the loaded glTF when the parsing has been finished.
   */
  parseAsync(e, t) {
    const n = this;
    return new Promise(function(s, i) {
      n.parse(e, t, s, i);
    });
  }
}
function ms() {
  let u = {};
  return {
    get: function(e) {
      return u[e];
    },
    add: function(e, t) {
      u[e] = t;
    },
    remove: function(e) {
      delete u[e];
    },
    removeAll: function() {
      u = {};
    }
  };
}
const M = {
  KHR_BINARY_GLTF: "KHR_binary_glTF",
  KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
  KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
  KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
  KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
  KHR_MATERIALS_IOR: "KHR_materials_ior",
  KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
  KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
  KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
  KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
  KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
  KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
  KHR_MATERIALS_VOLUME: "KHR_materials_volume",
  KHR_TEXTURE_BASISU: "KHR_texture_basisu",
  KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
  KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
  KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
  EXT_MATERIALS_BUMP: "EXT_materials_bump",
  EXT_TEXTURE_WEBP: "EXT_texture_webp",
  EXT_TEXTURE_AVIF: "EXT_texture_avif",
  EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
  EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
class gs {
  constructor(e) {
    this.parser = e, this.name = M.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
  }
  _markDefs() {
    const e = this.parser, t = this.parser.json.nodes || [];
    for (let n = 0, s = t.length; n < s; n++) {
      const i = t[n];
      i.extensions && i.extensions[this.name] && i.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, i.extensions[this.name].light);
    }
  }
  _loadLight(e) {
    const t = this.parser, n = "light:" + e;
    let s = t.cache.get(n);
    if (s) return s;
    const i = t.json, a = ((i.extensions && i.extensions[this.name] || {}).lights || [])[e];
    let c;
    const l = new U(16777215);
    a.color !== void 0 && l.setRGB(a.color[0], a.color[1], a.color[2], B);
    const h = a.range !== void 0 ? a.range : 0;
    switch (a.type) {
      case "directional":
        c = new xt(l), c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      case "point":
        c = new bt(l), c.distance = h;
        break;
      case "spot":
        c = new _t(l), c.distance = h, a.spot = a.spot || {}, a.spot.innerConeAngle = a.spot.innerConeAngle !== void 0 ? a.spot.innerConeAngle : 0, a.spot.outerConeAngle = a.spot.outerConeAngle !== void 0 ? a.spot.outerConeAngle : Math.PI / 4, c.angle = a.spot.outerConeAngle, c.penumbra = 1 - a.spot.innerConeAngle / a.spot.outerConeAngle, c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + a.type);
    }
    return c.position.set(0, 0, 0), D(c, a), a.intensity !== void 0 && (c.intensity = a.intensity), c.name = t.createUniqueName(a.name || "light_" + e), s = Promise.resolve(c), t.cache.add(n, s), s;
  }
  getDependency(e, t) {
    if (e === "light")
      return this._loadLight(t);
  }
  createNodeAttachment(e) {
    const t = this, n = this.parser, i = n.json.nodes[e], o = (i.extensions && i.extensions[this.name] || {}).light;
    return o === void 0 ? null : this._loadLight(o).then(function(a) {
      return n._getNodeRef(t.cache, o, a);
    });
  }
}
class _s {
  constructor() {
    this.name = M.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return J;
  }
  extendParams(e, t, n) {
    const s = [];
    e.color = new U(1, 1, 1), e.opacity = 1;
    const i = t.pbrMetallicRoughness;
    if (i) {
      if (Array.isArray(i.baseColorFactor)) {
        const r = i.baseColorFactor;
        e.color.setRGB(r[0], r[1], r[2], B), e.opacity = r[3];
      }
      i.baseColorTexture !== void 0 && s.push(n.assignTexture(e, "map", i.baseColorTexture, V));
    }
    return Promise.all(s);
  }
}
class bs {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, t) {
    const s = this.parser.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = s.extensions[this.name].emissiveStrength;
    return i !== void 0 && (t.emissiveIntensity = i), Promise.resolve();
  }
}
class xs {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = [], r = s.extensions[this.name];
    if (r.clearcoatFactor !== void 0 && (t.clearcoat = r.clearcoatFactor), r.clearcoatTexture !== void 0 && i.push(n.assignTexture(t, "clearcoatMap", r.clearcoatTexture)), r.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = r.clearcoatRoughnessFactor), r.clearcoatRoughnessTexture !== void 0 && i.push(n.assignTexture(t, "clearcoatRoughnessMap", r.clearcoatRoughnessTexture)), r.clearcoatNormalTexture !== void 0 && (i.push(n.assignTexture(t, "clearcoatNormalMap", r.clearcoatNormalTexture)), r.clearcoatNormalTexture.scale !== void 0)) {
      const o = r.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new nt(o, o);
    }
    return Promise.all(i);
  }
}
class ys {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const s = this.parser.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = s.extensions[this.name];
    return t.dispersion = i.dispersion !== void 0 ? i.dispersion : 0, Promise.resolve();
  }
}
class Ts {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = [], r = s.extensions[this.name];
    return r.iridescenceFactor !== void 0 && (t.iridescence = r.iridescenceFactor), r.iridescenceTexture !== void 0 && i.push(n.assignTexture(t, "iridescenceMap", r.iridescenceTexture)), r.iridescenceIor !== void 0 && (t.iridescenceIOR = r.iridescenceIor), t.iridescenceThicknessRange === void 0 && (t.iridescenceThicknessRange = [100, 400]), r.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessRange[0] = r.iridescenceThicknessMinimum), r.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessRange[1] = r.iridescenceThicknessMaximum), r.iridescenceThicknessTexture !== void 0 && i.push(n.assignTexture(t, "iridescenceThicknessMap", r.iridescenceThicknessTexture)), Promise.all(i);
  }
}
class ws {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = [];
    t.sheenColor = new U(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1;
    const r = s.extensions[this.name];
    if (r.sheenColorFactor !== void 0) {
      const o = r.sheenColorFactor;
      t.sheenColor.setRGB(o[0], o[1], o[2], B);
    }
    return r.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = r.sheenRoughnessFactor), r.sheenColorTexture !== void 0 && i.push(n.assignTexture(t, "sheenColorMap", r.sheenColorTexture, V)), r.sheenRoughnessTexture !== void 0 && i.push(n.assignTexture(t, "sheenRoughnessMap", r.sheenRoughnessTexture)), Promise.all(i);
  }
}
class Rs {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = [], r = s.extensions[this.name];
    return r.transmissionFactor !== void 0 && (t.transmission = r.transmissionFactor), r.transmissionTexture !== void 0 && i.push(n.assignTexture(t, "transmissionMap", r.transmissionTexture)), Promise.all(i);
  }
}
class Ss {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = [], r = s.extensions[this.name];
    t.thickness = r.thicknessFactor !== void 0 ? r.thicknessFactor : 0, r.thicknessTexture !== void 0 && i.push(n.assignTexture(t, "thicknessMap", r.thicknessTexture)), t.attenuationDistance = r.attenuationDistance || 1 / 0;
    const o = r.attenuationColor || [1, 1, 1];
    return t.attenuationColor = new U().setRGB(o[0], o[1], o[2], B), Promise.all(i);
  }
}
class Ms {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const s = this.parser.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = s.extensions[this.name];
    return t.ior = i.ior !== void 0 ? i.ior : 1.5, Promise.resolve();
  }
}
class Cs {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = [], r = s.extensions[this.name];
    t.specularIntensity = r.specularFactor !== void 0 ? r.specularFactor : 1, r.specularTexture !== void 0 && i.push(n.assignTexture(t, "specularIntensityMap", r.specularTexture));
    const o = r.specularColorFactor || [1, 1, 1];
    return t.specularColor = new U().setRGB(o[0], o[1], o[2], B), r.specularColorTexture !== void 0 && i.push(n.assignTexture(t, "specularColorMap", r.specularColorTexture, V)), Promise.all(i);
  }
}
class Es {
  constructor(e) {
    this.parser = e, this.name = M.EXT_MATERIALS_BUMP;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = [], r = s.extensions[this.name];
    return t.bumpScale = r.bumpFactor !== void 0 ? r.bumpFactor : 1, r.bumpTexture !== void 0 && i.push(n.assignTexture(t, "bumpMap", r.bumpTexture)), Promise.all(i);
  }
}
class vs {
  constructor(e) {
    this.parser = e, this.name = M.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = [], r = s.extensions[this.name];
    return r.anisotropyStrength !== void 0 && (t.anisotropy = r.anisotropyStrength), r.anisotropyRotation !== void 0 && (t.anisotropyRotation = r.anisotropyRotation), r.anisotropyTexture !== void 0 && i.push(n.assignTexture(t, "anisotropyMap", r.anisotropyTexture)), Promise.all(i);
  }
}
class As {
  constructor(e) {
    this.parser = e, this.name = M.KHR_TEXTURE_BASISU;
  }
  loadTexture(e) {
    const t = this.parser, n = t.json, s = n.textures[e];
    if (!s.extensions || !s.extensions[this.name])
      return null;
    const i = s.extensions[this.name], r = t.options.ktx2Loader;
    if (!r) {
      if (n.extensionsRequired && n.extensionsRequired.indexOf(this.name) >= 0)
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return t.loadTextureImage(e, i.source, r);
  }
}
class Ls {
  constructor(e) {
    this.parser = e, this.name = M.EXT_TEXTURE_WEBP;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, s = n.json, i = s.textures[e];
    if (!i.extensions || !i.extensions[t])
      return null;
    const r = i.extensions[t], o = s.images[r.source];
    let a = n.textureLoader;
    if (o.uri) {
      const c = n.options.manager.getHandler(o.uri);
      c !== null && (a = c);
    }
    return n.loadTextureImage(e, r.source, a);
  }
}
class Is {
  constructor(e) {
    this.parser = e, this.name = M.EXT_TEXTURE_AVIF;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, s = n.json, i = s.textures[e];
    if (!i.extensions || !i.extensions[t])
      return null;
    const r = i.extensions[t], o = s.images[r.source];
    let a = n.textureLoader;
    if (o.uri) {
      const c = n.options.manager.getHandler(o.uri);
      c !== null && (a = c);
    }
    return n.loadTextureImage(e, r.source, a);
  }
}
class Fs {
  constructor(e) {
    this.name = M.EXT_MESHOPT_COMPRESSION, this.parser = e;
  }
  loadBufferView(e) {
    const t = this.parser.json, n = t.bufferViews[e];
    if (n.extensions && n.extensions[this.name]) {
      const s = n.extensions[this.name], i = this.parser.getDependency("buffer", s.buffer), r = this.parser.options.meshoptDecoder;
      if (!r || !r.supported) {
        if (t.extensionsRequired && t.extensionsRequired.indexOf(this.name) >= 0)
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return i.then(function(o) {
        const a = s.byteOffset || 0, c = s.byteLength || 0, l = s.count, h = s.byteStride, f = new Uint8Array(o, a, c);
        return r.decodeGltfBufferAsync ? r.decodeGltfBufferAsync(l, h, f, s.mode, s.filter).then(function(d) {
          return d.buffer;
        }) : r.ready.then(function() {
          const d = new ArrayBuffer(l * h);
          return r.decodeGltfBuffer(new Uint8Array(d), l, h, f, s.mode, s.filter), d;
        });
      });
    } else
      return null;
  }
}
class Os {
  constructor(e) {
    this.name = M.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const t = this.parser.json, n = t.nodes[e];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0)
      return null;
    const s = t.meshes[n.mesh];
    for (const c of s.primitives)
      if (c.mode !== P.TRIANGLES && c.mode !== P.TRIANGLE_STRIP && c.mode !== P.TRIANGLE_FAN && c.mode !== void 0)
        return null;
    const r = n.extensions[this.name].attributes, o = [], a = {};
    for (const c in r)
      o.push(this.parser.getDependency("accessor", r[c]).then((l) => (a[c] = l, a[c])));
    return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then((c) => {
      const l = c.pop(), h = l.isGroup ? l.children : [l], f = c[0].count, d = [];
      for (const g of h) {
        const p = new de(), m = new N(), _ = new it(), x = new N(1, 1, 1), T = new yt(g.geometry, g.material, f);
        for (let b = 0; b < f; b++)
          a.TRANSLATION && m.fromBufferAttribute(a.TRANSLATION, b), a.ROTATION && _.fromBufferAttribute(a.ROTATION, b), a.SCALE && x.fromBufferAttribute(a.SCALE, b), T.setMatrixAt(b, p.compose(m, _, x));
        for (const b in a)
          if (b === "_COLOR_0") {
            const R = a[b];
            T.instanceColor = new Tt(R.array, R.itemSize, R.normalized);
          } else b !== "TRANSLATION" && b !== "ROTATION" && b !== "SCALE" && g.geometry.setAttribute(b, a[b]);
        rt.prototype.copy.call(T, g), this.parser.assignFinalMaterial(T), d.push(T);
      }
      return l.isGroup ? (l.clear(), l.add(...d), l) : d[0];
    }));
  }
}
const ut = "glTF", q = 12, Be = { JSON: 1313821514, BIN: 5130562 };
class Ps {
  constructor(e) {
    this.name = M.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, q), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(e.slice(0, 4))),
      version: t.getUint32(4, !0),
      length: t.getUint32(8, !0)
    }, this.header.magic !== ut)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const s = this.header.length - q, i = new DataView(e, q);
    let r = 0;
    for (; r < s; ) {
      const o = i.getUint32(r, !0);
      r += 4;
      const a = i.getUint32(r, !0);
      if (r += 4, a === Be.JSON) {
        const c = new Uint8Array(e, q + r, o);
        this.content = n.decode(c);
      } else if (a === Be.BIN) {
        const c = q + r;
        this.body = e.slice(c, c + o);
      }
      r += o;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class Ns {
  constructor(e, t) {
    if (!t)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = M.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload();
  }
  decodePrimitive(e, t) {
    const n = this.json, s = this.dracoLoader, i = e.extensions[this.name].bufferView, r = e.extensions[this.name].attributes, o = {}, a = {}, c = {};
    for (const l in r) {
      const h = Le[l] || l.toLowerCase();
      o[h] = r[l];
    }
    for (const l in e.attributes) {
      const h = Le[l] || l.toLowerCase();
      if (r[l] !== void 0) {
        const f = n.accessors[e.attributes[l]], d = W[f.componentType];
        c[h] = d.name, a[h] = f.normalized === !0;
      }
    }
    return t.getDependency("bufferView", i).then(function(l) {
      return new Promise(function(h, f) {
        s.decodeDracoFile(l, function(d) {
          for (const g in d.attributes) {
            const p = d.attributes[g], m = a[g];
            m !== void 0 && (p.normalized = m);
          }
          h(d);
        }, o, c, B, f);
      });
    });
  }
}
class Ds {
  constructor() {
    this.name = M.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, t) {
    return (t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e;
  }
}
class ks {
  constructor() {
    this.name = M.KHR_MESH_QUANTIZATION;
  }
}
class ft extends Vt {
  constructor(e, t, n, s) {
    super(e, t, n, s);
  }
  copySampleValue_(e) {
    const t = this.resultBuffer, n = this.sampleValues, s = this.valueSize, i = e * s * 3 + s;
    for (let r = 0; r !== s; r++)
      t[r] = n[i + r];
    return t;
  }
  interpolate_(e, t, n, s) {
    const i = this.resultBuffer, r = this.sampleValues, o = this.valueSize, a = o * 2, c = o * 3, l = s - t, h = (n - t) / l, f = h * h, d = f * h, g = e * c, p = g - c, m = -2 * d + 3 * f, _ = d - f, x = 1 - m, T = _ - f + h;
    for (let b = 0; b !== o; b++) {
      const R = r[p + b + o], y = r[p + b + a] * l, w = r[g + b + o], v = r[g + b] * l;
      i[b] = x * R + T * y + m * w + _ * v;
    }
    return i;
  }
}
const js = new it();
class Us extends ft {
  interpolate_(e, t, n, s) {
    const i = super.interpolate_(e, t, n, s);
    return js.fromArray(i).normalize().toArray(i), i;
  }
}
const P = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
}, W = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, Ge = {
  9728: at,
  9729: Ce,
  9984: vt,
  9985: Et,
  9986: Ct,
  9987: ot
}, He = {
  33071: Lt,
  33648: At,
  10497: Ee
}, be = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, Le = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  TEXCOORD_0: "uv",
  TEXCOORD_1: "uv1",
  TEXCOORD_2: "uv2",
  TEXCOORD_3: "uv3",
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
}, G = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, Bs = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: lt,
  STEP: Ht
}, xe = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function Gs(u) {
  return u.DefaultMaterial === void 0 && (u.DefaultMaterial = new ct({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: zt
  })), u.DefaultMaterial;
}
function z(u, e, t) {
  for (const n in t.extensions)
    u[n] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[n] = t.extensions[n]);
}
function D(u, e) {
  e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(u.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras));
}
function Hs(u, e, t) {
  let n = !1, s = !1, i = !1;
  for (let c = 0, l = e.length; c < l; c++) {
    const h = e[c];
    if (h.POSITION !== void 0 && (n = !0), h.NORMAL !== void 0 && (s = !0), h.COLOR_0 !== void 0 && (i = !0), n && s && i) break;
  }
  if (!n && !s && !i) return Promise.resolve(u);
  const r = [], o = [], a = [];
  for (let c = 0, l = e.length; c < l; c++) {
    const h = e[c];
    if (n) {
      const f = h.POSITION !== void 0 ? t.getDependency("accessor", h.POSITION) : u.attributes.position;
      r.push(f);
    }
    if (s) {
      const f = h.NORMAL !== void 0 ? t.getDependency("accessor", h.NORMAL) : u.attributes.normal;
      o.push(f);
    }
    if (i) {
      const f = h.COLOR_0 !== void 0 ? t.getDependency("accessor", h.COLOR_0) : u.attributes.color;
      a.push(f);
    }
  }
  return Promise.all([
    Promise.all(r),
    Promise.all(o),
    Promise.all(a)
  ]).then(function(c) {
    const l = c[0], h = c[1], f = c[2];
    return n && (u.morphAttributes.position = l), s && (u.morphAttributes.normal = h), i && (u.morphAttributes.color = f), u.morphTargetsRelative = !0, u;
  });
}
function zs(u, e) {
  if (u.updateMorphTargets(), e.weights !== void 0)
    for (let t = 0, n = e.weights.length; t < n; t++)
      u.morphTargetInfluences[t] = e.weights[t];
  if (e.extras && Array.isArray(e.extras.targetNames)) {
    const t = e.extras.targetNames;
    if (u.morphTargetInfluences.length === t.length) {
      u.morphTargetDictionary = {};
      for (let n = 0, s = t.length; n < s; n++)
        u.morphTargetDictionary[t[n]] = n;
    } else
      console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
  }
}
function Vs(u) {
  let e;
  const t = u.extensions && u.extensions[M.KHR_DRACO_MESH_COMPRESSION];
  if (t ? e = "draco:" + t.bufferView + ":" + t.indices + ":" + ye(t.attributes) : e = u.indices + ":" + ye(u.attributes) + ":" + u.mode, u.targets !== void 0)
    for (let n = 0, s = u.targets.length; n < s; n++)
      e += ":" + ye(u.targets[n]);
  return e;
}
function ye(u) {
  let e = "";
  const t = Object.keys(u).sort();
  for (let n = 0, s = t.length; n < s; n++)
    e += t[n] + ":" + u[t[n]] + ";";
  return e;
}
function Ie(u) {
  switch (u) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
}
function Ks(u) {
  return u.search(/\.jpe?g($|\?)/i) > 0 || u.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : u.search(/\.webp($|\?)/i) > 0 || u.search(/^data\:image\/webp/) === 0 ? "image/webp" : u.search(/\.ktx2($|\?)/i) > 0 || u.search(/^data\:image\/ktx2/) === 0 ? "image/ktx2" : "image/png";
}
const Xs = new de();
class Ws {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new ms(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, s = -1, i = !1, r = -1;
    if (typeof navigator < "u") {
      const o = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(o) === !0;
      const a = o.match(/Version\/(\d+)/);
      s = n && a ? parseInt(a[1], 10) : -1, i = o.indexOf("Firefox") > -1, r = i ? o.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && s < 17 || i && r < 98 ? this.textureLoader = new wt(this.options.manager) : this.textureLoader = new Rt(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new ne(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
  }
  setExtensions(e) {
    this.extensions = e;
  }
  setPlugins(e) {
    this.plugins = e;
  }
  parse(e, t) {
    const n = this, s = this.json, i = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(r) {
      return r._markDefs && r._markDefs();
    }), Promise.all(this._invokeAll(function(r) {
      return r.beforeRoot && r.beforeRoot();
    })).then(function() {
      return Promise.all([
        n.getDependencies("scene"),
        n.getDependencies("animation"),
        n.getDependencies("camera")
      ]);
    }).then(function(r) {
      const o = {
        scene: r[0][s.scene || 0],
        scenes: r[0],
        animations: r[1],
        cameras: r[2],
        asset: s.asset,
        parser: n,
        userData: {}
      };
      return z(i, o, s), D(o, s), Promise.all(n._invokeAll(function(a) {
        return a.afterRoot && a.afterRoot(o);
      })).then(function() {
        for (const a of o.scenes)
          a.updateMatrixWorld();
        e(o);
      });
    }).catch(t);
  }
  /**
   * Marks the special nodes/meshes in json for efficient parse.
   *
   * @private
   */
  _markDefs() {
    const e = this.json.nodes || [], t = this.json.skins || [], n = this.json.meshes || [];
    for (let s = 0, i = t.length; s < i; s++) {
      const r = t[s].joints;
      for (let o = 0, a = r.length; o < a; o++)
        e[r[o]].isBone = !0;
    }
    for (let s = 0, i = e.length; s < i; s++) {
      const r = e[s];
      r.mesh !== void 0 && (this._addNodeRef(this.meshCache, r.mesh), r.skin !== void 0 && (n[r.mesh].isSkinnedMesh = !0)), r.camera !== void 0 && this._addNodeRef(this.cameraCache, r.camera);
    }
  }
  /**
   * Counts references to shared node / Object3D resources. These resources
   * can be reused, or "instantiated", at multiple nodes in the scene
   * hierarchy. Mesh, Camera, and Light instances are instantiated and must
   * be marked. Non-scenegraph resources (like Materials, Geometries, and
   * Textures) can be reused directly and are not marked here.
   *
   * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
   *
   * @private
   * @param {Object} cache
   * @param {Object3D} index
   */
  _addNodeRef(e, t) {
    t !== void 0 && (e.refs[t] === void 0 && (e.refs[t] = e.uses[t] = 0), e.refs[t]++);
  }
  /**
   * Returns a reference to a shared resource, cloning it if necessary.
   *
   * @private
   * @param {Object} cache
   * @param {number} index
   * @param {Object} object
   * @return {Object}
   */
  _getNodeRef(e, t, n) {
    if (e.refs[t] <= 1) return n;
    const s = n.clone(), i = (r, o) => {
      const a = this.associations.get(r);
      a != null && this.associations.set(o, a);
      for (const [c, l] of r.children.entries())
        i(l, o.children[c]);
    };
    return i(n, s), s.name += "_instance_" + e.uses[t]++, s;
  }
  _invokeOne(e) {
    const t = Object.values(this.plugins);
    t.push(this);
    for (let n = 0; n < t.length; n++) {
      const s = e(t[n]);
      if (s) return s;
    }
    return null;
  }
  _invokeAll(e) {
    const t = Object.values(this.plugins);
    t.unshift(this);
    const n = [];
    for (let s = 0; s < t.length; s++) {
      const i = e(t[s]);
      i && n.push(i);
    }
    return n;
  }
  /**
   * Requests the specified dependency asynchronously, with caching.
   *
   * @private
   * @param {string} type
   * @param {number} index
   * @return {Promise<Object3D|Material|Texture|AnimationClip|ArrayBuffer|Object>}
   */
  getDependency(e, t) {
    const n = e + ":" + t;
    let s = this.cache.get(n);
    if (!s) {
      switch (e) {
        case "scene":
          s = this.loadScene(t);
          break;
        case "node":
          s = this._invokeOne(function(i) {
            return i.loadNode && i.loadNode(t);
          });
          break;
        case "mesh":
          s = this._invokeOne(function(i) {
            return i.loadMesh && i.loadMesh(t);
          });
          break;
        case "accessor":
          s = this.loadAccessor(t);
          break;
        case "bufferView":
          s = this._invokeOne(function(i) {
            return i.loadBufferView && i.loadBufferView(t);
          });
          break;
        case "buffer":
          s = this.loadBuffer(t);
          break;
        case "material":
          s = this._invokeOne(function(i) {
            return i.loadMaterial && i.loadMaterial(t);
          });
          break;
        case "texture":
          s = this._invokeOne(function(i) {
            return i.loadTexture && i.loadTexture(t);
          });
          break;
        case "skin":
          s = this.loadSkin(t);
          break;
        case "animation":
          s = this._invokeOne(function(i) {
            return i.loadAnimation && i.loadAnimation(t);
          });
          break;
        case "camera":
          s = this.loadCamera(t);
          break;
        default:
          if (s = this._invokeOne(function(i) {
            return i != this && i.getDependency && i.getDependency(e, t);
          }), !s)
            throw new Error("Unknown type: " + e);
          break;
      }
      this.cache.add(n, s);
    }
    return s;
  }
  /**
   * Requests all dependencies of the specified type asynchronously, with caching.
   *
   * @private
   * @param {string} type
   * @return {Promise<Array<Object>>}
   */
  getDependencies(e) {
    let t = this.cache.get(e);
    if (!t) {
      const n = this, s = this.json[e + (e === "mesh" ? "es" : "s")] || [];
      t = Promise.all(s.map(function(i, r) {
        return n.getDependency(e, r);
      })), this.cache.add(e, t);
    }
    return t;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   *
   * @private
   * @param {number} bufferIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBuffer(e) {
    const t = this.json.buffers[e], n = this.fileLoader;
    if (t.type && t.type !== "arraybuffer")
      throw new Error("THREE.GLTFLoader: " + t.type + " buffer type is not supported.");
    if (t.uri === void 0 && e === 0)
      return Promise.resolve(this.extensions[M.KHR_BINARY_GLTF].body);
    const s = this.options;
    return new Promise(function(i, r) {
      n.load(Q.resolveURL(t.uri, s.path), i, void 0, function() {
        r(new Error('THREE.GLTFLoader: Failed to load buffer "' + t.uri + '".'));
      });
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   *
   * @private
   * @param {number} bufferViewIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBufferView(e) {
    const t = this.json.bufferViews[e];
    return this.getDependency("buffer", t.buffer).then(function(n) {
      const s = t.byteLength || 0, i = t.byteOffset || 0;
      return n.slice(i, i + s);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
   *
   * @private
   * @param {number} accessorIndex
   * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
   */
  loadAccessor(e) {
    const t = this, n = this.json, s = this.json.accessors[e];
    if (s.bufferView === void 0 && s.sparse === void 0) {
      const r = be[s.type], o = W[s.componentType], a = s.normalized === !0, c = new o(s.count * r);
      return Promise.resolve(new X(c, r, a));
    }
    const i = [];
    return s.bufferView !== void 0 ? i.push(this.getDependency("bufferView", s.bufferView)) : i.push(null), s.sparse !== void 0 && (i.push(this.getDependency("bufferView", s.sparse.indices.bufferView)), i.push(this.getDependency("bufferView", s.sparse.values.bufferView))), Promise.all(i).then(function(r) {
      const o = r[0], a = be[s.type], c = W[s.componentType], l = c.BYTES_PER_ELEMENT, h = l * a, f = s.byteOffset || 0, d = s.bufferView !== void 0 ? n.bufferViews[s.bufferView].byteStride : void 0, g = s.normalized === !0;
      let p, m;
      if (d && d !== h) {
        const _ = Math.floor(f / d), x = "InterleavedBuffer:" + s.bufferView + ":" + s.componentType + ":" + _ + ":" + s.count;
        let T = t.cache.get(x);
        T || (p = new c(o, _ * d, s.count * d / l), T = new St(p, d / l), t.cache.add(x, T)), m = new Mt(T, a, f % d / l, g);
      } else
        o === null ? p = new c(s.count * a) : p = new c(o, f, s.count * a), m = new X(p, a, g);
      if (s.sparse !== void 0) {
        const _ = be.SCALAR, x = W[s.sparse.indices.componentType], T = s.sparse.indices.byteOffset || 0, b = s.sparse.values.byteOffset || 0, R = new x(r[1], T, s.sparse.count * _), y = new c(r[2], b, s.sparse.count * a);
        o !== null && (m = new X(m.array.slice(), m.itemSize, m.normalized)), m.normalized = !1;
        for (let w = 0, v = R.length; w < v; w++) {
          const C = R[w];
          if (m.setX(C, y[w * a]), a >= 2 && m.setY(C, y[w * a + 1]), a >= 3 && m.setZ(C, y[w * a + 2]), a >= 4 && m.setW(C, y[w * a + 3]), a >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        m.normalized = g;
      }
      return m;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
   *
   * @private
   * @param {number} textureIndex
   * @return {Promise<?Texture>}
   */
  loadTexture(e) {
    const t = this.json, n = this.options, i = t.textures[e].source, r = t.images[i];
    let o = this.textureLoader;
    if (r.uri) {
      const a = n.manager.getHandler(r.uri);
      a !== null && (o = a);
    }
    return this.loadTextureImage(e, i, o);
  }
  loadTextureImage(e, t, n) {
    const s = this, i = this.json, r = i.textures[e], o = i.images[t], a = (o.uri || o.bufferView) + ":" + r.sampler;
    if (this.textureCache[a])
      return this.textureCache[a];
    const c = this.loadImageSource(t, n).then(function(l) {
      l.flipY = !1, l.name = r.name || o.name || "", l.name === "" && typeof o.uri == "string" && o.uri.startsWith("data:image/") === !1 && (l.name = o.uri);
      const f = (i.samplers || {})[r.sampler] || {};
      return l.magFilter = Ge[f.magFilter] || Ce, l.minFilter = Ge[f.minFilter] || ot, l.wrapS = He[f.wrapS] || Ee, l.wrapT = He[f.wrapT] || Ee, l.generateMipmaps = !l.isCompressedTexture && l.minFilter !== at && l.minFilter !== Ce, s.associations.set(l, { textures: e }), l;
    }).catch(function() {
      return null;
    });
    return this.textureCache[a] = c, c;
  }
  loadImageSource(e, t) {
    const n = this, s = this.json, i = this.options;
    if (this.sourceCache[e] !== void 0)
      return this.sourceCache[e].then((h) => h.clone());
    const r = s.images[e], o = self.URL || self.webkitURL;
    let a = r.uri || "", c = !1;
    if (r.bufferView !== void 0)
      a = n.getDependency("bufferView", r.bufferView).then(function(h) {
        c = !0;
        const f = new Blob([h], { type: r.mimeType });
        return a = o.createObjectURL(f), a;
      });
    else if (r.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
    const l = Promise.resolve(a).then(function(h) {
      return new Promise(function(f, d) {
        let g = f;
        t.isImageBitmapLoader === !0 && (g = function(p) {
          const m = new Fe(p);
          m.needsUpdate = !0, f(m);
        }), t.load(Q.resolveURL(h, i.path), g, void 0, d);
      });
    }).then(function(h) {
      return c === !0 && o.revokeObjectURL(a), D(h, r), h.userData.mimeType = r.mimeType || Ks(r.uri), h;
    }).catch(function(h) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", a), h;
    });
    return this.sourceCache[e] = l, l;
  }
  /**
   * Asynchronously assigns a texture to the given material parameters.
   *
   * @private
   * @param {Object} materialParams
   * @param {string} mapName
   * @param {Object} mapDef
   * @param {string} [colorSpace]
   * @return {Promise<Texture>}
   */
  assignTexture(e, t, n, s) {
    const i = this;
    return this.getDependency("texture", n.index).then(function(r) {
      if (!r) return null;
      if (n.texCoord !== void 0 && n.texCoord > 0 && (r = r.clone(), r.channel = n.texCoord), i.extensions[M.KHR_TEXTURE_TRANSFORM]) {
        const o = n.extensions !== void 0 ? n.extensions[M.KHR_TEXTURE_TRANSFORM] : void 0;
        if (o) {
          const a = i.associations.get(r);
          r = i.extensions[M.KHR_TEXTURE_TRANSFORM].extendTexture(r, o), i.associations.set(r, a);
        }
      }
      return s !== void 0 && (r.colorSpace = s), e[t] = r, r;
    });
  }
  /**
   * Assigns final material to a Mesh, Line, or Points instance. The instance
   * already has a material (generated from the glTF material options alone)
   * but reuse of the same glTF material may require multiple threejs materials
   * to accommodate different primitive types, defines, etc. New materials will
   * be created if necessary, and reused from a cache.
   *
   * @private
   * @param {Object3D} mesh Mesh, Line, or Points instance.
   */
  assignFinalMaterial(e) {
    const t = e.geometry;
    let n = e.material;
    const s = t.attributes.tangent === void 0, i = t.attributes.color !== void 0, r = t.attributes.normal === void 0;
    if (e.isPoints) {
      const o = "PointsMaterial:" + n.uuid;
      let a = this.cache.get(o);
      a || (a = new Z(), ee.prototype.copy.call(a, n), a.color.copy(n.color), a.map = n.map, a.sizeAttenuation = !1, this.cache.add(o, a)), n = a;
    } else if (e.isLine) {
      const o = "LineBasicMaterial:" + n.uuid;
      let a = this.cache.get(o);
      a || (a = new le(), ee.prototype.copy.call(a, n), a.color.copy(n.color), a.map = n.map, this.cache.add(o, a)), n = a;
    }
    if (s || i || r) {
      let o = "ClonedMaterial:" + n.uuid + ":";
      s && (o += "derivative-tangents:"), i && (o += "vertex-colors:"), r && (o += "flat-shading:");
      let a = this.cache.get(o);
      a || (a = n.clone(), i && (a.vertexColors = !0), r && (a.flatShading = !0), s && (a.normalScale && (a.normalScale.y *= -1), a.clearcoatNormalScale && (a.clearcoatNormalScale.y *= -1)), this.cache.add(o, a), this.associations.set(a, this.associations.get(n))), n = a;
    }
    e.material = n;
  }
  getMaterialType() {
    return ct;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
   *
   * @private
   * @param {number} materialIndex
   * @return {Promise<Material>}
   */
  loadMaterial(e) {
    const t = this, n = this.json, s = this.extensions, i = n.materials[e];
    let r;
    const o = {}, a = i.extensions || {}, c = [];
    if (a[M.KHR_MATERIALS_UNLIT]) {
      const h = s[M.KHR_MATERIALS_UNLIT];
      r = h.getMaterialType(), c.push(h.extendParams(o, i, t));
    } else {
      const h = i.pbrMetallicRoughness || {};
      if (o.color = new U(1, 1, 1), o.opacity = 1, Array.isArray(h.baseColorFactor)) {
        const f = h.baseColorFactor;
        o.color.setRGB(f[0], f[1], f[2], B), o.opacity = f[3];
      }
      h.baseColorTexture !== void 0 && c.push(t.assignTexture(o, "map", h.baseColorTexture, V)), o.metalness = h.metallicFactor !== void 0 ? h.metallicFactor : 1, o.roughness = h.roughnessFactor !== void 0 ? h.roughnessFactor : 1, h.metallicRoughnessTexture !== void 0 && (c.push(t.assignTexture(o, "metalnessMap", h.metallicRoughnessTexture)), c.push(t.assignTexture(o, "roughnessMap", h.metallicRoughnessTexture))), r = this._invokeOne(function(f) {
        return f.getMaterialType && f.getMaterialType(e);
      }), c.push(Promise.all(this._invokeAll(function(f) {
        return f.extendMaterialParams && f.extendMaterialParams(e, o);
      })));
    }
    i.doubleSided === !0 && (o.side = It);
    const l = i.alphaMode || xe.OPAQUE;
    if (l === xe.BLEND ? (o.transparent = !0, o.depthWrite = !1) : (o.transparent = !1, l === xe.MASK && (o.alphaTest = i.alphaCutoff !== void 0 ? i.alphaCutoff : 0.5)), i.normalTexture !== void 0 && r !== J && (c.push(t.assignTexture(o, "normalMap", i.normalTexture)), o.normalScale = new nt(1, 1), i.normalTexture.scale !== void 0)) {
      const h = i.normalTexture.scale;
      o.normalScale.set(h, h);
    }
    if (i.occlusionTexture !== void 0 && r !== J && (c.push(t.assignTexture(o, "aoMap", i.occlusionTexture)), i.occlusionTexture.strength !== void 0 && (o.aoMapIntensity = i.occlusionTexture.strength)), i.emissiveFactor !== void 0 && r !== J) {
      const h = i.emissiveFactor;
      o.emissive = new U().setRGB(h[0], h[1], h[2], B);
    }
    return i.emissiveTexture !== void 0 && r !== J && c.push(t.assignTexture(o, "emissiveMap", i.emissiveTexture, V)), Promise.all(c).then(function() {
      const h = new r(o);
      return i.name && (h.name = i.name), D(h, i), t.associations.set(h, { materials: e }), i.extensions && z(s, h, i), h;
    });
  }
  /**
   * When Object3D instances are targeted by animation, they need unique names.
   *
   * @private
   * @param {string} originalName
   * @return {string}
   */
  createUniqueName(e) {
    const t = Ft.sanitizeNodeName(e || "");
    return t in this.nodeNamesUsed ? t + "_" + ++this.nodeNamesUsed[t] : (this.nodeNamesUsed[t] = 0, t);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
   *
   * Creates BufferGeometries from primitives.
   *
   * @private
   * @param {Array<GLTF.Primitive>} primitives
   * @return {Promise<Array<BufferGeometry>>}
   */
  loadGeometries(e) {
    const t = this, n = this.extensions, s = this.primitiveCache;
    function i(o) {
      return n[M.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o, t).then(function(a) {
        return ze(a, o, t);
      });
    }
    const r = [];
    for (let o = 0, a = e.length; o < a; o++) {
      const c = e[o], l = Vs(c), h = s[l];
      if (h)
        r.push(h.promise);
      else {
        let f;
        c.extensions && c.extensions[M.KHR_DRACO_MESH_COMPRESSION] ? f = i(c) : f = ze(new te(), c, t), s[l] = { primitive: c, promise: f }, r.push(f);
      }
    }
    return Promise.all(r);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
   *
   * @private
   * @param {number} meshIndex
   * @return {Promise<Group|Mesh|SkinnedMesh|Line|Points>}
   */
  loadMesh(e) {
    const t = this, n = this.json, s = this.extensions, i = n.meshes[e], r = i.primitives, o = [];
    for (let a = 0, c = r.length; a < c; a++) {
      const l = r[a].material === void 0 ? Gs(this.cache) : this.getDependency("material", r[a].material);
      o.push(l);
    }
    return o.push(t.loadGeometries(r)), Promise.all(o).then(function(a) {
      const c = a.slice(0, a.length - 1), l = a[a.length - 1], h = [];
      for (let d = 0, g = l.length; d < g; d++) {
        const p = l[d], m = r[d];
        let _;
        const x = c[d];
        if (m.mode === P.TRIANGLES || m.mode === P.TRIANGLE_STRIP || m.mode === P.TRIANGLE_FAN || m.mode === void 0)
          _ = i.isSkinnedMesh === !0 ? new Ot(p, x) : new ve(p, x), _.isSkinnedMesh === !0 && _.normalizeSkinWeights(), m.mode === P.TRIANGLE_STRIP ? _.geometry = Ue(_.geometry, st) : m.mode === P.TRIANGLE_FAN && (_.geometry = Ue(_.geometry, Me));
        else if (m.mode === P.LINES)
          _ = new Ae(p, x);
        else if (m.mode === P.LINE_STRIP)
          _ = new Pt(p, x);
        else if (m.mode === P.LINE_LOOP)
          _ = new Nt(p, x);
        else if (m.mode === P.POINTS)
          _ = new he(p, x);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + m.mode);
        Object.keys(_.geometry.morphAttributes).length > 0 && zs(_, i), _.name = t.createUniqueName(i.name || "mesh_" + e), D(_, i), m.extensions && z(s, _, m), t.assignFinalMaterial(_), h.push(_);
      }
      for (let d = 0, g = h.length; d < g; d++)
        t.associations.set(h[d], {
          meshes: e,
          primitives: d
        });
      if (h.length === 1)
        return i.extensions && z(s, h[0], i), h[0];
      const f = new ue();
      i.extensions && z(s, f, i), t.associations.set(f, { meshes: e });
      for (let d = 0, g = h.length; d < g; d++)
        f.add(h[d]);
      return f;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
   *
   * @private
   * @param {number} cameraIndex
   * @return {Promise<Camera>|undefined}
   */
  loadCamera(e) {
    let t;
    const n = this.json.cameras[e], s = n[n.type];
    if (!s) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    return n.type === "perspective" ? t = new Dt(kt.radToDeg(s.yfov), s.aspectRatio || 1, s.znear || 1, s.zfar || 2e6) : n.type === "orthographic" && (t = new jt(-s.xmag, s.xmag, s.ymag, -s.ymag, s.znear, s.zfar)), n.name && (t.name = this.createUniqueName(n.name)), D(t, n), Promise.resolve(t);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
   *
   * @private
   * @param {number} skinIndex
   * @return {Promise<Skeleton>}
   */
  loadSkin(e) {
    const t = this.json.skins[e], n = [];
    for (let s = 0, i = t.joints.length; s < i; s++)
      n.push(this._loadNodeShallow(t.joints[s]));
    return t.inverseBindMatrices !== void 0 ? n.push(this.getDependency("accessor", t.inverseBindMatrices)) : n.push(null), Promise.all(n).then(function(s) {
      const i = s.pop(), r = s, o = [], a = [];
      for (let c = 0, l = r.length; c < l; c++) {
        const h = r[c];
        if (h) {
          o.push(h);
          const f = new de();
          i !== null && f.fromArray(i.array, c * 16), a.push(f);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[c]);
      }
      return new Ut(o, a);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
   *
   * @private
   * @param {number} animationIndex
   * @return {Promise<AnimationClip>}
   */
  loadAnimation(e) {
    const t = this.json, n = this, s = t.animations[e], i = s.name ? s.name : "animation_" + e, r = [], o = [], a = [], c = [], l = [];
    for (let h = 0, f = s.channels.length; h < f; h++) {
      const d = s.channels[h], g = s.samplers[d.sampler], p = d.target, m = p.node, _ = s.parameters !== void 0 ? s.parameters[g.input] : g.input, x = s.parameters !== void 0 ? s.parameters[g.output] : g.output;
      p.node !== void 0 && (r.push(this.getDependency("node", m)), o.push(this.getDependency("accessor", _)), a.push(this.getDependency("accessor", x)), c.push(g), l.push(p));
    }
    return Promise.all([
      Promise.all(r),
      Promise.all(o),
      Promise.all(a),
      Promise.all(c),
      Promise.all(l)
    ]).then(function(h) {
      const f = h[0], d = h[1], g = h[2], p = h[3], m = h[4], _ = [];
      for (let T = 0, b = f.length; T < b; T++) {
        const R = f[T], y = d[T], w = g[T], v = p[T], C = m[T];
        if (R === void 0) continue;
        R.updateMatrix && R.updateMatrix();
        const A = n._createAnimationTracks(R, y, w, v, C);
        if (A)
          for (let E = 0; E < A.length; E++)
            _.push(A[E]);
      }
      const x = new Bt(i, void 0, _);
      return D(x, s), x;
    });
  }
  createNodeMesh(e) {
    const t = this.json, n = this, s = t.nodes[e];
    return s.mesh === void 0 ? null : n.getDependency("mesh", s.mesh).then(function(i) {
      const r = n._getNodeRef(n.meshCache, s.mesh, i);
      return s.weights !== void 0 && r.traverse(function(o) {
        if (o.isMesh)
          for (let a = 0, c = s.weights.length; a < c; a++)
            o.morphTargetInfluences[a] = s.weights[a];
      }), r;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
   *
   * @private
   * @param {number} nodeIndex
   * @return {Promise<Object3D>}
   */
  loadNode(e) {
    const t = this.json, n = this, s = t.nodes[e], i = n._loadNodeShallow(e), r = [], o = s.children || [];
    for (let c = 0, l = o.length; c < l; c++)
      r.push(n.getDependency("node", o[c]));
    const a = s.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", s.skin);
    return Promise.all([
      i,
      Promise.all(r),
      a
    ]).then(function(c) {
      const l = c[0], h = c[1], f = c[2];
      f !== null && l.traverse(function(d) {
        d.isSkinnedMesh && d.bind(f, Xs);
      });
      for (let d = 0, g = h.length; d < g; d++)
        l.add(h[d]);
      return l;
    });
  }
  // ._loadNodeShallow() parses a single node.
  // skin and child nodes are created and added in .loadNode() (no '_' prefix).
  _loadNodeShallow(e) {
    const t = this.json, n = this.extensions, s = this;
    if (this.nodeCache[e] !== void 0)
      return this.nodeCache[e];
    const i = t.nodes[e], r = i.name ? s.createUniqueName(i.name) : "", o = [], a = s._invokeOne(function(c) {
      return c.createNodeMesh && c.createNodeMesh(e);
    });
    return a && o.push(a), i.camera !== void 0 && o.push(s.getDependency("camera", i.camera).then(function(c) {
      return s._getNodeRef(s.cameraCache, i.camera, c);
    })), s._invokeAll(function(c) {
      return c.createNodeAttachment && c.createNodeAttachment(e);
    }).forEach(function(c) {
      o.push(c);
    }), this.nodeCache[e] = Promise.all(o).then(function(c) {
      let l;
      if (i.isBone === !0 ? l = new Gt() : c.length > 1 ? l = new ue() : c.length === 1 ? l = c[0] : l = new rt(), l !== c[0])
        for (let h = 0, f = c.length; h < f; h++)
          l.add(c[h]);
      if (i.name && (l.userData.name = i.name, l.name = r), D(l, i), i.extensions && z(n, l, i), i.matrix !== void 0) {
        const h = new de();
        h.fromArray(i.matrix), l.applyMatrix4(h);
      } else
        i.translation !== void 0 && l.position.fromArray(i.translation), i.rotation !== void 0 && l.quaternion.fromArray(i.rotation), i.scale !== void 0 && l.scale.fromArray(i.scale);
      if (!s.associations.has(l))
        s.associations.set(l, {});
      else if (i.mesh !== void 0 && s.meshCache.refs[i.mesh] > 1) {
        const h = s.associations.get(l);
        s.associations.set(l, { ...h });
      }
      return s.associations.get(l).nodes = e, l;
    }), this.nodeCache[e];
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
   *
   * @private
   * @param {number} sceneIndex
   * @return {Promise<Group>}
   */
  loadScene(e) {
    const t = this.extensions, n = this.json.scenes[e], s = this, i = new ue();
    n.name && (i.name = s.createUniqueName(n.name)), D(i, n), n.extensions && z(t, i, n);
    const r = n.nodes || [], o = [];
    for (let a = 0, c = r.length; a < c; a++)
      o.push(s.getDependency("node", r[a]));
    return Promise.all(o).then(function(a) {
      for (let l = 0, h = a.length; l < h; l++)
        i.add(a[l]);
      const c = (l) => {
        const h = /* @__PURE__ */ new Map();
        for (const [f, d] of s.associations)
          (f instanceof ee || f instanceof Fe) && h.set(f, d);
        return l.traverse((f) => {
          const d = s.associations.get(f);
          d != null && h.set(f, d);
        }), h;
      };
      return s.associations = c(i), i;
    });
  }
  _createAnimationTracks(e, t, n, s, i) {
    const r = [], o = e.name ? e.name : e.uuid, a = [];
    G[i.path] === G.weights ? e.traverse(function(f) {
      f.morphTargetInfluences && a.push(f.name ? f.name : f.uuid);
    }) : a.push(o);
    let c;
    switch (G[i.path]) {
      case G.weights:
        c = Pe;
        break;
      case G.rotation:
        c = Ne;
        break;
      case G.translation:
      case G.scale:
        c = Oe;
        break;
      default:
        n.itemSize === 1 ? c = Pe : c = Oe;
        break;
    }
    const l = s.interpolation !== void 0 ? Bs[s.interpolation] : lt, h = this._getArrayFromAccessor(n);
    for (let f = 0, d = a.length; f < d; f++) {
      const g = new c(
        a[f] + "." + G[i.path],
        t.array,
        h,
        l
      );
      s.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(g), r.push(g);
    }
    return r;
  }
  _getArrayFromAccessor(e) {
    let t = e.array;
    if (e.normalized) {
      const n = Ie(t.constructor), s = new Float32Array(t.length);
      for (let i = 0, r = t.length; i < r; i++)
        s[i] = t[i] * n;
      t = s;
    }
    return t;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(n) {
      const s = this instanceof Ne ? Us : ft;
      return new s(this.times, this.values, this.getValueSize() / 3, n);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function Ys(u, e, t) {
  const n = e.attributes, s = new Kt();
  if (n.POSITION !== void 0) {
    const o = t.json.accessors[n.POSITION], a = o.min, c = o.max;
    if (a !== void 0 && c !== void 0) {
      if (s.set(
        new N(a[0], a[1], a[2]),
        new N(c[0], c[1], c[2])
      ), o.normalized) {
        const l = Ie(W[o.componentType]);
        s.min.multiplyScalar(l), s.max.multiplyScalar(l);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else
    return;
  const i = e.targets;
  if (i !== void 0) {
    const o = new N(), a = new N();
    for (let c = 0, l = i.length; c < l; c++) {
      const h = i[c];
      if (h.POSITION !== void 0) {
        const f = t.json.accessors[h.POSITION], d = f.min, g = f.max;
        if (d !== void 0 && g !== void 0) {
          if (a.setX(Math.max(Math.abs(d[0]), Math.abs(g[0]))), a.setY(Math.max(Math.abs(d[1]), Math.abs(g[1]))), a.setZ(Math.max(Math.abs(d[2]), Math.abs(g[2]))), f.normalized) {
            const p = Ie(W[f.componentType]);
            a.multiplyScalar(p);
          }
          o.max(a);
        } else
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    s.expandByVector(o);
  }
  u.boundingBox = s;
  const r = new Xt();
  s.getCenter(r.center), r.radius = s.min.distanceTo(s.max) / 2, u.boundingSphere = r;
}
function ze(u, e, t) {
  const n = e.attributes, s = [];
  function i(r, o) {
    return t.getDependency("accessor", r).then(function(a) {
      u.setAttribute(o, a);
    });
  }
  for (const r in n) {
    const o = Le[r] || r.toLowerCase();
    o in u.attributes || s.push(i(n[r], o));
  }
  if (e.indices !== void 0 && !u.index) {
    const r = t.getDependency("accessor", e.indices).then(function(o) {
      u.setIndex(o);
    });
    s.push(r);
  }
  return De.workingColorSpace !== B && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${De.workingColorSpace}" not supported.`), D(u, e), Ys(u, e, t), Promise.all(s).then(function() {
    return e.targets !== void 0 ? Hs(u, e.targets, t) : u;
  });
}
const $s = /^[og]\s*(.+)?/, qs = /^mtllib /, Zs = /^usemtl /, Js = /^usemap /, Ve = /\s+/, Ke = new N(), Te = new N(), Xe = new N(), We = new N(), O = new N(), oe = new U();
function Qs() {
  const u = {
    objects: [],
    object: {},
    vertices: [],
    normals: [],
    colors: [],
    uvs: [],
    materials: {},
    materialLibraries: [],
    startObject: function(e, t) {
      if (this.object && this.object.fromDeclaration === !1) {
        this.object.name = e, this.object.fromDeclaration = t !== !1;
        return;
      }
      const n = this.object && typeof this.object.currentMaterial == "function" ? this.object.currentMaterial() : void 0;
      if (this.object && typeof this.object._finalize == "function" && this.object._finalize(!0), this.object = {
        name: e || "",
        fromDeclaration: t !== !1,
        geometry: {
          vertices: [],
          normals: [],
          colors: [],
          uvs: [],
          hasUVIndices: !1
        },
        materials: [],
        smooth: !0,
        startMaterial: function(s, i) {
          const r = this._finalize(!1);
          r && (r.inherited || r.groupCount <= 0) && this.materials.splice(r.index, 1);
          const o = {
            index: this.materials.length,
            name: s || "",
            mtllib: Array.isArray(i) && i.length > 0 ? i[i.length - 1] : "",
            smooth: r !== void 0 ? r.smooth : this.smooth,
            groupStart: r !== void 0 ? r.groupEnd : 0,
            groupEnd: -1,
            groupCount: -1,
            inherited: !1,
            clone: function(a) {
              const c = {
                index: typeof a == "number" ? a : this.index,
                name: this.name,
                mtllib: this.mtllib,
                smooth: this.smooth,
                groupStart: 0,
                groupEnd: -1,
                groupCount: -1,
                inherited: !1
              };
              return c.clone = this.clone.bind(c), c;
            }
          };
          return this.materials.push(o), o;
        },
        currentMaterial: function() {
          if (this.materials.length > 0)
            return this.materials[this.materials.length - 1];
        },
        _finalize: function(s) {
          const i = this.currentMaterial();
          if (i && i.groupEnd === -1 && (i.groupEnd = this.geometry.vertices.length / 3, i.groupCount = i.groupEnd - i.groupStart, i.inherited = !1), s && this.materials.length > 1)
            for (let r = this.materials.length - 1; r >= 0; r--)
              this.materials[r].groupCount <= 0 && this.materials.splice(r, 1);
          return s && this.materials.length === 0 && this.materials.push({
            name: "",
            smooth: this.smooth
          }), i;
        }
      }, n && n.name && typeof n.clone == "function") {
        const s = n.clone(0);
        s.inherited = !0, this.object.materials.push(s);
      }
      this.objects.push(this.object);
    },
    finalize: function() {
      this.object && typeof this.object._finalize == "function" && this.object._finalize(!0);
    },
    parseVertexIndex: function(e, t) {
      const n = parseInt(e, 10);
      return (n >= 0 ? n - 1 : n + t / 3) * 3;
    },
    parseNormalIndex: function(e, t) {
      const n = parseInt(e, 10);
      return (n >= 0 ? n - 1 : n + t / 3) * 3;
    },
    parseUVIndex: function(e, t) {
      const n = parseInt(e, 10);
      return (n >= 0 ? n - 1 : n + t / 2) * 2;
    },
    addVertex: function(e, t, n) {
      const s = this.vertices, i = this.object.geometry.vertices;
      i.push(s[e + 0], s[e + 1], s[e + 2]), i.push(s[t + 0], s[t + 1], s[t + 2]), i.push(s[n + 0], s[n + 1], s[n + 2]);
    },
    addVertexPoint: function(e) {
      const t = this.vertices;
      this.object.geometry.vertices.push(t[e + 0], t[e + 1], t[e + 2]);
    },
    addVertexLine: function(e) {
      const t = this.vertices;
      this.object.geometry.vertices.push(t[e + 0], t[e + 1], t[e + 2]);
    },
    addNormal: function(e, t, n) {
      const s = this.normals, i = this.object.geometry.normals;
      i.push(s[e + 0], s[e + 1], s[e + 2]), i.push(s[t + 0], s[t + 1], s[t + 2]), i.push(s[n + 0], s[n + 1], s[n + 2]);
    },
    addFaceNormal: function(e, t, n) {
      const s = this.vertices, i = this.object.geometry.normals;
      Ke.fromArray(s, e), Te.fromArray(s, t), Xe.fromArray(s, n), O.subVectors(Xe, Te), We.subVectors(Ke, Te), O.cross(We), O.normalize(), i.push(O.x, O.y, O.z), i.push(O.x, O.y, O.z), i.push(O.x, O.y, O.z);
    },
    addColor: function(e, t, n) {
      const s = this.colors, i = this.object.geometry.colors;
      s[e] !== void 0 && i.push(s[e + 0], s[e + 1], s[e + 2]), s[t] !== void 0 && i.push(s[t + 0], s[t + 1], s[t + 2]), s[n] !== void 0 && i.push(s[n + 0], s[n + 1], s[n + 2]);
    },
    addUV: function(e, t, n) {
      const s = this.uvs, i = this.object.geometry.uvs;
      i.push(s[e + 0], s[e + 1]), i.push(s[t + 0], s[t + 1]), i.push(s[n + 0], s[n + 1]);
    },
    addDefaultUV: function() {
      const e = this.object.geometry.uvs;
      e.push(0, 0), e.push(0, 0), e.push(0, 0);
    },
    addUVLine: function(e) {
      const t = this.uvs;
      this.object.geometry.uvs.push(t[e + 0], t[e + 1]);
    },
    addFace: function(e, t, n, s, i, r, o, a, c) {
      const l = this.vertices.length;
      let h = this.parseVertexIndex(e, l), f = this.parseVertexIndex(t, l), d = this.parseVertexIndex(n, l);
      if (this.addVertex(h, f, d), this.addColor(h, f, d), o !== void 0 && o !== "") {
        const g = this.normals.length;
        h = this.parseNormalIndex(o, g), f = this.parseNormalIndex(a, g), d = this.parseNormalIndex(c, g), this.addNormal(h, f, d);
      } else
        this.addFaceNormal(h, f, d);
      if (s !== void 0 && s !== "") {
        const g = this.uvs.length;
        h = this.parseUVIndex(s, g), f = this.parseUVIndex(i, g), d = this.parseUVIndex(r, g), this.addUV(h, f, d), this.object.geometry.hasUVIndices = !0;
      } else
        this.addDefaultUV();
    },
    addPointGeometry: function(e) {
      this.object.geometry.type = "Points";
      const t = this.vertices.length;
      for (let n = 0, s = e.length; n < s; n++) {
        const i = this.parseVertexIndex(e[n], t);
        this.addVertexPoint(i), this.addColor(i);
      }
    },
    addLineGeometry: function(e, t) {
      this.object.geometry.type = "Line";
      const n = this.vertices.length, s = this.uvs.length;
      for (let i = 0, r = e.length; i < r; i++)
        this.addVertexLine(this.parseVertexIndex(e[i], n));
      for (let i = 0, r = t.length; i < r; i++)
        this.addUVLine(this.parseUVIndex(t[i], s));
    }
  };
  return u.startObject("", !1), u;
}
class en extends pe {
  /**
   * Constructs a new OBJ loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(e) {
    super(e), this.materials = null;
  }
  /**
   * Starts loading from the given URL and passes the loaded OBJ asset
   * to the `onLoad()` callback.
   *
   * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
   * @param {function(Group)} onLoad - Executed when the loading process has been finished.
   * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
   * @param {onErrorCallback} onError - Executed when errors occur.
   */
  load(e, t, n, s) {
    const i = this, r = new ne(this.manager);
    r.setPath(this.path), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, function(o) {
      try {
        t(i.parse(o));
      } catch (a) {
        s ? s(a) : console.error(a), i.manager.itemError(e);
      }
    }, n, s);
  }
  /**
   * Sets the material creator for this OBJ. This object is loaded via {@link MTLLoader}.
   *
   * @param {MaterialCreator} materials - An object that creates the materials for this OBJ.
   * @return {OBJLoader} A reference to this loader.
   */
  setMaterials(e) {
    return this.materials = e, this;
  }
  /**
   * Parses the given OBJ data and returns the resulting group.
   *
   * @param {string} text - The raw OBJ data as a string.
   * @return {Group} The parsed OBJ.
   */
  parse(e) {
    const t = new Qs();
    e.indexOf(`\r
`) !== -1 && (e = e.replace(/\r\n/g, `
`)), e.indexOf(`\\
`) !== -1 && (e = e.replace(/\\\n/g, ""));
    const n = e.split(`
`);
    let s = [];
    for (let o = 0, a = n.length; o < a; o++) {
      const c = n[o].trimStart();
      if (c.length === 0) continue;
      const l = c.charAt(0);
      if (l !== "#")
        if (l === "v") {
          const h = c.split(Ve);
          switch (h[0]) {
            case "v":
              t.vertices.push(
                parseFloat(h[1]),
                parseFloat(h[2]),
                parseFloat(h[3])
              ), h.length >= 7 ? (oe.setRGB(
                parseFloat(h[4]),
                parseFloat(h[5]),
                parseFloat(h[6]),
                V
              ), t.colors.push(oe.r, oe.g, oe.b)) : t.colors.push(void 0, void 0, void 0);
              break;
            case "vn":
              t.normals.push(
                parseFloat(h[1]),
                parseFloat(h[2]),
                parseFloat(h[3])
              );
              break;
            case "vt":
              t.uvs.push(
                parseFloat(h[1]),
                parseFloat(h[2])
              );
              break;
          }
        } else if (l === "f") {
          const f = c.slice(1).trim().split(Ve), d = [];
          for (let p = 0, m = f.length; p < m; p++) {
            const _ = f[p];
            if (_.length > 0) {
              const x = _.split("/");
              d.push(x);
            }
          }
          const g = d[0];
          for (let p = 1, m = d.length - 1; p < m; p++) {
            const _ = d[p], x = d[p + 1];
            t.addFace(
              g[0],
              _[0],
              x[0],
              g[1],
              _[1],
              x[1],
              g[2],
              _[2],
              x[2]
            );
          }
        } else if (l === "l") {
          const h = c.substring(1).trim().split(" ");
          let f = [];
          const d = [];
          if (c.indexOf("/") === -1)
            f = h;
          else
            for (let g = 0, p = h.length; g < p; g++) {
              const m = h[g].split("/");
              m[0] !== "" && f.push(m[0]), m[1] !== "" && d.push(m[1]);
            }
          t.addLineGeometry(f, d);
        } else if (l === "p") {
          const f = c.slice(1).trim().split(" ");
          t.addPointGeometry(f);
        } else if ((s = $s.exec(c)) !== null) {
          const h = (" " + s[0].slice(1).trim()).slice(1);
          t.startObject(h);
        } else if (Zs.test(c))
          t.object.startMaterial(c.substring(7).trim(), t.materialLibraries);
        else if (qs.test(c))
          t.materialLibraries.push(c.substring(7).trim());
        else if (Js.test(c))
          console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');
        else if (l === "s") {
          if (s = c.split(" "), s.length > 1) {
            const f = s[1].trim().toLowerCase();
            t.object.smooth = f !== "0" && f !== "off";
          } else
            t.object.smooth = !0;
          const h = t.object.currentMaterial();
          h && (h.smooth = t.object.smooth);
        } else {
          if (c === "\0") continue;
          console.warn('THREE.OBJLoader: Unexpected line: "' + c + '"');
        }
    }
    t.finalize();
    const i = new ue();
    if (i.materialLibraries = [].concat(t.materialLibraries), !(t.objects.length === 1 && t.objects[0].geometry.vertices.length === 0) === !0)
      for (let o = 0, a = t.objects.length; o < a; o++) {
        const c = t.objects[o], l = c.geometry, h = c.materials, f = l.type === "Line", d = l.type === "Points";
        let g = !1;
        if (l.vertices.length === 0) continue;
        const p = new te();
        p.setAttribute("position", new H(l.vertices, 3)), l.normals.length > 0 && p.setAttribute("normal", new H(l.normals, 3)), l.colors.length > 0 && (g = !0, p.setAttribute("color", new H(l.colors, 3))), l.hasUVIndices === !0 && p.setAttribute("uv", new H(l.uvs, 2));
        const m = [];
        for (let x = 0, T = h.length; x < T; x++) {
          const b = h[x], R = b.name + "_" + b.smooth + "_" + g;
          let y = t.materials[R];
          if (this.materials !== null) {
            if (y = this.materials.create(b.name), f && y && !(y instanceof le)) {
              const w = new le();
              ee.prototype.copy.call(w, y), w.color.copy(y.color), y = w;
            } else if (d && y && !(y instanceof Z)) {
              const w = new Z({ size: 10, sizeAttenuation: !1 });
              ee.prototype.copy.call(w, y), w.color.copy(y.color), w.map = y.map, y = w;
            }
          }
          y === void 0 && (f ? y = new le() : d ? y = new Z({ size: 1, sizeAttenuation: !1 }) : y = new Wt(), y.name = b.name, y.flatShading = !b.smooth, y.vertexColors = g, t.materials[R] = y), m.push(y);
        }
        let _;
        if (m.length > 1) {
          for (let x = 0, T = h.length; x < T; x++) {
            const b = h[x];
            p.addGroup(b.groupStart, b.groupCount, x);
          }
          f ? _ = new Ae(p, m) : d ? _ = new he(p, m) : _ = new ve(p, m);
        } else
          f ? _ = new Ae(p, m[0]) : d ? _ = new he(p, m[0]) : _ = new ve(p, m[0]);
        _.name = c.name, i.add(_);
      }
    else if (t.vertices.length > 0) {
      const o = new Z({ size: 1, sizeAttenuation: !1 }), a = new te();
      a.setAttribute("position", new H(t.vertices, 3)), t.colors.length > 0 && t.colors[0] !== void 0 && (a.setAttribute("color", new H(t.colors, 3)), o.vertexColors = !0);
      const c = new he(a, o);
      i.add(c);
    }
    return i;
  }
}
const dt = new S.MeshStandardMaterial({
  color: 16777215,
  roughness: 0.5,
  metalness: 0.1
});
function tn(u) {
  return u.split(".").pop()?.toLowerCase() ?? "";
}
function sn(u) {
  const e = new S.Box3().setFromObject(u), t = e.getSize(new S.Vector3()), n = e.getCenter(new S.Vector3()), i = 3 / Math.max(t.x, t.y, t.z, 1e-6), r = new S.Group();
  for (r.position.set(-n.x, -n.y, -n.z); u.children.length > 0; )
    r.add(u.children[0]);
  u.add(r), u.scale.setScalar(i), u.updateMatrixWorld(!0);
}
function Ye(u) {
  u.traverse((e) => {
    e.isMesh && (e.material = dt.clone(), e.geometry && typeof e.geometry.computeVertexNormals == "function" && e.geometry.computeVertexNormals());
  });
}
function we(u, e) {
  return new Promise((t, n) => {
    u.load(e, t, void 0, n);
  });
}
async function nn(u) {
  const e = tn(u.name), t = URL.createObjectURL(u);
  try {
    let n;
    if (e === "stl") {
      const s = new ds(), i = await we(s, t);
      try {
        i.computeVertexNormals();
        const r = new S.Mesh(i, dt.clone());
        r.rotation.x = -Math.PI / 2, n = new S.Group(), n.add(r);
      } catch (r) {
        throw i.dispose(), r;
      }
    } else if (e === "obj") {
      const s = new en();
      n = await we(s, t), Ye(n);
    } else if (e === "gltf" || e === "glb") {
      const s = new ps();
      n = (await we(s, t)).scene, Ye(n);
    } else
      throw new Error(`Unsupported model format: .${e}`);
    return sn(n), { group: n, objectUrl: t };
  } catch (n) {
    throw URL.revokeObjectURL(t), new Error(`Failed to load model ${u.name}: ${n.message}`);
  }
}
const fe = {
  spinY: { key: "spinY", type: "spin", axis: "y", defaultSpeed: 0.36 },
  spinX: { key: "spinX", type: "spin", axis: "x", defaultSpeed: 0.36 },
  spinZ: { key: "spinZ", type: "spin", axis: "z", defaultSpeed: 0.36 },
  float: {
    key: "float",
    type: "float",
    defaultSpeed: 0.36,
    oscillateX: 0.15,
    oscillateZ: 0.08
  },
  fadeInOut: {
    key: "fadeInOut",
    type: "fadeInOut",
    showDuration: 2e4,
    animationDuration: 2500,
    rotateOnShow: !1,
    showPreset: "spinY"
  }
}, pt = Object.freeze({
  spinX: !1,
  spinY: !0,
  spinZ: !1,
  float: !1,
  bounce: !1,
  pulse: !1,
  shake: !1,
  orbit: !1
});
Object.freeze(Object.keys(pt));
class $ {
  /**
   * Apply per-frame animation increment.
   * @param {object} target - modelGroup (has .rotation, .position, .scale)
   * @param {number} deltaSeconds - time since last frame in seconds
   * @param {number} speed - animation speed multiplier
   * @param {object} context - { time, animationEffects, camera }
   */
  update(e, t, n, s) {
  }
  // eslint-disable-line no-unused-vars
  /**
   * Set animation state for an absolute time (deterministic seek).
   * @param {object} target - modelGroup
   * @param {number} timeSeconds - absolute time in seconds
   * @param {number} speed - animation speed multiplier
   * @param {object} context - { time, animationEffects, camera }
   */
  seekTo(e, t, n, s) {
  }
  // eslint-disable-line no-unused-vars
  /**
   * Detect toggle-on/off transitions and initiate or cancel resets.
   * @param {boolean} active - current active state
   * @param {boolean} previouslyActive - previous frame's active state
   * @param {object} target - modelGroup
   * @param {object} context - { animationEffects }
   */
  checkReset(e, t, n, s) {
  }
  // eslint-disable-line no-unused-vars
  /**
   * Advance any in-progress reset lerp.
   * @param {object} target - modelGroup
   * @param {number} deltaSeconds - time since last frame in seconds
   * @returns {boolean} true if a reset is still in progress
   */
  applyReset(e, t) {
    return !1;
  }
  // eslint-disable-line no-unused-vars
  /** Cancel any in-progress reset. */
  clearReset() {
  }
}
const $e = 0.3;
function rn(u) {
  return 1 - Math.pow(1 - u, 3);
}
class Re extends $ {
  /**
   * @param {'x' | 'y' | 'z'} axis
   */
  constructor(e) {
    super(), this._axis = e, this._reset = null;
  }
  update(e, t, n, s) {
    this._reset || (e.rotation[this._axis] += n * t);
  }
  seekTo(e, t, n, s) {
    e.rotation[this._axis] += n * t;
  }
  checkReset(e, t, n, s) {
    t && !e && !this._reset && (this._reset = { startRotation: n.rotation[this._axis], elapsed: 0 }), !t && e && (this._reset = null);
  }
  applyReset(e, t) {
    if (!this._reset) return !1;
    this._reset.elapsed += t;
    const n = Math.min(this._reset.elapsed / $e, 1), s = rn(n);
    return e.rotation[this._axis] = this._reset.startRotation * (1 - s), this._reset.elapsed >= $e ? (e.rotation[this._axis] = 0, this._reset = null, !1) : !0;
  }
  clearReset() {
    this._reset = null;
  }
  /** @returns {boolean} Whether a reset is currently in progress. */
  get isResetting() {
    return this._reset !== null;
  }
}
const ae = fe.float, ce = 0.3;
function qe(u) {
  return 1 - Math.pow(1 - u, 3);
}
class on extends $ {
  constructor() {
    super(), this._resetX = null, this._resetZ = null;
  }
  update(e, t, n, s) {
    const i = ae?.oscillateX, r = ae?.oscillateZ;
    this._resetX || (e.rotation.x += Math.sin(s.time * 0.5) * i * t * 2), this._resetZ || (e.rotation.z += Math.sin(s.time * 0.3) * r * t * 2);
  }
  seekTo(e, t, n, s) {
    const i = ae?.oscillateX, r = ae?.oscillateZ;
    e.rotation.x += i * 4 * (1 - Math.cos(0.5 * t)), e.rotation.z += r * 2 / 0.3 * (1 - Math.cos(0.3 * t));
  }
  checkReset(e, t, n, s) {
    const i = s.animationEffects;
    t && !e && (!i.spinX && !this._resetX && (this._resetX = { startRotation: n.rotation.x, elapsed: 0 }), !i.spinZ && !this._resetZ && (this._resetZ = { startRotation: n.rotation.z, elapsed: 0 })), !t && e && (i.spinX || (this._resetX = null), i.spinZ || (this._resetZ = null));
  }
  applyReset(e, t) {
    let n = !1;
    if (this._resetX) {
      this._resetX.elapsed += t;
      const s = Math.min(this._resetX.elapsed / ce, 1), i = qe(s);
      e.rotation.x = this._resetX.startRotation * (1 - i), this._resetX.elapsed >= ce ? (e.rotation.x = 0, this._resetX = null) : n = !0;
    }
    if (this._resetZ) {
      this._resetZ.elapsed += t;
      const s = Math.min(this._resetZ.elapsed / ce, 1), i = qe(s);
      e.rotation.z = this._resetZ.startRotation * (1 - i), this._resetZ.elapsed >= ce ? (e.rotation.z = 0, this._resetZ = null) : n = !0;
    }
    return n;
  }
  clearReset() {
    this._resetX = null, this._resetZ = null;
  }
  /** @returns {boolean} Whether a reset is in progress on the x axis. */
  get isResettingX() {
    return this._resetX !== null;
  }
  /** @returns {boolean} Whether a reset is in progress on the z axis. */
  get isResettingZ() {
    return this._resetZ !== null;
  }
}
const Ze = 0.3;
function an(u) {
  return 1 - Math.pow(1 - u, 3);
}
class cn extends $ {
  constructor() {
    super(), this._reset = null;
  }
  update(e, t, n, s) {
    !this._reset && e.position && (e.position.y = Math.abs(Math.sin(s.time * n * 1.8)) * 0.5);
  }
  seekTo(e, t, n, s) {
    e.position && (e.position.y = Math.abs(Math.sin(t * n * 1.8)) * 0.5);
  }
  checkReset(e, t, n, s) {
    t && !e && !this._reset && n.position && (this._reset = { startValue: n.position.y, elapsed: 0 }), !t && e && (this._reset = null);
  }
  applyReset(e, t) {
    if (!this._reset || !e.position) return !1;
    this._reset.elapsed += t;
    const n = Math.min(this._reset.elapsed / Ze, 1), s = an(n);
    return e.position.y = this._reset.startValue * (1 - s), this._reset.elapsed >= Ze ? (e.position.y = 0, this._reset = null, !1) : !0;
  }
  clearReset() {
    this._reset = null;
  }
}
const Je = 0.3;
function ln(u) {
  return 1 - Math.pow(1 - u, 3);
}
class hn extends $ {
  constructor() {
    super(), this._reset = null;
  }
  update(e, t, n, s) {
    !this._reset && e.scale?.setScalar && e.scale.setScalar(1 + Math.sin(s.time * n * 1.5) * 0.12);
  }
  seekTo(e, t, n, s) {
    e.scale?.setScalar && e.scale.setScalar(1 + Math.sin(t * n * 1.5) * 0.12);
  }
  checkReset(e, t, n, s) {
    t && !e && !this._reset && n.scale && (this._reset = { startValue: n.scale.x ?? 1, elapsed: 0 }), !t && e && (this._reset = null);
  }
  applyReset(e, t) {
    if (!this._reset || !e.scale?.setScalar) return !1;
    this._reset.elapsed += t;
    const n = Math.min(this._reset.elapsed / Je, 1), s = ln(n);
    return e.scale.setScalar(this._reset.startValue + (1 - this._reset.startValue) * s), this._reset.elapsed >= Je ? (e.scale.setScalar(1), this._reset = null, !1) : !0;
  }
  clearReset() {
    this._reset = null;
  }
}
class un extends $ {
  update(e, t, n, s) {
    if (e.position) {
      const i = Math.floor(s.time * 30) * 2654435769 >>> 0, r = se(i);
      e.position.x = (r() - 0.5) * 0.08, e.position.z = (r() - 0.5) * 0.08;
    }
  }
  seekTo(e, t, n, s) {
    if (e.position) {
      const i = Math.floor(t * 30) * 2654435769 >>> 0, r = se(i);
      e.position.x = (r() - 0.5) * 0.08, e.position.z = (r() - 0.5) * 0.08;
    }
  }
  checkReset(e, t, n, s) {
    t && !e && n.position && (n.position.x = 0, n.position.z = 0);
  }
  applyReset(e, t) {
    return !1;
  }
}
class fn extends $ {
  constructor() {
    super(), this._baseline = null, this._restorePending = null;
  }
  update(e, t, n, s) {
    const i = s.camera;
    if (!i) return;
    this._baseline || (this._baseline = {
      pos: i.position.clone(),
      quat: i.quaternion.clone()
    });
    const r = this._baseline.pos.length(), o = s.time * n * 0.5;
    i.position.set(Math.sin(o) * r, this._baseline.pos.y, Math.cos(o) * r), i.lookAt(0, 0, 0);
  }
  seekTo(e, t, n, s) {
    const i = s.camera;
    if (!i) return;
    const r = this._baseline ? this._baseline.pos.length() : 5, o = this._baseline ? this._baseline.pos.y : 0.5, a = t * n * 0.5;
    i.position.set(Math.sin(a) * r, o, Math.cos(a) * r), i.lookAt(0, 0, 0);
  }
  checkReset(e, t, n, s) {
    t && !e && this._baseline && (this._restorePending = this._baseline, this._baseline = null), !t && e && (this._restorePending = null);
  }
  /**
   * Restore camera from baseline. Called from update() flow, not from
   * applyReset -- camera restore is handled specially in AnimationEngine.
   * @param {object} camera
   */
  restoreCamera(e) {
    this._restorePending && e && (e.position.copy(this._restorePending.pos), e.quaternion.copy(this._restorePending.quat), this._restorePending = null);
  }
  /** @returns {boolean} Whether a camera restore is pending. */
  get hasRestorePending() {
    return this._restorePending !== null;
  }
  applyReset(e, t) {
    return !1;
  }
  clearReset() {
    this._restorePending = null;
  }
  /** Clear orbit baseline (used by resetToStart). */
  clearBaseline() {
    this._baseline = null;
  }
}
const dn = ["spinX", "spinY", "spinZ", "float", "bounce", "pulse", "shake", "orbit"];
class pn {
  constructor() {
    this.useFadeInOut = !0, this.animationEffects = { ...pt }, this.speed = fe.spinY.defaultSpeed, this.showPhaseDuration = 2e4, this.animationDuration = 2500, this.phaseStartTime = performance.now(), this.time = 0, this.baseRotation = { x: 0, y: 0, z: 0 }, this._effectMap = {
      spinX: new Re("x"),
      spinY: new Re("y"),
      spinZ: new Re("z"),
      float: new on(),
      bounce: new cn(),
      pulse: new hn(),
      shake: new un(),
      orbit: new fn()
    }, this._effectList = dn.map((e) => ({ key: e, effect: this._effectMap[e] })), this._resetTransitions = this._createResetTransitionsProxy(), this._previousEffects = null;
  }
  // Build a proxy object that maps the old _resetTransitions shape to effect internals.
  _createResetTransitionsProxy() {
    const e = this;
    return {
      get x() {
        return e._effectMap.spinX._reset;
      },
      set x(t) {
        e._effectMap.spinX._reset = t;
      },
      get y() {
        return e._effectMap.spinY._reset;
      },
      set y(t) {
        e._effectMap.spinY._reset = t;
      },
      get z() {
        return e._effectMap.spinZ._reset;
      },
      set z(t) {
        e._effectMap.spinZ._reset = t;
      },
      get positionY() {
        return e._effectMap.bounce._reset;
      },
      set positionY(t) {
        e._effectMap.bounce._reset = t;
      },
      get scale() {
        return e._effectMap.pulse._reset;
      },
      set scale(t) {
        e._effectMap.pulse._reset = t;
      }
    };
  }
  // Backward-compatible proxy for orbit baseline
  get _orbitBaseline() {
    return this._effectMap.orbit._baseline;
  }
  set _orbitBaseline(e) {
    this._effectMap.orbit._baseline = e;
  }
  get _orbitRestorePending() {
    return this._effectMap.orbit._restorePending;
  }
  set _orbitRestorePending(e) {
    this._effectMap.orbit._restorePending = e;
  }
  setFadeOptions(e = {}) {
    if (typeof e.useFadeInOut == "boolean" && (this.useFadeInOut = e.useFadeInOut), e.animationEffects && typeof e.animationEffects == "object" && (this.animationEffects = { ...this.animationEffects, ...e.animationEffects }), typeof e.animationSpeed == "number" && (this.speed = Math.max(0.01, e.animationSpeed)), typeof e.showPhaseDuration == "number" && (this.showPhaseDuration = e.showPhaseDuration), typeof e.animationDuration == "number" && (this.animationDuration = e.animationDuration), e.animationPreset && fe[e.animationPreset]?.type === "fadeInOut" && (this.useFadeInOut = !0), typeof e.rotateOnShow == "boolean" && e.rotateOnShow && e.showPreset) {
      const t = fe[e.showPreset];
      t?.type === "spin" && (this.animationEffects = { ...this.animationEffects, [e.showPreset]: !0 }), t?.type === "float" && (this.animationEffects = { ...this.animationEffects, float: !0 });
    }
  }
  setBaseRotation(e) {
    this.baseRotation = { ...e };
  }
  applyEffects(e, t, n) {
    if (!e) return;
    const s = this.animationEffects;
    (s.float || s.bounce || s.pulse || s.shake || s.orbit) && (this.time += t);
    const i = {
      time: this.time,
      animationEffects: s,
      camera: n || null
    };
    for (const { key: r, effect: o } of this._effectList)
      s[r] && o.update(e, t, this.speed, i);
  }
  // Detect which axes just lost their driving animation and start lerps for them.
  _checkForResets(e) {
    if (!e) return;
    const t = this._previousEffects, n = this.animationEffects, s = { animationEffects: n };
    for (const { key: i, effect: r } of this._effectList)
      r.checkReset(n[i], t[i], e, s);
  }
  // Advance all active lerps and write corrected rotation values.
  _applyResetTransitions(e, t) {
    if (e)
      for (const { effect: n } of this._effectList)
        n.applyReset(e, t);
  }
  _clearResetTransitions() {
    for (const { effect: e } of this._effectList)
      e.clearReset();
  }
  update(e, t, n = 1 / 60, s) {
    if (this._previousEffects === null && (this._previousEffects = { ...this.animationEffects }), this._checkForResets(e), this._effectMap.orbit.restoreCamera(s), this._previousEffects = { ...this.animationEffects }, !this.useFadeInOut) {
      t.getAnimationPhase() !== "show" && t.startAnimation("show"), this.applyEffects(e, n, s), this._applyResetTransitions(e, n);
      return;
    }
    const i = performance.now(), r = t.getAnimationPhase();
    r === "fadeIn" && t.isAnimationComplete() ? (t.startAnimation("show"), this.phaseStartTime = i) : r === "show" ? (this.applyEffects(e, n, s), this._applyResetTransitions(e, n), i - this.phaseStartTime >= this.showPhaseDuration && t.startAnimation("fadeOut")) : r === "fadeOut" && (this.applyEffects(e, n, s), this._applyResetTransitions(e, n), t.isAnimationComplete() && t.startAnimation("fadeIn"));
  }
  getLoopDurationMs() {
    return this.useFadeInOut ? this.animationDuration * 2 + this.showPhaseDuration : Math.round(2 * Math.PI / this.speed * 1e3);
  }
  resetToStart() {
    this.time = 0, this.phaseStartTime = 0, this._clearResetTransitions(), this._effectMap.orbit.clearBaseline();
  }
  // Apply the animation state for an absolute position within the loop.
  // Sets model rotation from t=0 and configures effect phase/progress.
  // Safe to call with a paused renderer loop.
  seekTo(e, t, n, s) {
    this._clearResetTransitions();
    const i = e / 1e3;
    if (this.time = i, t) {
      t.rotation.set(0, 0, 0), t.position && (t.position.x = 0, t.position.y = 0, t.position.z = 0), t.scale?.setScalar && t.scale.setScalar(1);
      const r = this.animationEffects;
      let o = i;
      if (this.useFadeInOut) {
        const c = this.animationDuration / 1e3;
        i < c ? o = 0 : o = i - c;
      }
      const a = {
        time: o,
        animationEffects: r,
        camera: s || null
      };
      for (const { key: c, effect: l } of this._effectList)
        c !== "orbit" && r[c] && l.seekTo(t, o, this.speed, a);
    }
    if (this.animationEffects.orbit && s) {
      const r = {
        time: i,
        animationEffects: this.animationEffects,
        camera: s
      };
      this._effectMap.orbit.seekTo(null, i, this.speed, r);
    }
    if (n)
      if (this.useFadeInOut) {
        const r = this.animationDuration, o = this.showPhaseDuration, a = e;
        a < r ? n.setPhaseProgress("fadeIn", a / r) : a < r + o ? n.setPhaseProgress("show", 1) : n.setPhaseProgress("fadeOut", (a - r - o) / r);
      } else
        n.setPhaseProgress("show", 1);
  }
}
function mn(u, e) {
  if (e >= 1) return u;
  if (u.startsWith("#")) {
    const t = parseInt(u.slice(1, 3), 16), n = parseInt(u.slice(3, 5), 16), s = parseInt(u.slice(5, 7), 16);
    return `rgba(${t},${n},${s},${e})`;
  }
  return u.startsWith("rgb(") ? u.replace("rgb(", "rgba(").replace(")", `,${e})`) : u;
}
class gn extends Y {
  constructor(e = {}) {
    super({
      pixelSize: 3,
      minBrightness: 0.05,
      invert: !1,
      backgroundColor: "transparent",
      ...e
    }), this._bitmapCanvas = document.createElement("canvas"), this._bitmapCanvas.style.display = "block", this._bitmapCtx = this._bitmapCanvas.getContext("2d"), this._lastFillStyle = null;
  }
  get canvas() {
    return this._bitmapCanvas;
  }
  init(e, t) {
    this.setSize(e, t);
  }
  setSize(e, t) {
    this._bitmapCanvas && (this._bitmapCanvas.width = Math.max(1, Math.floor(e)), this._bitmapCanvas.height = Math.max(1, Math.floor(t)));
  }
  beginFrame(e) {
    this._bitmapCtx && (this._lastFillStyle = null, e !== "transparent" ? (this._bitmapCtx.fillStyle = e, this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)) : this._bitmapCtx.clearRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height));
  }
  endFrame() {
  }
  shouldDraw(e) {
    return e > this.options.minBrightness;
  }
  drawPixel(e, t, n, s, i = 1) {
    if (!this._bitmapCtx) return;
    const r = i < 1 ? mn(s, i) : s;
    r !== this._lastFillStyle && (this._bitmapCtx.fillStyle = r, this._lastFillStyle = r), this._bitmapCtx.fillRect(e, t, this.options.pixelSize, this.options.pixelSize);
  }
  render(e, t, n, s) {
    const { pixelSize: i, minBrightness: r, invert: o } = this.options;
    for (let a = 0; a < n; a++)
      for (let c = 0; c < t; c++) {
        const l = (a * t + c) * 4, h = e[l], f = e[l + 1], d = e[l + 2];
        if (e[l + 3] === 0) continue;
        const p = (0.3 * h + 0.59 * f + 0.11 * d) / 255;
        if (p < r) continue;
        const m = o ? 1 - p : p;
        if (!this.shouldDraw(m)) continue;
        const _ = s(m);
        this.drawPixel(c * i, a * i, m, _, 1);
      }
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
const Qe = {
  classic: " .:-=+*#%@",
  blocks: " ░▒▓█",
  dense: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  minimal: " .+#"
}, _n = "Menlo, Monaco, Consolas, monospace";
class bn extends Y {
  constructor(e = {}) {
    super({
      pixelSize: 3,
      minBrightness: 0.05,
      invert: !1,
      backgroundColor: "#0a0a0a",
      charRamp: "classic",
      asciiColored: !1,
      ...e
    }), this._bitmapCanvas = document.createElement("canvas"), this._bitmapCanvas.style.display = "block", this._bitmapCtx = this._bitmapCanvas.getContext("2d"), this._dirty = !0, this._rampChars = [], this._rampLen = 0, this._fontStr = "", this._cellW = 0, this._cellH = 0, this._xOffset = 0, this._lastFill = null, this._lastGridW = 0, this._lastGridH = 0;
  }
  get canvas() {
    return this._bitmapCanvas;
  }
  init(e, t) {
    this.setSize(e, t);
  }
  setSize(e, t) {
    this._bitmapCanvas && (this._bitmapCanvas.width = Math.max(1, Math.floor(e)), this._bitmapCanvas.height = Math.max(1, Math.floor(t)), this._dirty = !0);
  }
  updateOptions(e) {
    const t = this.options.charRamp, n = this.options.pixelSize;
    super.updateOptions(e), (e.charRamp !== void 0 && e.charRamp !== t || e.pixelSize !== void 0 && e.pixelSize !== n) && (this._dirty = !0);
  }
  beginFrame(e) {
    this._bitmapCtx && (e === "transparent" ? this._bitmapCtx.clearRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height) : (this._bitmapCtx.fillStyle = e, this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)), this._lastFill = null);
  }
  endFrame() {
  }
  shouldDraw(e) {
    return e > this.options.minBrightness;
  }
  /**
   * Recompute derived state: ramp chars, font string, cell dimensions, glyph centering offset.
   * Called lazily before the first draw each frame.
   */
  _prepare(e, t) {
    const n = Qe[this.options.charRamp] ?? Qe.classic;
    this._rampChars = Array.from(n), this._rampLen = this._rampChars.length, this._cellW = this._bitmapCanvas.width / e, this._cellH = this._bitmapCanvas.height / t;
    const s = Math.max(6, Math.floor(this._cellH));
    this._fontStr = `${s}px ${_n}`;
    const i = this._bitmapCtx;
    i.font = this._fontStr, i.textBaseline = "top", i.textAlign = "left";
    const r = i.measureText("M");
    this._xOffset = Math.max(0, (this._cellW - r.width) * 0.5), this._lastGridW = e, this._lastGridH = t, this._dirty = !1, this._lastFill = null;
  }
  _glyphFor(e) {
    const t = this.options.invert ? 1 - e : e, n = Math.min(Math.round(t * (this._rampLen - 1)), this._rampLen - 1), s = this._rampChars[n];
    return s === " " ? null : s;
  }
  /**
   * Draw a single character during fade animations.
   * x/y are pre-multiplied canvas coordinates (gx * pixelSize, gy * pixelSize).
   * Snap back to cell grid to prevent jitter when pixelSize != cellSize.
   */
  drawPixel(e, t, n, s, i = 1) {
    if (!this._bitmapCtx) return;
    if ((this._dirty || this._cellW === 0) && this._bitmapCanvas.width > 0) {
      const { pixelSize: g } = this.options, p = Math.max(1, Math.floor(this._bitmapCanvas.width / g)), m = Math.max(1, Math.floor(this._bitmapCanvas.height / g));
      this._prepare(p, m);
    }
    if (this._cellW === 0 || this._cellH === 0) return;
    const r = this._glyphFor(n);
    if (!r) return;
    const o = this._bitmapCtx, { pixelSize: a, asciiColored: c, colors: l } = this.options, h = Math.round(e / a), f = Math.round(t / a);
    this._fontStr && (o.font = this._fontStr, o.textBaseline = "top", o.textAlign = "left");
    const d = c ? s : l?.[l.length - 1] ?? s;
    i < 1 && (o.globalAlpha = i), o.fillStyle = d, o.fillText(r, h * this._cellW + this._xOffset, f * this._cellH), i < 1 && (o.globalAlpha = 1);
  }
  render(e, t, n, s) {
    if (!this._bitmapCtx || t === 0 || n === 0) return;
    (this._dirty || t !== this._lastGridW || n !== this._lastGridH) && this._prepare(t, n);
    const { minBrightness: i, invert: r, asciiColored: o } = this.options, a = this._bitmapCtx;
    a.font = this._fontStr, a.textBaseline = "top", a.textAlign = "left";
    for (let c = 0; c < n; c++)
      for (let l = 0; l < t; l++) {
        const h = (c * t + l) * 4, f = e[h], d = e[h + 1], g = e[h + 2];
        if (e[h + 3] === 0) continue;
        const m = (0.2126 * f + 0.7152 * d + 0.0722 * g) / 255;
        if (m < i) continue;
        const _ = r ? 1 - m : m, x = Math.min(Math.round(_ * (this._rampLen - 1)), this._rampLen - 1), T = this._rampChars[x];
        if (T === " ") continue;
        const b = s(o ? _ : 1);
        b !== this._lastFill && (a.fillStyle = b, this._lastFill = b), a.fillText(T, l * this._cellW + this._xOffset, c * this._cellH);
      }
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
const xn = Math.PI / 180;
class yn extends Y {
  constructor(e = {}) {
    super({
      pixelSize: 6,
      minBrightness: 0.05,
      invert: !1,
      backgroundColor: "transparent",
      halftoneDotShape: "circle",
      // 'circle' | 'diamond'
      halftoneAngle: 0,
      // degrees, normalized to [0, 180) on use
      ...e
    }), this._bitmapCanvas = document.createElement("canvas"), this._bitmapCanvas.style.display = "block", this._bitmapCtx = this._bitmapCanvas.getContext("2d");
  }
  get canvas() {
    return this._bitmapCanvas;
  }
  init(e, t) {
    this.setSize(e, t);
  }
  setSize(e, t) {
    this._bitmapCanvas && (this._bitmapCanvas.width = Math.max(1, Math.floor(e)), this._bitmapCanvas.height = Math.max(1, Math.floor(t)));
  }
  beginFrame(e) {
    this._bitmapCtx && (e !== "transparent" ? (this._bitmapCtx.fillStyle = e, this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)) : this._bitmapCtx.clearRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height));
  }
  endFrame() {
  }
  shouldDraw(e) {
    return e > (this.options.minBrightness ?? 0.05);
  }
  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  /** Draw a circle or diamond centered at (cx, cy) with given radius. */
  _drawDot(e, t, n, s) {
    s < 0.5 || (this.options.halftoneDotShape === "diamond" ? (e.save(), e.translate(t, n), e.rotate(Math.PI / 4), e.fillRect(-s, -s, s * 2, s * 2), e.restore()) : (e.beginPath(), e.arc(t, n, s, 0, Math.PI * 2), e.fill()));
  }
  /** Normalize angle to [0, 180) degrees and convert to radians. */
  _normalizeRad(e) {
    return (e % 180 + 180) % 180 * xn;
  }
  // ---------------------------------------------------------------------------
  // Public render / drawPixel
  // ---------------------------------------------------------------------------
  render(e, t, n, s) {
    const i = this._bitmapCtx;
    if (!i) return;
    const { pixelSize: r, minBrightness: o, invert: a, halftoneAngle: c } = this.options, l = r, h = l * 0.5 * 0.95, f = 0.5, d = this._normalizeRad(c), g = d !== 0;
    g && (i.save(), i.translate(this._bitmapCanvas.width / 2, this._bitmapCanvas.height / 2), i.rotate(d), i.translate(-this._bitmapCanvas.width / 2, -this._bitmapCanvas.height / 2));
    let p = null;
    for (let m = 0; m < n; m++)
      for (let _ = 0; _ < t; _++) {
        const x = (m * t + _) * 4, T = e[x], b = e[x + 1], R = e[x + 2];
        if (e[x + 3] === 0) continue;
        const w = (0.2126 * T + 0.7152 * b + 0.0722 * R) / 255;
        if (w < o) continue;
        const v = a ? 1 - w : w, C = (1 - v) * h;
        if (C < f) continue;
        const A = Math.min(h, C), E = _ * l + l / 2, L = m * l + l / 2, I = s(v);
        I !== p && (i.fillStyle = I, p = I), this._drawDot(i, E, L, A);
      }
    g && i.restore();
  }
  /**
   * Draw a single dot during fade animations.
   * x/y arrive as (gx * pixelSize, gy * pixelSize) from BitmapEffect.initializeParticles.
   * We recover the grid cell, compute the rotated dot center to match render(), and draw.
   */
  drawPixel(e, t, n, s, i = 1) {
    const r = this._bitmapCtx;
    if (!r) return;
    const { pixelSize: o, halftoneAngle: a } = this.options, c = o, l = c * 0.5 * 0.95, h = 0.5, f = (1 - n) * l;
    if (f < h) return;
    const d = Math.min(l, f), g = Math.round(e / o), p = Math.round(t / o);
    let m = g * c + c / 2, _ = p * c + c / 2;
    if (a !== 0) {
      const b = this._normalizeRad(a), R = Math.cos(b), y = Math.sin(b), w = this._bitmapCanvas.width, v = this._bitmapCanvas.height, C = m - w / 2, A = _ - v / 2;
      m = w / 2 + C * R - A * y, _ = v / 2 + C * y + A * R;
    }
    const x = r.globalAlpha, T = r.fillStyle;
    i < 1 && (r.globalAlpha = i), r.fillStyle = s, this._drawDot(r, m, _, d), r.globalAlpha = x, r.fillStyle = T;
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class Tn extends Y {
  constructor(e = {}) {
    super({
      pixelSize: 8,
      ledGap: 1,
      ledShape: "circle",
      minBrightness: 0.05,
      invert: !1,
      backgroundColor: "#111111",
      ...e
    }), this._bitmapCanvas = document.createElement("canvas"), this._bitmapCanvas.style.display = "block", this._bitmapCtx = this._bitmapCanvas.getContext("2d"), this._hasRoundRect = typeof this._bitmapCtx?.roundRect == "function";
  }
  get canvas() {
    return this._bitmapCanvas;
  }
  init(e, t) {
    this.setSize(e, t);
  }
  setSize(e, t) {
    this._bitmapCanvas && (this._bitmapCanvas.width = Math.max(1, Math.floor(e)), this._bitmapCanvas.height = Math.max(1, Math.floor(t)));
  }
  beginFrame(e) {
    if (!this._bitmapCtx) return;
    const t = !e || e === "transparent" ? "#111111" : e;
    this._bitmapCtx.fillStyle = t, this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height);
  }
  endFrame() {
  }
  shouldDraw(e) {
    return e > (this.options.minBrightness ?? 0.05);
  }
  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------
  /**
   * Draw a single LED element at (cx, cy) with the given half-size.
   * Uses roundRect when available, otherwise falls back to arcs.
   */
  _drawLed(e, t, n, s) {
    const i = t - s, r = n - s, o = s * 2;
    if (this.options.ledShape === "roundRect") {
      const a = s * 0.35;
      if (this._hasRoundRect)
        e.beginPath(), e.roundRect(i, r, o, o, a), e.fill();
      else {
        const c = Math.min(a, s);
        e.beginPath(), e.moveTo(i + c, r), e.lineTo(i + o - c, r), e.arcTo(i + o, r, i + o, r + c, c), e.lineTo(i + o, r + o - c), e.arcTo(i + o, r + o, i + o - c, r + o, c), e.lineTo(i + c, r + o), e.arcTo(i, r + o, i, r + o - c, c), e.lineTo(i, r + c), e.arcTo(i, r, i + c, r, c), e.closePath(), e.fill();
      }
    } else
      e.beginPath(), e.arc(t, n, s, 0, Math.PI * 2), e.fill();
  }
  // ---------------------------------------------------------------------------
  // Public render / drawPixel
  // ---------------------------------------------------------------------------
  render(e, t, n, s) {
    const i = this._bitmapCtx;
    if (!i) return;
    const { pixelSize: r, ledGap: o, minBrightness: a, invert: c } = this.options, h = Math.max(1, r - o) / 2;
    let f = null;
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = (d * t + g) * 4, m = e[p], _ = e[p + 1], x = e[p + 2], T = e[p + 3];
        if (T === 0) continue;
        const R = (0.2126 * m + 0.7152 * _ + 0.0722 * x) / 255 * (T / 255);
        if (R < a) continue;
        const y = c ? 1 - R : R, w = g * r + r / 2, v = d * r + r / 2, C = s(y);
        C !== f && (i.fillStyle = C, f = C), this._drawLed(i, w, v, h);
      }
  }
  /**
   * Draw a single LED during fade animations.
   * x/y arrive as (gx * pixelSize, gy * pixelSize) from BitmapEffect.initializeParticles.
   * We snap to the nearest grid-cell center (intentional LED grid aesthetic).
   * Glow is intentionally skipped here for performance — particles are short-lived.
   */
  drawPixel(e, t, n, s, i = 1) {
    const r = this._bitmapCtx;
    if (!r) return;
    const { pixelSize: o, ledGap: a } = this.options, l = Math.max(1, o - a) / 2, h = Math.round(e / o), f = Math.round(t / o), d = h * o + o / 2, g = f * o + o / 2, p = r.globalAlpha, m = r.fillStyle;
    i < 1 && (r.globalAlpha = i), r.fillStyle = s, this._drawLed(r, d, g, l), r.globalAlpha = p, r.fillStyle = m;
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class wn extends Y {
  constructor(e = {}) {
    super({
      pixelSize: 6,
      minBrightness: 0.05,
      invert: !1,
      backgroundColor: "#f5f0e8",
      // warm paper/canvas default
      stippleDotSize: 2,
      stippleDensity: 3,
      seed: null,
      ...e
    }), this._bitmapCanvas = document.createElement("canvas"), this._bitmapCanvas.style.display = "block", this._bitmapCtx = this._bitmapCanvas.getContext("2d");
  }
  get canvas() {
    return this._bitmapCanvas;
  }
  init(e, t) {
    this.setSize(e, t);
  }
  setSize(e, t) {
    this._bitmapCanvas && (this._bitmapCanvas.width = Math.max(1, Math.floor(e)), this._bitmapCanvas.height = Math.max(1, Math.floor(t)));
  }
  beginFrame(e) {
    this._bitmapCtx && (e === "transparent" ? this._bitmapCtx.clearRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height) : (this._bitmapCtx.fillStyle = e, this._bitmapCtx.fillRect(0, 0, this._bitmapCanvas.width, this._bitmapCanvas.height)));
  }
  endFrame() {
  }
  shouldDraw(e) {
    return e > this.options.minBrightness;
  }
  render(e, t, n, s) {
    if (!this._bitmapCtx || t === 0 || n === 0) return;
    const { pixelSize: i, minBrightness: r, invert: o, stippleDotSize: a, stippleDensity: c, seed: l } = this.options, h = se(l ?? 305419896), f = this._bitmapCtx;
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = (d * t + g) * 4, m = e[p], _ = e[p + 1], x = e[p + 2];
        if (e[p + 3] === 0) continue;
        const b = (0.2126 * m + 0.7152 * _ + 0.0722 * x) / 255;
        if (b < r) continue;
        const R = o ? 1 - b : b, y = (1 - R) * c, w = Math.max(0, Math.round(y));
        if (w === 0) continue;
        const v = s(R);
        f.fillStyle = v;
        const C = g * i, A = d * i;
        for (let E = 0; E < w; E++) {
          const L = C + h() * i, I = A + h() * i, K = a * (0.6 + h() * 0.4);
          f.beginPath(), f.arc(L, I, K, 0, Math.PI * 2), f.fill();
        }
      }
  }
  /**
   * Draw a single dot during fade animations.
   * x/y are canvas coordinates (gx * pixelSize, gy * pixelSize).
   * Uses a position-derived seed so the dot stays stable across frames.
   */
  drawPixel(e, t, n, s, i = 1) {
    if (!this._bitmapCtx) return;
    const { stippleDotSize: r, seed: o, pixelSize: a } = this.options, c = ((o ?? 305419896) ^ (e * 73856093 >>> 0 ^ t * 19349663 >>> 0)) >>> 0, l = se(c), h = this._bitmapCtx, f = r * (0.6 + l() * 0.4), d = e + a * 0.5, g = t + a * 0.5;
    i < 1 && (h.globalAlpha = i), h.fillStyle = s, h.beginPath(), h.arc(d, g, f, 0, Math.PI * 2), h.fill(), i < 1 && (h.globalAlpha = 1);
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class Rn {
  constructor() {
    this._renderers = /* @__PURE__ */ new Map(), this._postEffects = /* @__PURE__ */ new Map(), this._registered = !1;
  }
  /**
   * Register a renderer plugin.
   * @param {string} id - unique mode key (e.g. 'bitmap', 'myCustomRenderer')
   * @param {Function} RendererClass - constructor that extends BaseRenderer
   * @param {{ label?: string, schema?: object }} [options]
   * @throws {Error} if id is already registered
   */
  registerRenderer(e, t, { label: n, schema: s = {} } = {}) {
    if (this._renderers.has(e)) throw new Error(`Renderer "${e}" already registered`);
    this._renderers.set(e, { RendererClass: t, schema: s, label: n ?? e });
  }
  /**
   * Register a post-processing effect plugin.
   * @param {string} id - unique effect key (e.g. 'bloom', 'myEffect')
   * @param {Function} EffectClass - class with apply(ctx, width, height, params)
   * @param {{ label?: string, schema?: object }} [options]
   * @throws {Error} if id is already registered
   */
  registerPostEffect(e, t, { label: n, schema: s = {} } = {}) {
    if (this._postEffects.has(e)) throw new Error(`PostEffect "${e}" already registered`);
    this._postEffects.set(e, { EffectClass: t, schema: s, label: n ?? e });
  }
  /**
   * Look up a renderer registration by id.
   * @param {string} id
   * @returns {{ RendererClass: Function, schema: object, label: string } | undefined}
   */
  getRenderer(e) {
    return this._renderers.get(e);
  }
  /**
   * Look up a post-effect registration by id.
   * @param {string} id
   * @returns {{ EffectClass: Function, schema: object, label: string } | undefined}
   */
  getPostEffect(e) {
    return this._postEffects.get(e);
  }
  /**
   * List all registered renderers.
   * @returns {Array<{ id: string, label: string, schema: object }>}
   */
  listRenderers() {
    return [...this._renderers.entries()].map(([e, t]) => ({ id: e, label: t.label, schema: t.schema }));
  }
  /**
   * List all registered post-effects.
   * @returns {Array<{ id: string, label: string, schema: object }>}
   */
  listPostEffects() {
    return [...this._postEffects.entries()].map(([e, t]) => ({ id: e, label: t.label, schema: t.schema }));
  }
}
const Sn = new Rn(), et = {
  bitmap: ht,
  pixelArt: gn,
  ascii: bn,
  halftone: yn,
  ledMatrix: Tn,
  stipple: wn
};
function Mn(u, e = {}) {
  const t = et[u];
  if (t) return new t(e);
  const n = Sn.getRenderer(u);
  if (n) return new n.RendererClass(e);
  throw new Error(`Unknown render mode: "${u}". Valid modes: ${Object.keys(et).join(", ")}`);
}
const mt = {
  cube: { size: 1 },
  sphere: { radius: 1, widthSegments: 32, heightSegments: 32 },
  torus: { radius: 0.8, tube: 0.3, radialSegments: 16, tubularSegments: 100 },
  cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1.5, radialSegments: 32 },
  cone: { radius: 0.8, height: 1.5, radialSegments: 32 },
  icosahedron: { radius: 1, detail: 0 },
  torusKnot: { radius: 0.7, tube: 0.2, tubularSegments: 100, radialSegments: 16 },
  plane: { width: 2, height: 2 }
};
function Cn(u, e) {
  const t = { ...mt[u], ...e };
  switch (u) {
    case "cube":
      return new S.BoxGeometry(t.size, t.size, t.size);
    case "sphere":
      return new S.SphereGeometry(t.radius, t.widthSegments, t.heightSegments);
    case "torus":
      return new S.TorusGeometry(t.radius, t.tube, t.radialSegments, t.tubularSegments);
    case "cylinder":
      return new S.CylinderGeometry(t.radiusTop, t.radiusBottom, t.height, t.radialSegments);
    case "cone":
      return new S.ConeGeometry(t.radius, t.height, t.radialSegments);
    case "icosahedron":
      return new S.IcosahedronGeometry(t.radius, t.detail);
    case "torusKnot":
      return new S.TorusKnotGeometry(t.radius, t.tube, t.tubularSegments, t.radialSegments);
    case "plane":
      return new S.PlaneGeometry(t.width, t.height);
    default:
      throw new Error(`Unknown shape: "${u}". Valid types: ${vn().join(", ")}`);
  }
}
function En(u, e = {}) {
  const t = Cn(u, e), n = new S.MeshStandardMaterial({ color: 16777215 }), s = new S.Mesh(t, n), i = new S.Group();
  return i.add(s), i;
}
function vn() {
  return Object.keys(mt);
}
class An extends Yt {
  /**
   * Constructs a new text geometry.
   *
   * @param {string} text - The text that should be transformed into a geometry.
   * @param {TextGeometry~Options} [parameters] - The text settings.
   */
  constructor(e, t = {}) {
    const n = t.font;
    if (n === void 0)
      super();
    else {
      const s = n.generateShapes(e, t.size, t.direction);
      t.depth === void 0 && (t.depth = 50), t.bevelThickness === void 0 && (t.bevelThickness = 10), t.bevelSize === void 0 && (t.bevelSize = 8), t.bevelEnabled === void 0 && (t.bevelEnabled = !1), super(s, t);
    }
    this.type = "TextGeometry";
  }
}
class Ln extends pe {
  /**
   * Constructs a new font loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(e) {
    super(e);
  }
  /**
   * Starts loading from the given URL and passes the loaded font
   * to the `onLoad()` callback.
   *
   * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
   * @param {function(Font)} onLoad - Executed when the loading process has been finished.
   * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
   * @param {onErrorCallback} onError - Executed when errors occur.
   */
  load(e, t, n, s) {
    const i = this, r = new ne(this.manager);
    r.setPath(this.path), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, function(o) {
      const a = i.parse(JSON.parse(o));
      t && t(a);
    }, n, s);
  }
  /**
   * Parses the given font data and returns the resulting font.
   *
   * @param {Object} json - The raw font data as a JSON object.
   * @return {Font} The font.
   */
  parse(e) {
    return new In(e);
  }
}
class In {
  /**
   * Constructs a new font.
   *
   * @param {Object} data - The font data as JSON.
   */
  constructor(e) {
    this.isFont = !0, this.type = "Font", this.data = e;
  }
  /**
   * Generates geometry shapes from the given text and size. The result of this method
   * should be used with {@link ShapeGeometry} to generate the actual geometry data.
   *
   * @param {string} text - The text.
   * @param {number} [size=100] - The text size.
   * @param {string} [direction='ltr'] - Char direction: ltr(left to right), rtl(right to left) & tb(top bottom).
   * @return {Array<Shape>} An array of shapes representing the text.
   */
  generateShapes(e, t = 100, n = "ltr") {
    const s = [], i = Fn(e, t, this.data, n);
    for (let r = 0, o = i.length; r < o; r++)
      s.push(...i[r].toShapes());
    return s;
  }
}
function Fn(u, e, t, n) {
  const s = Array.from(u), i = e / t.resolution, r = (t.boundingBox.yMax - t.boundingBox.yMin + t.underlineThickness) * i, o = [];
  let a = 0, c = 0;
  (n == "rtl" || n == "tb") && s.reverse();
  for (let l = 0; l < s.length; l++) {
    const h = s[l];
    if (h === `
`)
      a = 0, c -= r;
    else {
      const f = On(h, i, a, c, t);
      n == "tb" ? (a = 0, c += t.ascender * i) : a += f.offsetX, o.push(f.path);
    }
  }
  return o;
}
function On(u, e, t, n, s) {
  const i = s.glyphs[u] || s.glyphs["?"];
  if (!i) {
    console.error('THREE.Font: character "' + u + '" does not exists in font family ' + s.familyName + ".");
    return;
  }
  const r = new $t();
  let o, a, c, l, h, f, d, g;
  if (i.o) {
    const p = i._cachedOutline || (i._cachedOutline = i.o.split(" "));
    for (let m = 0, _ = p.length; m < _; )
      switch (p[m++]) {
        case "m":
          o = p[m++] * e + t, a = p[m++] * e + n, r.moveTo(o, a);
          break;
        case "l":
          o = p[m++] * e + t, a = p[m++] * e + n, r.lineTo(o, a);
          break;
        case "q":
          c = p[m++] * e + t, l = p[m++] * e + n, h = p[m++] * e + t, f = p[m++] * e + n, r.quadraticCurveTo(h, f, c, l);
          break;
        case "b":
          c = p[m++] * e + t, l = p[m++] * e + n, h = p[m++] * e + t, f = p[m++] * e + n, d = p[m++] * e + t, g = p[m++] * e + n, r.bezierCurveTo(h, f, d, g, c, l);
          break;
      }
  }
  return { offsetX: i.ha * e, path: r };
}
const tt = {
  helvetiker: () => import("./helvetiker_regular.typeface-DkohR1w2.js"),
  helvetikerBold: () => import("./helvetiker_bold.typeface-Dpdv0pBL.js"),
  optimer: () => import("./optimer_regular.typeface-BwmB6JhU.js"),
  optimerBold: () => import("./optimer_bold.typeface-DdbaUQRb.js"),
  gentilis: () => import("./gentilis_regular.typeface-D0DjsepO.js"),
  gentilisBold: () => import("./gentilis_bold.typeface-6e94SVPf.js"),
  droidSans: () => import("./droid_sans_regular.typeface-Bs81qZjP.js"),
  droidSansBold: () => import("./droid_sans_bold.typeface-CSkX9gkA.js"),
  droidSerif: () => import("./droid_serif_regular.typeface-fxu4RfN8.js"),
  droidMono: () => import("./droid_sans_mono_regular.typeface-Bk29f_ZW.js")
}, Pn = new Ln(), Se = /* @__PURE__ */ new Map();
async function Nn(u) {
  if (Se.has(u)) return Se.get(u);
  const e = tt[u] ?? tt.helvetiker, { default: t } = await e(), n = Pn.parse(t);
  return Se.set(u, n), n;
}
async function Dn(u, e = {}) {
  const { fontFamily: t = "helvetiker", fontSize: n = 1, extrudeDepth: s = 0.3, bevelEnabled: i = !0 } = e, r = await Nn(t), o = new An(u || "Text", {
    font: r,
    size: n,
    depth: s,
    bevelEnabled: i,
    bevelThickness: 0.05 * n,
    bevelSize: 0.03 * n,
    bevelSegments: 3
  });
  o.computeBoundingBox(), o.center();
  const a = new S.MeshStandardMaterial({ color: 16777215 }), c = new S.Mesh(o, a), l = new S.Group();
  return l.add(c), l;
}
function kn(u) {
  return new Promise((e, t) => {
    const n = u.type === "image/svg+xml" || u.name.toLowerCase().endsWith(".svg"), s = URL.createObjectURL(u);
    if (n) {
      const i = new Image();
      i.onload = () => {
        const r = Math.min(i.naturalWidth || 512, 2048), o = Math.min(i.naturalHeight || 512, 2048), a = document.createElement("canvas");
        a.width = r, a.height = o, a.getContext("2d").drawImage(i, 0, 0, r, o), URL.revokeObjectURL(s), e({ element: a, width: r, height: o, objectUrl: null });
      }, i.onerror = () => {
        URL.revokeObjectURL(s), t(new Error("Failed to load SVG"));
      }, i.src = s;
    } else {
      const i = new Image();
      i.onload = () => {
        e({ element: i, width: i.naturalWidth, height: i.naturalHeight, objectUrl: s });
      }, i.onerror = () => {
        URL.revokeObjectURL(s), t(new Error("Failed to load image"));
      }, i.src = s;
    }
  });
}
async function jn(u) {
  const { element: e, width: t, height: n, objectUrl: s } = await kn(u), i = new S.Texture(e);
  i.needsUpdate = !0;
  const r = t / n, o = r >= 1 ? 2 : 2 * r, a = r >= 1 ? 2 / r : 2, c = new S.PlaneGeometry(o, a), l = new S.MeshBasicMaterial({ map: i, side: S.DoubleSide }), h = new S.Mesh(c, l), f = new S.Group();
  return f.add(h), { group: f, objectUrl: s };
}
class Un {
  /**
   * @param {HTMLElement} container - DOM element to render into. The effect canvas is appended as a child.
   * @param {object} [effectOptions] - Initial BitmapEffect options (pixelSize, ditherType, colors, backgroundColor, etc.)
   */
  constructor(e, t = {}) {
    this.container = e, this.scene = new S.Scene(), this.camera = new S.PerspectiveCamera(75, 1, 0.1, 1e3), this.camera.position.set(0, 0.5, 5), this.camera.lookAt(0, 0, 0), this.renderer = new S.WebGLRenderer({ antialias: !0, alpha: !0, preserveDrawingBuffer: !0 }), this.renderer.setClearColor(0, 0), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), this.effect = new fs(this.renderer, t), this.container.appendChild(this.effect.domElement), t.backgroundColor && t.backgroundColor !== "transparent" && (this.scene.background = new S.Color(t.backgroundColor)), this.ambientLight = new S.AmbientLight(16777215, 0.15), this.keyLight = new S.DirectionalLight(16777215, 1.5), this.fillLight = new S.DirectionalLight(16777215, 0.4), this.rimLight = new S.DirectionalLight(16777215, 0.8), this.keyLight.position.set(3, 4, 5), this.fillLight.position.set(-4, 2, 3), this.rimLight.position.set(0, 2, -5), this.scene.add(this.ambientLight, this.keyLight, this.fillLight, this.rimLight), this.baseGroup = new S.Group(), this.animGroup = new S.Group(), this.baseGroup.add(this.animGroup), this.scene.add(this.baseGroup), this.animationEngine = new pn(), this.objectGroup = null, this.currentObjectUrl = null, this.lastFrameTime = performance.now(), this._onFrameRendered = null, this._animationLoop = () => {
      const n = performance.now(), s = Math.max(0, Math.min((n - this.lastFrameTime) / 1e3, 0.25));
      this.lastFrameTime = n, this.hasObject() && this.animationEngine.update(this.animGroup, this.effect, s, this.camera), this.effect.render(this.scene, this.camera), this._onFrameRendered?.();
    }, this.renderer.setAnimationLoop(this._animationLoop), this._onContextLost = (n) => {
      n.preventDefault(), this.renderer.setAnimationLoop(null);
    }, this._onContextRestored = () => {
      this.renderer.setAnimationLoop(this._animationLoop);
    }, this.renderer.domElement.addEventListener("webglcontextlost", this._onContextLost), this.renderer.domElement.addEventListener("webglcontextrestored", this._onContextRestored);
  }
  hasObject() {
    return this.objectGroup !== null;
  }
  _setObject(e, t = null) {
    this.disposeModel(), this.objectGroup = e, this.currentObjectUrl = t, this.animGroup.add(e), this.animGroup.rotation.set(0, 0, 0), this.effect.startAnimation("fadeIn");
  }
  async loadModel(e) {
    if (!this._loading) {
      this._loading = !0;
      try {
        const { group: t, objectUrl: n } = await nn(e);
        this._setObject(t, n);
      } finally {
        this._loading = !1;
      }
    }
  }
  loadShape(e, t = {}) {
    this._setObject(En(e, t));
  }
  async loadText(e, t = {}) {
    if (!this._loading) {
      this._loading = !0;
      try {
        const n = await Dn(e, t);
        this._setObject(n);
      } finally {
        this._loading = !1;
      }
    }
  }
  async loadImage(e) {
    if (!this._loading) {
      this._loading = !0;
      try {
        const { group: t, objectUrl: n } = await jn(e);
        this._setObject(t, n);
      } finally {
        this._loading = !1;
      }
    }
  }
  disposeModel() {
    this.objectGroup && (this.animGroup.remove(this.objectGroup), Bn(this.objectGroup), this.objectGroup = null), this.currentObjectUrl && (URL.revokeObjectURL(this.currentObjectUrl), this.currentObjectUrl = null);
  }
  // ---------------------------------------------------------------------------
  // Scene settings
  // ---------------------------------------------------------------------------
  /**
   * Resize the rendering viewport.
   * @param {number} width
   * @param {number} height
   */
  setSize(e, t) {
    const n = Math.max(1, Math.floor(e)), s = Math.max(1, Math.floor(t));
    this.camera.aspect = n / s, this.camera.updateProjectionMatrix(), this.effect.setSize(n, s);
  }
  /**
   * Update bitmap rendering options.
   * @param {object} options
   */
  updateEffectOptions(e) {
    this.effect.updateOptions(e), e.backgroundColor && e.backgroundColor !== "transparent" ? this.scene.background = new S.Color(e.backgroundColor) : e.backgroundColor === "transparent" && (this.scene.background = null);
  }
  /**
   * Update animation behavior.
   * @param {object} options
   */
  updateAnimationOptions(e) {
    this.animationEngine.setFadeOptions({
      useFadeInOut: e.useFadeInOut,
      animationEffects: e.animationEffects,
      animationSpeed: e.animationSpeed,
      showPhaseDuration: e.showPhaseDuration,
      animationDuration: e.animationDuration,
      animationPreset: e.animationPreset,
      rotateOnShow: e.rotateOnShow,
      showPreset: e.showPreset
    });
  }
  /**
   * Move the key directional light to a new position.
   */
  setLightDirection(e, t, n) {
    this.keyLight.position.set(e, t, n);
  }
  /**
   * Apply a base rotation offset to the model pose. Animation plays on top of this.
   */
  setBaseRotation(e, t, n) {
    this.baseGroup.rotation.set(e, t, n);
  }
  /**
   * Uniformly scale the entire model group. Useful when imported models are too
   * small or too large relative to the camera frustum.
   * @param {number} scale - Uniform scale factor (e.g. 0.5 = half size, 2 = double)
   */
  setModelScale(e) {
    this.baseGroup.scale.setScalar(e);
  }
  /**
   * Swap the rendering mode.
   * @param {string} mode
   */
  setRenderMode(e) {
    const t = Mn(e, this.effect.options);
    this.effect.setRenderer(t);
  }
  // ---------------------------------------------------------------------------
  // Export / playback utilities
  // ---------------------------------------------------------------------------
  /**
   * Get the bitmap output canvas element.
   * @returns {HTMLCanvasElement}
   */
  getCanvas() {
    if (!this.effect.bitmapCanvas)
      throw new Error("BitmapEffect canvas not available — was dispose() called?");
    return this.effect.bitmapCanvas;
  }
  /**
   * Get the total duration of one animation loop in milliseconds.
   * @returns {number}
   */
  getLoopDurationMs() {
    return this.animationEngine.getLoopDurationMs();
  }
  /** Pause the live animation loop. */
  pauseLoop() {
    this.renderer.setAnimationLoop(null);
  }
  /** Resume the live animation loop. */
  resumeLoop() {
    this.lastFrameTime = performance.now(), this.renderer.setAnimationLoop(this._animationLoop);
  }
  /** Render a single frame without advancing animation time. */
  renderOnce() {
    this.effect.render(this.scene, this.camera);
  }
  /**
   * Seek the animation to a specific time and render one frame.
   * @param {number} absoluteTimeMs
   */
  renderAtTime(e) {
    this.animationEngine.seekTo(e, this.animGroup, this.effect, this.camera), this.renderOnce();
  }
  /**
   * Register a callback invoked once per animation frame.
   * @param {(() => void) | null} callback
   */
  setOnFrameRendered(e) {
    this._onFrameRendered = e;
  }
  /** Remove the frame-rendered callback. */
  clearOnFrameRendered() {
    this._onFrameRendered = null;
  }
  /**
   * Reset animation to t=0 and render the first frame.
   */
  resetToLoopStart() {
    this.animationEngine.resetToStart(), this.hasObject() && this.animGroup.rotation.set(0, 0, 0), this.camera.position.set(0, 0.5, 5), this.camera.lookAt(0, 0, 0), this.animationEngine.useFadeInOut ? this.effect.startAnimation("fadeIn") : this.effect.startAnimation("show"), this.renderOnce();
  }
  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  /** Alias for dispose(). Provided for npm package consumers. */
  destroy() {
    this.dispose();
  }
  /**
   * Fully dispose the SceneManager: stops the animation loop, disposes the current object,
   * effect, and WebGL renderer, and removes the canvas from the DOM.
   */
  dispose() {
    this.renderer.setAnimationLoop(null), this._onFrameRendered = null, this.renderer.domElement.removeEventListener("webglcontextlost", this._onContextLost), this.renderer.domElement.removeEventListener("webglcontextrestored", this._onContextRestored), this.disposeModel(), this.effect.dispose(), this.renderer.dispose(), this.effect.domElement.parentNode && this.effect.domElement.parentNode.removeChild(this.effect.domElement);
  }
}
function Bn(u) {
  u.traverse((e) => {
    if (e.geometry && e.geometry.dispose?.(), e.material) {
      const t = Array.isArray(e.material) ? e.material : [e.material];
      for (const n of t)
        if (n) {
          for (const s of Object.keys(n)) {
            const i = n[s];
            i && typeof i == "object" && typeof i.dispose == "function" && i.isTexture && i.dispose();
          }
          n.dispose?.();
        }
    }
  });
}
function Gn(u) {
  const e = typeof u == "string" ? JSON.parse(u) : u;
  if (!e || typeof e != "object") throw new Error("Invalid .bforge file");
  if (!e.version) throw new Error("Missing version field in .bforge file");
  const t = e.version === 1 ? Hn(e) : e;
  return {
    settings: t.settings ?? {},
    modelData: t.model ?? null,
    // { name, type, format, data: base64 } | null
    inputType: t.settings?.inputType ?? "model",
    version: t.version
  };
}
function Hn(u) {
  return {
    ...u,
    version: 2,
    settings: {
      useFadeInOut: !1,
      fadeVariant: "bloom",
      animationEffects: {},
      baseRotation: { x: 0, y: 0, z: 0 },
      seed: null,
      ...u.settings
    }
  };
}
const zn = ["src", "autoplay", "loop", "width", "height", "render-mode"];
class Vn extends HTMLElement {
  static get observedAttributes() {
    return zn;
  }
  connectedCallback() {
    this._shadow = this.attachShadow({ mode: "open" });
    const e = document.createElement("style");
    e.textContent = ":host { display: block; } canvas { width: 100%; height: 100%; }", this._container = document.createElement("div"), this._container.style.cssText = "width:100%;height:100%;position:relative;overflow:hidden", this._shadow.append(e, this._container), this._onVisibility = () => {
      document.hidden ? this._manager?.pauseLoop?.() : this._manager?.resumeLoop?.();
    }, document.addEventListener("visibilitychange", this._onVisibility), this._ro = new ResizeObserver(([s]) => {
      const { width: i, height: r } = s.contentRect;
      this._manager?.setSize(i * devicePixelRatio, r * devicePixelRatio);
    }), this._ro.observe(this._container);
    const t = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.hasAttribute("autoplay") && !t ? this._load() : (this._io = new IntersectionObserver(
      ([s]) => {
        s.isIntersecting && !this._manager && !this._loading && this._load(), s.isIntersecting ? this._manager && this._manager?.resumeLoop?.() : this._manager?.pauseLoop?.();
      },
      { rootMargin: "100px" }
    ), this._io.observe(this));
  }
  disconnectedCallback() {
    this._io?.disconnect(), this._ro?.disconnect(), document.removeEventListener("visibilitychange", this._onVisibility), this._manager?.dispose(), this._manager = null;
  }
  attributeChangedCallback(e, t, n) {
    t !== n && (e === "src" && (this._manager?.dispose(), this._manager = null, this._loading = !1, this.isConnected && this._load()), e === "render-mode" && this._manager && this._manager.setRenderMode(n));
  }
  async _load() {
    const e = this.getAttribute("src");
    if (!(!e || this._loading)) {
      this._loading = !0;
      try {
        const t = await fetch(e);
        if (!t.ok) throw new Error(`HTTP ${t.status} fetching ${e}`);
        const n = await t.text(), { settings: s, modelData: i, inputType: r } = Gn(n), o = this._container.clientWidth || 400, a = this._container.clientHeight || 400;
        if (this._manager = new Un(this._container, { ...s }), this._manager.setSize(o * devicePixelRatio, a * devicePixelRatio), r === "model" && i) {
          const l = atob(i.data), h = new Uint8Array(l.length);
          for (let g = 0; g < l.length; g++) h[g] = l.charCodeAt(g);
          const f = new Blob([h], { type: i.type }), d = new File([f], i.name);
          await this._manager.loadModel(d);
        } else r === "shape" ? this._manager.loadShape(s.shapeType, s.shapeParams) : r === "text" ? await this._manager.loadText(s.textContent, {
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          extrudeDepth: s.extrudeDepth,
          bevelEnabled: s.bevelEnabled
        }) : r === "image" && console.warn(
          "[bitmap-forge] Image input type is not supported in embed mode (File objects cannot be serialized in .bforge). Use a shape, text, or 3D model instead."
        );
        const c = this.getAttribute("render-mode") ?? s.renderMode ?? "bitmap";
        this._manager.setRenderMode(c), this._manager.updateAnimationOptions({ ...s }), this._manager.updateEffectOptions({ ...s });
      } catch (t) {
        console.error("[bitmap-forge] Failed to load animation:", t);
      } finally {
        this._loading = !1;
      }
    }
  }
}
function Kn(u = "bitmap-forge") {
  typeof customElements > "u" || customElements.get(u) || customElements.define(u, Vn);
}
typeof customElements < "u" && Kn();
export {
  Vn as BitmapForgeElement,
  Kn as defineBitmapForgeElement
};
