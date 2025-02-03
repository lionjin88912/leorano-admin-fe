<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class='flex column q-my-md'>
      <div class="flex q-gutter-sm q-pb-sm">
        <q-select v-model="currentTextType" :options="textTypeOptions" outlined dense></q-select>
        <q-input v-model="filter.text" outlined dense :debounce="500" placeholder="請依類型輸入關鍵字">
          <template v-slot:append>
            <q-icon class='cursor-pointer' name='search' @click="doSearch" />
          </template>
        </q-input>
      </div>
      <div class="flex q-gutter-sm">
        <q-field class="cursor-pointer" style="min-width: 200px;" label="入住日期區間"
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
        <q-field class="cursor-pointer" style="min-width: 200px;" label="訂單日期區間"
          :stack-label="filter.orderDuration ? true : false" outlined dense>

          <template #default>
            <DatePicker :date="filter.orderDuration" :range="true" @updated="(val) => filter.orderDuration = val">
            </DatePicker>
          </template>

          <template v-slot:control>
            <div v-if="filter.orderDuration && filter.orderDuration.from">
              {{ filter.orderDuration.from }} - {{ filter.orderDuration.to }}
            </div>
          </template>
        </q-field>
        <q-select v-model="filter.status" :options="hotelOrderStatusOptions" outlined dense></q-select>
        <q-space></q-space>
        <div class="flex items-center justify-end q-gutter-sm">
          <q-btn label="新增訂單" color="primary" @click="goHotelSearch"></q-btn>
          <q-btn label="導出Excel" color="primary" @click="doExcelExport"></q-btn>
        </div>
      </div>
    </div>
    <q-table class="data-table" :columns='hotelColumns' :rows="rows" @request="loadData" :loading="state.loading"
      v-model:pagination="state.pagination" :rows-per-page-options="state.pagination.perPages" binary-state-sort flat
      bordered no-data-label='無酒店訂單資料'>

      <template v-slot:body-cell-order_number="props">
        <q-td class="link" @click="goDetail(props.row.order_number)">
          {{ props.row.order_number }}
        </q-td>
      </template>

      <template v-slot:body-cell-booking_code="props">
        <q-td>
          <div class="flex column">
            <div v-if="props.row.booking_confirm_code" class="flex no-wrap">
              <div class="q-pr-sm text-bold">確認編號</div>
              <div class="text-primary">
                <div v-for="(data, index) of (props.row.booking_confirm_code || [])" :key="index">
                  {{ data }}
                </div>
              </div>
            </div>
            <div v-if="props.row.cancel_confirm_code" class="flex no-wrap">
              <div class="q-pr-sm text-bold">取消編號</div>
              <div class="text-negative">
                <div v-for="(data, index) of (props.row.cancel_confirm_code || [])" :key="index">
                  {{ data }}
                </div>
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td align="center">
          <div>{{ hotelOrderStatusOptions.find((d) => d.value === props.row.status)?.label }}</div>
          <div v-if="props.row.status === 'cancelled'" class="text-grey-5">
            {{ getDateString(props.row.cancelled_at, 'YYYY-MM-DD HH:mm') }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-total_price="props">
        <q-td>
          <div v-if="props.row.total_price" class="text-grey-7">
            <div>{{ props.row.usd_total_price }}</div>
            <div>{{ getCurrencyPriceFormat(props.row.total_price) }}</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-user="props">
        <q-td class="cursor-pointer" @click="goMember(props.row.user_id)">
          <div class="text-bold text-primary">
            {{ props.row.user.first_name }} {{ props.row.user.last_name }}
          </div>
          <div class="text-md text-grey-7">{{ props.row.user.email }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-final_profit="props">
        <td class="cursor-pointer" @click="doEditProfit(props.row)">
          <div class="text-primary">
            {{ getCurrencyPriceFormat(props.row.final_profit) }}
          </div>
        </td>
      </template>

      <template v-slot:body-cell-intercom="props">
        <q-td class="q-gutter-x-md">
          <q-icon class="cursor-pointer" name="history" size="24px" color="primary"
            @click="showHistory(props.row.order_number)"></q-icon>
          <q-icon v-if="props.row.ticket_id" class="cursor-pointer" name="open_in_new" size="24px" color="primary"
            @click="goIntercom(props.row.ticket_id)"></q-icon>
        </q-td>
      </template>
    </q-table>
    <ProfitDialog ref="editDialog" type="hotel" @updated="doSearch"></ProfitDialog>
    <History ref="historyRef" />
  </div>
</template>

<script setup>
import { useQuasar, SessionStorage } from 'quasar';
import { ref, reactive, watch, computed } from 'vue'
import { router } from 'src/router'
import { getHotelOrderList } from 'src/api'
import { hotelColumns, hotelOrderStatusOptions } from '../enums';
import DatePicker from 'src/components/DatePicker.vue'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import ProfitDialog from '../components/ProfitDialog.vue'
import History from 'src/components/dialog/History.vue';
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
    sortBy: "created_at",
    descending: true,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0, // 初始化 rowsNumber
    perPages: [10, 20, 50],
  }
});
const filterStorageKey = 'hotel-order-filter';
const rows = ref([]);
const textTypeOptions = [
  { label: "全部", value: "all" },
  { label: "訂單編號", value: "order_number" },
  { label: "酒店名稱", value: "hotel" },
  { label: "酒店確認編號", value: "booking_confirm_code" },
  { label: "酒店取消編號", value: "cancel_confirm_code" },
  { label: "訂購人", value: "user_name" },
  { label: "訂購人Email", value: "user_email" },
]
const currentTextType = ref(router.currentRoute.value.query.column
  ? textTypeOptions.find(d => d.value === router.currentRoute.value.query.column)
  : textTypeOptions[0]
);

