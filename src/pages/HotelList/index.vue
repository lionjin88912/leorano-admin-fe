<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class='flex q-gutter-md q-my-md items-center'>
      <q-input v-model='filter.name' dense style='width: 220px' :debounce="500" outlined placeholder='Search'>
        <template v-slot:append>
          <q-icon class='cursor-pointer' name='search' />
        </template>
      </q-input>
      <selectGroup @handleCallBack='setSelectFilter' :default='{ id: filter.group_id }' />
      <selectBrand @handleCallBack='setSelectFilter' :default='{ id: filter.brand_id }' :group="filter.group_id" />
      <selectCountry @handleCallBack='setCountry' :default='{ id: filter.country_id, name: filter.countryName }' />
      <selectCity @handleCallBack='setCity' :default='{ id: filter.city_id, name: filter.cityName }'
        :country="filter.country_id" :load-on-init="false" />
    </div>
    <div class="flex items-center ">
      <TabComponent :current-tab="currentTab" :tabArr='tabArr' @update:model-value="onTabChange"></TabComponent>
      <q-space></q-space>
      <div class="flex q-gutter-x-lg">
        <div class="flex q-gutter-x-sm">
          <!-- <q-btn :label="batchButtonName" :color="batchButtonColor" @click="toggleBatch"></q-btn> -->
          <q-btn v-if="filter.status !== 1" label="批次上架" color="green-7" @click="doBatch(true)"></q-btn>
          <q-btn v-if="filter.status !== 0" label="批次下架" color="red-7" @click="doBatch(false)"></q-btn>
        </div>
        <q-btn label="新增酒店" color="primary" @click="doHotelCreate"></q-btn>
      </div>
    </div>
    <TableComponent ref='tableRef' :props-filter='propsFilter' :columns='columns' :handleCallApi='RequestHotelList'
      :multiple="batchMode" :click-select="false">
      <template v-slot:body-cell-name='props'>
        <q-td class="link" @click="goToEdit(props.row.id)">
          <div class="text-sm text-grey-7">ID: {{ props.row.hotel_id }}</div>
          <div>{{ props.row.name }}</div>
        </q-td>
      </template>
      <template v-slot:body-cell-operation='props'>
        <q-td v-if="!props.row.is_enabled">
          <q-btn icon='edit' @click='() => goToEdit(props.row.id)' dense flat />
        </q-td>
      </template>
      <template v-slot:body-cell-status='props'>
        <q-td>
          <q-toggle v-model='props.row.is_enabled' checked-icon='check' color='green' unchecked-icon='clear'
            @click="setStatus(props.row.id, props.row.is_enabled)" />
        </q-td>
      </template>
    </TableComponent>
    <HotelEditDialog ref="hotelEditDialogRef" @updated="onCreated"></HotelEditDialog>
  </div>
</template>

<script setup>
import { SessionStorage, useQuasar } from 'quasar';
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { router } from 'src/router'
import to from 'await-to-js';
import TableComponent from 'components/TableComponent.vue';
import { RequestHotelList, RequestUpdateHotel, BatchUpdateHotelStatus } from 'src/api'
import { columns, tabArr } from './enums';
import TabComponent from 'src/components/TabComponent.vue'
import selectCountry from 'components/selectCountry.vue'
import selectCity from 'components/selectCity.vue'
import selectBrand from 'components/selectBrand.vue'
import selectGroup from 'components/selectGroup.vue'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import HotelEditDialog from './basic/EditDialog.vue';

const $q = useQuasar();
const hotelEditDialogRef = ref();
const filterStorageKey = 'hotel-filter';
const tableRef = ref(null)
const currentTab = ref(null)
const filter = reactive({
  status: 1,
  name: "",
  group_id: null,
  country_id: null,
  city_id: null,
  brand_id: null,
  // non-filter
  countryName: null,
  cityName: null
})

const batchMode = ref(true);

const doBatch = async (enabled) => {
  const selection = tableRef.value.getSelection();
  // console.log('onBatchClick:', selection);
  if (!selection || selection.length <= 0) {
    $q.notify({
      type: 'warning',
      position: 'top',
      message: '請至少選擇一筆酒店資料',
      timeout: 2500
    })
    return;
  }

  const [err, res] = await (to(BatchUpdateHotelStatus({
    hotel_ids: selection.map(d => d.id),
    is_enable: enabled
  })));

  if (err) {
    console.error('BatchUpdateHotelStatus error:', err);
    return
  }
  tableRef.value.clearSelection();
  tableRef.value.reload();
}

const onTabChange = (item) => {
  filter.status = item.val === 'all' ? null : item.val
  tableRef.value.clearSelection();
}

const doHotelCreate = () => {
  hotelEditDialogRef.value.show({
    data: null
  });
}

const setCountry = (model) => {
  console.log('setCountry:', model);
  if (model && model.id) {
    filter.country_id = model ? model.id : model
    filter.countryName = model ? model.name : null
  } else {
    filter.country_id = null
    filter.countryName = null
    filter.city_id = null
    filter.cityName = null
  }
}

const setCity = (model) => {
  // console.log('setCity:', model)
  filter.city_id = model ? model.id : model
  filter.cityName = model ? model.name : null
}

const setSelectFilter = (model) => {
  if (!model) return;
  filter[model.col] = model.val
}

const goToEdit = (id) => {
  router.push({ name: 'EditHotel', params: { hotel_id: id } })
}

const onCreated = () => {
  tableRef.value.reload()
}

const setStatus = async (id, is_enabled) => {
  const [err, res] = await to(RequestUpdateHotel(id, {
    key: "enableUpdate",
    hotel: {
      is_enabled: is_enabled
    }
  }))
  tableRef.value.reload()
}

const saveSearchFilter = (val) => {
  SessionStorage.set(filterStorageKey, val);
}

const restoreSearchFilter = () => {
  const oldFilter = SessionStorage.getItem(filterStorageKey);
  // console.log('restore filter:', oldFilter)
  if (oldFilter) {
    for (const [key, value] of Object.entries(oldFilter)) {
      filter[key] = value;
    }
    SessionStorage.remove(filterStorageKey)
  }
}

const propsFilter = computed(() => {
  return Object.assign({}, filter)
})
watch(filter, (newVal) => {
  const newStatus = (newVal.status === null || newVal.status === undefined) ? 'all' : newVal.status;
  const oldTab = tabArr.find(d => d.val === newStatus)
  currentTab.value = oldTab;

  saveSearchFilter(newVal);
});

onMounted(() => {
  restoreSearchFilter();
})

</script>

<style>
.q-btn .q-focus-helper {
  display: none;
}
</style>
