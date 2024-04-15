/* eslint-disable  @typescript-eslint/no-explicit-any */

import { getDateString } from 'src/utils/helpers'

interface TabModel {
  name: string
  label: string
}

type TabList = TabModel[]

const tabList: TabList = [
  {
    name: 'tag-type',
    label: '標籤類別管理',
  },
  {
    name: 'tag',
    label: '標籤管理',
  },
]

const typeColumns = [
  {
    name: 'name',
    label: '名稱',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'code',
    label: 'Code',
    field: 'code',
    align: 'left',
  },
  {
    name: 'note',
    label: '備註',
    field: 'note',
    align: 'left',
  },
  {
    name: 'created_at',
    label: '建立時間',
    field: (row: any) => getDateString(row.created_at),
    align: 'left',
  },
  {
    name: 'updated_at',
    label: '更新時間',
    field: (row: any) => getDateString(row.updated_at),
    align: 'left',
  },
  {
    name: 'actions',
    label: '動作',
    align: 'center',
  },
]

const tagColumns = [
  {
    name: 'name',
    label: '名稱',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'type',
    label: '類型',
    field: (row: any) => row.tag_type.name,
    align: 'left',
  },
  {
    name: 'note',
    label: '備註',
    field: 'note',
    align: 'left',
  },
  {
    name: 'created_at',
    label: '建立時間',
    field: (row: any) => getDateString(row.created_at),
    align: 'left',
  },
  {
    name: 'updated_at',
    label: '更新時間',
    field: (row: any) => getDateString(row.updated_at),
    align: 'left',
  },
  {
    name: 'actions',
    label: '動作',
    align: 'center',
  },
]

export { tabList, typeColumns, tagColumns }
