<template>
    <q-select dense outlined v-model='model' use-input input-debounce='500' :label='label' option-value="id"
      option-label="name" :options='group_options' fill-input hide-selected @filter="onFilter" @input-value="autoComplete" @update:modelValue="handleSelection" :disable="disable" />
</template>

<script setup>
import { ref, watchEffect, watch } from 'vue'
import _ from 'lodash'

const props = defineProps({
  default: {
    type: String,
    default() {
      return 'USD'
    }
  },
  label: {
    type: String,
    default() {
      return '選擇幣別'
    }
  },
  disable: {
    type: Boolean,
    default: false
  }
})
const model = defineModel()
const allOptions = ['USD', 'TWD', 'JPY', 'CNY', 'HKD', 'AED', 'AUD', 'BRL', 'CAD', 'CHF', 'EUR', 'GBP', 'IDR', 'KRW', 'MYR', 'MAD', 'NZD', 'PHP', 'RUB', 'SEK', 'SGD', 'THB', 'VND'];
const group_options = ref(allOptions)

const onFilter = (val, update, abort) => {
  update(() => {
    if (val) {
      group_options.value = allOptions.filter(d => _.toLower(d).includes(_.toLower(val)))
    } else {
      group_options.value = allOptions
    }
  })
}

function autoComplete (val) {
  // model.value = allOptions.filter(d => _.toLower(d).indexOf(_.toLower(val)) > -1)[0]
}

const emit = defineEmits(['handleCallBack'])
const handleSelection = () => {
  emit('handleCallBack', model.value)
}

watchEffect(() => {
  if (props.default) {
    model.value = props.default;
  }
});

</script>

<style scoped></style>
