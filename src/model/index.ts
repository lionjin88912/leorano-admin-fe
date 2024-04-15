export type { MarketingNotify } from './MarketingNotify'
export type { HotelBrand } from './HotelBrand'

export enum ModelKeys {
  HotelBrand = 'HotelBrand',
}

const models: any = {
  HotelBrand: {
    name: '',
    hotel_chain: '',
    hotel_group_id: '',
    hotel_group_name: '',
    is_enabled: true,
  },
}

export const createNewModel = (key: ModelKeys) => {
  const model = Object.assign({}, models[key])
  // console.log('createNewModel key:', key, ', model:', model);
  return model
}
