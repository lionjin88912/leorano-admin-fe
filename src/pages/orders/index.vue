<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="filter flex column q-my-md">
      <div class="flex q-gutter-sm q-pb-sm">
        <q-field class="cursor-pointer filter-date" label="訂單日期"
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
        <q-field class="cursor-pointer filter-date" label="使用區間"
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
        <q-select v-model="filter.booking_way" :options="FilterBookingWayOptions" label="預訂方式" class="filter-select" outlined dense></q-select>
        <q-select v-model="filter.type" :options="FilterOrderTypeOptions" label="訂單類型" class="filter-select" outlined dense></q-select>
      </div>
      <div class="flex justify-end q-gutter-x-sm">
        <q-select v-model="filter.status" :options="FilterOrderStatusOptions" label="訂單狀態" class="filter-select" outlined dense></q-select>
        <q-select v-model="currentTextType" :options="textTypeOptions" class="filter-keyword-type" outlined dense></q-select>
        <q-input v-model="filter.text" placeholder="請依類型輸入關鍵字" class="filter-keyword" :debounce="500" outlined dense>
          <template v-slot:append>
            <q-icon class='cursor-pointer' name='search' @click="doSearch" />
          </template>
        </q-input>
        <q-space></q-space>
        <div class="flex q-gutter-sm">
          <q-btn label="新增酒店訂單" color="primary" @click="goHotelSearch" unelevated></q-btn>
          <q-btn label="新增客製訂單" color="primary" @click="goCustomizedOrder('add')" unelevated></q-btn>
          <q-btn label="導出Excel" color="primary" @click="doExcelExport" unelevated></q-btn>
        </div>
      </div>
    </div>
    <q-table :rows="rows" :columns="orderColumns" row-key="order_number" class="order-list data-table" @request="loadData" :loading="state.loading" v-model:pagination="state.pagination" :rows-per-page-options="state.pagination.perPages" no-data-label='無訂單資料' binary-state-sort flat bordered>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th />
          <q-th v-for="col in props.cols" :key="col.name" :props="props">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td class="td-icon">
            <q-btn size="sm" color="primary" @click="props.expand = !props.expand" :icon="props.expand ? 'remove' : 'add'" dense unelevated round />
          </q-td>
          <q-td v-for="col in props.cols" :key="col.name" :props="props" >
            <div v-if="col.name === 'record'">
              <q-btn icon="o_fact_check" :color="props.row.todo_count && props.row.todo_count.done != props.row.todo_count.total ? 'negative': 'teal'" class="q-px-sm" @click="showHistory(props.row.order_number)" flat>
                <q-badge v-if="props.row.todo_count && props.row.todo_count.total > 0" :label="`${ props.row.todo_count.done }/${ props.row.todo_count.total }`" :color="props.row.todo_count.done != props.row.todo_count.total ? 'negative': 'teal'" class="q-ml-sm" rounded />
              </q-btn>
            </div>
            <div v-else-if="col.name === 'name'" class="text-primary cursor-pointer ellipsis" @click="goDetail(props.row, 'parent')">
              {{ col.value }}
            </div>
            <div v-else-if="col.name === 'status'">
              <div v-for="(count, status) in props.row.status" :key="status" class="flex items-center q-gutter-x-xs" :class="`text-${hotelOrderStatusOptions.find((d) => d.value === status.toLowerCase())?.color}`">
                {{ hotelOrderStatusOptions.find((d) => d.value === status.toLowerCase())?.label }}
                <q-badge :label="count" :color="status ? hotelOrderStatusOptions.find((d) => d.value === status.toLowerCase())?.bg : 'blue-1'" :text-color="status ? hotelOrderStatusOptions.find((d) => d.value === status.toLowerCase())?.color : 'primary'" class="text-bold" />
              </div>
            </div>
            <div v-else>
              {{ col.value }}
            </div>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" class="sub-table-wrapper">
            <div class="row text-bold">
              <div v-for="columns in subOrderColumns" :key="columns.name" :class="columns.classes">
                {{ columns.label }}
              </div>
            </div>
            <draggable v-model="props.row.subs" group="subList" :item-key="props.row.order_number" @add="changeParent">
              <template v-slot:item="{ element }">
                <div class="row items-center">
                  <div class="td-icon">
                    <q-btn size="sm" color="primary" icon="drag_indicator" flat round />
                  </div>
                  <div class="td-date">
                    <div>{{ getDateString(element.created_at, 'YYYY-MM-DD') }}</div>
                    <div class="text-caption text-grey-6">
                      {{ getDateString(element.created_at, 'HH:mm') }}
                    </div>
                  </div>
                  <div class="col" @click="goDetail(element, element.booking_way)">
                    <q-badge :color="orderTypeOptions.find(d => d.value == element.type).color" :label="orderTypeOptions.find(d => d.value == element.type).label" outline />
                    <div class="text-primary cursor-pointer ellipsis">{{ element.order_name }}</div>
                  </div>
                  <div class="td-number">
                    <q-badge :color="orderBookingWayOptions.find(d => d.value == element.booking_way).color" :label="orderBookingWayOptions.find(d => d.value == element.booking_way).label" outline />
                    <div>{{ element.order_number }}</div>
                  </div>
                  <div class="td-code">
                    <div v-if="element.booking_confirm_code" class="text-teal">
                      <q-icon name="check" size="1.2em" color="teal" class="q-mr-xs" />
                      <span v-for="(data, index) of (element.booking_confirm_code || [])" :key="index">
                        {{ data }}
                      </span>
                    </div>
                    <div v-if="element.cancel_confirm_code" class="text-negative">
                      <q-icon name="close" size="1.2em" color="negative" class="q-mr-xs" />
                      <span v-for="(data, index) of (element.cancel_confirm_code || [])" :key="index">
                        {{ data }}
                      </span>
                    </div>
                  </div>
                  <div class="td-date">
                    <div>{{ getDateStringNoTz(element.start_date, 'YYYY-MM-DD') }} ~ </div>
                    <div>
                      {{ getDateStringNoTz(element.end_date, 'YYYY-MM-DD') }}
                    </div>
                  </div>
                  <div class="td-status">
                    <div :class="`text-${hotelOrderStatusOptions.find((d) => d.value === element.status.toLowerCase())?.color}`">{{ hotelOrderStatusOptions.find((d) => d.value === element.status.toLowerCase())?.label }}</div>
                    <div v-if="element.status === 'cancelled'" class="text-caption text-grey-6">
                      {{ getDateString(element.cancelled_at, 'YYYY-MM-DD HH:mm') }}
                    </div>
                  </div>
                  <div class="td-icon text-center">
                    <q-btn v-if="element.ticket_id" icon="open_in_new" color="primary" class="q-px-sm" @click="goIntercom(element.ticket_id)" flat />
                  </div>
                  <div class="td-user cursor-pointer" @click="goMember(element.user.id)">
                    <div class="text-bold text-primary">
                      {{ element.user.first_name }} {{ element.user.last_name }}
                    </div>
                    <div class="text-md text-grey-7">{{ element.user.email }}</div>
                  </div>
                </div>
              </template>
            </draggable>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <History ref="historyRef" />
  </div>
