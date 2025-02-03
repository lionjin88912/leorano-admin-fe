import { QTableProps } from 'quasar'
import { getNumberFormat } from 'src/utils/helpers';

export const gmvColumns: QTableProps['columns'] = [
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
    label: '一月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month1') ? getNumberFormat(row.month1) : '-'
  },
  {
    name: 'month2',
    label: '二月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month2') ? getNumberFormat(row.month2) : '-'
  },
  {
    name: 'month3',
    label: '三月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month3') ? getNumberFormat(row.month3) : '-'
  },
  {
    name: 'month4',
    label: '四月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month4') ? getNumberFormat(row.month4) : '-'
  },
  {
    name: 'month5',
    label: '五月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month5') ? getNumberFormat(row.month5) : '-'
  },
  {
    name: 'month6',
    label: '六月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month6') ? getNumberFormat(row.month6) : '-'
  },
  {
    name: 'month7',
    label: '七月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month7') ? getNumberFormat(row.month7) : '-'
  },
  {
    name: 'month8',
    label: '八月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month8') ? getNumberFormat(row.month8) : '-'
  },
  {
    name: 'month9',
    label: '九月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month9') ? getNumberFormat(row.month9) : '-'
  },
  {
    name: 'month10',
    label: '十月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month10') ? getNumberFormat(row.month10) : '-'
  },
  {
    name: 'month11',
    label: '十一月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month11') ? getNumberFormat(row.month11) : '-'
  },
  {
    name: 'month12',
    label: '十二月',
    align: 'right',
    field: (row: any) => row.hasOwnProperty('month12') ? getNumberFormat(row.month12) : '-'
  }
]

export const grossMarginLast5WeekColumns: QTableProps['columns'] = [
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

export const grossMarginYearColumns: QTableProps['columns'] = [
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
  },
  {
    name: 'year',
    label: '',
    align: 'right',
    field: 'year'
  }
]

export const consumptionColumns: QTableProps['columns'] = [
  {
    name: 'index',
    label: '排序',
    align: 'left',
    field: 'index'
  },
  {
    name: 'name',
    label: '姓名',
    align: 'left',
    field: 'name'
  },
  {
    name: 'total_amount',
    label: '金額(USD)',
    align: 'left',
    field: (row: any) => row.hasOwnProperty('total_amount') ? getNumberFormat(row.total_amount) : '-'
  }
]

export const reportTypeOptions = [
  {slot: 'table', value: 'table'},
  {slot: 'chart', value: 'chart'}
]

export const grossMarginTypeOptions = [
  {label: '近五週', value: 'last5Week'},
  {label: '指定年份', value: 'year'}
]

export const gmvDefaultData = [
  {
    group: 'GMV',
    label: '訂單數'
  },
  {
    group: '',
    label: '房晚數'
  },
  {
    group: '',
    label: '營業額 (USD)'
  },
  {
    group: 'Revenue',
    label: '訂單數'
  },
  {
    group: '',
    label: '房晚數'
  },
  {
    group: '',
    label: '營業額 (USD)'
  },
  {
    group: 'Commission',
    label: '金額 (USD)'
  }
]

export const grossMarginLast5WeekDefaultData = [
  {
    group: 'APP訂房',
    label: '訂單數'
  },
  {
    group: '',
    label: '房晚數'
  },
  {
    group: '',
    label: '營業額 (USD)'
  },
  {
    group: '',
    label: '毛利 (USD)'
  },
  {
    group: '',
    label: '毛利率 (%)'
  },
  {
    group: '線下訂房',
    label: '訂單數'
  },
  {
    group: '',
    label: '房晚數'
  },
  {
    group: '',
    label: '營業額 (USD)'
  },
  {
    group: '',
    label: '毛利 (USD)'
  },
  {
    group: '',
    label: '毛利率 (%)'
  },
	{
    group: '其他服務',
    label: '訂單數'
  },
  {
    group: '',
    label: '營業額 (USD)'
  },
  {
    group: '',
    label: '毛利 (USD)'
  },
  {
    group: '',
    label: '毛利率 (%)'
  }
]

