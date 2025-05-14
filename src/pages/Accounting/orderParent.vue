<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="filter flex column q-my-md">
      <div class="flex q-gutter-sm q-pb-sm">
        <q-field class="cursor-pointer filter-date" label="立帳日期"
          :stack-label="filter.checkinDuration ? true : false" outlined dense>
          <template #default>
            <DatePicker :date="filter.checkinDuration" :range="true" @updated="(val) => filter.checkinDuration = val">
            </DatePicker>
          </template>
          <template v-slot:control>
            <div v-if="filter.checkinDuration && filter.checkinDuration.from">
              {{ filter.checkinDuration.from }} - {{ filter.checkinDuration.to }}
            </div>
          </template>
        </q-field>
        <q-input v-model="filter.text" placeholder="請依類型輸入訂單編號" :debounce="500" outlined dense>
          <template v-slot:append>
            <q-icon class='cursor-pointer' name='search' @click="doSearch" />
          </template>
        </q-input>
        <q-space></q-space>
        <div class="flex q-gutter-sm">
          <q-btn label="導出Excel" color="primary" @click="doExcelExport" unelevated></q-btn>
        </div>
      </div>
    </div>
    <q-table :rows="rows" :columns="orderColumns" row-key="order_number" class="data-table" @request="loadData" :loading="state.loading" v-model:pagination="state.pagination" :rows-per-page-options="state.pagination.perPages" no-data-label='無訂單資料' binary-state-sort flat bordered>
      <template v-slot:body-cell-order_number="props">
        <q-td :props="props">
          <router-link :to="{ name: 'AccountingBookingDetail', params: { orderNumber: props.row.order_number } }" class="text-primary cursor-pointer ellipsis">
            {{ props.row.order_number }}
          </router-link>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { useQuasar, SessionStorage } from 'quasar';
import { ref, reactive, watch, computed } from 'vue'
import { router } from 'src/router'
import { getOrderList } from 'src/api'
import { orderColumns, orderBookingWayOptions, orderTypeOptions } from './enums';
import DatePicker from 'src/components/DatePicker.vue'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import XLSX from 'xlsx-js-style'
import { getDateString, getDateStringNoTz, getNumberFormat, getCurrencyPriceFormat } from 'src/utils/helpers';
import { useMetaStore } from 'src/stores/meta';
import to from 'await-to-js';
import _ from 'lodash'

const $q = useQuasar();
const metaStore = useMetaStore()
const state = reactive({
  loading: false,
  pagination: {
    sortBy: 'created_at',
    descending: true,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0, // 初始化 rowsNumber
    perPages: [10, 20, 50],
  }
});
const rows = ref([]);

const filter = reactive({
  text: router.currentRoute.value.query.keyword || null,
  checkinDuration: router.currentRoute.value.query.check_in_start && router.currentRoute.value.query.check_in_end 
    ? {
      from: router.currentRoute.value.query.check_in_start,
      to: router.currentRoute.value.query.check_in_end
    } : null
})

const doSearch = () => {
  loadData({ pagination: state.pagination });
}

const loadData = async ({ pagination }) => {
  if (state.loading) {
    return;
  }
  state.loading = true;
  rows.value = [];

  // pagination
  state.pagination.rowsPerPage = pagination.rowsPerPage;
  state.pagination.page = pagination.page;
  state.pagination.sortBy = pagination.sortBy;
  state.pagination.descending = pagination.descending;

  // 搜尋條件
  const params = {
    page: pagination.page,
    limit: pagination.rowsPerPage,
    sort: pagination.descending ? "desc" : "asc",
    orderBy: pagination.sortBy,
    ...getFilterParams()
  };

  /*
  const [err, res] = await to(getOrderList(params));

  state.loading = false;
  if (err) {
    console.error("getList error:", err);
    return;
  }
  */
  // tmp start
  let res = {
    "code": 0,
    "message": "Success",
    "data": [
      {
        "order_number": "H24041807230525-uat",
        "revenue": 20,
        "expense": 0,
        "received": 20,
        "paid": 0,
      },
      {
        "order_number": "C25032102523776",
        "revenue": 360,
        "expense": 300,
        "received": 200,
        "paid": 300,
      },
      {
        "order_number": "C25032702461510",
        "revenue": 1379,
        "expense": 1200,
        "received": 0,
        "paid": 300,
      }
    ],
    "paging": {
      "limit": 10,
      "page": 1,
      "sort": "created_at desc",
      "total_rows": 9,
      "total_pages": 1
    }
  }
  res.data = await calcSummary(res.data);
  state.loading = false;
  // tmp end
  state.pagination.rowsNumber = res.paging.total_rows;
  rows.value = res.data;
}

