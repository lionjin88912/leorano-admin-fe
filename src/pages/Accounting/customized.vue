<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="flex q-gutter-sm q-pb-sm q-my-md">
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
      <q-input v-model="filter.order_number" outlined dense label="訂單編號">
        <template v-slot:append>
          <q-icon class='cursor-pointer' name='search' />
        </template>
      </q-input>
      <q-space />
      <q-btn label="導出 Excel" color="primary" @click="doExcelExport"></q-btn>
    </div>
    <TableComponent ref="tableRef" :propsFilter='queryFilter' :columns="customizedColumns" :handleCallApi="getCustomizedAccountingList">
      <template v-slot:body-cell-order_number="props">
        <q-td class="link" @click="goDetail(props.row.id)">
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
import { getCustomizedAccountingList } from 'src/api'
import { customizedColumns } from './enums'
import XLSX from 'xlsx-js-style'
import { getDateString, getCurrencyFormat } from 'src/utils/helpers';
import to from 'await-to-js';

const filter = reactive({
  orderDuration: null,
  order_number: null,
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
  if (filter.orderDuration) {
    params.created_at_start = filter.orderDuration.from;
    params.created_at_end = filter.orderDuration.to;
  }
  if (filter.order_number) {
    params.order_number = filter.order_number;
  }
  return params;
}

const queryFilter = computed(() => {
  const params = getFilterParams();
  return Object.assign({}, params)
})

const goDetail = (orderNumber) => {
  router.push({ name: "CustomizedOrderDetail", params: { orderNumber } });
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
    "訂單編號", "訂單日期", "訂單金額", "實際利潤"
  ]
  let excelDatas = datas.map(d => {
    return [
      d.order_number,
      getDateString(d.order_date, 'YYYY-MM-DD'),
      d.price
        ? `${d.price.slice(0, 3)} ${getCurrencyFormat(d.price.slice(3))}`
        : '',
      d.final_profit
    ]
  })
  excelDatas = [headers, ...excelDatas];
  const ws = XLSX.utils.aoa_to_sheet(excelDatas);
  const wsCols = [
    { wpx: 120 }, { wpx: 80 }, { wpx: 100 }, { wpx: 100 }
  ]
  ws['!cols'] = wsCols;
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Customized Orders Accounting");
  const filename = `${getDateString(new Date(), "YYYY-MM-DD")}_customized_order_accounting.xlsx`;
  XLSX.writeFileXLSX(wb, filename);
}

async function loadExportData (datas, page) {
  const params = {
    page,
    limit: 50,
    ...queryFilter.value
  }
  const [err, res] = await to(getCustomizedAccountingList(params));

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