</template>

<script setup>
import { useQuasar, SessionStorage } from 'quasar';
import { ref, reactive, watch, computed } from 'vue'
import { router } from 'src/router'
import { getOrderList, changeOrderParent } from 'src/api'
import { orderColumns, subOrderColumns, orderBookingWayOptions, orderTypeOptions, orderStatusOptions, hotelOrderStatusOptions } from './enums';
import DatePicker from 'src/components/DatePicker.vue'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import History from './components/History.vue';
import draggable from 'vuedraggable'
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
const subPagination = ref({
  rowsPerPage: 0
})
const filterStorageKey = 'hotel-order-filter';
const rows = ref([]);
const textTypeOptions = [
  { label: "全部", value: "all" },
  { label: "訂單編號", value: "order_number" },
  { label: "訂單名稱", value: "hotel" },
  { label: "確認編號", value: "booking_confirm_code" },
  { label: "取消編號", value: "cancel_confirm_code" },
  { label: "訂購人", value: "user_name" },
  { label: "訂購人Email", value: "user_email" },
]
const currentTextType = ref(router.currentRoute.value.query.column
  ? textTypeOptions.find(d => d.value === router.currentRoute.value.query.column)
  : textTypeOptions[0]
);

const FilterBookingWayOptions = [
  { label: "全部", value: null },
  ...orderBookingWayOptions
]

const FilterOrderTypeOptions = [
  { label: "全部", value: null },
  ...orderTypeOptions
]

