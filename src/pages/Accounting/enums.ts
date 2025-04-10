import { getDateString, getDateStringNoTz, getNumberFormat, getCurrencyPriceFormat, getUserNameFormat } from 'src/utils/helpers'

interface ColumnStruct {
  name: string
  label: string
  classes?: string
  field?: string | ((row: { updated_at: string }) => string) | any
  align: 'center' | 'left' | 'right',
  wpx?: number
  sortable?: boolean
}
type TableColumn = ColumnStruct[]

export const orderColumns: TableColumn = [
  {
    name: 'order_number',
    label: '訂單編號',
    classes: 'col',
    field: 'order_number',
    align: 'left',
    sortable: true,
  },
  {
    name: 'revenue',
    label: '收入',
    classes: 'td-price',
    field: 'revenue',
    align: 'right',
  },
  {
    name: 'expense',
    label: '支出',
    classes: 'td-price',
    field: 'expense',
    align: 'right',
  },
  {
    name: 'profit',
    label: '毛利',
    classes: 'td-price',
    field: 'profit',
    align: 'right',
  },
  {
    name: 'profit_rate',
    label: '毛利%',
    classes: 'td-price',
    field: 'profit_rate',
    align: 'right',
  }
]

export const subOrderColumns: TableColumn = [
  {
    name: 'booking_way',
    label: '預訂方式',
    classes: 'td-type text-center',
    align: 'left',
  },
  {
    name: 'order_number',
    label: '訂單編號',
    classes: 'col',
    align: 'left',
  },
  {
    name: 'type',
    label: '訂單類型',
    classes: 'td-type',
    align: 'left',
  },
  {
    name: 'revenue',
    label: '收入',
    classes: 'td-price text-right',
    align: 'right',
  },
  {
    name: 'expense',
    label: '支出',
    classes: 'td-price text-right',
    align: 'right',
  },
  {
    name: 'profit',
    label: '毛利',
    classes: 'td-price text-right',
    align: 'right',
  },
  {
    name: 'profit_rate',
    label: '毛利%',
    classes: 'td-price text-right',
    align: 'right',
  }
]

const hotelColumns: TableColumn = [
  {
    name: 'order_number',
    label: '訂單編號/確認編號',
    field: 'order_number',
    align: 'left',
    wpx: 120
  },
  {
    name: 'hotel_name',
    label: '酒店名稱',
    field: 'hotel_name',
    align: 'left',
    wpx: 180
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
    label: '入住/退房日',
    field: (row: any) => getDateStringNoTz(row.check_in, 'YYYY-MM-DD'),
    align: 'left',
    wpx: 80
  },
  {
    name: 'room_night',
    label: '房晚數',
    field: 'room_night',
    align: 'left',
    wpx: 100
  },
  {
    name: 'traveler_firstname',
    label: '入住人',
    field: (row: any) => getUserNameFormat(row.traveler_firstname, row.traveler_lastname),
    align: 'left',
    wpx: 180
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
    name: 'title',
    label: '訂單名稱',
    field: 'title',
    align: 'left',
    wpx: 180
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

export const paymentColumns: TableColumn = [
  {
    name: 'payment_number',
    label: '支單號',
    field: 'payment_number',
    align: 'left'
  },
  {
    name: 'payment_item',
    label: '支出項目',
    field: 'payment_item',
    align: 'left'
  },
  {
    name: 'payment_amount',
    label: '支出金額',
    field: (row: any) => getCurrencyPriceFormat(row.payment_amount),
    align: 'left'
  },
  {
    name: 'created_at',
    label: '建立日期',
    field: (row: any) => getDateString(row.created_at, 'YYYY-MM-DD'),
    align: 'left'
  },
  {
    name: 'print',
    label: '列印',
    field: 'print',
    align: 'center'
  },
  {
    name: 'paid',
    label: '付款狀態',
    align: 'center'
  }
]

export const receiptColumns: TableColumn = [
  {
    name: 'receipt_number',
    label: '收據編號',
    field: 'receipt_number',
    align: 'left'
  },
  {
    name: 'order_name',
    label: '訂單名稱',
    field: 'order_name',
    align: 'left'
  },
  {
    name: 'list',
    label: '明細',
    field: 'list',
    align: 'left'
  },
  {
    name: 'amount',
    label: '總計',
    field: (row: any) => getCurrencyPriceFormat(row.amount),
    align: 'left'
  },
  {
    name: 'created_at',
    label: '建立日期',
    field: (row: any) => getDateString(row.created_at, 'YYYY-MM-DD'),
    align: 'left'
  }
]

interface FieldStruct {
  name: string,
  type: 'text' | 'select' | 'date' | 'hotelGroup',
  label?: string,
  icon?: string,
  options?: { label: string, value: string | null }[]
}

export const orderBookingWayOptions = [
  { label: 'App', value: 'online', color: 'primary' },
  { label: '線下', value: 'offline', color: 'green' },
]

export const orderTypeOptions = [
  { label: '酒店', value: 'hotel', color: 'purple-6' },
  { label: '票卷', value: 'ticket', color: 'orange-6' },
]

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
  { label: '無實際利潤', value: 'false' },
]

export const paidFilterStatusOptions = [
  { label: '全部', value: null },
  { label: '未付款', value: false },
  { label: '已付款', value: true }
]

export const paymentTitleTypeOptions = [
  { label: '成本支單', value: 'cost' },
  { label: '費用支單', value: 'expense' }
]

export const paymentTypeOptions = [
  { label: '酒店', value: 'hotel' },
  { label: '票卷', value: 'ticket' },
  { label: '其他', value: 'other' }
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
    label: '訂單狀態',
    options: hotelOrderStatusOptions,
  },
  {
    name: 'order_number',
    type: 'text',
    label: '訂單編號',
    icon: 'search'
  },
  {
    name: 'group_id',
    type: 'hotelGroup'
  },
  {
    name: 'only_earn',
    type: 'select',
    label: '利潤狀態',
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

export const paymentPrintColumns: TableColumn = [
  {
    name: 'index',
    label: 'No',
    field: 'index',
    align: 'center'
  },
  {
    name: 'order_number',
    label: '訂單',
    field: 'order_number',
    align: 'left'
  },
  {
    name: 'type',
    label: '類別',
    field: (row: any) => paymentTypeOptions.find((d) => d.value === row.type)?.label,
    align: 'left'
  },
  {
    name: 'detail',
    label: '詳細說明',
    field: 'detail',
    align: 'left'
  },
  {
    name: 'qty',
    label: '數量',
    field: 'qty',
    align: 'center'
  },
  {
    name: 'price',
    label: '單價',
    field: (row: any) => getNumberFormat(row.price),
    align: 'right'
  },
  {
    name: 'tax',
    label: '稅',
    field: 'tax',
    align: 'center'
  },
  {
    name: 'rate',
    label: '匯率',
    field: 'exchange_rate',
    align: 'center'
  },
  {
    name: 'total',
    label: '金額 USD',
    field: (row: any) => getNumberFormat(row.price * row.exchange_rate),
    align: 'right'
  }
]