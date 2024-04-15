/* eslint-disable  @typescript-eslint/no-explicit-any */

import { getDateString } from 'src/utils/helpers'

interface TabModel {
  label: string
  value: string
}

type TabList = TabModel[]

export const tabList: TabList = [
  {
    value: 'country',
    label: '國家管理',
  },
  {
    value: 'city',
    label: '城市管理',
  },
]

export const countryColumns = [
  {
    name: 'name',
    label: '國家名稱',
    field: 'name',
    align: 'left',
  },
  {
    name: 'code',
    label: '簡碼',
    field: 'code',
    align: 'center',
  },
  {
    name: 'currency_name',
    label: '貨幣名稱',
    field: 'currency_name',
    align: 'left',
  },
  {
    name: 'phone_prefix',
    label: '國家地區代碼',
    field: 'phone_prefix',
    align: 'left',
  },
  {
    name: 'capital_name',
    label: '首都',
    field: 'capital_name',
    align: 'left',
  },
  {
    name: 'number_of_hotels',
    label: '酒店數量',
    field: 'number_of_hotels',
    align: 'left',
  },
  {
    name: 'updated_at',
    label: '更新時間',
    field: (row: any) => getDateString(row.updated_at, 'YYYY-MM-DD HH:mm'),
    align: 'left',
  },
  {
    name: 'desc',
    label: '備註',
    field: 'desc',
    align: 'left',
  },
  {
    name: 'actions',
    label: '動作',
    align: 'center',
  },
]

export const cityColumns = [
  {
    name: 'name',
    label: '城市名稱',
    field: 'name',
    align: 'left',
  },
  {
    name: 'code',
    label: '簡碼',
    field: 'code',
    align: 'center',
  },
  {
    name: 'country',
    label: '國家',
    field: 'country',
    align: 'left',
  },
  {
    name: 'tz',
    label: '時區',
    field: 'tz',
    align: 'left',
  },
  {
    name: 'number_of_hotels',
    label: '酒店數量',
    field: 'number_of_hotels',
    align: 'left',
  },
  {
    name: 'updated_at',
    label: '更新時間',
    field: (row: any) => getDateString(row.updated_at, 'YYYY-MM-DD HH:mm'),
    align: 'left',
  },
  {
    name: 'desc',
    label: '備註',
    field: 'desc',
    align: 'left',
  },
  {
    name: 'actions',
    label: '動作',
    align: 'center',
  },
]
