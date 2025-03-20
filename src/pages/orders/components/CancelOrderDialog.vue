<template>
  <q-dialog v-model="visible" class="common-dialog" persistent>
    <q-card class="container">
      <q-form @submit="doSubmit" @reset="$emit('cancel')">
        <q-card-section class="row items-center q-pr-none q-pb-none">
          <div class="title">{{ state.title }}</div>
          <q-space></q-space>
          <q-btn icon="close" v-close-popup rounded flat dense @click="$emit('cancel')"></q-btn>
        </q-card-section>
        <q-card-section class="q-gutter-y-sm">
          <div class="message q-pb-md">{{ state.message }}</div>
          <q-input v-if="state.isConfirmCode" type="text" label="取消編號" v-model="state.confirmCode" :outlined="outlined" dense />
          <InputCurrencyPrice v-if="state.isCancelPrice" v-model="state.cancelPrice" label="退款金額" />
          <q-input type="textarea" v-model="state.confirmText" label="取消原因" :outlined="outlined" :rules="rules.confirmText" :rows="5" :max-rows="10" maxlength="100" counter dense />
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
import { messages, isEmpty } from "src/utils/validators";
import InputCurrencyPrice from 'src/components/InputCurrencyPrice.vue';

const emit = defineEmits(["confirm", "cancel"]);

const visible = ref(false);
const state = reactive({
  data: {},
  title: null,
  message: "",
  required: true,
  confirmText: "",
  multiple: true, // 多行輸入
});

const rules = computed(() => {
  return {
    confirmText: [
      val => state.required ? !isEmpty(val) || messages.requiredInput() : true,
    ]
  };
});

const outlined = computed(() => {
  return state.multiple ? true : false;
});

const show = ({ title, message, required, isConfirmCode, isCancelPrice, data = {} }) => {
  visible.value = true;
  state.title = title;
  state.message = message;
  state.isConfirmCode = isConfirmCode;
  state.isCancelPrice = isCancelPrice;
  state.required = required;
  state.data = data;
};

const doSubmit = async () => {
  visible.value = false;
  emit("confirm", {
    ...state.data,
    confirmCode: state.confirmCode,
    cancelPrice: state.cancelPrice,
    confirmText: state.confirmText,
  });
};

defineExpose({ show });

</script>
<style lang="scss" scoped>
.container.q-card {
  padding: 0px 16px 16px;
  min-width: 400px;
  max-width: 450px;

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