<template>
  <section>
    <div class="flex q-pb-md q-gutter-sm">
      <q-select v-model="filter.guarantee_type" :options="GuaranteeTypeOptons" label="Guarantee Type"
        style="min-width: 140px;" outlined dense></q-select>
      <q-select v-model="filter.rate_category" :options="RateCategoryOptions" label="Rate Category"
        style="min-width: 140px;" outlined dense></q-select>
      <q-select v-model="filter.is_enabled" :options="EnabledOptions" label="方案狀態" style="min-width: 140px;" dense
        outlined></q-select>
      <q-select v-model="filter.is_reviewed" :options="ReviewOptions" label="資料比對狀態" style="min-width: 140px;" dense
        outlined></q-select>
      <q-space></q-space>
      <!-- <q-btn :label="batchButtonName" :color="batchButtonColor" @click="toggleBatch"></q-btn> -->
      <q-btn label="上架有 Rate Code 的方案" color="primary" @click="publishRateCodePlans"></q-btn>
      <q-btn label="批次上架" color="green-7" @click="doBatch(true)"></q-btn>
      <q-btn label="批次下架" color="red-7" @click="doBatch(false)"></q-btn>
    </div>
    <q-table ref="tableRef" class="data-table" v-model:selected="selection" :columns='planColumns' :rows="rows"
      :pagination="pagination" :filter="filter" :filter-method="localFilter" :sort-method="localSorting"
      :selection="selectionType" flat bordered no-data-label='無方案資料'>
      <template v-slot:body-cell-rate_plan_type="props">
        <q-td class="link" @click="doEdit(props.row)">
          {{ props.row.rate_plan_type }}
        </q-td>
      </template>
      <template v-slot:body-cell-is_reviewed="props">
        <q-td align="center">
          <q-icon v-if="isNeedReview(props.row)" :name="props.row.is_reviewed ? 'check' : 'close'" size="24px"
            :color="props.row.is_reviewed ? 'positive' : 'negative'"></q-icon>
          <div v-else> - </div>
        </q-td>
      </template>
      <template v-slot:body-cell-hide="props">
        <q-td align="center">
          <q-icon :name="props.row.is_enabled ? 'check' : 'close'" size="24px"
            :color="props.row.is_enabled ? 'positive' : 'negative'"></q-icon>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td>
          <div class="flex no-wrap items-center justify-center q-gutter-sm">
            <q-btn icon="edit" text-color="primary" @click="doEdit(props.row)" rounded dense flat />
          </div>
        </q-td>
      </template>
    </q-table>
    <EditDialog ref="editDialog" :hotelData="hotelData" @updated="doSearch"></EditDialog>
  </section>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, watch, onMounted, computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import to from 'await-to-js';
import { planColumns, GuaranteeTypeOptons, RateCategoryOptions, EnabledOptions, ReviewOptions } from '../enums';
import EditDialog from './EditDialog.vue';
import { GetHotelPlanList, BatchUpdateHotelPlanStatus } from 'src/api';

const props = defineProps({
  propsData: Object
});

const $q = useQuasar();
const route = useRoute();
const editDialog = ref();
const tableRef = ref();
const pagination = ref({
  sortBy: 'rate_code',
  descending: true,
  rowsPerPage: 50
});
const hotelData = ref();
const filter = reactive({
  guarantee_type: GuaranteeTypeOptons[0],
  rate_category: RateCategoryOptions[0],
  is_enabled: EnabledOptions[0],
  is_reviewed: ReviewOptions[0]
});
const rows = ref([]);

const batchMode = ref(true);
const selection = ref<any>([]);

// const onRowClick = (event: Event, row: any, index: number) => {
//   if (!batchMode.value) {
//     return;
//   }
//   const selected = selection.value.find((d: any) => Number(d.id) === Number(row.id));
//   if (selected) {
//     onRemove(row);
//   } else {
//     selection.value.push(row);
//   }
// };

// const onRemove = (data: any) => {
//   // 固定項目不可取消選取
//   if (isRemovable(data)) {
//     selection.value = selection.value.filter((d: any) => Number(d.id) !== Number(data.id));
//   }
// };

// const isRemovable = (data: any) => {
//   // const item = fixedSelection.value.find(d => Number(d.id === Number(data.id)));
//   // if (item) {
//   //   return false;
//   // }
//   return true;
// }

