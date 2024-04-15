/* eslint-disable  @typescript-eslint/no-explicit-any */

const localeOptions = [
  {
    label: 'English',
    value: 'en',
  },
  {
    label: '繁中',
    value: 'zh-TW',
  },
  {
    label: '简中',
    value: 'zh-CN',
  },
]

const EditMode = {
  New: 'new',
  Edit: 'edit',
}

type Menu = {
  label: string
  module: string
  to: string
  children: MenuItem[]
  isExpand?: boolean
}
type MenuItem = {
  label: string
  to: string
}

const menus: Menu[] = [
  {
    label: '會員管理',
    module: 'member',
    to: 'members',
    children: [
      { label: '會員列表', to: '/members/list' },
      { label: '待審核列表', to: '/members/apply' },
      { label: '未完成付款', to: '/members/incomplete-payment' },
    ],
  },
  {
    label: '酒店資料管理',
    module: 'hotel',
    to: 'hotels',
    children: [
      { label: '酒店集團列表', to: '/hotels/groups' },
      { label: '酒店品牌列表', to: '/hotels/brands' },
      { label: '酒店列表', to: '/hotels/list' },
      // { label: '酒店禮遇列表', to: '/hotels/benefits' },
    ],
  },
  {
    label: '訂單管理',
    module: 'order',
    to: 'orders',
    children: [
      { label: '酒店訂單', to: '/orders/hotel' },
      { label: '會籍訂單', to: '/orders/member' },
    ],
  },
  {
    label: '行銷碼管理',
    module: 'promotion',
    to: 'promotions',
    children: [{ label: '會籍活動列表', to: '/promotions/membership' }],
  },
  {
    label: '推播管理',
    module: 'notification',
    to: 'notifications',
    children: [{ label: '行銷通知列表', to: '/notifications/marketing' }],
  },
  {
    label: '基礎數據維護',
    module: 'setting',
    to: 'settings',
    children: [
      { label: '標籤設定', to: '/settings/tag' },
      { label: '國家城市設定', to: '/settings/country-region' },
    ],
  },
]

export const TagType = {
  Amenity: { value: 2, label: 'Room Amenity' },
  Bed: { value: 3, label: 'Bedding Type' },
  View: { value: 10, label: 'Hotel Room View Type' },
}

export { EditMode, localeOptions, menus, Menu, MenuItem }
