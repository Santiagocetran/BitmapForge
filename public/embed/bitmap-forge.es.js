import * as S from "three";
import { Loader as de, FileLoader as ne, BufferGeometry as te, Color as B, SRGBColorSpace as G, BufferAttribute as Y, Vector3 as N, Float32BufferAttribute as H, TrianglesDrawMode as ut, TriangleFanDrawMode as Se, TriangleStripDrawMode as Ze, LoaderUtils as Q, MeshPhysicalMaterial as k, Vector2 as Je, LinearSRGBColorSpace as U, SpotLight as ft, PointLight as dt, DirectionalLight as pt, Matrix4 as fe, Quaternion as Qe, InstancedMesh as mt, InstancedBufferAttribute as gt, Object3D as et, TextureLoader as _t, ImageBitmapLoader as bt, InterleavedBuffer as xt, InterleavedBufferAttribute as Tt, LinearMipmapLinearFilter as tt, NearestMipmapLinearFilter as yt, LinearMipmapNearestFilter as wt, NearestMipmapNearestFilter as Rt, LinearFilter as Ce, NearestFilter as st, RepeatWrapping as Me, MirroredRepeatWrapping as St, ClampToEdgeWrapping as Ct, PointsMaterial as Z, Material as ee, LineBasicMaterial as ce, MeshStandardMaterial as nt, DoubleSide as Mt, MeshBasicMaterial as J, PropertyBinding as Et, SkinnedMesh as vt, Mesh as Ee, LineSegments as ve, Line as At, LineLoop as Lt, Points as le, Group as he, PerspectiveCamera as It, MathUtils as Ft, OrthographicCamera as Ot, Skeleton as Pt, AnimationClip as Nt, Bone as Dt, InterpolateDiscrete as kt, InterpolateLinear as it, Texture as Ie, VectorKeyframeTrack as Fe, NumberKeyframeTrack as Oe, QuaternionKeyframeTrack as Pe, ColorManagement as Ne, FrontSide as jt, Interpolant as Bt, Box3 as Ut, Sphere as zt, MeshPhongMaterial as Ht, ExtrudeGeometry as Vt, ShapePath as Gt } from "three";
function se(u) {
  let e = u >>> 0 || 1;
  return function() {
    return e = Math.imul(e, 1664525) + 1013904223 >>> 0, e / 4294967296;
  };
}
class Kt {
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
    const s = parseInt(e.slice(1, 3), 16), r = parseInt(e.slice(3, 5), 16), i = parseInt(e.slice(5, 7), 16), o = parseInt(t.slice(1, 3), 16), a = parseInt(t.slice(3, 5), 16), c = parseInt(t.slice(5, 7), 16), l = Math.round(s + (o - s) * n), h = Math.round(r + (a - r) * n), f = Math.round(i + (c - i) * n);
    return `rgb(${l},${h},${f})`;
  }
  _computeColorForBrightness(e) {
    const t = this.options.colors;
    if (!t || t.length === 0) return "#000000";
    if (t.length === 1) return t[0];
    const n = e * (t.length - 1), s = Math.floor(n), r = Math.min(s + 1, t.length - 1), i = n - s;
    return this.lerpColor(t[s], t[r], i);
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
      const n = parseInt(e.slice(1, 3), 16), s = parseInt(e.slice(3, 5), 16), r = parseInt(e.slice(5, 7), 16);
      return `rgba(${n},${s},${r},${t})`;
    }
    return e.startsWith("rgb(") ? e.replace("rgb(", "rgba(").replace(")", `,${t})`) : e;
  }
  initializeParticles(e, t, n, s, r) {
    this.particles = [];
    let i = 0;
    const o = Math.sqrt(this.width * this.width + this.height * this.height) / 2;
    for (let a = 0; a < t; a++)
      for (let c = 0; c < e; c++) {
        const l = (a * e + c) * 4, h = s[l], f = s[l + 1], d = s[l + 2], g = s[l + 3], p = this.getBrightness(h, f, d);
        if (g === 0 || p < this.options.minBrightness) {
          i++;
          continue;
        }
        const m = this.options.invert ? 1 - p : p;
        if (!r(m, c, a)) {
          i++;
          continue;
        }
        const _ = c * n, x = a * n;
        let y, b;
        if (this._rng)
          y = this._rng() * Math.PI * 2, b = 300 + this._rng() * 500;
        else {
          const E = i * 0.1, L = Math.sin(E * 12.9898 + E * 78.233) * 43758.5453, I = L - Math.floor(L);
          y = I * Math.PI * 2, b = 300 + I * 500;
        }
        const R = this.width / 2 + Math.cos(y) * b, T = this.height / 2 + Math.sin(y) * b, w = _ - this.width / 2, v = x - this.height / 2, M = Math.sqrt(w * w + v * v), A = M / o * 0.4;
        this.particles.push({
          idx: i,
          startX: R,
          startY: T,
          finalX: _,
          finalY: x,
          delay: A,
          distFromCenter: M,
          brightness: m,
          color: this.getColorForBrightness(m)
        }), i++;
      }
    this.particlesInitialized = !0;
  }
  dispose() {
    this.particles = [], this.particlesInitialized = !1, this.isAnimating = !1, this.animationProgress = 0;
  }
}
class pe {
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
  initVariantMetadata(e, t, n, s, r, i) {
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
class Xt extends pe {
  initVariantMetadata(e) {
    for (const t of e)
      t.bloomThreshold = 1 - t.brightness;
  }
  getVisiblePixels(e, t, n) {
    const r = [];
    for (const i of e) {
      let o;
      if (n === "fadeIn")
        o = Math.min(1, Math.max(0, (t - i.bloomThreshold + 0.18) / 0.18));
      else if (n === "fadeOut")
        o = Math.min(1, Math.max(0, (i.bloomThreshold - t + 0.18) / 0.18));
      else
        continue;
      o <= 0 || r.push({ x: i.finalX, y: i.finalY, brightness: i.brightness, color: i.color, alpha: o });
    }
    return r;
  }
}
class Yt extends pe {
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(e, t, n, s, r, i) {
    const o = this.options.seed ?? 1, a = 0.4, c = new Float32Array(r);
    for (let l = 0; l < r; l++) {
      const h = Math.sin(l * 127.1 + o * 311.7) * 43758.5453;
      c[l] = (h - Math.floor(h)) * a;
    }
    for (const l of e) {
      const h = Math.floor(l.finalX / s);
      l.cascadeDelay = c[Math.min(h, r - 1)], l.cascadeStartY = l.finalY - n - s;
    }
  }
  getVisiblePixels(e, t, n, s) {
    const r = [];
    for (const i of e) {
      const o = 1 - i.cascadeDelay, a = o <= 0 ? 1 : Math.min(1, Math.max(0, (t - i.cascadeDelay) / o)), c = s(a);
      let l, h, f;
      if (n === "fadeIn")
        h = Math.round(i.cascadeStartY + (i.finalY - i.cascadeStartY) * c), l = i.finalX, f = a > 0 ? 1 : 0;
      else if (n === "fadeOut") {
        const d = i.finalY + (i.finalY - i.cascadeStartY);
        h = Math.round(i.finalY + (d - i.finalY) * c), l = i.finalX, f = a < 1 ? 1 : 0;
      } else
        continue;
      f <= 0 || r.push({ x: l, y: h, brightness: i.brightness, color: i.color, alpha: f });
    }
    return r;
  }
}
class Wt extends pe {
  initVariantMetadata(e, t, n, s, r, i) {
    const o = this.options.seed ?? 2;
    for (const a of e) {
      const c = i > 1 ? Math.floor(a.finalY / s) / (i - 1) : 0, l = Math.sin(a.idx * 43.9898 + o * 127.233) * 43758.5453, h = l - Math.floor(l);
      a.staticThreshold = c * 0.7 + h * 0.3;
    }
  }
  getVisiblePixels(e, t, n) {
    const r = [];
    for (const i of e) {
      let o;
      if (n === "fadeIn")
        o = Math.min(1, Math.max(0, (t - i.staticThreshold + 0.06) / 0.06));
      else if (n === "fadeOut")
        o = Math.min(1, Math.max(0, (i.staticThreshold - (1 - t) + 0.06) / 0.06));
      else
        continue;
      o <= 0 || r.push({ x: i.finalX, y: i.finalY, brightness: i.brightness, color: i.color, alpha: o });
    }
    return r;
  }
}
class $t extends pe {
  initVariantMetadata(e) {
    const t = this.options.seed ?? 0;
    for (const n of e) {
      const s = Math.sin(n.idx * 12.9898 + t * 78.233) * 43758.5453;
      n.glitchNoise = s - Math.floor(s);
    }
  }
  getVisiblePixels(e, t, n) {
    const s = [];
    for (const r of e) {
      let i;
      if (n === "fadeIn")
        i = r.glitchNoise < t;
      else if (n === "fadeOut")
        i = r.glitchNoise >= t;
      else
        continue;
      i && s.push({ x: r.finalX, y: r.finalY, brightness: r.brightness, color: r.color, alpha: 1 });
    }
    return s;
  }
}
function De(u, e = {}) {
  switch (u) {
    case "cascade":
      return new Yt(e);
    case "static":
      return new Wt(e);
    case "glitch":
      return new $t(e);
    default:
      return new Xt(e);
  }
}
class $ {
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
  drawPixel(e, t, n, s, r = 1) {
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
const qt = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
].map((u) => u.map((e) => e / 16)), Zt = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
].map((u) => u.map((e) => e / 64));
function Jt(u, e, t) {
  const n = Float32Array.from(u), s = new Uint8Array(e * t);
  for (let r = 0; r < t; r++)
    for (let i = 0; i < e; i++) {
      const o = r * e + i, a = n[o], c = a > 0.5 ? 1 : 0;
      s[o] = c;
      const l = a - c;
      i + 1 < e && (n[o + 1] += l * (7 / 16)), r + 1 < t && (i > 0 && (n[o + e - 1] += l * (3 / 16)), n[o + e] += l * (5 / 16), i + 1 < e && (n[o + e + 1] += l * (1 / 16)));
    }
  return s;
}
function Qt(u, e, t) {
  const n = Float32Array.from(u), s = new Uint8Array(e * t);
  for (let r = 0; r < t; r++)
    for (let i = 0; i < e; i++) {
      const o = r * e + i, a = n[o], c = a > 0.5 ? 1 : 0;
      s[o] = c;
      const l = (a - c) / 8;
      i + 1 < e && (n[o + 1] += l), i + 2 < e && (n[o + 2] += l), r + 1 < t && (i > 0 && (n[o + e - 1] += l), n[o + e] += l, i + 1 < e && (n[o + e + 1] += l)), r + 2 < t && (n[o + e * 2] += l);
    }
  return s;
}
const re = {
  bayer4x4: {
    type: "threshold",
    getThreshold: (u, e) => qt[e % 4][u % 4]
  },
  bayer8x8: {
    type: "threshold",
    getThreshold: (u, e) => Zt[e % 8][u % 8]
  },
  variableDot: {
    type: "variableDot"
  },
  floydSteinberg: {
    type: "errorDiffusion",
    processGrid: Jt
  },
  atkinson: {
    type: "errorDiffusion",
    processGrid: Qt
  }
};
function es(u, e) {
  if (e >= 1) return u;
  if (u.startsWith("#")) {
    const t = parseInt(u.slice(1, 3), 16), n = parseInt(u.slice(3, 5), 16), s = parseInt(u.slice(5, 7), 16);
    return `rgba(${t},${n},${s},${e})`;
  }
  return u.startsWith("rgb(") ? u.replace("rgb(", "rgba(").replace(")", `,${e})`) : u;
}
function ke(u, e, t) {
  return (0.3 * u + 0.59 * e + 0.11 * t) / 255;
}
class rt extends $ {
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
  drawPixel(e, t, n, s, r = 1) {
    if (!this._bitmapCtx) return;
    const i = r < 1 ? es(s, r) : s;
    i !== this._lastFillStyle && (this._bitmapCtx.fillStyle = i, this._lastFillStyle = i);
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
    const r = re[this.options.ditherType] ?? re.bayer4x4;
    r.type === "errorDiffusion" ? this._renderErrorDiffusion(e, t, n, r, s) : this._renderThreshold(e, t, n, s);
  }
  _renderThreshold(e, t, n, s) {
    const { pixelSize: r, minBrightness: i, invert: o } = this.options;
    for (let a = 0; a < n; a++)
      for (let c = 0; c < t; c++) {
        const l = (a * t + c) * 4, h = e[l], f = e[l + 1], d = e[l + 2], g = e[l + 3], p = ke(h, f, d);
        if (g === 0 || p < i) continue;
        const m = o ? 1 - p : p;
        if (!this.shouldDraw(m, c, a)) continue;
        const _ = s(m);
        this.drawPixel(c * r, a * r, m, _, 1);
      }
  }
  _renderErrorDiffusion(e, t, n, s, r) {
    const { pixelSize: i, minBrightness: o, invert: a } = this.options, c = t * n, l = new Float32Array(c), h = new Uint8Array(c);
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = (d * t + g) * 4, m = e[p], _ = e[p + 1], x = e[p + 2];
        if (e[p + 3] === 0) continue;
        const b = ke(m, _, x);
        if (b < o) continue;
        const R = a ? 1 - b : b, T = d * t + g;
        l[T] = R, h[T] = 1;
      }
    const f = s.processGrid(l, t, n);
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = d * t + g;
        if (!f[p] || !h[p]) continue;
        const m = l[p], _ = r(m);
        this.drawPixel(g * i, d * i, m, _, 1);
      }
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class ts {
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
      for (const { enabled: r, effect: i } of this._effects)
        r && i.apply(e, t, n, s);
  }
}
class ss {
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
    const { scanlineGap: r = 4, scanlineOpacity: i = 0.4, chromaticAberration: o = 0, crtVignette: a = 0.3 } = s;
    if (r > 0 && i > 0) {
      e.fillStyle = `rgba(0,0,0,${i})`;
      for (let c = 0; c < n; c += r)
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
    const r = new Uint8ClampedArray(e);
    for (let i = 0; i < n; i++)
      for (let o = 0; o < t; o++) {
        const a = (i * t + o) * 4, c = o - s;
        c >= 0 && (e[a] = r[(i * t + c) * 4]);
        const l = o + s;
        l < t && (e[a + 2] = r[(i * t + l) * 4 + 2]);
      }
  }
}
class ns {
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
    const r = s.noiseAmount ?? this.noiseAmount;
    if (r === 0 || !e || t <= 0 || n <= 0) return;
    const i = s.noiseMonochrome ?? this.noiseMonochrome, o = e.getImageData(0, 0, t, n), a = o.data, c = r * 255 * 2;
    for (let l = 0; l < a.length; l += 4)
      if (a[l + 3] !== 0)
        if (i) {
          const h = (Math.random() - 0.5) * c;
          a[l] = Math.max(0, Math.min(255, a[l] + h)), a[l + 1] = Math.max(0, Math.min(255, a[l + 1] + h)), a[l + 2] = Math.max(0, Math.min(255, a[l + 2] + h));
        } else
          a[l] = Math.max(0, Math.min(255, a[l] + (Math.random() - 0.5) * c)), a[l + 1] = Math.max(0, Math.min(255, a[l + 1] + (Math.random() - 0.5) * c)), a[l + 2] = Math.max(0, Math.min(255, a[l + 2] + (Math.random() - 0.5) * c));
    e.putImageData(o, 0, 0);
  }
}
class is {
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
    const r = s.colorShiftHue ?? this.colorShiftHue, i = s.colorShiftSaturation ?? this.colorShiftSaturation;
    if (r === 0 && i === 1 || !e || t <= 0 || n <= 0) return;
    typeof e.filter < "u" ? this._applyWithFilter(e, t, n, r, i) : this._applyManual(e, t, n, r, i);
  }
  /**
   * Fast path — use CSS canvas filters.
   */
  _applyWithFilter(e, t, n, s, r) {
    const i = document.createElement("canvas");
    i.width = t, i.height = n, i.getContext("2d").drawImage(e.canvas, 0, 0), e.clearRect(0, 0, t, n), e.filter = `hue-rotate(${s}deg) saturate(${r})`, e.drawImage(i, 0, 0), e.filter = "none";
  }
  /**
   * Fallback — manual per-pixel RGB -> HSL -> RGB.
   */
  _applyManual(e, t, n, s, r) {
    const i = e.getImageData(0, 0, t, n), o = i.data, a = s / 360;
    for (let c = 0; c < o.length; c += 4) {
      if (o[c + 3] === 0) continue;
      const l = o[c] / 255, h = o[c + 1] / 255, f = o[c + 2] / 255;
      let [d, g, p] = rs(l, h, f);
      d = (d + a) % 1, d < 0 && (d += 1), g = Math.max(0, Math.min(1, g * r));
      const [m, _, x] = os(d, g, p);
      o[c] = Math.round(m * 255), o[c + 1] = Math.round(_ * 255), o[c + 2] = Math.round(x * 255);
    }
    e.putImageData(i, 0, 0);
  }
}
function rs(u, e, t) {
  const n = Math.max(u, e, t), s = Math.min(u, e, t), r = (n + s) / 2;
  if (n === s) return [0, 0, r];
  const i = n - s, o = r > 0.5 ? i / (2 - n - s) : i / (n + s);
  let a;
  return n === u ? a = ((e - t) / i + (e < t ? 6 : 0)) / 6 : n === e ? a = ((t - u) / i + 2) / 6 : a = ((u - e) / i + 4) / 6, [a, o, r];
}
function os(u, e, t) {
  if (e === 0) return [t, t, t];
  const n = t < 0.5 ? t * (1 + e) : t + e - t * e, s = 2 * t - n;
  return [ge(s, n, u + 1 / 3), ge(s, n, u), ge(s, n, u - 1 / 3)];
}
function ge(u, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? u + (e - u) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? u + (e - u) * (2 / 3 - t) * 6 : u;
}
class as extends Kt {
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
    }), this.sampleCanvas = document.createElement("canvas"), this.sampleCtx = this.sampleCanvas.getContext("2d", { willReadFrequently: !0 }), this.gridWidth = 1, this.gridHeight = 1, this._activeRenderer = new rt(this.options), this._pendingRenderer = null, this.domElement.appendChild(this._activeRenderer.canvas), this._postChain = new ts(), this._postChain.addEffect("crt", new ss()), this._postChain.addEffect("noise", new ns()), this._postChain.addEffect("colorShift", new is());
    const n = this.options.fadeVariant ?? "bloom";
    this.fadeVariant = De(n), this._currentFadeVariantKey = n;
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
    e !== this._currentFadeVariantKey && (this._currentFadeVariantKey = e, this.fadeVariant = De(e), this.startAnimation("fadeIn")), this.sampleCtx.clearRect(0, 0, this.gridWidth, this.gridHeight), this.sampleCtx.drawImage(this.renderer.domElement, 0, 0, this.gridWidth, this.gridHeight);
    const t = this.sampleCtx.getImageData(0, 0, this.gridWidth, this.gridHeight).data;
    if (this._activeRenderer.beginFrame(this.options.backgroundColor), this.isAnimating) {
      this.particlesInitialized || (this.initializeParticles(
        this.gridWidth,
        this.gridHeight,
        this.options.pixelSize,
        t,
        (s, r, i) => this._activeRenderer.shouldDraw(s, r, i)
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
class cs extends de {
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
    const r = this, i = new ne(this.manager);
    i.setPath(this.path), i.setResponseType("arraybuffer"), i.setRequestHeader(this.requestHeader), i.setWithCredentials(this.withCredentials), i.load(e, function(o) {
      try {
        t(r.parse(o));
      } catch (a) {
        s ? s(a) : console.error(a), r.manager.itemError(e);
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
      let f, d, g, p = !1, m, _, x, y, b;
      for (let E = 0; E < 70; E++)
        l.getUint32(E, !1) == 1129270351 && l.getUint8(E + 4) == 82 && l.getUint8(E + 5) == 61 && (p = !0, m = new Float32Array(h * 3 * 3), _ = l.getUint8(E + 6) / 255, x = l.getUint8(E + 7) / 255, y = l.getUint8(E + 8) / 255, b = l.getUint8(E + 9) / 255);
      const R = 84, T = 50, w = new te(), v = new Float32Array(h * 3 * 3), M = new Float32Array(h * 3 * 3), A = new B();
      for (let E = 0; E < h; E++) {
        const L = R + E * T, I = l.getFloat32(L, !0), K = l.getFloat32(L + 4, !0), ie = l.getFloat32(L + 8, !0);
        if (p) {
          const F = l.getUint16(L + 48, !0);
          (F & 32768) === 0 ? (f = (F & 31) / 31, d = (F >> 5 & 31) / 31, g = (F >> 10 & 31) / 31) : (f = _, d = x, g = y);
        }
        for (let F = 1; F <= 3; F++) {
          const me = L + F * 12, j = E * 3 * 3 + (F - 1) * 3;
          v[j] = l.getFloat32(me, !0), v[j + 1] = l.getFloat32(me + 4, !0), v[j + 2] = l.getFloat32(me + 8, !0), M[j] = I, M[j + 1] = K, M[j + 2] = ie, p && (A.setRGB(f, d, g, G), m[j] = A.r, m[j + 1] = A.g, m[j + 2] = A.b);
        }
      }
      return w.setAttribute("position", new Y(v, 3)), w.setAttribute("normal", new Y(M, 3)), p && (w.setAttribute("color", new Y(m, 3)), w.hasColors = !0, w.alpha = b), w;
    }
    function r(c) {
      const l = new te(), h = /solid([\s\S]*?)endsolid/g, f = /facet([\s\S]*?)endfacet/g, d = /solid\s(.+)/;
      let g = 0;
      const p = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source, m = new RegExp("vertex" + p + p + p, "g"), _ = new RegExp("normal" + p + p + p, "g"), x = [], y = [], b = [], R = new N();
      let T, w = 0, v = 0, M = 0;
      for (; (T = h.exec(c)) !== null; ) {
        v = M;
        const A = T[0], E = (T = d.exec(A)) !== null ? T[1] : "";
        for (b.push(E); (T = f.exec(A)) !== null; ) {
          let K = 0, ie = 0;
          const F = T[0];
          for (; (T = _.exec(F)) !== null; )
            R.x = parseFloat(T[1]), R.y = parseFloat(T[2]), R.z = parseFloat(T[3]), ie++;
          for (; (T = m.exec(F)) !== null; )
            x.push(parseFloat(T[1]), parseFloat(T[2]), parseFloat(T[3])), y.push(R.x, R.y, R.z), K++, M++;
          ie !== 1 && console.error("THREE.STLLoader: Something isn't right with the normal of face number " + g), K !== 3 && console.error("THREE.STLLoader: Something isn't right with the vertices of face number " + g), g++;
        }
        const L = v, I = M - v;
        l.userData.groupNames = b, l.addGroup(L, I, w), w++;
      }
      return l.setAttribute("position", new H(x, 3)), l.setAttribute("normal", new H(y, 3)), l;
    }
    function i(c) {
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
    return t(a) ? s(a) : r(i(e));
  }
}
function je(u, e) {
  if (e === ut)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), u;
  if (e === Se || e === Ze) {
    let t = u.getIndex();
    if (t === null) {
      const i = [], o = u.getAttribute("position");
      if (o !== void 0) {
        for (let a = 0; a < o.count; a++)
          i.push(a);
        u.setIndex(i), t = u.getIndex();
      } else
        return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), u;
    }
    const n = t.count - 2, s = [];
    if (e === Se)
      for (let i = 1; i <= n; i++)
        s.push(t.getX(0)), s.push(t.getX(i)), s.push(t.getX(i + 1));
    else
      for (let i = 0; i < n; i++)
        i % 2 === 0 ? (s.push(t.getX(i)), s.push(t.getX(i + 1)), s.push(t.getX(i + 2))) : (s.push(t.getX(i + 2)), s.push(t.getX(i + 1)), s.push(t.getX(i)));
    s.length / 3 !== n && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    const r = u.clone();
    return r.setIndex(s), r.clearGroups(), r;
  } else
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", e), u;
}
class ls extends de {
  /**
   * Constructs a new glTF loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new ps(t);
    }), this.register(function(t) {
      return new ms(t);
    }), this.register(function(t) {
      return new Ss(t);
    }), this.register(function(t) {
      return new Cs(t);
    }), this.register(function(t) {
      return new Ms(t);
    }), this.register(function(t) {
      return new _s(t);
    }), this.register(function(t) {
      return new bs(t);
    }), this.register(function(t) {
      return new xs(t);
    }), this.register(function(t) {
      return new Ts(t);
    }), this.register(function(t) {
      return new ds(t);
    }), this.register(function(t) {
      return new ys(t);
    }), this.register(function(t) {
      return new gs(t);
    }), this.register(function(t) {
      return new Rs(t);
    }), this.register(function(t) {
      return new ws(t);
    }), this.register(function(t) {
      return new us(t);
    }), this.register(function(t) {
      return new Es(t);
    }), this.register(function(t) {
      return new vs(t);
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
    const r = this;
    let i;
    if (this.resourcePath !== "")
      i = this.resourcePath;
    else if (this.path !== "") {
      const c = Q.extractUrlBase(e);
      i = Q.resolveURL(c, this.path);
    } else
      i = Q.extractUrlBase(e);
    this.manager.itemStart(e);
    const o = function(c) {
      s ? s(c) : console.error(c), r.manager.itemError(e), r.manager.itemEnd(e);
    }, a = new ne(this.manager);
    a.setPath(this.path), a.setResponseType("arraybuffer"), a.setRequestHeader(this.requestHeader), a.setWithCredentials(this.withCredentials), a.load(e, function(c) {
      try {
        r.parse(c, i, function(l) {
          t(l), r.manager.itemEnd(e);
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
    let r;
    const i = {}, o = {}, a = new TextDecoder();
    if (typeof e == "string")
      r = JSON.parse(e);
    else if (e instanceof ArrayBuffer)
      if (a.decode(new Uint8Array(e, 0, 4)) === ot) {
        try {
          i[C.KHR_BINARY_GLTF] = new As(e);
        } catch (h) {
          s && s(h);
          return;
        }
        r = JSON.parse(i[C.KHR_BINARY_GLTF].content);
      } else
        r = JSON.parse(a.decode(e));
    else
      r = e;
    if (r.asset === void 0 || r.asset.version[0] < 2) {
      s && s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const c = new Hs(r, {
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
      h.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), o[h.name] = h, i[h.name] = !0;
    }
    if (r.extensionsUsed)
      for (let l = 0; l < r.extensionsUsed.length; ++l) {
        const h = r.extensionsUsed[l], f = r.extensionsRequired || [];
        switch (h) {
          case C.KHR_MATERIALS_UNLIT:
            i[h] = new fs();
            break;
          case C.KHR_DRACO_MESH_COMPRESSION:
            i[h] = new Ls(r, this.dracoLoader);
            break;
          case C.KHR_TEXTURE_TRANSFORM:
            i[h] = new Is();
            break;
          case C.KHR_MESH_QUANTIZATION:
            i[h] = new Fs();
            break;
          default:
            f.indexOf(h) >= 0 && o[h] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + h + '".');
        }
      }
    c.setExtensions(i), c.setPlugins(o), c.parse(n, s);
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
    return new Promise(function(s, r) {
      n.parse(e, t, s, r);
    });
  }
}
function hs() {
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
const C = {
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
class us {
  constructor(e) {
    this.parser = e, this.name = C.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
  }
  _markDefs() {
    const e = this.parser, t = this.parser.json.nodes || [];
    for (let n = 0, s = t.length; n < s; n++) {
      const r = t[n];
      r.extensions && r.extensions[this.name] && r.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, r.extensions[this.name].light);
    }
  }
  _loadLight(e) {
    const t = this.parser, n = "light:" + e;
    let s = t.cache.get(n);
    if (s) return s;
    const r = t.json, a = ((r.extensions && r.extensions[this.name] || {}).lights || [])[e];
    let c;
    const l = new B(16777215);
    a.color !== void 0 && l.setRGB(a.color[0], a.color[1], a.color[2], U);
    const h = a.range !== void 0 ? a.range : 0;
    switch (a.type) {
      case "directional":
        c = new pt(l), c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      case "point":
        c = new dt(l), c.distance = h;
        break;
      case "spot":
        c = new ft(l), c.distance = h, a.spot = a.spot || {}, a.spot.innerConeAngle = a.spot.innerConeAngle !== void 0 ? a.spot.innerConeAngle : 0, a.spot.outerConeAngle = a.spot.outerConeAngle !== void 0 ? a.spot.outerConeAngle : Math.PI / 4, c.angle = a.spot.outerConeAngle, c.penumbra = 1 - a.spot.innerConeAngle / a.spot.outerConeAngle, c.target.position.set(0, 0, -1), c.add(c.target);
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
    const t = this, n = this.parser, r = n.json.nodes[e], o = (r.extensions && r.extensions[this.name] || {}).light;
    return o === void 0 ? null : this._loadLight(o).then(function(a) {
      return n._getNodeRef(t.cache, o, a);
    });
  }
}
class fs {
  constructor() {
    this.name = C.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return J;
  }
  extendParams(e, t, n) {
    const s = [];
    e.color = new B(1, 1, 1), e.opacity = 1;
    const r = t.pbrMetallicRoughness;
    if (r) {
      if (Array.isArray(r.baseColorFactor)) {
        const i = r.baseColorFactor;
        e.color.setRGB(i[0], i[1], i[2], U), e.opacity = i[3];
      }
      r.baseColorTexture !== void 0 && s.push(n.assignTexture(e, "map", r.baseColorTexture, G));
    }
    return Promise.all(s);
  }
}
class ds {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, t) {
    const s = this.parser.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = s.extensions[this.name].emissiveStrength;
    return r !== void 0 && (t.emissiveIntensity = r), Promise.resolve();
  }
}
class ps {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], i = s.extensions[this.name];
    if (i.clearcoatFactor !== void 0 && (t.clearcoat = i.clearcoatFactor), i.clearcoatTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatMap", i.clearcoatTexture)), i.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = i.clearcoatRoughnessFactor), i.clearcoatRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatRoughnessMap", i.clearcoatRoughnessTexture)), i.clearcoatNormalTexture !== void 0 && (r.push(n.assignTexture(t, "clearcoatNormalMap", i.clearcoatNormalTexture)), i.clearcoatNormalTexture.scale !== void 0)) {
      const o = i.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new Je(o, o);
    }
    return Promise.all(r);
  }
}
class ms {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const s = this.parser.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = s.extensions[this.name];
    return t.dispersion = r.dispersion !== void 0 ? r.dispersion : 0, Promise.resolve();
  }
}
class gs {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], i = s.extensions[this.name];
    return i.iridescenceFactor !== void 0 && (t.iridescence = i.iridescenceFactor), i.iridescenceTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceMap", i.iridescenceTexture)), i.iridescenceIor !== void 0 && (t.iridescenceIOR = i.iridescenceIor), t.iridescenceThicknessRange === void 0 && (t.iridescenceThicknessRange = [100, 400]), i.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessRange[0] = i.iridescenceThicknessMinimum), i.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessRange[1] = i.iridescenceThicknessMaximum), i.iridescenceThicknessTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceThicknessMap", i.iridescenceThicknessTexture)), Promise.all(r);
  }
}
class _s {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [];
    t.sheenColor = new B(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1;
    const i = s.extensions[this.name];
    if (i.sheenColorFactor !== void 0) {
      const o = i.sheenColorFactor;
      t.sheenColor.setRGB(o[0], o[1], o[2], U);
    }
    return i.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = i.sheenRoughnessFactor), i.sheenColorTexture !== void 0 && r.push(n.assignTexture(t, "sheenColorMap", i.sheenColorTexture, G)), i.sheenRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "sheenRoughnessMap", i.sheenRoughnessTexture)), Promise.all(r);
  }
}
class bs {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], i = s.extensions[this.name];
    return i.transmissionFactor !== void 0 && (t.transmission = i.transmissionFactor), i.transmissionTexture !== void 0 && r.push(n.assignTexture(t, "transmissionMap", i.transmissionTexture)), Promise.all(r);
  }
}
class xs {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], i = s.extensions[this.name];
    t.thickness = i.thicknessFactor !== void 0 ? i.thicknessFactor : 0, i.thicknessTexture !== void 0 && r.push(n.assignTexture(t, "thicknessMap", i.thicknessTexture)), t.attenuationDistance = i.attenuationDistance || 1 / 0;
    const o = i.attenuationColor || [1, 1, 1];
    return t.attenuationColor = new B().setRGB(o[0], o[1], o[2], U), Promise.all(r);
  }
}
class Ts {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const s = this.parser.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = s.extensions[this.name];
    return t.ior = r.ior !== void 0 ? r.ior : 1.5, Promise.resolve();
  }
}
class ys {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], i = s.extensions[this.name];
    t.specularIntensity = i.specularFactor !== void 0 ? i.specularFactor : 1, i.specularTexture !== void 0 && r.push(n.assignTexture(t, "specularIntensityMap", i.specularTexture));
    const o = i.specularColorFactor || [1, 1, 1];
    return t.specularColor = new B().setRGB(o[0], o[1], o[2], U), i.specularColorTexture !== void 0 && r.push(n.assignTexture(t, "specularColorMap", i.specularColorTexture, G)), Promise.all(r);
  }
}
class ws {
  constructor(e) {
    this.parser = e, this.name = C.EXT_MATERIALS_BUMP;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], i = s.extensions[this.name];
    return t.bumpScale = i.bumpFactor !== void 0 ? i.bumpFactor : 1, i.bumpTexture !== void 0 && r.push(n.assignTexture(t, "bumpMap", i.bumpTexture)), Promise.all(r);
  }
}
class Rs {
  constructor(e) {
    this.parser = e, this.name = C.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : k;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const r = [], i = s.extensions[this.name];
    return i.anisotropyStrength !== void 0 && (t.anisotropy = i.anisotropyStrength), i.anisotropyRotation !== void 0 && (t.anisotropyRotation = i.anisotropyRotation), i.anisotropyTexture !== void 0 && r.push(n.assignTexture(t, "anisotropyMap", i.anisotropyTexture)), Promise.all(r);
  }
}
class Ss {
  constructor(e) {
    this.parser = e, this.name = C.KHR_TEXTURE_BASISU;
  }
  loadTexture(e) {
    const t = this.parser, n = t.json, s = n.textures[e];
    if (!s.extensions || !s.extensions[this.name])
      return null;
    const r = s.extensions[this.name], i = t.options.ktx2Loader;
    if (!i) {
      if (n.extensionsRequired && n.extensionsRequired.indexOf(this.name) >= 0)
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return t.loadTextureImage(e, r.source, i);
  }
}
class Cs {
  constructor(e) {
    this.parser = e, this.name = C.EXT_TEXTURE_WEBP;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, s = n.json, r = s.textures[e];
    if (!r.extensions || !r.extensions[t])
      return null;
    const i = r.extensions[t], o = s.images[i.source];
    let a = n.textureLoader;
    if (o.uri) {
      const c = n.options.manager.getHandler(o.uri);
      c !== null && (a = c);
    }
    return n.loadTextureImage(e, i.source, a);
  }
}
class Ms {
  constructor(e) {
    this.parser = e, this.name = C.EXT_TEXTURE_AVIF;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, s = n.json, r = s.textures[e];
    if (!r.extensions || !r.extensions[t])
      return null;
    const i = r.extensions[t], o = s.images[i.source];
    let a = n.textureLoader;
    if (o.uri) {
      const c = n.options.manager.getHandler(o.uri);
      c !== null && (a = c);
    }
    return n.loadTextureImage(e, i.source, a);
  }
}
class Es {
  constructor(e) {
    this.name = C.EXT_MESHOPT_COMPRESSION, this.parser = e;
  }
  loadBufferView(e) {
    const t = this.parser.json, n = t.bufferViews[e];
    if (n.extensions && n.extensions[this.name]) {
      const s = n.extensions[this.name], r = this.parser.getDependency("buffer", s.buffer), i = this.parser.options.meshoptDecoder;
      if (!i || !i.supported) {
        if (t.extensionsRequired && t.extensionsRequired.indexOf(this.name) >= 0)
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return r.then(function(o) {
        const a = s.byteOffset || 0, c = s.byteLength || 0, l = s.count, h = s.byteStride, f = new Uint8Array(o, a, c);
        return i.decodeGltfBufferAsync ? i.decodeGltfBufferAsync(l, h, f, s.mode, s.filter).then(function(d) {
          return d.buffer;
        }) : i.ready.then(function() {
          const d = new ArrayBuffer(l * h);
          return i.decodeGltfBuffer(new Uint8Array(d), l, h, f, s.mode, s.filter), d;
        });
      });
    } else
      return null;
  }
}
class vs {
  constructor(e) {
    this.name = C.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const t = this.parser.json, n = t.nodes[e];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0)
      return null;
    const s = t.meshes[n.mesh];
    for (const c of s.primitives)
      if (c.mode !== P.TRIANGLES && c.mode !== P.TRIANGLE_STRIP && c.mode !== P.TRIANGLE_FAN && c.mode !== void 0)
        return null;
    const i = n.extensions[this.name].attributes, o = [], a = {};
    for (const c in i)
      o.push(this.parser.getDependency("accessor", i[c]).then((l) => (a[c] = l, a[c])));
    return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then((c) => {
      const l = c.pop(), h = l.isGroup ? l.children : [l], f = c[0].count, d = [];
      for (const g of h) {
        const p = new fe(), m = new N(), _ = new Qe(), x = new N(1, 1, 1), y = new mt(g.geometry, g.material, f);
        for (let b = 0; b < f; b++)
          a.TRANSLATION && m.fromBufferAttribute(a.TRANSLATION, b), a.ROTATION && _.fromBufferAttribute(a.ROTATION, b), a.SCALE && x.fromBufferAttribute(a.SCALE, b), y.setMatrixAt(b, p.compose(m, _, x));
        for (const b in a)
          if (b === "_COLOR_0") {
            const R = a[b];
            y.instanceColor = new gt(R.array, R.itemSize, R.normalized);
          } else b !== "TRANSLATION" && b !== "ROTATION" && b !== "SCALE" && g.geometry.setAttribute(b, a[b]);
        et.prototype.copy.call(y, g), this.parser.assignFinalMaterial(y), d.push(y);
      }
      return l.isGroup ? (l.clear(), l.add(...d), l) : d[0];
    }));
  }
}
const ot = "glTF", q = 12, Be = { JSON: 1313821514, BIN: 5130562 };
class As {
  constructor(e) {
    this.name = C.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, q), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(e.slice(0, 4))),
      version: t.getUint32(4, !0),
      length: t.getUint32(8, !0)
    }, this.header.magic !== ot)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const s = this.header.length - q, r = new DataView(e, q);
    let i = 0;
    for (; i < s; ) {
      const o = r.getUint32(i, !0);
      i += 4;
      const a = r.getUint32(i, !0);
      if (i += 4, a === Be.JSON) {
        const c = new Uint8Array(e, q + i, o);
        this.content = n.decode(c);
      } else if (a === Be.BIN) {
        const c = q + i;
        this.body = e.slice(c, c + o);
      }
      i += o;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class Ls {
  constructor(e, t) {
    if (!t)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = C.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload();
  }
  decodePrimitive(e, t) {
    const n = this.json, s = this.dracoLoader, r = e.extensions[this.name].bufferView, i = e.extensions[this.name].attributes, o = {}, a = {}, c = {};
    for (const l in i) {
      const h = Ae[l] || l.toLowerCase();
      o[h] = i[l];
    }
    for (const l in e.attributes) {
      const h = Ae[l] || l.toLowerCase();
      if (i[l] !== void 0) {
        const f = n.accessors[e.attributes[l]], d = W[f.componentType];
        c[h] = d.name, a[h] = f.normalized === !0;
      }
    }
    return t.getDependency("bufferView", r).then(function(l) {
      return new Promise(function(h, f) {
        s.decodeDracoFile(l, function(d) {
          for (const g in d.attributes) {
            const p = d.attributes[g], m = a[g];
            m !== void 0 && (p.normalized = m);
          }
          h(d);
        }, o, c, U, f);
      });
    });
  }
}
class Is {
  constructor() {
    this.name = C.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, t) {
    return (t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e;
  }
}
class Fs {
  constructor() {
    this.name = C.KHR_MESH_QUANTIZATION;
  }
}
class at extends Bt {
  constructor(e, t, n, s) {
    super(e, t, n, s);
  }
  copySampleValue_(e) {
    const t = this.resultBuffer, n = this.sampleValues, s = this.valueSize, r = e * s * 3 + s;
    for (let i = 0; i !== s; i++)
      t[i] = n[r + i];
    return t;
  }
  interpolate_(e, t, n, s) {
    const r = this.resultBuffer, i = this.sampleValues, o = this.valueSize, a = o * 2, c = o * 3, l = s - t, h = (n - t) / l, f = h * h, d = f * h, g = e * c, p = g - c, m = -2 * d + 3 * f, _ = d - f, x = 1 - m, y = _ - f + h;
    for (let b = 0; b !== o; b++) {
      const R = i[p + b + o], T = i[p + b + a] * l, w = i[g + b + o], v = i[g + b] * l;
      r[b] = x * R + y * T + m * w + _ * v;
    }
    return r;
  }
}
const Os = new Qe();
class Ps extends at {
  interpolate_(e, t, n, s) {
    const r = super.interpolate_(e, t, n, s);
    return Os.fromArray(r).normalize().toArray(r), r;
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
}, Ue = {
  9728: st,
  9729: Ce,
  9984: Rt,
  9985: wt,
  9986: yt,
  9987: tt
}, ze = {
  33071: Ct,
  33648: St,
  10497: Me
}, _e = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, Ae = {
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
}, z = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, Ns = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: it,
  STEP: kt
}, be = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function Ds(u) {
  return u.DefaultMaterial === void 0 && (u.DefaultMaterial = new nt({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: jt
  })), u.DefaultMaterial;
}
function V(u, e, t) {
  for (const n in t.extensions)
    u[n] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[n] = t.extensions[n]);
}
function D(u, e) {
  e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(u.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras));
}
function ks(u, e, t) {
  let n = !1, s = !1, r = !1;
  for (let c = 0, l = e.length; c < l; c++) {
    const h = e[c];
    if (h.POSITION !== void 0 && (n = !0), h.NORMAL !== void 0 && (s = !0), h.COLOR_0 !== void 0 && (r = !0), n && s && r) break;
  }
  if (!n && !s && !r) return Promise.resolve(u);
  const i = [], o = [], a = [];
  for (let c = 0, l = e.length; c < l; c++) {
    const h = e[c];
    if (n) {
      const f = h.POSITION !== void 0 ? t.getDependency("accessor", h.POSITION) : u.attributes.position;
      i.push(f);
    }
    if (s) {
      const f = h.NORMAL !== void 0 ? t.getDependency("accessor", h.NORMAL) : u.attributes.normal;
      o.push(f);
    }
    if (r) {
      const f = h.COLOR_0 !== void 0 ? t.getDependency("accessor", h.COLOR_0) : u.attributes.color;
      a.push(f);
    }
  }
  return Promise.all([
    Promise.all(i),
    Promise.all(o),
    Promise.all(a)
  ]).then(function(c) {
    const l = c[0], h = c[1], f = c[2];
    return n && (u.morphAttributes.position = l), s && (u.morphAttributes.normal = h), r && (u.morphAttributes.color = f), u.morphTargetsRelative = !0, u;
  });
}
function js(u, e) {
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
function Bs(u) {
  let e;
  const t = u.extensions && u.extensions[C.KHR_DRACO_MESH_COMPRESSION];
  if (t ? e = "draco:" + t.bufferView + ":" + t.indices + ":" + xe(t.attributes) : e = u.indices + ":" + xe(u.attributes) + ":" + u.mode, u.targets !== void 0)
    for (let n = 0, s = u.targets.length; n < s; n++)
      e += ":" + xe(u.targets[n]);
  return e;
}
function xe(u) {
  let e = "";
  const t = Object.keys(u).sort();
  for (let n = 0, s = t.length; n < s; n++)
    e += t[n] + ":" + u[t[n]] + ";";
  return e;
}
function Le(u) {
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
function Us(u) {
  return u.search(/\.jpe?g($|\?)/i) > 0 || u.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : u.search(/\.webp($|\?)/i) > 0 || u.search(/^data\:image\/webp/) === 0 ? "image/webp" : u.search(/\.ktx2($|\?)/i) > 0 || u.search(/^data\:image\/ktx2/) === 0 ? "image/ktx2" : "image/png";
}
const zs = new fe();
class Hs {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new hs(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, s = -1, r = !1, i = -1;
    if (typeof navigator < "u") {
      const o = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(o) === !0;
      const a = o.match(/Version\/(\d+)/);
      s = n && a ? parseInt(a[1], 10) : -1, r = o.indexOf("Firefox") > -1, i = r ? o.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && s < 17 || r && i < 98 ? this.textureLoader = new _t(this.options.manager) : this.textureLoader = new bt(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new ne(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
  }
  setExtensions(e) {
    this.extensions = e;
  }
  setPlugins(e) {
    this.plugins = e;
  }
  parse(e, t) {
    const n = this, s = this.json, r = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(i) {
      return i._markDefs && i._markDefs();
    }), Promise.all(this._invokeAll(function(i) {
      return i.beforeRoot && i.beforeRoot();
    })).then(function() {
      return Promise.all([
        n.getDependencies("scene"),
        n.getDependencies("animation"),
        n.getDependencies("camera")
      ]);
    }).then(function(i) {
      const o = {
        scene: i[0][s.scene || 0],
        scenes: i[0],
        animations: i[1],
        cameras: i[2],
        asset: s.asset,
        parser: n,
        userData: {}
      };
      return V(r, o, s), D(o, s), Promise.all(n._invokeAll(function(a) {
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
    for (let s = 0, r = t.length; s < r; s++) {
      const i = t[s].joints;
      for (let o = 0, a = i.length; o < a; o++)
        e[i[o]].isBone = !0;
    }
    for (let s = 0, r = e.length; s < r; s++) {
      const i = e[s];
      i.mesh !== void 0 && (this._addNodeRef(this.meshCache, i.mesh), i.skin !== void 0 && (n[i.mesh].isSkinnedMesh = !0)), i.camera !== void 0 && this._addNodeRef(this.cameraCache, i.camera);
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
    const s = n.clone(), r = (i, o) => {
      const a = this.associations.get(i);
      a != null && this.associations.set(o, a);
      for (const [c, l] of i.children.entries())
        r(l, o.children[c]);
    };
    return r(n, s), s.name += "_instance_" + e.uses[t]++, s;
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
      const r = e(t[s]);
      r && n.push(r);
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
          s = this._invokeOne(function(r) {
            return r.loadNode && r.loadNode(t);
          });
          break;
        case "mesh":
          s = this._invokeOne(function(r) {
            return r.loadMesh && r.loadMesh(t);
          });
          break;
        case "accessor":
          s = this.loadAccessor(t);
          break;
        case "bufferView":
          s = this._invokeOne(function(r) {
            return r.loadBufferView && r.loadBufferView(t);
          });
          break;
        case "buffer":
          s = this.loadBuffer(t);
          break;
        case "material":
          s = this._invokeOne(function(r) {
            return r.loadMaterial && r.loadMaterial(t);
          });
          break;
        case "texture":
          s = this._invokeOne(function(r) {
            return r.loadTexture && r.loadTexture(t);
          });
          break;
        case "skin":
          s = this.loadSkin(t);
          break;
        case "animation":
          s = this._invokeOne(function(r) {
            return r.loadAnimation && r.loadAnimation(t);
          });
          break;
        case "camera":
          s = this.loadCamera(t);
          break;
        default:
          if (s = this._invokeOne(function(r) {
            return r != this && r.getDependency && r.getDependency(e, t);
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
      t = Promise.all(s.map(function(r, i) {
        return n.getDependency(e, i);
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
      return Promise.resolve(this.extensions[C.KHR_BINARY_GLTF].body);
    const s = this.options;
    return new Promise(function(r, i) {
      n.load(Q.resolveURL(t.uri, s.path), r, void 0, function() {
        i(new Error('THREE.GLTFLoader: Failed to load buffer "' + t.uri + '".'));
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
      const s = t.byteLength || 0, r = t.byteOffset || 0;
      return n.slice(r, r + s);
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
      const i = _e[s.type], o = W[s.componentType], a = s.normalized === !0, c = new o(s.count * i);
      return Promise.resolve(new Y(c, i, a));
    }
    const r = [];
    return s.bufferView !== void 0 ? r.push(this.getDependency("bufferView", s.bufferView)) : r.push(null), s.sparse !== void 0 && (r.push(this.getDependency("bufferView", s.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", s.sparse.values.bufferView))), Promise.all(r).then(function(i) {
      const o = i[0], a = _e[s.type], c = W[s.componentType], l = c.BYTES_PER_ELEMENT, h = l * a, f = s.byteOffset || 0, d = s.bufferView !== void 0 ? n.bufferViews[s.bufferView].byteStride : void 0, g = s.normalized === !0;
      let p, m;
      if (d && d !== h) {
        const _ = Math.floor(f / d), x = "InterleavedBuffer:" + s.bufferView + ":" + s.componentType + ":" + _ + ":" + s.count;
        let y = t.cache.get(x);
        y || (p = new c(o, _ * d, s.count * d / l), y = new xt(p, d / l), t.cache.add(x, y)), m = new Tt(y, a, f % d / l, g);
      } else
        o === null ? p = new c(s.count * a) : p = new c(o, f, s.count * a), m = new Y(p, a, g);
      if (s.sparse !== void 0) {
        const _ = _e.SCALAR, x = W[s.sparse.indices.componentType], y = s.sparse.indices.byteOffset || 0, b = s.sparse.values.byteOffset || 0, R = new x(i[1], y, s.sparse.count * _), T = new c(i[2], b, s.sparse.count * a);
        o !== null && (m = new Y(m.array.slice(), m.itemSize, m.normalized)), m.normalized = !1;
        for (let w = 0, v = R.length; w < v; w++) {
          const M = R[w];
          if (m.setX(M, T[w * a]), a >= 2 && m.setY(M, T[w * a + 1]), a >= 3 && m.setZ(M, T[w * a + 2]), a >= 4 && m.setW(M, T[w * a + 3]), a >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
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
    const t = this.json, n = this.options, r = t.textures[e].source, i = t.images[r];
    let o = this.textureLoader;
    if (i.uri) {
      const a = n.manager.getHandler(i.uri);
      a !== null && (o = a);
    }
    return this.loadTextureImage(e, r, o);
  }
  loadTextureImage(e, t, n) {
    const s = this, r = this.json, i = r.textures[e], o = r.images[t], a = (o.uri || o.bufferView) + ":" + i.sampler;
    if (this.textureCache[a])
      return this.textureCache[a];
    const c = this.loadImageSource(t, n).then(function(l) {
      l.flipY = !1, l.name = i.name || o.name || "", l.name === "" && typeof o.uri == "string" && o.uri.startsWith("data:image/") === !1 && (l.name = o.uri);
      const f = (r.samplers || {})[i.sampler] || {};
      return l.magFilter = Ue[f.magFilter] || Ce, l.minFilter = Ue[f.minFilter] || tt, l.wrapS = ze[f.wrapS] || Me, l.wrapT = ze[f.wrapT] || Me, l.generateMipmaps = !l.isCompressedTexture && l.minFilter !== st && l.minFilter !== Ce, s.associations.set(l, { textures: e }), l;
    }).catch(function() {
      return null;
    });
    return this.textureCache[a] = c, c;
  }
  loadImageSource(e, t) {
    const n = this, s = this.json, r = this.options;
    if (this.sourceCache[e] !== void 0)
      return this.sourceCache[e].then((h) => h.clone());
    const i = s.images[e], o = self.URL || self.webkitURL;
    let a = i.uri || "", c = !1;
    if (i.bufferView !== void 0)
      a = n.getDependency("bufferView", i.bufferView).then(function(h) {
        c = !0;
        const f = new Blob([h], { type: i.mimeType });
        return a = o.createObjectURL(f), a;
      });
    else if (i.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
    const l = Promise.resolve(a).then(function(h) {
      return new Promise(function(f, d) {
        let g = f;
        t.isImageBitmapLoader === !0 && (g = function(p) {
          const m = new Ie(p);
          m.needsUpdate = !0, f(m);
        }), t.load(Q.resolveURL(h, r.path), g, void 0, d);
      });
    }).then(function(h) {
      return c === !0 && o.revokeObjectURL(a), D(h, i), h.userData.mimeType = i.mimeType || Us(i.uri), h;
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
    const r = this;
    return this.getDependency("texture", n.index).then(function(i) {
      if (!i) return null;
      if (n.texCoord !== void 0 && n.texCoord > 0 && (i = i.clone(), i.channel = n.texCoord), r.extensions[C.KHR_TEXTURE_TRANSFORM]) {
        const o = n.extensions !== void 0 ? n.extensions[C.KHR_TEXTURE_TRANSFORM] : void 0;
        if (o) {
          const a = r.associations.get(i);
          i = r.extensions[C.KHR_TEXTURE_TRANSFORM].extendTexture(i, o), r.associations.set(i, a);
        }
      }
      return s !== void 0 && (i.colorSpace = s), e[t] = i, i;
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
    const s = t.attributes.tangent === void 0, r = t.attributes.color !== void 0, i = t.attributes.normal === void 0;
    if (e.isPoints) {
      const o = "PointsMaterial:" + n.uuid;
      let a = this.cache.get(o);
      a || (a = new Z(), ee.prototype.copy.call(a, n), a.color.copy(n.color), a.map = n.map, a.sizeAttenuation = !1, this.cache.add(o, a)), n = a;
    } else if (e.isLine) {
      const o = "LineBasicMaterial:" + n.uuid;
      let a = this.cache.get(o);
      a || (a = new ce(), ee.prototype.copy.call(a, n), a.color.copy(n.color), a.map = n.map, this.cache.add(o, a)), n = a;
    }
    if (s || r || i) {
      let o = "ClonedMaterial:" + n.uuid + ":";
      s && (o += "derivative-tangents:"), r && (o += "vertex-colors:"), i && (o += "flat-shading:");
      let a = this.cache.get(o);
      a || (a = n.clone(), r && (a.vertexColors = !0), i && (a.flatShading = !0), s && (a.normalScale && (a.normalScale.y *= -1), a.clearcoatNormalScale && (a.clearcoatNormalScale.y *= -1)), this.cache.add(o, a), this.associations.set(a, this.associations.get(n))), n = a;
    }
    e.material = n;
  }
  getMaterialType() {
    return nt;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
   *
   * @private
   * @param {number} materialIndex
   * @return {Promise<Material>}
   */
  loadMaterial(e) {
    const t = this, n = this.json, s = this.extensions, r = n.materials[e];
    let i;
    const o = {}, a = r.extensions || {}, c = [];
    if (a[C.KHR_MATERIALS_UNLIT]) {
      const h = s[C.KHR_MATERIALS_UNLIT];
      i = h.getMaterialType(), c.push(h.extendParams(o, r, t));
    } else {
      const h = r.pbrMetallicRoughness || {};
      if (o.color = new B(1, 1, 1), o.opacity = 1, Array.isArray(h.baseColorFactor)) {
        const f = h.baseColorFactor;
        o.color.setRGB(f[0], f[1], f[2], U), o.opacity = f[3];
      }
      h.baseColorTexture !== void 0 && c.push(t.assignTexture(o, "map", h.baseColorTexture, G)), o.metalness = h.metallicFactor !== void 0 ? h.metallicFactor : 1, o.roughness = h.roughnessFactor !== void 0 ? h.roughnessFactor : 1, h.metallicRoughnessTexture !== void 0 && (c.push(t.assignTexture(o, "metalnessMap", h.metallicRoughnessTexture)), c.push(t.assignTexture(o, "roughnessMap", h.metallicRoughnessTexture))), i = this._invokeOne(function(f) {
        return f.getMaterialType && f.getMaterialType(e);
      }), c.push(Promise.all(this._invokeAll(function(f) {
        return f.extendMaterialParams && f.extendMaterialParams(e, o);
      })));
    }
    r.doubleSided === !0 && (o.side = Mt);
    const l = r.alphaMode || be.OPAQUE;
    if (l === be.BLEND ? (o.transparent = !0, o.depthWrite = !1) : (o.transparent = !1, l === be.MASK && (o.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : 0.5)), r.normalTexture !== void 0 && i !== J && (c.push(t.assignTexture(o, "normalMap", r.normalTexture)), o.normalScale = new Je(1, 1), r.normalTexture.scale !== void 0)) {
      const h = r.normalTexture.scale;
      o.normalScale.set(h, h);
    }
    if (r.occlusionTexture !== void 0 && i !== J && (c.push(t.assignTexture(o, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (o.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && i !== J) {
      const h = r.emissiveFactor;
      o.emissive = new B().setRGB(h[0], h[1], h[2], U);
    }
    return r.emissiveTexture !== void 0 && i !== J && c.push(t.assignTexture(o, "emissiveMap", r.emissiveTexture, G)), Promise.all(c).then(function() {
      const h = new i(o);
      return r.name && (h.name = r.name), D(h, r), t.associations.set(h, { materials: e }), r.extensions && V(s, h, r), h;
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
    const t = Et.sanitizeNodeName(e || "");
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
    function r(o) {
      return n[C.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o, t).then(function(a) {
        return He(a, o, t);
      });
    }
    const i = [];
    for (let o = 0, a = e.length; o < a; o++) {
      const c = e[o], l = Bs(c), h = s[l];
      if (h)
        i.push(h.promise);
      else {
        let f;
        c.extensions && c.extensions[C.KHR_DRACO_MESH_COMPRESSION] ? f = r(c) : f = He(new te(), c, t), s[l] = { primitive: c, promise: f }, i.push(f);
      }
    }
    return Promise.all(i);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
   *
   * @private
   * @param {number} meshIndex
   * @return {Promise<Group|Mesh|SkinnedMesh|Line|Points>}
   */
  loadMesh(e) {
    const t = this, n = this.json, s = this.extensions, r = n.meshes[e], i = r.primitives, o = [];
    for (let a = 0, c = i.length; a < c; a++) {
      const l = i[a].material === void 0 ? Ds(this.cache) : this.getDependency("material", i[a].material);
      o.push(l);
    }
    return o.push(t.loadGeometries(i)), Promise.all(o).then(function(a) {
      const c = a.slice(0, a.length - 1), l = a[a.length - 1], h = [];
      for (let d = 0, g = l.length; d < g; d++) {
        const p = l[d], m = i[d];
        let _;
        const x = c[d];
        if (m.mode === P.TRIANGLES || m.mode === P.TRIANGLE_STRIP || m.mode === P.TRIANGLE_FAN || m.mode === void 0)
          _ = r.isSkinnedMesh === !0 ? new vt(p, x) : new Ee(p, x), _.isSkinnedMesh === !0 && _.normalizeSkinWeights(), m.mode === P.TRIANGLE_STRIP ? _.geometry = je(_.geometry, Ze) : m.mode === P.TRIANGLE_FAN && (_.geometry = je(_.geometry, Se));
        else if (m.mode === P.LINES)
          _ = new ve(p, x);
        else if (m.mode === P.LINE_STRIP)
          _ = new At(p, x);
        else if (m.mode === P.LINE_LOOP)
          _ = new Lt(p, x);
        else if (m.mode === P.POINTS)
          _ = new le(p, x);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + m.mode);
        Object.keys(_.geometry.morphAttributes).length > 0 && js(_, r), _.name = t.createUniqueName(r.name || "mesh_" + e), D(_, r), m.extensions && V(s, _, m), t.assignFinalMaterial(_), h.push(_);
      }
      for (let d = 0, g = h.length; d < g; d++)
        t.associations.set(h[d], {
          meshes: e,
          primitives: d
        });
      if (h.length === 1)
        return r.extensions && V(s, h[0], r), h[0];
      const f = new he();
      r.extensions && V(s, f, r), t.associations.set(f, { meshes: e });
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
    return n.type === "perspective" ? t = new It(Ft.radToDeg(s.yfov), s.aspectRatio || 1, s.znear || 1, s.zfar || 2e6) : n.type === "orthographic" && (t = new Ot(-s.xmag, s.xmag, s.ymag, -s.ymag, s.znear, s.zfar)), n.name && (t.name = this.createUniqueName(n.name)), D(t, n), Promise.resolve(t);
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
    for (let s = 0, r = t.joints.length; s < r; s++)
      n.push(this._loadNodeShallow(t.joints[s]));
    return t.inverseBindMatrices !== void 0 ? n.push(this.getDependency("accessor", t.inverseBindMatrices)) : n.push(null), Promise.all(n).then(function(s) {
      const r = s.pop(), i = s, o = [], a = [];
      for (let c = 0, l = i.length; c < l; c++) {
        const h = i[c];
        if (h) {
          o.push(h);
          const f = new fe();
          r !== null && f.fromArray(r.array, c * 16), a.push(f);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[c]);
      }
      return new Pt(o, a);
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
    const t = this.json, n = this, s = t.animations[e], r = s.name ? s.name : "animation_" + e, i = [], o = [], a = [], c = [], l = [];
    for (let h = 0, f = s.channels.length; h < f; h++) {
      const d = s.channels[h], g = s.samplers[d.sampler], p = d.target, m = p.node, _ = s.parameters !== void 0 ? s.parameters[g.input] : g.input, x = s.parameters !== void 0 ? s.parameters[g.output] : g.output;
      p.node !== void 0 && (i.push(this.getDependency("node", m)), o.push(this.getDependency("accessor", _)), a.push(this.getDependency("accessor", x)), c.push(g), l.push(p));
    }
    return Promise.all([
      Promise.all(i),
      Promise.all(o),
      Promise.all(a),
      Promise.all(c),
      Promise.all(l)
    ]).then(function(h) {
      const f = h[0], d = h[1], g = h[2], p = h[3], m = h[4], _ = [];
      for (let y = 0, b = f.length; y < b; y++) {
        const R = f[y], T = d[y], w = g[y], v = p[y], M = m[y];
        if (R === void 0) continue;
        R.updateMatrix && R.updateMatrix();
        const A = n._createAnimationTracks(R, T, w, v, M);
        if (A)
          for (let E = 0; E < A.length; E++)
            _.push(A[E]);
      }
      const x = new Nt(r, void 0, _);
      return D(x, s), x;
    });
  }
  createNodeMesh(e) {
    const t = this.json, n = this, s = t.nodes[e];
    return s.mesh === void 0 ? null : n.getDependency("mesh", s.mesh).then(function(r) {
      const i = n._getNodeRef(n.meshCache, s.mesh, r);
      return s.weights !== void 0 && i.traverse(function(o) {
        if (o.isMesh)
          for (let a = 0, c = s.weights.length; a < c; a++)
            o.morphTargetInfluences[a] = s.weights[a];
      }), i;
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
    const t = this.json, n = this, s = t.nodes[e], r = n._loadNodeShallow(e), i = [], o = s.children || [];
    for (let c = 0, l = o.length; c < l; c++)
      i.push(n.getDependency("node", o[c]));
    const a = s.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", s.skin);
    return Promise.all([
      r,
      Promise.all(i),
      a
    ]).then(function(c) {
      const l = c[0], h = c[1], f = c[2];
      f !== null && l.traverse(function(d) {
        d.isSkinnedMesh && d.bind(f, zs);
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
    const r = t.nodes[e], i = r.name ? s.createUniqueName(r.name) : "", o = [], a = s._invokeOne(function(c) {
      return c.createNodeMesh && c.createNodeMesh(e);
    });
    return a && o.push(a), r.camera !== void 0 && o.push(s.getDependency("camera", r.camera).then(function(c) {
      return s._getNodeRef(s.cameraCache, r.camera, c);
    })), s._invokeAll(function(c) {
      return c.createNodeAttachment && c.createNodeAttachment(e);
    }).forEach(function(c) {
      o.push(c);
    }), this.nodeCache[e] = Promise.all(o).then(function(c) {
      let l;
      if (r.isBone === !0 ? l = new Dt() : c.length > 1 ? l = new he() : c.length === 1 ? l = c[0] : l = new et(), l !== c[0])
        for (let h = 0, f = c.length; h < f; h++)
          l.add(c[h]);
      if (r.name && (l.userData.name = r.name, l.name = i), D(l, r), r.extensions && V(n, l, r), r.matrix !== void 0) {
        const h = new fe();
        h.fromArray(r.matrix), l.applyMatrix4(h);
      } else
        r.translation !== void 0 && l.position.fromArray(r.translation), r.rotation !== void 0 && l.quaternion.fromArray(r.rotation), r.scale !== void 0 && l.scale.fromArray(r.scale);
      if (!s.associations.has(l))
        s.associations.set(l, {});
      else if (r.mesh !== void 0 && s.meshCache.refs[r.mesh] > 1) {
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
    const t = this.extensions, n = this.json.scenes[e], s = this, r = new he();
    n.name && (r.name = s.createUniqueName(n.name)), D(r, n), n.extensions && V(t, r, n);
    const i = n.nodes || [], o = [];
    for (let a = 0, c = i.length; a < c; a++)
      o.push(s.getDependency("node", i[a]));
    return Promise.all(o).then(function(a) {
      for (let l = 0, h = a.length; l < h; l++)
        r.add(a[l]);
      const c = (l) => {
        const h = /* @__PURE__ */ new Map();
        for (const [f, d] of s.associations)
          (f instanceof ee || f instanceof Ie) && h.set(f, d);
        return l.traverse((f) => {
          const d = s.associations.get(f);
          d != null && h.set(f, d);
        }), h;
      };
      return s.associations = c(r), r;
    });
  }
  _createAnimationTracks(e, t, n, s, r) {
    const i = [], o = e.name ? e.name : e.uuid, a = [];
    z[r.path] === z.weights ? e.traverse(function(f) {
      f.morphTargetInfluences && a.push(f.name ? f.name : f.uuid);
    }) : a.push(o);
    let c;
    switch (z[r.path]) {
      case z.weights:
        c = Oe;
        break;
      case z.rotation:
        c = Pe;
        break;
      case z.translation:
      case z.scale:
        c = Fe;
        break;
      default:
        n.itemSize === 1 ? c = Oe : c = Fe;
        break;
    }
    const l = s.interpolation !== void 0 ? Ns[s.interpolation] : it, h = this._getArrayFromAccessor(n);
    for (let f = 0, d = a.length; f < d; f++) {
      const g = new c(
        a[f] + "." + z[r.path],
        t.array,
        h,
        l
      );
      s.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(g), i.push(g);
    }
    return i;
  }
  _getArrayFromAccessor(e) {
    let t = e.array;
    if (e.normalized) {
      const n = Le(t.constructor), s = new Float32Array(t.length);
      for (let r = 0, i = t.length; r < i; r++)
        s[r] = t[r] * n;
      t = s;
    }
    return t;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(n) {
      const s = this instanceof Pe ? Ps : at;
      return new s(this.times, this.values, this.getValueSize() / 3, n);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function Vs(u, e, t) {
  const n = e.attributes, s = new Ut();
  if (n.POSITION !== void 0) {
    const o = t.json.accessors[n.POSITION], a = o.min, c = o.max;
    if (a !== void 0 && c !== void 0) {
      if (s.set(
        new N(a[0], a[1], a[2]),
        new N(c[0], c[1], c[2])
      ), o.normalized) {
        const l = Le(W[o.componentType]);
        s.min.multiplyScalar(l), s.max.multiplyScalar(l);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else
    return;
  const r = e.targets;
  if (r !== void 0) {
    const o = new N(), a = new N();
    for (let c = 0, l = r.length; c < l; c++) {
      const h = r[c];
      if (h.POSITION !== void 0) {
        const f = t.json.accessors[h.POSITION], d = f.min, g = f.max;
        if (d !== void 0 && g !== void 0) {
          if (a.setX(Math.max(Math.abs(d[0]), Math.abs(g[0]))), a.setY(Math.max(Math.abs(d[1]), Math.abs(g[1]))), a.setZ(Math.max(Math.abs(d[2]), Math.abs(g[2]))), f.normalized) {
            const p = Le(W[f.componentType]);
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
  const i = new zt();
  s.getCenter(i.center), i.radius = s.min.distanceTo(s.max) / 2, u.boundingSphere = i;
}
function He(u, e, t) {
  const n = e.attributes, s = [];
  function r(i, o) {
    return t.getDependency("accessor", i).then(function(a) {
      u.setAttribute(o, a);
    });
  }
  for (const i in n) {
    const o = Ae[i] || i.toLowerCase();
    o in u.attributes || s.push(r(n[i], o));
  }
  if (e.indices !== void 0 && !u.index) {
    const i = t.getDependency("accessor", e.indices).then(function(o) {
      u.setIndex(o);
    });
    s.push(i);
  }
  return Ne.workingColorSpace !== U && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ne.workingColorSpace}" not supported.`), D(u, e), Vs(u, e, t), Promise.all(s).then(function() {
    return e.targets !== void 0 ? ks(u, e.targets, t) : u;
  });
}
const Gs = /^[og]\s*(.+)?/, Ks = /^mtllib /, Xs = /^usemtl /, Ys = /^usemap /, Ve = /\s+/, Ge = new N(), Te = new N(), Ke = new N(), Xe = new N(), O = new N(), oe = new B();
function Ws() {
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
        startMaterial: function(s, r) {
          const i = this._finalize(!1);
          i && (i.inherited || i.groupCount <= 0) && this.materials.splice(i.index, 1);
          const o = {
            index: this.materials.length,
            name: s || "",
            mtllib: Array.isArray(r) && r.length > 0 ? r[r.length - 1] : "",
            smooth: i !== void 0 ? i.smooth : this.smooth,
            groupStart: i !== void 0 ? i.groupEnd : 0,
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
          const r = this.currentMaterial();
          if (r && r.groupEnd === -1 && (r.groupEnd = this.geometry.vertices.length / 3, r.groupCount = r.groupEnd - r.groupStart, r.inherited = !1), s && this.materials.length > 1)
            for (let i = this.materials.length - 1; i >= 0; i--)
              this.materials[i].groupCount <= 0 && this.materials.splice(i, 1);
          return s && this.materials.length === 0 && this.materials.push({
            name: "",
            smooth: this.smooth
          }), r;
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
      const s = this.vertices, r = this.object.geometry.vertices;
      r.push(s[e + 0], s[e + 1], s[e + 2]), r.push(s[t + 0], s[t + 1], s[t + 2]), r.push(s[n + 0], s[n + 1], s[n + 2]);
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
      const s = this.normals, r = this.object.geometry.normals;
      r.push(s[e + 0], s[e + 1], s[e + 2]), r.push(s[t + 0], s[t + 1], s[t + 2]), r.push(s[n + 0], s[n + 1], s[n + 2]);
    },
    addFaceNormal: function(e, t, n) {
      const s = this.vertices, r = this.object.geometry.normals;
      Ge.fromArray(s, e), Te.fromArray(s, t), Ke.fromArray(s, n), O.subVectors(Ke, Te), Xe.subVectors(Ge, Te), O.cross(Xe), O.normalize(), r.push(O.x, O.y, O.z), r.push(O.x, O.y, O.z), r.push(O.x, O.y, O.z);
    },
    addColor: function(e, t, n) {
      const s = this.colors, r = this.object.geometry.colors;
      s[e] !== void 0 && r.push(s[e + 0], s[e + 1], s[e + 2]), s[t] !== void 0 && r.push(s[t + 0], s[t + 1], s[t + 2]), s[n] !== void 0 && r.push(s[n + 0], s[n + 1], s[n + 2]);
    },
    addUV: function(e, t, n) {
      const s = this.uvs, r = this.object.geometry.uvs;
      r.push(s[e + 0], s[e + 1]), r.push(s[t + 0], s[t + 1]), r.push(s[n + 0], s[n + 1]);
    },
    addDefaultUV: function() {
      const e = this.object.geometry.uvs;
      e.push(0, 0), e.push(0, 0), e.push(0, 0);
    },
    addUVLine: function(e) {
      const t = this.uvs;
      this.object.geometry.uvs.push(t[e + 0], t[e + 1]);
    },
    addFace: function(e, t, n, s, r, i, o, a, c) {
      const l = this.vertices.length;
      let h = this.parseVertexIndex(e, l), f = this.parseVertexIndex(t, l), d = this.parseVertexIndex(n, l);
      if (this.addVertex(h, f, d), this.addColor(h, f, d), o !== void 0 && o !== "") {
        const g = this.normals.length;
        h = this.parseNormalIndex(o, g), f = this.parseNormalIndex(a, g), d = this.parseNormalIndex(c, g), this.addNormal(h, f, d);
      } else
        this.addFaceNormal(h, f, d);
      if (s !== void 0 && s !== "") {
        const g = this.uvs.length;
        h = this.parseUVIndex(s, g), f = this.parseUVIndex(r, g), d = this.parseUVIndex(i, g), this.addUV(h, f, d), this.object.geometry.hasUVIndices = !0;
      } else
        this.addDefaultUV();
    },
    addPointGeometry: function(e) {
      this.object.geometry.type = "Points";
      const t = this.vertices.length;
      for (let n = 0, s = e.length; n < s; n++) {
        const r = this.parseVertexIndex(e[n], t);
        this.addVertexPoint(r), this.addColor(r);
      }
    },
    addLineGeometry: function(e, t) {
      this.object.geometry.type = "Line";
      const n = this.vertices.length, s = this.uvs.length;
      for (let r = 0, i = e.length; r < i; r++)
        this.addVertexLine(this.parseVertexIndex(e[r], n));
      for (let r = 0, i = t.length; r < i; r++)
        this.addUVLine(this.parseUVIndex(t[r], s));
    }
  };
  return u.startObject("", !1), u;
}
class $s extends de {
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
    const r = this, i = new ne(this.manager);
    i.setPath(this.path), i.setRequestHeader(this.requestHeader), i.setWithCredentials(this.withCredentials), i.load(e, function(o) {
      try {
        t(r.parse(o));
      } catch (a) {
        s ? s(a) : console.error(a), r.manager.itemError(e);
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
    const t = new Ws();
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
                G
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
        } else if ((s = Gs.exec(c)) !== null) {
          const h = (" " + s[0].slice(1).trim()).slice(1);
          t.startObject(h);
        } else if (Xs.test(c))
          t.object.startMaterial(c.substring(7).trim(), t.materialLibraries);
        else if (Ks.test(c))
          t.materialLibraries.push(c.substring(7).trim());
        else if (Ys.test(c))
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
    const r = new he();
    if (r.materialLibraries = [].concat(t.materialLibraries), !(t.objects.length === 1 && t.objects[0].geometry.vertices.length === 0) === !0)
      for (let o = 0, a = t.objects.length; o < a; o++) {
        const c = t.objects[o], l = c.geometry, h = c.materials, f = l.type === "Line", d = l.type === "Points";
        let g = !1;
        if (l.vertices.length === 0) continue;
        const p = new te();
        p.setAttribute("position", new H(l.vertices, 3)), l.normals.length > 0 && p.setAttribute("normal", new H(l.normals, 3)), l.colors.length > 0 && (g = !0, p.setAttribute("color", new H(l.colors, 3))), l.hasUVIndices === !0 && p.setAttribute("uv", new H(l.uvs, 2));
        const m = [];
        for (let x = 0, y = h.length; x < y; x++) {
          const b = h[x], R = b.name + "_" + b.smooth + "_" + g;
          let T = t.materials[R];
          if (this.materials !== null) {
            if (T = this.materials.create(b.name), f && T && !(T instanceof ce)) {
              const w = new ce();
              ee.prototype.copy.call(w, T), w.color.copy(T.color), T = w;
            } else if (d && T && !(T instanceof Z)) {
              const w = new Z({ size: 10, sizeAttenuation: !1 });
              ee.prototype.copy.call(w, T), w.color.copy(T.color), w.map = T.map, T = w;
            }
          }
          T === void 0 && (f ? T = new ce() : d ? T = new Z({ size: 1, sizeAttenuation: !1 }) : T = new Ht(), T.name = b.name, T.flatShading = !b.smooth, T.vertexColors = g, t.materials[R] = T), m.push(T);
        }
        let _;
        if (m.length > 1) {
          for (let x = 0, y = h.length; x < y; x++) {
            const b = h[x];
            p.addGroup(b.groupStart, b.groupCount, x);
          }
          f ? _ = new ve(p, m) : d ? _ = new le(p, m) : _ = new Ee(p, m);
        } else
          f ? _ = new ve(p, m[0]) : d ? _ = new le(p, m[0]) : _ = new Ee(p, m[0]);
        _.name = c.name, r.add(_);
      }
    else if (t.vertices.length > 0) {
      const o = new Z({ size: 1, sizeAttenuation: !1 }), a = new te();
      a.setAttribute("position", new H(t.vertices, 3)), t.colors.length > 0 && t.colors[0] !== void 0 && (a.setAttribute("color", new H(t.colors, 3)), o.vertexColors = !0);
      const c = new le(a, o);
      r.add(c);
    }
    return r;
  }
}
const ct = new S.MeshStandardMaterial({
  color: 16777215,
  roughness: 0.5,
  metalness: 0.1
});
function qs(u) {
  return u.split(".").pop()?.toLowerCase() ?? "";
}
function Zs(u) {
  const e = new S.Box3().setFromObject(u), t = e.getSize(new S.Vector3()), n = e.getCenter(new S.Vector3()), r = 3 / Math.max(t.x, t.y, t.z, 1e-6), i = new S.Group();
  for (i.position.set(-n.x, -n.y, -n.z); u.children.length > 0; )
    i.add(u.children[0]);
  u.add(i), u.scale.setScalar(r), u.updateMatrixWorld(!0);
}
function Ye(u) {
  u.traverse((e) => {
    e.isMesh && (e.material = ct.clone(), e.geometry && typeof e.geometry.computeVertexNormals == "function" && e.geometry.computeVertexNormals());
  });
}
function ye(u, e) {
  return new Promise((t, n) => {
    u.load(e, t, void 0, n);
  });
}
async function Js(u) {
  const e = qs(u.name), t = URL.createObjectURL(u);
  try {
    let n;
    if (e === "stl") {
      const s = new cs(), r = await ye(s, t);
      try {
        r.computeVertexNormals();
        const i = new S.Mesh(r, ct.clone());
        i.rotation.x = -Math.PI / 2, n = new S.Group(), n.add(i);
      } catch (i) {
        throw r.dispose(), i;
      }
    } else if (e === "obj") {
      const s = new $s();
      n = await ye(s, t), Ye(n);
    } else if (e === "gltf" || e === "glb") {
      const s = new ls();
      n = (await ye(s, t)).scene, Ye(n);
    } else
      throw new Error(`Unsupported model format: .${e}`);
    return Zs(n), { group: n, objectUrl: t };
  } catch (n) {
    throw URL.revokeObjectURL(t), new Error(`Failed to load model ${u.name}: ${n.message}`);
  }
}
const ue = {
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
}, lt = Object.freeze({
  spinX: !1,
  spinY: !0,
  spinZ: !1,
  float: !1,
  bounce: !1,
  pulse: !1,
  shake: !1,
  orbit: !1
});
Object.freeze(Object.keys(lt));
const ae = ue.float, X = 300;
function we(u) {
  return 1 - Math.pow(1 - u, 3);
}
class Qs {
  constructor() {
    this.useFadeInOut = !0, this.animationEffects = { ...lt }, this.speed = ue.spinY.defaultSpeed, this.showPhaseDuration = 2e4, this.animationDuration = 2500, this.phaseStartTime = performance.now(), this.time = 0, this.baseRotation = { x: 0, y: 0, z: 0 }, this._resetTransitions = { x: null, y: null, z: null, positionY: null, scale: null }, this._orbitBaseline = null, this._orbitRestorePending = null, this._previousEffects = null;
  }
  setFadeOptions(e = {}) {
    if (typeof e.useFadeInOut == "boolean" && (this.useFadeInOut = e.useFadeInOut), e.animationEffects && typeof e.animationEffects == "object" && (this.animationEffects = { ...this.animationEffects, ...e.animationEffects }), typeof e.animationSpeed == "number" && (this.speed = Math.max(0.01, e.animationSpeed)), typeof e.showPhaseDuration == "number" && (this.showPhaseDuration = e.showPhaseDuration), typeof e.animationDuration == "number" && (this.animationDuration = e.animationDuration), e.animationPreset && ue[e.animationPreset]?.type === "fadeInOut" && (this.useFadeInOut = !0), typeof e.rotateOnShow == "boolean" && e.rotateOnShow && e.showPreset) {
      const t = ue[e.showPreset];
      t?.type === "spin" && (this.animationEffects = { ...this.animationEffects, [e.showPreset]: !0 }), t?.type === "float" && (this.animationEffects = { ...this.animationEffects, float: !0 });
    }
  }
  setBaseRotation(e) {
    this.baseRotation = { ...e };
  }
  applyEffects(e, t, n) {
    if (!e) return;
    const s = this.animationEffects, r = this.speed * t;
    if (s.spinX && !this._resetTransitions.x && (e.rotation.x += r), s.spinY && !this._resetTransitions.y && (e.rotation.y += r), s.spinZ && !this._resetTransitions.z && (e.rotation.z += r), (s.float || s.bounce || s.pulse || s.shake || s.orbit) && (this.time += t), s.float) {
      const i = ae?.oscillateX, o = ae?.oscillateZ;
      this._resetTransitions.x || (e.rotation.x += Math.sin(this.time * 0.5) * i * t * 2), this._resetTransitions.z || (e.rotation.z += Math.sin(this.time * 0.3) * o * t * 2);
    }
    if (s.bounce && !this._resetTransitions.positionY && e.position && (e.position.y = Math.abs(Math.sin(this.time * this.speed * 1.8)) * 0.5), s.pulse && !this._resetTransitions.scale && e.scale?.setScalar && e.scale.setScalar(1 + Math.sin(this.time * this.speed * 1.5) * 0.12), s.shake && e.position) {
      const i = Math.floor(this.time * 30) * 2654435769 >>> 0, o = se(i);
      e.position.x = (o() - 0.5) * 0.08, e.position.z = (o() - 0.5) * 0.08;
    }
    if (s.orbit && n) {
      this._orbitBaseline || (this._orbitBaseline = {
        pos: n.position.clone(),
        quat: n.quaternion.clone()
      });
      const i = this._orbitBaseline.pos.length(), o = this.time * this.speed * 0.5;
      n.position.set(Math.sin(o) * i, this._orbitBaseline.pos.y, Math.cos(o) * i), n.lookAt(0, 0, 0);
    }
  }
  // Detect which axes just lost their driving animation and start lerps for them.
  _checkForResets(e) {
    if (!e) return;
    const t = this._previousEffects, n = this.animationEffects;
    t.spinX && !n.spinX && !this._resetTransitions.x && (this._resetTransitions.x = { startRotation: e.rotation.x, elapsed: 0 }), !t.spinX && n.spinX && (this._resetTransitions.x = null), t.spinY && !n.spinY && !this._resetTransitions.y && (this._resetTransitions.y = { startRotation: e.rotation.y, elapsed: 0 }), !t.spinY && n.spinY && (this._resetTransitions.y = null), t.spinZ && !n.spinZ && !this._resetTransitions.z && (this._resetTransitions.z = { startRotation: e.rotation.z, elapsed: 0 }), !t.spinZ && n.spinZ && (this._resetTransitions.z = null), t.float && !n.float && (!n.spinX && !this._resetTransitions.x && (this._resetTransitions.x = { startRotation: e.rotation.x, elapsed: 0 }), !n.spinZ && !this._resetTransitions.z && (this._resetTransitions.z = { startRotation: e.rotation.z, elapsed: 0 })), !t.float && n.float && (n.spinX || (this._resetTransitions.x = null), n.spinZ || (this._resetTransitions.z = null)), t.bounce && !n.bounce && !this._resetTransitions.positionY && e.position && (this._resetTransitions.positionY = { startValue: e.position.y, elapsed: 0 }), !t.bounce && n.bounce && (this._resetTransitions.positionY = null), t.pulse && !n.pulse && !this._resetTransitions.scale && e.scale && (this._resetTransitions.scale = { startValue: e.scale.x ?? 1, elapsed: 0 }), !t.pulse && n.pulse && (this._resetTransitions.scale = null), t.shake && !n.shake && e.position && (e.position.x = 0, e.position.z = 0), t.orbit && !n.orbit && this._orbitBaseline && (this._orbitRestorePending = this._orbitBaseline, this._orbitBaseline = null), !t.orbit && n.orbit && (this._orbitRestorePending = null);
  }
  // Advance all active lerps and write corrected rotation values.
  _applyResetTransitions(e, t) {
    if (!e) return;
    const n = t * 1e3;
    for (const i of ["x", "y", "z"]) {
      const o = this._resetTransitions[i];
      if (!o) continue;
      o.elapsed += n;
      const a = Math.min(o.elapsed / X, 1), c = we(a);
      e.rotation[i] = o.startRotation * (1 - c), o.elapsed >= X && (e.rotation[i] = 0, this._resetTransitions[i] = null);
    }
    const s = this._resetTransitions.positionY;
    if (s && e.position) {
      s.elapsed += t * 1e3;
      const i = we(Math.min(s.elapsed / X, 1));
      e.position.y = s.startValue * (1 - i), s.elapsed >= X && (e.position.y = 0, this._resetTransitions.positionY = null);
    }
    const r = this._resetTransitions.scale;
    if (r && e.scale?.setScalar) {
      r.elapsed += t * 1e3;
      const i = we(Math.min(r.elapsed / X, 1));
      e.scale.setScalar(r.startValue + (1 - r.startValue) * i), r.elapsed >= X && (e.scale.setScalar(1), this._resetTransitions.scale = null);
    }
  }
  _clearResetTransitions() {
    this._resetTransitions = { x: null, y: null, z: null, positionY: null, scale: null }, this._orbitRestorePending = null;
  }
  update(e, t, n = 1 / 60, s) {
    if (this._previousEffects === null && (this._previousEffects = { ...this.animationEffects }), this._checkForResets(e), this._orbitRestorePending && s && (s.position.copy(this._orbitRestorePending.pos), s.quaternion.copy(this._orbitRestorePending.quat), this._orbitRestorePending = null), this._previousEffects = { ...this.animationEffects }, !this.useFadeInOut) {
      t.getAnimationPhase() !== "show" && t.startAnimation("show"), this.applyEffects(e, n, s), this._applyResetTransitions(e, n);
      return;
    }
    const r = performance.now(), i = t.getAnimationPhase();
    i === "fadeIn" && t.isAnimationComplete() ? (t.startAnimation("show"), this.phaseStartTime = r) : i === "show" ? (this.applyEffects(e, n, s), this._applyResetTransitions(e, n), r - this.phaseStartTime >= this.showPhaseDuration && t.startAnimation("fadeOut")) : i === "fadeOut" && (this.applyEffects(e, n, s), this._applyResetTransitions(e, n), t.isAnimationComplete() && t.startAnimation("fadeIn"));
  }
  getLoopDurationMs() {
    return this.useFadeInOut ? this.animationDuration * 2 + this.showPhaseDuration : Math.round(2 * Math.PI / this.speed * 1e3);
  }
  resetToStart() {
    this.time = 0, this.phaseStartTime = 0, this._clearResetTransitions(), this._orbitBaseline = null;
  }
  // Apply the animation state for an absolute position within the loop.
  // Sets model rotation from t=0 and configures effect phase/progress.
  // Safe to call with a paused renderer loop.
  seekTo(e, t, n, s) {
    this._clearResetTransitions();
    const r = e / 1e3;
    if (this.time = r, t) {
      t.rotation.set(0, 0, 0), t.position && (t.position.x = 0, t.position.y = 0, t.position.z = 0), t.scale?.setScalar && t.scale.setScalar(1);
      const i = this.animationEffects, o = this.speed;
      let a = r;
      if (this.useFadeInOut) {
        const c = this.animationDuration / 1e3;
        r < c ? a = 0 : a = r - c;
      }
      if (i.spinX && (t.rotation.x += o * a), i.spinY && (t.rotation.y += o * a), i.spinZ && (t.rotation.z += o * a), i.float) {
        const c = ae?.oscillateX, l = ae?.oscillateZ;
        t.rotation.x += c * 4 * (1 - Math.cos(0.5 * a)), t.rotation.z += l * 2 / 0.3 * (1 - Math.cos(0.3 * a));
      }
      if (i.bounce && t.position && (t.position.y = Math.abs(Math.sin(a * o * 1.8)) * 0.5), i.pulse && t.scale?.setScalar && t.scale.setScalar(1 + Math.sin(a * o * 1.5) * 0.12), i.shake && t.position) {
        const c = Math.floor(a * 30) * 2654435769 >>> 0, l = se(c);
        t.position.x = (l() - 0.5) * 0.08, t.position.z = (l() - 0.5) * 0.08;
      }
    }
    if (this.animationEffects.orbit && s) {
      const i = e / 1e3, o = this._orbitBaseline ? this._orbitBaseline.pos.length() : 5, a = this._orbitBaseline ? this._orbitBaseline.pos.y : 0.5, c = i * this.speed * 0.5;
      s.position.set(Math.sin(c) * o, a, Math.cos(c) * o), s.lookAt(0, 0, 0);
    }
    if (n)
      if (this.useFadeInOut) {
        const i = this.animationDuration, o = this.showPhaseDuration, a = e;
        a < i ? n.setPhaseProgress("fadeIn", a / i) : a < i + o ? n.setPhaseProgress("show", 1) : n.setPhaseProgress("fadeOut", (a - i - o) / i);
      } else
        n.setPhaseProgress("show", 1);
  }
}
function en(u, e) {
  if (e >= 1) return u;
  if (u.startsWith("#")) {
    const t = parseInt(u.slice(1, 3), 16), n = parseInt(u.slice(3, 5), 16), s = parseInt(u.slice(5, 7), 16);
    return `rgba(${t},${n},${s},${e})`;
  }
  return u.startsWith("rgb(") ? u.replace("rgb(", "rgba(").replace(")", `,${e})`) : u;
}
class tn extends $ {
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
  drawPixel(e, t, n, s, r = 1) {
    if (!this._bitmapCtx) return;
    const i = r < 1 ? en(s, r) : s;
    i !== this._lastFillStyle && (this._bitmapCtx.fillStyle = i, this._lastFillStyle = i), this._bitmapCtx.fillRect(e, t, this.options.pixelSize, this.options.pixelSize);
  }
  render(e, t, n, s) {
    const { pixelSize: r, minBrightness: i, invert: o } = this.options;
    for (let a = 0; a < n; a++)
      for (let c = 0; c < t; c++) {
        const l = (a * t + c) * 4, h = e[l], f = e[l + 1], d = e[l + 2];
        if (e[l + 3] === 0) continue;
        const p = (0.3 * h + 0.59 * f + 0.11 * d) / 255;
        if (p < i) continue;
        const m = o ? 1 - p : p;
        if (!this.shouldDraw(m)) continue;
        const _ = s(m);
        this.drawPixel(c * r, a * r, m, _, 1);
      }
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
const We = {
  classic: " .:-=+*#%@",
  blocks: " ░▒▓█",
  dense: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  minimal: " .+#"
}, sn = "Menlo, Monaco, Consolas, monospace";
class nn extends $ {
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
    const n = We[this.options.charRamp] ?? We.classic;
    this._rampChars = Array.from(n), this._rampLen = this._rampChars.length, this._cellW = this._bitmapCanvas.width / e, this._cellH = this._bitmapCanvas.height / t;
    const s = Math.max(6, Math.floor(this._cellH));
    this._fontStr = `${s}px ${sn}`;
    const r = this._bitmapCtx;
    r.font = this._fontStr, r.textBaseline = "top", r.textAlign = "left";
    const i = r.measureText("M");
    this._xOffset = Math.max(0, (this._cellW - i.width) * 0.5), this._lastGridW = e, this._lastGridH = t, this._dirty = !1, this._lastFill = null;
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
  drawPixel(e, t, n, s, r = 1) {
    if (!this._bitmapCtx) return;
    if ((this._dirty || this._cellW === 0) && this._bitmapCanvas.width > 0) {
      const { pixelSize: g } = this.options, p = Math.max(1, Math.floor(this._bitmapCanvas.width / g)), m = Math.max(1, Math.floor(this._bitmapCanvas.height / g));
      this._prepare(p, m);
    }
    if (this._cellW === 0 || this._cellH === 0) return;
    const i = this._glyphFor(n);
    if (!i) return;
    const o = this._bitmapCtx, { pixelSize: a, asciiColored: c, colors: l } = this.options, h = Math.round(e / a), f = Math.round(t / a);
    this._fontStr && (o.font = this._fontStr, o.textBaseline = "top", o.textAlign = "left");
    const d = c ? s : l?.[l.length - 1] ?? s;
    r < 1 && (o.globalAlpha = r), o.fillStyle = d, o.fillText(i, h * this._cellW + this._xOffset, f * this._cellH), r < 1 && (o.globalAlpha = 1);
  }
  render(e, t, n, s) {
    if (!this._bitmapCtx || t === 0 || n === 0) return;
    (this._dirty || t !== this._lastGridW || n !== this._lastGridH) && this._prepare(t, n);
    const { minBrightness: r, invert: i, asciiColored: o } = this.options, a = this._bitmapCtx;
    a.font = this._fontStr, a.textBaseline = "top", a.textAlign = "left";
    for (let c = 0; c < n; c++)
      for (let l = 0; l < t; l++) {
        const h = (c * t + l) * 4, f = e[h], d = e[h + 1], g = e[h + 2];
        if (e[h + 3] === 0) continue;
        const m = (0.2126 * f + 0.7152 * d + 0.0722 * g) / 255;
        if (m < r) continue;
        const _ = i ? 1 - m : m, x = Math.min(Math.round(_ * (this._rampLen - 1)), this._rampLen - 1), y = this._rampChars[x];
        if (y === " ") continue;
        const b = s(o ? _ : 1);
        b !== this._lastFill && (a.fillStyle = b, this._lastFill = b), a.fillText(y, l * this._cellW + this._xOffset, c * this._cellH);
      }
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
const rn = Math.PI / 180;
class on extends $ {
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
    return (e % 180 + 180) % 180 * rn;
  }
  // ---------------------------------------------------------------------------
  // Public render / drawPixel
  // ---------------------------------------------------------------------------
  render(e, t, n, s) {
    const r = this._bitmapCtx;
    if (!r) return;
    const { pixelSize: i, minBrightness: o, invert: a, halftoneAngle: c } = this.options, l = i, h = l * 0.5 * 0.95, f = 0.5, d = this._normalizeRad(c), g = d !== 0;
    g && (r.save(), r.translate(this._bitmapCanvas.width / 2, this._bitmapCanvas.height / 2), r.rotate(d), r.translate(-this._bitmapCanvas.width / 2, -this._bitmapCanvas.height / 2));
    let p = null;
    for (let m = 0; m < n; m++)
      for (let _ = 0; _ < t; _++) {
        const x = (m * t + _) * 4, y = e[x], b = e[x + 1], R = e[x + 2];
        if (e[x + 3] === 0) continue;
        const w = (0.2126 * y + 0.7152 * b + 0.0722 * R) / 255;
        if (w < o) continue;
        const v = a ? 1 - w : w, M = (1 - v) * h;
        if (M < f) continue;
        const A = Math.min(h, M), E = _ * l + l / 2, L = m * l + l / 2, I = s(v);
        I !== p && (r.fillStyle = I, p = I), this._drawDot(r, E, L, A);
      }
    g && r.restore();
  }
  /**
   * Draw a single dot during fade animations.
   * x/y arrive as (gx * pixelSize, gy * pixelSize) from BitmapEffect.initializeParticles.
   * We recover the grid cell, compute the rotated dot center to match render(), and draw.
   */
  drawPixel(e, t, n, s, r = 1) {
    const i = this._bitmapCtx;
    if (!i) return;
    const { pixelSize: o, halftoneAngle: a } = this.options, c = o, l = c * 0.5 * 0.95, h = 0.5, f = (1 - n) * l;
    if (f < h) return;
    const d = Math.min(l, f), g = Math.round(e / o), p = Math.round(t / o);
    let m = g * c + c / 2, _ = p * c + c / 2;
    if (a !== 0) {
      const b = this._normalizeRad(a), R = Math.cos(b), T = Math.sin(b), w = this._bitmapCanvas.width, v = this._bitmapCanvas.height, M = m - w / 2, A = _ - v / 2;
      m = w / 2 + M * R - A * T, _ = v / 2 + M * T + A * R;
    }
    const x = i.globalAlpha, y = i.fillStyle;
    r < 1 && (i.globalAlpha = r), i.fillStyle = s, this._drawDot(i, m, _, d), i.globalAlpha = x, i.fillStyle = y;
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class an extends $ {
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
    const r = t - s, i = n - s, o = s * 2;
    if (this.options.ledShape === "roundRect") {
      const a = s * 0.35;
      if (this._hasRoundRect)
        e.beginPath(), e.roundRect(r, i, o, o, a), e.fill();
      else {
        const c = Math.min(a, s);
        e.beginPath(), e.moveTo(r + c, i), e.lineTo(r + o - c, i), e.arcTo(r + o, i, r + o, i + c, c), e.lineTo(r + o, i + o - c), e.arcTo(r + o, i + o, r + o - c, i + o, c), e.lineTo(r + c, i + o), e.arcTo(r, i + o, r, i + o - c, c), e.lineTo(r, i + c), e.arcTo(r, i, r + c, i, c), e.closePath(), e.fill();
      }
    } else
      e.beginPath(), e.arc(t, n, s, 0, Math.PI * 2), e.fill();
  }
  // ---------------------------------------------------------------------------
  // Public render / drawPixel
  // ---------------------------------------------------------------------------
  render(e, t, n, s) {
    const r = this._bitmapCtx;
    if (!r) return;
    const { pixelSize: i, ledGap: o, minBrightness: a, invert: c } = this.options, h = Math.max(1, i - o) / 2;
    let f = null;
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = (d * t + g) * 4, m = e[p], _ = e[p + 1], x = e[p + 2], y = e[p + 3];
        if (y === 0) continue;
        const R = (0.2126 * m + 0.7152 * _ + 0.0722 * x) / 255 * (y / 255);
        if (R < a) continue;
        const T = c ? 1 - R : R, w = g * i + i / 2, v = d * i + i / 2, M = s(T);
        M !== f && (r.fillStyle = M, f = M), this._drawLed(r, w, v, h);
      }
  }
  /**
   * Draw a single LED during fade animations.
   * x/y arrive as (gx * pixelSize, gy * pixelSize) from BitmapEffect.initializeParticles.
   * We snap to the nearest grid-cell center (intentional LED grid aesthetic).
   * Glow is intentionally skipped here for performance — particles are short-lived.
   */
  drawPixel(e, t, n, s, r = 1) {
    const i = this._bitmapCtx;
    if (!i) return;
    const { pixelSize: o, ledGap: a } = this.options, l = Math.max(1, o - a) / 2, h = Math.round(e / o), f = Math.round(t / o), d = h * o + o / 2, g = f * o + o / 2, p = i.globalAlpha, m = i.fillStyle;
    r < 1 && (i.globalAlpha = r), i.fillStyle = s, this._drawLed(i, d, g, l), i.globalAlpha = p, i.fillStyle = m;
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class cn extends $ {
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
    const { pixelSize: r, minBrightness: i, invert: o, stippleDotSize: a, stippleDensity: c, seed: l } = this.options, h = se(l ?? 305419896), f = this._bitmapCtx;
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = (d * t + g) * 4, m = e[p], _ = e[p + 1], x = e[p + 2];
        if (e[p + 3] === 0) continue;
        const b = (0.2126 * m + 0.7152 * _ + 0.0722 * x) / 255;
        if (b < i) continue;
        const R = o ? 1 - b : b, T = (1 - R) * c, w = Math.max(0, Math.round(T));
        if (w === 0) continue;
        const v = s(R);
        f.fillStyle = v;
        const M = g * r, A = d * r;
        for (let E = 0; E < w; E++) {
          const L = M + h() * r, I = A + h() * r, K = a * (0.6 + h() * 0.4);
          f.beginPath(), f.arc(L, I, K, 0, Math.PI * 2), f.fill();
        }
      }
  }
  /**
   * Draw a single dot during fade animations.
   * x/y are canvas coordinates (gx * pixelSize, gy * pixelSize).
   * Uses a position-derived seed so the dot stays stable across frames.
   */
  drawPixel(e, t, n, s, r = 1) {
    if (!this._bitmapCtx) return;
    const { stippleDotSize: i, seed: o, pixelSize: a } = this.options, c = ((o ?? 305419896) ^ (e * 73856093 >>> 0 ^ t * 19349663 >>> 0)) >>> 0, l = se(c), h = this._bitmapCtx, f = i * (0.6 + l() * 0.4), d = e + a * 0.5, g = t + a * 0.5;
    r < 1 && (h.globalAlpha = r), h.fillStyle = s, h.beginPath(), h.arc(d, g, f, 0, Math.PI * 2), h.fill(), r < 1 && (h.globalAlpha = 1);
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class ln {
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
const hn = new ln(), $e = {
  bitmap: rt,
  pixelArt: tn,
  ascii: nn,
  halftone: on,
  ledMatrix: an,
  stipple: cn
};
function un(u, e = {}) {
  const t = $e[u];
  if (t) return new t(e);
  const n = hn.getRenderer(u);
  if (n) return new n.RendererClass(e);
  throw new Error(`Unknown render mode: "${u}". Valid modes: ${Object.keys($e).join(", ")}`);
}
const ht = {
  cube: { size: 1 },
  sphere: { radius: 1, widthSegments: 32, heightSegments: 32 },
  torus: { radius: 0.8, tube: 0.3, radialSegments: 16, tubularSegments: 100 },
  cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1.5, radialSegments: 32 },
  cone: { radius: 0.8, height: 1.5, radialSegments: 32 },
  icosahedron: { radius: 1, detail: 0 },
  torusKnot: { radius: 0.7, tube: 0.2, tubularSegments: 100, radialSegments: 16 },
  plane: { width: 2, height: 2 }
};
function fn(u, e) {
  const t = { ...ht[u], ...e };
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
      throw new Error(`Unknown shape: "${u}". Valid types: ${pn().join(", ")}`);
  }
}
function dn(u, e = {}) {
  const t = fn(u, e), n = new S.MeshStandardMaterial({ color: 16777215 }), s = new S.Mesh(t, n), r = new S.Group();
  return r.add(s), r;
}
function pn() {
  return Object.keys(ht);
}
class mn extends Vt {
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
class gn extends de {
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
    const r = this, i = new ne(this.manager);
    i.setPath(this.path), i.setRequestHeader(this.requestHeader), i.setWithCredentials(this.withCredentials), i.load(e, function(o) {
      const a = r.parse(JSON.parse(o));
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
    return new _n(e);
  }
}
class _n {
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
    const s = [], r = bn(e, t, this.data, n);
    for (let i = 0, o = r.length; i < o; i++)
      s.push(...r[i].toShapes());
    return s;
  }
}
function bn(u, e, t, n) {
  const s = Array.from(u), r = e / t.resolution, i = (t.boundingBox.yMax - t.boundingBox.yMin + t.underlineThickness) * r, o = [];
  let a = 0, c = 0;
  (n == "rtl" || n == "tb") && s.reverse();
  for (let l = 0; l < s.length; l++) {
    const h = s[l];
    if (h === `
`)
      a = 0, c -= i;
    else {
      const f = xn(h, r, a, c, t);
      n == "tb" ? (a = 0, c += t.ascender * r) : a += f.offsetX, o.push(f.path);
    }
  }
  return o;
}
function xn(u, e, t, n, s) {
  const r = s.glyphs[u] || s.glyphs["?"];
  if (!r) {
    console.error('THREE.Font: character "' + u + '" does not exists in font family ' + s.familyName + ".");
    return;
  }
  const i = new Gt();
  let o, a, c, l, h, f, d, g;
  if (r.o) {
    const p = r._cachedOutline || (r._cachedOutline = r.o.split(" "));
    for (let m = 0, _ = p.length; m < _; )
      switch (p[m++]) {
        case "m":
          o = p[m++] * e + t, a = p[m++] * e + n, i.moveTo(o, a);
          break;
        case "l":
          o = p[m++] * e + t, a = p[m++] * e + n, i.lineTo(o, a);
          break;
        case "q":
          c = p[m++] * e + t, l = p[m++] * e + n, h = p[m++] * e + t, f = p[m++] * e + n, i.quadraticCurveTo(h, f, c, l);
          break;
        case "b":
          c = p[m++] * e + t, l = p[m++] * e + n, h = p[m++] * e + t, f = p[m++] * e + n, d = p[m++] * e + t, g = p[m++] * e + n, i.bezierCurveTo(h, f, d, g, c, l);
          break;
      }
  }
  return { offsetX: r.ha * e, path: i };
}
const qe = {
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
}, Tn = new gn(), Re = /* @__PURE__ */ new Map();
async function yn(u) {
  if (Re.has(u)) return Re.get(u);
  const e = qe[u] ?? qe.helvetiker, { default: t } = await e(), n = Tn.parse(t);
  return Re.set(u, n), n;
}
async function wn(u, e = {}) {
  const { fontFamily: t = "helvetiker", fontSize: n = 1, extrudeDepth: s = 0.3, bevelEnabled: r = !0 } = e, i = await yn(t), o = new mn(u || "Text", {
    font: i,
    size: n,
    depth: s,
    bevelEnabled: r,
    bevelThickness: 0.05 * n,
    bevelSize: 0.03 * n,
    bevelSegments: 3
  });
  o.computeBoundingBox(), o.center();
  const a = new S.MeshStandardMaterial({ color: 16777215 }), c = new S.Mesh(o, a), l = new S.Group();
  return l.add(c), l;
}
function Rn(u) {
  return new Promise((e, t) => {
    const n = u.type === "image/svg+xml" || u.name.toLowerCase().endsWith(".svg"), s = URL.createObjectURL(u);
    if (n) {
      const r = new Image();
      r.onload = () => {
        const i = Math.min(r.naturalWidth || 512, 2048), o = Math.min(r.naturalHeight || 512, 2048), a = document.createElement("canvas");
        a.width = i, a.height = o, a.getContext("2d").drawImage(r, 0, 0, i, o), URL.revokeObjectURL(s), e({ element: a, width: i, height: o, objectUrl: null });
      }, r.onerror = () => {
        URL.revokeObjectURL(s), t(new Error("Failed to load SVG"));
      }, r.src = s;
    } else {
      const r = new Image();
      r.onload = () => {
        e({ element: r, width: r.naturalWidth, height: r.naturalHeight, objectUrl: s });
      }, r.onerror = () => {
        URL.revokeObjectURL(s), t(new Error("Failed to load image"));
      }, r.src = s;
    }
  });
}
async function Sn(u) {
  const { element: e, width: t, height: n, objectUrl: s } = await Rn(u), r = new S.Texture(e);
  r.needsUpdate = !0;
  const i = t / n, o = i >= 1 ? 2 : 2 * i, a = i >= 1 ? 2 / i : 2, c = new S.PlaneGeometry(o, a), l = new S.MeshBasicMaterial({ map: r, side: S.DoubleSide }), h = new S.Mesh(c, l), f = new S.Group();
  return f.add(h), { group: f, objectUrl: s };
}
class Cn {
  /**
   * @param {HTMLElement} container - DOM element to render into. The effect canvas is appended as a child.
   * @param {object} [effectOptions] - Initial BitmapEffect options (pixelSize, ditherType, colors, backgroundColor, etc.)
   */
  constructor(e, t = {}) {
    this.container = e, this.scene = new S.Scene(), this.camera = new S.PerspectiveCamera(75, 1, 0.1, 1e3), this.camera.position.set(0, 0.5, 5), this.camera.lookAt(0, 0, 0), this.renderer = new S.WebGLRenderer({ antialias: !0, alpha: !0, preserveDrawingBuffer: !0 }), this.renderer.setClearColor(0, 0), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), this.effect = new as(this.renderer, t), this.container.appendChild(this.effect.domElement), t.backgroundColor && t.backgroundColor !== "transparent" && (this.scene.background = new S.Color(t.backgroundColor)), this.ambientLight = new S.AmbientLight(16777215, 0.15), this.keyLight = new S.DirectionalLight(16777215, 1.5), this.fillLight = new S.DirectionalLight(16777215, 0.4), this.rimLight = new S.DirectionalLight(16777215, 0.8), this.keyLight.position.set(3, 4, 5), this.fillLight.position.set(-4, 2, 3), this.rimLight.position.set(0, 2, -5), this.scene.add(this.ambientLight, this.keyLight, this.fillLight, this.rimLight), this.baseGroup = new S.Group(), this.animGroup = new S.Group(), this.baseGroup.add(this.animGroup), this.scene.add(this.baseGroup), this.animationEngine = new Qs(), this.objectGroup = null, this.currentObjectUrl = null, this.lastFrameTime = performance.now(), this._onFrameRendered = null, this._animationLoop = () => {
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
        const { group: t, objectUrl: n } = await Js(e);
        this._setObject(t, n);
      } finally {
        this._loading = !1;
      }
    }
  }
  loadShape(e, t = {}) {
    this._setObject(dn(e, t));
  }
  async loadText(e, t = {}) {
    if (!this._loading) {
      this._loading = !0;
      try {
        const n = await wn(e, t);
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
        const { group: t, objectUrl: n } = await Sn(e);
        this._setObject(t, n);
      } finally {
        this._loading = !1;
      }
    }
  }
  disposeModel() {
    this.objectGroup && (this.animGroup.remove(this.objectGroup), Mn(this.objectGroup), this.objectGroup = null), this.currentObjectUrl && (URL.revokeObjectURL(this.currentObjectUrl), this.currentObjectUrl = null);
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
    const t = un(e, this.effect.options);
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
function Mn(u) {
  u.traverse((e) => {
    if (e.geometry && e.geometry.dispose?.(), e.material) {
      const t = Array.isArray(e.material) ? e.material : [e.material];
      for (const n of t)
        if (n) {
          for (const s of Object.keys(n)) {
            const r = n[s];
            r && typeof r == "object" && typeof r.dispose == "function" && r.isTexture && r.dispose();
          }
          n.dispose?.();
        }
    }
  });
}
function En(u) {
  const e = typeof u == "string" ? JSON.parse(u) : u;
  if (!e || typeof e != "object") throw new Error("Invalid .bforge file");
  if (!e.version) throw new Error("Missing version field in .bforge file");
  const t = e.version === 1 ? vn(e) : e;
  return {
    settings: t.settings ?? {},
    modelData: t.model ?? null,
    // { name, type, format, data: base64 } | null
    inputType: t.settings?.inputType ?? "model",
    version: t.version
  };
}
function vn(u) {
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
const An = ["src", "autoplay", "loop", "width", "height", "render-mode"];
class Ln extends HTMLElement {
  static get observedAttributes() {
    return An;
  }
  connectedCallback() {
    this._shadow = this.attachShadow({ mode: "open" });
    const e = document.createElement("style");
    e.textContent = ":host { display: block; } canvas { width: 100%; height: 100%; }", this._container = document.createElement("div"), this._container.style.cssText = "width:100%;height:100%;position:relative;overflow:hidden", this._shadow.append(e, this._container), this._onVisibility = () => {
      document.hidden ? this._manager?.pauseLoop?.() : this._manager?.resumeLoop?.();
    }, document.addEventListener("visibilitychange", this._onVisibility), this._ro = new ResizeObserver(([s]) => {
      const { width: r, height: i } = s.contentRect;
      this._manager?.setSize(r * devicePixelRatio, i * devicePixelRatio);
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
        const n = await t.text(), { settings: s, modelData: r, inputType: i } = En(n), o = this._container.clientWidth || 400, a = this._container.clientHeight || 400;
        if (this._manager = new Cn(this._container, { ...s }), this._manager.setSize(o * devicePixelRatio, a * devicePixelRatio), i === "model" && r) {
          const l = atob(r.data), h = new Uint8Array(l.length);
          for (let g = 0; g < l.length; g++) h[g] = l.charCodeAt(g);
          const f = new Blob([h], { type: r.type }), d = new File([f], r.name);
          await this._manager.loadModel(d);
        } else i === "shape" ? this._manager.loadShape(s.shapeType, s.shapeParams) : i === "text" ? await this._manager.loadText(s.textContent, {
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          extrudeDepth: s.extrudeDepth,
          bevelEnabled: s.bevelEnabled
        }) : i === "image" && console.warn(
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
function In(u = "bitmap-forge") {
  typeof customElements > "u" || customElements.get(u) || customElements.define(u, Ln);
}
typeof customElements < "u" && In();
export {
  Ln as BitmapForgeElement,
  In as defineBitmapForgeElement
};
