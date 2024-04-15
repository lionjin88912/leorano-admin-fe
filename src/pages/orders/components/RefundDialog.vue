<template>
  <q-dialog v-model="visible" class="common-dialog" persistent>
    <q-card class="container">
      <q-form @submit="doSubmit" @reset="$emit('cancel')">
        <q-card-section class="row items-center q-pr-none q-pb-none">
          <div class="title">{{ state.title }}</div>
          <q-space></q-space>
          <q-btn icon="close" v-close-popup rounded flat dense @click="$emit('cancel')"></q-btn>
        </q-card-section>
        <q-card-section>
          <div class="message q-pb-md">{{ state.message }}</div>
          <div>
            <div class="input-label">退款金額</div>
            <div class="flex q-gutter-sm">
              <q-select v-model="state.currency" :options="currencyOptions" outlined dense></q-select>
              <q-input :rules="rules.amount" type="number" placeholder="退款金額" :maxlength="7" v-model="state.amount"
                outlined hide-hint hide-bottom-space autofocus lazy-rules dense />
            </div>
          </div>
          <div class="q-pt-lg">
            <div class="input-label">退款方式</div>
            <q-select v-model="state.refundMethod" :options="paymentMethodOptions" outlined dense></q-select>
          </div>
          <div class="q-pt-lg">
            <div class="input-label">Stripe 退款編號</div>
            <q-input :rules="rules.stripeNumber" placeholder="退款編號" v-model="state.stripeNumber" outlined hide-hint
              hide-bottom-space autofocus lazy-rules dense />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn class="dialog-button" type="reset" color="primary" label="取消" v-close-popup flat />
          <q-btn class="dialog-button" type="submit" color="negative" label="確認" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup>
import { ref, reactive, computed } from "vue";
import { messages, isEmpty, isPositiveInteger } from "src/utils/validators";
import { currencyOptions, paymentMethodOptions } from "../enums";

const emit = defineEmits(["confirm", "cancel"]);


const visible = ref(false);
const state = reactive({
  data: {},
  title: null,
  message: "",
  currency: currencyOptions[0],
  refundMethod: paymentMethodOptions[0],
  amount: "",
  stripeNumber: null
});

const rules = computed(() => {
  return {
    amount: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isPositiveInteger(val) || messages.inputPositiveInteger(),
      val => val <= state.data.maxAmount || '退款金額不可超過訂單總金額'
    ],
    stripeNumber: [
      val => !isEmpty(val) || messages.requiredInput(),
    ]
  };
});

const show = ({ title, message, data = {} }) => {
  visible.value = true;
  state.title = title;
  state.message = message;
  state.data = data;
};

const doSubmit = async () => {
  visible.value = false;
  emit("confirm", {
    ...state.data,
    currency: state.currency.value,
    amount: state.amount,
    stripeNumber: state.stripeNumber,
    refundMethod: state.refundMethod.value
  });
};

defineExpose({ show });

</script>
<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 450px !important;
  max-width: 600px;

  .title {
    font-size: 18px;
    font-weight: 500;
  }

  .message {
    font-size: 16px;
    color: $negative;
  }

  .input-label {
    font-weight: 500;
    color: $grey-8;
    padding-bottom: 4px;
  }
}
</style>