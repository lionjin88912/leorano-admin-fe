<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <q-form class='filter flex q-gutter-x-sm q-my-md'>
      <q-field class="cursor-pointer filter-date" label="加入日期" :stack-label="filter.createdAtDuration ? true : false" outlined dense>
        <template #default>
          <DatePicker :date="filter.createdAtDuration" :range="true" @updated="(val) => filter.createdAtDuration = val">
          </DatePicker>
        </template>
        <template v-slot:control>
          <div v-if="filter.createdAtDuration && filter.createdAtDuration.from">
            {{ filter.createdAtDuration.from }} - {{ filter.createdAtDuration.to }}
          </div>
        </template>
      </q-field>  
      <q-input v-model='filter.search' dense :debounce="500" style='width: 240px' outlined
        placeholder='會員姓名、Email、電話'>
        <template v-slot:append>
          <q-icon class='cursor-pointer' name='search' @click="doSearch" />
        </template>
      </q-input>    
      <q-space />
      <q-btn label="新增會員" color="primary" @click="goToAdd" unelevated />
      <q-btn label="導出 Excel" color="primary" @click="doExcelExport" unelevated />
    </q-form>
    <TabComponent :tabArr='tabArr' :currentTab="currentTab" @update:model-value="handleClick"></TabComponent>
    <TableComponent ref="tableRef" :props-filter="queryFilter" :columns="columns" :pagination="pagination" :handleCallApi="RequestUsers">
      <template v-slot:body-cell-user_number='props'>
        <q-td class="link" @click="goToEdit(props.row.user_id)">
          {{ props.row.user_number }}
        </q-td>
      </template>
      <template v-slot:body-cell-username='props'>
        <q-td>
          <div>{{ getUserNameFormat(props.row.first_name, props.row.last_name) }}</div>
          <div class="text-grey-6">({{ props.row.nickname }})</div>
        </q-td>
      </template>
      <template v-slot:body-cell-created_at='props'>
        <q-td>
          <div>{{ getDateString(props.row.created_at, 'YYYY-MM-DD') }}</div>
          <div class="text-grey-6">
            {{ props.row.MembershipRecords && props.row.MembershipRecords.length > 0
                ? getDateString(props.row.MembershipRecords[0].expired_at, 'YYYY-MM-DD')
                : '' }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-invite_user='props'>
        <q-td v-if="isInviteUser(props.row)" class="link" @click="goInviteDetail(props.row)">
          {{ getUserNameFormat(props.row.register_record.invite_user.first_name, props.row.register_record.invite_user.last_name) }}
          <div class="text-grey-6">({{ props.row.register_record.invite_user.nickname }})</div>
        </q-td>
        <q-td v-else-if="isMarketing(props.row)" class="link" @click="goInviteDetail(props.row)">
          {{ props.row.register_record.marketing.membership_event.title }}
        </q-td>
        <q-td v-else>-</q-td>
      </template>
      <template v-slot:body-cell-operation='props'>
        <q-td>
          <q-btn dense flat icon='edit' @click='goToEdit(props.row.user_id)' />
        </q-td>
      </template>
      <template v-slot:body-cell-intercom="props">
        <q-td>
          <q-icon v-if="props.row.user_id" class="cursor-pointer" name="open_in_new" size="24px" color="primary"
            @click="goIntercom(props.row.user_id)"></q-icon>
        </q-td>
      </template>
    </TableComponent>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { router } from 'src/router';
import { RequestUsers } from 'src/api'
import { columns, tabArr } from './enums';
import { getDateString, getUserNameFormat } from 'src/utils/helpers';
import TabComponent from 'src/components/TabComponent.vue'
import TableComponent from 'components/TableComponent.vue';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import DatePicker from 'src/components/DatePicker.vue';
import XLSX from 'xlsx-js-style'
import to from 'await-to-js'

const filter = reactive({
  search: router.currentRoute.value.query.search || null,
  membership: router.currentRoute.value.query.membership || tabArr[0].val,
  createdAtDuration: router.currentRoute.value.query.start_date && router.currentRoute.value.query.end_date 
    ? {
      from: router.currentRoute.value.query.start_date,
      to: router.currentRoute.value.query.end_date
    } : null,
})
const getFilterParams = () => {
  const params = {};
  if (filter.search) {
    params.search = filter.search;
  }
  if (filter.membership) {
    params.membership = filter.membership;
  }
  if (filter.createdAtDuration && filter.createdAtDuration.from) {
    params.start_date = filter.createdAtDuration.from;
    params.end_date = filter.createdAtDuration.to;
  }
  return params;
}
const queryFilter = computed(() => {
  const params = getFilterParams();
  return Object.assign({}, params)
})

const currentTab = computed(() => {
  return tabArr.find((item) => item.val.toLowerCase() === filter.membership)
})

const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 20, 50]
})

