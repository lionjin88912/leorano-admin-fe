import { QTableProps } from 'quasar'
import { getDateString, getNumberFormat } from 'src/utils/helpers'

export const MembershipColumns: QTableProps['columns'] = [
  {
    name: 'title',
    label: '活動名稱',
    field: 'title',
    align: 'left',
  },
  {
    name: 'desc',
    label: '說明',
    field: 'desc',
    align: 'left',
  },
  {
    name: 'membership',
    label: '會籍',
    field: (row) => row.membership.title,
    align: 'center',
  },
  {
    name: 'discount',
    label: '優惠',
    field: (row) => `${row.value} ${row.unit === 'percent' ? '%' : 'USD'}`,
    align: 'center',
  },
  {
    name: 'note',
    label: '備註',
    field: (row) => row.note,
    align: 'left',
  },
  {
    name: 'duration',
    label: '有效期限',
    field: (row) =>
      `${getDateString(row.start_date, 'YYYY-MM-DD')} ～ ${getDateString(
        row.end_date,
        'YYYY-MM-DD'
      )}`,
    align: 'center',
    sortable: true,
  },
  {
    name: 'amount',
    label: '已註冊/失敗/總數',
    field: (row) => `${row.success_total}/${row.failed_total}/${row.total}`,
    align: 'center',
  },
  {
    name: 'operation',
    label: '操作',
    field: 'operation',
    align: 'center',
  },
  {
    name: 'status',
    label: '開/關',
    field: 'is_disable',
    align: 'center',
  },
]

export const CodeColumns: QTableProps['columns'] = [
  {
    name: 'sn',
    label: '#',
    field: 'sn',
    align: 'right',
  },
  {
    name: 'code',
    label: '邀請碼',
    field: 'code',
    align: 'left',
  },
  {
    name: 'register_date',
    label: '註冊日期',
    field: (row) => getDateString(row.register?.created_at, 'YYYY-MM-DD') || '-',
    align: 'center',
  },
  {
    name: 'status',
    label: '狀態',
    field: (row) => MmeberStatusOptions.find((d) => d.value === row.register?.verify)?.label || '-',
    align: 'center',
  },
  {
    name: 'title',
    align: 'left',
    label: '稱謂',
    field: (row) => row.register?.title || '-',
  },
  {
    name: 'username',
    label: '姓名',
    align: 'left',
    field: '',
  },
  {
    name: 'phone',
    label: '手機',
    align: 'left',
    field: '',
  },
  {
    name: 'email',
    label: '註冊Email',
    field: (row) => row.register?.email || '-',
    align: 'left',
  },
  {
    name: 'created_at',
    label: '建立時間',
    align: 'left',
    field: (row) => getDateString(row.created_at, 'YYYY-MM-DD HH:mm:ss'),
  },
]

export const InvitationCodeTabs: {
  text: string
  val: string | number | null
}[] = [
  { text: '全部', val: null },
  { text: '尚未開始', val: 0 },
  { text: '進行中', val: 1 },
  { text: '已過期', val: 2 },
]

export const StatusOptions: {
  label: string
  value: string | number | null
}[] = [
  { label: '全部效期', value: null },
  { label: '尚未開始', value: 'unstarted' },
  { label: '進行中', value: 'progress' },
  { label: '已過期', value: 'expired' },
]

export const EnabledOptions = [
  { label: '所有狀態', value: null },
  { label: '開啟中', value: true },
  { label: '已關閉', value: false },
]

export const MmeberStatusOptions = [
  { label: '未完成註冊', value: 0 },
  { label: '已使用', value: 1 },
  { label: '已使用', value: 2 },
  { label: '已使用', value: 3 },
  { label: '已使用', value: 4 },
  { label: '失敗', value: 5 },
  { label: '失敗', value: 6 },
]

export const statisticsLast5WeekColumns: QTableProps['columns'] = [
  {
    name: 'group',
    label: '項目',
    align: 'left',
    field: 'group'
  },
  {
    name: 'label',
    label: '',
    align: 'left',
    field: 'label'
  }
]

