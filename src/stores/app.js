import { defineStore } from 'pinia'
import { RequestLogin } from '../api'
import { LocalStorage } from 'quasar'
import to from 'await-to-js'

export const useAppStore = defineStore('app-store', {
  state: () => {
    return {
      token: localStorage.getItem('token') || '',
      user: { id: '', username: '', status: '', email: '' },
      permissions: {},
      api_response: {
        method: '',
        code: '',
        message: ''
      }
    }
  },
  actions: {
    async login(data) {
      const [err, res] = await to(RequestLogin(data))
      const { token, profile, permissions } = res.data

      this.token = token
      this.user = profile
      this.permissions = permissions

      LocalStorage.set('token', JSON.stringify(token))
      LocalStorage.set('profile', JSON.stringify(profile))
      LocalStorage.set('permissions', permissions)
    },
    catchApi(data) {
      const { code, message, method } = data

      this.api_response.code = code
      this.api_response.message = message
      if (method !== undefined) {
        this.api_response.method = method
      }
    }
  }
})
