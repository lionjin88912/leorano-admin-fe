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
      <template #body-cell-price="{ row }">
        <q-td>{{ row.currency }} {{ getCurrencyFormat(row.price) }}</q-td>
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
          <q-btn dense flat icon="archive" text-color="negative" @click="doDelete(row)" />
        </q-td>
      </template>
      <template #body-cell-voucher="{ row }">
        <q-td align="center">
          <q-btn dense flat icon="send" text-color="primary" @click="sendVoucher(row)" />
        </q-td>
      </template>
    </TableComponent>
    <Confirm ref="confirmRef" @confirm="onDeleteConfirm"></Confirm>
    <ProfitDialog ref="editDialog" type="customized" @updated="doSearch"></ProfitDialog>
  </div>
</template>

<script setup>
import { useQuasar, SessionStorage } from 'quasar';
import { ref, reactive, computed, watch } from 'vue';
import { customizedColumns, customizedVoucherSendOptions, customizedOrderStatusOptions } from '../enums';
import { getCustomizedOrderList, deleteCustomizedOrder, getCustomizedOrderVoucher } from 'src/api';
import { getDateString, getCurrencyFormat, getCurrencyPriceFormat } from 'src/utils/helpers';
import { router } from 'src/router'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import DatePicker from 'src/components/DatePicker.vue';
import TableComponent from 'components/TableComponent.vue';
import Confirm from 'src/components/dialog/Confirm.vue'
import ProfitDialog from '../components/ProfitDialog.vue'
import to from 'await-to-js';

const pagination = {
  sortBy: 'created_at',
}

const filter = reactive({
  orderNumber: null,
  title: null,
  member: null,
  orderStatus: '',
  orderDuration: null,
})

const filterStorageKey = 'customized-order-filter';
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
    params.order_number = filter.orderNumber;
    params.title = filter.title;
    params.member = filter.member;
    params.status = filter.orderStatus;
    params.created_at_start = `${filter.orderDuration.from} 00:00:00`;
    params.created_at_end = `${filter.orderDuration.to} 23:59:59`;
  }
  return params;
}

const queryFilter = computed(() => {
  const params = getFilterParams();
  return Object.assign({}, params);
})

const confirmRef = ref();
const doDelete = (item) => {
  confirmRef.value.show({
    title: '刪除確認',
    message: '確認要刪除嗎？',
    data: item
  });
}

const $q = useQuasar();
const onDeleteConfirm = async (data) => {
  $q.loading.show();
  const [err, res] = await to(deleteCustomizedOrder(data.id));
  $q.loading.hide();

  doSearch();
}

const tableRef = ref();
const doSearch = () => {
  tableRef.value.reload()
}

watch(filter, (newVal) => {
  saveSearchFilter(newVal);
})

const saveSearchFilter = (val) => {
  SessionStorage.set(filterStorageKey, val);
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
</script>