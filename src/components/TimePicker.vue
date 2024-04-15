<template>
  <q-input v-model="time" mask="time" @update:modelValue="(val) => $emit('update:modelValue', val)">
    <template v-slot:prepend>
      <q-icon name="access_time" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-time landscape v-model="time">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
<script>
import { defineComponent, computed } from 'vue'
export default defineComponent({
  props: {
    modelValue: {
      type: String,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const time = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val),
    })
    return {
      time,
    }
  },
})
</script>
