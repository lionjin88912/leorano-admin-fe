<template>
  <div v-if="data">
    <BreadCrumbs>
      <template #currentRoute>
        <q-breadcrumbs-el :label="data.title" :to="path" />
        <q-breadcrumbs-el :label="router.currentRoute.value.meta.title" />
      </template>
    </BreadCrumbs>
    <div class="row q-gutter-sm q-my-md">
      <q-btn-toggle v-model="reportTime" toggle-text-color="primary" toggle-color="white" color="grey-2" text-color="grey-7" :options="statisticsTypeOptions" class="report-toggle" unelevated />
      <q-field v-if="reportTime == 'year'" class="cursor-pointer col-2" v-model="selectedYear" label="報表年份" dense outlined>
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
		<q-table v-if="!loading && reportType == 'table'" :rows="datas" :columns="columns" class="report-table data-table" :pagination="pagination" flat bordered hide-pagination>
			<template v-slot:header-cell-group="props">
				<q-th class="row-group cell-sticky text-left">{{ props.col.label }}</q-th>
			</template>
			<template v-slot:header-cell-label>
				<q-th v-if="reportTime == 'year'" class="row-label cell-sticky text-left">{{ selectedYear }}</q-th>
				<q-th v-else class="row-label cell-sticky text-left"></q-th>
			</template>
      <template v-slot:body-cell-group="props">
				<q-td v-if="props.row.group" rowspan="2" class="row-group cell-sticky">
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
					<span>{{ getNumberFormat(props.row.year) }}</span>
				</q-td>
			</template>
    </q-table>
    <div v-if="!loading && reportType == 'chart'" class="q-pa-md">
      <apexchart ref="chartRef" height="480" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>

<script setup>
import { useQuasar, LocalStorage } from 'quasar'
import { ref, watch, computed, onMounted } from 'vue'
import { router } from 'src/router'
import { getPromoMembership, getPromoMembershipByMonth, getPromoMembershipLastWeek } from 'src/api'
import { statisticsLast5WeekColumns, statisticsYearColumns, reportTypeOptions, statisticsTypeOptions, statisticsLast5WeekDefaultData, statisticsYearDefaultData, statisticsLast5WeekChartOptions, statisticsYearChartOptions } from '../enums'
import { getDateString, getDateStringNoTz, getNumberFormat } from 'src/utils/helpers'
import apexchart from "vue3-apexcharts"
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import YearPicker from 'components/YearPicker.vue'
import XLSX from 'xlsx-js-style'
import to from 'await-to-js'

/* 取得 breadcrumb Start */
const $q = useQuasar();
const data = ref(null);
const getPromoMembershipData = async () => {
  const [err, res] = await to(getPromoMembership(router.currentRoute.value.params.promoMembershipId));
  if (err) {
    console.error(err);
    return;
  }
  data.value = res.data;
}
const path = computed(() => {
  return {
    name: 'PromotionMembershipCodeList',
    params: {
      promoMembershipId: data.value.id
    },
    state: {
      title: data.value.title,
      start: getDateString(data.value.start_date, 'YYYY-MM-DD'),
      end: getDateString(data.value.end_date, 'YYYY-MM-DD')
    }
  }
})
/* 取得 breadcrumb End */

/* 報表時間區間、類型 Start */
const reportTime = ref(['last5Week', 'year'].includes(router.currentRoute.value.params.reportTime)
  ? router.currentRoute.value.params.reportTime
  : (LocalStorage.getItem('reportTime') || 'last5Week'))
watch(reportTime, newVal => {
  LocalStorage.set('reportTime', newVal);
  router.push({ params: { reportTime: newVal } })
})
const reportType = ref(['table', 'chart'].includes(router.currentRoute.value.params.reportType)
  ? router.currentRoute.value.params.reportType
  : (LocalStorage.getItem('report') || 'table'))
watch(reportType, newVal => {
  LocalStorage.set('report', newVal);
  router.push({ params: { reportType: newVal }, query: router.currentRoute.value.query })
})
/* 報表時間區間、類型 End */

