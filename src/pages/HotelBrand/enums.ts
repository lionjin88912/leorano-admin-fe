import { GetLocalTime } from 'src/utils/helpers'

interface columnStruct {
  name: string
  label: string
  field: string | ((row: { updated_at: string }) => string) | any
  align: 'center' | 'center' | 'right'
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
    label: '酒店品牌',
    field: 'name',
    align: 'center',
  },
  {
    name: 'group',
    label: '所屬酒店集團',
    field: (row: any) => row.hotel_group_name || '獨立品牌',
    align: 'center',
  },
  {
    name: 'hotelChain',
    label: 'Hotel Chain',
    field: 'hotel_chain',
    align: 'center',
  },
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
  {
    name: 'status',
    label: '上架狀態',
    field: 'is_enabled',
    align: 'center',
  },
]

export { columns }