export const grossMarginYearDefaultData = [
  {
    group: 'APP訂房',
    label: '訂單數',
    year: 0
  },
  {
    group: '',
    label: '房晚數',
    year: 0
  },
  {
    group: '',
    label: '營業額 (USD)',
    year: 0
  },
  {
    group: '',
    label: '毛利 (USD)',
    year: 0
  },
  {
    group: '',
    label: '毛利率 (%)',
    year: 0
  },
  {
    group: '線下訂房',
    label: '訂單數',
    year: 0
  },
  {
    group: '',
    label: '房晚數',
    year: 0
  },
  {
    group: '',
    label: '營業額 (USD)',
    year: 0
  },
  {
    group: '',
    label: '毛利 (USD)',
    year: 0
  },
  {
    group: '',
    label: '毛利率 (%)',
    year: 0
  },
	{
    group: '其他服務',
    label: '訂單數',
    year: 0
  },
  {
    group: '',
    label: '營業額 (USD)',
    year: 0
  },
  {
    group: '',
    label: '毛利 (USD)',
    year: 0
  },
  {
    group: '',
    label: '毛利率 (%)',
    year: 0
  }
]

export const gmvChartOptions = {
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
    categories: gmvColumns.slice(2).map(col => col.label)
  },
  yaxis: [
    {
    	seriesName: 'GMV 訂單數',
      title: {
        text: '數量'
      },
      labels: {
        formatter: (val: number) => {
        	return getNumberFormat(val)
        }
      }
    },
    {
    	seriesName: 'GMV 訂單數'
    },
    {
    	seriesName: 'GMV 營業額',
      title: {
        text: '金額 USD'
      },
      labels: {
        formatter: (val: number) => {
        	return `$${getNumberFormat(val)}`
        }
      },
      opposite: true
    },
    {
    	seriesName: 'GMV 訂單數'
    },
    {
    	seriesName: 'GMV 訂單數'
    },
    {
    	seriesName: 'GMV 營業額'
    },
    {
    	seriesName: 'GMV 營業額'
    }
  ],
  colors: ['#0288d1', '#bbdefb', '#64b5f6', '#689f38', '#c8e6c9', '#9ccc65', '#fbc02d'],
  stroke: {
    width: [3, 3, 4, 3, 3, 4, 4],
    curve: 'smooth',
    colors: ['#0288d1', '#bbdefb', 'transparent', '#689f38', '#c8e6c9', 'transparent', 'transparent']
  },
  plotOptions: {
    bar: {
      columnWidth: '50%',
    	borderRadius: 5,
    	borderRadiusApplication: 'end',
    }
  },
  fill: {
    opacity: [1, .1, 1, 1, .1, 1, 1]
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
        if ([2, 5, 6].includes(seriesIndex)) {
          return `$${getNumberFormat(y)}`
        }
        return getNumberFormat(y)
      }
    }
  }
}

export const grossMarginLast5WeekChartOptions = {
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
    	seriesName: 'APP訂房 訂單數',
      title: {
        text: '數量'
      },
      labels: {
        formatter: (val: number) => {
        	return getNumberFormat(val)
        }
      }
    },
    {
    	seriesName: 'APP訂房 訂單數'
    },
    {
    	seriesName: 'APP訂房 營業額',
      title: {
        text: '金額 USD'
      },
      labels: {
        formatter: (val: number) => {
        	return `$${getNumberFormat(val)}`
        }
      },
      opposite: true
    },
    {
    	seriesName: 'APP訂房 營業額'
    },
    {
    	seriesName: 'APP訂房 訂單數'
    },
    {
    	seriesName: 'APP訂房 訂單數'
    },
    {
    	seriesName: 'APP訂房 營業額'
    },
    {
    	seriesName: 'APP訂房 營業額'
    },
    {
    	seriesName: 'APP訂房 訂單數'
    },
    {
    	seriesName: 'APP訂房 營業額'
    },
    {
    	seriesName: 'APP訂房 營業額'
    }
  ],
  colors: ['#00838f', '#4dd0e1', '#00bcd4', '#b2ebf2', '#ef6c00', '#ffb74d', '#ff9800', '#ffe0b2', '#9c27b0', '#ba68c8', '#e1bee7'],
  stroke: {
    width: [3, 3, 1, 1, 3, 3, 1, 1, 3, 1, 1],
    curve: 'smooth',
    colors: ['#00838f', '#4dd0e1', 'transparent', 'transparent', '#ef6c00', '#ffb74d', 'transparent', 'transparent', '#9c27b0', 'transparent', 'transparent']
  },
  plotOptions: {
    bar: {
      columnWidth: '60%',
    	borderRadius: 4,
    	borderRadiusApplication: 'end',
    }
  },
  fill: {
    opacity: [1, .1, 1, 1, 1, .1, 1, 1, 1, 1, 1]
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
        if ([2, 3, 6, 7, 9, 10].includes(seriesIndex)) {
          return `$${getNumberFormat(y)}`
        }
        return getNumberFormat(y)
      }
    }
  }
}

