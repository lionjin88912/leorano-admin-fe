import { GetLocalTime } from 'src/utils/helpers'
import { getDateString } from 'src/utils/helpers'

interface columnStruct {
  name: string
  label: string
  field: string | ((row: { created_at: string; updated_at: string }) => string) | any
  align: 'center' | 'left' | 'right'
}
type tableColumn = columnStruct[]

const columns: tableColumn = [
  // {
  //   name: 'name',
  //   label: '酒店名稱',
  //   field: 'name',
  //   align: 'left',
  // },
  // {
  //   name: 'group',
  //   align: 'left',
  //   label: '所屬集團',
  //   field: 'hotel_group_name',
  // },
  // {
  //   name: 'brand',
  //   label: '所屬品牌',
  //   align: 'left',
  //   field: 'hotel_brand_name',
  // },
  // {
  //   name: 'chain',
  //   label: 'TP Hotel Chain',
  //   field: 'hotel_chain',
  //   align: 'left',
  // },
  // {
  //   name: 'hotelCode',
  //   label: 'TP Hotel Code',
  //   field: 'hotel_code',
  //   align: 'left',
  // },
  // {
  //   name: 'country',
  //   label: '國家',
  //   field: 'country',
  //   align: 'left',
  // },
  // {
  //   name: 'city',
  //   label: '城市',
  //   field: 'city',
  //   align: 'left',
  // },
  // {
  //   name: 'lang',
  //   label: '上架語系',
  //   field: 'address',
  //   align: 'left',
  // },
  // {
  //   name: 'updateAt',
  //   label: '更新時間',
  //   field: (row :  { updated_at : string }) => GetLocalTime(row.updated_at),
  //   align: 'center',
  // },
  // {
  //   name: 'operation',
  //   label: '操作',
  //   field: 'operation',
  //   align: 'center',
  // },
  // {
  //   name: 'status',
  //   label: '上架',
  //   field: 'status',
  //   align: 'center',
  // },
]

const tabArr: {
  val: string | number
  text: string
  color: 'orange' | 'cyan' | 'red' | 'primary'
}[] = [
  {
    text: '待審核',
    val: 1,
    color: 'primary',
  },
  {
    text: '補資料',
    val: 4,
    color: 'primary',
  },
  {
    text: '駁回',
    val: 5,
    color: 'primary',
  },
  {
    text: '逾期',
    val: 3,
    color: 'primary',
  },
  {
    text: '審核通過',
    val: 2,
    color: 'primary',
  },
]

const editTab: {
  val: string | number
  text: string
  color: 'orange' | 'cyan' | 'red' | 'primary'
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
  {
    text: '適用禮遇',
    val: 'benefits',
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
    field: (row: any) => getDateString(row.updated_at, 'YYYY-MM-DD HH:mm'),
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

const paymentColumns: tableColumn = [
  {
    name: 'uid',
    label: 'UID',
    field: (row: any) => row.user_profile.user_uuid,
    align: 'left',
  },
  {
    name: 'user_number',
    label: '會員編號',
    field: (row: any) => row.user_profile.user_number,
    align: 'left',
  },
  {
    name: 'created_at',
    label: '註冊日',
    field: (row: any) => getDateString(row.created_at, 'YYYY-MM-DD HH:mm'),
    align: 'center',
  },
  {
    name: 'title',
    align: 'left',
    label: '稱謂',
    field: 'title',
  },
  {
    name: 'username',
    label: '姓名',
    align: 'left',
    field: (row: any) => `${row.first_name} ${row.last_name}`,
  },
  {
    name: 'nickname',
    label: '暱稱',
    field: 'nickname',
    align: 'left',
  },
  {
    name: 'income',
    label: '年收入',
    field: 'income',
    align: 'left',
  },
  {
    name: 'recommender',
    label: '推薦人',
    field: 'recommender',
    align: 'left',
  },
  {
    name: 'membership',
    label: '會籍',
    field: (row: any) => 'Observer', //row.user_profile.membership_code,
    align: 'left',
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
  },
  // {
  //   name: 'operation',
  //   label: '操作',
  //   field: 'operation',
  //   align: 'center',
  // },
]

export { columns, tabArr, editTab, benefitColumns, langColumns, paymentColumns }
