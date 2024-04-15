import { GetLocalTime } from 'src/utils/helpers'

interface columnStruct {
  name: string
  label: string
  field: string | ((row: { updated_at: string }) => string) | any
  align: 'center' | 'left' | 'right'
}
type tableColumn = columnStruct[]

const columns: tableColumn = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'center',
  },
  {
    name: 'name',
    label: '集團名稱',
    field: 'name',
    align: 'center',
  },
  // {
  //   name: 'brands_count',
  //   label: '集團品牌數',
  //   field: 'brands_count',
  //   align: 'center',
  // },
  // {
  //   name: 'hotel_count',
  //   label: '集團酒店數',
  //   field: 'brands_count',
  //   align: 'center',
  // },
  {
    name: 'operation',
    label: '操作',
    field: 'operation',
    align: 'center',
  },
  {
    name: 'updateAt',
    label: '更新時間',
    field: (row: { updated_at: string }) => GetLocalTime(row.updated_at),
    align: 'center',
  },
]
export default columns
