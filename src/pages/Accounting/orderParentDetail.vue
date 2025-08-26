<template>
  <div>
    <BreadCrumbs :pageTitle="router.currentRoute.value.params.orderNumber" />
    <div class="row q-mt-md">
      訂單：<router-link :to="{ name: 'OrderDetail', params: { orderNumber: router.currentRoute.value.params.orderNumber, tab: 'main' } }" >{{ router.currentRoute.value.params.orderNumber }}</router-link>
      <q-space />
      <div class="text-negative">
        <span class="text-bold q-mr-sm">尚欠：</span>
        <span class="text-bold text-h6">{{ missing }}</span>
      </div>
    </div>
    <q-table :rows="model.finance" :columns="financeColumns" :pagination="pagination" class="data-table q-mt-sm" hide-bottom flat bordered>
      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <div :class="`text-${financeOptions.find(d => d.value == props.row.type)?.color}`">
            {{ financeOptions.find(d => d.value == props.row.type)?.label }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-finance_number="props">
        <q-td :props="props">
          <router-link v-if="props.row.type == 'expense'" :to="{ name: 'PaymentDetail', params: { paymentNumber: props.row.finance_number } }">
            {{ props.row.finance_number }}
          </router-link>
          <router-link v-else :to="{ name: 'PaymentDetail', params: { paymentNumber: props.row.finance_number } }">
            {{ props.row.finance_number }}
          </router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-cate="props">
        <q-td :props="props">
          <div>
            {{ financeCateOptions[props.row.type].find(d => d.value == props.row.cate)?.label }}
          </div>
        </q-td>
      </template>
      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="4" class="text-right"><span class="text-bold text-dark">總計</span></q-td>
          <q-td><span class="text-bold text-dark">USD</span></q-td>
          <q-td></q-td>
          <q-td></q-td>
          <q-td class="text-right">
            <div v-for="sum in financeSum" :key="sum.type" :class="`text-${financeStateOptions.find(d => d.value == sum.type)?.color}`">
              <span class="text-bold q-mr-sm">{{ financeStateOptions.find(d => d.value == sum.type)?.label }}：</span>
              <span class="text-bold text-h6">{{ getNumberFormat(sum.amount) }}</span>
            </div>
          </q-td>
          <q-td class="text-right">
            <div v-for="sum in postSum" :key="sum.type" :class="`text-${financeStateOptions.find(d => d.value == sum.type)?.color}`">
              <span class="text-bold q-mr-sm">{{ financeStateOptions.find(d => d.value == sum.type)?.label }}：</span>
              <span class="text-bold text-h6">{{ getNumberFormat(sum.amount) }}</span>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { router } from 'src/router'
import { financeColumns, financeOptions, financeCateOptions, financeStateOptions } from './enums'
import { getNumberFormat } from 'src/utils/helpers'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'

const pagination = ref({
  rowsPerPage: 0,
})

const model = ref({
  finance: [
    {
      "id": 1,
      "type": "revenue",
      "cate": "commission_income",
      "title": "反佣",
      "amount": 10800,
      "is_post": false,
      "post_amount": 0,
      "currency": "TWD",
      "order_name": "Hotel Indigo Singapore Katong",
      "updated_at": "2025-04-10 16:41:56",
      "exchange_rate": 0.03,
      "finance_number": "2504180001"
    },
    {
      "id": 2,
      "type": "expense",
      "cate": "ticket_cost",
      "title": "訂金",
      "amount": 300,
      "is_post": true,
      "post_amount": 300,
      "currency": "USD",
      "order_name": "環宇通關",
      "updated_at": "2025-04-10 16:42:37",
      "exchange_rate": 1,
      "finance_number": "2504180002"
    },
    {
      "id": 3,
      "type": "expense",
      "cate": "hotel_cost",
      "title": "酒店",
      "amount": 25000,
      "is_post": false,
      "post_amount": 0,
      "currency": "TWD",
      "order_name": "主題中南美酒店需求",
      "updated_at": "2025-04-18 10:23:20",
      "exchange_rate": 0.03,
      "finance_number": "2504180003"
    },
    {
      "id": 4,
      "type": "expense",
      "cate": "ticket_cost",
      "title": "尾款",
      "amount": 250,
      "is_post": false,
      "post_amount": 0,
      "post_currency": "",
      "currency": "USD",
      "order_name": "環宇通關",
      "updated_at": "2025-04-18 10:23:20",
      "exchange_rate": 1,
      "finance_number": "2504180004"
    }
  ]
})

const financeSum = computed(() => {
  const sum = model.value.finance.reduce((acc, row) => {
    if (!acc[row.type]) {
      acc[row.type] = 0
    }
    acc[row.type] += row.amount * row.exchange_rate
    return acc
  }, {})
  return Object.entries(sum).map(([type, amount]) => ({ type, amount }))
})

const POST_MAPPING = {
  revenue: 'received',
  expense: 'paid'
}
const postSum = computed(() => {
  const sum = model.value.finance.reduce((acc, row) => {
    if (!acc[POST_MAPPING[row.type]]) {
      acc[POST_MAPPING[row.type]] = 0
    }
    acc[POST_MAPPING[row.type]] += row.post_amount * row.exchange_rate
    return acc
  }, {})
  return Object.entries(sum).map(([type, amount]) => ({ type, amount }))
})

const missing = computed(() => {
  let revenue = financeSum.value.find(d => d.type == 'revenue').amount
  let received = postSum.value.find(d => d.type == 'received').amount
  return getNumberFormat(revenue - received)
});
</script>
