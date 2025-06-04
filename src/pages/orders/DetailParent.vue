<template>
  <div v-if="model">
    <BreadCrumbs :page-title="model.order_number" />
    <DetailLayout :tabs="tabs">
      <template #buttons>
        <div class="flex q-gutter-sm">
          <q-space />
          <q-btn label="取消" color="primary" class="q-px-lg" @click="cancelEdit" outline />
          <q-btn label="儲存" color="primary" class="q-px-lg" @click="saveOrder" unelevated />
        </div>
      </template>
      <template #form>
        <InfoRow ref="mainSectionRef" title="訂單資訊" class="scroll-margin">
          <div class="q-mt-md q-mb-lg">
            <div class="row q-col-gutter-x-sm q-col-gutter-y-md">
              <q-input v-model="model.name" label="訂單名稱" class="col-12" dense outlined />
              <q-input v-model="model.created_at" label="預定日期" mask="####-##-##" class="col-4" dense outlined readonly />
              <q-input v-model="model.start_date" label="開始時間" mask="####-##-##" class="col-4" dense outlined readonly />
              <q-input v-model="model.end_date" label="結束時間" mask="####-##-##" class="col-4" dense outlined readonly />
            </div>              
          </div>
        </InfoRow>
        <InfoRow ref="subSectionRef" title="訂單明細" class="scroll-margin">
          <div class="q-my-md">
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
        </InfoRow>
        <InfoRow ref="todoSectionRef" title="待辦清單" class="scroll-margin">
          <div class="q-mt-sm q-mb-lg">
            <TodoList v-model="model.todo" />
          </div>
        </InfoRow>
      </template>
      <template #aside>
        <q-card v-if="0" class="bg-grey-2" flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-bold">收據</div>
            <div class="flex items-center q-mt-xs">
              <q-badge label="產生收據" class="q-py-xs cursor-pointer q-mr-sm" />
              <div>202500001</div>
            </div>
          </q-card-section>
        </q-card>
        <div>
          <RecordList :orderNumber="model.order_number" type="parent" />
        </div>
      </template>
    </DetailLayout>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { router } from 'src/router'
import { subOrderSimpleColumns, orderTypeOptions, hotelOrderStatusOptions } from './enums'
import { getOrderParent, updateOrderParent } from 'src/api'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import DetailLayout from 'src/pages/orders/components/DetailLayout.vue';
import InfoRow from './components/InfoRow.vue';
import SubOrderSelector from './components/SubOrderSelector.vue';
import TodoList from './components/TodoList.vue';
import RecordList from './components/RecordList.vue';
import to from 'await-to-js';

const $q = useQuasar();
const route = useRoute();

const pagination = ref({
  rowsPerPage: 0,
});

interface SubOrder {
  id: number;
  order_number: string;
  type: string;
  booking_way: string;
  name: string;
}

/* tab, section Start */
const mainSectionRef = ref(null)
const subSectionRef = ref(null)
const todoSectionRef = ref(null)
const tabs = ref([
  {
    name: 'main',
    label: '訂單資訊',
    ref: mainSectionRef
  },
  {
    name: 'sub',
    label: '訂單明細',
    ref: subSectionRef
  },
  {
    name: 'todo',
    label: '待辦清單',
    ref: todoSectionRef
  }
])
/* tab, section End */


onMounted(() => {
  getData();
})

const model = ref();
const getData = async () => {
  $q.loading.show();
  const [err, res] = await to(getOrderParent(route.params.orderNumber));

  if (err) {
    console.error("getParent error:", err);
    return;
  }
  model.value = res.data;
  if (model.value.todo == null) {
    model.value.todo = [];
  }
  $q.loading.hide();
}

/* 子訂單 Start */
const selectedSubOrder = computed(() => model.value.subs.map((d: SubOrder) => d.order_number));
const goDetail = (order: SubOrder, type: string) => {
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
const addSubOrder = (subOrder: SubOrder) => {
  model.value.subs.push(subOrder);
}
const removeSubOrder = (subOrder: SubOrder) => {
  model.value.subs = model.value.subs.filter((d: SubOrder) => d.order_number != subOrder.order_number);
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