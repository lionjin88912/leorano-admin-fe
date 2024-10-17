import { axios, baseService } from './services.js'

export const RequestLogin = (data) => baseService.post('/auth/login', data)
export const RequestHotelList = (data) => baseService.get('/hotel', { params: data })
export const RequestHotelByID = (id) => baseService.get(`/hotel/${id}`)
export const RequestUpdateHotel = (id, data) => baseService.patch(`/hotel/${id}`, data)
export const BatchUpdateHotelStatus = (data) =>
  baseService.patch(`/hotel/batchUpdate/isEnable`, data)

export const RequestCreateHotel = (data) => baseService.post('/hotel', data)

export const RequestGroupByName = (data) => baseService.get('/hotel/group', { params: data })
export const RequestCreateGroup = (data) => baseService.post('/hotel/group', data)
export const RequestCreateBrand = ({ data }) => baseService.post('/hotel/brand', data)
export const RequestUpdateBrand = ({ id, data }) => baseService.patch(`/hotel/brand/${id}`, data)
export const RequestUpdateGroup = (id, data) => baseService.patch(`/hotel/group/${id}`, data)

export const RequestUpdateLangStatus = (hotelId, langId) =>
  baseService.patch(`/hotel/${hotelId}/lang/${langId}`)

export const RequestBrandByName = (data) => baseService.get('/hotel/brand', { params: data })

// export const RequestTPHotel = (data) => baseService.get('/travelport/hotel', { params: data })

// 標籤管理
export const RequestTagTypeList = (data) => baseService.get('/tag/type', { params: data })
export const CreateTagType = (data) => baseService.post('/tag/type', data)
export const UpdateTagType = (id, data) => baseService.patch(`/tag/type/${id}`, data)
export const RequestTagList = (data) => baseService.get('/tag', { params: data })
export const GetTagById = (id) => baseService.get(`/tag/${id}`)
export const CreateTag = (data) => baseService.post('/tag', data)
export const UpdateTag = (id, data) => baseService.patch(`/tag/${id}`, data)
export const UpdateTagLang = (id, locale, data) =>
  baseService.post(`/tag/${id}/lang/${locale}`, data)
export const getTagRelations = (id) => baseService.get(`/tag/${id}/relations`)
export const deleteTag = (id) => baseService.delete(`/tag/${id}`)
// 酒店-房型
export const GetHotelRoomList = (params) => baseService.get(`/hotel/room`, { params: params })
export const GetHotelRoom = (id) => baseService.get(`/hotel/room/${id}`)
export const CreateHotelRoom = (data) => baseService.post('/hotel/room', data)
export const UpdateHotelRoom = (id, data) => baseService.patch(`/hotel/room/${id}`, data)
export const DeleteHotelRoom = (id) => baseService.delete(`/hotel/room/${id}`)
export const BatchDeleteHotelRoom = (data) =>
  baseService.delete('/hotel/room/batchDelete', { data })
export const UpdateHotelRoomLang = (id, locale, data) =>
  baseService.post(`/hotel/room/${id}/lang/${locale}`, data)
// 酒店-房價
export const GetHotelRateList = (params) => baseService.get(`/hotel/rate`, { params: params })
export const GetHotelRate = (id) => baseService.get(`/hotel/rate/${id}`)
export const CreateHotelRate = (data) => baseService.post('/hotel/rate', data)
export const UpdateHotelRate = (id, data) => baseService.patch(`/hotel/rate/${id}`, data)
export const DeleteHotelRate = (id) => baseService.delete(`/hotel/rate/${id}`)
export const BatchDeleteHotelRate = (data) =>
  baseService.delete('/hotel/rate/batchDelete', { data })
export const UpdateHotelRateLang = (id, locale, data) =>
  baseService.post(`/hotel/rate/${id}/lang/${locale}`, data)
// 酒店-方案
export const GetHotelPlanList = (params) => baseService.get(`/hotel/plan`, { params: params })
export const GetHotelPlan = (id) => baseService.get(`/hotel/plan/${id}`)
export const UpdateHotelPlan = (id, data) => baseService.patch(`/hotel/plan/${id}`, data)
export const BatchUpdateHotelPlanStatus = (data) =>
  baseService.patch(`/hotel/plan/batchUpdate/isEnable`, data)
// 國家/城市資料
export const RequestCountryCodeList = (data) => baseService.get('/meta/country', { params: data })
export const RequestCityCodeList = (data) => baseService.get('/meta/city', { params: data })
export const RequestCountry = (id) => baseService.get(`/meta/country/${id}`)
export const CreateCountry = (data) => baseService.post('/meta/country', data)
export const UpdateCountry = (id, data) => baseService.patch(`/meta/country/${id}`, data)
export const DeleteCountry = (id) => baseService.delete(`/meta/country/${id}`)
export const RequestCity = (id) => baseService.get(`/meta/city/${id}`)
export const CreateCity = (data) => baseService.post('/meta/city', data)
export const UpdateCity = (id, data) => baseService.patch(`/meta/city/${id}`, data)
export const DeleteCity = (id) => baseService.delete(`/meta/city/${id}`)

export const RequestHotelMedia = (id, data) =>
  baseService.get(`/hotel/${id}/media`, { params: data })

export const RequestRegisterRecords = (data) =>
  baseService.get(`/registerRecord/list`, { params: data })
export const RequestRegisterRecordAction = (id, action, data) =>
  baseService.patch(`/registerRecord/${id}/${action}`, data)
