<template>
  <div>
    <BreadCrumbs />
    <div class="filter flex items-center q-col-gutter-x-sm q-my-md">
      <q-input v-model="filter.receiptNumber" label="收據編號" outlined dense />
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
    </div>
    <q-table :rows="datas" :columns="receiptColumns" class="data-table q-mt-md" flat bordered>
      <template v-slot:body-cell-order_name="props">
        <q-td :props="props">
          <router-link :to="`/orders/booking/${props.row.order_number}`">{{ props.row.order_name }}</router-link>
        </q-td>
      </template>
      <template v-slot:body-cell-list="props">
        <q-td :props="props">
          <div v-for="item in props.row.list" :key="item.name">
            {{ item.name }} - {{ getCurrencyPriceFormat(item.price) }}
          </div>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { router } from 'src/router'
import { receiptColumns } from './enums'
import { getCurrencyPriceFormat } from 'src/utils/helpers'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import DatePicker from 'src/components/DatePicker.vue'

// 加上篩選欄位：支單號碼 input, 日期區間, 是否審核 select
const filter = reactive({
  receiptNumber: router.currentRoute.value.query.number || null,
  createdAt: router.currentRoute.value.query.start_date && router.currentRoute.value.query.end_date 
    ? {
      from: router.currentRoute.value.query.start_date,
      to: router.currentRoute.value.query.end_date
    } : null
})

const datas = ref([
  {
    amount: 'USD 100.00',
    receipt_number: '202500001',
    order_name: '20250324_2',
    order_number: 'C25032401300958',
    created_at: '2025-01-10 10:00:00',
    list: [
      { name: 'item1', price: 'USD 50.00' },
      { name: 'item2', price: 'USD 50.00' }
    ]
  }
])
</script>

<style lang="scss" scoped>
.filter {
  .q-field {
    min-width: 200px;
  }
}
</style>