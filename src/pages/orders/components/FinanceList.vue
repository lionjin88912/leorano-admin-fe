<template>
  <div class="finance-list text-bold flex q-col-gutter-sm q-mb-sm q-mt-none">
    <div class="item-badge">項目</div>
    <div class="item-cate">類別</div>
    <div class="col">名稱 <span class="text-negative">*</span></div>
    <div class="item-price">金額</div>
    <div class="item-rate">匯率 <span class="text-negative">*</span></div>
    <div class="item-text">金額 USD</div>
    <div v-if="!disable" class="item-delete text-center">刪除</div>
  </div>
  <div v-for="(finance, index) in model" :key="index" class="finance-list flex items-start no-wrap q-col-gutter-x-sm q-mb-sm">
    <q-select v-model="finance.type" :options="financeOptions" class="item-badge" :readonly="finance.id != ''" :disable="finance.is_paid || disable" emit-value map-options dense outlined>
      <template v-slot:selected-item="scope">
        <q-badge :color="scope.opt.color" class="q-px-xs" outline>
          {{ scope.opt.label }}
        </q-badge>
      </template>
    </q-select>
    <q-select v-model="finance.cate" :options="financeCateOptions[finance.type]" class="item-cate" :disable="finance.is_paid || disable" emit-value map-options dense outlined />
    <q-input v-model="finance.title" class="col" :rules="rules.required" :disable="finance.is_paid || disable" dense outlined />
    <InputCurrencyPrice v-model:currency="finance.currency" v-model:price="finance.amount" class="item-price" @update:currency="changeCurrency(finance)" :rules="rules.finance_amount" :disable="finance.is_paid || disable" />
    <q-input v-model.number="finance.exchange_rate" class="item-rate" :rules="rules.exchange_rate" :disable="finance.is_paid || disable" dense outlined />
    <q-input v-model="financeUSD[index]" class="item-text" :disable="finance.is_paid || disable" dense outlined readonly />
    <div v-if="!disable" class="item-delete text-center">
      <q-btn v-if="finance.payment_number == ''" icon="delete" color="negative" class="full-height q-px-sm" @click="deleteFinance(index)" flat />
    </div>
  </div>
  <q-separator />
  <div class="finance-list text-bold flex items-center q-col-gutter-x-sm q-mt-sm">
    <div class="col text-right">小計</div>
    <div class="item-text text-h6 text-right">{{ getNumberFormat(financeSum) }}</div>
    <div v-if="!disable" class="item-delete"></div>
  </div>
  <div v-if="!disable" class="q-my-md row justify-center">
    <q-btn label="新增收入/支出" color="primary" @click="addFinance" outline />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMetaStore } from "src/stores/meta";
import { isEmpty, isNumberDigit, messages } from 'src/utils/validators';
import { financeOptions, financeCateOptions } from '../enums';
import { getNumberFormat, GetLocalTime } from 'src/utils/helpers';
import InputCurrencyPrice from 'src/components/InputCurrencyPrice.vue';

const model = defineModel()
const props = defineProps({
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
      val => isNumberDigit(val, 4, 5) || `${messages.invalidInteger(4)}，${messages.invalidDecimal(5)}`
    ]
  }
});

/* 編輯訂單收入支出 Start */
const metaStore = useMetaStore();
const addFinance = async () => {
  model.value.push({
    id: '',
    payment_number: '',
    type: 'revenue',
    cate: 'other',
    title: '',
    currency: 'TWD',
    amount: '',
    exchange_rate: _.round(await metaStore.getExchangeRate('TWD', 'USD'), 2),
    is_paid: false
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
  .item-badge {
    width: 90px;
  }
  .item-cate {
    width: 135px;
  }
  .item-price {
    width: 170px;
  }
  .item-rate {
    width: 60px;
  }
  .item-text {
    width: 90px;
  }
  .item-delete {
    width: 50px;
  }
}
</style>