<template>
  <div class="leaflet-map-container">
    <div ref="mapContainer" :style="{ height: height, width: '100%' }"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, defineEmits, defineProps, nextTick } from 'vue'
import L from 'leaflet'

// 修復 Leaflet 圖標問題 - 使用 CDN 路徑作為備選
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png'
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png'
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'

// 配置 Leaflet 默認圖標
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
})

const props = defineProps({
  center: {
    type: Object,
    default: () => ({ lat: 25.0330, lng: 121.5654 }) // 台北101
  },
  zoom: {
    type: Number,
    default: 16
  },
  height: {
    type: String,
    default: '400px'
  },
  markers: {
    type: Array,
    default: () => []
  },
  draggableMarker: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'marker-dragged', 'marker-click'])

const mapContainer = ref(null)
const map = ref(null)
const markerInstances = ref([])

const initMap = async () => {
  if (!mapContainer.value) {
    console.error('Map container not found')
    return
  }

  console.log('Initializing Leaflet map...')
  console.log('Container:', mapContainer.value)
  console.log('Center:', props.center)
  console.log('Zoom:', props.zoom)

  try {
    // 創建地圖
    map.value = L.map(mapContainer.value, {
      center: [props.center.lat, props.center.lng],
      zoom: props.zoom,
      zoomControl: true,
      attributionControl: true
    })

    console.log('Map created:', map.value)

    // 添加 OpenStreetMap 圖層
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    console.log('Adding tile layer...')
    tileLayer.addTo(map.value)

    // 監聽瓦片加載事件
    tileLayer.on('loading', () => {
      console.log('Tiles are loading...')
    })

    tileLayer.on('load', () => {
      console.log('Tiles loaded successfully')
    })

    // 監聽瓦片加載錯誤
    tileLayer.on('tileerror', (e) => {
      console.warn('Tile loading error:', e)
    })

    // 添加地圖點擊事件
    map.value.on('click', (e) => {
      console.log('Map clicked:', e.latlng)
      emit('click', {
        latLng: {
          lat: () => e.latlng.lat,
          lng: () => e.latlng.lng
        }
      })
    })

    // 添加標記
    updateMarkers()

    console.log('Leaflet map initialized successfully')
  } catch (error) {
    console.error('Error initializing Leaflet map:', error)
  }
}

const updateMarkers = () => {
  if (!map.value) return

  try {
    // 清除現有標記
    markerInstances.value.forEach(marker => {
      if (map.value && map.value.hasLayer(marker)) {
        map.value.removeLayer(marker)
      }
    })
    markerInstances.value = []

    // 添加新標記
    props.markers.forEach((markerData, index) => {
      if (!markerData.position || !markerData.position.lat || !markerData.position.lng) {
        console.warn('Invalid marker position:', markerData)
        return
      }

      const marker = L.marker([markerData.position.lat, markerData.position.lng], {
        draggable: props.draggableMarker
      }).addTo(map.value)

      if (markerData.title) {
        marker.bindPopup(markerData.title)
      }

      // 添加拖拽事件
      if (props.draggableMarker) {
        marker.on('dragend', (e) => {
          const position = e.target.getLatLng()
          emit('marker-dragged', {
            latLng: {
              lat: () => position.lat,
              lng: () => position.lng
            }
          })
        })
      }

      // 添加點擊事件
      marker.on('click', (e) => {
        const position = e.target.getLatLng()
        emit('marker-click', {
          latLng: {
            lat: () => position.lat,
            lng: () => position.lng
          }
        }, index)
      })

      markerInstances.value.push(marker)
    })
  } catch (error) {
    console.error('Error updating markers:', error)
  }
}

const updateCenter = () => {
  if (!map.value) return
  try {
    map.value.setView([props.center.lat, props.center.lng], props.zoom)
  } catch (error) {
    console.error('Error updating center:', error)
  }
}

// 暴露方法給父組件使用
defineExpose({
  $mapPromise: Promise.resolve(map),
  setCenter: (center) => {
    if (map.value) {
      map.value.setView([center.lat, center.lng])
    }
  }
})

watch(() => props.center, updateCenter, { deep: true })
watch(() => props.markers, updateMarkers, { deep: true })

onMounted(async () => {
  await nextTick()
  initMap()
})

onUnmounted(() => {
  if (map.value) {
    try {
      map.value.remove()
    } catch (error) {
      console.error('Error removing map:', error)
    }
  }
})
</script>

<style>
/* 重要：確保 Leaflet 地圖樣式正確 */
.leaflet-map-container {
  width: 100%;
  position: relative;
}

/* 確保 Leaflet 容器有正確的尺寸 */
.leaflet-map-container > div {
  height: 100% !important;
  width: 100% !important;
  z-index: 1;
}

/* 修復可能的 Leaflet CSS 問題 */
.leaflet-container {
  height: 100% !important;
  width: 100% !important;
  background: #ddd;
}

.leaflet-tile {
  filter: inherit;
  visibility: inherit;
}

/* 確保 Leaflet 控制項正確顯示 */
.leaflet-control-zoom {
  display: block !important;
}

.leaflet-control-attribution {
  display: block !important;
}
</style>