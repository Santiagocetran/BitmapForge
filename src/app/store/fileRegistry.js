/**
 * Module-level registry for File objects indexed by layer id.
 * Files are not part of Zustand state (not serializable) and are deliberately
 * excluded from undo/redo history. The registry persists across undo operations —
 * if undo restores a previously removed layer, the file is still retrievable.
 *
 * Tests should call resetFileRegistry() in beforeEach to avoid cross-test pollution.
 */

const _registry = new Map()

/** @param {string} id @param {File} file */
export function registerFile(id, file) {
  _registry.set(id, file)
}

/** @param {string} id @returns {File | undefined} */
export function getFile(id) {
  return _registry.get(id)
}

/** @param {string} id */
export function deleteFile(id) {
  _registry.delete(id)
}

/** Remove all entries. Call in tests' beforeEach and on HMR dispose. */
export function resetFileRegistry() {
  _registry.clear()
}

export const fileRegistry = _registry
