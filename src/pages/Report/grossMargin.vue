<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="row q-gutter-sm q-my-md">
			<q-btn-toggle v-model="reportTime" toggle-text-color="primary" toggle-color="white" color="grey-2" text-color="grey-7" :options="grossMarginTypeOptions" class="report-toggle" unelevated />
      <q-field v-if="reportTime == 'byYear'" class="cursor-pointer col-2" v-model="selectedYear" label="報表年份" dense outlined>
        <template #default>
          <YearPicker :date="selectedYear" @updated="(val) => changeSelectYear(val)" />
        </template>
        <template v-slot:control>
          <div>{{ selectedYear }}</div>
        </template>
      </q-field>
      <q-space />
			<q-btn-toggle v-model="reportType" toggle-text-color="primary" toggle-color="white" color="grey-2" text-color="grey-7" :options="reportTypeOptions" class="report-toggle" unelevated>
				<template v-slot:table>
					<q-icon size="1.5em" name="table_chart" />
				</template>
				<template v-slot:chart>
					<q-icon size="1.5em" name="leaderboard" />
				</template>
			</q-btn-toggle>
      <q-btn label="導出 Excel" color="primary" @click="doExcelExport" unelevated></q-btn>
    </div>
    <q-inner-loading :showing="loading" label="Loading..." />
		<q-table v-if="!loading && reportType == 'table'" :rows="datas" :columns="columns" class="report-table data-table" :pagination="pagination" flat bordered hide-pagination>
			<template v-slot:header-cell-group="props">
				<q-th class="row-group cell-sticky text-left">{{ props.col.label }}</q-th>
			</template>
			<template v-slot:header-cell-label>
				<q-th v-if="reportTime == 'byYear'" class="row-label cell-sticky text-left">{{ selectedYear }}</q-th>
				<q-th v-else class="row-label cell-sticky text-left"></q-th>
			</template>
			<template v-slot:header-cell-year>
				<q-th class="text-right last-cell-sticky">{{ selectedYear }}年累計</q-th>
			</template>
      <template v-slot:body-cell-group="props">
				<q-td v-if="props.row.group" rowspan="5" class="row-group cell-sticky">
					<span>{{ props.row.group }}</span>
				</q-td>
      </template>
			<template v-slot:body-cell-label="props">
				<q-td class="row-label cell-sticky">
					<span>{{ props.row.label }}</span>	
				</q-td>
			</template>
			<template v-slot:body-cell-year="props">
				<q-td class="text-right last-cell-sticky">
					<span>{{ getCurrencyFormat(props.row.year) }}</span>
				</q-td>
			</template>
    </q-table>
    <div v-if="!loading && reportType == 'chart'" class="q-pa-md">
      <apexchart ref="chartRef" height="480" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar, LocalStorage } from 'quasar'
import { grossMarginLast5WeekColumns, grossMarginYearColumns, reportTypeOptions, grossMarginTypeOptions, grossMarginLast5WeekDefaultData, grossMarginYearDefaultData, grossMarginLast5WeekChartOptions, grossMarginYearChartOptions } from './enums'
import { getDateStringNoTz, getCurrencyFormat } from 'src/utils/helpers';
import { getGrossMargin, getGrossMarginLastWeek } from 'src/api'
import apexchart from "vue3-apexcharts"
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import YearPicker from 'components/YearPicker.vue'
import XLSX from 'xlsx-js-style'

/* 報表時間區間、類型 Start */
const reportTime = ref('last5Week')
watch(reportTime, newVal => {
  LocalStorage.set('reportTime', newVal);
})
const reportType = ref('table')
watch(reportType, newVal => {
  LocalStorage.set('report', newVal);
})
/* 報表時間區間、類型 End */

/* 報表年份 Start */
const selectedYear = ref(String(new Date().getFullYear()))
const changeSelectYear = (val) => {
  selectedYear.value = val
	yearDatas.value = JSON.parse(JSON.stringify(grossMarginYearDefaultData))
  getYearGrossMarginData()
}
/* 報表年份 End */

const chartRef = ref()
onMounted(async () => {
  loading.value = true
	reportType.value = LocalStorage.getItem('report') || 'table'
	reportTime.value = LocalStorage.getItem('reportTime') || 'last5Week'
	await getLast5WeekGrossMarginData()
	await getYearGrossMarginData()
  last5WeekChartOptions.value.xaxis.categories = last5WeekColumns.value.slice(2).map(col => col.label)
  loading.value = false
})

