import * as S from "three";
import { Loader as me, FileLoader as ne, BufferGeometry as te, Color as B, SRGBColorSpace as V, BufferAttribute as K, Vector3 as N, Float32BufferAttribute as G, TrianglesDrawMode as wt, TriangleFanDrawMode as Re, TriangleStripDrawMode as it, LoaderUtils as Q, MeshPhysicalMaterial as k, Vector2 as rt, LinearSRGBColorSpace as U, SpotLight as Mt, PointLight as St, DirectionalLight as Rt, Matrix4 as pe, Quaternion as ot, InstancedMesh as Ct, InstancedBufferAttribute as Et, Object3D as at, TextureLoader as vt, ImageBitmapLoader as At, InterleavedBuffer as Lt, InterleavedBufferAttribute as It, LinearMipmapLinearFilter as ct, NearestMipmapLinearFilter as Pt, LinearMipmapNearestFilter as Ft, NearestMipmapNearestFilter as Ot, LinearFilter as Ce, NearestFilter as lt, RepeatWrapping as Ee, MirroredRepeatWrapping as Nt, ClampToEdgeWrapping as Dt, PointsMaterial as Z, Material as ee, LineBasicMaterial as he, MeshStandardMaterial as ht, DoubleSide as kt, MeshBasicMaterial as J, PropertyBinding as jt, SkinnedMesh as Bt, Mesh as ve, LineSegments as Ae, Line as Ut, LineLoop as Ht, Points as ue, Group as fe, PerspectiveCamera as Gt, MathUtils as zt, OrthographicCamera as Vt, Skeleton as Xt, AnimationClip as Kt, Bone as Yt, InterpolateDiscrete as Wt, InterpolateLinear as ut, Texture as Pe, VectorKeyframeTrack as Fe, NumberKeyframeTrack as Oe, QuaternionKeyframeTrack as Ne, ColorManagement as De, FrontSide as $t, Interpolant as qt, Box3 as Zt, Sphere as Jt, MeshPhongMaterial as Qt, ExtrudeGeometry as es, ShapePath as ts } from "three";
function se(u) {
  let e = u >>> 0 || 1;
  return function() {
    return e = Math.imul(e, 1664525) + 1013904223 >>> 0, e / 4294967296;
  };
}
class ss {
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
    const s = parseInt(e.slice(1, 3), 16), i = parseInt(e.slice(3, 5), 16), r = parseInt(e.slice(5, 7), 16), a = parseInt(t.slice(1, 3), 16), o = parseInt(t.slice(3, 5), 16), c = parseInt(t.slice(5, 7), 16), l = Math.round(s + (a - s) * n), h = Math.round(i + (o - i) * n), f = Math.round(r + (c - r) * n);
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
    const a = Math.sqrt(this.width * this.width + this.height * this.height) / 2;
    for (let o = 0; o < t; o++)
      for (let c = 0; c < e; c++) {
        const l = (o * e + c) * 4, h = s[l], f = s[l + 1], d = s[l + 2], g = s[l + 3], p = this.getBrightness(h, f, d);
        if (g === 0 || p < this.options.minBrightness) {
          r++;
          continue;
        }
        const m = this.options.invert ? 1 - p : p;
        if (!i(m, c, o)) {
          r++;
          continue;
        }
        const _ = c * n, b = o * n;
        let T, x;
        if (this._rng)
          T = this._rng() * Math.PI * 2, x = 300 + this._rng() * 500;
        else {
          const E = r * 0.1, L = Math.sin(E * 12.9898 + E * 78.233) * 43758.5453, I = L - Math.floor(L);
          T = I * Math.PI * 2, x = 300 + I * 500;
        }
        const w = this.width / 2 + Math.cos(T) * x, y = this.height / 2 + Math.sin(T) * x, M = _ - this.width / 2, v = b - this.height / 2, C = Math.sqrt(M * M + v * v), A = C / a * 0.4;
        this.particles.push({
          idx: r,
          startX: w,
          startY: y,
          finalX: _,
          finalY: b,
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
class ie {
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
class ns extends ie {
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(e, t, n, s, i, r) {
    const a = this.options.seed ?? 1, o = 0.4, c = new Float32Array(i);
    for (let l = 0; l < i; l++) {
      const h = Math.sin(l * 127.1 + a * 311.7) * 43758.5453;
      c[l] = (h - Math.floor(h)) * o;
    }
    for (const l of e) {
      const h = Math.floor(l.finalX / s);
      l.cascadeDelay = c[Math.min(h, i - 1)], l.cascadeStartY = l.finalY - n - s;
    }
  }
  getVisiblePixels(e, t, n, s) {
    const i = [];
    for (const r of e) {
      const a = 1 - r.cascadeDelay, o = a <= 0 ? 1 : Math.min(1, Math.max(0, (t - r.cascadeDelay) / a)), c = s(o);
      let l, h, f;
      if (n === "fadeIn")
        h = Math.round(r.cascadeStartY + (r.finalY - r.cascadeStartY) * c), l = r.finalX, f = o > 0 ? 1 : 0;
      else if (n === "fadeOut") {
        const d = r.finalY + (r.finalY - r.cascadeStartY);
        h = Math.round(r.finalY + (d - r.finalY) * c), l = r.finalX, f = o < 1 ? 1 : 0;
      } else
        continue;
      f <= 0 || i.push({ x: l, y: h, brightness: r.brightness, color: r.color, alpha: f });
    }
    return i;
  }
}
class is extends ie {
  initVariantMetadata(e, t, n, s, i, r) {
    const a = this.options.seed ?? 2;
    for (const o of e) {
      const c = r > 1 ? Math.floor(o.finalY / s) / (r - 1) : 0, l = Math.sin(o.idx * 43.9898 + a * 127.233) * 43758.5453, h = l - Math.floor(l);
      o.staticThreshold = c * 0.7 + h * 0.3;
    }
  }
  getVisiblePixels(e, t, n) {
    const i = [];
    for (const r of e) {
      let a;
      if (n === "fadeIn")
        a = Math.min(1, Math.max(0, (t - r.staticThreshold + 0.06) / 0.06));
      else if (n === "fadeOut")
        a = 1 - Math.min(1, Math.max(0, (t + r.staticThreshold - 1 + 0.06) / 0.06));
      else
        continue;
      a <= 0 || i.push({ x: r.finalX, y: r.finalY, brightness: r.brightness, color: r.color, alpha: a });
    }
    return i;
  }
}
class rs extends ie {
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
class os extends ie {
  // No extra metadata needed — startX/Y, finalX/Y, and delay are already on every particle.
  // eslint-disable-next-line no-unused-vars
  initVariantMetadata(e, t, n, s, i, r) {
  }
  getVisiblePixels(e, t, n, s) {
    const i = [];
    for (const r of e) {
      const a = 1 - r.delay, o = a > 0 ? Math.max(0, Math.min(1, (t - r.delay) / a)) : 1, c = s(o);
      let l, h, f;
      if (n === "fadeIn") {
        if (o <= 0) continue;
        l = Math.round(r.startX + (r.finalX - r.startX) * c), h = Math.round(r.startY + (r.finalY - r.startY) * c), f = Math.min(1, o * 4);
      } else if (n === "fadeOut") {
        if (o >= 1) continue;
        l = Math.round(r.finalX + (r.startX - r.finalX) * c), h = Math.round(r.finalY + (r.startY - r.finalY) * c), f = o < 0.75 ? 1 : Math.max(0, (1 - o) * 4);
      } else
        continue;
      f <= 0 || i.push({ x: l, y: h, brightness: r.brightness, color: r.color, alpha: f });
    }
    return i;
  }
}
class as extends ie {
  initVariantMetadata(e, t, n) {
    const s = this.options.seed ?? 7;
    for (const i of e) {
      const r = Math.sin(i.idx * 23.9898 + s * 91.233) * 43758.5453, a = Math.sin(i.idx * 67.1234 + s * 43.123) * 43758.5453, o = Math.sin(i.idx * 11.5678 + s * 77.456) * 43758.5453;
      i.scatterX = (r - Math.floor(r)) * t, i.scatterY = (a - Math.floor(a)) * n, i.scatterDelay = (o - Math.floor(o)) * 0.5;
    }
  }
  getVisiblePixels(e, t, n, s) {
    const i = [];
    for (const r of e) {
      const a = 1 - r.scatterDelay, o = a > 0 ? Math.max(0, Math.min(1, (t - r.scatterDelay) / a)) : 1, c = s(o);
      let l, h, f;
      if (n === "fadeIn") {
        if (o <= 0) continue;
        l = Math.round(r.scatterX + (r.finalX - r.scatterX) * c), h = Math.round(r.scatterY + (r.finalY - r.scatterY) * c), f = Math.min(1, o * 3);
      } else if (n === "fadeOut") {
        if (o >= 1) continue;
        l = Math.round(r.finalX + (r.scatterX - r.finalX) * c), h = Math.round(r.finalY + (r.scatterY - r.finalY) * c), f = o < 0.75 ? 1 : Math.max(0, (1 - o) * 4);
      } else
        continue;
      f <= 0 || i.push({ x: l, y: h, brightness: r.brightness, color: r.color, alpha: f });
    }
    return i;
  }
}
function ke(u, e = {}) {
  switch (u) {
    case "static":
      return new is(e);
    case "glitch":
      return new rs(e);
    case "drift":
      return new os(e);
    case "scatter":
      return new as(e);
    default:
      return new ns(e);
  }
}
class W {
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
const cs = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
].map((u) => u.map((e) => e / 16)), ls = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
].map((u) => u.map((e) => e / 64));
function hs(u, e, t) {
  const n = Float32Array.from(u), s = new Uint8Array(e * t);
  for (let i = 0; i < t; i++)
    for (let r = 0; r < e; r++) {
      const a = i * e + r, o = n[a], c = o > 0.5 ? 1 : 0;
      s[a] = c;
      const l = o - c;
      r + 1 < e && (n[a + 1] += l * (7 / 16)), i + 1 < t && (r > 0 && (n[a + e - 1] += l * (3 / 16)), n[a + e] += l * (5 / 16), r + 1 < e && (n[a + e + 1] += l * (1 / 16)));
    }
  return s;
}
function us(u, e, t) {
  const n = Float32Array.from(u), s = new Uint8Array(e * t);
  for (let i = 0; i < t; i++)
    for (let r = 0; r < e; r++) {
      const a = i * e + r, o = n[a], c = o > 0.5 ? 1 : 0;
      s[a] = c;
      const l = (o - c) / 8;
      r + 1 < e && (n[a + 1] += l), r + 2 < e && (n[a + 2] += l), i + 1 < t && (r > 0 && (n[a + e - 1] += l), n[a + e] += l, r + 1 < e && (n[a + e + 1] += l)), i + 2 < t && (n[a + e * 2] += l);
    }
  return s;
}
const oe = {
  bayer4x4: {
    type: "threshold",
    getThreshold: (u, e) => cs[e % 4][u % 4]
  },
  bayer8x8: {
    type: "threshold",
    getThreshold: (u, e) => ls[e % 8][u % 8]
  },
  variableDot: {
    type: "variableDot"
  },
  floydSteinberg: {
    type: "errorDiffusion",
    processGrid: hs
  },
  atkinson: {
    type: "errorDiffusion",
    processGrid: us
  }
};
function fs(u, e) {
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
class ft extends W {
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
    const n = oe[this.options.ditherType];
    return n?.type === "threshold" ? n.getThreshold(e, t) : 0.5;
  }
  shouldDraw(e, t, n) {
    const s = oe[this.options.ditherType];
    return !s || s.type === "variableDot" ? e > this.options.minBrightness : s.type === "errorDiffusion" ? e > 0.5 : e > this.getThreshold(t, n);
  }
  drawPixel(e, t, n, s, i = 1) {
    if (!this._bitmapCtx) return;
    const r = i < 1 ? fs(s, i) : s;
    r !== this._lastFillStyle && (this._bitmapCtx.fillStyle = r, this._lastFillStyle = r);
    const { pixelSize: a, ditherType: o } = this.options;
    if (o === "variableDot") {
      const c = a * 0.5, l = Math.max(a * 0.12, c * (1 - n));
      if (l <= 0.2) return;
      this._bitmapCtx.beginPath(), this._bitmapCtx.arc(e + a / 2, t + a / 2, l, 0, Math.PI * 2), this._bitmapCtx.fill();
      return;
    }
    this._bitmapCtx.fillRect(e, t, a, a);
  }
  render(e, t, n, s) {
    const i = oe[this.options.ditherType] ?? oe.bayer4x4;
    i.type === "errorDiffusion" ? this._renderErrorDiffusion(e, t, n, i, s) : this._renderThreshold(e, t, n, s);
  }
  _renderThreshold(e, t, n, s) {
    const { pixelSize: i, minBrightness: r, invert: a } = this.options;
    for (let o = 0; o < n; o++)
      for (let c = 0; c < t; c++) {
        const l = (o * t + c) * 4, h = e[l], f = e[l + 1], d = e[l + 2], g = e[l + 3], p = je(h, f, d);
        if (g === 0 || p < r) continue;
        const m = a ? 1 - p : p;
        if (!this.shouldDraw(m, c, o)) continue;
        const _ = s(m);
        this.drawPixel(c * i, o * i, m, _, 1);
      }
  }
  _renderErrorDiffusion(e, t, n, s, i) {
    const { pixelSize: r, minBrightness: a, invert: o } = this.options, c = t * n, l = new Float32Array(c), h = new Uint8Array(c);
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = (d * t + g) * 4, m = e[p], _ = e[p + 1], b = e[p + 2];
        if (e[p + 3] === 0) continue;
        const x = je(m, _, b);
        if (x < a) continue;
        const w = o ? 1 - x : x, y = d * t + g;
        l[y] = w, h[y] = 1;
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
class ds {
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
class ps {
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
    const { scanlineGap: i = 4, scanlineOpacity: r = 0.4, chromaticAberration: a = 0, crtVignette: o = 0.3 } = s;
    if (i > 0 && r > 0) {
      e.fillStyle = `rgba(0,0,0,${r})`;
      for (let c = 0; c < n; c += i)
        e.fillRect(0, c, t, 1);
    }
    if (a > 0) {
      const c = e.getImageData(0, 0, t, n);
      this._applyCA(c.data, t, n, Math.round(a)), e.putImageData(c, 0, 0);
    }
    if (o > 0) {
      const c = t * 0.5, l = n * 0.5, h = Math.min(t, n) * 0.3, f = Math.max(t, n) * 0.75, d = e.createRadialGradient(c, l, h, c, l, f);
      d.addColorStop(0, "rgba(0,0,0,0)"), d.addColorStop(1, `rgba(0,0,0,${Math.min(o * 0.85, 0.85)})`), e.fillStyle = d, e.fillRect(0, 0, t, n);
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
      for (let a = 0; a < t; a++) {
        const o = (r * t + a) * 4, c = a - s;
        c >= 0 && (e[o] = i[(r * t + c) * 4]);
        const l = a + s;
        l < t && (e[o + 2] = i[(r * t + l) * 4 + 2]);
      }
  }
}
class ms {
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
    const r = s.noiseMonochrome ?? this.noiseMonochrome, a = e.getImageData(0, 0, t, n), o = a.data, c = i * 255 * 2;
    for (let l = 0; l < o.length; l += 4)
      if (o[l + 3] !== 0)
        if (r) {
          const h = (Math.random() - 0.5) * c;
          o[l] = Math.max(0, Math.min(255, o[l] + h)), o[l + 1] = Math.max(0, Math.min(255, o[l + 1] + h)), o[l + 2] = Math.max(0, Math.min(255, o[l + 2] + h));
        } else
          o[l] = Math.max(0, Math.min(255, o[l] + (Math.random() - 0.5) * c)), o[l + 1] = Math.max(0, Math.min(255, o[l + 1] + (Math.random() - 0.5) * c)), o[l + 2] = Math.max(0, Math.min(255, o[l + 2] + (Math.random() - 0.5) * c));
    e.putImageData(a, 0, 0);
  }
}
class gs {
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
    const r = e.getImageData(0, 0, t, n), a = r.data, o = s / 360;
    for (let c = 0; c < a.length; c += 4) {
      if (a[c + 3] === 0) continue;
      const l = a[c] / 255, h = a[c + 1] / 255, f = a[c + 2] / 255;
      let [d, g, p] = _s(l, h, f);
      d = (d + o) % 1, d < 0 && (d += 1), g = Math.max(0, Math.min(1, g * i));
      const [m, _, b] = bs(d, g, p);
      a[c] = Math.round(m * 255), a[c + 1] = Math.round(_ * 255), a[c + 2] = Math.round(b * 255);
    }
    e.putImageData(r, 0, 0);
  }
}
function _s(u, e, t) {
  const n = Math.max(u, e, t), s = Math.min(u, e, t), i = (n + s) / 2;
  if (n === s) return [0, 0, i];
  const r = n - s, a = i > 0.5 ? r / (2 - n - s) : r / (n + s);
  let o;
  return n === u ? o = ((e - t) / r + (e < t ? 6 : 0)) / 6 : n === e ? o = ((t - u) / r + 2) / 6 : o = ((u - e) / r + 4) / 6, [o, a, i];
}
function bs(u, e, t) {
  if (e === 0) return [t, t, t];
  const n = t < 0.5 ? t * (1 + e) : t + e - t * e, s = 2 * t - n;
  return [_e(s, n, u + 1 / 3), _e(s, n, u), _e(s, n, u - 1 / 3)];
}
function _e(u, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? u + (e - u) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? u + (e - u) * (2 / 3 - t) * 6 : u;
}
class xs extends ss {
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
    }), this.sampleCanvas = document.createElement("canvas"), this.sampleCtx = this.sampleCanvas.getContext("2d", { willReadFrequently: !0 }), this.gridWidth = 1, this.gridHeight = 1, this._activeRenderer = new ft(this.options), this._pendingRenderer = null, this.domElement.appendChild(this._activeRenderer.canvas), this._postChain = new ds(), this._postChain.addEffect("crt", new ps()), this._postChain.addEffect("noise", new ms()), this._postChain.addEffect("colorShift", new gs());
    const n = this.options.fadeVariant ?? "glitch";
    this.fadeVariant = ke(n), this._currentFadeVariantKey = n, this.onVariantChange = null, this._scene = null, this._camera = null;
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
    this._scene = e, this._camera = t, this.renderer.render(e, t), this.tickAnimation(), this.renderBitmap();
  }
  renderBitmap() {
    if (!this.sampleCtx || !this._activeRenderer) return;
    this._pendingRenderer && !this.isAnimating && this._swapRenderer(this._pendingRenderer);
    const e = this.options.fadeVariant ?? "glitch";
    e !== this._currentFadeVariantKey && (this._currentFadeVariantKey = e, this.fadeVariant = ke(e), this.onVariantChange?.(), this._scene && this._camera && this.renderer.render(this._scene, this._camera), this.startAnimation("fadeIn")), this.sampleCtx.clearRect(0, 0, this.gridWidth, this.gridHeight), this.sampleCtx.drawImage(this.renderer.domElement, 0, 0, this.gridWidth, this.gridHeight);
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
    this._scene = null, this._camera = null, this._postChain = null, this._activeRenderer?.dispose(), this._activeRenderer = null, this._pendingRenderer = null, this.sampleCanvas = null, this.sampleCtx = null, super.dispose();
  }
}
class ys extends me {
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
    r.setPath(this.path), r.setResponseType("arraybuffer"), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, function(a) {
      try {
        t(i.parse(a));
      } catch (o) {
        s ? s(o) : console.error(o), i.manager.itemError(e);
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
      let f, d, g, p = !1, m, _, b, T, x;
      for (let E = 0; E < 70; E++)
        l.getUint32(E, !1) == 1129270351 && l.getUint8(E + 4) == 82 && l.getUint8(E + 5) == 61 && (p = !0, m = new Float32Array(h * 3 * 3), _ = l.getUint8(E + 6) / 255, b = l.getUint8(E + 7) / 255, T = l.getUint8(E + 8) / 255, x = l.getUint8(E + 9) / 255);
      const w = 84, y = 50, M = new te(), v = new Float32Array(h * 3 * 3), C = new Float32Array(h * 3 * 3), A = new B();
      for (let E = 0; E < h; E++) {
        const L = w + E * y, I = l.getFloat32(L, !0), X = l.getFloat32(L + 4, !0), re = l.getFloat32(L + 8, !0);
        if (p) {
          const P = l.getUint16(L + 48, !0);
          (P & 32768) === 0 ? (f = (P & 31) / 31, d = (P >> 5 & 31) / 31, g = (P >> 10 & 31) / 31) : (f = _, d = b, g = T);
        }
        for (let P = 1; P <= 3; P++) {
          const ge = L + P * 12, j = E * 3 * 3 + (P - 1) * 3;
          v[j] = l.getFloat32(ge, !0), v[j + 1] = l.getFloat32(ge + 4, !0), v[j + 2] = l.getFloat32(ge + 8, !0), C[j] = I, C[j + 1] = X, C[j + 2] = re, p && (A.setRGB(f, d, g, V), m[j] = A.r, m[j + 1] = A.g, m[j + 2] = A.b);
        }
      }
      return M.setAttribute("position", new K(v, 3)), M.setAttribute("normal", new K(C, 3)), p && (M.setAttribute("color", new K(m, 3)), M.hasColors = !0, M.alpha = x), M;
    }
    function i(c) {
      const l = new te(), h = /solid([\s\S]*?)endsolid/g, f = /facet([\s\S]*?)endfacet/g, d = /solid\s(.+)/;
      let g = 0;
      const p = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source, m = new RegExp("vertex" + p + p + p, "g"), _ = new RegExp("normal" + p + p + p, "g"), b = [], T = [], x = [], w = new N();
      let y, M = 0, v = 0, C = 0;
      for (; (y = h.exec(c)) !== null; ) {
        v = C;
        const A = y[0], E = (y = d.exec(A)) !== null ? y[1] : "";
        for (x.push(E); (y = f.exec(A)) !== null; ) {
          let X = 0, re = 0;
          const P = y[0];
          for (; (y = _.exec(P)) !== null; )
            w.x = parseFloat(y[1]), w.y = parseFloat(y[2]), w.z = parseFloat(y[3]), re++;
          for (; (y = m.exec(P)) !== null; )
            b.push(parseFloat(y[1]), parseFloat(y[2]), parseFloat(y[3])), T.push(w.x, w.y, w.z), X++, C++;
          re !== 1 && console.error("THREE.STLLoader: Something isn't right with the normal of face number " + g), X !== 3 && console.error("THREE.STLLoader: Something isn't right with the vertices of face number " + g), g++;
        }
        const L = v, I = C - v;
        l.userData.groupNames = x, l.addGroup(L, I, M), M++;
      }
      return l.setAttribute("position", new G(b, 3)), l.setAttribute("normal", new G(T, 3)), l;
    }
    function r(c) {
      return typeof c != "string" ? new TextDecoder().decode(c) : c;
    }
    function a(c) {
      if (typeof c == "string") {
        const l = new Uint8Array(c.length);
        for (let h = 0; h < c.length; h++)
          l[h] = c.charCodeAt(h) & 255;
        return l.buffer || l;
      } else
        return c;
    }
    const o = a(e);
    return t(o) ? s(o) : i(r(e));
  }
}
function Be(u, e) {
  if (e === wt)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), u;
  if (e === Re || e === it) {
    let t = u.getIndex();
    if (t === null) {
      const r = [], a = u.getAttribute("position");
      if (a !== void 0) {
        for (let o = 0; o < a.count; o++)
          r.push(o);
        u.setIndex(r), t = u.getIndex();
      } else
        return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), u;
    }
    const n = t.count - 2, s = [];
    if (e === Re)
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
class Ts extends me {
  /**
   * Constructs a new glTF loader.
   *
   * @param {LoadingManager} [manager] - The loading manager.
   */
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new Cs(t);
    }), this.register(function(t) {
      return new Es(t);
    }), this.register(function(t) {
      return new Ds(t);
    }), this.register(function(t) {
      return new ks(t);
    }), this.register(function(t) {
      return new js(t);
    }), this.register(function(t) {
      return new As(t);
    }), this.register(function(t) {
      return new Ls(t);
    }), this.register(function(t) {
      return new Is(t);
    }), this.register(function(t) {
      return new Ps(t);
    }), this.register(function(t) {
      return new Rs(t);
    }), this.register(function(t) {
      return new Fs(t);
    }), this.register(function(t) {
      return new vs(t);
    }), this.register(function(t) {
      return new Ns(t);
    }), this.register(function(t) {
      return new Os(t);
    }), this.register(function(t) {
      return new Ms(t);
    }), this.register(function(t) {
      return new Bs(t);
    }), this.register(function(t) {
      return new Us(t);
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
    const a = function(c) {
      s ? s(c) : console.error(c), i.manager.itemError(e), i.manager.itemEnd(e);
    }, o = new ne(this.manager);
    o.setPath(this.path), o.setResponseType("arraybuffer"), o.setRequestHeader(this.requestHeader), o.setWithCredentials(this.withCredentials), o.load(e, function(c) {
      try {
        i.parse(c, r, function(l) {
          t(l), i.manager.itemEnd(e);
        }, a);
      } catch (l) {
        a(l);
      }
    }, n, a);
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
    const r = {}, a = {}, o = new TextDecoder();
    if (typeof e == "string")
      i = JSON.parse(e);
    else if (e instanceof ArrayBuffer)
      if (o.decode(new Uint8Array(e, 0, 4)) === dt) {
        try {
          r[R.KHR_BINARY_GLTF] = new Hs(e);
        } catch (h) {
          s && s(h);
          return;
        }
        i = JSON.parse(r[R.KHR_BINARY_GLTF].content);
      } else
        i = JSON.parse(o.decode(e));
    else
      i = e;
    if (i.asset === void 0 || i.asset.version[0] < 2) {
      s && s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const c = new en(i, {
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
      h.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), a[h.name] = h, r[h.name] = !0;
    }
    if (i.extensionsUsed)
      for (let l = 0; l < i.extensionsUsed.length; ++l) {
        const h = i.extensionsUsed[l], f = i.extensionsRequired || [];
        switch (h) {
          case R.KHR_MATERIALS_UNLIT:
            r[h] = new Ss();
            break;
          case R.KHR_DRACO_MESH_COMPRESSION:
            r[h] = new Gs(i, this.dracoLoader);
            break;
          case R.KHR_TEXTURE_TRANSFORM:
            r[h] = new zs();
            break;
          case R.KHR_MESH_QUANTIZATION:
            r[h] = new Vs();
            break;
          default:
            f.indexOf(h) >= 0 && a[h] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + h + '".');
        }
      }
    c.setExtensions(r), c.setPlugins(a), c.parse(n, s);
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
function ws() {
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
const R = {
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
class Ms {
  constructor(e) {
    this.parser = e, this.name = R.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
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
    const i = t.json, o = ((i.extensions && i.extensions[this.name] || {}).lights || [])[e];
    let c;
    const l = new B(16777215);
    o.color !== void 0 && l.setRGB(o.color[0], o.color[1], o.color[2], U);
    const h = o.range !== void 0 ? o.range : 0;
    switch (o.type) {
      case "directional":
        c = new Rt(l), c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      case "point":
        c = new St(l), c.distance = h;
        break;
      case "spot":
        c = new Mt(l), c.distance = h, o.spot = o.spot || {}, o.spot.innerConeAngle = o.spot.innerConeAngle !== void 0 ? o.spot.innerConeAngle : 0, o.spot.outerConeAngle = o.spot.outerConeAngle !== void 0 ? o.spot.outerConeAngle : Math.PI / 4, c.angle = o.spot.outerConeAngle, c.penumbra = 1 - o.spot.innerConeAngle / o.spot.outerConeAngle, c.target.position.set(0, 0, -1), c.add(c.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + o.type);
    }
    return c.position.set(0, 0, 0), D(c, o), o.intensity !== void 0 && (c.intensity = o.intensity), c.name = t.createUniqueName(o.name || "light_" + e), s = Promise.resolve(c), t.cache.add(n, s), s;
  }
  getDependency(e, t) {
    if (e === "light")
      return this._loadLight(t);
  }
  createNodeAttachment(e) {
    const t = this, n = this.parser, i = n.json.nodes[e], a = (i.extensions && i.extensions[this.name] || {}).light;
    return a === void 0 ? null : this._loadLight(a).then(function(o) {
      return n._getNodeRef(t.cache, a, o);
    });
  }
}
class Ss {
  constructor() {
    this.name = R.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return J;
  }
  extendParams(e, t, n) {
    const s = [];
    e.color = new B(1, 1, 1), e.opacity = 1;
    const i = t.pbrMetallicRoughness;
    if (i) {
      if (Array.isArray(i.baseColorFactor)) {
        const r = i.baseColorFactor;
        e.color.setRGB(r[0], r[1], r[2], U), e.opacity = r[3];
      }
      i.baseColorTexture !== void 0 && s.push(n.assignTexture(e, "map", i.baseColorTexture, V));
    }
    return Promise.all(s);
  }
}
class Rs {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, t) {
    const s = this.parser.json.materials[e];
    if (!s.extensions || !s.extensions[this.name])
      return Promise.resolve();
    const i = s.extensions[this.name].emissiveStrength;
    return i !== void 0 && (t.emissiveIntensity = i), Promise.resolve();
  }
}
class Cs {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_CLEARCOAT;
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
      const a = r.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new rt(a, a);
    }
    return Promise.all(i);
  }
}
class Es {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_DISPERSION;
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
class vs {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_IRIDESCENCE;
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
class As {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_SHEEN;
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
    t.sheenColor = new B(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1;
    const r = s.extensions[this.name];
    if (r.sheenColorFactor !== void 0) {
      const a = r.sheenColorFactor;
      t.sheenColor.setRGB(a[0], a[1], a[2], U);
    }
    return r.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = r.sheenRoughnessFactor), r.sheenColorTexture !== void 0 && i.push(n.assignTexture(t, "sheenColorMap", r.sheenColorTexture, V)), r.sheenRoughnessTexture !== void 0 && i.push(n.assignTexture(t, "sheenRoughnessMap", r.sheenRoughnessTexture)), Promise.all(i);
  }
}
class Ls {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_TRANSMISSION;
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
class Is {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_VOLUME;
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
    const a = r.attenuationColor || [1, 1, 1];
    return t.attenuationColor = new B().setRGB(a[0], a[1], a[2], U), Promise.all(i);
  }
}
class Ps {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_IOR;
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
class Fs {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_SPECULAR;
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
    const a = r.specularColorFactor || [1, 1, 1];
    return t.specularColor = new B().setRGB(a[0], a[1], a[2], U), r.specularColorTexture !== void 0 && i.push(n.assignTexture(t, "specularColorMap", r.specularColorTexture, V)), Promise.all(i);
  }
}
class Os {
  constructor(e) {
    this.parser = e, this.name = R.EXT_MATERIALS_BUMP;
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
class Ns {
  constructor(e) {
    this.parser = e, this.name = R.KHR_MATERIALS_ANISOTROPY;
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
class Ds {
  constructor(e) {
    this.parser = e, this.name = R.KHR_TEXTURE_BASISU;
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
class ks {
  constructor(e) {
    this.parser = e, this.name = R.EXT_TEXTURE_WEBP;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, s = n.json, i = s.textures[e];
    if (!i.extensions || !i.extensions[t])
      return null;
    const r = i.extensions[t], a = s.images[r.source];
    let o = n.textureLoader;
    if (a.uri) {
      const c = n.options.manager.getHandler(a.uri);
      c !== null && (o = c);
    }
    return n.loadTextureImage(e, r.source, o);
  }
}
class js {
  constructor(e) {
    this.parser = e, this.name = R.EXT_TEXTURE_AVIF;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, s = n.json, i = s.textures[e];
    if (!i.extensions || !i.extensions[t])
      return null;
    const r = i.extensions[t], a = s.images[r.source];
    let o = n.textureLoader;
    if (a.uri) {
      const c = n.options.manager.getHandler(a.uri);
      c !== null && (o = c);
    }
    return n.loadTextureImage(e, r.source, o);
  }
}
class Bs {
  constructor(e) {
    this.name = R.EXT_MESHOPT_COMPRESSION, this.parser = e;
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
      return i.then(function(a) {
        const o = s.byteOffset || 0, c = s.byteLength || 0, l = s.count, h = s.byteStride, f = new Uint8Array(a, o, c);
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
class Us {
  constructor(e) {
    this.name = R.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const t = this.parser.json, n = t.nodes[e];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0)
      return null;
    const s = t.meshes[n.mesh];
    for (const c of s.primitives)
      if (c.mode !== O.TRIANGLES && c.mode !== O.TRIANGLE_STRIP && c.mode !== O.TRIANGLE_FAN && c.mode !== void 0)
        return null;
    const r = n.extensions[this.name].attributes, a = [], o = {};
    for (const c in r)
      a.push(this.parser.getDependency("accessor", r[c]).then((l) => (o[c] = l, o[c])));
    return a.length < 1 ? null : (a.push(this.parser.createNodeMesh(e)), Promise.all(a).then((c) => {
      const l = c.pop(), h = l.isGroup ? l.children : [l], f = c[0].count, d = [];
      for (const g of h) {
        const p = new pe(), m = new N(), _ = new ot(), b = new N(1, 1, 1), T = new Ct(g.geometry, g.material, f);
        for (let x = 0; x < f; x++)
          o.TRANSLATION && m.fromBufferAttribute(o.TRANSLATION, x), o.ROTATION && _.fromBufferAttribute(o.ROTATION, x), o.SCALE && b.fromBufferAttribute(o.SCALE, x), T.setMatrixAt(x, p.compose(m, _, b));
        for (const x in o)
          if (x === "_COLOR_0") {
            const w = o[x];
            T.instanceColor = new Et(w.array, w.itemSize, w.normalized);
          } else x !== "TRANSLATION" && x !== "ROTATION" && x !== "SCALE" && g.geometry.setAttribute(x, o[x]);
        at.prototype.copy.call(T, g), this.parser.assignFinalMaterial(T), d.push(T);
      }
      return l.isGroup ? (l.clear(), l.add(...d), l) : d[0];
    }));
  }
}
const dt = "glTF", q = 12, Ue = { JSON: 1313821514, BIN: 5130562 };
class Hs {
  constructor(e) {
    this.name = R.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, q), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(e.slice(0, 4))),
      version: t.getUint32(4, !0),
      length: t.getUint32(8, !0)
    }, this.header.magic !== dt)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const s = this.header.length - q, i = new DataView(e, q);
    let r = 0;
    for (; r < s; ) {
      const a = i.getUint32(r, !0);
      r += 4;
      const o = i.getUint32(r, !0);
      if (r += 4, o === Ue.JSON) {
        const c = new Uint8Array(e, q + r, a);
        this.content = n.decode(c);
      } else if (o === Ue.BIN) {
        const c = q + r;
        this.body = e.slice(c, c + a);
      }
      r += a;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class Gs {
  constructor(e, t) {
    if (!t)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = R.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload();
  }
  decodePrimitive(e, t) {
    const n = this.json, s = this.dracoLoader, i = e.extensions[this.name].bufferView, r = e.extensions[this.name].attributes, a = {}, o = {}, c = {};
    for (const l in r) {
      const h = Le[l] || l.toLowerCase();
      a[h] = r[l];
    }
    for (const l in e.attributes) {
      const h = Le[l] || l.toLowerCase();
      if (r[l] !== void 0) {
        const f = n.accessors[e.attributes[l]], d = Y[f.componentType];
        c[h] = d.name, o[h] = f.normalized === !0;
      }
    }
    return t.getDependency("bufferView", i).then(function(l) {
      return new Promise(function(h, f) {
        s.decodeDracoFile(l, function(d) {
          for (const g in d.attributes) {
            const p = d.attributes[g], m = o[g];
            m !== void 0 && (p.normalized = m);
          }
          h(d);
        }, a, c, U, f);
      });
    });
  }
}
class zs {
  constructor() {
    this.name = R.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, t) {
    return (t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e;
  }
}
class Vs {
  constructor() {
    this.name = R.KHR_MESH_QUANTIZATION;
  }
}
class pt extends qt {
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
    const i = this.resultBuffer, r = this.sampleValues, a = this.valueSize, o = a * 2, c = a * 3, l = s - t, h = (n - t) / l, f = h * h, d = f * h, g = e * c, p = g - c, m = -2 * d + 3 * f, _ = d - f, b = 1 - m, T = _ - f + h;
    for (let x = 0; x !== a; x++) {
      const w = r[p + x + a], y = r[p + x + o] * l, M = r[g + x + a], v = r[g + x] * l;
      i[x] = b * w + T * y + m * M + _ * v;
    }
    return i;
  }
}
const Xs = new ot();
class Ks extends pt {
  interpolate_(e, t, n, s) {
    const i = super.interpolate_(e, t, n, s);
    return Xs.fromArray(i).normalize().toArray(i), i;
  }
}
const O = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
}, Y = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, He = {
  9728: lt,
  9729: Ce,
  9984: Ot,
  9985: Ft,
  9986: Pt,
  9987: ct
}, Ge = {
  33071: Dt,
  33648: Nt,
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
}, H = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, Ys = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: ut,
  STEP: Wt
}, xe = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function Ws(u) {
  return u.DefaultMaterial === void 0 && (u.DefaultMaterial = new ht({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: $t
  })), u.DefaultMaterial;
}
function z(u, e, t) {
  for (const n in t.extensions)
    u[n] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[n] = t.extensions[n]);
}
function D(u, e) {
  e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(u.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras));
}
function $s(u, e, t) {
  let n = !1, s = !1, i = !1;
  for (let c = 0, l = e.length; c < l; c++) {
    const h = e[c];
    if (h.POSITION !== void 0 && (n = !0), h.NORMAL !== void 0 && (s = !0), h.COLOR_0 !== void 0 && (i = !0), n && s && i) break;
  }
  if (!n && !s && !i) return Promise.resolve(u);
  const r = [], a = [], o = [];
  for (let c = 0, l = e.length; c < l; c++) {
    const h = e[c];
    if (n) {
      const f = h.POSITION !== void 0 ? t.getDependency("accessor", h.POSITION) : u.attributes.position;
      r.push(f);
    }
    if (s) {
      const f = h.NORMAL !== void 0 ? t.getDependency("accessor", h.NORMAL) : u.attributes.normal;
      a.push(f);
    }
    if (i) {
      const f = h.COLOR_0 !== void 0 ? t.getDependency("accessor", h.COLOR_0) : u.attributes.color;
      o.push(f);
    }
  }
  return Promise.all([
    Promise.all(r),
    Promise.all(a),
    Promise.all(o)
  ]).then(function(c) {
    const l = c[0], h = c[1], f = c[2];
    return n && (u.morphAttributes.position = l), s && (u.morphAttributes.normal = h), i && (u.morphAttributes.color = f), u.morphTargetsRelative = !0, u;
  });
}
function qs(u, e) {
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
function Zs(u) {
  let e;
  const t = u.extensions && u.extensions[R.KHR_DRACO_MESH_COMPRESSION];
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
function Js(u) {
  return u.search(/\.jpe?g($|\?)/i) > 0 || u.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : u.search(/\.webp($|\?)/i) > 0 || u.search(/^data\:image\/webp/) === 0 ? "image/webp" : u.search(/\.ktx2($|\?)/i) > 0 || u.search(/^data\:image\/ktx2/) === 0 ? "image/ktx2" : "image/png";
}
const Qs = new pe();
class en {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new ws(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, s = -1, i = !1, r = -1;
    if (typeof navigator < "u") {
      const a = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(a) === !0;
      const o = a.match(/Version\/(\d+)/);
      s = n && o ? parseInt(o[1], 10) : -1, i = a.indexOf("Firefox") > -1, r = i ? a.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && s < 17 || i && r < 98 ? this.textureLoader = new vt(this.options.manager) : this.textureLoader = new At(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new ne(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
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
      const a = {
        scene: r[0][s.scene || 0],
        scenes: r[0],
        animations: r[1],
        cameras: r[2],
        asset: s.asset,
        parser: n,
        userData: {}
      };
      return z(i, a, s), D(a, s), Promise.all(n._invokeAll(function(o) {
        return o.afterRoot && o.afterRoot(a);
      })).then(function() {
        for (const o of a.scenes)
          o.updateMatrixWorld();
        e(a);
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
      for (let a = 0, o = r.length; a < o; a++)
        e[r[a]].isBone = !0;
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
    const s = n.clone(), i = (r, a) => {
      const o = this.associations.get(r);
      o != null && this.associations.set(a, o);
      for (const [c, l] of r.children.entries())
        i(l, a.children[c]);
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
      return Promise.resolve(this.extensions[R.KHR_BINARY_GLTF].body);
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
      const r = be[s.type], a = Y[s.componentType], o = s.normalized === !0, c = new a(s.count * r);
      return Promise.resolve(new K(c, r, o));
    }
    const i = [];
    return s.bufferView !== void 0 ? i.push(this.getDependency("bufferView", s.bufferView)) : i.push(null), s.sparse !== void 0 && (i.push(this.getDependency("bufferView", s.sparse.indices.bufferView)), i.push(this.getDependency("bufferView", s.sparse.values.bufferView))), Promise.all(i).then(function(r) {
      const a = r[0], o = be[s.type], c = Y[s.componentType], l = c.BYTES_PER_ELEMENT, h = l * o, f = s.byteOffset || 0, d = s.bufferView !== void 0 ? n.bufferViews[s.bufferView].byteStride : void 0, g = s.normalized === !0;
      let p, m;
      if (d && d !== h) {
        const _ = Math.floor(f / d), b = "InterleavedBuffer:" + s.bufferView + ":" + s.componentType + ":" + _ + ":" + s.count;
        let T = t.cache.get(b);
        T || (p = new c(a, _ * d, s.count * d / l), T = new Lt(p, d / l), t.cache.add(b, T)), m = new It(T, o, f % d / l, g);
      } else
        a === null ? p = new c(s.count * o) : p = new c(a, f, s.count * o), m = new K(p, o, g);
      if (s.sparse !== void 0) {
        const _ = be.SCALAR, b = Y[s.sparse.indices.componentType], T = s.sparse.indices.byteOffset || 0, x = s.sparse.values.byteOffset || 0, w = new b(r[1], T, s.sparse.count * _), y = new c(r[2], x, s.sparse.count * o);
        a !== null && (m = new K(m.array.slice(), m.itemSize, m.normalized)), m.normalized = !1;
        for (let M = 0, v = w.length; M < v; M++) {
          const C = w[M];
          if (m.setX(C, y[M * o]), o >= 2 && m.setY(C, y[M * o + 1]), o >= 3 && m.setZ(C, y[M * o + 2]), o >= 4 && m.setW(C, y[M * o + 3]), o >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
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
    let a = this.textureLoader;
    if (r.uri) {
      const o = n.manager.getHandler(r.uri);
      o !== null && (a = o);
    }
    return this.loadTextureImage(e, i, a);
  }
  loadTextureImage(e, t, n) {
    const s = this, i = this.json, r = i.textures[e], a = i.images[t], o = (a.uri || a.bufferView) + ":" + r.sampler;
    if (this.textureCache[o])
      return this.textureCache[o];
    const c = this.loadImageSource(t, n).then(function(l) {
      l.flipY = !1, l.name = r.name || a.name || "", l.name === "" && typeof a.uri == "string" && a.uri.startsWith("data:image/") === !1 && (l.name = a.uri);
      const f = (i.samplers || {})[r.sampler] || {};
      return l.magFilter = He[f.magFilter] || Ce, l.minFilter = He[f.minFilter] || ct, l.wrapS = Ge[f.wrapS] || Ee, l.wrapT = Ge[f.wrapT] || Ee, l.generateMipmaps = !l.isCompressedTexture && l.minFilter !== lt && l.minFilter !== Ce, s.associations.set(l, { textures: e }), l;
    }).catch(function() {
      return null;
    });
    return this.textureCache[o] = c, c;
  }
  loadImageSource(e, t) {
    const n = this, s = this.json, i = this.options;
    if (this.sourceCache[e] !== void 0)
      return this.sourceCache[e].then((h) => h.clone());
    const r = s.images[e], a = self.URL || self.webkitURL;
    let o = r.uri || "", c = !1;
    if (r.bufferView !== void 0)
      o = n.getDependency("bufferView", r.bufferView).then(function(h) {
        c = !0;
        const f = new Blob([h], { type: r.mimeType });
        return o = a.createObjectURL(f), o;
      });
    else if (r.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
    const l = Promise.resolve(o).then(function(h) {
      return new Promise(function(f, d) {
        let g = f;
        t.isImageBitmapLoader === !0 && (g = function(p) {
          const m = new Pe(p);
          m.needsUpdate = !0, f(m);
        }), t.load(Q.resolveURL(h, i.path), g, void 0, d);
      });
    }).then(function(h) {
      return c === !0 && a.revokeObjectURL(o), D(h, r), h.userData.mimeType = r.mimeType || Js(r.uri), h;
    }).catch(function(h) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", o), h;
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
      if (n.texCoord !== void 0 && n.texCoord > 0 && (r = r.clone(), r.channel = n.texCoord), i.extensions[R.KHR_TEXTURE_TRANSFORM]) {
        const a = n.extensions !== void 0 ? n.extensions[R.KHR_TEXTURE_TRANSFORM] : void 0;
        if (a) {
          const o = i.associations.get(r);
          r = i.extensions[R.KHR_TEXTURE_TRANSFORM].extendTexture(r, a), i.associations.set(r, o);
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
      const a = "PointsMaterial:" + n.uuid;
      let o = this.cache.get(a);
      o || (o = new Z(), ee.prototype.copy.call(o, n), o.color.copy(n.color), o.map = n.map, o.sizeAttenuation = !1, this.cache.add(a, o)), n = o;
    } else if (e.isLine) {
      const a = "LineBasicMaterial:" + n.uuid;
      let o = this.cache.get(a);
      o || (o = new he(), ee.prototype.copy.call(o, n), o.color.copy(n.color), o.map = n.map, this.cache.add(a, o)), n = o;
    }
    if (s || i || r) {
      let a = "ClonedMaterial:" + n.uuid + ":";
      s && (a += "derivative-tangents:"), i && (a += "vertex-colors:"), r && (a += "flat-shading:");
      let o = this.cache.get(a);
      o || (o = n.clone(), i && (o.vertexColors = !0), r && (o.flatShading = !0), s && (o.normalScale && (o.normalScale.y *= -1), o.clearcoatNormalScale && (o.clearcoatNormalScale.y *= -1)), this.cache.add(a, o), this.associations.set(o, this.associations.get(n))), n = o;
    }
    e.material = n;
  }
  getMaterialType() {
    return ht;
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
    const a = {}, o = i.extensions || {}, c = [];
    if (o[R.KHR_MATERIALS_UNLIT]) {
      const h = s[R.KHR_MATERIALS_UNLIT];
      r = h.getMaterialType(), c.push(h.extendParams(a, i, t));
    } else {
      const h = i.pbrMetallicRoughness || {};
      if (a.color = new B(1, 1, 1), a.opacity = 1, Array.isArray(h.baseColorFactor)) {
        const f = h.baseColorFactor;
        a.color.setRGB(f[0], f[1], f[2], U), a.opacity = f[3];
      }
      h.baseColorTexture !== void 0 && c.push(t.assignTexture(a, "map", h.baseColorTexture, V)), a.metalness = h.metallicFactor !== void 0 ? h.metallicFactor : 1, a.roughness = h.roughnessFactor !== void 0 ? h.roughnessFactor : 1, h.metallicRoughnessTexture !== void 0 && (c.push(t.assignTexture(a, "metalnessMap", h.metallicRoughnessTexture)), c.push(t.assignTexture(a, "roughnessMap", h.metallicRoughnessTexture))), r = this._invokeOne(function(f) {
        return f.getMaterialType && f.getMaterialType(e);
      }), c.push(Promise.all(this._invokeAll(function(f) {
        return f.extendMaterialParams && f.extendMaterialParams(e, a);
      })));
    }
    i.doubleSided === !0 && (a.side = kt);
    const l = i.alphaMode || xe.OPAQUE;
    if (l === xe.BLEND ? (a.transparent = !0, a.depthWrite = !1) : (a.transparent = !1, l === xe.MASK && (a.alphaTest = i.alphaCutoff !== void 0 ? i.alphaCutoff : 0.5)), i.normalTexture !== void 0 && r !== J && (c.push(t.assignTexture(a, "normalMap", i.normalTexture)), a.normalScale = new rt(1, 1), i.normalTexture.scale !== void 0)) {
      const h = i.normalTexture.scale;
      a.normalScale.set(h, h);
    }
    if (i.occlusionTexture !== void 0 && r !== J && (c.push(t.assignTexture(a, "aoMap", i.occlusionTexture)), i.occlusionTexture.strength !== void 0 && (a.aoMapIntensity = i.occlusionTexture.strength)), i.emissiveFactor !== void 0 && r !== J) {
      const h = i.emissiveFactor;
      a.emissive = new B().setRGB(h[0], h[1], h[2], U);
    }
    return i.emissiveTexture !== void 0 && r !== J && c.push(t.assignTexture(a, "emissiveMap", i.emissiveTexture, V)), Promise.all(c).then(function() {
      const h = new r(a);
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
    const t = jt.sanitizeNodeName(e || "");
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
    function i(a) {
      return n[R.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a, t).then(function(o) {
        return ze(o, a, t);
      });
    }
    const r = [];
    for (let a = 0, o = e.length; a < o; a++) {
      const c = e[a], l = Zs(c), h = s[l];
      if (h)
        r.push(h.promise);
      else {
        let f;
        c.extensions && c.extensions[R.KHR_DRACO_MESH_COMPRESSION] ? f = i(c) : f = ze(new te(), c, t), s[l] = { primitive: c, promise: f }, r.push(f);
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
    const t = this, n = this.json, s = this.extensions, i = n.meshes[e], r = i.primitives, a = [];
    for (let o = 0, c = r.length; o < c; o++) {
      const l = r[o].material === void 0 ? Ws(this.cache) : this.getDependency("material", r[o].material);
      a.push(l);
    }
    return a.push(t.loadGeometries(r)), Promise.all(a).then(function(o) {
      const c = o.slice(0, o.length - 1), l = o[o.length - 1], h = [];
      for (let d = 0, g = l.length; d < g; d++) {
        const p = l[d], m = r[d];
        let _;
        const b = c[d];
        if (m.mode === O.TRIANGLES || m.mode === O.TRIANGLE_STRIP || m.mode === O.TRIANGLE_FAN || m.mode === void 0)
          _ = i.isSkinnedMesh === !0 ? new Bt(p, b) : new ve(p, b), _.isSkinnedMesh === !0 && _.normalizeSkinWeights(), m.mode === O.TRIANGLE_STRIP ? _.geometry = Be(_.geometry, it) : m.mode === O.TRIANGLE_FAN && (_.geometry = Be(_.geometry, Re));
        else if (m.mode === O.LINES)
          _ = new Ae(p, b);
        else if (m.mode === O.LINE_STRIP)
          _ = new Ut(p, b);
        else if (m.mode === O.LINE_LOOP)
          _ = new Ht(p, b);
        else if (m.mode === O.POINTS)
          _ = new ue(p, b);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + m.mode);
        Object.keys(_.geometry.morphAttributes).length > 0 && qs(_, i), _.name = t.createUniqueName(i.name || "mesh_" + e), D(_, i), m.extensions && z(s, _, m), t.assignFinalMaterial(_), h.push(_);
      }
      for (let d = 0, g = h.length; d < g; d++)
        t.associations.set(h[d], {
          meshes: e,
          primitives: d
        });
      if (h.length === 1)
        return i.extensions && z(s, h[0], i), h[0];
      const f = new fe();
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
    return n.type === "perspective" ? t = new Gt(zt.radToDeg(s.yfov), s.aspectRatio || 1, s.znear || 1, s.zfar || 2e6) : n.type === "orthographic" && (t = new Vt(-s.xmag, s.xmag, s.ymag, -s.ymag, s.znear, s.zfar)), n.name && (t.name = this.createUniqueName(n.name)), D(t, n), Promise.resolve(t);
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
      const i = s.pop(), r = s, a = [], o = [];
      for (let c = 0, l = r.length; c < l; c++) {
        const h = r[c];
        if (h) {
          a.push(h);
          const f = new pe();
          i !== null && f.fromArray(i.array, c * 16), o.push(f);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[c]);
      }
      return new Xt(a, o);
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
    const t = this.json, n = this, s = t.animations[e], i = s.name ? s.name : "animation_" + e, r = [], a = [], o = [], c = [], l = [];
    for (let h = 0, f = s.channels.length; h < f; h++) {
      const d = s.channels[h], g = s.samplers[d.sampler], p = d.target, m = p.node, _ = s.parameters !== void 0 ? s.parameters[g.input] : g.input, b = s.parameters !== void 0 ? s.parameters[g.output] : g.output;
      p.node !== void 0 && (r.push(this.getDependency("node", m)), a.push(this.getDependency("accessor", _)), o.push(this.getDependency("accessor", b)), c.push(g), l.push(p));
    }
    return Promise.all([
      Promise.all(r),
      Promise.all(a),
      Promise.all(o),
      Promise.all(c),
      Promise.all(l)
    ]).then(function(h) {
      const f = h[0], d = h[1], g = h[2], p = h[3], m = h[4], _ = [];
      for (let T = 0, x = f.length; T < x; T++) {
        const w = f[T], y = d[T], M = g[T], v = p[T], C = m[T];
        if (w === void 0) continue;
        w.updateMatrix && w.updateMatrix();
        const A = n._createAnimationTracks(w, y, M, v, C);
        if (A)
          for (let E = 0; E < A.length; E++)
            _.push(A[E]);
      }
      const b = new Kt(i, void 0, _);
      return D(b, s), b;
    });
  }
  createNodeMesh(e) {
    const t = this.json, n = this, s = t.nodes[e];
    return s.mesh === void 0 ? null : n.getDependency("mesh", s.mesh).then(function(i) {
      const r = n._getNodeRef(n.meshCache, s.mesh, i);
      return s.weights !== void 0 && r.traverse(function(a) {
        if (a.isMesh)
          for (let o = 0, c = s.weights.length; o < c; o++)
            a.morphTargetInfluences[o] = s.weights[o];
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
    const t = this.json, n = this, s = t.nodes[e], i = n._loadNodeShallow(e), r = [], a = s.children || [];
    for (let c = 0, l = a.length; c < l; c++)
      r.push(n.getDependency("node", a[c]));
    const o = s.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", s.skin);
    return Promise.all([
      i,
      Promise.all(r),
      o
    ]).then(function(c) {
      const l = c[0], h = c[1], f = c[2];
      f !== null && l.traverse(function(d) {
        d.isSkinnedMesh && d.bind(f, Qs);
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
    const i = t.nodes[e], r = i.name ? s.createUniqueName(i.name) : "", a = [], o = s._invokeOne(function(c) {
      return c.createNodeMesh && c.createNodeMesh(e);
    });
    return o && a.push(o), i.camera !== void 0 && a.push(s.getDependency("camera", i.camera).then(function(c) {
      return s._getNodeRef(s.cameraCache, i.camera, c);
    })), s._invokeAll(function(c) {
      return c.createNodeAttachment && c.createNodeAttachment(e);
    }).forEach(function(c) {
      a.push(c);
    }), this.nodeCache[e] = Promise.all(a).then(function(c) {
      let l;
      if (i.isBone === !0 ? l = new Yt() : c.length > 1 ? l = new fe() : c.length === 1 ? l = c[0] : l = new at(), l !== c[0])
        for (let h = 0, f = c.length; h < f; h++)
          l.add(c[h]);
      if (i.name && (l.userData.name = i.name, l.name = r), D(l, i), i.extensions && z(n, l, i), i.matrix !== void 0) {
        const h = new pe();
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
    const t = this.extensions, n = this.json.scenes[e], s = this, i = new fe();
    n.name && (i.name = s.createUniqueName(n.name)), D(i, n), n.extensions && z(t, i, n);
    const r = n.nodes || [], a = [];
    for (let o = 0, c = r.length; o < c; o++)
      a.push(s.getDependency("node", r[o]));
    return Promise.all(a).then(function(o) {
      for (let l = 0, h = o.length; l < h; l++)
        i.add(o[l]);
      const c = (l) => {
        const h = /* @__PURE__ */ new Map();
        for (const [f, d] of s.associations)
          (f instanceof ee || f instanceof Pe) && h.set(f, d);
        return l.traverse((f) => {
          const d = s.associations.get(f);
          d != null && h.set(f, d);
        }), h;
      };
      return s.associations = c(i), i;
    });
  }
  _createAnimationTracks(e, t, n, s, i) {
    const r = [], a = e.name ? e.name : e.uuid, o = [];
    H[i.path] === H.weights ? e.traverse(function(f) {
      f.morphTargetInfluences && o.push(f.name ? f.name : f.uuid);
    }) : o.push(a);
    let c;
    switch (H[i.path]) {
      case H.weights:
        c = Oe;
        break;
      case H.rotation:
        c = Ne;
        break;
      case H.translation:
      case H.scale:
        c = Fe;
        break;
      default:
        n.itemSize === 1 ? c = Oe : c = Fe;
        break;
    }
    const l = s.interpolation !== void 0 ? Ys[s.interpolation] : ut, h = this._getArrayFromAccessor(n);
    for (let f = 0, d = o.length; f < d; f++) {
      const g = new c(
        o[f] + "." + H[i.path],
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
      const s = this instanceof Ne ? Ks : pt;
      return new s(this.times, this.values, this.getValueSize() / 3, n);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function tn(u, e, t) {
  const n = e.attributes, s = new Zt();
  if (n.POSITION !== void 0) {
    const a = t.json.accessors[n.POSITION], o = a.min, c = a.max;
    if (o !== void 0 && c !== void 0) {
      if (s.set(
        new N(o[0], o[1], o[2]),
        new N(c[0], c[1], c[2])
      ), a.normalized) {
        const l = Ie(Y[a.componentType]);
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
    const a = new N(), o = new N();
    for (let c = 0, l = i.length; c < l; c++) {
      const h = i[c];
      if (h.POSITION !== void 0) {
        const f = t.json.accessors[h.POSITION], d = f.min, g = f.max;
        if (d !== void 0 && g !== void 0) {
          if (o.setX(Math.max(Math.abs(d[0]), Math.abs(g[0]))), o.setY(Math.max(Math.abs(d[1]), Math.abs(g[1]))), o.setZ(Math.max(Math.abs(d[2]), Math.abs(g[2]))), f.normalized) {
            const p = Ie(Y[f.componentType]);
            o.multiplyScalar(p);
          }
          a.max(o);
        } else
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    s.expandByVector(a);
  }
  u.boundingBox = s;
  const r = new Jt();
  s.getCenter(r.center), r.radius = s.min.distanceTo(s.max) / 2, u.boundingSphere = r;
}
function ze(u, e, t) {
  const n = e.attributes, s = [];
  function i(r, a) {
    return t.getDependency("accessor", r).then(function(o) {
      u.setAttribute(a, o);
    });
  }
  for (const r in n) {
    const a = Le[r] || r.toLowerCase();
    a in u.attributes || s.push(i(n[r], a));
  }
  if (e.indices !== void 0 && !u.index) {
    const r = t.getDependency("accessor", e.indices).then(function(a) {
      u.setIndex(a);
    });
    s.push(r);
  }
  return De.workingColorSpace !== U && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${De.workingColorSpace}" not supported.`), D(u, e), tn(u, e, t), Promise.all(s).then(function() {
    return e.targets !== void 0 ? $s(u, e.targets, t) : u;
  });
}
const sn = /^[og]\s*(.+)?/, nn = /^mtllib /, rn = /^usemtl /, on = /^usemap /, Ve = /\s+/, Xe = new N(), Te = new N(), Ke = new N(), Ye = new N(), F = new N(), ae = new B();
function an() {
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
          const a = {
            index: this.materials.length,
            name: s || "",
            mtllib: Array.isArray(i) && i.length > 0 ? i[i.length - 1] : "",
            smooth: r !== void 0 ? r.smooth : this.smooth,
            groupStart: r !== void 0 ? r.groupEnd : 0,
            groupEnd: -1,
            groupCount: -1,
            inherited: !1,
            clone: function(o) {
              const c = {
                index: typeof o == "number" ? o : this.index,
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
          return this.materials.push(a), a;
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
      Xe.fromArray(s, e), Te.fromArray(s, t), Ke.fromArray(s, n), F.subVectors(Ke, Te), Ye.subVectors(Xe, Te), F.cross(Ye), F.normalize(), i.push(F.x, F.y, F.z), i.push(F.x, F.y, F.z), i.push(F.x, F.y, F.z);
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
    addFace: function(e, t, n, s, i, r, a, o, c) {
      const l = this.vertices.length;
      let h = this.parseVertexIndex(e, l), f = this.parseVertexIndex(t, l), d = this.parseVertexIndex(n, l);
      if (this.addVertex(h, f, d), this.addColor(h, f, d), a !== void 0 && a !== "") {
        const g = this.normals.length;
        h = this.parseNormalIndex(a, g), f = this.parseNormalIndex(o, g), d = this.parseNormalIndex(c, g), this.addNormal(h, f, d);
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
class cn extends me {
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
    r.setPath(this.path), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, function(a) {
      try {
        t(i.parse(a));
      } catch (o) {
        s ? s(o) : console.error(o), i.manager.itemError(e);
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
    const t = new an();
    e.indexOf(`\r
`) !== -1 && (e = e.replace(/\r\n/g, `
`)), e.indexOf(`\\
`) !== -1 && (e = e.replace(/\\\n/g, ""));
    const n = e.split(`
`);
    let s = [];
    for (let a = 0, o = n.length; a < o; a++) {
      const c = n[a].trimStart();
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
              ), h.length >= 7 ? (ae.setRGB(
                parseFloat(h[4]),
                parseFloat(h[5]),
                parseFloat(h[6]),
                V
              ), t.colors.push(ae.r, ae.g, ae.b)) : t.colors.push(void 0, void 0, void 0);
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
              const b = _.split("/");
              d.push(b);
            }
          }
          const g = d[0];
          for (let p = 1, m = d.length - 1; p < m; p++) {
            const _ = d[p], b = d[p + 1];
            t.addFace(
              g[0],
              _[0],
              b[0],
              g[1],
              _[1],
              b[1],
              g[2],
              _[2],
              b[2]
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
        } else if ((s = sn.exec(c)) !== null) {
          const h = (" " + s[0].slice(1).trim()).slice(1);
          t.startObject(h);
        } else if (rn.test(c))
          t.object.startMaterial(c.substring(7).trim(), t.materialLibraries);
        else if (nn.test(c))
          t.materialLibraries.push(c.substring(7).trim());
        else if (on.test(c))
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
    const i = new fe();
    if (i.materialLibraries = [].concat(t.materialLibraries), !(t.objects.length === 1 && t.objects[0].geometry.vertices.length === 0) === !0)
      for (let a = 0, o = t.objects.length; a < o; a++) {
        const c = t.objects[a], l = c.geometry, h = c.materials, f = l.type === "Line", d = l.type === "Points";
        let g = !1;
        if (l.vertices.length === 0) continue;
        const p = new te();
        p.setAttribute("position", new G(l.vertices, 3)), l.normals.length > 0 && p.setAttribute("normal", new G(l.normals, 3)), l.colors.length > 0 && (g = !0, p.setAttribute("color", new G(l.colors, 3))), l.hasUVIndices === !0 && p.setAttribute("uv", new G(l.uvs, 2));
        const m = [];
        for (let b = 0, T = h.length; b < T; b++) {
          const x = h[b], w = x.name + "_" + x.smooth + "_" + g;
          let y = t.materials[w];
          if (this.materials !== null) {
            if (y = this.materials.create(x.name), f && y && !(y instanceof he)) {
              const M = new he();
              ee.prototype.copy.call(M, y), M.color.copy(y.color), y = M;
            } else if (d && y && !(y instanceof Z)) {
              const M = new Z({ size: 10, sizeAttenuation: !1 });
              ee.prototype.copy.call(M, y), M.color.copy(y.color), M.map = y.map, y = M;
            }
          }
          y === void 0 && (f ? y = new he() : d ? y = new Z({ size: 1, sizeAttenuation: !1 }) : y = new Qt(), y.name = x.name, y.flatShading = !x.smooth, y.vertexColors = g, t.materials[w] = y), m.push(y);
        }
        let _;
        if (m.length > 1) {
          for (let b = 0, T = h.length; b < T; b++) {
            const x = h[b];
            p.addGroup(x.groupStart, x.groupCount, b);
          }
          f ? _ = new Ae(p, m) : d ? _ = new ue(p, m) : _ = new ve(p, m);
        } else
          f ? _ = new Ae(p, m[0]) : d ? _ = new ue(p, m[0]) : _ = new ve(p, m[0]);
        _.name = c.name, i.add(_);
      }
    else if (t.vertices.length > 0) {
      const a = new Z({ size: 1, sizeAttenuation: !1 }), o = new te();
      o.setAttribute("position", new G(t.vertices, 3)), t.colors.length > 0 && t.colors[0] !== void 0 && (o.setAttribute("color", new G(t.colors, 3)), a.vertexColors = !0);
      const c = new ue(o, a);
      i.add(c);
    }
    return i;
  }
}
const mt = new S.MeshStandardMaterial({
  color: 16777215,
  roughness: 0.5,
  metalness: 0.1
});
function ln(u) {
  return u.split(".").pop()?.toLowerCase() ?? "";
}
function hn(u) {
  const e = new S.Box3().setFromObject(u), t = e.getSize(new S.Vector3()), n = e.getCenter(new S.Vector3()), i = 3 / Math.max(t.x, t.y, t.z, 1e-6), r = new S.Group();
  for (r.position.set(-n.x, -n.y, -n.z); u.children.length > 0; )
    r.add(u.children[0]);
  u.add(r), u.scale.setScalar(i), u.updateMatrixWorld(!0);
}
function We(u) {
  u.traverse((e) => {
    e.isMesh && (e.material = mt.clone());
  }), u.traverse((e) => {
    e.isMesh && e.geometry?.computeVertexNormals?.();
  });
}
function we(u, e) {
  return new Promise((t, n) => {
    u.load(e, t, void 0, n);
  });
}
async function un(u) {
  const e = ln(u.name), t = URL.createObjectURL(u);
  let n;
  const s = bt();
  try {
    if (e === "stl") {
      const i = new ys(), r = await we(i, t);
      s.resources.add(r), n = new S.Group();
      const a = mt.clone();
      s.resources.add(a);
      const o = new S.Mesh(r, a);
      n.add(o), r.computeVertexNormals(), o.rotation.x = -Math.PI / 2;
    } else if (e === "obj") {
      const i = new cn();
      n = await we(i, t), s.capture(n), We(n);
    } else if (e === "gltf" || e === "glb") {
      const i = S.Cache.enabled, r = new Ts(), a = await we(r, t);
      n = a.scene;
      for (const o of /* @__PURE__ */ new Set([n, ...a.scenes ?? []])) s.capture(o);
      !i && !S.Cache.enabled && s.ownBitmaps(), We(n);
    } else
      throw new Error(`Unsupported model format: .${e}`);
    return s.capture(n), s.releaseExcept(_t(n)), hn(n), gt.set(n, s), { group: n, objectUrl: t };
  } catch (i) {
    throw n && s.capture(n), s.releaseExcept(), URL.revokeObjectURL(t), new Error(`Failed to load model ${u.name}: ${i.message}`);
  }
}
const gt = /* @__PURE__ */ new WeakMap();
function $e(u) {
  const e = u.source?.data ?? u.image;
  return Array.isArray(e) ? e : [e];
}
function _t(u) {
  const e = /* @__PURE__ */ new Set();
  return u?.traverse((t) => {
    t.geometry && e.add(t.geometry);
    for (const n of Array.isArray(t.material) ? t.material : [t.material])
      if (n) {
        e.add(n);
        for (const s of Object.values(n))
          s?.isTexture && e.add(s);
      }
  }), e;
}
function bt(u = /* @__PURE__ */ new Set()) {
  const e = /* @__PURE__ */ new Set(), t = /* @__PURE__ */ new Set();
  return {
    resources: e,
    capture(n) {
      for (const s of _t(n)) e.add(s);
    },
    ownBitmaps() {
      for (const n of e)
        if (n.isTexture)
          for (const s of $e(n))
            typeof ImageBitmap < "u" && s instanceof ImageBitmap && t.add(s);
    },
    releaseExcept(n = /* @__PURE__ */ new Set()) {
      const s = /* @__PURE__ */ new Set();
      for (const i of n)
        if (i.isTexture) for (const r of $e(i)) s.add(r);
      for (const i of e)
        n.has(i) || u.has(i) || (u.add(i), i.dispose?.());
      for (const i of t)
        if (!u.has(i)) {
          if (Object.values(S.Cache?.files ?? {}).includes(i)) {
            t.delete(i);
            continue;
          }
          s.has(i) || (u.add(i), i.close());
        }
    }
  };
}
function xt(u, e = /* @__PURE__ */ new Set()) {
  const t = gt.get(u) ?? bt(e);
  t.capture(u), t.releaseExcept();
}
function qe(u, e = null, t = {}) {
  let n = !1;
  return {
    group: u,
    objectUrl: e,
    metadata: t,
    dispose() {
      n || (n = !0, xt(u), e && URL.revokeObjectURL(e));
    }
  };
}
const de = {
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
}, yt = Object.freeze({
  spinX: !1,
  spinY: !0,
  spinZ: !1,
  float: !1,
  bounce: !1,
  pulse: !1,
  shake: !1,
  orbit: !1
});
Object.freeze(Object.keys(yt));
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
  /** Cancel any in-progress reset. */
  clearReset() {
  }
}
const Ze = 0.3;
function fn(u) {
  return 1 - Math.pow(1 - u, 3);
}
class Me extends $ {
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
    const n = Math.min(this._reset.elapsed / Ze, 1), s = fn(n);
    return e.rotation[this._axis] = this._reset.startRotation * (1 - s), this._reset.elapsed >= Ze ? (e.rotation[this._axis] = 0, this._reset = null, !1) : !0;
  }
  clearReset() {
    this._reset = null;
  }
  /** @returns {boolean} Whether a reset is currently in progress. */
  get isResetting() {
    return this._reset !== null;
  }
}
const ce = de.float, le = 0.3;
function Je(u) {
  return 1 - Math.pow(1 - u, 3);
}
class dn extends $ {
  constructor() {
    super(), this._resetX = null, this._resetZ = null;
  }
  update(e, t, n, s) {
    const i = ce?.oscillateX, r = ce?.oscillateZ;
    this._resetX || (e.rotation.x += Math.sin(s.time * 0.5) * i * t * 2), this._resetZ || (e.rotation.z += Math.sin(s.time * 0.3) * r * t * 2);
  }
  seekTo(e, t, n, s) {
    const i = ce?.oscillateX, r = ce?.oscillateZ;
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
      const s = Math.min(this._resetX.elapsed / le, 1), i = Je(s);
      e.rotation.x = this._resetX.startRotation * (1 - i), this._resetX.elapsed >= le ? (e.rotation.x = 0, this._resetX = null) : n = !0;
    }
    if (this._resetZ) {
      this._resetZ.elapsed += t;
      const s = Math.min(this._resetZ.elapsed / le, 1), i = Je(s);
      e.rotation.z = this._resetZ.startRotation * (1 - i), this._resetZ.elapsed >= le ? (e.rotation.z = 0, this._resetZ = null) : n = !0;
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
const Qe = 0.3;
function pn(u) {
  return 1 - Math.pow(1 - u, 3);
}
class mn extends $ {
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
    const n = Math.min(this._reset.elapsed / Qe, 1), s = pn(n);
    return e.position.y = this._reset.startValue * (1 - s), this._reset.elapsed >= Qe ? (e.position.y = 0, this._reset = null, !1) : !0;
  }
  clearReset() {
    this._reset = null;
  }
}
const et = 0.3;
function gn(u) {
  return 1 - Math.pow(1 - u, 3);
}
class _n extends $ {
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
    const n = Math.min(this._reset.elapsed / et, 1), s = gn(n);
    return e.scale.setScalar(this._reset.startValue + (1 - this._reset.startValue) * s), this._reset.elapsed >= et ? (e.scale.setScalar(1), this._reset = null, !1) : !0;
  }
  clearReset() {
    this._reset = null;
  }
}
class bn extends $ {
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
class xn extends $ {
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
    const r = this._baseline.pos.length(), a = s.time * n * 0.5;
    i.position.set(Math.sin(a) * r, this._baseline.pos.y, Math.cos(a) * r), i.lookAt(0, 0, 0);
  }
  seekTo(e, t, n, s) {
    const i = s.camera;
    if (!i) return;
    const r = this._baseline ? this._baseline.pos.length() : 5, a = this._baseline ? this._baseline.pos.y : 0.5, o = t * n * 0.5;
    i.position.set(Math.sin(o) * r, a, Math.cos(o) * r), i.lookAt(0, 0, 0);
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
const yn = ["spinX", "spinY", "spinZ", "float", "bounce", "pulse", "shake", "orbit"];
class Tn {
  constructor() {
    this.useFadeInOut = !0, this.fadeMode = "both", this.animationEffects = { ...yt }, this.speed = de.spinY.defaultSpeed, this.showPhaseDuration = 2e4, this.animationDuration = 2500, this.phaseStartTime = performance.now(), this.time = 0, this.baseRotation = { x: 0, y: 0, z: 0 }, this._effectMap = {
      spinX: new Me("x"),
      spinY: new Me("y"),
      spinZ: new Me("z"),
      float: new dn(),
      bounce: new mn(),
      pulse: new _n(),
      shake: new bn(),
      orbit: new xn()
    }, this._effectList = yn.map((e) => ({ key: e, effect: this._effectMap[e] })), this._resetTransitions = this._createResetTransitionsProxy(), this._previousEffects = null, this._effectiveShowDuration = this.showPhaseDuration;
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
  // Compute the show phase duration rounded up to the nearest complete spin
  // so fadeOut always fires at a 360°/720°/… boundary.
  // Falls back to raw showPhaseDuration when no spin effect is active.
  _computeSpinAlignedShowDuration() {
    if (!(this.animationEffects.spinX || this.animationEffects.spinY || this.animationEffects.spinZ)) return this.showPhaseDuration;
    const t = 2 * Math.PI / this.speed * 1e3;
    return Math.max(1, Math.ceil(this.showPhaseDuration / t)) * t;
  }
  // Called by SceneManager when an external event (e.g. fade variant change)
  // triggers a new fadeIn mid-loop so the 3D model rotation is reset before
  // particles are captured.
  onExternalFadeRestart(e) {
    this._resetSpinRotations(e);
  }
  // Reset accumulated rotation to 0 for every active spin axis.
  // Called at cycle boundaries so each fadeIn always starts from the front.
  _resetSpinRotations(e) {
    if (!e) return;
    const t = this.animationEffects;
    t.spinX && (e.rotation.x = 0), t.spinY && (e.rotation.y = 0), t.spinZ && (e.rotation.z = 0);
  }
  setFadeOptions(e = {}) {
    if (typeof e.useFadeInOut == "boolean" && (this.useFadeInOut = e.useFadeInOut), (e.fadeMode === "both" || e.fadeMode === "in" || e.fadeMode === "out") && (this.fadeMode = e.fadeMode), e.animationEffects && typeof e.animationEffects == "object" && (this.animationEffects = { ...this.animationEffects, ...e.animationEffects }), typeof e.animationSpeed == "number" && (this.speed = Math.max(0.01, e.animationSpeed)), typeof e.showPhaseDuration == "number" && (this.showPhaseDuration = e.showPhaseDuration), typeof e.animationDuration == "number" && (this.animationDuration = e.animationDuration), e.animationPreset && de[e.animationPreset]?.type === "fadeInOut" && (this.useFadeInOut = !0), typeof e.rotateOnShow == "boolean" && e.rotateOnShow && e.showPreset) {
      const t = de[e.showPreset];
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
    for (const { key: r, effect: a } of this._effectList)
      s[r] && a.update(e, t, this.speed, i);
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
    this.fadeMode === "in" ? r === "fadeOut" ? (this._resetSpinRotations(e), t.startAnimation("fadeIn")) : r === "fadeIn" && t.isAnimationComplete() ? (this._effectiveShowDuration = this._computeSpinAlignedShowDuration(), t.startAnimation("show"), this.phaseStartTime = i) : r === "show" && (this.applyEffects(e, n, s), this._applyResetTransitions(e, n), i - this.phaseStartTime >= this._effectiveShowDuration && (this._resetSpinRotations(e), t.startAnimation("fadeIn"))) : this.fadeMode === "out" ? r === "fadeIn" ? (this._effectiveShowDuration = this._computeSpinAlignedShowDuration(), t.startAnimation("show"), this.phaseStartTime = i) : r === "show" ? (this.applyEffects(e, n, s), this._applyResetTransitions(e, n), i - this.phaseStartTime >= this._effectiveShowDuration && t.startAnimation("fadeOut")) : r === "fadeOut" && (this.applyEffects(e, n, s), this._applyResetTransitions(e, n), t.isAnimationComplete() && (this._resetSpinRotations(e), this._effectiveShowDuration = this._computeSpinAlignedShowDuration(), t.startAnimation("show"), this.phaseStartTime = i)) : r === "fadeIn" && t.isAnimationComplete() ? (this._effectiveShowDuration = this._computeSpinAlignedShowDuration(), t.startAnimation("show"), this.phaseStartTime = i) : r === "show" ? (this.applyEffects(e, n, s), this._applyResetTransitions(e, n), i - this.phaseStartTime >= this._effectiveShowDuration && t.startAnimation("fadeOut")) : r === "fadeOut" && (this.applyEffects(e, n, s), this._applyResetTransitions(e, n), t.isAnimationComplete() && (this._resetSpinRotations(e), t.startAnimation("fadeIn")));
  }
  getLoopDurationMs() {
    if (!this.useFadeInOut)
      return Math.round(2 * Math.PI / this.speed * 1e3);
    const e = this._computeSpinAlignedShowDuration();
    return this.fadeMode === "in" || this.fadeMode === "out" ? this.animationDuration + e : this.animationDuration * 2 + e;
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
      let a = i;
      if (this.useFadeInOut) {
        const c = this.animationDuration / 1e3;
        this.fadeMode === "in" ? i < c ? a = 0 : a = i - c : this.fadeMode === "out" ? a = i : i < c ? a = 0 : a = i - c;
      }
      const o = {
        time: a,
        animationEffects: r,
        camera: s || null
      };
      for (const { key: c, effect: l } of this._effectList)
        c !== "orbit" && r[c] && l.seekTo(t, a, this.speed, o);
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
        const r = this.animationDuration, a = this._computeSpinAlignedShowDuration(), o = e;
        this.fadeMode === "in" ? o < r ? n.setPhaseProgress("fadeIn", o / r) : n.setPhaseProgress("show", 1) : this.fadeMode === "out" ? o < a ? n.setPhaseProgress("show", 1) : n.setPhaseProgress("fadeOut", (o - a) / r) : o < r ? n.setPhaseProgress("fadeIn", o / r) : o < r + a ? n.setPhaseProgress("show", 1) : n.setPhaseProgress("fadeOut", (o - r - a) / r);
      } else
        n.setPhaseProgress("show", 1);
  }
}
function wn(u, e) {
  if (e >= 1) return u;
  if (u.startsWith("#")) {
    const t = parseInt(u.slice(1, 3), 16), n = parseInt(u.slice(3, 5), 16), s = parseInt(u.slice(5, 7), 16);
    return `rgba(${t},${n},${s},${e})`;
  }
  return u.startsWith("rgb(") ? u.replace("rgb(", "rgba(").replace(")", `,${e})`) : u;
}
class Mn extends W {
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
    const r = i < 1 ? wn(s, i) : s;
    r !== this._lastFillStyle && (this._bitmapCtx.fillStyle = r, this._lastFillStyle = r), this._bitmapCtx.fillRect(e, t, this.options.pixelSize, this.options.pixelSize);
  }
  render(e, t, n, s) {
    const { pixelSize: i, minBrightness: r, invert: a } = this.options;
    for (let o = 0; o < n; o++)
      for (let c = 0; c < t; c++) {
        const l = (o * t + c) * 4, h = e[l], f = e[l + 1], d = e[l + 2];
        if (e[l + 3] === 0) continue;
        const p = (0.3 * h + 0.59 * f + 0.11 * d) / 255;
        if (p < r) continue;
        const m = a ? 1 - p : p;
        if (!this.shouldDraw(m)) continue;
        const _ = s(m);
        this.drawPixel(c * i, o * i, m, _, 1);
      }
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
const tt = {
  classic: " .:-=+*#%@",
  blocks: " ░▒▓█",
  dense: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  minimal: " .+#"
}, Sn = "Menlo, Monaco, Consolas, monospace";
class Rn extends W {
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
    const n = tt[this.options.charRamp] ?? tt.classic;
    this._rampChars = Array.from(n), this._rampLen = this._rampChars.length, this._cellW = this._bitmapCanvas.width / e, this._cellH = this._bitmapCanvas.height / t;
    const s = Math.max(6, Math.floor(this._cellH));
    this._fontStr = `${s}px ${Sn}`;
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
    const a = this._bitmapCtx, { pixelSize: o, asciiColored: c, colors: l } = this.options, h = Math.round(e / o), f = Math.round(t / o);
    this._fontStr && (a.font = this._fontStr, a.textBaseline = "top", a.textAlign = "left");
    const d = c ? s : l?.[l.length - 1] ?? s;
    i < 1 && (a.globalAlpha = i), a.fillStyle = d, a.fillText(r, h * this._cellW + this._xOffset, f * this._cellH), i < 1 && (a.globalAlpha = 1);
  }
  render(e, t, n, s) {
    if (!this._bitmapCtx || t === 0 || n === 0) return;
    (this._dirty || t !== this._lastGridW || n !== this._lastGridH) && this._prepare(t, n);
    const { minBrightness: i, invert: r, asciiColored: a } = this.options, o = this._bitmapCtx;
    o.font = this._fontStr, o.textBaseline = "top", o.textAlign = "left";
    for (let c = 0; c < n; c++)
      for (let l = 0; l < t; l++) {
        const h = (c * t + l) * 4, f = e[h], d = e[h + 1], g = e[h + 2];
        if (e[h + 3] === 0) continue;
        const m = (0.2126 * f + 0.7152 * d + 0.0722 * g) / 255;
        if (m < i) continue;
        const _ = r ? 1 - m : m, b = Math.min(Math.round(_ * (this._rampLen - 1)), this._rampLen - 1), T = this._rampChars[b];
        if (T === " ") continue;
        const x = s(a ? _ : 1);
        x !== this._lastFill && (o.fillStyle = x, this._lastFill = x), o.fillText(T, l * this._cellW + this._xOffset, c * this._cellH);
      }
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
const Cn = Math.PI / 180;
class En extends W {
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
    return (e % 180 + 180) % 180 * Cn;
  }
  // ---------------------------------------------------------------------------
  // Public render / drawPixel
  // ---------------------------------------------------------------------------
  render(e, t, n, s) {
    const i = this._bitmapCtx;
    if (!i) return;
    const { pixelSize: r, minBrightness: a, invert: o, halftoneAngle: c } = this.options, l = r, h = l * 0.5 * 0.95, f = 0.5, d = this._normalizeRad(c), g = d !== 0;
    g && (i.save(), i.translate(this._bitmapCanvas.width / 2, this._bitmapCanvas.height / 2), i.rotate(d), i.translate(-this._bitmapCanvas.width / 2, -this._bitmapCanvas.height / 2));
    let p = null;
    for (let m = 0; m < n; m++)
      for (let _ = 0; _ < t; _++) {
        const b = (m * t + _) * 4, T = e[b], x = e[b + 1], w = e[b + 2];
        if (e[b + 3] === 0) continue;
        const M = (0.2126 * T + 0.7152 * x + 0.0722 * w) / 255;
        if (M < a) continue;
        const v = o ? 1 - M : M, C = (1 - v) * h;
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
    const { pixelSize: a, halftoneAngle: o } = this.options, c = a, l = c * 0.5 * 0.95, h = 0.5, f = (1 - n) * l;
    if (f < h) return;
    const d = Math.min(l, f), g = Math.round(e / a), p = Math.round(t / a);
    let m = g * c + c / 2, _ = p * c + c / 2;
    if (o !== 0) {
      const x = this._normalizeRad(o), w = Math.cos(x), y = Math.sin(x), M = this._bitmapCanvas.width, v = this._bitmapCanvas.height, C = m - M / 2, A = _ - v / 2;
      m = M / 2 + C * w - A * y, _ = v / 2 + C * y + A * w;
    }
    const b = r.globalAlpha, T = r.fillStyle;
    i < 1 && (r.globalAlpha = i), r.fillStyle = s, this._drawDot(r, m, _, d), r.globalAlpha = b, r.fillStyle = T;
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class vn extends W {
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
    const i = t - s, r = n - s, a = s * 2;
    if (this.options.ledShape === "roundRect") {
      const o = s * 0.35;
      if (this._hasRoundRect)
        e.beginPath(), e.roundRect(i, r, a, a, o), e.fill();
      else {
        const c = Math.min(o, s);
        e.beginPath(), e.moveTo(i + c, r), e.lineTo(i + a - c, r), e.arcTo(i + a, r, i + a, r + c, c), e.lineTo(i + a, r + a - c), e.arcTo(i + a, r + a, i + a - c, r + a, c), e.lineTo(i + c, r + a), e.arcTo(i, r + a, i, r + a - c, c), e.lineTo(i, r + c), e.arcTo(i, r, i + c, r, c), e.closePath(), e.fill();
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
    const { pixelSize: r, ledGap: a, minBrightness: o, invert: c } = this.options, h = Math.max(1, r - a) / 2;
    let f = null;
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = (d * t + g) * 4, m = e[p], _ = e[p + 1], b = e[p + 2], T = e[p + 3];
        if (T === 0) continue;
        const w = (0.2126 * m + 0.7152 * _ + 0.0722 * b) / 255 * (T / 255);
        if (w < o) continue;
        const y = c ? 1 - w : w, M = g * r + r / 2, v = d * r + r / 2, C = s(y);
        C !== f && (i.fillStyle = C, f = C), this._drawLed(i, M, v, h);
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
    const { pixelSize: a, ledGap: o } = this.options, l = Math.max(1, a - o) / 2, h = Math.round(e / a), f = Math.round(t / a), d = h * a + a / 2, g = f * a + a / 2, p = r.globalAlpha, m = r.fillStyle;
    i < 1 && (r.globalAlpha = i), r.fillStyle = s, this._drawLed(r, d, g, l), r.globalAlpha = p, r.fillStyle = m;
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class An extends W {
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
    const { pixelSize: i, minBrightness: r, invert: a, stippleDotSize: o, stippleDensity: c, seed: l } = this.options, h = se(l ?? 305419896), f = this._bitmapCtx;
    for (let d = 0; d < n; d++)
      for (let g = 0; g < t; g++) {
        const p = (d * t + g) * 4, m = e[p], _ = e[p + 1], b = e[p + 2];
        if (e[p + 3] === 0) continue;
        const x = (0.2126 * m + 0.7152 * _ + 0.0722 * b) / 255;
        if (x < r) continue;
        const w = a ? 1 - x : x, y = (1 - w) * c, M = Math.max(0, Math.round(y));
        if (M === 0) continue;
        const v = s(w);
        f.fillStyle = v;
        const C = g * i, A = d * i;
        for (let E = 0; E < M; E++) {
          const L = C + h() * i, I = A + h() * i, X = o * (0.6 + h() * 0.4);
          f.beginPath(), f.arc(L, I, X, 0, Math.PI * 2), f.fill();
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
    const { stippleDotSize: r, seed: a, pixelSize: o } = this.options, c = ((a ?? 305419896) ^ (e * 73856093 >>> 0 ^ t * 19349663 >>> 0)) >>> 0, l = se(c), h = this._bitmapCtx, f = r * (0.6 + l() * 0.4), d = e + o * 0.5, g = t + o * 0.5;
    i < 1 && (h.globalAlpha = i), h.fillStyle = s, h.beginPath(), h.arc(d, g, f, 0, Math.PI * 2), h.fill(), i < 1 && (h.globalAlpha = 1);
  }
  dispose() {
    this._bitmapCanvas?.parentNode && this._bitmapCanvas.parentNode.removeChild(this._bitmapCanvas), this._bitmapCanvas = null, this._bitmapCtx = null;
  }
}
class Ln {
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
const In = new Ln(), st = {
  bitmap: ft,
  pixelArt: Mn,
  ascii: Rn,
  halftone: En,
  ledMatrix: vn,
  stipple: An
};
function Pn(u, e = {}) {
  const t = st[u];
  if (t) return new t(e);
  const n = In.getRenderer(u);
  if (n) return new n.RendererClass(e);
  throw new Error(`Unknown render mode: "${u}". Valid modes: ${Object.keys(st).join(", ")}`);
}
const Tt = {
  cube: { size: 1 },
  sphere: { radius: 1, widthSegments: 32, heightSegments: 32 },
  torus: { radius: 0.8, tube: 0.3, radialSegments: 16, tubularSegments: 100 },
  cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1.5, radialSegments: 32 },
  cone: { radius: 0.8, height: 1.5, radialSegments: 32 },
  icosahedron: { radius: 1, detail: 0 },
  torusKnot: { radius: 0.7, tube: 0.2, tubularSegments: 100, radialSegments: 16 },
  plane: { width: 2, height: 2 }
};
function Fn(u, e) {
  const t = { ...Tt[u], ...e };
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
      throw new Error(`Unknown shape: "${u}". Valid types: ${Nn().join(", ")}`);
  }
}
function On(u, e = {}) {
  const t = Fn(u, e), n = new S.MeshStandardMaterial({ color: 16777215 }), s = new S.Mesh(t, n), i = new S.Group();
  return i.add(s), i;
}
function Nn() {
  return Object.keys(Tt);
}
class Dn extends es {
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
class kn extends me {
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
    r.setPath(this.path), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, function(a) {
      const o = i.parse(JSON.parse(a));
      t && t(o);
    }, n, s);
  }
  /**
   * Parses the given font data and returns the resulting font.
   *
   * @param {Object} json - The raw font data as a JSON object.
   * @return {Font} The font.
   */
  parse(e) {
    return new jn(e);
  }
}
class jn {
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
    const s = [], i = Bn(e, t, this.data, n);
    for (let r = 0, a = i.length; r < a; r++)
      s.push(...i[r].toShapes());
    return s;
  }
}
function Bn(u, e, t, n) {
  const s = Array.from(u), i = e / t.resolution, r = (t.boundingBox.yMax - t.boundingBox.yMin + t.underlineThickness) * i, a = [];
  let o = 0, c = 0;
  (n == "rtl" || n == "tb") && s.reverse();
  for (let l = 0; l < s.length; l++) {
    const h = s[l];
    if (h === `
`)
      o = 0, c -= r;
    else {
      const f = Un(h, i, o, c, t);
      n == "tb" ? (o = 0, c += t.ascender * i) : o += f.offsetX, a.push(f.path);
    }
  }
  return a;
}
function Un(u, e, t, n, s) {
  const i = s.glyphs[u] || s.glyphs["?"];
  if (!i) {
    console.error('THREE.Font: character "' + u + '" does not exists in font family ' + s.familyName + ".");
    return;
  }
  const r = new ts();
  let a, o, c, l, h, f, d, g;
  if (i.o) {
    const p = i._cachedOutline || (i._cachedOutline = i.o.split(" "));
    for (let m = 0, _ = p.length; m < _; )
      switch (p[m++]) {
        case "m":
          a = p[m++] * e + t, o = p[m++] * e + n, r.moveTo(a, o);
          break;
        case "l":
          a = p[m++] * e + t, o = p[m++] * e + n, r.lineTo(a, o);
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
const nt = {
  helvetiker: () => import("./helvetiker_regular.typeface-DkohR1w2.js"),
  helvetikerBold: () => import("./helvetiker_bold.typeface-Dpdv0pBL.js"),
  gentilisRegular: () => import("./gentilis_regular.typeface-D0DjsepO.js"),
  gentilisBold: () => import("./gentilis_bold.typeface-6e94SVPf.js"),
  optimer: () => import("./optimer_regular.typeface-BwmB6JhU.js"),
  optimerBold: () => import("./optimer_bold.typeface-DdbaUQRb.js"),
  droidMono: () => import("./droid_sans_mono_regular.typeface-Bk29f_ZW.js")
}, Hn = new kn(), Se = /* @__PURE__ */ new Map();
async function Gn(u) {
  if (Se.has(u)) return Se.get(u);
  const e = nt[u] ?? nt.helvetiker, { default: t } = await e(), n = Hn.parse(t);
  return Se.set(u, n), n;
}
function zn(u, e, t, n, s, i, r, a) {
  const o = {
    font: e,
    size: t,
    depth: n,
    bevelEnabled: s,
    bevelThickness: 0.05 * t,
    bevelSize: 0.03 * t,
    bevelSegments: 3
  }, c = [];
  let l = 0;
  for (const h of u) {
    if (h === " ") {
      l += t * 0.3 + i;
      continue;
    }
    const f = new Dn(h, o), d = new S.Mesh(f, r);
    a.add(d), f.computeBoundingBox();
    const g = f.boundingBox, p = g.max.x - g.min.x;
    d.position.x = l - g.min.x, l += p + i, c.push(d);
  }
  return { meshes: c, totalWidth: l - i };
}
async function Vn(u, e = {}) {
  const {
    fontFamily: t = "helvetiker",
    fontSize: n = 1,
    extrudeDepth: s = 0.3,
    bevelEnabled: i = !0,
    letterSpacing: r = 0
  } = e, a = await Gn(t), o = new S.MeshStandardMaterial({ color: 16777215 }), c = new S.Group();
  try {
    const l = (u || "Text").split(`
`), h = n * 1.3, f = [];
    let d = 0;
    for (const m of l) {
      const { meshes: _, totalWidth: b } = zn(
        m,
        a,
        n,
        s,
        i,
        r,
        o,
        c
      );
      f.push({ meshes: _, totalWidth: b }), b > d && (d = b);
    }
    const p = h * l.length / 2 - n / 2;
    return f.forEach(({ meshes: m, totalWidth: _ }, b) => {
      const T = -_ / 2, x = p - b * h;
      for (const w of m)
        w.position.x += T, w.position.y = x, c.add(w);
    }), c.children.length || o.dispose(), c;
  } catch (l) {
    const h = c.children.length > 0;
    throw xt(c), h || o.dispose(), l;
  }
}
function Xn(u) {
  return new Promise((e, t) => {
    const n = u.type === "image/svg+xml" || u.name.toLowerCase().endsWith(".svg"), s = URL.createObjectURL(u);
    let i;
    const r = () => {
      i && (i.onload = i.onerror = null);
    }, a = (o) => {
      r(), URL.revokeObjectURL(s), t(o);
    };
    try {
      i = new Image(), i.onload = () => {
        r();
        try {
          if (n) {
            const o = Math.min(i.naturalWidth || 512, 2048), c = Math.min(i.naturalHeight || 512, 2048), l = document.createElement("canvas");
            l.width = o, l.height = c, l.getContext("2d").drawImage(i, 0, 0, o, c), URL.revokeObjectURL(s), e({ element: l, width: o, height: c, objectUrl: null });
          } else
            e({ element: i, width: i.naturalWidth, height: i.naturalHeight, objectUrl: s });
        } catch (o) {
          a(o);
        }
      }, i.onerror = () => a(new Error(n ? "Failed to load SVG" : "Failed to load image")), i.src = s;
    } catch (o) {
      a(o);
    }
  });
}
async function Kn(u) {
  const { element: e, width: t, height: n, objectUrl: s } = await Xn(u);
  let i, r, a;
  try {
    i = new S.Texture(e), i.needsUpdate = !0;
    const o = t / n, c = o >= 1 ? 2 : 2 * o, l = o >= 1 ? 2 / o : 2;
    r = new S.PlaneGeometry(c, l), a = new S.MeshBasicMaterial({ map: i, side: S.DoubleSide });
    const h = new S.Mesh(r, a), f = new S.Group();
    return f.add(h), { group: f, objectUrl: s };
  } catch (o) {
    throw r?.dispose(), a?.dispose(), i?.dispose(), s && URL.revokeObjectURL(s), o;
  }
}
class Yn {
  /**
   * @param {HTMLElement} container - DOM element to render into. The effect canvas is appended as a child.
   * @param {object} [effectOptions] - Initial BitmapEffect options (pixelSize, ditherType, colors, backgroundColor, etc.)
   */
  constructor(e, t = {}) {
    this.container = e, this.scene = new S.Scene(), this.camera = new S.PerspectiveCamera(75, 1, 0.1, 1e3), this.camera.position.set(0, 0.5, 5), this.camera.lookAt(0, 0, 0), this.renderer = new S.WebGLRenderer({ antialias: !0, alpha: !0, preserveDrawingBuffer: !0 }), this.renderer.setClearColor(0, 0), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), this.effect = new xs(this.renderer, t), this.container.appendChild(this.effect.domElement), t.backgroundColor && t.backgroundColor !== "transparent" && (this.scene.background = new S.Color(t.backgroundColor)), this.ambientLight = new S.AmbientLight(16777215, 0.15), this.keyLight = new S.DirectionalLight(16777215, 1.5), this.fillLight = new S.DirectionalLight(16777215, 0.4), this.rimLight = new S.DirectionalLight(16777215, 0.8), this.keyLight.position.set(3, 4, 5), this.fillLight.position.set(-4, 2, 3), this.rimLight.position.set(0, 2, -5), this.scene.add(this.ambientLight, this.keyLight, this.fillLight, this.rimLight), this.baseGroup = new S.Group(), this.animGroup = new S.Group(), this.baseGroup.add(this.animGroup), this.scene.add(this.baseGroup), this.animationEngine = new Tn(), this.effect.onVariantChange = () => {
      this._disposed || this.animationEngine.onExternalFadeRestart(this.animGroup);
    }, this._disposed = !1, this._loadGeneration = 0, this._loading = !1, this._source = null, this.objectGroup = null, this.currentObjectUrl = null, this.lastFrameTime = performance.now(), this._onFrameRendered = null, this._animationLoop = () => {
      if (this._disposed) return;
      const n = performance.now(), s = Math.max(0, Math.min((n - this.lastFrameTime) / 1e3, 0.25));
      this.lastFrameTime = n, this.hasObject() && this.animationEngine.update(this.animGroup, this.effect, s, this.camera), this.effect.render(this.scene, this.camera), this._onFrameRendered?.();
    }, this.renderer.setAnimationLoop(this._animationLoop), this._onContextLost = (n) => {
      this._disposed || (n.preventDefault(), this.renderer.setAnimationLoop(null));
    }, this._onContextRestored = () => {
      this._disposed || this.renderer.setAnimationLoop(this._animationLoop);
    }, this.renderer.domElement.addEventListener("webglcontextlost", this._onContextLost), this.renderer.domElement.addEventListener("webglcontextrestored", this._onContextRestored);
  }
  hasObject() {
    return this.objectGroup !== null;
  }
  // Loaders prepare unattached resources. Only the latest live request may publish.
  // No abort API exists for the Three.js decoders/font imports; stale completions
  // must still be collected and released, including after this manager is gone.
  async _loadSource(e, t) {
    if (this._disposed) return;
    const n = ++this._loadGeneration;
    this._loading = !0;
    try {
      const s = await e(), i = qe(s.group ?? s, s.objectUrl ?? null, { type: t });
      this._commitSource(i, n);
    } finally {
      n === this._loadGeneration && !this._disposed && (this._loading = !1);
    }
  }
  _commitSource(e, t) {
    if (this._disposed || t !== this._loadGeneration) {
      e.dispose();
      return;
    }
    const n = this.animGroup.rotation.clone();
    try {
      this.animGroup.add(e.group), this.animGroup.rotation.set(0, 0, 0), this.effect.startAnimation("fadeIn");
    } catch (s) {
      throw this.animGroup.remove(e.group), this.animGroup.rotation.copy(n), e.dispose(), s;
    }
    this._releaseSource(), this._source = e, this.objectGroup = e.group, this.currentObjectUrl = e.objectUrl;
  }
  async loadModel(e) {
    return this._loadSource(() => un(e), "model");
  }
  loadShape(e, t = {}) {
    if (this._disposed) return;
    const n = ++this._loadGeneration;
    this._loading = !1, this._commitSource(qe(On(e, t), null, { type: "shape" }), n);
  }
  async loadText(e, t = {}) {
    return this._loadSource(() => Vn(e, t), "text");
  }
  async loadImage(e) {
    return this._loadSource(() => Kn(e), "image");
  }
  _releaseSource() {
    this.objectGroup && this.animGroup.remove(this.objectGroup), this._source?.dispose(), this._source = null, this.objectGroup = null, this.currentObjectUrl = null;
  }
  disposeModel() {
    ++this._loadGeneration, this._loading = !1, this._releaseSource();
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
    if (this._disposed) return;
    const n = Math.max(1, Math.floor(e)), s = Math.max(1, Math.floor(t));
    this.camera.aspect = n / s, this.camera.updateProjectionMatrix(), this.effect.setSize(n, s);
  }
  /**
   * Update bitmap rendering options.
   * @param {object} options
   */
  updateEffectOptions(e) {
    this._disposed || (this.effect.updateOptions(e), e.backgroundColor && e.backgroundColor !== "transparent" ? this.scene.background = new S.Color(e.backgroundColor) : e.backgroundColor === "transparent" && (this.scene.background = null));
  }
  /**
   * Update animation behavior.
   * @param {object} options
   */
  updateAnimationOptions(e) {
    this._disposed || this.animationEngine.setFadeOptions({
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
    this._disposed || this.keyLight.position.set(e, t, n);
  }
  /**
   * Apply a base rotation offset to the model pose. Animation plays on top of this.
   */
  setBaseRotation(e, t, n) {
    this._disposed || this.baseGroup.rotation.set(e, t, n);
  }
  /**
   * Uniformly scale the entire model group. Useful when imported models are too
   * small or too large relative to the camera frustum.
   * @param {number} scale - Uniform scale factor (e.g. 0.5 = half size, 2 = double)
   */
  setModelScale(e) {
    this._disposed || this.baseGroup.scale.setScalar(e);
  }
  /**
   * Uniformly scale the image plane. Kept separate from setModelScale so model
   * and image scales don't bleed into each other when switching input tabs.
   * @param {number} scale - Uniform scale factor (e.g. 0.5 = half size, 2 = double)
   */
  setImageScale(e) {
    this._disposed || this.baseGroup.scale.setScalar(e);
  }
  /**
   * Swap the rendering mode.
   * @param {string} mode
   */
  setRenderMode(e) {
    if (this._disposed) return;
    const t = Pn(e, this.effect.options);
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
    this._disposed || this.renderer.setAnimationLoop(null);
  }
  /** Resume the live animation loop. */
  resumeLoop() {
    this._disposed || (this.lastFrameTime = performance.now(), this.renderer.setAnimationLoop(this._animationLoop));
  }
  /** Render a single frame without advancing animation time. */
  renderOnce() {
    this._disposed || this.effect.render(this.scene, this.camera);
  }
  /**
   * Seek the animation to a specific time and render one frame.
   * @param {number} absoluteTimeMs
   */
  renderAtTime(e) {
    this._disposed || (this.animationEngine.seekTo(e, this.animGroup, this.effect, this.camera), this.renderOnce());
  }
  /**
   * Register a callback invoked once per animation frame.
   * @param {(() => void) | null} callback
   */
  setOnFrameRendered(e) {
    this._disposed || (this._onFrameRendered = e);
  }
  /** Remove the frame-rendered callback. */
  clearOnFrameRendered() {
    this._onFrameRendered = null;
  }
  /**
   * Reset animation to t=0 and render the first frame.
   */
  resetToLoopStart() {
    this._disposed || (this.animationEngine.resetToStart(), this.hasObject() && this.animGroup.rotation.set(0, 0, 0), this.camera.position.set(0, 0.5, 5), this.camera.lookAt(0, 0, 0), this.animationEngine.useFadeInOut ? this.effect.startAnimation("fadeIn") : this.effect.startAnimation("show"), this.renderOnce());
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
    this._disposed || (this._disposed = !0, this.renderer.setAnimationLoop(null), this._onFrameRendered = null, this.renderer.domElement.removeEventListener("webglcontextlost", this._onContextLost), this.renderer.domElement.removeEventListener("webglcontextrestored", this._onContextRestored), this.disposeModel(), this.effect.dispose(), this.renderer.dispose(), this.effect.domElement.parentNode && this.effect.domElement.parentNode.removeChild(this.effect.domElement));
  }
}
function Wn(u) {
  const e = typeof u == "string" ? JSON.parse(u) : u;
  if (!e || typeof e != "object") throw new Error("Invalid .bforge file");
  if (!e.version) throw new Error("Missing version field in .bforge file");
  const t = e.version === 1 ? $n(e) : e;
  return {
    settings: t.settings ?? {},
    modelData: t.model ?? null,
    // { name, type, format, data: base64 } | null
    inputType: t.settings?.inputType ?? "model",
    version: t.version
  };
}
function $n(u) {
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
const qn = ["src", "autoplay", "loop", "width", "height", "render-mode"];
class Zn extends HTMLElement {
  static get observedAttributes() {
    return qn;
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
        const n = await t.text(), { settings: s, modelData: i, inputType: r } = Wn(n), a = this._container.clientWidth || 400, o = this._container.clientHeight || 400;
        if (this._manager = new Yn(this._container, { ...s }), this._manager.setSize(a * devicePixelRatio, o * devicePixelRatio), r === "model" && i) {
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
function Jn(u = "bitmap-forge") {
  typeof customElements > "u" || customElements.get(u) || customElements.define(u, Zn);
}
typeof customElements < "u" && Jn();
export {
  Zn as BitmapForgeElement,
  Jn as defineBitmapForgeElement
};