/* 報表年份 Start */
const selectedYear = ref(router.currentRoute.value.query.year || String(new Date().getFullYear()))
const changeSelectYear = (val) => {
  selectedYear.value = val
	yearDatas.value = JSON.parse(JSON.stringify(statisticsYearDefaultData))
  router.push({ query: { year: val } })
}
/* 報表年份 End */

const chartRef = ref()
const loading = ref(true)
onMounted(async () => {
  $q.loading.show();
  loading.value = true
  getPromoMembershipData();
  if (reportTime.value == 'last5Week') {
    await getLast5WeekPromoMembershipData()
    last5WeekChartOptions.value.xaxis.categories = last5WeekColumns.value.slice(2).map(col => col.label)
  } else {
    await getYearPromoMembershipData()
  }
  loading.value = false
  $q.loading.hide();
})

/* 取得報表資料 Start */
const getLast5WeekPromoMembershipData = async () => {
  const [err, res] = await to(getPromoMembershipLastWeek(router.currentRoute.value.params.promoMembershipId));
  if (err) {
    console.error(err);
    return;
  }
	res.data.forEach((data, index) => {
		last5WeekColumns.value.push({
			name: `week${index + 1}`,
			label: `${getDateStringNoTz(data.start_date, 'MM/DD')} - ${getDateStringNoTz(data.end_date, 'MM/DD')}`,
			align: 'right',
			field: (row) => row.hasOwnProperty(`week${index + 1}`) ? getNumberFormat(row[`week${index + 1}`]) : '-'
		})
		last5WeekDatas.value[0][`week${index + 1}`] = data.exchange.quantity
		last5WeekDatas.value[1][`week${index + 1}`] = data.exchange.cumulative
		last5WeekDatas.value[2][`week${index + 1}`] = data.register.quantity
		last5WeekDatas.value[3][`week${index + 1}`] = data.register.cumulative
		last5WeekDatas.value[4][`week${index + 1}`] = data.rate * 100
	})
}
const getYearPromoMembershipData = async () => {
  for (let i = 1; i <= 12; i++) {
    if (selectedYear.value == new Date().getFullYear() && i > new Date().getMonth() + 2) {
      break
    }
    await getMonthPromoMembershipData(i);
  }
}
const getMonthPromoMembershipData = async (m) => {
  const [err, res] = await to(getPromoMembershipByMonth(router.currentRoute.value.params.promoMembershipId, selectedYear.value, m));
  if (err) {
    console.error(err)
    return 
  }
  yearDatas.value[0][`month${m}`] = res.data.exchange.quantity
  yearDatas.value[1][`month${m}`] = res.data.exchange.cumulative
  yearDatas.value[2][`month${m}`] = res.data.register.quantity
  yearDatas.value[3][`month${m}`] = res.data.register.cumulative
  yearDatas.value[4][`month${m}`] = res.data.rate * 100
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
	return statisticsYearColumns
})
const datas = computed(() => {
	if (reportTime.value == 'last5Week') {
		return last5WeekDatas.value
	}
	return yearDatas.value
})
const last5WeekColumns = ref(JSON.parse(JSON.stringify(statisticsLast5WeekColumns)))
const last5WeekDatas = ref(statisticsLast5WeekDefaultData);
const yearDatas = ref(JSON.parse(JSON.stringify(statisticsYearDefaultData)));
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
    name: '兌換 數量',
    type: 'bar',
    data: Object.keys(last5WeekDatas.value[0]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[0][key])
  },
  {
    name: '兌換 累計',
    type: 'line',
    data: Object.keys(last5WeekDatas.value[1]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[1][key])
  },
  {
    name: '註冊 數量',
    type: 'bar',
    data: Object.keys(last5WeekDatas.value[2]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[2][key])
  },
  {
    name: '註冊 累計',
    type: 'line',
    data: Object.keys(last5WeekDatas.value[3]).filter(key => key.startsWith('week')).map(key => last5WeekDatas.value[3][key])
  }
])
const yearSeries = computed(() => [
  {
    name: '兌換 數量',
    type: 'bar',
    data: Object.keys(yearDatas.value[0]).filter(key => key.startsWith('month')).map(key => yearDatas.value[0][key])
  },
  {
    name: '兌換 累計',
    type: 'line',
    data: Object.keys(yearDatas.value[1]).filter(key => key.startsWith('month')).map(key => yearDatas.value[1][key])
  },
  {
    name: '註冊 數量',
    type: 'bar',
    data: Object.keys(yearDatas.value[2]).filter(key => key.startsWith('month')).map(key => yearDatas.value[2][key])
  },
  {
    name: '註冊 累計',
    type: 'line',
    data: Object.keys(yearDatas.value[3]).filter(key => key.startsWith('month')).map(key => yearDatas.value[3][key])
  }
])
const last5WeekChartOptions = ref(statisticsLast5WeekChartOptions)
const yearChartOptions = ref(statisticsYearChartOptions)
/* 圖表資料 End */

