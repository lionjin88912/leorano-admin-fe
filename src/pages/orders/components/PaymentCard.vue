<template>
  <q-card v-if="payments.length > 0" flat bordered>
    <q-card-section class="flex justify-between items-center bg-grey-2">
      <div class="text-subtitle1 text-bold">支單</div>
      <div class="flex items-center text-grey-9">已付：<span class="text-subtitle1 text-bold">USD 300</span></div>
    </q-card-section>
    <q-card-section>
      <div v-for="payment in payments" :key="payment.index" class="payment-row q-py-sm">
        <div class="text-bold text-grey-9 q-mr-sm">{{ payment.title }}</div>
        <div class="text-right text-grey-7"> USD {{ getNumberFormat(financeUSD[payment.index]) }}</div>
        <div class="text-right">
          <router-link v-if="payment.payment_number" :to="`/accounting/payment/${payment.payment_number}`" class="text-primary">
            <q-icon name="check" v-if="payment.is_paid" class="text-teal" />
            {{ payment.payment_number }}
          </router-link>
          <q-badge v-if="!disable && payment.payment_number == ''" label="產生支單" class="q-py-xs cursor-pointer q-ml-sm" />
        </div>
      </div>
      <div class="payment-sum q-pt-sm">
        <div class="text-right text-grey-7">應付：USD {{ paymentSum }}</div>
        <div></div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { getNumberFormat } from 'src/utils/helpers';

const model = defineModel()
const props = defineProps({
  disable: {
    type: Boolean,
    default: false
  }
});

const payments = computed(() => {
  return model.value.map((d, index) => ({
    index,
    ...d
  })).filter((d) => d.type === 'expense' && d.id);
});

// 換算美金
const financeUSD = computed(() => {
  return model.value.map((d) => {
    return Number(d.amount) * Number(d.exchange_rate);
  });
});

// 應付金額
const paymentSum = computed(() => {
  return payments.value.reduce((acc, cur) => {
    return acc + Number(cur.amount) * Number(cur.exchange_rate);
  }, 0);
});
</script>

<style lang="scss" scoped>
.payment-row {
  display: grid;
  grid-template-columns: 1fr 90px 100px;
  gap: 10px;
  border-bottom: 1px solid #e0e0e0;
}
.payment-sum {
  display: grid;
  grid-template-columns: 1fr 85px;
  gap: 10px;
}
</style>