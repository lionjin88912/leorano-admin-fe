<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="row q-gutter-sm q-my-md">
      <q-space />
      <q-btn-toggle v-model="reportType" toggle-text-color="primary" toggle-color="white" color="grey-2" text-color="grey-7" :options="reportTypeOptions" class="report-toggle" unelevated>
        <template v-slot:table>
          <q-icon size="1.5em" name="table_chart" />
        </template>
        <template v-slot:chart>
          <q-icon size="1.5em" name="leaderboard" />
        </template>
      </q-btn-toggle>
      <q-btn label="下載完整資料" color="primary" @click="doExcelExport" unelevated></q-btn>
    </div>
    <div class="row q-col-gutter-xl">
      <div class="col-6">
        <div class="row items-center q-gutter-sm q-mb-sm">
          <q-field class="cursor-pointer col-2" v-model="selectedYear" label="報表年份" dense outlined>
            <template #default>
              <YearPicker :date="selectedYear" @updated="(val) => changeSelectYear(val)" />
            </template>
            <template v-slot:control>
              <div>{{ selectedYear }}</div>
            </template>
          </q-field>
          <h6>Top10</h6>
        </div>
        <q-table v-if="!loading && reportType == 'table'" :rows="datas.year" :columns="consumptionColumns" class="report-table data-table" :pagination="pagination" flat bordered hide-pagination>
        </q-table>
        <div v-if="!loading && reportType == 'chart'">
          <apexchart height="420" :options="chartOptions.year" :series="series.year" />
        </div>
      </div>
      <div class="col-6">
        <h6 class="q-my-sm">總金額 Top10</h6>
        <q-table v-if="!loading && reportType == 'table'" :rows="datas.all" :columns="consumptionColumns" class="report-table data-table" :pagination="pagination" flat bordered hide-pagination>
        </q-table>
        <div v-if="!loading && reportType == 'chart'">
          <apexchart height="420" :options="chartOptions.all" :series="series.all" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LocalStorage } from 'quasar'
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { reportTypeOptions, consumptionColumns, consumptionYearChartOptions, consumptionAllChartOptions } from './enums'
import { getConsumption } from 'src/api'
import { router } from 'src/router'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import YearPicker from 'components/YearPicker.vue'
import apexchart from "vue3-apexcharts"
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
  router.push({ query: { year: val } })
}
/* 報表年份 End */

onMounted(async () => {
  await doSearch()
  chartOptions.year.xaxis.categories = datas.year.slice(0, 10).map(item => item.name)
  chartOptions.all.xaxis.categories = datas.all.slice(0, 10).map(item => item.name)
})

/* 取得會員消費 Start */
const loading = ref(false)
const datas = reactive({
  year: [],
  all: []
})
const doSearch = async () => {
  loading.value = true
  const [err, res] = to(await getConsumption(selectedYear.value))
  if (err) {
    return
  }
  datas.year = res.data.year
  datas.all = res.data.all
  loading.value = false
}
/* 取得會員消費 End */

/* 表格資料 Start */
const pagination = {
  rowsPerPage: 10
}
/* 表格資料 End */

/* 圖表資料 Start */
const chartOptions = reactive({
  year: consumptionYearChartOptions,
  all: consumptionAllChartOptions
})
const series = computed(() => {
  return {
    year: [{
      name: '',
      data: datas.year.slice(0, 10).map(item => item.total_amount)
    }],
    all: [{
      name: '',
      data: datas.all.slice(0, 10).map(item => item.total_amount)
    }]
  }
})
/* 圖表資料 End */

/* 下載完整資料 Start */
const doExcelExport = () => {
  // 取得 header
	let headers = consumptionColumns.map(c => c.label);
  let SHEET_TITLE = {
    year: `${selectedYear.value}年`,
    all: `總金額`
  };

  // 整理資料（年度、總金額）
  const wb = XLSX.utils.book_new();
  for (const [key, groupData] of Object.entries(datas)) {
    let excelDatas = groupData.map(item => {
      return [
        item.id,
        item.name,
        item.total_amount
      ]
    })
    excelDatas = [headers, ...excelDatas];
    let ws = XLSX.utils.aoa_to_sheet(excelDatas);
    ws['!cols'] = headers.map(d => { return { wpx: 80 } });
    ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });

    XLSX.utils.book_append_sheet(wb, ws, SHEET_TITLE[key]);
  }

  XLSX.writeFileXLSX(wb, '會員消費報表.xlsx');
}
/* 下載完整資料 End */
</script>

<style lang="scss" scoped>
.report-toggle {
	border: 1px solid $grey-5;
}
</style>