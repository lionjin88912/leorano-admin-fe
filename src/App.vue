<template>
  <router-view :key="$route.fullPath" />
  <Notify />
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import Notify from 'src/components/Notify.vue'
export default defineComponent({
  name: 'App',
  components: {
    Notify,
  }
})
</script>