export const statisticsYearColumns: QTableProps['columns'] = [
  {
    name: 'group',
    label: '項目',
    align: 'left',
    field: 'group'
  },
  {
    name: 'label',
    label: '',
    align: 'left',
    field: 'label'
  },
  {
    name: 'month1',
    label: '一月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month1') ? getNumberFormat(row.month1) : '-'
  },
  {
    name: 'month2',
    label: '二月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month2') ? getNumberFormat(row.month2) : '-'
  },
  {
    name: 'month3',
    label: '三月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month3') ? getNumberFormat(row.month3) : '-'
  },
  {
    name: 'month4',
    label: '四月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month4') ? getNumberFormat(row.month4) : '-'
  },
  {
    name: 'month5',
    label: '五月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month5') ? getNumberFormat(row.month5) : '-'
  },
  {
    name: 'month6',
    label: '六月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month6') ? getNumberFormat(row.month6) : '-'
  },
  {
    name: 'month7',
    label: '七月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month7') ? getNumberFormat(row.month7) : '-'
  },
  {
    name: 'month8',
    label: '八月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month8') ? getNumberFormat(row.month8) : '-'
  },
  {
    name: 'month9',
    label: '九月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month9') ? getNumberFormat(row.month9) : '-'
  },
  {
    name: 'month10',
    label: '十月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month10') ? getNumberFormat(row.month10) : '-'
  },
  {
    name: 'month11',
    label: '十一月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month11') ? getNumberFormat(row.month11) : '-'
  },
  {
    name: 'month12',
    label: '十二月累計',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month12') ? getNumberFormat(row.month12) : '-'
  }
]

export const reportTypeOptions = [
  {slot: 'table', value: 'table'},
  {slot: 'chart', value: 'chart'}
]

export const statisticsTypeOptions = [
  {label: '近五週', value: 'last5Week'},
  {label: '指定年份', value: 'year'},
  {label: '指定區間', value: 'duration'},
]

export const statisticsLast5WeekDefaultData = [
  {
    group: '兌換',
    label: '數量'
  },
  {
    group: '',
    label: '累計'
  },
  {
    group: '註冊',
    label: '數量'
  },
  {
    group: '',
    label: '累計'
  },
  {
    group: '兌換註冊比率',
    label: '比例 (%)'
  }
]

export const statisticsYearDefaultData = [
  {
    group: '兌換',
    label: '數量',
    year: 0
  },
  {
    group: '',
    label: '累計',
    year: 0
  },
  {
    group: '註冊',
    label: '數量',
    year: 0
  },
  {
    group: '',
    label: '累計',
    year: 0
  },
  {
    group: '兌換註冊比率',
    label: '比例 (%)',
    year: 0
  }
]

export const statisticsLast5WeekChartOptions = {
  chart: {
    stacked: false,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false,
    }
  },
  xaxis: {
    categories: []
  },
  yaxis: [
    {
      seriesName: '數量',
      title: {
        text: '數量'
      },
      labels: {
        formatter: (val: number) => {
          return getNumberFormat(val)
        }
      }
    }
  ],
  colors: ['#80cbc4', '#029688', '#ef9a9a', '#f44335'],
  stroke: {
    width: [3, 3.5, 3, 3.5],
    curve: 'smooth',
    colors: ['transparent', '#029688', 'transparent', '#f44335']
  },
  plotOptions: {
    bar: {
      columnWidth: '10%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
    }
  },
  fill: {
    opacity: [1, 1, 1, 1]
  },
  markers: {
    size: 0
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (y: number, { seriesIndex }: { seriesIndex: number }) {
        return getNumberFormat(y)
      }
    }
  }
}

export const statisticsYearChartOptions = {
  chart: {
    stacked: false,
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false,
    }
  },
  xaxis: {
    categories: statisticsYearColumns.slice(2, 13).map(col => col.label)
  },
  yaxis: [
    {
      seriesName: '數量',
      title: {
        text: '數量'
      },
      labels: {
        formatter: (val: number) => {
          return getNumberFormat(val)
        }
      }
    }
  ],
  colors: ['#80cbc4', '#029688', '#ef9a9a', '#f44335'],
  stroke: {
    width: [3, 3.5, 3, 3.5],
    curve: 'smooth',
    colors: ['transparent', '#029688', 'transparent', '#f44335']
  },
  plotOptions: {
    bar: {
      columnWidth: '20%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
    }
  },
  fill: {
    opacity: [1, 1, 1, 1]
  },
  markers: {
    size: 0
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left'
  },
  dataLabels: {
    enabled: false
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (y: number, { seriesIndex }: { seriesIndex: number }) {
        return getNumberFormat(y)
      }
    }
  }
}