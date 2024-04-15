<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class='flex q-my-md'>
      <div class="flex-1 wrap q-gutter-md">
        <q-input v-model="filter.text" outlined dense :debounce="500" placeholder="輸入活動名稱">
          <template v-slot:append>
            <q-icon class='cursor-pointer' name='search' @click="doSearch" />
          </template>
        </q-input>
        <q-select v-model="filter.membership" :options="membershipOptions" emit-value map-options outlined
          dense></q-select>
        <q-select v-model="filter.enabled" :options="EnabledOptions" emit-value map-options outlined dense></q-select>
        <q-select v-model="filter.status" :options="StatusOptions" emit-value map-options outlined dense
          @update:model-value="filter.duration = null"></q-select>
        <q-field v-if="showDuration" class="cursor-pointer" style="min-width: 200px;" label="日期區間"
          :stack-label="dateStackLabel" outlined dense>

          <template #default>
            <DatePicker :date="filter.duration" :range="true" @updated="onDateRangeSelected"></DatePicker>
          </template>

          <template v-slot:control>
            <div v-if="filter.duration">
              {{ filter.duration.from }} ～ {{ filter.duration.to }}
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="flex q-mb-md">
      <q-space></q-space>
      <q-btn color="primary" label="新增會籍活動" @click="doEdit(null)" />
    </div>
    <TableComponent ref='tableRef' :propsFilter='propsfilter' :columns='MembershipColumns'
      :handleCallApi='getPromoMembershipList'>

      <template v-slot:body-cell-title="props">
        <q-td class="link" @click="goMembershipCode(props.row)">
          {{ props.row.title }}
        </q-td>
      </template>

      <template v-slot:body-cell-desc="props">
        <q-td class="overflow-auto" style="max-width: 350px; white-space: inherit;">
          {{ props.row.desc }}
        </q-td>
      </template>

      <template v-slot:body-cell-note="props">
        <q-td class="overflow-auto" style="max-width: 350px; white-space: inherit;">
          {{ props.row.note }}
        </q-td>
      </template>

      <template v-slot:body-cell-duration="props">
        <q-td>
          <div class="flex column items-center">
            <div>{{ getDateString(props.row.start_date, 'YYYY-MM-DD') }}</div>
            <q-icon name="height" size="18px"></q-icon>
            <div>{{ getDateString(props.row.end_date, 'YYYY-MM-DD') }}</div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-amount="props">
        <q-td class="text-center">
          {{ amountInfo(props.row) }}
        </q-td>
      </template>

      <template v-slot:body-cell-operation='props'>
        <q-td>
          <q-btn dense flat icon='edit' @click='doEdit(props.row)' />
          <!-- <q-btn icon="delete" text-color="negative" @click="doDelete(props.row)" rounded dense flat /> -->
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td>
          <q-toggle v-model="props.row.is_disable" :true-value="1" :false-value="0"
            @update:model-value="(val: number) => setStatus([props.row], val)"></q-toggle>
        </q-td>
      </template>
    </TableComponent>
    <EditDialog ref="editDialog" @updated="doSearch"></EditDialog>
    <Confirm ref="confirmRef" @confirm="onDeleteConfirm"></Confirm>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import to from 'await-to-js';
import { getPromoMembershipList, deletePromoMembership, batchUpdatePromoMembershipStatus } from 'src/api'
import { MembershipColumns, StatusOptions, EnabledOptions } from '../enums';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import TableComponent from 'src/components/TableComponent.vue';
import EditDialog from './components/EditDialog.vue';
import DatePicker from 'src/components/DatePicker.vue';
import Confirm from 'src/components/dialog/Confirm.vue';
import { getDateString } from 'src/utils/helpers';
import { useMetaStore } from 'src/stores/meta';

const tableRef = ref();
const editDialog = ref();
const $q = useQuasar();
const router = useRouter();
const metaStore = useMetaStore();
const confirmRef = ref();
const filter = reactive<any>({
  text: null,
  membership: null,
  enabled: EnabledOptions[0].value,
  status: StatusOptions[0].value,
  duration: null
})
const membershipOptions = ref<any>([]);

const doSearch = () => {
  tableRef.value.reload()
}

const doEdit = (item: any) => {
  editDialog.value.show({
    data: item
  });
}

const doDelete = (item: any) => {
  confirmRef.value.show({
    title: '刪除確認',
    message: '確認要刪除嗎？',
    data: item
  });
}

const onDeleteConfirm = async (data: any) => {
  console.log('刪除:', data)
  $q.loading.show();
  const [err, res] = await to(deletePromoMembership(data.id));
  $q.loading.hide();

  if (err) {
    $q.notify({
      type: 'negative',
      message: '會籍活動資料刪除失敗'
    })
    console.error('delete PromoMembership error:', err);
    return;
  }
  doSearch();
}

const goMembershipCode = (row: any) => {
  router.push({
    name: 'PromotionMembershipCodeList',
    params: {
      promoMembershipId: row.id
    },
    state: {
      title: row.title,
      start: getDateString(row.start_date, 'YYYY-MM-DD'),
      end: getDateString(row.end_date, 'YYYY-MM-DD')
    }
  })
}

const setStatus = async (selection: any[], value: number) => {
  console.log('setStatus:', selection);
  $q.loading.show();
  const [err, res] = await to(batchUpdatePromoMembershipStatus({
    promo_ids: selection.map((d: any) => d.id),
    is_disable: value === 1
  }));
  $q.loading.hide();

  if (err) {
    $q.notify({
      type: 'negative',
      message: '更新會籍活動狀態失敗'
    })
    console.error('update PromoMembership status error:', err);
    return;
  }
  doSearch();
}

const onDateRangeSelected = (range: any) => {
  console.log('onDateRangeSelected:', range)
  filter.duration = range
}

const initMembershipOptions = async () => {
  const datas = await metaStore.getMembershipList();
  membershipOptions.value = [
    { label: '所有會籍', value: null },
    ...datas.map((d: any) => {
      return { label: d.title, value: d.id }
    })
  ];
}

const propsfilter = computed(() => {
  return {
    title: filter.text,
    membership: filter.membership,
    is_disable: filter.enabled === null ? null : !filter.enabled,
    status: filter.status,
    start_date: filter.duration?.from,
    end_date: filter.duration?.to
  }
})

const dateStackLabel = computed(() => {
  return !!filter.duration
})

const amountInfo = computed(() => (row: any) => {
  return `${row.success_total}/${row.failed_total}/${row.total}`
})

const showDuration = computed(() => {
  return filter.status === null
})

onMounted(async () => {
  initMembershipOptions();
})

</script>

<style lang="scss" scoped></style>
