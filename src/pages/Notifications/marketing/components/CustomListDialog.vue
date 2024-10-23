<template>
  <q-dialog v-model="isShow" persistent>
    <q-card class="container">
      <q-card-section class="row items-center">
        <div class="title">自訂發送名單</div>
        <q-space />
        <q-btn icon="close" v-close-popup rounded flat dense @click="$emit('cancel')"></q-btn>
      </q-card-section>
      <q-card-section class="content">
        <div class="flex column q-gutter-y-sm">
          <q-input v-model="searchText" placeholder="Search by Email" :debounce="500" outlined dense></q-input>
          <div class="flex-1 q-gutter-x-sm">
            <q-scroll-area class="flex-1 content-scroll bordered rounded-borders">
              <TableComponent ref="tableRef" :propsFilter='propsFilter' :columns='columns' :pagination="pagination"
                :handleCallApi='getMemberList' hide-pagination hide-header>
                <template #body-cell-email="props">
                  <q-td :props="props" class="cursor-pointer" @click="select(props.row)">
                    <div class="flex q-gutter-x-sm">
                      <div>{{ props.row.email }}</div>
                      <q-icon v-if="isSelected(props.row)" name="check_circle" color="green-5" size="22px"></q-icon>
                    </div>
                  </q-td>
                </template>
              </TableComponent>
            </q-scroll-area>
            <q-scroll-area class="flex-1 column content-scroll bordered rounded-borders">
              <div class="flex-1" v-for="(user, index) of userlist" :key="index">
                <q-chip color="grey-6" text-color="grey-1" :label="user" removable @remove="unselect(user)"></q-chip>
              </div>
            </q-scroll-area>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="取消" v-close-popup outline @click="emit('cancel')" />
        <q-btn color="primary" label="確認" v-close-popup @click="emit('confirm', userlist)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { QTableProps } from 'quasar'
import { ref, computed } from "vue";
import TableComponent from 'src/components/TableComponent.vue';
import { getMemberList } from "src/api";

const emit = defineEmits(['confirm', 'cancel'])
const isShow = ref(false)
const userlist = ref<string[]>([])
const searchText = ref()
const pagination = {
  rowsPerPage: 50
}

const show = (users: []) => {
  isShow.value = true;
  userlist.value = users || [];
};

const propsFilter = computed(() => {
  let params: { email?: string } = {}

  if (searchText.value) {
    params.email = searchText.value
  }
  return params
})

const isSelected = computed(() => (row: any) => {
  return userlist.value.includes(row.email)
})

const select = (row: any) => {
  if (userlist.value.includes(row.email)) {
    return
  }
  userlist.value.push(row.email)
}

const unselect = (email: any) => {
  userlist.value = userlist.value.filter((d: string) => d !== email)
}

const columns: QTableProps['columns'] = [
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
  }
]

defineExpose({ show })
</script>
<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 750px;

  .title {
    font-size: 18px;
    font-weight: 500;
  }

  .content {
    padding-top: 0px;

    &-scroll {
      // width: 250px;
      height: 400px;
    }
  }
}
</style>
