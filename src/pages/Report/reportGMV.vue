<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="row q-gutter-sm q-my-md">
      <q-field class="cursor-pointer col-2" v-model="selectedYear" label="報表年份" dense outlined>
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
		<q-table v-if="!loading && reportType == 'table'" :rows="datas" :columns="gmvColumns" class="report-table data-table" :pagination="pagination" flat bordered hide-pagination>
			<template v-slot:header-cell-group="props">
				<q-th class="row-group cell-sticky text-left">{{ props.col.label }}</q-th>
			</template>
			<template v-slot:header-cell-label>
				<q-th class="row-label cell-sticky text-left">{{ selectedYear }}</q-th>
			</template>
      <template v-slot:body-cell-group="props">
				<q-td v-if="props.row.group" rowspan="3" class="row-group cell-sticky">
					<span>{{ props.row.group }}</span>
				</q-td>
      </template>
			<template v-slot:body-cell-label="props">
				<q-td class="row-label cell-sticky">
					<span>{{ props.row.label }}</span>	
				</q-td>
			</template>
    </q-table>
    <div v-if="!loading && reportType == 'chart'" class="q-pa-md">
      <apexchart height="480" :options="gmvChartOptions" :series="series" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar, LocalStorage } from 'quasar'
import { gmvColumns, reportTypeOptions, gmvDefaultData, gmvChartOptions } from './enums'
import { getCurrencyFormat } from 'src/utils/helpers';
import { getMonthGMV } from 'src/api'
import { router } from 'src/router'
import apexchart from "vue3-apexcharts"
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import YearPicker from 'components/YearPicker.vue'
import XLSX from 'xlsx-js-style'
import to from 'await-to-js'

/* 報表類型 Start */
const reportType = ref(['table', 'chart'].includes(router.currentRoute.value.params.reportType)
  ? router.currentRoute.value.params.reportType
  : (LocalStorage.getItem('report') || 'table'))

watch(reportType, newVal => {
  LocalStorage.set('report', newVal);
  router.push({ params: { reportType: newVal }, query: router.currentRoute.value.query })
})
/* 報表類型 End */

/* 報表年份 Start */
const selectedYear = ref(router.currentRoute.value.query.year || String(new Date().getFullYear()))
const changeSelectYear = (val) => {
  selectedYear.value = val
  datas.value = JSON.parse(JSON.stringify(gmvDefaultData))
  router.push({ query: { year: val } })
}
/* 報表年份 End */

onMounted(() => {
	getYearGMVData()
})

/* 取得報表資料 Start */
const loading = ref(false)
const getYearGMVData = async () => {
  loading.value = true
  for (let i = 1; i <= 12; i++) {
    if (selectedYear.value == new Date().getFullYear() && i > new Date().getMonth() + 2) {
      break
    }
    await getMonthGMVData(i);
  }
  loading.value = false
}
const getMonthGMVData = async (m) => {
  const [err, res] = await to(getMonthGMV(selectedYear.value, m)); // Wait for each getMonthGMV call to resolve
  if (err) {
    return console.error(err)
  }
  datas.value[0][`month${m}`] = res.data.GMV.order_number
  datas.value[1][`month${m}`] = res.data.GMV.room_night
  datas.value[2][`month${m}`] = res.data.GMV.income
  datas.value[3][`month${m}`] = res.data.revenue.order_number
  datas.value[4][`month${m}`] = res.data.revenue.room_night
  datas.value[5][`month${m}`] = res.data.revenue.income
  datas.value[6][`month${m}`] = res.data.commission
}
/* 取得報表資料 End */

/* 表格資料 Start */
const pagination = {
	rowsPerPage: 10
}
const datas = ref(JSON.parse(JSON.stringify(gmvDefaultData)));
/* 表格資料 End */

/* 圖表資料 Start */
const series = computed(() => [
  {
    name: 'GMV 訂單數',
    type: 'line',
    data: Object.keys(datas.value[0]).filter(key => key.startsWith('month')).map(key => datas.value[0][key])
  },
  {
    name: 'GMV 房晚數',
    type: 'area',
    data: Object.keys(datas.value[1]).filter(key => key.startsWith('month')).map(key => datas.value[1][key])
  },
  {
    name: 'GMV 營業額',
    type: 'bar',
    data: Object.keys(datas.value[2]).filter(key => key.startsWith('month')).map(key => datas.value[2][key])
  },
  {
    name: 'Revenue 訂單數',
    type: 'line',
    data: Object.keys(datas.value[3]).filter(key => key.startsWith('month')).map(key => datas.value[3][key])
  },
  {
    name: 'Revenue 房晚數',
    type: 'area',
    data: Object.keys(datas.value[4]).filter(key => key.startsWith('month')).map(key => datas.value[4][key])
  },
  {
    name: 'Revenue 營業額',
    type: 'bar',
    data: Object.keys(datas.value[5]).filter(key => key.startsWith('month')).map(key => datas.value[5][key])
  },
  {
    name: 'Commission',
    type: 'bar',
    data: Object.keys(datas.value[6]).filter(key => key.startsWith('month')).map(key => datas.value[6][key])
  }
])
/* 圖表資料 End */

/* 導出 Excel Start */
const $q = useQuasar();
const doExcelExport = async () => {
	if ($q.loading.isActive) {
    return;
  }

  $q.loading.show({ message: "導出Excel資料" });
  $q.loading.hide();

  // 整理資料
  let headers = gmvColumns.map(c => c.label);
  headers[1] = selectedYear.value;
  let excelDatas = datas.value.map(d => {
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
      d.month12 ? getCurrencyFormat(d.month12) : ''
    ]
  })
  excelDatas = [headers, ...excelDatas];
  const ws = XLSX.utils.aoa_to_sheet(excelDatas);
  ws['!cols'] = headers.map(d => { return { wpx: 80 } });
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });
  ws["!merges"] = [
    XLSX.utils.decode_range("A2:A4"),
    XLSX.utils.decode_range("A5:A7")
  ]

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${selectedYear.value} 年月進單對照報表`);
  const filename = `${selectedYear.value} 年月進單對照報表.xlsx`;
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
		width: 110px;
		border-width: 0 1px 1px 0;
	}
	.row-label {
		left: 110px;
	}
	.cell-sticky {
		position: sticky;
		z-index: 1;
		background-color: $light-blue-1;
		border-right-width: 1px;
	}
	tr:last-child .row-group:not(th) {
		border-bottom-width: 0;
	}
}
</style>
