import { getDateStringNoTz } from 'src/utils/helpers'

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
    name: 'checkin',
    label: '入住日期',
    field: (row: any) => getDateStringNoTz(row.checkin, 'YYYY-MM-DD'),
    align: 'left',
  },
  {
    name: 'hotel_name',
    label: '酒店名稱',
    field: 'hotel_name',
    align: 'left',
  }
]