/* 取得報表資料 Start */
const loading = ref(true)
const getLast5WeekGrossMarginData = async () => {
  const res = await getGrossMarginLastWeek();
	res.data.forEach((data, index) => {
		last5WeekColumns.value.push({
			name: `week${index + 1}`,
			label: `${getDateStringNoTz(data.start_date, 'MM/DD')} - ${getDateStringNoTz(data.end_date, 'MM/DD')}`,
			align: 'right',
      field: (row) => row.hasOwnProperty(`week${index + 1}`) ? getCurrencyFormat(row[`week${index + 1}`]) : '-'
		})
		last5WeekDatas.value[0][`week${index + 1}`] = data.app_hotel.order_number
		last5WeekDatas.value[1][`week${index + 1}`] = data.app_hotel.room_night
		last5WeekDatas.value[2][`week${index + 1}`] = data.app_hotel.income
		last5WeekDatas.value[3][`week${index + 1}`] = data.app_hotel.gross_margin
		last5WeekDatas.value[4][`week${index + 1}`] = data.app_hotel.gross_margin_rate
		last5WeekDatas.value[5][`week${index + 1}`] = data.offline_hotel.order_number
		last5WeekDatas.value[6][`week${index + 1}`] = data.offline_hotel.room_night
		last5WeekDatas.value[7][`week${index + 1}`] = data.offline_hotel.income
		last5WeekDatas.value[8][`week${index + 1}`] = data.offline_hotel.gross_margin
		last5WeekDatas.value[9][`week${index + 1}`] = data.offline_hotel.gross_margin_rate
		last5WeekDatas.value[10][`week${index + 1}`] = data.other.order_number
		last5WeekDatas.value[11][`week${index + 1}`] = data.other.income
		last5WeekDatas.value[12][`week${index + 1}`] = data.other.gross_margin
		last5WeekDatas.value[13][`week${index + 1}`] = data.other.gross_margin_rate
	})
}
const getYearGrossMarginData = async () => {
  loading.value = true
  for (let i = 1; i <= 12; i++) {
    if (selectedYear.value == new Date().getFullYear() && i > new Date().getMonth() + 2) {
      break
    }
    await getMonthGrossMarginData(i);
  }
  loading.value = false
}
const getMonthGrossMarginData = async (m) => {
  const res = await getGrossMargin(selectedYear.value, m);
  yearDatas.value[0][`month${m}`] = res.data.app_hotel.order_number
  yearDatas.value[1][`month${m}`] = res.data.app_hotel.room_night
  yearDatas.value[2][`month${m}`] = res.data.app_hotel.income
  yearDatas.value[3][`month${m}`] = res.data.app_hotel.gross_margin
  yearDatas.value[4][`month${m}`] = res.data.app_hotel.gross_margin_rate
  yearDatas.value[5][`month${m}`] = res.data.offline_hotel.order_number
  yearDatas.value[6][`month${m}`] = res.data.offline_hotel.room_night
  yearDatas.value[7][`month${m}`] = res.data.offline_hotel.income
  yearDatas.value[8][`month${m}`] = res.data.offline_hotel.gross_margin
  yearDatas.value[9][`month${m}`] = res.data.offline_hotel.gross_margin_rate
	yearDatas.value[10][`month${m}`] = res.data.other.order_number
  yearDatas.value[11][`month${m}`] = res.data.other.income
  yearDatas.value[12][`month${m}`] = res.data.other.gross_margin
  yearDatas.value[13][`month${m}`] = res.data.other.gross_margin_rate

	yearDatas.value[0].year += res.data.app_hotel.order_number
  yearDatas.value[1].year += res.data.app_hotel.room_night
  yearDatas.value[2].year += res.data.app_hotel.income
  yearDatas.value[3].year += res.data.app_hotel.gross_margin
  yearDatas.value[4].year = yearDatas.value[2].year && yearDatas.value[3].year ? yearDatas.value[3].year / yearDatas.value[2].year * 100 : 0
  yearDatas.value[5].year += res.data.offline_hotel.order_number
  yearDatas.value[6].year += res.data.offline_hotel.room_night
  yearDatas.value[7].year += res.data.offline_hotel.income
  yearDatas.value[8].year += res.data.offline_hotel.gross_margin
  yearDatas.value[9].year = yearDatas.value[7].year && yearDatas.value[8].year ? yearDatas.value[8].year / yearDatas.value[7].year * 100 : 0
	yearDatas.value[10].year += res.data.other.order_number
  yearDatas.value[11].year += res.data.other.income
  yearDatas.value[12].year += res.data.other.gross_margin
  yearDatas.value[13].year = yearDatas.value[11].year && yearDatas.value[12].year ? yearDatas.value[12].year / yearDatas.value[11].year * 100 : 0
}
/* 取得報表資料 End */