const doSearch = async () => {
  $q.loading.show();
  const [err, res] = await to(GetHotelPlanList({
    hotel_code: hotelData.value.hotel_code,
    // rate_plan_type: searchData.name.trim().length <= 0 ? null : searchData.name,
  }));
  $q.loading.hide();

  if (err) {
    console.error('GetHotelPlanList error:', err);
    return;
  }
  // console.log('res:', res);
  rows.value = res.data;
}

const localFilter = (rows: any, terms: any, cols: any, getCellValue: any) => {
  let newRows = rows;
  if (filter.guarantee_type.value) {
    newRows = newRows.filter((d: any) => d.guarantee_type === filter.guarantee_type.value)
  }
  if (filter.rate_category.value) {
    newRows = newRows.filter((d: any) => filter.rate_category.value?.includes(d.rate_category))
  }
  if (filter.is_enabled.value !== null) {
    newRows = newRows.filter((d: any) => d.is_enabled === filter.is_enabled.value)
  }
  if (filter.is_reviewed.value !== null) {
    newRows = newRows.filter((d: any) => d.is_reviewed === filter.is_reviewed.value)
  }
  return newRows;
}

const localSorting = (rows: readonly any[], sortBy: string, descending: boolean) => {
  const data = [...rows]
  if (sortBy) {
    data.sort((a, b) => {
      const x = descending ? b : a
      const y = descending ? a : b
      if (sortBy === 'room.name') {
        if (!x.room && !y.room) {
          return 0;
        } else if (!x.room && y.room) {
          return -1;
        } else if (x.room && !y.room) {
          return 1;
        }
        return x.room.name > y.room.name ? 1 : x.room.name < y.room.name ? -1 : 0
      } else if (sortBy === 'rate.name') {
        if (!x.rate && !y.rate) {
          return 0;
        } else if (!x.rate && y.rate) {
          return -1;
        } else if (x.rate && !y.rate) {
          return 1;
        }
        return x.rate.name > y.rate.name ? 1 : x.rate.name < y.rate.name ? -1 : 0
      } else {
        if (!x[sortBy] && !y[sortBy]) {
          return 0
        } else if (!x[sortBy]) {
          return -1
        } else if (!y[sortBy]) {
          return 1
        } else {
          return x[sortBy] > y[sortBy] ? 1 : x[sortBy] < y[sortBy] ? -1 : 0
        }
      }
    })
  }

  return data
}

const doEdit = (item: any) => {
  editDialog.value.show({
    data: item
  })
}

const isNeedReview = (row: any) => {
  return row.hasOwnProperty('is_reviewed')
}

const selectionType = computed(() => {
  return batchMode.value ? 'multiple' : 'none';
})
// const showBatchButton = computed(() => {
//   return batchMode.value;
// })
// const batchButtonName = computed(() => {
//   return batchMode.value ? "取消批次" : "批次上/下架"
// })
// const batchButtonColor = computed(() => {
//   return batchMode.value ? 'grey-5' : 'primary'
// })

const doBatch = async (enabled: boolean) => {
  // console.log('doBatch:', selection.value);
  if (selection.value.length <= 0) {
    $q.notify({
      type: 'warning',
      position: 'top',
      message: '請至少選擇一筆方案資料',
      timeout: 2500
    })
    return;
  }

  const [err, res] = await (to(BatchUpdateHotelPlanStatus({
    plan_ids: selection.value.map((d: any) => d.id),
    is_enable: enabled
  })));

  if (err) {
    console.error('BatchUpdateHotelStatus error:', err);
    return
  }
  // doCancelBatch();
  selection.value = [];
  doSearch();
}

// const toggleBatch = () => {
//   if (batchMode.value) {
//     doCancelBatch();
//   } else {
//     batchMode.value = true
//   }
// }
// const doCancelBatch = () => {
//   tableRef.value.clearSelection();
//   batchMode.value = false;
// }

const publishRateCodePlans = async () => {
  selection.value = rows.value.filter((d: any) => d.rate_code);
  doBatch(true);
}

const router = useRouter();
const doBatchEdit = () => {
  router.push({ query: { type: 'edit' } })
}

watch(() => props.propsData, (newVal) => {
  hotelData.value = newVal;
  // console.log('hotelData:', hotelData.value)
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