const filter = reactive({
  text: router.currentRoute.value.query.keyword || null,
  checkinDuration: router.currentRoute.value.query.check_in_start && router.currentRoute.value.query.check_in_end 
    ? {
      from: router.currentRoute.value.query.check_in_start,
      to: router.currentRoute.value.query.check_in_end
    } : null,
  orderDuration: router.currentRoute.value.query.created_at_start && router.currentRoute.value.query.created_at_end 
    ? {
      from: router.currentRoute.value.query.created_at_start,
      to: router.currentRoute.value.query.created_at_end
    } : null,
  status: router.currentRoute.value.query.status
    ? hotelOrderStatusOptions.find(d => d.value === router.currentRoute.value.query.status) 
    : hotelOrderStatusOptions[0]
})

// const getLastCancelDate = (row) => {
//   if (row.book_code.plan.cancel_info) {
//     return getDateString(row.book_code.plan.cancel_info.deadline, 'YYYY-MM-DD');
//   } else {
//     return (row.book_code.plan.cancellation_texts || []).join('')
//   }
// }

// const getCancellableText = (row) => {
//   if (isCancelled(row)) {
//     return "已取消";
//   } else if (isCancellable(row)) {
//     return "確認取消";
//   } else {
//     return "取消期限已過";
//   }
// }

// const getCancellableClass = (row) => {
//   if (isCancelled(row)) {
//     return "cancelled";
//   } else if (isCancellable(row)) {
//     return "cancellable";
//   }
// }

// const isCancelled = (row) => {
//   return !!row.cancelled_at
// }

// const isCancellable = (row) => {
//   return isDateAfter(getDateString(addDays(-1, row.check_in)), new Date());
// }

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

  const [err, res] = await to(getHotelOrderList(params));

  state.loading = false;
  if (err) {
    console.error("getList error:", err);
    return;
  }
  state.pagination.rowsNumber = res.paging.total_rows;
  rows.value = res.data;
  for (let row of rows.value) {
    row.usd_total_price = await getUsdTotalPrice(row)
  }
  // console.log('row:', res.data)
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

  const [err, res] = await to(getHotelOrderList(params));

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
  if (filter.orderDuration) {
    params.created_at_start = `${filter.orderDuration.from} 00:00:00`;
    params.created_at_end = `${filter.orderDuration.to} 23:59:59`;
  }
  params.status = filter.status.value
  return params;
}

