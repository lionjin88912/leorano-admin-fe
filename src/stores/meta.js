import { defineStore } from 'pinia'
import {
  RequestCityCodeList,
  RequestCountryCodeList,
  RequestTagTypeList,
  RequestTagList,
  getMembershipList,
  getExchangeRate
} from 'src/api'
import { LocalStorage, SessionStorage } from 'quasar'
import to from 'await-to-js'
// const DATA_LIFETIME = 30 * 60 * 1000 // 30mins

export const useMetaStore = defineStore('meta', {
  state: () => {
    return {
      cityCode: LocalStorage.getItem('cityCode'),
      countryCode: LocalStorage.getItem('countryCode'),
      tagTypes: [],
      tags: [],
      memberships: [], // 會籍類型清單
      exchangeRate: SessionStorage.getItem('exchange-rate') || {} // key = from+to, value = rate, ex: { USDTWD: 31.95 }
    }
  },
  getters: {},
  actions: {
    async getExchangeRate(fromCurrency, targetCurrency) {
      const key = `${fromCurrency}${targetCurrency}`
      // console.log('exchangeRate:', this.exchangeRate)
      if (!this.exchangeRate || !this.exchangeRate[key]) {
        const [err, res] = await to(getExchangeRate(fromCurrency, targetCurrency))
        if (err) {
          console.error('getExchangeRate error:', err)
          return null
        }
        const rate = res.data.data.exchangeRate
        this.setExchangeRate(fromCurrency, targetCurrency, rate)
      }
      return this.exchangeRate[key]
    },
    async getTagTypeList(name) {
      // cache造成新增時未reload新資料，先移除，之後再想解法
      // if (!name && this.tagTypes && this.tagTypes.length > 0) {
      //   return this.tagTypes
      // }

      const [err, res] = await to(RequestTagTypeList({ name }))
      if (err) {
        console.error('getTagTypeList error:', err)
        return []
      }
      this.setTagTypeList(res.data)
      return res.data
    },
    async getTagList(name, typeId) {
      // cache造成新增時未reload新資料，先移除，之後再想解法
      // if (!name && !typeId && this.tags && this.tags.length > 0) {
      //   return this.tags
      // }

      const [err, res] = await to(
        RequestTagList({
          name: name,
          tag_type_id: typeId
        })
      )
      if (err) {
        console.error('getTagList error:', err)
        return []
      }
      this.setTagList(res.data)
      return res.data
    },
    async getMembershipList() {
      // FIXME: demo data
      // this.memberships = [
      //   { label: 'Club', value: 2 },
      //   { label: 'Silver', value: 'Silver' },
      //   { label: 'Gold', value: 'Gold' },
      //   { label: 'Platinum', value: 'Platinum' },
      //   { label: 'Diamond', value: 'Diamond' },
      //   { label: 'Former', value: 'Former' }
      // ]
      if (this.memberships && this.memberships.length > 0) {
        return this.memberships
      }

      const [err, res] = await to(
        getMembershipList({
          orderBy: 'sort',
          sort: 'asc'
        })
      )
      if (err) {
        console.error('getMembershipList error:', err)
        return []
      }
      this.setMembershipList(res.data)
      return res.data
    },
    async requestCityCodeMeta() {
      const [err, res] = await to(RequestCityCodeList())
      if (err || (res.data || []).length <= 0) {
        this.setRequestStatus = false
        throw error || new Error('Network Error')
      }
      this.setCityCode(res.data)
      return res.data
    },
    async requestCountryCodeMeta() {
      const [err, res] = await to(RequestCountryCodeList())
      if (err || (res.data || []).length <= 0) {
        this.setRequestStatus = false
        throw error || new Error('Network Error')
      }
      this.setCountryCode(res.data)
      return res.data
    },
    setCityCode(val) {
      LocalStorage.set('cityCode', val)
      this.cityCode = val
    },
    setCountryCode(val) {
      LocalStorage.set('countryCode', val)
      this.countryCode = val
    },
    setTagTypeList(datas) {
      this.tagTypes = datas
    },
    setTagList(datas) {
      this.tags = datas
    },
    setMembershipList(datas) {
      this.memberships = datas
    },
    setExchangeRate(from, to, rate) {
      const key = `${from}${to}`
      this.exchangeRate[key] = rate
      SessionStorage.set('exchange-rate', this.exchangeRate)
    }
  }
})

// function isDataExpired(dataKey) {
//   const data = LocalStorage.getItem(dataKey)
//   const currentTime = new Date().getTime()
//   if (!data || data.list.length <= 0 || currentTime - data.timestamp > DATA_LIFETIME) {
//     return true
//   }
//   return false
// }
