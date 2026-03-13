import { BitmapForgeElement, defineBitmapForgeElement } from './BitmapForgeElement.js'
export { BitmapForgeElement, defineBitmapForgeElement }

// Auto-register in browser environments only
if (typeof customElements !== 'undefined') {
  defineBitmapForgeElement()
}
