<template>
  <q-field ref="fieldRef" v-model="modelValue" :class="{ 'cursor-pointer': !readonly && !disable }" :readonly="readonly"
    :rules="rules" :disable="disable" :label="label" :stack-label="isStackLabel" :lazy-rules="lazyRules"
    :hide-bottom-space="hideBottomSpace" :outlined="outlined" :dense="dense" :error="error" :error-message="errorMessage"
    :style="style">
    <template v-if="!readonly && !disable" #default>
      <DatePicker :date="modelValue" :range="range" :format="format" :options="options" @updated="onDateSelected">
      </DatePicker>
    </template>
    <template v-slot:control>
      <div v-if="range" class="flex q-gutter-x-sm items-center">
        <div v-date-no-tz:[format]="modelValue?.from"></div>
        <q-icon v-if="modelValue?.from" name="arrow_right_alt" color="ine-grey-6" size="20px"></q-icon>
        <div v-date-no-tz:[format]="modelValue?.to"></div>
      </div>
      <div v-else>{{ helpers.getDateStringNoTz(modelValue, format) }}</div>
    </template>
    <template v-slot:append>
      <q-icon name="date_range" size="24px"></q-icon>
    </template>
  </q-field>
</template>
<script setup lang="ts">
import { ref, computed, PropType } from 'vue';
import DatePicker from './DatePicker.vue';
import { ValidationRule } from 'quasar/dist/types/api/validation';
import * as helpers from 'src/utils/helpers'

interface ModelValue {
  from: string;
  to: string;
}
const emit = defineEmits(['update:modelValue'])
const modelValue = defineModel({
  type: Object as PropType<ModelValue>,
  default() {
    return null
  }
})
const props = defineProps({
  // modelValue: null,
  label: {
    type: String,
    default() {
      return null
    }
  },
  range: {
    type: Boolean,
    default() {
      return false
    }
  },
  options: null,
  format: {
    type: String,
    default() {
      return 'YYYY-MM-DD'
    }
  },
  readonly: {
    type: Boolean,
    default() {
      return false
    }
  },
  disable: {
    type: Boolean,
    default() {
      return false
    }
  },
  style: Object,
  stackLabel: Boolean,
  error: Boolean,
  errorMessage: String,
  hideBottomSpace: Boolean,
  lazyRules: Boolean,
  outlined: Boolean,
  dense: Boolean,
  rules: Array<ValidationRule>
})

const fieldRef = ref();

const isStackLabel = computed(() => {
  if (props.stackLabel) {
    return true
  }
  if (props.range) {
    return !!(modelValue.value && modelValue.value?.from)
  } else {
    return !!modelValue.value
  }
})

const onDateSelected = (val: any) => {
  // console.log('onDateSelected:', val)
  emit('update:modelValue', val)
}

</script>
<style lang="scss" scoped></style>
