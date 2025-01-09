<template>
  <div>
    <BreadCrumbs class="q-mb-md"></BreadCrumbs>
    <section class="flex row justify-between">
      <q-form class="row q-mb-lg">
        <q-input v-model='filter.name' dense class='q-mx-md q-my-sm' :debounce="500" style='width: 240px' outlined
          placeholder='Search'>
          <template v-slot:append>
            <q-icon class='cursor-pointer' name='search' />
          </template>
        </q-input>
        <selectGroup class='q-mr-sm q-my-sm' style="min-width: 240px" @handleCallBack='setSelectFilter'
          :default='{ id: filter.group_id }' />
        <q-space />
      </q-form>
      <div class=" q-gutter-sm">
        <q-btn label="新增酒店品牌" color="primary" @click="doEdit()" />
      </div>
    </section>
    <TableComponent ref="tableRef" :propsFilter='queryFilter' :columns="columns" :handleCallApi="RequestBrandByName">
      <template v-slot:body-cell-operation="props">
        <q-td>
          <q-btn dense flat icon="edit" @click="() => doEdit(props.row)" />
        </q-td>
      </template>
      <template v-slot:body-cell-status='props'>
        <q-td>
          <q-toggle v-model='props.row.is_enabled' checked-icon='check' color='green' unchecked-icon='clear'
            @click="setStatus(props.row)" />
        </q-td>
      </template>
    </TableComponent>
    <hotel-brand-modal ref="editRef" @updated="onBrandUpdated" />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { reactive, ref, computed } from 'vue'
import { router } from 'src/router';
import {
  RequestBrandByName,
  RequestCreateBrand,
  RequestUpdateBrand,
} from 'src/api'
import TableComponent from 'components/TableComponent.vue';
import hotelBrandModal from './hotelBrandModal.vue'
import { columns } from './enums';
import selectGroup from 'components/selectGroup.vue'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import { HotelBrand } from 'src/model';
import to from 'await-to-js';

const $q = useQuasar()
const editRef = ref()
const tableRef = ref()
const filter = reactive({
  name: router.currentRoute.value.query.name || '',
  group_id: router.currentRoute.value.query.group_id ? parseInt(router.currentRoute.value.query.group_id) : null,
})

const doEdit = (data?: HotelBrand) => {
  editRef.value.show({
    data: data
  })
}

const onBrandUpdated = async (data: HotelBrand) => {
  $q.loading.show()
  const api = data.id ? RequestUpdateBrand : RequestCreateBrand
  const [err, res] = await to(api({
    id: data.id,
    data: data
  }))
  $q.loading.hide()

  if (err) {
    console.error('brand update error:', err)
    return
  }

  tableRef.value.reload()
  editRef.value.hide()
}

const setStatus = async (row: HotelBrand) => {
  const [err, res] = await to(RequestUpdateBrand({
    id: row.id,
    data: {
      is_enabled: row.is_enabled
    }
  }))
  tableRef.value.reload()
}

const setSelectFilter = (model: any) => {
  if (!model) return;
  filter['group_id'] = model.val
}

const queryFilter = computed(() => {
  return Object.assign({}, filter)
})

</script>
