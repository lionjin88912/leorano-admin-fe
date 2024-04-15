<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="q-my-lg shadow-1">
      <q-tabs v-model="currentTab" class="text-grey" active-color="primary" indicator-color="primary" align="left"
        narrow-indicator>
        <q-tab v-for="(item, index) in tabList" :key="index" :name="item.value" :label="item.label" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="currentTab" animated>
        <q-tab-panel v-for="(item, index) in tabList" :key="index" :name="item.value" :label="item.label">
          <component :is="currentComponent" :country-list="countryList" :city-list="cityList"
            @country-reload="onCountryReload" @city-reload="onCityReload"></component>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar';
import { RequestCountryCodeList, RequestCityCodeList } from 'src/api'
import { tabList } from './enums'
import CountryList from './CountryList.vue';
import CityList from './CityList.vue';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';

const to = require('await-to-js').default

const $q = useQuasar();
const currentTab = ref(tabList[0].value)
const currentComponent = computed(() => {
  switch (currentTab.value) {
    case 'city':
      return CityList;
    case 'country':
    default:
      return CountryList;
  }
});
const countryList = ref([]);
const cityList = ref([]);

const getCountryList = async (name) => {
  $q.loading.show();
  const [err, res] = await to(RequestCountryCodeList({
    lang: 'en',
    limit: 5000,
    name
  }))

  $q.loading.hide();

  if (err || !res.data) {
    console.error('getCountryList error:', err);
    return;
  }
  countryList.value = res.data
}

const getCityList = async (name, countryId) => {
  // console.log('getCityList name:', name, ', countryId:', countryId);
  $q.loading.show();
  const [err, res] = await to(RequestCityCodeList({
    lang: 'en',
    limit: 5000,
    country: countryId || countryList.value[0]?.id,
    name
  }))

  $q.loading.hide();

  if (err || !res.data) {
    console.error('getCityList error:', err);
    return;
  }
  cityList.value = res.data
}

const onCityReload = ({ name, countryId }) => {
  getCityList(name, countryId);
}

const onCountryReload = ({ name }) => {
  getCountryList(name);
}

watch(currentTab, (newVal) => {
  if (newVal === 'city') {
    getCityList();
  } else {
    getCountryList();
  }
});

onMounted(() => {
  getCountryList();
});
</script>
