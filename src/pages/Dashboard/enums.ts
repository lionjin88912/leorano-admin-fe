import { getDateStringNoTz } from 'src/utils/helpers'

interface ColumnStruct {
  name: string
  label: string
  field?: string | ((row: any) => string) | any
  format?: (val: string) => string
  align: 'center' | 'left' | 'right'
  sortable?: boolean
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
    name: 'checkin',
    label: '入住日期',
    field: 'checkin',
    format: (val: string) => getDateStringNoTz(val, 'YYYY-MM-DD'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'hotel_name',
    label: '酒店名稱',
    field: 'hotel_name',
    align: 'left',
  }
]