/* 導出 Excel Start */
const doExcelExport = async () => {
	if ($q.loading.isActive) {
    return;
  }

  $q.loading.show({ message: "導出Excel資料" });
  if (reportTime.value == 'year') {
    await getLast5WeekPromoMembershipData()
    last5WeekChartOptions.value.xaxis.categories = last5WeekColumns.value.slice(2).map(col => col.label)
  } else {
    await getYearPromoMembershipData()
  }
  $q.loading.hide();

  // 整理資料（近五週）
	let headers = last5WeekColumns.value.map(c => c.label);
  let excelDatas = last5WeekDatas.value.map(d => {
    return [
			d.group,
			d.label,
			d.week1 ? getNumberFormat(d.week1) : '',
			d.week2 ? getNumberFormat(d.week2) : '',
			d.week3 ? getNumberFormat(d.week3) : '',
			d.week4 ? getNumberFormat(d.week4) : '',
			d.week5 ? getNumberFormat(d.week5) : ''
		]
  });
  excelDatas = [headers, ...excelDatas];
  let ws = XLSX.utils.aoa_to_sheet(excelDatas);
  ws['!cols'] = headers.map(d => { return { wpx: 80 } });
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });
  ws["!merges"] = [
    XLSX.utils.decode_range("A2:A3"),
    XLSX.utils.decode_range("A4:A5")
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '近五週兌換報表');

  // 整理資料（全年）
  headers = statisticsYearColumns.map(c => c.label);
  headers[14] = selectedYear.value + '年累計';
  excelDatas = yearDatas.value.map(d => {
    return [
			d.group,
			d.label,
			d.month1 ? getNumberFormat(d.month1) : '',
			d.month2 ? getNumberFormat(d.month2) : '',
			d.month3 ? getNumberFormat(d.month3) : '',
			d.month4 ? getNumberFormat(d.month4) : '',
			d.month5 ? getNumberFormat(d.month5) : '',
			d.month6 ? getNumberFormat(d.month6) : '',
			d.month7 ? getNumberFormat(d.month7) : '',
			d.month8 ? getNumberFormat(d.month8) : '',
			d.month9 ? getNumberFormat(d.month9) : '',
			d.month10 ? getNumberFormat(d.month10) : '',
			d.month11 ? getNumberFormat(d.month11) : '',
			d.month12 ? getNumberFormat(d.month12) : ''
		]
  })
  excelDatas = [headers, ...excelDatas];
  ws = XLSX.utils.aoa_to_sheet(excelDatas); 
	ws['!cols'] = headers.map(d => { return { wpx: 80 } });
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });
  ws["!merges"] = [
    XLSX.utils.decode_range("A2:A3"),
    XLSX.utils.decode_range("A4:A5")
  ];

  XLSX.utils.book_append_sheet(wb, ws, `${selectedYear.value} 年兌換報表`);
  const filename = '兌換報表.xlsx';
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
	tbody tr:last-child .row-group {
		border-bottom-width: 0;
	}
}
</style>
