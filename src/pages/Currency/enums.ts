import { QTableProps } from 'quasar'

export const CurrencyColumns: QTableProps['columns'] = [
  {
    name: 'from',
    label: '從',
    field: 'from',
    align: 'left',
  },
  {
    name: 'to',
    label: '到',
    field: 'to',
    align: 'left',
  },
  {
    name: 'time',
    label: '時間',
    field: 'time',
    align: 'left',
  }
]