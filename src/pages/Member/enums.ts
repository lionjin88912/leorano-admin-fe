import * as helpers from 'src/utils/helpers'

interface columnStruct {
  name: string
  label: string
  field?:
    | string
    | ((row: { updated_at: string }) => string)
    | ((row: { first_name: string; last_name: string }) => string)
  align: 'center' | 'left' | 'right'
}
type tableColumn = columnStruct[]

const columns: tableColumn = [
  {
    name: 'user_number',
    label: '編號',
    field: 'user_number',
    align: 'left',
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
    field: 'username',
  },
  {
    name: 'email',
    label: 'EMail',
    field: 'email',
    align: 'left',
  },
  {
    name: 'membership',
    label: '會籍',
    field: 'membership_code',
    align: 'left',
  },
  {
    name: 'expired_at',
    label: '到期日',
    field: (row: any) =>
      row.MembershipRecords && row.MembershipRecords.length > 0
        ? helpers.getDateString(row.MembershipRecords[0].expired_at, 'YYYY-MM-DD')
        : '',
    align: 'left',
  },
  {
    name: 'city',
    label: '所在地',
    field: 'city',
    align: 'left',
  },
  {
    name: 'income',
    label: '年收入',
    field: 'income',
    align: 'left',
  },

  {
    name: 'order_sum',
    label: '累積消費金額',
    field: 'order_sum',
    align: 'left',
  },
  {
    name: 'invite_user',
    label: '推薦人',
    field: '',
    align: 'left',
  },
  {
    name: 'note',
    label: '備註',
    field: 'note',
    align: 'left',
  },
  {
    name: 'operation',
    label: '操作',
    field: 'operation',
    align: 'center',
  },
  {
    name: 'intercom',
    label: '客服記錄',
    align: 'center',
  },
]

const tabArr: {
  val: string | number
  text: string
}[] = [
  { text: 'Club', val: 'Club' },
  { text: 'Silver', val: 'Silver' },
  { text: 'Gold', val: 'Gold' },
  { text: 'Platinum', val: 'Platinum' },
  { text: 'Diamond', val: 'Diamond' },
  { text: 'Former', val: 'Former' },
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
/**
 * 稱謂選單項目
 */
export const TitleOptions = ['Mr', 'Mrs', 'Miss', 'Mx']
/**
 * 性別選單項目
 */
export const SexualOptions = ['Male', 'Female', 'Unspecified', 'Undisclosed']

export { columns, tabArr, editTab, benefitColumns, langColumns }
