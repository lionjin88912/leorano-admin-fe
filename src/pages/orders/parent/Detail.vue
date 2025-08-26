<template>
  <div>
    <BreadCrumbs :page-title="route.params.orderNumber" />
    <h6 class="q-mt-md">{{ route.params.orderNumber }}</h6>
    <div class="flex items-center">
      <q-tabs align="left">
        <q-route-tab to="main" label="訂單資訊" />
        <q-route-tab to="finance" label="收支明細" />
        <q-route-tab to="history" label="待辦清單/紀錄" />
      </q-tabs>
      <q-space />
      <q-btn label="結案" color="warning" class="q-px-lg" @click="closeOrder" unelevated />
    </div>
    <Finance v-if="route.params.tab === 'finance'" :orderNumber="route.params.orderNumber"  />
    <History v-else-if="route.params.tab === 'history'" :orderNumber="route.params.orderNumber"  />
    <Main v-else :orderNumber="route.params.orderNumber" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import Main from './Main.vue';
import Finance from './Finance.vue';
import History from './History.vue';

const route = useRoute();

const closeOrder = () => {
}
</script>