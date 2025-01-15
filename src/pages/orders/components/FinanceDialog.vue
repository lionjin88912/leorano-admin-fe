<template>
  <q-dialog class="common-dialog" v-model="visible" persistent>
    <q-card class="container">
      <q-card-section class="sticky-top">
        <div class="flex">
          <div class="text-h6">新增收入/支出</div>
          <q-space></q-space>
          <q-btn icon="close" flat dense rounded v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="content">
        <q-form ref="form" class="column q-col-gutter-sm">
          <q-select v-model="model.type" :options="customizedOrderFinanceOptions" label="項目" class="q-mb-md" emit-value map-options dense outlined />
          <q-input v-model="model.title" label="名稱" :rules="rules.title" outlined dense />
          <div class="row q-col-gutter-sm">
            <selectCurrency v-model="model.currency" label="幣別" class="col-4" default="TWD" @handleCallBack="setCurrency"></selectCurrency>
            <q-input type="number" v-model.number="model.amount" label="金額" class="col-8" :rules="rules.amount" outlined dense />
          </div>
          <q-input type="number" v-model.number="model.exchange_rate" label="匯率" :rules="rules.exchange_rate" outlined dense />
        </q-form>
      </q-card-section>
      <q-card-actions class="sticky-bottom" align="right">
        <div class="flex-1 items-center justify-end q-gutter-md">
          <q-btn class="dialog-button" outline label="Cancel" color="primary" v-close-popup />
          <q-btn class="dialog-button" type="submit" label="Save" color="primary" @click="doSubmit" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useQuasar } from 'quasar';
import { useMetaStore } from "src/stores/meta";
import { customizedOrderFinanceOptions } from '../enums';
import { isEmpty, isNumberDigit, messages } from 'src/utils/validators';
import { GetLocalTime } from 'src/utils/helpers';
import selectCurrency from 'src/components/selectCurrency.vue';
import to from 'await-to-js';
import _ from 'lodash';

const model = reactive({
  type: 'revenue',
  title: '',
  currency: 'TWD',
  amount: '',
  exchange_rate: '',
  updated_at: '',
});
const visible = ref(false);
const show = async () => {
  await resetModel();
  visible.value = true;
}

const metaStore = useMetaStore();
const resetModel = async () => {
  model.type = 'revenue';
  model.title = '';
  model.currency = 'TWD';
  model.amount = '';
  model.exchange_rate = _.round(await metaStore.getExchangeRate(model.currency, 'USD'), 2);
  model.updated_at = '';
}

const rules = computed(() => {
  return {
    title: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    amount: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isNumberDigit(val, 7, null) || messages.invalidInteger(7)
    ],
    exchange_rate: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isNumberDigit(val, 4, 2) || `${messages.invalidInteger(4)}，${messages.invalidDecimal(2)}`
    ]
  }
});

const setCurrency = async () => {
  model.exchange_rate = _.round(await metaStore.getExchangeRate(model.currency, 'USD'), 2);
}

const $q = useQuasar();
const form = ref();
const emit = defineEmits(['updated'])
const doSubmit = async () => {
  if (!await form.value.validate()) {
    console.warn("表單驗證未通過");
    return;
  }
  model.updated_at = GetLocalTime(new Date());
  
  visible.value = false;
  emit('updated', model);
}

defineExpose({
  show
});
</script>
<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 450px;
  max-width: 100%;

  .content {
    padding-top: 0px;
  }
}
</style>
