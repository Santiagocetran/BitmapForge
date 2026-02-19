import './style.css'
import { startModelAnimation } from './index.js'

// Demo: Start animation with transparent background
// In production, you can customize the effect options
const controller = startModelAnimation({
  container: document.body,
  modelUrl: '/sai-prueba-pagina.stl',
  effectOptions: {
    // Transparent background allows overlay on websites
    backgroundColor: 'transparent',
    // You can customize other options here:
    // pixelSize: 3,
    // colors: ['#021a15', '#053a2a', '#074434', '#0a5845', '#1a7a5e', '#4d9977', '#ABC685', '#E8FF99', '#F7F9CE', '#FFF6E7'],
  }
})

window.addEventListener('resize', () => {
  controller.resize()
})
