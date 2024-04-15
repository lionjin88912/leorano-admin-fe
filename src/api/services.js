import axios from 'axios'
import { useAppStore } from 'src/stores/app'
import { LocalStorage } from 'quasar'

// console.log('VUE_API_URL:', process.env.VUE_API_URL)
let conf = {
  baseURL: process.env.VUE_API_URL,
  timeout: 60 * 1000,
  headers: {
    'Content-type': 'application/json'
    // Authorization: 'Bearer '
  }
}

const baseService = axios.create(conf)

baseService.interceptors.request.use(
  (config) => {
    const appStore = useAppStore()

    if (!config.headers.Authorization) {
      try {
        config.headers.Authorization = `Bearer ${
          JSON.parse(LocalStorage.getItem('token') || '{}').access_token
        }`
      } catch {}
    }
    appStore.catchApi({ method: config.method })
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

baseService.interceptors.response.use(
  (response) => {
    const appStore = useAppStore()

    const resp = response.data
    appStore.catchApi(resp)
    return resp
  },
  (error) => {
    const appStore = useAppStore()
    appStore.catchApi({ code: error.response.status, message: error.response.data.error })
    return Promise.reject(error.response)
  }
)

export { axios, baseService }
