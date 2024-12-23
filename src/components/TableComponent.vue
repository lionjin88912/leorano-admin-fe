<template>
  <div>
    <q-card v-if="!hideVisableColumnsSetting" class="bg-blue-grey-1 q-my-md row" flat>
      <div class="col-1 q-my-auto text-center text-weight-medium">
        顯示欄位
      </div>
      <q-separator vertical inset />
      <div class="col">
        <q-toggle v-for="column in columns" :key="column.name" v-model="visibleColumns" :val="column.name" :label="column.label" class="q-px-sm"></q-toggle>
      </div>
    </q-card>
    <q-table class='data-table' :table-class="selectionClass" :class="tableClass" :rows='rows' :columns='props.columns'
      :loading='loading' :no-data-label='noDataLabel' :rows-per-page-options="pagination.perPage"
      v-model:pagination='pagination' v-model:selected="selection" :selection="selectionType" :hide-selected-banner="true"
      :hide-pagination="hidePagination" :hide-header="hideHeader" :visible-columns="visibleColumns" @row-click="onRowClick" @request='onDataRequest'
      binary-state-sort hidde-title flat bordered>
      <template v-for="column in props.columns" v-slot:[`body-cell-${column.name}`]='props'>
        <slot :name='`body-cell-${column.name}`' v-bind='props'>
          <q-td :props="props">
            {{ typeof column.field === 'string' ? props.row[column.field] : column.field(props.row) }}
          </q-td>
        </slot>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { LocalStorage } from 'quasar'
import { router } from 'src/router';
import to from 'await-to-js';

const emit = defineEmits(['requested'])
const props = defineProps({
  tableName: String,
  tableClass: String,
  noDataLabel: {
    type: String,
    default() {
      return "無資料"
    }
  },
  propRows: [],
  columns: Array<any>,
  pagination: Object,
  handleCallApi: {
    type: Function,
    default() {
      return () => { }
    }
  },
  propsFilter: Object,
  multiple: { // 是否多選
    type: Boolean,
    default() {
      return false;
    }
  },
  clickSelect: {
    type: Boolean,
    default() {
      return true
    }
  },
  apiDataListKey: {
    type: Array<string>,
    default() {
      return null
    }
  },
  hidePagination: Boolean,
  hideHeader: Boolean,
  hideVisableColumnsSetting: {
    type: Boolean,
    default() {
      return true
    }
  }
})

const filter = ref(props.propsFilter)
const loading = ref(false)
const responseData = ref()
const rows = ref(props.propRows)
const pagination = ref(Object.assign({
  sortBy: null,
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0, // 初始化 rowsNumber
  perPage: [10, 20, 50],
}, props.pagination))
// 避免初始化時，filter改變，造成同時間多次request觸發
let initQueryTimer: any = null

const selection = ref<any>([]);
const selectionType = computed(() => {
  return props.multiple ? "multiple" : "none";
});

const onRowClick = (event: Event, row: any, index: number) => {
  if (selectionType.value === 'none' || !props.clickSelect) {
    return;
  }
  const selected = selection.value.find((d: any) => Number(d.id) === Number(row.id));
  if (selected) {
    onRemove(row);
  } else {
    if (!props.multiple) {
      selection.value = [];
    }
    selection.value.push(row);
  }
};

const onRemove = (data: any) => {
  // 固定項目不可取消選取
  if (isRemovable(data)) {
    selection.value = selection.value.filter((d: any) => Number(d.id) !== Number(data.id));
  }
};

const isRemovable = (data: any) => {
  // const item = fixedSelection.value.find(d => Number(d.id === Number(data.id)));
  // if (item) {
  //   return false;
  // }
  return true;
}

/**
 * 依現有條件重新載入資料
 */
const reload = () => {
  onDataRequest({ pagination: pagination.value });
}

const clearSelection = () => {
  selection.value = [];
}

const getSelection = () => {
  return selection.value;
}

const getPagination = () => {
  return pagination.value;
}

const onDataRequest = async (data: any) => {
  loading.value = true

  // pagination
  pagination.value.rowsPerPage = data.pagination.rowsPerPage;
  pagination.value.page = data.pagination.page;
  pagination.value.sortBy = data.pagination.sortBy;
  pagination.value.descending = data.pagination.descending;

  const [err, res] = <any>await to(props.handleCallApi({
    ...filter.value,
    page: data.pagination.page,
    limit: data.pagination.rowsPerPage,
    sort: data.pagination.descending ? "desc" : "asc",
    orderBy: data.pagination.sortBy,
  }))
  loading.value = false

  if (err) {
    console.error('onDataRequest error:', err);
    return;
  }

  if (props.apiDataListKey) {
    let data
    for (let key of props.apiDataListKey) {
      if (data) {
        data = data[key]
      } else {
        data = res.data[key]
      }
    }
    rows.value = data
    // console.log('data:', data)
  } else {
    rows.value = res.data
  }
  responseData.value = res.data
  emit("requested", rows.value);
  pagination.value.rowsNumber = res.paging.total_rows;
}

const selectionClass: any = computed(() => {
  return selectionType.value === 'none' ? 'cursor-default' : null
})

const getResponseData = () => {
  return responseData.value
}

const visibleColumns = ref(props.columns.map(c => c.name));
onMounted(async () => {
  initQueryTimer = setTimeout(async () => {
    reload();
  }, 500);

  if (LocalStorage.getItem(props.tableName)) {
    visibleColumns.value = LocalStorage.getItem(props.tableName);
  }
})

watch(visibleColumns, (newVal) => {
  LocalStorage.set(props.tableName, newVal);
})

watch(() => props.propsFilter, async (val) => {
  if (initQueryTimer) {
    clearTimeout(initQueryTimer);
  }

  let filterNotEmpty = val ? Object.entries(val).filter(([k, v]) => v !== null && v !== undefined && v !== '') : []
  router.push({ query: Object.fromEntries(filterNotEmpty) })
})


defineExpose({ reload, clearSelection, getSelection, getPagination, getResponseData, visibleColumns })
</script>

<style lang="scss" scoped>
:deep() .cursor-default {
  .q-table tr {
    cursor: default !important;
  }
}
</style>