watch(filter, (val) => {
  let query = {}
  if (val.membership) {
    query.membership = val.membership
  }
  if (val.search) {
    query.search = val.search
  }
  if (val.createdAtDuration) {
    query.start_date = val.createdAtDuration.from;
    query.end_date = val.createdAtDuration.to;
  } else {
    delete query.start_date;
    delete query.end_date;
  }
  router.push({ query })
})

onMounted(() => {
  doSearch()
})

const loading = ref(false)
const userLists = ref([])
const doSearch = async () => {
  loading.value = true
  const [err, res] = await to(RequestUsers(filter))
  if (err) {
    console.error('getUsers error:', err)
    return null
  }
  userLists.value = res.data
  loading.value = false
}

const handleClick = (tabItem) => {
  filter.membership = tabItem.val.toLowerCase()
}

const goToAdd = () => {
  router.push({ name: 'AddMember' })
}

const goToEdit = (id) => {
  router.push({
    name: 'EditMember',
    params: { id: id }
  })
}

const goIntercom = (userId) => {
  const url = `https://app.intercom.com/a/apps/rgfj764k/users/${userId}/all-conversations`
  window.open(url, '_blank')
}

const goInviteDetail = (row) => {
  let data = {}
  if (isInviteUser(row)) {
    data = {
      name: 'EditMember',
      params: {
        id: row.register_record.invite_user.user_id
      }
    }
  } else {
    data = {
      name: 'PromotionMembershipCodeList',
      params: {
        promoMembershipId: row.register_record.marketing.membership_event.id
      }
    }
  }
  router.push(data)
}

const isInviteUser = (row) => {
  return row.register_record?.invite_user
}

const isMarketing = (row) => {
  return row.register_record?.marketing
}


/* 導出 Excel Start */
const loadExportData = async (datas, page) => {
  // 搜尋條件
  const params = {
    page: page,
    limit: 50,
    sort: pagination.value.descending ? "desc" : "asc",
    orderBy: pagination.value.sortBy,
    ...getFilterParams()
  };

  const [err, res] = await to(RequestUsers(params));

  if (err) {
    console.error("getUsersList error:", err);
    return;
  }

  datas.push(...res.data);
  if (res.paging.page >= res.paging.total_pages) {
    return;
  }
  await loadExportData(datas, res.paging.page + 1);
}

const $q = useQuasar();
const doExcelExport = async () => {
	if ($q.loading.isActive) {
    return;
  }

  $q.loading.show({ message: "導出Excel資料" });
  let datas = [];
  await loadExportData(datas, 1);
  $q.loading.hide();

  // 整理資料
	const headers = [
    "編號", "稱謂", "姓名(暱稱)", "Email", "會籍", "加入日期", "到期日", "所在地", "年收入", "推薦人(暱稱)", "備註",
  ];
  let excelDatas = datas.map(d => {
    // 姓名(暱稱)
    let user = getUserNameFormat(d.first_name, d.last_name);
    if (d.nickname) {
      user += ` (${d.nickname})`;
    }
    // 推薦人(暱稱)
    let inviteUser = '';
    if (isInviteUser(d)) {
      inviteUser = getUserNameFormat(d.register_record.invite_user.first_name, d.register_record.invite_user.last_name);
      if (d.register_record.invite_user.nickname) {
        inviteUser += ` (${d.register_record.invite_user.nickname})`;
      }
    } else if (isMarketing(d)) {
      inviteUser = d.register_record.marketing.membership_event.title;
    }
    return [
      d.user_number,
      d.title,
      user,
      d.email,
      d.membership_code,
      getDateString(d.created_at, 'YYYY-MM-DD'),
      d.MembershipRecords && d.MembershipRecords.length > 0
        ? getDateString(d.MembershipRecords[0].expired_at, 'YYYY-MM-DD')
        : '',
      d.city,
      d.income,
      inviteUser,
      d.note
    ]
  })
  excelDatas = [headers, ...excelDatas];
  const ws = XLSX.utils.aoa_to_sheet(excelDatas);
  const wsCols = [
    { wpx: 80 }, { wpx: 40 }, { wpx: 160 }, { wpx: 180 }, { wpx: 60 },
    { wpx: 80 }, { wpx: 80 }, { wpx: 160 }, { wpx: 80 }, { wpx: 180 }, { wpx: 120 },
  ]
  ws['!cols'] = wsCols;
  ws['!rows'] = excelDatas.map(d => { return { hpx: 20 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  const filename = `${getDateString(new Date(), "YYYY-MM-DD")}_會員列表.xlsx`;
  XLSX.writeFileXLSX(wb, filename);
}
/* 導出 Excel End */
</script>

<style lang="scss" scoped>
.filter {
  .filter-date {
    min-width: 200px;
  }
}
</style>