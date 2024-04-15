<template>
  <div class="flex-1">
    <q-form ref="form" class="edit-form q-gutter-md">
      <div class="flex-1 justify-between no-wrap">
        <q-input class="edit-form-field q-pr-md" v-model="model.name" label="國家名稱 *" :rules="rules.name" hide-bottom-space
          lazy-rules dense outlined></q-input>
        <q-input class="edit-form-field small q-pr-md" v-model="model.code" label="簡碼 *" :rules="rules.code" maxlength="2"
          hide-bottom-space lazy-rules dense outlined></q-input>
      </div>
      <div class="flex justify-between no-wrap">
        <q-input class="edit-form-field q-pr-md" v-model="model.capital_name" label="首都 *" :rules="rules.capital_name"
          hide-bottom-space lazy-rules dense outlined></q-input>
        <q-input class="edit-form-field small q-pr-md" v-model="model.phone_prefix" label="國際冠碼 *"
          :rules="rules.phone_prefix" hide-bottom-space dense outlined></q-input>
      </div>
      <q-separator></q-separator>
      <div class="flex no-wrap">
        <q-input class="edit-form-field q-pr-md" v-model="model.currency_name" label="貨幣名稱 *" :rules="rules.currency_name"
          hide-bottom-space lazy-rules dense outlined></q-input>
        <q-input class="edit-form-field q-pr-md" v-model="model.currency_code" label="貨幣代碼 *" :rules="rules.currency_code"
          hide-bottom-space lazy-rules dense outlined></q-input>
        <q-input class="edit-form-field " v-model="model.continent" label="大洲 *" :rules="rules.continent"
          hide-bottom-space lazy-rules dense outlined></q-input>
      </div>
      <q-input v-model="model.number_of_hotels" label="酒店數量" type="number" :rules="rules.number_of_hotels"
        hide-bottom-space lazy-rules dense outlined></q-input>
      <q-input v-model="model.desc" label="備註" type="textarea" input-style="min-height: 100px;" autogrow dense
        outlined></q-input>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useQuasar } from 'quasar';
import { isEmpty, isPositiveInteger, messages } from 'src/utils/validators';

const props = defineProps({
  data: {
    type: Object,
    default() {
      return {}
    }
  },
});

const $q = useQuasar();
const form = ref();
const model = ref({});

const rules = computed(() => {
  return {
    name: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    code: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    currency_name: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    currency_code: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    capital_name: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    phone_prefix: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    continent: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    number_of_hotels: [
      // val => !isEmpty(val) || messages.requiredInput(),
      val => isEmpty(val) || isPositiveInteger(val) || messages.inputPositiveInteger()
    ],
  }
});

watchEffect(() => {
  model.value = props.data;
})

const validate = async () => {
  return await form.value.validate();
}

const getModel = () => {
  return model.value;
}

defineExpose({ validate, getModel })

</script>
<style lang="scss" scoped>
.edit-form {
  display: flex;
  flex: 1;
  flex-direction: column;

  // width: 450px;
  &-field {
    display: flex;
    flex: 1;
    // max-width: 300px;

    &.small {
      max-width: 160px;
    }

    &.full {
      // cursor: pointer;
      max-width: 100%;
    }
  }
}
</style>