export const RequestUsers = (data) => baseService.get(`/users/list`, { params: data })

export const RequestRegisterRecord = (id) => baseService.get(`/registerRecord/${id}`)

export const RequestUser = (id) => baseService.get(`/users/${id}`)
export const CreateUser = (data) => baseService.post('/users/create', data)

export const GetLoyalty = () => baseService.get(`/hotel/group/hasLoyalty`)

export const SaveUserProfile = (id, data) => baseService.patch(`/users/${id}`, data)

export const SaveRegisterRecord = (id, data) => baseService.patch(`/registerRecord/${id}`, data)

// 訂單管理-酒店訂單
export const getHotelOrderList = (data) => baseService.get('/order/bookings', { params: data })
export const getHotelOrder = (orderNumber) => baseService.get(`/order/bookings/${orderNumber}`)
export const cancelHotelOrder = (orderNumber, data) =>
  baseService.delete(`/order/bookings/${orderNumber}/cancel`, { data })
export const updateHotelOrderUser = (id, data) => baseService.put(`/order/hotel/changeUser/${id}`, data)
export const updateHotelOrderProfit = (id, data) => baseService.put(`/order/hotel/profit/${id}`, data)
export const updateHotelOrderFinalProfit = (data) => baseService.put(`/order/hotel/final_profit`, data)
// 訂單管理-客製訂單
export const getCustomizedOrderList = (data) => baseService.get('/order/customized/list', { params: data })
export const getCustomizedOrderVoucher = (id) => baseService.get(`/order/customized/voucher/${id}`)
export const deleteCustomizedOrder = (id, data) => baseService.delete(`/order/customized/${id}`, { data })
export const getCustomizedOrder = (id) => baseService.get(`/order/customized/${id}`)
export const createCustomizedOrder = (data) => baseService.post(`/order/customized`, data)
export const updateCustomizedOrder = (id, data) => baseService.put(`/order/customized/${id}`, data)
export const getMemberList = (data) => baseService.get('/users/search', { params: data })
export const getMember = (id) => baseService.get(`/member/${id}`)
export const updateCustomizedOrderFinalProfit = (data) => baseService.put(`/order/customized/final_profit`, data)
// 訂單管理-酒店訂單
export const getMemberOrderList = (data) => baseService.get('/order/membership', { params: data })
export const getMemberOrder = (orderNumber) => baseService.get(`/order/membership/${orderNumber}`)
export const cancelMemberOrder = (orderNumber, data) =>
  baseService.delete(`/order/membership/${orderNumber}/cancel`, { data })
export const refundMemberOrder = (orderNumber, data) =>
  baseService.delete(`/order/membership/${orderNumber}/refund`, { data })
// 訂單對帳管理
export const getAccountingList = ({type, ...data}) => baseService.get(`/accounting/${type}`, { params: data })
// 行銷碼管理
// 會籍活動
export const getPromoMembershipList = (params) =>
  baseService.get('/promo/membership/list', { params })
export const getPromoMembership = (id) => baseService.get(`/promo/membership/${id}`)
export const createPromoMembership = (data) => baseService.post('/promo/membership', data)
export const updatePromoMembership = (id, data) =>
  baseService.patch(`/promo/membership/${id}`, data)
export const deletePromoMembership = (id) => baseService.delete(`/promo/membership/${id}`)
export const batchUpdatePromoMembershipStatus = (data) =>
  baseService.patch(`/promo/membership/batchUpdate`, data)
// 會籍活動-行銷碼
export const getPromoMembershipCodeList = (params) =>
  baseService.get(`/promo/membership/${params.promoMembershipId}/codes`, { params })
// 會籍資料清單
export const getMembershipList = (params) => baseService.get('/membership/list', { params })
// 推播管理
// 行銷通知列表
export const getMarketingNotifyList = (params) =>
  baseService.get('/notification/marketing/list', { params })
export const getMarketingNotify = (id) => baseService.get(`/notification/marketing/${id}`)
export const createMarketingNotify = (data) => baseService.post('/notification/marketing', data)
export const updateMarketingNotify = (id, data) =>
  baseService.patch(`/notification/marketing/${id}`, data)
export const deleteMarketingNotify = (id) => baseService.delete(`/notification/marketing/${id}`)
export const batchUpdateMarketingNotifyStatus = (data) =>
  baseService.patch(`/notification/marketing/batchUpdate`, data)
// 取匯率
export const getExchangeRate = (from, to) =>
  axios.post('https://dev-api-demo.wotaluxe.com/v1/exchange/convert', {
    amount: 1,
    from,
    to
  })
export const RequestDownloadFile = (id, data, cfg) =>
  baseService.get(`/user/${id}/download/${data.fileName}`, cfg)

export const RequestUploadImage = (id, data) => {
  let formData = new FormData()

  data['files'].forEach((image) => {
    formData.append('files[]', image)
  })

  return baseService.post(`/hotel/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
export const deleteHotelMedia = (id, data) => baseService.delete(`/hotel/${id}/medias`, { data })

export const RequestUploadUserFile = (id, data) => {
  let formData = new FormData()

  data['files'].forEach((file) => {
    formData.append('files[]', file)
  })

  return baseService.post(`/user/${id}/files`, formData, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// export const RequestGetGEO= (id) => baseService.get(`/meta/city/${id}`)

/**
 * 呼叫 Elastic Search 重建快取服務
 */
export const RequestEsRefresh = () => {
  return axios.get('https://app.roartrips.com/reload')
}
