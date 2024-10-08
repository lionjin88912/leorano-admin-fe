<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="flex q-gutter-sm q-pb-sm q-my-md">
      <q-field class="cursor-pointer" style="min-width: 200px;" label="退房日期區間" :stack-label="filter.checkinDuration ? true : false" outlined dense>
        <template #default>
          <DatePicker :date="filter.checkinDuration" :range="true" @updated="(val) => filter.checkinDuration = val"></DatePicker>
        </template>
        <template v-slot:control>
          <div v-if="filter.checkinDuration && filter.checkinDuration.from">
            {{ filter.checkinDuration.from }} - {{ filter.checkinDuration.to }}
          </div>
        </template>
      </q-field>
      <q-field class="cursor-pointer" style="min-width: 200px;" label="訂單日期區間" :stack-label="filter.orderDuration ? true : false" outlined dense>
        <template #default>
          <DatePicker :date="filter.orderDuration" :range="true" @updated="(val) => filter.orderDuration = val"></DatePicker>
        </template>
        <template v-slot:control>
          <div v-if="filter.orderDuration && filter.orderDuration.from">
            {{ filter.orderDuration.from }} - {{ filter.orderDuration.to }}
          </div>
        </template>
      </q-field>
      <q-select v-model="filter.order_status" :options="hotelOrderStatusOptions" outlined dense />
      <q-input v-model="filter.order_number" outlined dense placeholder="訂單編號">
        <template v-slot:append>
          <q-icon class='cursor-pointer' name='search' />
        </template>
      </q-input>
      <q-space />
      <q-btn label="導出 Excel" color="primary" @click="doExcelExport"></q-btn>
    </div>
    <TableComponent ref="tableRef" :propsFilter='queryFilter' :columns="columns" :handleCallApi="getAccountingList">
      <template v-slot:body-cell-order_number="props">
        <q-td class="link" @click="goDetail(props.row.order_number)">
          {{ props.row.order_number }}
        </q-td>
      </template>
    </TableComponent>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { useQuasar, SessionStorage } from 'quasar';
import { router } from 'src/router'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import DatePicker from 'src/components/DatePicker.vue'
import TableComponent from 'src/components/TableComponent.vue'
import { getAccountingList } from 'src/api'
import { columns, hotelOrderStatusOptions } from './enums'
import XLSX from 'xlsx-js-style'
import { getDateString, getDateStringNoTz, getCurrencyFormat } from 'src/utils/helpers';
import to from 'await-to-js';

const filter = reactive({
  checkinDuration: null,
  orderDuration: null,
  order_number: null,
  order_status: hotelOrderStatusOptions[0],
})

watch(filter, (newVal) => {
  saveSearchFilter(newVal);
})

const filterStorageKey = 'accounting-filter';
const saveSearchFilter = (val) => {
  SessionStorage.set(filterStorageKey, val);
}

const restoreSearchFilter = () => {
  const savedFilter = SessionStorage.getItem(filterStorageKey);
  if (savedFilter) {
    for (const [key, value] of Object.entries(savedFilter)) {
      filter[key] = value;
    }
    SessionStorage.remove(filterStorageKey)
  }
}

const getFilterParams = () => {
  restoreSearchFilter();

  const params = {};
  if (filter.checkinDuration) {
    params.check_in_start = filter.checkinDuration.from;
    params.check_in_end = filter.checkinDuration.to;
  }
  if (filter.orderDuration) {
    params.created_at_start = filter.orderDuration.from;
    params.created_at_end = filter.orderDuration.to;
  }
  if (filter.order_number) {
    params.order_number = filter.order_number;
  }
  params.order_status = filter.order_status.value;
  return params;
}

const queryFilter = computed(() => {
  const params = getFilterParams();
  return Object.assign({}, params)
})

const goDetail = (orderNumber) => {
  router.push({ name: "HotelOrderDetail", params: { orderNumber } });
}

/* 導出 Excel Start */
const $q = useQuasar();
async function doExcelExport () {
  if ($q.loading.isActive) {
    return;
  }

  $q.loading.show({ message: "導出Excel資料" });
  let datas = [];
  await loadExportData(datas, 1);
  $q.loading.hide();

  // 整理資料
  const headers = [
    "訂單編號", "訂單日期", "訂單狀態", "預定退房日", "訂單金額", "實際利潤"
  ]
  let excelDatas = datas.map(d => {
    return [
      d.order_number,
      getDateString(d.order_date, 'YYYY-MM-DD'),
      hotelOrderStatusOptions.find(s => s.value === d.order_status)?.label,
      getDateStringNoTz(d.check_out, 'YYYY-MM-DD'),
      d.price
        ? `${d.price.slice(0, 3)} ${getCurrencyFormat(d.price.slice(3))}`
        : '',
      d.final_profit
    ]
  })
  excelDatas = [headers, ...excelDatas];
  const ws = XLSX.utils.aoa_to_sheet(excelDatas);
  const wsCols = [
    { wpx: 120 }, { wpx: 80 }, { wpx: 100 }, { wpx: 80 }, { wpx: 100 }, { wpx: 100 }
  ]
  ws['!cols'] = wsCols;
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hotel Orders Accounting");
  const filename = `${getDateString(new Date(), "YYYY-MM-DD")}_hotel_order_accounting.xlsx`;
  XLSX.writeFileXLSX(wb, filename);
}

async function loadExportData (datas, page) {
  const params = {
    page,
    limit: 50,
    ...queryFilter.value
  }
  const [err, res] = await to(getAccountingList(params));

  if (err) {
    console.error("getList error:", err);
    return;
  }

  datas.push(...res.data);
  if (res.paging.page >= res.paging.total_pages) {
    return;
  }
  await loadExportData(datas, res.paging.page + 1);
}
/* 導出 Excel End */
</script>