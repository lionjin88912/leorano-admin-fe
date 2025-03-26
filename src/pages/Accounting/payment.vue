<template>
  <div>
    <BreadCrumbs />
    <div class="filter flex items-center q-col-gutter-x-sm q-my-md">
      <q-input v-model="filter.paymentNumber" label="支單號" outlined dense />
      <q-field class="cursor-pointer" label="建立日期"
        :stack-label="filter.createdAt ? true : false" outlined dense>

        <template #default>
          <DatePicker :date="filter.createdAt" :range="true" @updated="(val) => filter.createdAt = val">
          </DatePicker>
        </template>

        <template v-slot:control>
          <div v-if="filter.createdAt && filter.createdAt.from">
            {{ filter.createdAt.from }} - {{ filter.createdAt.to }}
          </div>
        </template>
      </q-field>
      <q-select v-model="filter.status" label="審核狀態" :options="paidFilterStatusOptions" emit-value map-options outlined dense />
    </div>
    <q-table :rows="datas" :columns="paymentColumns" class="data-table q-mt-md" flat bordered>
      <template v-slot:body-cell-payment_number="props">
        <q-td :props="props">
          <router-link :to="`payment/${props.row.payment_number}`">{{ props.row.payment_number }}</router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-payment_item="props">
        <q-td :props="props">
          <router-link v-if="props.row.order_booking_way == 'customized'" :to="`/orders/${props.row.order_booking_way}/${props.row.order_id}`">{{ props.row.payment_item }}</router-link>
          <router-link v-if="props.row.order_booking_way == 'hotel'" :to="`/orders/${props.row.order_booking_way}/${props.row.order_number}`">{{ props.row.payment_item }}</router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-print="props">
        <q-td :props="props">
          <q-btn icon="print" color="primary" class="q-px-sm" @click="printPayment(props.row.payment_number)" flat />
        </q-td>
      </template>
      <template v-slot:body-cell-paid="props">
        <q-td :props="props">
          <div v-if="props.row.paid">
            已付款
            <div class="text-caption text-grey-6">
              {{ props.row.paid }}
            </div>
          </div>
          <q-toggle v-else v-model="props.row.paid" :false-value="null" label="未付款" color="primary" />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { router } from 'src/router'
import { paymentColumns, paidFilterStatusOptions } from './enums'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import DatePicker from 'src/components/DatePicker.vue'

// 加上篩選欄位：支單號碼 input, 日期區間, 是否審核 select
const filter = reactive({
  paymentNumber: router.currentRoute.value.query.number || null,
  createdAt: router.currentRoute.value.query.start_date && router.currentRoute.value.query.end_date 
    ? {
      from: router.currentRoute.value.query.start_date,
      to: router.currentRoute.value.query.end_date
    } : null,
  status: router.currentRoute.value.query.status || null
})

const datas = ref([
  {
    payment_number: '202500001',
    payment_item: '2025-01-10 訂金',
    payment_amount: 'USD 100.00',
    order_id: 33,
    order_number: 'C24120902353741',
    order_booking_way: 'customized',
    created_at: '2025-01-10 10:00:00',
    paid: '2025-02-01 09:00:00'
  },
  {
    payment_number: '202500002',
    payment_item: '2025-01-10 頭款',
    payment_amount: 'USD 100.00',
    order_id: 33,
    order_number: 'C24120902353741',
    order_booking_way: 'customized',
    created_at: '2025-01-12 10:00:00',
    paid: null
  }
])

const printPayment = (paymentNumber) => {
  const route = router.resolve({ 
    name: 'PrintPayment', 
    params: { paymentNumber } 
  });
  window.open(route.href, '_blank');
}
</script>

<style lang="scss" scoped>
.filter {
  .q-field {
    min-width: 200px;
  }
}
</style>