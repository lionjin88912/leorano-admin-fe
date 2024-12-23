<template>
  <div>
    <BreadCrumbs class="q-mb-md"></BreadCrumbs>
    <section class="flex row justify-between">
      <q-form class=" q-mb-lg">
        <q-input v-model='filter.name' dense class='q-mx-md q-my-sm' :debounce="500" style='width: 240px' outlined
          placeholder='Search'>
          <template v-slot:append>
            <q-icon class='cursor-pointer' name='search' />
          </template>
        </q-input>
        <q-space />
        <div class="row items-center">
          <div class="col" />
        </div>
      </q-form>
      <div class=" q-gutter-sm">
        <q-btn label="新增酒店集團" color="primary" @click="handleOpenModal(handleCreate)" />
      </div>
    </section>
    <TableComponent ref="tableChildRef" :props-filter='queryFilter' :columns="columns"
      :handleCallApi="RequestGroupByName">
      <template #body-cell-operation="{ row }">
        <q-td>
          <q-btn dense flat icon="edit"
            @click="() => handleOpenModal(handleUpdate, false, { id: row.id, name: row.name })" />
        </q-td>
      </template>
    </TableComponent>
    <hotelGroupModal :propsRow="row" :callback="callback" :isCreate="isCreate" :modalLabel="modalLabel"
      :isOpenModal="isOpenModal" @handleCloseModal="handleCloseModal" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { router } from 'src/router';
import columns from './enums';
import hotelGroupModal from './hotelGroupModal'
import TableComponent from 'components/TableComponent.vue';
import { RequestCreateGroup, RequestUpdateGroup, RequestGroupByName } from 'src/api'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
const tableChildRef = ref(null)
const isOpenModal = ref(false)
const modalLabel = ref('')
const isCreate = ref(true)
const callback = ref(() => console.log())
const row = reactive({})

const filter = reactive({
  name: router.currentRoute.value.query.name || '',
})
// const getList = (params) => {
//   return RequestGroupByName({
//     ...params,
//     ...filter,
//   })
// }

const queryFilter = computed(() => {
  return Object.assign({}, filter)
})

const handleCloseModal = (value) => {
  isOpenModal.value = value
}

const handleOpenModal = (func, create = true, data = { id: 0, name: '' }) => {
  row.value = data
  callback.value = func
  isOpenModal.value = true
  isCreate.value = create
}

const handleCreate = (data) => {
  RequestCreateGroup(data).then(
    () => {
      tableChildRef.value.handleCreate()
    }
  ).finally(() => {
    handleCloseModal()
  })
}

const handleUpdate = (data) => {
  RequestUpdateGroup(data.id, data).then(
    (res) => {
      tableChildRef.value.handleUpdate(res.data)
    }).finally(() => {
      handleCloseModal()
    })
}
</script>

<style></style>
