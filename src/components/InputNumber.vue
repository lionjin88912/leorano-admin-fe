<template>
  <q-input v-model="value" type="number" :label="label" :min="min" :max="max" class="input-number" outlined dense readonly>
    <template v-slot:prepend>
      <q-btn dense flat icon="remove" @click="decrease" :disable="value <= min" />
    </template>

    <template v-slot:append>
      <q-btn dense flat icon="add" @click="increase" :disable="value >= max" />
    </template>
  </q-input>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  min: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    default: -Infinity
  }
})

const emit = defineEmits(['update:modelValue'])
const value = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (val >= props.min && val <= props.max) {
      emit('update:modelValue', val)
    }
  }
})

const increase = () => {
  if (value.value < props.max) {
    value.value += 1
  }
}

const decrease = () => {
  if (value.value > props.min) {
    value.value -= 1
  }
}
</script>

<style lang="scss" scoped>
.input-number {
  min-width: 125px;
}
</style> 