/* 表格資料 Start */
const pagination = {
	rowsPerPage: 15
}
const columns = computed(() => {
	if (reportTime.value == 'last5Week') {
		return last5WeekColumns.value
	}
	return grossMarginYearColumns
})
const datas = computed(() => {
	if (reportTime.value == 'last5Week') {
		return last5WeekDatas.value
	}
	return yearDatas.value
})
const last5WeekColumns = ref(JSON.parse(JSON.stringify(grossMarginLast5WeekColumns)))
const last5WeekDatas = ref(grossMarginLast5WeekDefaultData);
const yearDatas = ref(JSON.parse(JSON.stringify(grossMarginYearDefaultData)));
/* 表格資料 End */

/* 圖表資料 Start */
const series = computed(() => {
	if (reportTime.value == 'last5Week') {
		return last5WeekSeries.value
	}
	return yearSeries.value
})
const chartOptions = computed(() => {
	if (reportTime.value == 'last5Week') {
		return last5WeekChartOptions.value
	}
	return yearChartOptions.value
})
const last5WeekSeries = computed(() => [
  {
    name: 'APP訂房 訂單數',
    type: 'line',
    data: Object.keys(last5WeekDatas.value[0]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[0][key])
  },
  {
    name: 'APP訂房 房晚數',
    type: 'area',
    data: Object.keys(last5WeekDatas.value[1]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[1][key])
  },
  {
    name: 'APP訂房 營業額',
    type: 'bar',
    data: Object.keys(last5WeekDatas.value[2]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[2][key])
  },
  {
    name: 'APP訂房 毛利',
    type: 'bar',
    data: Object.keys(last5WeekDatas.value[3]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[3][key])
  },
  {
    name: '線下訂房 訂單數',
    type: 'line',
    data: Object.keys(last5WeekDatas.value[5]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[5][key])
  },
  {
    name: '線下訂房 房晚數',
    type: 'area',
    data: Object.keys(last5WeekDatas.value[6]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[6][key])
  },
  {
    name: '線下訂房 營業額',
    type: 'bar',
    data: Object.keys(last5WeekDatas.value[7]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[7][key])
  },
  {
    name: '線下訂房 毛利',
    type: 'bar',
    data: Object.keys(last5WeekDatas.value[8]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[8][key])
  },
	{
    name: '其他服務 訂單數',
    type: 'line',
    data: Object.keys(last5WeekDatas.value[10]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[10][key])
  },
  {
    name: '其他服務 營業額',
    type: 'bar',
    data: Object.keys(last5WeekDatas.value[11]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[11][key])
  },
  {
    name: '其他服務 毛利',
    type: 'bar',
    data: Object.keys(last5WeekDatas.value[12]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[12][key])
  }
])
const yearSeries = computed(() => [
  {
    name: 'APP訂房 訂單數',
    type: 'line',
    data: Object.keys(yearDatas.value[0]).filter(key => key.startsWith('month')).map(key => yearDatas.value[0][key])
  },
  {
    name: 'APP訂房 房晚數',
    type: 'area',
    data: Object.keys(yearDatas.value[1]).filter(key => key.startsWith('month')).map(key => yearDatas.value[1][key])
  },
  {
    name: 'APP訂房 營業額',
    type: 'bar',
    data: Object.keys(yearDatas.value[2]).filter(key => key.startsWith('month')).map(key => yearDatas.value[2][key])
  },
  {
    name: 'APP訂房 毛利',
    type: 'bar',
    data: Object.keys(yearDatas.value[3]).filter(key => key.startsWith('month')).map(key => yearDatas.value[3][key])
  },
  {
    name: '線下訂房 訂單數',
    type: 'line',
    data: Object.keys(yearDatas.value[5]).filter(key => key.startsWith('month')).map(key => yearDatas.value[5][key])
  },
  {
    name: '線下訂房 房晚數',
    type: 'area',
    data: Object.keys(yearDatas.value[6]).filter(key => key.startsWith('month')).map(key => yearDatas.value[6][key])
  },
  {
    name: '線下訂房 營業額',
    type: 'bar',
    data: Object.keys(yearDatas.value[7]).filter(key => key.startsWith('month')).map(key => yearDatas.value[7][key])
  },
  {
    name: '線下訂房 毛利',
    type: 'bar',
    data: Object.keys(yearDatas.value[8]).filter(key => key.startsWith('month')).map(key => yearDatas.value[8][key])
  },
	{
    name: '其他服務 訂單數',
    type: 'line',
    data: Object.keys(yearDatas.value[10]).filter(key => key.startsWith('month')).map(key => yearDatas.value[10][key])
  },
  {
    name: '其他服務 營業額',
    type: 'bar',
    data: Object.keys(yearDatas.value[11]).filter(key => key.startsWith('month')).map(key => yearDatas.value[11][key])
  },
  {
    name: '其他服務 毛利',
    type: 'bar',
    data: Object.keys(yearDatas.value[12]).filter(key => key.startsWith('month')).map(key => yearDatas.value[12][key])
  }
])
const last5WeekChartOptions = ref(grossMarginLast5WeekChartOptions)
const yearChartOptions = ref(grossMarginYearChartOptions)
/* 圖表資料 End */

