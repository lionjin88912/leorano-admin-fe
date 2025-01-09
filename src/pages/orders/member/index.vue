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
        <q-select v-model="filter.status" option-value="id" :options="memberOrderStatusOptions" outlined dense></q-select>
        <q-select v-model="filter.payment" :options="paymentStatusOptions" outlined dense></q-select>
        <q-space></q-space>
        <div class="flex items-center justify-end">
          <q-btn label="導出Excel" color="primary" @click="doExcelExport"></q-btn>
        </div>
      </div>
    </div>
    <q-table class="data-table" :columns='memberColumns' :rows="rows" @request="loadData" :loading="state.loading"
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
      <template v-slot:body-cell-order_person="props">
        <q-td class="cursor-pointer" @click="goMember(props.row.UserProfile.user_id)">
          <div class="text-bold text-primary">
            {{ props.row.UserProfile.first_name }} {{ props.row.UserProfile.last_name }}
          </div>
          <div class="text-md text-grey-7">{{ props.row.UserProfile.email }}</div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { useQuasar, SessionStorage } from 'quasar';
import { ref, reactive, computed, watch } from 'vue'
import { router } from 'src/router'
import { getMemberOrderList } from 'src/api'
import { memberColumns, memberOrderStatusOptions, paymentStatusOptions, paymentMethodOptions } from '../enums';
import DatePicker from 'src/components/DatePicker.vue'
import { getDateString, getCurrencyFormat } from 'src/utils/helpers';
import XLSX from 'xlsx-js-style';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';

const to = require('await-to-js').default

const $q = useQuasar();
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
const rows = ref([]);
const textTypeOptions = [
  { label: "訂單編號", value: "order_number" },
  { label: "品項名稱", value: "title" },
  { label: "提名邀請碼", value: "code" },
  { label: "訂購人", value: "user" },
]
const currentTextType = ref(router.currentRoute.value.query.column
  ? textTypeOptions.find(d => d.value === router.currentRoute.value.query.column)
  : textTypeOptions[0]
);

const filter = reactive({
  text: router.currentRoute.value.query.keyword || null,
  orderDuration: router.currentRoute.value.query.created_at_start && router.currentRoute.value.query.created_at_end 
    ? {
      from: router.currentRoute.value.query.created_at_start,
      to: router.currentRoute.value.query.created_at_end
    } : null,
  status: router.currentRoute.value.query.status
    ? memberOrderStatusOptions.find(d => d.id === parseInt(router.currentRoute.value.query.status)) 
    : memberOrderStatusOptions[0],
  payment: router.currentRoute.value.query.payment
    ? paymentStatusOptions.find(d => d.value === parseInt(router.currentRoute.value.query.payment)) 
    : paymentStatusOptions[0]
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

  const [err, res] = await to(getMemberOrderList(params));

  state.loading = false;
  if (err) {
    console.error("getList error:", err);
    return;
  }
  state.pagination.rowsNumber = res.paging.total_rows;
  rows.value = res.data;
  // console.log('row:', res.data)
}

const getFilterParams = () => {
  const params = {};
  if (filter.text && filter.text.trim().length > 0) {
    params[currentTextType.value.value] = filter.text;
  }
  if (filter.orderDuration) {
    params.created_at_start = `${filter.orderDuration.from} 00:00:00`;
    params.created_at_end = `${filter.orderDuration.to} 23:59:59`;
  }
  params.status = filter.status.value;
  params.has_back_order = filter.status.has_back_order;
  params.payment = filter.payment.value;
  return params;
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

  const [err, res] = await to(getMemberOrderList(params));

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
    "訂單編號", "品項名稱", "訂單日期", "訂單金額", "訂單狀態",
    "付款狀態", "付款期限", "付款日期", "付款方式", "提名邀請碼",
    "訂購人", "訂購人Email"
  ];
  let excelDatas = datas.map(d => {
    return [
      d.order_number,
      d.Items.map((d) => `會籍 - ${d.item_name}`).join(', '),
      getDateString(d.created_at, 'YYYY-MM-DD'),
      getCurrencyFormat(d.amount),
      memberOrderStatusOptions.find(s => s.value === d.status)?.label,
      paymentStatusOptions.find((d) => d.value === d.payment)?.label,
      getDateString(d.validity_at, 'YYYY-MM-DD'),
      getDateString(d.paided_at, 'YYYY-MM-DD'),
      d.payment_method ? `${paymentMethodOptions.find((s) => s.value === d.payment_method)?.label} ${d.last4}` : '-',
      d.RegisterRecord?.code,
      `${d.UserProfile.first_name} ${d.UserProfile.last_name}`,
      d.UserProfile.email
    ]
  });
  excelDatas = [headers, ...excelDatas];
  // console.log('excel export:', excelDatas);
  const ws = XLSX.utils.aoa_to_sheet(excelDatas);
  const wsCols = [
    { wpx: 120 }, { wpx: 120 }, { wpx: 80 }, { wpx: 80 }, { wpx: 120 },
    { wpx: 120 }, { wpx: 80 }, { wpx: 80 }, { wpx: 100 }, { wpx: 120 },
    { wpx: 120 }, { wpx: 200 },
  ]
  ws['!cols'] = wsCols;
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hotel Orders");
  const filename = `${getDateString(new Date(), "YYYY-MM-DD")
    }_MemberOrders.xlsx`;
  XLSX.writeFileXLSX(wb, filename);
}

const goDetail = (orderNumber) => {
  router.push({ name: "MemberOrderDetail", params: { orderNumber } });
}

const goMember = (userId) => {
  router.push({ name: "EditMember", params: { id: userId } })
}

watch(filter, (newVal) => {
  let query = { ...router.currentRoute.value.query };
  if (newVal.text) {
    query.keyword = newVal.text;
  } else {
    delete query.keyword;
  }
  if (newVal.orderDuration) {
    query.created_at_start = newVal.orderDuration.from;
    query.created_at_end = newVal.orderDuration.to;
  } else {
    delete query.created_at_start;
    delete query.created_at_end;
  }
  if (newVal.status && newVal.status.value !== null) {
    query.status = newVal.status.id;
  } else {
    delete query.status;
  }
  if (newVal.payment && newVal.payment.value !== null) {
    query.payment = newVal.payment.value;
  } else {
    delete query.payment;
  }
  router.push({ query });
});

watch(currentTextType, (newVal, oldVal) => {
  let query = { ...router.currentRoute.value.query };
  query.column = newVal.value;
  router.push({ query });
})

doSearch();

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
