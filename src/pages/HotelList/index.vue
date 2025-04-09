<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class='flex q-gutter-md q-my-md items-center'>
      <q-input v-model='filter.name' dense style='width: 220px' :debounce="3000" outlined placeholder='Search'>
        <template v-slot:append>
          <q-icon class='cursor-pointer' name='search' />
        </template>
      </q-input>
      <selectGroup @handleCallBack='setSelectFilter' :default='{ id: filter.group_id }' />
      <selectBrand @handleCallBack='setSelectFilter' :default='{ id: filter.brand_id }' :group="filter.group_id" />
      <selectCountry @handleCallBack='setCountry' :default='{ id: filter.country_id }' />
      <selectCity @handleCallBack='setCity' :default='{ id: filter.city_id }'
        :country="filter.country_id" :load-on-init="filter.country_id != null" />
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
    <TableComponent ref='tableRef' :props-filter='propsFilter' :columns='columns' :pagination="pagination" :handleCallApi='RequestHotelList' :multiple="batchMode" :click-select="false" :route-pagination="true">
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
import { route } from 'quasar/wrappers';

const $q = useQuasar();
const hotelEditDialogRef = ref();
const filterStorageKey = 'hotel-filter';
const tableRef = ref(null)
const currentTab = computed(() => {
  return tabArr.find(d => d.val === filter.status)
})
const filter = reactive({
  status: router.currentRoute.value.query.status != null && router.currentRoute.value.query.status != undefined ? parseInt(router.currentRoute.value.query.status) : '',
  name: router.currentRoute.value.query.name || '',
  group_id: router.currentRoute.value.query.group_id ? parseInt(router.currentRoute.value.query.group_id) : null,
  country_id: router.currentRoute.value.query.country_id ? parseInt(router.currentRoute.value.query.country_id) : null,
  city_id: router.currentRoute.value.query.city_id ? parseInt(router.currentRoute.value.query.city_id) : null,
  brand_id: router.currentRoute.value.query.brand_id ? parseInt(router.currentRoute.value.query.brand_id) : null,
})
const pagination = reactive({
  sortBy: router.currentRoute.value.query.sort ?? null,
  descending: router.currentRoute.value.query.order ? router.currentRoute.value.query.order === 'desc' : false,
  page: router.currentRoute.value.query.page ? parseInt(router.currentRoute.value.query.page) : 1,
  rowsPerPage: router.currentRoute.value.query.limit ? parseInt(router.currentRoute.value.query.limit) : 10,
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
  filter.status = item.val
  tableRef.value.clearSelection();
}

const doHotelCreate = () => {
  hotelEditDialogRef.value.show({
    data: null
  });
}

const setCountry = (model) => {
  if (model && model.id) {
    filter.country_id = model ? model.id : model
  } else {
    filter.country_id = null
    filter.city_id = null
  }
}

const setCity = (model) => {
  // console.log('setCity:', model)
  filter.city_id = model ? model.id : model
}

const setSelectFilter = (model) => {
  if (!model) return;
  filter[model.col] = model.val
}

const goToEdit = (id) => {
  SessionStorage.set('hotel_list', router.options.history.location);
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

const propsFilter = computed(() => {
  return Object.assign({}, filter)
})
</script>

<style>
.q-btn .q-focus-helper {
  display: none;
}
</style>