/* 導出 Excel Start */
const $q = useQuasar();
const doExcelExport = async () => {
	if ($q.loading.isActive) {
    return;
  }

  $q.loading.show({ message: "導出Excel資料" });
  $q.loading.hide();

  // 整理資料（近五週）
	let headers = last5WeekColumns.value.map(c => c.label);
  let excelDatas = last5WeekDatas.value.map(d => {
    return [
			d.group,
			d.label,
      d.week1 ? getCurrencyFormat(d.week1) : '',
      d.week2 ? getCurrencyFormat(d.week2) : '',
      d.week3 ? getCurrencyFormat(d.week3) : '',
      d.week4 ? getCurrencyFormat(d.week4) : '',
      d.week5 ? getCurrencyFormat(d.week5) : ''
		]
  });
  excelDatas = [headers, ...excelDatas];
  let ws = XLSX.utils.aoa_to_sheet(excelDatas);
  ws['!cols'] = headers.map(d => { return { wpx: 80 } });
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });
  ws["!merges"] = [
    XLSX.utils.decode_range("A2:A6"),
    XLSX.utils.decode_range("A7:A11"),
		XLSX.utils.decode_range("A12:A15")
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '近五週營業額報表');

  // 整理資料（全年）
  headers = grossMarginYearColumns.map(c => c.label);
  headers[14] = selectedYear.value + '年累計';
  excelDatas = yearDatas.value.map(d => {
    return [
			d.group,
			d.label,
      d.month1 ? getCurrencyFormat(d.month1) : '',
      d.month2 ? getCurrencyFormat(d.month2) : '',
      d.month3 ? getCurrencyFormat(d.month3) : '',
      d.month4 ? getCurrencyFormat(d.month4) : '',
      d.month5 ? getCurrencyFormat(d.month5) : '',
      d.month6 ? getCurrencyFormat(d.month6) : '',
      d.month7 ? getCurrencyFormat(d.month7) : '',
      d.month8 ? getCurrencyFormat(d.month8) : '',
      d.month9 ? getCurrencyFormat(d.month9) : '',
      d.month10 ? getCurrencyFormat(d.month10) : '',
      d.month11 ? getCurrencyFormat(d.month11) : '',
      d.month12 ? getCurrencyFormat(d.month12) : '',
			d.year ? getCurrencyFormat(d.year) : ''
		]
  })
  excelDatas = [headers, ...excelDatas];
  ws = XLSX.utils.aoa_to_sheet(excelDatas); 
	ws['!cols'] = headers.map(d => { return { wpx: 80 } });
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });
  ws["!merges"] = [
    XLSX.utils.decode_range("A2:A6"),
    XLSX.utils.decode_range("A7:A11"),
		XLSX.utils.decode_range("A12:A15")
  ];

  XLSX.utils.book_append_sheet(wb, ws, `${selectedYear.value} 年營業額報表`);
  const filename = '營業額報表.xlsx';
  XLSX.writeFileXLSX(wb, filename);
}
/* 導出 Excel End */
</script>

<style lang="scss" scoped>
.report-toggle {
	border: 1px solid $grey-5;
}
.report-table {
	.row-group {
		left: 0;
		width: 90px;
		border-width: 0 1px 1px 0;
	}
	.row-label {
		left: 90px;
	}
	.cell-sticky {
		position: sticky;
		z-index: 1;
		background-color: $light-blue-1;
		border-right-width: 1px;
	}
	.last-cell-sticky {
		position: sticky;
		right: 0;
		z-index: 1;
		background-color: $grey-1;
		border-left-width: 1px;
	}
	tr:nth-last-child(4) .row-group {
		border-bottom-width: 0;
	}
}
</style>
