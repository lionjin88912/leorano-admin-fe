<template>
  <Index v-if="pageType !== 'edit'" :propsData='propsData' />
  <Edit v-else :propsData='propsData' />
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import Index from './room/Index.vue';
import Edit from './room/Edit.vue';

const props = defineProps({
  propsData: Object
});

const pageType = ref('');
const route = useRoute();
onBeforeMount(() => {
  if (route.query.type) {
    pageType.value = route.query.type;
  }
})
</script>
