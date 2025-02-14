<template>
  <q-dialog v-model="visible" persistent>
    <q-card class="container">
      <q-card-section class="sticky-top">
        <div class="flex">
          <div class="text-h6">新增 Credit</div>
          <q-space></q-space>
          <q-btn icon="close" flat dense rounded v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="content">
        <q-form ref="form" class="column q-col-gutter-sm">
          <q-input type="number" v-model.number="model.amount" label="金額" :rules="rules.amount" outlined dense />
          <q-input type="textarea" v-model="model.reason" label="原因" :rules="rules.reason" placeholder="最多 50 字" outlined dense />
        </q-form>
      </q-card-section>
      <q-card-actions class="sticky-bottom" align="right">
        <div class="flex-1 items-center justify-end q-gutter-md">
          <q-btn class="dialog-button" outline label="取消" color="primary" v-close-popup />
          <q-btn class="dialog-button" type="submit" label="儲存" color="primary" @click="doSubmit" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useQuasar } from 'quasar';
import { useMetaStore } from "src/stores/meta";
import { isEmpty, isNumberDigit, messages } from 'src/utils/validators';
import to from 'await-to-js';
import _ from 'lodash';

const model = reactive({
  amount: '',
  reason: '',
});
const visible = ref(false);
const show = async () => {
  await resetModel();
  visible.value = true;
}

const metaStore = useMetaStore();
const resetModel = async () => {
  model.amount = '';
  model.reason = '';
}

const rules = computed(() => {
  return {
    amount: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isNumberDigit(val, 6) || `${messages.invalidInteger(6)}`
    ],
    reason: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => val.length <= 50 || `${messages.maxLength(50)}`
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
