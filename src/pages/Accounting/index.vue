<template>
  <div>
    <BreadCrumbs :pageTitle="pages[pageType].pageTitle"></BreadCrumbs>
    <div class="row q-my-md items-end">
      <div v-if="filter" class="col row q-gutter-sm">
        <div v-for="item in pages[pageType].filters" :key="item.name" class="col-2">
          <q-input v-if="item.type == 'text'" :placeholder="item.label" v-model="filter[item.name]" :debounce="500" outlined dense>
            <template v-slot:append>
              <q-icon class='cursor-pointer' :name="item.icon" />
            </template>
          </q-input>
          <q-select v-if="item.type == 'select'" v-model="filter[item.name]" :options="item.options" outlined dense />
          <q-field v-if="item.type == 'date'" :label="item.label" class="cursor-pointer" :stack-label="filter[item.name] ? true : false" outlined dense>
            <template #default>
              <DatePicker :date="filter[item.name]" :range="true" @updated="(val) => filter[item.name] = val" />
            </template>
            <template v-slot:control>
              <div v-if="filter[item.name] && filter[item.name].from">
                {{ filter[item.name].from }} - {{ filter[item.name].to }}
              </div>
            </template>
          </q-field>
        </div>
      </div>
      <q-space />
      <q-btn label="導出 Excel" color="primary" class="" @click="doExcelExport"></q-btn>
    </div>
    <TableComponent ref="tableRef" :tableName="`accounting_${pageType}`" :propsFilter='queryFilter' :columns="pages[pageType].columns" :hideVisableColumnsSetting="false" :handleCallApi="getAccountingList">
      <template v-slot:body-cell-order_number="props">
        <q-td class="link" @click="goDetail(props.row)">
          {{ props.row.order_number }}
        </q-td>
      </template>
    </TableComponent>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onBeforeMount } from 'vue'
import { router } from 'src/router'
import { useQuasar, SessionStorage } from 'quasar';
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import DatePicker from 'src/components/DatePicker.vue'
import TableComponent from 'src/components/TableComponent.vue'
import { getAccountingList } from 'src/api'
import { pages } from './enums'
import XLSX from 'xlsx-js-style'
import { getDateString, getDateStringNoTz, getNumberFormat } from 'src/utils/helpers';
import to from 'await-to-js';

const pageType = router.currentRoute.value.params.type

const filter = ref({});

onBeforeMount(() => {
  restoreSearchFilter();
})

const restoreSearchFilter = () => {
  const savedFilter = SessionStorage.getItem(filterStorageKey);
  if (savedFilter) {
    for (const [key, value] of Object.entries(savedFilter)) {
      filter.value[key] = value;
    }
    SessionStorage.remove(filterStorageKey)
  } else {
    pages[pageType].filters.forEach(item => {
      switch (item.type) {
        case 'select':
          filter.value[item.name] = item.options[0];
          break;
        default:
          filter.value[item.name] = null;
      }
    });
  }
}

watch(filter, (newVal) => {
  saveSearchFilter(newVal);
}, { deep: true })

const filterStorageKey = `accounting-${router.currentRoute.value.params.type}-filter`;
const saveSearchFilter = (val) => {
  SessionStorage.set(filterStorageKey, val);
}

const getFilterParams = () => {
  const params = { type: pageType };
  pages[pageType].filters.forEach(item => {
    switch (item.type) {
      case 'select':
        if (filter.value[item.name]) {
          params[item.name] = filter.value[item.name].value;
        }
        break;
      case 'date':
        if (filter.value[item.name]) {
          params[`${item.name}_start`] = filter.value[item.name].from;
          params[`${item.name}_end`] = filter.value[item.name].to;
        }
        break;
      default:
        if (filter.value[item.name]) {
          params[item.name] = filter.value[item.name];
        }
        break;
    }
  })
  return params;
}

const queryFilter = computed(() => {
  const params = getFilterParams();
  return Object.assign({}, params)
})

const goDetail = (row) => {
  router.push({ 
    name: pages[pageType].detailLinkName, 
    params: { 
      orderNumber: row[pages[pageType].detailLinkColumn] 
    }
  });
}

/* 導出 Excel Start */
const $q = useQuasar();
async function doExcelExport () {
  if ($q.loading.isActive) {
    return;
  }

  $q.loading.show({ message: "導出Excel資料" });
  let datas = [];
  await loadExportData(datas, 1);
  $q.loading.hide();

  // 整理資料
  const visibleColumns = pages[pageType].columns.filter(c => tableRef.value.visibleColumns.includes(c.name));
  const headers = visibleColumns.map(c => c.label);
  let excelDatas = datas.map(d => {
    return visibleColumns.map(c => {
      return typeof c.field === 'string' ? d[c.field] : c.field(d);
    })
  })
  excelDatas = [headers, ...excelDatas];
  const ws = XLSX.utils.aoa_to_sheet(excelDatas);
  ws['!cols'] = visibleColumns.map(c => { return { wpx: c.wpx } });
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, pages[pageType].pageTitle);
  const filename = `${getDateString(new Date(), "YYYY-MM-DD")}_${pages[pageType].pageTitle}.xlsx`;
  XLSX.writeFileXLSX(wb, filename);
}

const tableRef = ref(null);
async function loadExportData (datas, page) {
  const params = {
    type: pageType,
    page,
    limit: 50,
    ...queryFilter.value
  }
  const [err, res] = await to(getAccountingList(params));

  if (err) {
    console.error("getList error:", err);
    return;
  }

  datas.push(...res.data);
  if (res.paging.page >= res.paging.total_pages) {
    return;
  }
  await loadExportData(datas, res.paging.page + 1);
}
/* 導出 Excel End */
</script>