const doExcelExport = async () => {
  if ($q.loading.isActive) {
    return;
  }

  $q.loading.show({ message: "導出Excel資料" });
  let datas = [];
  await loadExportData(datas, 1);
  for (let row of datas) {
    row.usd_total_price = await getUsdTotalPrice(row)
  }
  $q.loading.hide();

  // 整理資料
  const headers = [
    "訂單編號", "酒店確認編號", "酒店取消編號", "訂單日期", "訂單狀態",
    "酒店名稱", "預定入住日", "預定退房日", "訂單金額(原幣)", "訂單金額", "訂購人",
    "訂購人Email"
  ]
  let excelDatas = datas.map(d => {
    return [
      d.order_number,
      (d.booking_confirm_code || []).join(','),
      (d.cancel_confirm_code || []).join(','),
      getDateString(d.created_at, 'YYYY-MM-DD'),
      hotelOrderStatusOptions.find(s => s.value === d.status)?.label,
      d.hotel.name,
      getDateStringNoTz(d.check_in, 'YYYY-MM-DD'),
      getDateStringNoTz(d.check_out, 'YYYY-MM-DD'),
      d.total_price
        ? `${d.total_price.slice(0, 3)} ${getNumberFormat(d.total_price.slice(3))}`
        : '',
      d.usd_total_price,
      `${d.user.first_name} ${d.user.last_name}`,
      d.user.email
    ]
  })
  excelDatas = [headers, ...excelDatas];
  // console.log('excel export:', excelDatas);
  const ws = XLSX.utils.aoa_to_sheet(excelDatas);
  const wsCols = [
    { wpx: 120 }, { wpx: 120 }, { wpx: 120 }, { wpx: 80 }, { wpx: 100 },
    { wpx: 160 }, { wpx: 80 }, { wpx: 80 }, { wpx: 100 }, { wpx: 100 }, { wpx: 120 },
    { wpx: 200 },
  ]
  ws['!cols'] = wsCols;
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hotel Orders");
  const filename = `${getDateString(new Date(), "YYYY-MM-DD")}_HotelOrders.xlsx`;
  XLSX.writeFileXLSX(wb, filename);
}

const goDetail = (orderNumber) => {
  router.push({ name: "HotelOrderDetail", params: { orderNumber } });
}

const goHotelSearch = () => {
  router.push({ name: "HotelOrderSearch" });
}

const goMember = (userId) => {
  router.push({ name: "EditMember", params: { id: userId } })
}

const goIntercom = (ticketId) => {
  const url = `https://app.intercom.com/a/inbox/rgfj764k/inbox/conversation/${ticketId}`
  window.open(url, '_blank')
}

const historyRef = ref();
const showHistory = (orderNumber) => {
  historyRef.value.show({
    orderId: orderNumber,
    type: 'booking'
  });
}

const getUsdTotalPrice = async (row) => {
  if (!row.total_price) {
    return null
  }
  const origCurrency = row.total_price.slice(0, 3)
  const targetCurrency = 'USD'
  const amount = row.total_price.slice(3)
  const rate = await metaStore.getExchangeRate(origCurrency, targetCurrency)
  const targetPrice = _.round(amount * rate, 2)
  return `${targetCurrency} ${getNumberFormat(targetPrice)}`
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
  if (newVal.orderDuration) {
    query.created_at_start = newVal.orderDuration.from;
    query.created_at_end = newVal.orderDuration.to;
  } else {
    delete query.created_at_start;
    delete query.created_at_end;
  }
  if (newVal.status && newVal.status.value !== null) {
    query.status = newVal.status.value;
  } else {
    delete query.status;
  }
  router.push({ query });
})

watch(currentTextType, (newVal, oldVal) => {
  let query = { ...router.currentRoute.value.query };
  if (newVal.value === 'all') {
    delete query.column;
  } else {
    query.column = newVal.value;
  }
  router.push({ query });
})

doSearch();

const editDialog = ref();
function doEditProfit (item) {
  editDialog.value.show({
    data: item
  });
}

</script>

<style lang="scss" scoped>
.order {

  &-cancellation {
    color: $grey-7;
  }

  &-status {
    color: $grey-5;

    &.cancelled {
      color: $negative;
    }

    &.cancellable {
      cursor: pointer;
      color: $primary;
      font-weight: 500;
    }
  }
}
</style>
