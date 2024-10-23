<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <q-form class='row q-my-md'>
      <q-input v-model='filter.search' dense :debounce="500" style='width: 240px' outlined
        placeholder='會員姓名、Email、電話'>
        <template v-slot:append>
          <q-icon class='cursor-pointer' name='search' @click="doSearch" />
        </template>
      </q-input>
      <q-space />
    </q-form>
    <div class="flex justify-between">
      <TabComponent :tabArr='tabArr' @update:model-value="handleClick"></TabComponent>
      <div class=" q-gutter-sm">
        <q-btn label="新增會員" color="primary" @click="goToAdd()" />
      </div>
    </div>
    <q-table :loading='loading' no-data-label='無資料' :rows='userLists' :columns='columns' :pagination="pagination" :rows-per-page-options="pagination.rowsPerPageOptions" class="data-table" flat bordered>
      <template v-slot:body-cell-user_number='props'>
        <q-td class="link" @click="goToEdit(props.row.user_id)">
          {{ props.row.user_number }}
        </q-td>
      </template>
      <template v-slot:body-cell-username='props'>
        <q-td>
          <div>{{ props.row.first_name }} {{ props.row.last_name }}</div>
          <div class="text-grey-6">({{ props.row.nickname }})</div>
        </q-td>
      </template>
      <template v-slot:body-cell-SpendingAmount='props'>
        <q-td v-if="props.row.SpendingAmount">{{ props.row.SpendingAmount }}</q-td>
        <q-td v-else>-</q-td>
      </template>
      <template v-slot:body-cell-invite_user='props'>
        <q-td v-if="isInviteUser(props.row)" class="link" @click="goInviteDetail(props.row)">
          {{ props.row.register_record.invite_user.first_name }} {{ props.row.register_record.invite_user.last_name }}
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
    </q-table>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { router } from 'src/router';
import TableComponent from 'components/TableComponent.vue';
import { RequestUsers } from 'src/api'
import { columns, tabArr } from './enums';
import TabComponent from 'src/components/TabComponent.vue'
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import to from 'await-to-js'

const filter = reactive({
  membership: tabArr[0].val,
  search: null
})

const pagination = ref({
  sortBy: 'user_number',
  descending: false,
  rowsPerPage: 10,
  rowsPerPageOptions: [10, 20, 50]
})

watch(filter, (val) => {
  doSearch()
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
  filter.membership = tabItem.val
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
  if (isInviteUser.value(row)) {
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

const isInviteUser = computed(() => (row) => {
  return row.register_record?.invite_user
})

const isMarketing = computed(() => (row) => {
  return row.register_record?.marketing
})
</script>
