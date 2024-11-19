<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="row q-my-md items-end">
      <q-space />
      <q-btn label="新增帳號" color="primary" @click="doEdit(null)" />
    </div>

    <TableComponent ref="tableRef" :columns="adminColumns" :pagination="pagination" :handleCallApi="RequestAdmins">
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-toggle v-model="props.row.status" :true-value="1" :false-value="0" color="green" icon="check" unchecked-icon="clear" :label="props.row.status === 1 ? '啟用' : '停用'" @update:model-value="toggleStatus(props.row)" />
        </q-td>
      </template>
      <template v-slot:body-cell-operation="props">
        <q-td :props="props">
          <q-btn flat dense color="primary" icon="edit" @click="doEdit(props.row)" />
        </q-td>
      </template>
    </TableComponent>
    <AdminEditDialog ref="editDialog" @updated="doSearch" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RequestAdmins, UpdateAdmin } from 'src/api'
import { adminColumns } from './enums'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import TableComponent from 'src/components/TableComponent.vue'
import AdminEditDialog from './components/AdminEditDialog.vue'
import to from 'await-to-js'

const pagination = {
  rowsPerPage: 10
}

const editDialog = ref();
const doEdit = (item) => {
  editDialog.value.show({
    data: item
  });
}

const tableRef = ref();
const doSearch = () => {
  tableRef.value.reload()
}

const toggleStatus = async (item) => {
  const [err, res] = await to(UpdateAdmin(item.id, item));
  if (err) {
    console.error('main update error:', err);
    return;
  }
}
</script>
