import { QTableProps } from 'quasar'
import { getDateString } from 'src/utils/helpers'

export const MembershipColumns: QTableProps['columns'] = [
  {
    name: 'title',
    label: '活動名稱',
    field: 'title',
    align: 'left',
  },
  {
    name: 'desc',
    label: '說明',
    field: 'desc',
    align: 'left',
  },
  {
    name: 'membership',
    label: '會籍',
    field: (row) => row.membership.title,
    align: 'center',
  },
  {
    name: 'discount',
    label: '優惠',
    field: (row) => `${row.value} ${row.unit === 'percent' ? '%' : 'USD'}`,
    align: 'center',
  },
  {
    name: 'note',
    label: '備註',
    field: (row) => row.note,
    align: 'left',
  },
  {
    name: 'duration',
    label: '有效期限',
    field: (row) =>
      `${getDateString(row.start_date, 'YYYY-MM-DD')} ～ ${getDateString(
        row.end_date,
        'YYYY-MM-DD'
      )}`,
    align: 'center',
    sortable: true,
  },
  {
    name: 'amount',
    label: '已註冊/失敗/總數',
    field: (row) => `${row.success_total}/${row.failed_total}/${row.total}`,
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
    field: 'is_disable',
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
    name: 'status',
    label: '狀態',
    field: (row) => MmeberStatusOptions.find((d) => d.value === row.register?.verify)?.label || '-',
    align: 'center',
  },
  {
    name: 'title',
    align: 'left',
    label: '稱謂',
    field: (row) => row.register?.title || '-',
  },
  {
    name: 'username',
    label: '姓名',
    align: 'left',
    field: '',
  },
  {
    name: 'phone',
    label: '手機',
    align: 'left',
    field: '',
  },
  {
    name: 'email',
    label: '註冊Email',
    field: (row) => row.register?.email || '-',
    align: 'left',
  },
  {
    name: 'created_at',
    label: '建立時間',
    align: 'left',
    field: (row) => getDateString(row.created_at, 'YYYY-MM-DD HH:mm:ss'),
  },
]

export const InvitationCodeTabs: {
  text: string
  val: string | number | null
}[] = [
  { text: '全部', val: null },
  { text: '尚未開始', val: 0 },
  { text: '進行中', val: 1 },
  { text: '已過期', val: 2 },
]

export const StatusOptions: {
  label: string
  value: string | number | null
}[] = [
  { label: '全部效期', value: null },
  { label: '尚未開始', value: 'unstarted' },
  { label: '進行中', value: 'progress' },
  { label: '已過期', value: 'expired' },
]

export const EnabledOptions = [
  { label: '所有狀態', value: null },
  { label: '開啟中', value: true },
  { label: '已關閉', value: false },
]

export const MmeberStatusOptions = [
  { label: '未完成註冊', value: 0 },
  { label: '已使用', value: 1 },
  { label: '已使用', value: 2 },
  { label: '已使用', value: 3 },
  { label: '已使用', value: 4 },
  { label: '失敗', value: 5 },
  { label: '失敗', value: 6 },
]
