import { QTableProps } from 'quasar'
import { MarketingNotify } from 'src/model'
import { getDateString } from 'src/utils/helpers'

export const MarketingColumns: QTableProps['columns'] = [
  {
    name: 'title',
    label: '推播主題',
    field: 'title',
    align: 'left',
  },
  {
    name: 'tag',
    label: '推播標籤',
    field: 'tag',
    align: 'center',
  },
  {
    name: 'rule',
    label: '觸發條件',
    field: '',
    align: 'left',
  },
  {
    name: 'start_date',
    label: '發送期間',
    field: '',
    align: 'center',
    sortable: true,
  },
  {
    name: 'time',
    label: '發送時間',
    field: '',
    align: 'center',
  },
  {
    name: 'target',
    label: '發送對象',
    field: 'target',
    align: 'center',
  },
  {
    name: 'amount',
    label: '預計發送人數',
    field: (row: MarketingNotify) => row.send_total,
    align: 'center',
  },
  {
    name: 'content',
    label: '內容',
    field: 'content',
    align: 'left',
  },
  {
    name: 'applink',
    label: '到達頁',
    field: 'applink',
    align: 'center',
  },
  {
    name: 'count',
    label: '不重複/點擊數',
    field: (row: MarketingNotify) => `${row.no_repeat_click}/${row.total_click}`,
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
    label: '開/關',
    field: 'status',
    align: 'center',
  },
]

export const CodeColumns: QTableProps['columns'] = [
  {
    name: 'sn',
    label: '#',
    field: 'sn',
    align: 'right',
  },
  {
    name: 'code',
    label: '邀請碼',
    field: 'code',
    align: 'left',
  },
  {
    name: 'register_date',
    label: '註冊日期',
    field: (row) => getDateString(row.register?.created_at, 'YYYY-MM-DD') || '-',
    align: 'center',
  },
  {
    name: 'email',
    label: '註冊Email',
    field: (row) => row.register?.email || '-',
    align: 'left',
  },
]

export const EnabledOptions = [
  { label: '所有狀態', value: null },
  { label: '開啟中', value: true },
  { label: '已關閉', value: false },
]

export const DuringOptions = [
  { label: '不拘', value: 3650 },
  { label: '3日內', value: 3 },
  { label: '7日內', value: 7 },
  { label: '1個月內', value: 30 },
]

export const ConductOptions = [
  // { label: '不拘', value: 'all' },
  { label: '有登入', value: 'login' },
  { label: '訂房紀錄', value: 'booking' },
]

export const FrequencyOptions = [
  { label: '週一', value: 1 },
  { label: '週二', value: 2 },
  { label: '週三', value: 3 },
  { label: '週四', value: 4 },
  { label: '週五', value: 5 },
  { label: '週六', value: 6 },
  { label: '週日', value: 7 },
]
