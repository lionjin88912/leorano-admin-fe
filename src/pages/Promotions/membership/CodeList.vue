<template>
  <div>
    <BreadCrumbs :page-title="title"></BreadCrumbs>
    <div class='flex items-center q-my-md q-gutter-x-sm'>
      <div class="title">
        <div>{{ title }}</div>
        &nbsp;(<div class="date">{{ dataStart }} ～ {{ dataEnd }}</div>)
      </div>
      <q-space></q-space>
      <q-btn color="primary" label="兌換統計" @click="goStatistics" outline />
      <q-btn color="primary" label="匯出Excel" @click="doExcelExport" />
    </div>
    <TableComponent ref='tableRef' :columns='CodeColumns' :props-filter="filter" :pagination="{ rowsPerPage: 50 }"
      :handleCallApi='getPromoMembershipCodeList' :api-data-list-key="['codes']">
      <template v-slot:body-cell-sn="props">
        <q-td align="right">
          {{ props.rowIndex + 1 }}
        </q-td>
      </template>

      <template v-slot:body-cell-code="props">
        <q-td>
          <div class="flex">
            <div class="q-pr-sm">{{ props.row.code }}</div>
            <q-icon class="cursor-pointer" name="content_copy" color="primary" size="24px"
              @click.stop="onCopy(props.row.code)">
              <q-tooltip>複製</q-tooltip>
            </q-icon>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-username='props'>
        <q-td :class="{ 'link': hasProfile(props.row) }" @click="goMember(props.row)">{{ username(props.row) }}</q-td>
      </template>

      <template v-slot:body-cell-phone='props'>
        <q-td>{{ props.row.register?.phone || '-' }}</q-td>
      </template>
    </TableComponent>
  </div>
</template>

<script setup lang="ts">
import { useQuasar, copyToClipboard } from 'quasar';
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import to from 'await-to-js';
import { getPromoMembershipCodeList } from 'src/api'
import { CodeColumns, MmeberStatusOptions } from '../enums';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import TableComponent from 'src/components/TableComponent.vue';
import XLSX from 'xlsx-js-style';
import { getDateStringNoTz } from 'src/utils/helpers';

const tableRef = ref();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const promoMembershipId = ref(route.params.promoMembershipId);
const dataTitle = ref<string>(history.state.title)
const dataStart = ref<string>(history.state.start)
const dataEnd = ref<string>(history.state.end)

const filter = reactive({
  promoMembershipId
})

const goMember = (row: any) => {
  router.push({
    name: 'EditMember',
    params: {
      id: row.register?.user_id
    }
  })
}

const goStatistics = () => {
  router.push({
    name: 'PromotionMembershipStatistics',
    params: {
      promoMembershipId: promoMembershipId.value,
      reportTime: 'last5Week'
    }
  })
}

const doExcelExport = async () => {
  if ($q.loading.isActive) {
    return;
  }

  $q.loading.show({ message: "導出Excel資料" });
  let datas: any = [];
  await loadExportData(datas, 1);
  $q.loading.hide();

  // 整理資料
  const headers = [
    { v: "#", s: { alignment: { horizontal: "center" } } },
    { v: "邀請碼", s: { alignment: { horizontal: "center" } } },
    { v: "註冊日期", s: { alignment: { horizontal: "center" } } },
    { v: "狀態", s: { alignment: { horizontal: "center" } } },
    { v: "稱謂", s: { alignment: { horizontal: "center" } } },
    { v: "姓名", s: { alignment: { horizontal: "center" } } },
    { v: "手機", s: { alignment: { horizontal: "center" } } },
    { v: "註冊Email", s: { alignment: { horizontal: "center" } } }
  ]
  let rows = datas.map((d: any, index: number) => {
    return [
      { v: index + 1, t: 'n' },
      { v: d.code },
      { v: getDateStringNoTz(d.register?.created_at, 'YYYY-MM-DD') || '-', s: { alignment: { horizontal: "center" } } },
      { v: MmeberStatusOptions.find((m: any) => m.value === d.register?.verify)?.label || '-', s: { alignment: { horizontal: "center" } } },
      { v: d.register?.title || '-' },
      { v: username.value(d) },
      { v: d.register?.phone || '-' },
      { v: d.register?.email || '-' }
    ]
  })
  rows = [headers, ...rows];
  // console.log('excel export:', excelDatas);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wsCols = [
    { wpx: 60 }, { wpx: 140 }, { wpx: 140 }, { wpx: 100 }, { wpx: 100 }, { wpx: 100 }, { wpx: 100 }, { wpx: 300 },
  ]
  ws['!cols'] = wsCols;
  ws['!rows'] = rows.map((d: any) => { return { hpx: 20 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '邀請碼清單');
  const filename = `${getDateStringNoTz(new Date(), "YYYY-MM-DD")}_${title.value}-邀請碼清單.xlsx`;
  XLSX.writeFile(wb, filename);
}

const loadExportData = async (datas: any, page: number) => {
  const pagination = tableRef.value.getPagination();
  // 搜尋條件
  const params = {
    page: page,
    limit: 50,
    sort: pagination.descending ? "desc" : "asc",
    orderBy: pagination.sortBy,
    ...filter
  };

  const [err, res] = <any>await to(getPromoMembershipCodeList(params));

  if (err) {
    console.error("getList error:", err);
    return;
  }

  datas.push(...res.data.codes);
  if (res.paging.page >= res.paging.total_pages) {
    return;
  }
  await loadExportData(datas, res.paging.page + 1);
}

const onCopy = async (text: string) => {
  const [err, res] = await to(copyToClipboard(text));
  if (err) {
    return;
  }
  $q.notify({
    position: 'top',
    type: 'positive',
    message: '複製成功',
    timeout: 1500
  })
}

const title = computed(() => {
  return `${dataTitle.value || '會籍活動'}`;
})

const hasProfile = computed(() => (row: any) => {
  return row.register && row.register.user_id
})
const username = computed(() => (row: any) => {
  if (!row.register?.first_name && !row.register?.last_name) {
    return '-'
  }
  return row.register?.first_name + ' ' + row.register?.last_name
})

onMounted(async () => {
})

</script>

<style lang="scss" scoped>
.title {
  display: flex;
  font-size: 16px;
  font-weight: 600;
  color: $primary;
  padding-left: 24px;

  .date {
    color: $grey-6;
  }
}
</style>
