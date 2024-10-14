<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="row q-mt-none q-col-gutter-lg">
      <div class="col-6">
        <div class="row items-center q-col-gutter-sm">
          <selectCurrency v-model="data.currencyFrom" label="幣別" :default="data.currencyFrom" class="col-2" @handleCallBack="updateAmountTo"></selectCurrency>
          <q-input type="number" v-model="amountFrom" label="金額" :debounce="500" class="col" dense outlined></q-input>
          <q-icon name="sync_alt" size="sm" color="grey-7" />
          <selectCurrency v-model="data.currencyTo" label="幣別" :default="data.currencyT" class="col-2" @handleCallBack="updateAmountTo"></selectCurrency>
          <q-input type="number" v-model="amountTo" label="金額" :debounce="500" class="col" dense outlined></q-input>
        </div>
        <div class="row justify-end q-mt-md">
          <q-btn v-if="records.length > 0" label="清除查詢記錄" color="red-7" @click="clearRecords" outline />
        </div>
      </div>
      <div class="col-6">
        <q-table v-if="records.length > 0" :rows="records" :columns="CurrencyColumns" :rows-per-page-options="[10, 20, 50]"></q-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useMetaStore } from 'src/stores/meta';
import { getDateStringNoTz, getCurrencyFormat } from 'src/utils/helpers';
import { CurrencyColumns } from './enums';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import selectCurrency from 'src/components/selectCurrency.vue';
import _ from 'lodash';

const data = reactive({
  currencyFrom: 'TWD',
  currencyTo: 'USD',
  amountFrom: 1,
  amountTo: 0
});

const metaStore = useMetaStore();

const conversionAmount = async (from, to, amount) => {
  let rate = 1;
  if (from !== to) {
    rate = await metaStore.getExchangeRate(from, to);
  }
  return _.round(amount * rate, 2);
};

onMounted(async () => {
  data.amountTo = await conversionAmount(data.currencyFrom, data.currencyTo, 1);
});

const amountFrom = computed({
  get() {
    return data.amountFrom;
  },
  set(val) {
    data.amountFrom = val;
    updateAmountTo();
  }
});

const amountTo = computed({
  get() {
    return data.amountTo;
  },
  set(val) {
    data.amountTo = val;
    updateAmountFrom();
  }
});

const updateAmountFrom = async () => {
  data.amountFrom = await conversionAmount(data.currencyTo, data.currencyFrom, data.amountTo);
  addRecord();
};

const updateAmountTo = async () => {
  data.amountTo = await conversionAmount(data.currencyFrom, data.currencyTo, data.amountFrom);
  addRecord();
};

const records = ref([]);
const addRecord = () => {
  records.value.unshift({
    from: `${data.currencyFrom} ${getCurrencyFormat(data.amountFrom)}`, 
    to: `${data.currencyTo} ${getCurrencyFormat(data.amountTo)}`,
    time: getDateStringNoTz(new Date())
  });
};
const clearRecords = () => {
  records.value = [];
};
</script>