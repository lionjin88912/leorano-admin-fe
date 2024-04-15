import { boot } from 'quasar/wrappers'
import GoogleMap from '@fawmi/vue-google-maps'
export default boot(({ app }) => {
  app.use(GoogleMap, {
    load: {
      // version: '3.54',
      v: '3.54',
      key: 'AIzaSyCkbldNUJ9kFFzQQWm-fVibY2qP7iFVUek',
      libraries: 'places', // necessary for places input
    },
  })
})
