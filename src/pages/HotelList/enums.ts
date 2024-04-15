import { QTableProps } from 'quasar'
import { getDateString } from 'src/utils/helpers'

interface columnStruct {
  name: string
  label: string
  field?: string | ((row: { updated_at: string }) => string) | any
  align: 'center' | 'left' | 'right'
  sortable?: boolean
}
type tableColumn = columnStruct[]

const columns: tableColumn = [
  {
    name: 'name',
    label: '酒店名稱',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'HotelBrand__HotelGroup.name',
    align: 'left',
    label: '所屬集團',
    field: (row: any) => row.group_name || '獨立酒店',
    sortable: true,
  },
  {
    name: 'HotelBrand.name',
    label: '所屬品牌',
    align: 'left',
    field: 'brand_name',
    sortable: true,
  },
  {
    name: 'chain',
    label: 'TP Hotel Chain',
    field: 'hotel_chain',
    align: 'left',
  },
  {
    name: 'hotelCode',
    label: 'TP Hotel Code',
    field: 'hotel_code',
    align: 'left',
  },
  {
    name: 'country',
    label: '國家',
    field: 'country',
    align: 'left',
  },
  {
    name: 'city',
    label: '城市',
    field: 'city',
    align: 'left',
  },
  {
    name: 'updateAt',
    label: '更新時間',
    field: (row: { updated_at: string }) => getDateString(row.updated_at),
    align: 'center',
  },
  {
    name: 'operation',
    label: '操作',
    field: 'operation',
    align: 'center',
  },
  {
    name: 'status',
    label: '上架',
    field: 'is_enabled',
    align: 'center',
  },
]

const tabArr: {
  val: string | number | any
  text: string
}[] = [
  {
    text: '上架中',
    val: 1,
  },
  {
    text: '已下架',
    val: 0,
  },
  {
    text: '全部',
    val: 'all',
  },
]

const editTab: {
  val: string | number
  text: string
  color: 'orange' | 'cyan' | 'red' | 'primary'
  disable?: boolean
}[] = [
  {
    text: '基本資料',
    val: 'basic',
    color: 'primary',
  },
  {
    text: '入住規範',
    val: 'rule',
    color: 'primary',
  },
  // {
  //   text: '適用禮遇',
  //   val: 'benefits',
  //   color: 'primary',
  // },
  {
    text: '房型',
    val: 'room',
    color: 'primary',
  },
  {
    text: '房價',
    val: 'rate',
    color: 'primary',
  },
  {
    text: '方案',
    val: 'plan',
    color: 'primary',
  },
  {
    text: '媒體庫',
    val: 'media',
    color: 'primary',
  },
  {
    text: '語系管理',
    val: 'lang',
    color: 'primary',
  },
  {
    text: 'Raw Data',
    val: 'rawData',
    color: 'primary',
  },
]

const benefitColumns: tableColumn = [
  {
    name: 'name',
    label: '禮遇名稱',
    field: 'name',
    align: 'center',
  },
  {
    name: 'content',
    label: '禮遇內容',
    field: 'content',
    align: 'center',
  },
  {
    name: 'level',
    label: '適用會員等級',
    field: 'level',
    align: 'center',
  },
  {
    name: 'point',
    label: '消費抵用金',
    field: 'point',
    align: 'center',
  },
  {
    name: 'canUseMore',
    label: '可使用多個禮遇',
    field: 'canUseMore',
    align: 'center',
  },
  {
    name: 'expired_time',
    label: '禮遇有效期限',
    field: 'expired_time',
    align: 'center',
  },
  {
    name: 'operate',
    label: '操作',
    field: 'operate',
    align: 'center',
  },
  {
    name: 'status',
    label: '上架',
    field: 'status',
    align: 'center',
  },
]

const langColumns: tableColumn = [
  {
    name: 'name',
    label: '語系',
    field: 'name',
    align: 'center',
  },
  {
    name: 'updated_at',
    label: '最後更新時間',
    field: 'updated_at',
    align: 'center',
  },
  {
    name: 'admin',
    label: '編輯者',
    field: 'admin',
    align: 'center',
  },
  {
    name: 'is_published',
    label: '上架',
    field: 'is_published',
    align: 'center',
  },
]

const roomColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '房型名稱',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'bed',
    label: '床型',
    field: 'bed',
    align: 'center',
  },
  {
    name: 'max_guest_number',
    label: '最大住客數',
    field: 'max_guest_number',
    align: 'right',
  },
  {
    name: 'size',
    label: '房間大小',
    field: 'size',
    align: 'center',
  },
  // {
  //   name: 'gdsRef',
  //   label: 'GDS REF',
  //   field: 'gdsRef',
  //   align: 'center',
  // },
  {
    name: 'created_at',
    label: '資料建立日',
    field: (row: any) => getDateString(row.created_at, 'YYYY-MM-DD HH:mm') || '-',
    align: 'center',
  },
  {
    name: 'updated_at',
    label: '最後更新日',
    field: (row: any) => getDateString(row.updated_at, 'YYYY-MM-DD HH:mm') || '-',
    align: 'center',
  },
  {
    name: 'actions',
    label: '操作',
    field: '',
    align: 'center',
  },
]

const rateColumns: QTableProps['columns'] = [
  {
    name: 'name',
    label: '房價名稱',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'tags',
    label: '標籤',
    field: '',
    align: 'center',
  },
  {
    name: 'breakfast',
    label: '是否含早餐',
    field: '',
    align: 'center',
  },
  {
    name: 'created_at',
    label: '資料建立日',
    field: (row: any) => getDateString(row.created_at, 'YYYY-MM-DD HH:mm') || '-',
    align: 'center',
  },
  {
    name: 'updated_at',
    label: '最後更新日',
    field: (row: any) => getDateString(row.updated_at, 'YYYY-MM-DD HH:mm') || '-',
    align: 'center',
  },
  {
    name: 'actions',
    label: '操作',
    field: '',
    align: 'center',
  },
]

