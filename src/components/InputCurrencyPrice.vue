<template>
  <div class="flex no-wrap">
    <q-input v-if="currencyReadonly || readonly" v-model="currency" :disable="!currencyReadonly && disable" class="currency" dense outlined readonly />
    <q-select v-else v-model="currency" :options="group_options" @filter="onFilter" :disable="!currencyReadonly && disable" class="currency" input-debounce="500" use-input hide-selected fill-input dense outlined />
    <q-input v-model.number="price" :label="label" class="price full-width" :rules="rules" :readonly="readonly" :disable="disable" dense outlined />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
  },
  currencyReadonly: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  rules: {
    type: Array,
    default: () => []
  }
})

const model = defineModel()
const currencyModel = defineModel('currency')
const priceModel = defineModel('price')
const currency = computed({
  get: () => model.value ? model.value.slice(0, 3) : (currencyModel.value ?? 'USD'),
  set: val => {
    model.value = val + price.value
    currencyModel.value = val
  }
})
const price = computed({
  get: () => model.value ? model.value.slice(3) : (priceModel.value ?? ''),
  set: val => {
    model.value = currency.value + val
    priceModel.value = val
  }
})

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
</script>

<style lang="scss" scoped>
.currency {
  width: 85px;
  &:deep(.q-field__control) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}
.price:deep(.q-field__control) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  &:before {
    border-left: 0;
  }
}
</style>