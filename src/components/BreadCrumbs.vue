<template>
  <q-breadcrumbs class="q-bread_active">
    <template v-slot:separator>
      <q-icon size="1.5em" name="chevron_right" color="gdms-gray-7" />
    </template>
    <slot name="root">
      <q-breadcrumbs-el v-if="rootTitle" class="text-grey-9">{{ rootTitle }}</q-breadcrumbs-el>
    </slot>
    <q-breadcrumbs-el v-if="parentTitle" :to="parentPath" :class="{ 'text-grey-9': !parentPath }">
      {{ parentTitle }}
    </q-breadcrumbs-el>
    <!-- currentRoute -->
    <slot name="currentRoute">
      <q-breadcrumbs-el>{{ pageTitle }}</q-breadcrumbs-el>
    </slot>
  </q-breadcrumbs>
</template>

<script setup lang="ts">
import { defineComponent, onMounted, computed } from "vue";
import { useRoute, RouteMeta } from "vue-router";

const route = useRoute();

// meta 有定義值，props值若有再重給值，則以props的值為優先
const props = defineProps({
  rootTitle: String,
  parentPath: String,
  parentTitle: String,
  pageTitle: String,
})

const meta: RouteMeta = route.meta;

const rootTitle = computed(() => {
  return props.rootTitle || meta.root?.title;
});

const parentPath = computed(() => {
  return props.parentPath || meta.parent?.path;
});

const parentTitle = computed(() => {
  return props.parentTitle || meta.parent?.title;
});

const pageTitle = computed(() => {
  return props.pageTitle || meta.title;
})

</script>

<style lang="scss" scoped>
// .q-breadcrumbs__el {
//   color: $grey-7;
// }

// .q-bread_active {
//   color: #7189AD;
// }
</style>