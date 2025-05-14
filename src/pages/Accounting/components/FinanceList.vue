<template>
  <div class="finance-list row text-bold q-col-gutter-sm q-mb-sm q-mt-none">
    <div class="col-2">類別</div>
    <div class="col-5">名稱 <span class="text-negative">*</span></div>
    <div class="col-2">金額</div>
    <div class="col-1">匯率 <span class="text-negative">*</span></div>
    <div class="col">金額 USD</div>
    <div v-if="mode !== 'edit' &&!disable" class="item-delete text-center">刪除</div>
  </div>
  <div v-for="(finance, index) in model" :key="index" class="finance-list row items-start q-col-gutter-x-sm">
    <q-select v-model="finance.cate" :options="financeCateOptions['expense']" class="col-2" :disable="disable" emit-value map-options dense outlined />
    <q-input v-model="finance.title" class="col-5" :rules="rules.required" :disable="disable" dense outlined />
    <InputCurrencyPrice v-model:currency="finance.currency" v-model:price="finance.amount" class="col-2" @update:currency="changeCurrency(finance)" :rules="rules.finance_amount" :disable="disable" />
    <q-input v-model="finance.exchange_rate" class="col-1" :rules="rules.exchange_rate" :disable="disable" dense outlined />
    <q-input v-model="financeUSD[index]" class="col" :disable="disable" dense outlined readonly />
    <div v-if="mode !== 'edit' && !disable" class="item-delete text-center">
      <q-btn icon="delete" color="negative" class="full-height q-px-sm" @click="deleteFinance(index)" flat />
    </div>
  </div>
  <div v-if="mode !== 'edit' && !disable" class="row justify-center">
    <q-btn :label="`新增${financeStateOptions.find(d => d.value == type)?.label}`" color="primary" @click="addFinance" outline />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMetaStore } from "src/stores/meta";
import { isEmpty, isNumberDigit, messages } from 'src/utils/validators';
import { financeStateOptions, financeCateOptions } from '../enums';
import { getNumberFormat, GetLocalTime } from 'src/utils/helpers';
import InputCurrencyPrice from 'src/components/InputCurrencyPrice.vue';

const model = defineModel()
const props = defineProps({
  type: {
    type: String,
    default: '' // payment, paid
  },
  mode: {
    type: String,
    default: '' // edit, ''
  },
  disable: {
    type: Boolean,
    default: false
  }
});

const rules = computed(() => {
  return {
    required: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    finance_amount: [
      val => isNumberDigit(val, null, 2) || messages.invalidDecimal(2)
    ],
    exchange_rate: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isNumberDigit(val, 4, 2) || `${messages.invalidInteger(4)}，${messages.invalidDecimal(2)}`
    ]
  }
});

/* 編輯訂單收入支出 Start */
const metaStore = useMetaStore();
const addFinance = async () => {
  model.value.push({
    id: '',
    type: 'revenue',
    cate: 'other',
    title: '',
    currency: 'TWD',
    amount: '',
    exchange_rate: _.round(await metaStore.getExchangeRate('TWD', 'USD'), 2),
	});
}
const changeCurrency = async (finance) => {
  finance.exchange_rate = _.round(await metaStore.getExchangeRate(finance.currency, 'USD'), 2);
}
function deleteFinance (index) {
  model.value.splice(index, 1);
}
/* 編輯訂單收入支出 End */

// 換算美金
const financeUSD = computed(() => {
  return model.value.map((d) => {
    return Number(d.amount) * Number(d.exchange_rate);
  });
});

// 小計金額
const financeSum = computed(() => {
  return model.value.reduce((acc, cur) => {
    if (cur.type === 'revenue') {
      return acc + Number(cur.amount) * Number(cur.exchange_rate);
    } else {
      return acc - Number(cur.amount) * Number(cur.exchange_rate);
    }
  }, 0);
});
</script>

<style lang="scss" scoped>
.finance-list {
  .item-delete {
    width: 50px;
  }
}
</style>