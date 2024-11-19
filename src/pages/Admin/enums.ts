import { QTableProps } from 'quasar'

export const adminColumns: QTableProps['columns'] = [
  {
    name: 'id',
    label: '序號',
    field: 'id',
    align: 'left',
  },
  {
    name: 'username',
    label: '使用者名稱',
    field: 'username',
    align: 'left',
  },
  {
    name: 'email',
    label: '信箱',
    field: 'email',
    align: 'left',
  },
  {
    name: 'role_id',
    label: '權限',
    field: 'role_id',
    align: 'left',
  },
  {
    name: 'status',
    label: '狀態',
    field: 'status',
    align: 'center',
  },
  {
    name: 'operation',
    label: '編輯',
    field: 'operation',
    align: 'center',
  },
]

export const statusOptions = [
  { label: '啟用', value: 1 },
  { label: '停用', value: 0 }
]
