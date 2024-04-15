export interface MarketingNotify {
  id?: number | null
  title: string | null
  tag?: {
    id: number
    name: string
  }
  accept: {
    type: 'membership' | 'import' | 'users' | number
    data: any // 如果是會籍 直接帶值, 如果是 users 帶入user 的id 陣列, import 直接轉陣列
  }
  rule: {
    during: number | 3650 // 不拘帶3650
    conducts: string[] // all: 空陣列, login: 登入, booking: 訂房紀錄
  }
  date_range: {
    start_date?: string
    end_date?: string
  }
  frequency: number[]
  action_time?: string
  link: {
    path: string | null
    text?: string | null
    title?: string | null
  }
  has_notification: boolean
  content?: string
  langs?: any
  // 給清單使用
  status?: boolean
  no_repeat_click?: number
  total_click?: number
  send_total?: number
}
