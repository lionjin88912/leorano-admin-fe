<template>
  <q-pagination
    v-model="page"
    :max="maxSize"
    :max-pages="7"
    color="blue-grey-8"
    direction-links
    boundary-links
    @click="$emit('onChange')"
  />
</template>

<script>
import { computed, defineComponent } from 'vue'
export default defineComponent({
  name: 'Pagination',
  props: {
    currentSize: {
      type: [Number || String],
      default: () => 1,
    },
    totalSize: {
      type: [Number, String],
      default: () => 1,
    },
    modelValue: {
      type: [Number, String],
    },
  },
  emits: ['update:modelValue', 'onChange'],
  setup(props, { emit }) {
    const page = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val),
    })
    const maxSize = computed(() => {
      const { currentSize, totalSize } = props
      if (totalSize % currentSize !== 0) {
        return parseInt(totalSize / currentSize) + 1
      }

      return totalSize / currentSize
    })
    return {
      maxSize,
      page,
    }
  },
})
</script>
