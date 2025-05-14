<template>
  <q-card v-if="model" class="q-mt-md" flat bordered>
    <q-card-section>
      <div class="flex q-gutter-sm q-mb-md">
        <q-space />
        <q-btn label="取消" color="primary" class="q-px-lg" @click="cancelEdit" outline />
        <q-btn label="儲存" color="primary" class="q-px-lg" @click="saveOrder" unelevated />
      </div>
      <div class="row q-col-gutter-x-sm q-col-gutter-y-md">
        <q-input v-model="model.name" label="訂單名稱" class="col-12" dense outlined />
        <q-input v-model="model.created_at" label="預定日期" mask="####-##-##" class="col-6 col-md-3" dense outlined readonly />
        <q-input v-model="model.start_date" label="開始時間" mask="####-##-##" class="col-6 col-md-3" dense outlined readonly />
        <q-input v-model="model.end_date" label="結束時間" mask="####-##-##" class="col-6 col-md-3" dense outlined readonly />
        <q-input v-model="model.invoice" label="收據" class="col-6 col-md-3" dense outlined />
      </div>     
      <div class="q-mt-lg">
        <div class="text-bold q-mb-sm">訂單明細</div>
        <SubOrderSelector :disabled="selectedSubOrder" @select="addSubOrder" />
        <q-table :rows="model.subs" :columns="subOrderSimpleColumns" :pagination="pagination" class="data-table q-my-md" hide-bottom flat bordered>
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <q-badge :color="orderTypeOptions.find(d => d.value == props.row.type).color" :label="orderTypeOptions.find(d => d.value == props.row.type).label" outline />
            </q-td>
          </template>
          <template v-slot:body-cell-order_number="props">
            <q-td :props="props" class="link" @click="goDetail(props.row, props.row.booking_way)">
              {{ props.row.order_number }}
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div :class="`text-${hotelOrderStatusOptions.find((d) => d.value === props.row.status.toLowerCase())?.color}`">{{ hotelOrderStatusOptions.find((d) => d.value === props.row.status.toLowerCase())?.label }}</div>
            </q-td>
          </template>
          <template v-slot:body-cell-undo="props">
            <q-td :props="props">
              <q-btn v-if="model.order_number != props.row.order_number" icon="sym_o_undo" color="negative" @click="removeSubOrder(props.row)" flat dense />
            </q-td>
          </template>
        </q-table>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { ref, computed, onMounted } from 'vue';
import { router } from 'src/router'
import { subOrderSimpleColumns, orderTypeOptions, hotelOrderStatusOptions } from '../enums'
import { getOrderParent, updateOrderParent } from 'src/api'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import DetailLayout from 'src/pages/orders/components/DetailLayout.vue';
import InfoRow from '../components/InfoRow.vue';
import SubOrderSelector from '../components/SubOrderSelector.vue';
import TodoList from '../components/TodoList.vue';
import RecordList from '../components/RecordList.vue';
import to from 'await-to-js';

const $q = useQuasar();
const props = defineProps({
  orderNumber: {
    type: String,
    required: true
  }
})
const pagination = ref({
  rowsPerPage: 0,
});

onMounted(() => {
  getData();
})

const model = ref();
const getData = async () => {
  $q.loading.show();
  const [err, res] = await to(getOrderParent(props.orderNumber));

  if (err) {
    console.error("getOrderParent error:", err);
    return;
  }
  model.value = res.data;
  if (model.value.todo == null) {
    model.value.todo = [];
  }
  $q.loading.hide();
}

/* 子訂單 Start */
const selectedSubOrder = computed(() => model.value.subs.map((d) => d.order_number));
const goDetail = (order, type) => {
  switch (type) {
    case 'parent':
      router.push({ name: 'OrderDetail', params: { orderNumber: order.order_number, tab: 'main' } });
      break;
    case 'online':
      router.push({ name: 'HotelOrderDetail', params: { orderNumber: order.order_number } });
      break;
    case 'offline':
      router.push({ name: 'CustomizedOrderDetail', params: { orderNumber: order.id } });
      break;
  }
}
const addSubOrder = (subOrder) => {
  subOrder.status = 'success';
  model.value.subs.push(subOrder);
}
const removeSubOrder = (subOrder) => {
  model.value.subs = model.value.subs.filter((d) => d.order_number != subOrder.order_number);
}
/* 子訂單 End */

const cancelEdit = () => {
	router.go(0);
}
const saveOrder = async () => {
  $q.loading.show();
  const [err, res] = await to(updateOrderParent(model.value.order_number, {
    name: model.value.name,
    subs: selectedSubOrder.value,
    todo: model.value.todo
  }));
  if (err) {
    console.error("updateOrderParent error:", err);
    return;
  }
  $q.loading.hide();
}
</script>