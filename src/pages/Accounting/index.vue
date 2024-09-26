<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="flex q-gutter-sm q-pb-sm q-my-md">
      <q-field class="cursor-pointer" style="min-width: 200px;" label="入住日期區間" :stack-label="filter.checkinDuration ? true : false" outlined dense>
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
      <q-input v-model="filter.order_number" outlined dense placeholder="訂單編號">
        <template v-slot:append>
          <q-icon class='cursor-pointer' name='search' />
        </template>
      </q-input>
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
import { SessionStorage } from 'quasar';
import { router } from 'src/router'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import DatePicker from 'src/components/DatePicker.vue'
import TableComponent from 'src/components/TableComponent.vue'
import { getAccountingList } from 'src/api'
import { columns } from './enums'

const filter = reactive({
  checkinDuration: null,
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
  return params;
}

const queryFilter = computed(() => {
  const params = getFilterParams();
  return Object.assign({}, params)
})

const goDetail = (orderNumber) => {
  router.push({ name: "HotelOrderDetail", params: { orderNumber } });
}
</script>