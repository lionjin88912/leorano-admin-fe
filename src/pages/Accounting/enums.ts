import { getDateString, getDateStringNoTz, getCurrencyPriceFormat } from 'src/utils/helpers'

interface ColumnStruct {
  name: string
  label: string
  field?: string | ((row: { updated_at: string }) => string) | any
  align: 'center' | 'left' | 'right',
  wpx: number
}
type TableColumn = ColumnStruct[]

const hotelColumns: TableColumn = [
  {
    name: 'order_number',
    label: '訂單編號',
    field: 'order_number',
    align: 'left',
    wpx: 120
  },
  {
    name: 'order_date',
    label: '訂單日期',
    field: (row: any) => getDateString(row.order_date, 'YYYY-MM-DD'),
    align: 'left',
    wpx: 80
  },
  {
    name: 'order_status',
    label: '訂單狀態',
    field: (row: any) => hotelOrderStatusOptions.find((d) => d.value === row.order_status)?.label,
    align: 'center',
    wpx: 100
  },
  {
    name: 'check_in',
    label: '預定入住日',
    field: (row: any) => getDateStringNoTz(row.check_in, 'YYYY-MM-DD'),
    align: 'left',
    wpx: 80
  },
  {
    name: 'check_out',
    label: '預定退房日',
    field: (row: any) => getDateStringNoTz(row.check_out, 'YYYY-MM-DD'),
    align: 'center',
    wpx: 100
  },
  {
    name: 'room_night',
    label: '房晚數',
    field: 'room_night',
    align: 'left',
    wpx: 100
  },
  {
    name: 'price',
    label: '訂單金額',
    field: (row: any) => getCurrencyPriceFormat(row.price),
    align: 'left',
    wpx: 100
  },
  {
    name: 'profit',
    label: '利潤百分比',
    field: (row: any) => row.profit + ' %',
    align: 'left',
    wpx: 100,
  },
  {
    name: 'final_profit',
    label: '實際利潤',
    field: (row: any) => getCurrencyPriceFormat(row.final_profit),
    align: 'left',
    wpx: 100
  }
]

const customizedColumns: TableColumn = [
  {
    name: 'order_number',
    label: '訂單編號',
    field: 'order_number',
    align: 'left',
    wpx: 120
  },
  {
    name: 'order_date',
    label: '訂單建立日期',
    field: (row: any) => getDateString(row.order_date, 'YYYY-MM-DD'),
    align: 'left',
    wpx: 80
  },
  {
    name: 'price',
    label: '訂單金額',
    field: (row: any) => getCurrencyPriceFormat(row.price),
    align: 'left',
    wpx: 100
  },
  {
    name: 'final_profit',
    label: '實際利潤',
    field: (row: any) => getCurrencyPriceFormat(row.final_profit),
    align: 'left',
    wpx: 100
  }
]

interface FieldStruct {
  name: string,
  type: 'text' | 'select' | 'date',
  label?: string,
  icon?: string,
  options?: { label: string, value: string | null }[]
}

const hotelOrderStatusOptions = [
  { label: '所有訂單狀態', value: null },
  { label: '預訂中', value: 'processing' },
  { label: '預訂成功', value: 'success' },
  { label: '預訂失敗', value: 'failed' },
  { label: '已取消', value: 'cancelled' },
  { label: '取消失敗', value: 'cancel_failed' },
]

const hotelOrderProfitOptions = [
  { label: '全部', value: null },
  { label: '僅實際利潤', value: 'true' },
]

const hotelFilters: FieldStruct[] = [
  {
    name: 'created_at',
    type: 'date',
    label: '訂單日期區間',
  },
  {
    name: 'check_in',
    type: 'date',
    label: '退房日期區間',
  },
  {
    name: 'order_status',
    type: 'select',
    options: hotelOrderStatusOptions,
  },
  {
    name: 'order_number',
    type: 'text',
    label: '訂單編號',
    icon: 'search'
  },
  {
    name: 'only_earn',
    type: 'select',
    options: hotelOrderProfitOptions,
  },
]

const customizedFilters: FieldStruct[] = [
  {
    name: 'created_at',
    type: 'date',
    label: '訂單日期區間',
  },
  {
    name: 'order_number',
    type: 'text',
    label: '訂單編號',
    icon: 'search'
  }
]

interface PageStruct {
  pageTitle: string,
  filters: any,
  columns: TableColumn,
  detailLinkName: string,
  detailLinkColumn: string,
}

export const pages: { [key: string]: PageStruct } = {
  hotel: {
    pageTitle: '酒店訂單對帳',
    filters: hotelFilters,
    columns: hotelColumns,
    detailLinkName: 'HotelOrderDetail',
    detailLinkColumn: 'order_number',
  },
  customized: {
    pageTitle: '客製訂單對帳',
    filters: customizedFilters,
    columns: customizedColumns,
    detailLinkName: 'CustomizedOrderDetail',
    detailLinkColumn: 'id',
  }
}