<template>
  <section>
    <div class="flex justify-between q-pb-md">
      <div>
        <q-input v-model="searchData.name" :debounce="500" label="房型名稱" dense outlined>
          <template v-slot:append>
            <q-icon class="cursor-pointer" name="search" @click="doSearch" />
          </template>
        </q-input>
      </div>
      <div class="flex q-gutter-x-md">
        <q-btn label="批次刪除" color="negative" @click="onBatchDelete"></q-btn>
        <q-btn label="新增" color="primary" @click="doEdit(null)"></q-btn>
      </div>
    </div>
    <q-table class="data-table" v-model:selected="selection" selection="multiple" :columns='roomColumns' :rows="rows"
      :rows-per-page-options="rowPageOptions" flat bordered no-data-label='無房型資料'>
      <template v-slot:body-cell-name="props">
        <q-td class="link" @click="doEdit(props.row)">
          {{ props.row.name }}
        </q-td>
      </template>
      <template v-slot:body-cell-bed="props">
        <q-td align="center">
          <q-chip v-if="props.row.bedType" color="green-7" text-color="grey-1" size="sm"
            :label="props.row.bedType.name"></q-chip>
          <div v-else>N/A</div>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td>
          <div class="flex no-wrap items-center justify-center q-gutter-sm">
            <q-btn icon="edit" text-color="primary" @click="doEdit(props.row)" rounded dense flat />
            <q-btn icon="delete" text-color="negative" @click="onDelete(props.row)" rounded dense flat />
          </div>
        </q-td>
      </template>
    </q-table>
    <EditDialog ref="editDialog" :hotelData="hotelData" @updated="doSearch"></EditDialog>
    <Confirm ref="confirmRef" @confirm="onDeleteConfirm"></Confirm>
  </section>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import to from 'await-to-js';
import { roomColumns } from './enums';
import EditDialog from './room/EditDialog.vue';
import Confirm from 'src/components/dialog/Confirm.vue'
import { GetHotelRoomList, DeleteHotelRoom, BatchDeleteHotelRoom } from 'src/api';

const props = defineProps({
  propsData: Object
});

const $q = useQuasar();
const route = useRoute();
const editDialog = ref();
const confirmRef = ref();
const rowPageOptions = [50, 10, 20];
const hotelData = ref();
const searchData = reactive({
  name: '',
});
const rows = ref<any>([]);
const selection = ref<any>([]);

const doSearch = async () => {
  $q.loading.show();
  const [err, res] = await to(GetHotelRoomList({
    name: searchData.name.trim().length <= 0 ? null : searchData.name,
    hotel_code: hotelData.value.hotel_code
  }));
  $q.loading.hide();

  if (err) {
    console.error('GetHotelRoomList error:', err);
    return;
  }
  // console.log('res:', res);
  rows.value = res.data;
  for (let row of rows.value) {
    row.bedType = row.tags.find((d: any) => d.tag_type_id === 3);
    row.views = row.tags.filter((d: any) => d.tag_type_id === 10);
    row.amenities = row.tags.filter((d: any) => d.tag_type_id === 2);
  }
}

const doEdit = (item: any) => {
  editDialog.value.show({
    data: item
  })
}

const onDelete = (item: any) => {
  confirmRef.value.show({
    title: '刪除確認',
    message: '確認要刪除嗎？',
    data: {
      type: 'delete',
      data: item
    }
  });
}

const onBatchDelete = () => {
  if (selection.value.length <= 0) {
    $q.notify({
      type: 'warning',
      position: 'top',
      message: '請至少選擇一筆房價資料',
      timeout: 2500
    })
    return;
  }
  confirmRef.value.show({
    title: '批次刪除確認',
    message: '確認要刪除嗎？',
    data: {
      type: 'batch-delete',
    }
  });
}

const onDeleteConfirm = async (data: any) => {
  switch (data.type) {
    case 'delete':
      doDelete(data.data)
      break;
    case 'batch-delete':
      doBatchDelete()
      break;
    default:
      break;
  }
}

const doDelete = async (data: any) => {
  $q.loading.show();
  const [err, res] = await to(DeleteHotelRoom(data.id));
  $q.loading.hide();

  if (err) {
    $q.notify({
      type: 'negative',
      message: '房型資料刪除失敗'
    })
    console.error('DeleteHotelRoom error:', err);
    return;
  }
  doSearch();
}

const doBatchDelete = async () => {
  $q.loading.show();
  const [err, res] = await to(BatchDeleteHotelRoom({
    code: hotelData.value.hotel_code,
    ids: selection.value.map((d: any) => String(d.id)),
  }));
  $q.loading.hide();

  if (err) {
    $q.notify({
      type: 'negative',
      message: '房價資料批次刪除失敗'
    })
    console.error('batch delete HotelRate error:', err);
    return;
  }
  selection.value = [];
  doSearch();
}

watch(() => props.propsData, (newVal) => {
  hotelData.value = newVal;
  // console.log('hotelData:', hotelData.value)
  doSearch();
})

watch(searchData, (_newVal) => {
  doSearch();
})

onMounted(() => {
  let query: any = {}
  if (location.search.length > 0) {
    const qs = location.search.replace('?', '').split('&')
    for (let q of qs) {
      const key = q.split('=')[0]
      const value = q.split('=')[1]
      query[key] = value
    }
  }
  if (query.tab && query.id) {
    setTimeout(() => {
      doEdit({ id: query.id })
      history.replaceState(null, '', location.href.replace(location.search, ''))
    }, 500);
  }
})

</script>

<style lang="scss" scoped></style>