// 計算 missing, profit, profit_rate
// 毛利、毛利率：有 received 用 received 計算，沒有用 revenue 計算。有 paid 用 paid 計算，沒有用 expense 計算
const calcSummary = data => {
  return data.map(d => {
    let revenue = d.received || d.revenue;
    let expense = d.paid || d.expense;
    d.profit = 0;
    d.profit_rate = 0;
    if (expense) {
      d.profit = revenue - expense;
      d.profit_rate = d.profit / expense * 100;
    } else if (revenue) {
      d.profit = revenue;
      d.profit_rate = 100;
    }
    d.missing = d.revenue - d.received;
    return d;
  })
} 

const loadExportData = async (datas, page) => {
  // 搜尋條件
  const params = {
    page: page,
    limit: 50,
    sort: state.pagination.descending ? "desc" : "asc",
    orderBy: state.pagination.sortBy,
    ...getFilterParams()
  };

  const [err, res] = await to(getOrderList(params));

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

const getFilterParams = () => {
  const params = {};
  if (filter.text && filter.text.trim().length > 0) {
    params[currentTextType.value.value] = filter.text;
  }
  if (filter.checkinDuration) {
    params.check_in_start = `${filter.checkinDuration.from} 00:00:00`;
    params.check_in_end = `${filter.checkinDuration.to} 23:59:59`;
  }
  return params;
}

const doExcelExport = async () => {
  if ($q.loading.isActive) {
    return;
  }

  $q.loading.show({ message: "導出Excel資料" });
  let datas = [];
  await loadExportData(datas, 1);
  $q.loading.hide();

  // 整理資料
  const headers = [
    "訂單日期", "訂單類型", "訂單名稱", "預定方式", "訂單編號",
    "確認編號", "取消編號", "憑證編號", "開始時間", "結束時間", "訂單狀態", "訂購人",
    "訂購人Email"
  ]
  let excelDatas = datas.map(d => d.subs).flat().map(d => {
    return [
      getDateString(d.created_at, 'YYYY-MM-DD mm:ss'),
      orderTypeOptions.find(s => s.value === d.type)?.label,
      d.order_name,
      orderBookingWayOptions.find(s => s.value === d.booking_way)?.label,
      d.order_number,
      (d.booking_confirm_code || []).join(','),
      (d.cancel_confirm_code || []).join(','),
      d.voucher,
      getDateStringNoTz(d.start_date, 'YYYY-MM-DD'),
      getDateStringNoTz(d.end_date, 'YYYY-MM-DD'),
      `${d.user.first_name} ${d.user.last_name}`,
      d.user.email
    ]
  })
  excelDatas = [headers, ...excelDatas];
  const ws = XLSX.utils.aoa_to_sheet(excelDatas);
  const wsCols = [
    { wpx: 120 }, { wpx: 120 }, { wpx: 120 }, { wpx: 80 }, { wpx: 100 },
    { wpx: 160 }, { wpx: 80 }, { wpx: 80 }, { wpx: 100 }, { wpx: 100 }, { wpx: 120 },
    { wpx: 200 },
  ]
  ws['!cols'] = wsCols;
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Orders");
  const filename = `${getDateString(new Date(), "YYYY-MM-DD")}_訂單列表.xlsx`;
  XLSX.writeFileXLSX(wb, filename);
}

watch(filter, (newVal) => {
  let query = { ...router.currentRoute.value.query };
  if (newVal.text) {
    query.keyword = newVal.text;
  } else {
    delete query.keyword;
  }
  if (newVal.checkinDuration) {
    query.check_in_start = newVal.checkinDuration.from;
    query.check_in_end = newVal.checkinDuration.to;
  } else {
    delete query.check_in_start;
    delete query.check_in_end;
  }
  router.push({ query });
})

doSearch();

</script>

<style lang="scss" scoped>
.filter {
  .filter-date {
    min-width: 200px;
  }
}
</style>