export const planColumns: QTableProps['columns'] = [
  {
    name: 'rate_plan_type',
    label: 'Rate Plan Type',
    field: 'rate_plan_type',
    align: 'center',
    sortable: true,
  },
  {
    name: 'rate_code',
    label: 'Rate Code',
    field: (row: any) => (row.rate_code ? row.rate_code : 'N/A'),
    align: 'center',
    sortable: true,
  },
  {
    name: 'rate_category',
    label: 'Rate Category',
    field: (row: any) =>
      !row.rate_category || row.rate_category.trim().length <= 0
        ? 'N/A'
        : RateCategoryList.find((d: any) => d.value === row.rate_category)?.label ||
          row.rate_category,
    align: 'center',
    sortable: true,
  },
  {
    name: 'guarantee',
    label: 'Guarantee Type',
    field: 'guarantee_type',
    align: 'center',
  },
  {
    name: 'room.name',
    label: 'Room',
    field: (row: any) => (row.room ? row.room.name : 'N/A'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'rate.name',
    label: 'Rate',
    field: (row: any) => (row.rate ? row.rate.name : 'N/A'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'bed',
    label: 'Bed',
    field: (row: any) => (row.tp_bed ? row.tp_bed : 'N/A'),
    align: 'center',
  },
  {
    name: 'size',
    label: 'Size',
    field: (row: any) => (row.room?.size ? row.room.size : 'N/A'),
    align: 'right',
  },
  {
    name: 'max_guest_number',
    label: 'Max Guest Number',
    field: (row: any) => (row.room?.max_guest_number ? row.room.max_guest_number : 'N/A'),
    align: 'right',
  },
  {
    name: 'is_reviewed',
    label: '資料已比對',
    field: '',
    align: 'center',
  },
  {
    name: 'hide',
    label: '上架',
    field: '',
    align: 'center',
  },
  {
    name: 'created_at',
    label: '資料建立日',
    field: (row: any) => getDateString(row.created_at, 'YYYY-MM-DD HH:mm') || '-',
    align: 'center',
  },
  {
    name: 'updated_at',
    label: '最後更新日',
    field: (row: any) => getDateString(row.updated_at, 'YYYY-MM-DD HH:mm') || '-',
    align: 'center',
  },
  {
    name: 'actions',
    label: '操作',
    field: '',
    align: 'center',
  },
]

export const GuaranteeTypeOptons = [
  { label: 'All', value: null },
  { label: 'Guarantee', value: 'Guarantee' },
  { label: 'Prepayment', value: 'Prepayment' },
  { label: 'Deposit', value: 'Deposit' },
]

export interface HotelModel {
  name: string
  brand: string | number
  hotelCode: string
  hotelChain: string | number
  desc: string
  localCurrency: string
  country: string | number
  city: string | number
  address: string
  phone?: string
  fax?: string
  isVirtuosoHotel: boolean
  lat?: number
  lng?: number
  checkInTime?: any
  checkOutTime?: any
  childAge?: number
  isPublished?: boolean
  postalCode?: string
  amenities: any[]
  cover?: any[]
  carousel?: any[]
}

export const RateCategoryOptions = [
  {
    label: '販售中的Category',
    value: [null, '', '2', '7', '11', '12', '13'], // null, 空值也算是有販售的項目
  },
  {
    label: '協會價格',
    value: ['1'],
  },
  {
    label: '會展價格',
    value: ['3'],
  },
  {
    label: '公司合約價格',
    value: ['4'],
  },
  {
    label: '日間價格',
    value: ['5'],
  },
  {
    label: '政府人員價格',
    value: ['8'],
  },
  {
    label: '軍人價格',
    value: ['9'],
  },
  {
    label: '協議價格',
    value: ['10'],
  },
  {
    label: '長者價格',
    value: ['14'],
  },
  {
    label: '旅遊大手價格',
    value: ['15'],
  },
  {
    label: '旅遊同業價格',
    value: ['16'],
  },
  {
    label: '週末特惠價格',
    value: ['17'],
  },
  {
    label: 'All',
    value: null,
  },
]

export const RateCategoryList = [
  {
    label: '酒廊套裝價格',
    value: '2',
  },
  {
    label: '家庭價格',
    value: '7',
  },
  {
    label: '套裝價格',
    value: '11',
  },
  {
    label: '促銷活動價格',
    value: '12',
  },
  {
    label: '標準價格',
    value: '13',
  },
  {
    label: '協會價格',
    value: '1',
  },
  {
    label: '會展價格',
    value: '3',
  },
  {
    label: '公司合約價格',
    value: '4',
  },
  {
    label: '日間價格',
    value: '5',
  },
  {
    label: '政府人員價格',
    value: '8',
  },
  {
    label: '軍人價格',
    value: '9',
  },
  {
    label: '協議價格',
    value: '10',
  },
  {
    label: '長者價格',
    value: '14',
  },
  {
    label: '旅遊大手價格',
    value: '15',
  },
  {
    label: '旅遊同業價格',
    value: '16',
  },
  {
    label: '週末特惠價格',
    value: '17',
  },
  {
    label: 'All',
    value: null,
  },
]
// null, 空值也算是有販售的項目
// '2': '酒廊套裝價格', // 有販賣的
// '7': '家庭價格', // 有販賣的
// '11': '套裝價格', // 有販賣的
// '12': '促銷活動價格', // 有販賣的
// '13': '標準價格', // 有販賣的
// '1': '協會價格',
// '3': '會展價格',
// '4': '公司合約價格',
// '5': '日間價格',
// '8': '政府人員價格',
// '9': '軍人價格',
// '10': '協議價格',
// '14': '長者價格',
// '15': '旅遊大手價格',
// '16': '旅遊同業價格',
// '17': '週末特惠價格',

export const EnabledOptions = [
  { label: '全部', value: null },
  { label: '上架', value: true },
  { label: '下架', value: false },
]
export const ReviewOptions = [
  { label: '全部', value: null },
  { label: '待比對', value: true },
  { label: '已比對', value: false },
]
export { columns, tabArr, editTab, benefitColumns, langColumns, roomColumns, rateColumns }
