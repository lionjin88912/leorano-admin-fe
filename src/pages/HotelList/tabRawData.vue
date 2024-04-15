<template>
  <section class='row  q-mb-lg'>
    <q-input
      type='textarea'
      :label='updatedAt'
      style='min-width: 100%;'
      rows='7'
      disable
    />
  </section>
</template>

<script>

import { computed } from 'vue'
export default {
  name: 'tabRawData',
  props : {
    raw : Object
  },
  setup() {
    // const data = ref(props.raw)
    const updatedAt = computed( () => {
      const date  = '2023-01-01 00:00:00'
      return `最後更新時間： ${ date }`
    })


    return {
      updatedAt
    }

  }
}
</script>

<style scoped>

</style>
