import { getDateString, getDateStringNoTz } from 'src/utils/helpers'

interface ColumnStruct {
  name: string
  label: string
  field?: string | ((row: { updated_at: string }) => string) | any
  align: 'center' | 'left' | 'right'
}
type TableColumn = ColumnStruct[]

export const columns: TableColumn = [
  {
    name: 'order_number',
    label: '訂單編號',
    field: 'order_number',
    align: 'left',
  },
  {
    name: 'order_date',
    label: '訂單日期',
    field: (row: any) => getDateString(row.order_date, 'YYYY-MM-DD'),
    align: 'left',
  },
  {
    name: 'order_status',
    label: '訂單狀態',
    field: (row: any) => hotelOrderStatusOptions.find((d) => d.value === row.order_status)?.label,
    align: 'center',
  },
  // {
  //   name: 'check_in',
  //   label: '預定入住日',
  //   field: (row: any) => getDateStringNoTz(row.check_in, 'YYYY-MM-DD'),
  //   align: 'left',
  // },
  {
    name: 'check_out',
    label: '預定退房日',
    field: (row: any) => getDateStringNoTz(row.check_out, 'YYYY-MM-DD'),
    align: 'center',
  },
  {
    name: 'price',
    label: '訂單金額',
    field: 'price',
    align: 'left',
  },
  // {
  //   name: 'profit',
  //   label: '利潤',
  //   field: 'profit',
  //   align: 'left',
  // }
]

const hotelOrderStatusOptions = [
  { label: '所有訂單狀態', value: null },
  { label: '預訂中', value: 'processing' },
  { label: '預訂成功', value: 'success' },
  { label: '預訂失敗', value: 'failed' },
  { label: '已取消', value: 'cancelled' },
  { label: '取消失敗', value: 'cancel_failed' },
]