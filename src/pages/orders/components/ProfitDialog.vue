<template>
  <q-dialog class="common-dialog" v-model="visible" persistent>
    <q-card class="container">
      <q-card-section class="sticky-top">
        <div class="flex">
          <div class="text-h6">設定實際利潤</div>
          <q-space></q-space>
          <q-btn icon="close" flat dense rounded v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="content">
        <q-form ref="form" class="row q-col-gutter-sm">
          <selectCurrency v-model="model.final_profit_currency" label="訂單幣別" class="col-4" :default="model.final_profit_currency"></selectCurrency>
          <q-input type="number" v-model.number="model.final_profit" label="實際利潤" class="col-8" :rules="rules.profit" outlined dense />
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
import { ref, reactive, computed, watchEffect } from 'vue'
import { useQuasar } from 'quasar';
import { updateHotelOrderFinalProfit, updateCustomizedOrderFinalProfit } from 'src/api';
import { isNumberEmpty, isNumberDigit, messages } from 'src/utils/validators';
import { getNumberFormat } from 'src/utils/helpers';
import selectCurrency from 'src/components/selectCurrency.vue';
import to from 'await-to-js';

const props = defineProps({
  type: {
    type: String,
    default: 'hotel'
  }
});

const model = reactive({
  order_number: '',
  final_profit: '',
  final_profit_currency: 'USD'
});
const visible = ref(false);
const show = async ({ data }) => {
  resetModel();
  visible.value = true;

  model.order_number = data.order_number;
  if (data.final_profit) {
    model.final_profit_currency = data.final_profit.slice(0, 3);
    model.final_profit = Number(data.final_profit.slice(3)) ?? '';
  }
}

const resetModel = () => {
  model.order_number = '';
  model.final_profit = '';
  model.final_profit_currency = 'USD';
}

const rules = computed(() => {
  return {
    profit: [
      val => !isNumberEmpty(val) || messages.requiredInput(),
      val => isNumberDigit(val, null, 2) || messages.invalidDecimal(2)
    ]
  }
});

const $q = useQuasar();
const form = ref();
const emit = defineEmits(['updated'])
const doSubmit = async () => {
  if (!await form.value.validate()) {
    console.warn("表單驗證未通過");
    return;
  }
  $q.loading.show();
  let err, res;
  console.log(props.type);
  switch (props.type) {
    case 'customized':
      [err, res] = await to(updateCustomizedOrderFinalProfit(model));
      break;
    default:
      [err, res] = await to(updateHotelOrderFinalProfit(model));
      break;
  }
  $q.loading.hide();

  if (err) {
    console.error('main update error:', err);
    return;
  }
  
  visible.value = false;
  emit('updated');
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
