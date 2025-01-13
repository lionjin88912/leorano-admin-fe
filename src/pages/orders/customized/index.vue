<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="flex justify-between q-my-md">
      <div class="flex q-gutter-sm">
        <q-input v-model="filter.orderNumber" label="訂單編號" :debounce="500" outlined dense></q-input>
        <q-input v-model="filter.title" label="訂單名稱" :debounce="500" outlined dense></q-input>
        <q-input v-model="filter.member" label="訂購人" :debounce="500" outlined dense></q-input>
        <q-select v-model="filter.orderStatus" label="訂單狀態" style="min-width: 200px;" :options="customizedOrderStatusOptions" emit-value map-options dense outlined />
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
      </div>
      <q-btn label="新增客製訂單" color="primary" @click="goCustomizedOrder('add')" />
    </div>
    <TableComponent ref="tableRef" :props-filter="queryFilter" :columns="customizedColumns" :pagination="pagination" :handleCallApi="getCustomizedOrderList">
      <template #body-cell-order_number="{ row }">
        <q-td class="link" @click="goCustomizedOrder(row.id)">
          {{ row.order_number }}
        </q-td>
      </template>
      <template #body-cell-voucher_cancel_code="{ row }">
        <q-td>
          <div v-if="row.voucher" class="flex no-wrap">
            <div class="q-pr-sm text-bold">憑證編號</div>
            <div class="text-primary">{{ row.voucher }}</div>
          </div>
          <div v-if="row.cancel_number" class="flex no-wrap">
            <div class="q-pr-sm text-bold">取消編號</div>
            <div class="text-negative">{{ row.cancel_number }}</div>
          </div>
        </q-td>
      </template>
      <template #body-cell-price="{ row }">
        <q-td>{{ row.currency }} {{ getNumberFormat(row.price) }}</q-td>
      </template>
      <template #body-cell-voucher_send="{ row }">
        <q-td align="center">
          <div>{{ customizedVoucherSendOptions.find((d) => d.value === (row.voucher_send !== '') )?.label }}</div>
          <div v-if="row.voucher_send" class="text-grey-5">
            {{ getDateString(row.voucher_send, 'YYYY-MM-DD') }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-final_profit="props">
        <td class="cursor-pointer" @click="doEditProfit(props.row)">
          <div class="text-primary">
            {{ getCurrencyPriceFormat(props.row.final_profit) }}
          </div>
        </td>
      </template>
      <template #body-cell-operation="{ row }">
        <q-td align="center">
          <q-btn dense flat icon='edit' text-color="primary" @click="goCustomizedOrder(row.id)" />
          <q-btn v-if="row.deleted_at" dense flat icon="cancel" text-color="grey-5" disable />
          <q-btn v-else dense flat icon="cancel" text-color="warning" @click="onCancelOrder(row)" />
        </q-td>
      </template>
      <template #body-cell-voucher="{ row }">
        <q-td align="center">
          <q-btn dense flat icon="send" text-color="primary" @click="sendVoucher(row)" />
        </q-td>
      </template>
      <template v-slot:body-cell-intercom="props">
        <q-td>
          <q-icon class="cursor-pointer" name="history" size="24px" color="primary"
            @click="showHistory(props.row.order_number)"></q-icon>
        </q-td>
      </template>
    </TableComponent>
    <CancelOrderDialog ref="cancelOrderRef" @confirm="onCancelConfirm"></CancelOrderDialog>
    <ProfitDialog ref="editDialog" type="customized" @updated="doSearch"></ProfitDialog>
    <History ref="historyRef" />
  </div>
</template>

<script setup>
import { useQuasar, SessionStorage } from 'quasar';
import { ref, reactive, computed, watch } from 'vue';
import { customizedColumns, customizedVoucherSendOptions, customizedOrderStatusOptions } from '../enums';
import { getCustomizedOrderList, deleteCustomizedOrder, getCustomizedOrderVoucher } from 'src/api';
import { getDateString, getNumberFormat, getCurrencyPriceFormat } from 'src/utils/helpers';
import { router } from 'src/router'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import DatePicker from 'src/components/DatePicker.vue';
import TableComponent from 'components/TableComponent.vue';
import CancelOrderDialog from '../components/CancelOrderDialog.vue';
import ProfitDialog from '../components/ProfitDialog.vue';
import History from 'src/components/dialog/History.vue';
import to from 'await-to-js';

const pagination = {
  sortBy: 'created_at',
}

const filter = reactive({
  orderNumber: router.currentRoute.value.query.order_number || null,
  title: router.currentRoute.value.query.title || null,
  member: router.currentRoute.value.query.member || null,
  orderStatus: router.currentRoute.value.query.status || null,
  orderDuration: router.currentRoute.value.query.created_at_start && router.currentRoute.value.query.created_at_end ? {
    from: getDateString(router.currentRoute.value.query.created_at_start, 'YYYY-MM-DD'),
    to: getDateString(router.currentRoute.value.query.created_at_end, 'YYYY-MM-DD'),
  } : null
})

const getFilterParams = () => {
  const params = {};
  if (filter.orderNumber) {
    params.order_number = filter.orderNumber;
  }
  if (filter.title) {
    params.title = filter.title;
  }
  if (filter.member) {
    params.member = filter.member;
  }
  if (filter.orderStatus) {
    params.status = filter.orderStatus;
  }
  if (filter.orderDuration) {
    params.created_at_start = `${filter.orderDuration.from} 00:00:00`;
    params.created_at_end = `${filter.orderDuration.to} 23:59:59`;
  }
  return params;
}

const queryFilter = computed(() => {
  const params = getFilterParams();
  return Object.assign({}, params);
})

const cancelOrderRef = ref();
const onCancelOrder = (item) => {
  cancelOrderRef.value.show({
    title: '確定取消客製訂單',
    message: `訂單編號：${item.order_number}`,
    required: false,
    data: {
      type: 'customized-order',
      orderNumber: item.order_number
    }
  });
}

const $q = useQuasar();
const onCancelConfirm = async (data) => {
  $q.loading.show();
  const [err, res] = await to(deleteCustomizedOrder(data.orderNumber, {
    reason: data.confirmText
  }));
  $q.loading.hide();

  doSearch();
}

const tableRef = ref();
const doSearch = () => {
  tableRef.value.reload()
}

const goCustomizedOrder = (orderNumber) => {
  router.push({
    name: 'CustomizedOrderDetail',
    params: { orderNumber }
  });
}

const editDialog = ref();
function doEditProfit (item) {
  editDialog.value.show({
    data: item
  });
}

const sendVoucher = async (item) => {
  $q.loading.show();
  const [err, res] = await to(getCustomizedOrderVoucher(item.id));
  $q.loading.hide();

  if (res) {
    $q.notify({
      type: 'positive',
      message: '客製訂單憑證已發送',
      position: 'top'
    });
    return;
  }
  if (err) {
    $q.notify({
      type: 'negative',
      message: '客製訂單憑證發送失敗',
      position: 'top'
    })
    console.error('send customized order voucher error:', err);
    return;
  } 
}

const historyRef = ref();
const showHistory = (orderNumber) => {
  historyRef.value.show({
    orderId: orderNumber,
    type: 'customized'
  });
}
</script>