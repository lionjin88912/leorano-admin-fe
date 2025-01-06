import { getDateString, getDateStringNoTz, getCurrencyFormat } from 'src/utils/helpers'

interface ColumnStruct {
  name: string
  label: string
  field?: string | ((row: { updated_at: string }) => string) | any
  align: 'center' | 'left' | 'right'
  sortable?: boolean
}
type TableColumn = ColumnStruct[]

export const hotelColumns: TableColumn = [
  {
    name: 'order_number',
    label: '訂單編號',
    field: 'order_number',
    align: 'left',
  },
  {
    name: 'booking_code',
    label: '酒店確認/取消編號',
    align: 'left',
  },
  {
    name: 'created_at',
    label: '訂單日期',
    field: (row: any) => getDateString(row.created_at, 'YYYY-MM-DD'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: '訂單狀態',
    // field: (row: any) => hotelOrderStatusOptions.find((d) => d.value === row.status)?.label,
    align: 'center',
  },
  {
    name: 'hotel_name',
    label: '酒店名稱',
    field: (row: any) => row.hotel.name,
    align: 'left',
  },
  {
    name: 'check_in',
    label: '預定入住日',
    field: (row: any) => getDateStringNoTz(row.check_in, 'YYYY-MM-DD'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'check_out',
    label: '預定退房日',
    field: (row: any) => getDateStringNoTz(row.check_out, 'YYYY-MM-DD'),
    align: 'center',
  },
  {
    name: 'total_price',
    label: '訂單金額',
    field: '',
    // field: (row: any) =>
    //   row.total_price
    //     ? `${row.total_price.slice(0, 3)} ${getCurrencyFormat(row.total_price.slice(3))}`
    //     : null,
    align: 'left',
  },
  {
    name: 'user',
    label: '訂購人',
    align: 'left',
  },
  {
    name: 'final_profit',
    label: '利潤',
    align: 'left',
    field: 'final_profit',
  },
  {
    name: 'intercom',
    label: '客服記錄',
    align: 'center',
  },
]

export const customizedColumns: TableColumn = [
  {
    name: 'order_number',
    label: '訂單編號',
    field: 'order_number',
    align: 'left',
  },
  {
    name: 'voucher_cancel_code',
    label: '憑證編號/取消編號',
    align: 'left',
  },
  {
    name: 'title',
    label: '訂單名稱',
    field: 'title',
    align: 'left',
  },
  {
    name: 'created_at',
    label: '訂單建立日期',
    field: (row: any) => getDateString(row.created_at, 'YYYY-MM-DD'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'member',
    label: '訂購人',
    field: 'member',
    align: 'left',
  },
  {
    name: 'price',
    label: '訂單金額',
    field: 'price',
    align: 'left',
  },
  {
    name: 'final_profit',
    label: '實際利潤',
    field: 'final_profit',
    align: 'left',
  },
  {
    name: 'operation',
    label: '編輯/取消',
    field: 'operation',
    align: 'center',
  },
  {
    name: 'invoice_send',
    label: '是否寄送發票',
    field: (row: any) => row.invoice_send == true ? '已寄送' : '未寄送',
    align: 'center',
  },
  {
    name: 'voucher_send',
    label: '憑證是否發送過',
    field: 'voucher_send',
    align: 'center',
  },
  {
    name: 'voucher',
    label: '憑證',
    field: 'voucher',
    align: 'center',
  },
  {
    name: 'intercom',
    label: '客服記錄',
    align: 'center',
  },
]

export const userColumns: TableColumn = [
  {
    name: 'id',
    label: '會員編號',
    field: 'id',
    align: 'left',
  },
  {
    name: 'title',
    label: '稱謂',
    field: 'title',
    align: 'left',
  },
  {
    name: 'name',
    label: '姓名',
    field: 'name',
    align: 'left',
  },
  {
    name: 'email',
    label: 'E-mail',
    field: 'email',
    align: 'left',
  }
]

export const titleOptions = ['Mr.', 'Mrs.', 'Miss', 'Mx']
export const arrivalTimeOptions = ['00:00', '01:00', '02:00 ~ 21:00', '22:00', '23:00']
export const specialRequirementOptions = [
  { label: '嬰兒床及嬰兒備品', value: 'baby_crib_and_amenities' },
  { label: '非吸煙房', value: 'nonsmoking_room' },
  { label: '加床', value: 'extra_bed' },
  { label: '高樓層', value: 'high_floor' },
  { label: '聯通房', value: 'connecting_room' },
  { label: '相鄰隔壁房', value: 'adjoining_room' },
  { label: '兒童備品', value: 'children_amenities' }
]

export const customizedOrderStatusOptions = [
  { label: '全部', value: '' },
  { label: '未封存', value: 'online' },
  { label: '封存', value: 'archive' }
]

export const customizedOrderTypeOptions = [
  { label: '飯店', value: 'hotel' },
  { label: '票卷', value: 'ticket' },
]

// 飯店類型的問題：飯店名稱
export const defaultQuestions = {
  hotel: ['Hotel Name', 'Check-in Time', 'Check-out Time', 'Room Type', 'Note'],
  ticket: ['Title', 'Note']
}

export const memberColumns: TableColumn = [
  {
    name: 'order_number',
    label: '訂單編號',
    field: 'order_number',
    align: 'left',
  },
  {
    name: 'name',
    label: '品項名稱',
    field: (row: any) => row.Items.map((d: any) => `會籍 - ${d.item_name}`).join(', '),
    align: 'left',
  },
  {
    name: 'created_at',
    label: '訂單日期',
    field: (row: any) => getDateString(row.created_at, 'YYYY-MM-DD'),
    align: 'left',
    sortable: true,
  },
  {
    name: 'total_price',
    label: '訂單金額',
    field: (row: any) => getCurrencyFormat(row.amount),
    align: 'left',
  },
  {
    name: 'order_status',
    label: '訂單狀態',
    field: (row: any) => memberOrderStatusOptions.find((d) => d.value === row.status)?.label,
    align: 'center',
  },
  {
    name: 'payment_status',
    label: '付款狀態',
    field: (row: any) => paymentStatusOptions.find((d) => d.value === row.payment)?.label,
    align: 'center',
  },
  {
    name: 'validity_at',
    label: '付款期限',
    field: (row: any) => getDateString(row.validity_at, 'YYYY-MM-DD'),
    align: 'center',
  },
  {
    name: 'paided_at',
    label: '付款日期',
    field: (row: any) => getDateString(row.paided_at, 'YYYY-MM-DD') || '-',
    align: 'center',
  },
  {
    name: 'payment_method',
    label: '付款方式',
    field: (row: any) =>
      row.payment_method
        ? `${paymentMethodOptions.find((d) => d.value === row.payment_method)?.label} ${row.last4}`
        : '-',
    align: 'center',
  },
  {
    name: 'code',
    label: '提名邀請碼',
    field: (row: any) => row.RegisterRecord?.code || '-',
    align: 'center',
  },
  {
    name: 'order_person',
    label: '訂購人',
    align: 'left',
  },
]

export const hotelOrderStatusOptions = [
  { label: '所有訂單狀態', value: null },
  { label: '預訂中', value: 'processing' },
  { label: '預訂成功', value: 'success' },
  { label: '預訂失敗', value: 'failed' },
  { label: '已取消', value: 'cancelled' },
  { label: '取消失敗', value: 'cancel_failed' },
]

export const customizedVoucherSendOptions = [
  { label: '否', value: false },
  { label: '是', value: true }
]

export const customizedInvoiceOptions = [
  { label: '未寄送', value: false },
  { label: '已寄送', value: true }
]

export const memberOrderStatusOptions = [
  { id: 0, label: '所有訂單狀態', value: null },
  { id: 1, label: '會員待審核', value: 0 }, // 待確認
  { id: 2, label: '審核通過', value: 1 }, // 已確認
  { id: 3, label: '審核不通過未扣款', value: 2 }, // 已取消
  { id: 4, label: '預授權到期未申請扣款', value: 3 }, // 已逾期
  { id: 5, label: '已成為會員', value: 4, has_back_order: 0 }, // 已完成 (訂單已結案 沒有退貨單) 夾帶參數 has_back_order: 0
  { id: 6, label: '已退會', value: 4, has_back_order: 1 }, // 已完成 (訂單已結案 但有退貨單) 夾帶參數 has_back_order: 1
]

export const paymentStatusOptions = [
  { label: '所有付款狀態', value: null },
  { label: '待付款', value: 0 }, // 待付款
  { label: '已授權', value: 1 }, // 已授權
  { label: '已付款', value: 2 }, // 已付款
  { label: '已取消', value: 3 }, // 已取消
  { label: '請款失敗', value: 4 }, // 請款失敗
  { label: '已退款', value: 5 }, // 已退款
  { label: '部分退款', value: 6 }, // 部分退款
]

export const currencyOptions = [{ label: 'USD', value: 'usd' }]

export const paymentMethodOptions = [{ label: '信用卡', value: 'card' }]
