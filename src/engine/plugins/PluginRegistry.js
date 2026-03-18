/**
 * PluginRegistry — singleton that holds all registered renderer and post-effect plugins.
 *
 * Built-in renderers and effects are registered via builtinPlugins.js on app startup.
 * Third-party plugins can call registerRenderer() / registerPostEffect() at any time
 * before the engine instantiates (ideally before the first SceneManager is created).
 *
 * Schema format: plain JSON Schema subset — each property may have:
 *   { type: 'integer'|'number'|'boolean'|'string', title, minimum, maximum, enum, default }
 *
 * exporters/importers: intentionally omitted — no use case yet; roadmap item for v2.
 */
class PluginRegistry {
  constructor() {
    /** @type {Map<string, { RendererClass: Function, schema: object, label: string }>} */
    this._renderers = new Map()
    /** @type {Map<string, { EffectClass: Function, schema: object, label: string }>} */
    this._postEffects = new Map()
    /** @type {boolean} */
    this._registered = false
  }

  /**
   * Register a renderer plugin.
   * @param {string} id - unique mode key (e.g. 'bitmap', 'myCustomRenderer')
   * @param {Function} RendererClass - constructor that extends BaseRenderer
   * @param {{ label?: string, schema?: object }} [options]
   * @throws {Error} if id is already registered
   */
  registerRenderer(id, RendererClass, { label, schema = {} } = {}) {
    if (this._renderers.has(id)) throw new Error(`Renderer "${id}" already registered`)
    this._renderers.set(id, { RendererClass, schema, label: label ?? id })
  }

  /**
   * Register a post-processing effect plugin.
   * @param {string} id - unique effect key (e.g. 'bloom', 'myEffect')
   * @param {Function} EffectClass - class with apply(ctx, width, height, params)
   * @param {{ label?: string, schema?: object }} [options]
   * @throws {Error} if id is already registered
   */
  registerPostEffect(id, EffectClass, { label, schema = {} } = {}) {
    if (this._postEffects.has(id)) throw new Error(`PostEffect "${id}" already registered`)
    this._postEffects.set(id, { EffectClass, schema, label: label ?? id })
  }

  /**
   * Look up a renderer registration by id.
   * @param {string} id
   * @returns {{ RendererClass: Function, schema: object, label: string } | undefined}
   */
  getRenderer(id) {
    return this._renderers.get(id)
  }

  /**
   * Look up a post-effect registration by id.
   * @param {string} id
   * @returns {{ EffectClass: Function, schema: object, label: string } | undefined}
   */
  getPostEffect(id) {
    return this._postEffects.get(id)
  }

  /**
   * List all registered renderers.
   * @returns {Array<{ id: string, label: string, schema: object }>}
   */
  listRenderers() {
    return [...this._renderers.entries()].map(([id, r]) => ({ id, label: r.label, schema: r.schema }))
  }

  /**
   * List all registered post-effects.
   * @returns {Array<{ id: string, label: string, schema: object }>}
   */
  listPostEffects() {
    return [...this._postEffects.entries()].map(([id, e]) => ({ id, label: e.label, schema: e.schema }))
  }
}

/** Module-level singleton — import this everywhere you need the registry. */
const pluginRegistry = new PluginRegistry()

export { PluginRegistry, pluginRegistry }
