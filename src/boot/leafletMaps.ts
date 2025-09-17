import { boot } from 'quasar/wrappers'
import 'leaflet/dist/leaflet.css'

export default boot(() => {
  // 修復 Leaflet 與 Quasar 的 CSS 衝突
  const style = document.createElement('style')
  style.textContent = `
    .leaflet-container {
      font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
    }
    
    /* 確保 Leaflet 瓦片正確顯示 */
    .leaflet-tile-pane {
      z-index: 200;
    }
    
    .leaflet-tile {
      visibility: visible !important;
      opacity: 1 !important;
    }
    
    /* 修復可能的 z-index 問題 */
    .leaflet-map-pane {
      z-index: auto;
    }
  `
  document.head.appendChild(style)
  
  console.log('Leaflet CSS fixes applied')
})