export const grossMarginYearChartOptions = {
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
    categories: grossMarginYearColumns.slice(2, 13).map(col => col.label)
  },
  yaxis: [
    {
    	seriesName: 'APP訂房 訂單數',
      title: {
        text: '數量'
      },
      labels: {
        formatter: (val: number) => {
        	return getNumberFormat(val)
        }
      }
    },
    {
    	seriesName: 'APP訂房 訂單數'
    },
    {
    	seriesName: 'APP訂房 營業額',
      title: {
        text: '金額 USD'
      },
      labels: {
        formatter: (val: number) => {
        	return `$${getNumberFormat(val)}`
        }
      },
      opposite: true
    },
    {
    	seriesName: 'APP訂房 營業額'
    },
    {
    	seriesName: 'APP訂房 訂單數'
    },
    {
    	seriesName: 'APP訂房 訂單數'
    },
    {
    	seriesName: 'APP訂房 營業額'
    },
    {
    	seriesName: 'APP訂房 營業額'
    },
    {
    	seriesName: 'APP訂房 訂單數'
    },
    {
    	seriesName: 'APP訂房 營業額'
    },
    {
    	seriesName: 'APP訂房 營業額'
    }
  ],
  colors: ['#00838f', '#4dd0e1', '#00bcd4', '#b2ebf2', '#ef6c00', '#ffb74d', '#ff9800', '#ffe0b2', '#9c27b0', '#ba68c8', '#e1bee7'],
  stroke: {
    width: [3, 3, 1, 1, 3, 3, 1, 1, 3, 1, 1],
    curve: 'smooth',
    colors: ['#00838f', '#4dd0e1', 'transparent', 'transparent', '#ef6c00', '#ffb74d', 'transparent', 'transparent', '#9c27b0', 'transparent', 'transparent']
  },
  plotOptions: {
    bar: {
      columnWidth: '60%',
    	borderRadius: 4,
    	borderRadiusApplication: 'end',
    }
  },
  fill: {
    opacity: [1, .1, 1, 1, 1, .1, 1, 1, 1, 1, 1]
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
        if ([2, 3, 6, 7, 9, 10].includes(seriesIndex)) {
          return `$${getNumberFormat(y)}`
        }
        return getNumberFormat(y)
      }
    }
  }
}

export const consumptionYearChartOptions = {
  chart: {
    type: 'bar',
    toolbar: {
      show: false
    },
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    title: {
      text: '金額 USD'
    },
    categories: [],
    labels: {
      formatter: function (val:number) {
        return `$${getNumberFormat(val)}`
      }
    }
  },
  colors: ['#0277bd'],
  plotOptions: {
    bar: {
      barHeight: '20%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
      horizontal: true,
    }
  },
  tooltip: {
    shared: false,
    y: {
      formatter: function (val:number) {
        return `$${getNumberFormat(val)}`
      }
    }
  },
}

export const consumptionAllChartOptions = {
  chart: {
    type: 'bar',
    toolbar: {
      show: false
    },
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    title: {
      text: '金額 USD'
    },
    categories: [],
    labels: {
      formatter: function (val:number) {
        return `$${getNumberFormat(val)}`
      }
    }
  },
  colors: ['#0277bd'],
  plotOptions: {
    bar: {
      barHeight: '20%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
      horizontal: true,
    }
  },
  tooltip: {
    shared: false,
    y: {
      formatter: function (val:number) {
        return `$${getNumberFormat(val)}`
      }
    }
  },
}