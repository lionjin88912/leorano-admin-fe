<template>
  <div>
    <BreadCrumbs class="q-pb-md"></BreadCrumbs>
    <TableComponent :propsFilter='filter' :columns='paymentColumns' :handleCallApi='getList'>
      <template v-slot:body-cell-operation='props'>
        <q-td :props="props">
          <!-- <q-btn dense flat icon='edit' @click='() => goToEdit(props.row.id)' /> -->
        </q-td>
      </template>
    </TableComponent>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { router } from 'src/router'
import TableComponent from 'src/components/TableComponent.vue';
import { RequestRegisterRecords } from 'src/api'
import { paymentColumns, tabArr } from './enums';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';

const filter = reactive({
  is_preparatory: 0
})
const form = reactive({
  search: '',
})

const getList = (params = {}) => {
  return RequestRegisterRecords({
    name: form.search || null,
    ...filter,
    ...params
  })
}
</script>

<style></style>
