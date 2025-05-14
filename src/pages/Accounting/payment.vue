<template>
  <div>
    <BreadCrumbs />
    <div class="filter flex q-gutter-x-sm q-my-md">
      <q-input v-model="filter.number" label="支單號" :debounce="1000" outlined dense />
      <q-input v-model="filter.payer" label="支付對象" :debounce="1000" outlined dense />
      <q-input v-model="filter.keyword" label="項目名稱" :debounce="1000" outlined dense />
      <q-field class="cursor-pointer" label="立帳日期"
        :stack-label="filter.createdAt ? true : false" outlined dense>
        <template #default>
          <DatePicker :date="filter.createdAt" :range="true" @updated="(val) => filter.createdAt = val">
          </DatePicker>
        </template>

        <template v-slot:control>
          <div v-if="filter.createdAt && filter.createdAt.from">
            {{ getDateString(filter.createdAt.from, 'YYYY-MM-DD') }} - {{ getDateString(filter.createdAt.to, 'YYYY-MM-DD') }}
          </div>
        </template>
      </q-field>
      <q-select v-model="filter.paid" label="付款狀態" :options="paidFilterStatusOptions" emit-value map-options outlined dense />
      <q-space />
      <router-link to="/accounting/payment/add">
        <q-btn label="新增支單" color="primary" unelevated/>
      </router-link>
    </div>
    <TableComponent :columns="paymentColumns" :propsFilter='propsFilter' :pagination="pagination"  class="data-table q-mt-md" :handleCallApi="getPaymentList" :routePagination="true" flat bordered>
      <template v-slot:body-cell-payment_number="props">
        <q-td :props="props">
          <router-link :to="`payment/${props.row.payment_number}`">{{ props.row.payment_number }}</router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-parent="props">
        <q-td :props="props">
          <router-link :to="{ name: 'AccountingBookingDetail', params: { orderNumber: props.row.parent } }" class="text-primary cursor-pointer ellipsis">{{ props.row.parent }}</router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-order_number="props">
        <q-td :props="props">
          <router-link :to="{ name: 'OrderDetail', params: { orderNumber: props.row.order_number, tab: 'finance' } }">{{ props.row.order_number }}</router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-print="props">
        <q-td :props="props">
          <q-btn icon="print" color="primary" class="q-px-sm" @click="printPayment(props.row.payment_number)" flat />
        </q-td>
      </template>
      <template v-slot:body-cell-paid="props">
        <q-td :props="props">
          <div v-if="props.row.is_paid">
            已付款
            <div class="text-caption text-grey-6">
              {{ getDateString(props.row.paid_at) }}
            </div>
          </div>
          <q-toggle v-else v-model="props.row.is_paid" label="未付款" color="primary" />
        </q-td>
      </template>
    </TableComponent>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { router } from 'src/router'
import { paymentColumns, paidFilterStatusOptions } from './enums'
import { getPaymentList } from 'src/api'
import { getDateString } from 'src/utils/helpers'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import DatePicker from 'src/components/DatePicker.vue'
import TableComponent from 'src/components/TableComponent.vue'

// 加上篩選欄位：支單號碼 input, 日期區間, 是否審核 select
const filter = reactive({
  number: router.currentRoute.value.query.number || null,
  payer: router.currentRoute.value.query.payer || null,
  keyword: router.currentRoute.value.query.keyword || null,
  createdAt: router.currentRoute.value.query.start_date && router.currentRoute.value.query.end_date 
    ? {
      from: router.currentRoute.value.query.start_date,
      to: router.currentRoute.value.query.end_date
    } : null,
  paid: router.currentRoute.value.query.paid ? router.currentRoute.value.query.paid === 'true' : null
})
const pagination = reactive({
  sortBy: router.currentRoute.value.query.sort ?? 'payment_number',
  descending: router.currentRoute.value.query.order ? router.currentRoute.value.query.order === 'desc' : true,
  page: router.currentRoute.value.query.page ? parseInt(router.currentRoute.value.query.page) : 1,
  rowsPerPage: router.currentRoute.value.query.limit ? parseInt(router.currentRoute.value.query.limit) : 10,
})

const propsFilter = computed(() => {
  const params = Object.assign({}, filter);
  if (params.createdAt) {
    params.start_date = `${ getDateString(params.createdAt.from, 'YYYY-MM-DD')} 00:00:00`;
    params.end_date = `${ getDateString(params.createdAt.to, 'YYYY-MM-DD')} 23:59:59`;
    delete params.createdAt;
  }
  return params
})

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