const FilterOrderStatusOptions = [
  { label: "全部", value: null },
  ...orderStatusOptions
]

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
  booking_way: router.currentRoute.value.query.booking_way
    ? FilterBookingWayOptions.find(d => d.value === router.currentRoute.value.query.booking_way) 
    : FilterBookingWayOptions[0],
  type: router.currentRoute.value.query.type
    ? FilterOrderTypeOptions.find(d => d.value === router.currentRoute.value.query.type) 
    : FilterOrderTypeOptions[0],
  status: router.currentRoute.value.query.status
    ? FilterOrderStatusOptions.find(d => d.value === router.currentRoute.value.query.status) 
    : FilterOrderStatusOptions[0],
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

  const [err, res] = await to(getOrderList(params));

  state.loading = false;
  if (err) {
    console.error("getList error:", err);
    return;
  }
  state.pagination.rowsNumber = res.paging.total_rows;
  res.data.map(d => d.status = {});
  rows.value = res.data;
  await setParentStatus();
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
  if (filter.orderDuration) {
    params.created_at_start = `${filter.orderDuration.from} 00:00:00`;
    params.created_at_end = `${filter.orderDuration.to} 23:59:59`;
  }
  params.booking_way = filter.booking_way.value;
  params.type = filter.type.value;
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
      hotelOrderStatusOptions.find(s => s.value === d.status.toLowerCase())?.label,
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

const changeParent = async (event) => {
  $q.loading.show();
  let fromParentOrderNumber = event.from.__draggable_component__.itemKey;
  let toParentOrderNumber = event.to.__draggable_component__.itemKey;
  let subOrderNumber = event.item._underlying_vm_.order_number;
  const [err, res] = await to(changeOrderParent(subOrderNumber, {
    order_number: toParentOrderNumber
  }));

  if (event.from.children.length === 0) {
    // find rows which has the same order_number, and remove it
    let index = rows.value.findIndex(d => d.order_number === fromParentOrderNumber);
    if (index > -1) {
      rows.value.splice(index, 1);
    }
  }
  $q.loading.hide();
}

const goDetail = (order, type) => {
  switch (type) {
    case 'parent':
      router.push({ name: 'OrderDetail', params: { orderNumber: order.order_number } });
      break;
    case 'online':
      router.push({ name: 'HotelOrderDetail', params: { orderNumber: order.order_number } });
      break;
    case 'offline':
      router.push({ name: 'CustomizedOrderDetail', params: { orderNumber: order.id } });
      break;
  }
}

const setParentStatus = () => {
  rows.value.forEach(row => {
    if (row.subs && row.subs.length > 0) {
      row.subs.forEach(sub => {
        if (row.status[sub.status]) {
          row.status[sub.status]++;
        } else {
          row.status[sub.status] = 1;
        }
      });
    }
  });
}

const goHotelSearch = () => {
  router.push({ name: "HotelOrderSearch" });
}

const goCustomizedOrder = (orderNumber) => {
  router.push({ name: 'CustomizedOrderDetail', params: { orderNumber } });
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
    orderNumber,
    type: 'parent'
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
  if (newVal.booking_way && newVal.booking_way.value !== null) {
    query.booking_way = newVal.booking_way.value;
  } else {
    delete query.booking_way;
  }
  if (newVal.type && newVal.type.value !== null) {
    query.type = newVal.type.value;
  } else {
    delete query.type;
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

</script>

<style lang="scss" scoped>
.filter {
  .filter-date {
    min-width: 200px;
  }
  .filter-select {
    min-width: 100px;
  }
  .filter-keyword-type {
    :deep(.q-field__control) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }
  .filter-keyword {
    min-width: 240px;
    margin-left: 0;
    :deep(.q-field__control) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    :deep(.q-field__control:before) {
      border-left: 0;
    }
  }
}
.order-list {
  .td-icon {
    width: 70px;
  }
  .td-code {
    width: 150px;
  }
  .td-date {
    width: 110px;
  }
  .td-status {
    width: 130px;
  }
  .td-record {
    width: 300px;
  }
}
.sub-table-wrapper {
  padding: 0;
  .row {
    border-top: 1px solid $grey-3;
    & > * {
      padding: 7px 16px;
    }
  }
  .td-number {
    width: 175px;
  }
  .td-user {
    width: 230px;
  }
}
</style>
