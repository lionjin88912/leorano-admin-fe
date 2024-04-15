<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class='flex q-my-md'>
      <div class="flex-1 wrap q-gutter-md">
        <!-- <q-select v-model="filter.tag" style="min-width: 140px;" :options="tagOptions" label="推播標籤" emit-value map-options
          outlined dense></q-select>
        <q-select v-model="filter.status" style="min-width: 140px;" :options="EnabledOptions" label="狀態" emit-value
          map-options outlined dense></q-select> -->
        <q-space></q-space>
        <q-btn color="primary" label="新增行銷通知" @click="doEdit(null)" />
      </div>
    </div>
    <TableComponent ref='tableRef' :propsFilter='propsfilter' :columns='MarketingColumns'
      :handleCallApi='getMarketingNotifyList'>
      <template v-slot:body-cell-title="props">
        <q-td class="link" @click="doEdit(props.row)">
          {{ props.row.title }}
        </q-td>
      </template>
      <template v-slot:body-cell-tag="props">
        <q-td align="center">
          <q-chip :label="props.row.tag.name" color="green-7" text-color="grey-1" size="md"></q-chip>
        </q-td>
      </template>
      <template v-slot:body-cell-rule="props">
        <q-td>
          <template v-for="(desc, index) of getRuleDescs(props.row)" :key="index">
            <div class="flex no-wrap q-gutter-x-sm">
              <div>{{ desc.title }}</div>
              <div class="text-bold">{{ desc.text }}</div>
            </div>
          </template>
        </q-td>
      </template>
      <template v-slot:body-cell-start_date="props">
        <q-td align="center">
          <div>{{ helpers.getDateString(props.row.date_range.start_date, 'YYYY-MM-DD') }}</div>
          <q-icon name="height" color="grey-6" size="18px"></q-icon>
          <div>{{ helpers.getDateString(props.row.date_range.end_date, 'YYYY-MM-DD') }}</div>
        </q-td>
      </template>
      <template v-slot:body-cell-time="props">
        <q-td>
          <template v-for="(desc, index) of getTimeDescs(props.row)" :key="index">
            <div class="flex column items-center q-gutter-x-sm">
              <div>{{ desc.frequency.join(', ') }}</div>
              <div class="text-bold">{{ desc.time }}</div>
            </div>
          </template>
        </q-td>
      </template>
      <template v-slot:body-cell-target="props">
        <q-td align="center">
          {{ getTarget(props.row) }}
        </q-td>
      </template>
      <template v-slot:body-cell-content="props">
        <q-td>
          <div v-for="(text, index) of props.row.content.split('\n')" :key="index">
            {{ text }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-applink="props">
        <q-td align="center">
          <div class="flex column justify-center">
            <div>{{ props.row.link.title }}</div>
            <div class="flex no-wrap justify-center cursor-pointer text-primary q-gutter-x-xs"
              @click="openLink(props.row.link.path)">
              <div>{{ props.row.link.text }}</div>
              <q-icon name="open_in_new" size="20px"></q-icon>
            </div>
          </div>
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
          <q-toggle v-model="props.row.status" :true-value="true" :false-value="false"
            @update:model-value="(val: boolean) => setStatus([props.row], val)"></q-toggle>
        </q-td>
      </template>
    </TableComponent>
    <EditDialog ref="editDialog" @updated="doSearch"></EditDialog>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router';
import to from 'await-to-js';
import { useMetaStore } from 'src/stores/meta';
import { getMarketingNotifyList, deleteMarketingNotify, getMarketingNotify, batchUpdateMarketingNotifyStatus } from 'src/api'
import { MarketingColumns, EnabledOptions, DuringOptions, ConductOptions, FrequencyOptions } from '../enums';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import TableComponent from 'src/components/TableComponent.vue';
import EditDialog from './components/EditDialog.vue';
import * as helpers from 'src/utils/helpers.js';
import { MarketingNotify } from 'src/model';

const tableRef = ref();
const editDialog = ref();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const metaStore = useMetaStore();

const filter = reactive<any>({
  tag: null,
  status: null,
})
const tagOptions = ref<any>([
  { label: '所有推播標籤', value: null }
]);
const membershipOptions = ref<any>([]);

const doSearch = () => {
  tableRef.value.reload()
}

const doEdit = (item: any) => {
  editDialog.value.show({
    data: item,
  });
}

const setStatus = async (selection: any[], value: boolean) => {
  console.log('setStatus:', selection);
  $q.loading.show();
  const [err, res] = await to(batchUpdateMarketingNotifyStatus({
    notification_ids: selection.map((d: any) => d.id),
    status: value
  }));
  $q.loading.hide();

  if (err) {
    $q.notify({
      type: 'negative',
      message: '更新行銷通知狀態失敗'
    })
    console.error('update MarketingNotify status error:', err);
    return;
  }
  doSearch();
}

const getRuleDescs = (row: MarketingNotify) => {
  let conduct = []
  for (let c of row.rule.conducts) {
    conduct.push(ConductOptions.find((d: any) => d.value === c)?.label)
  }
  if (conduct.length <= 0) {
    conduct.push('不拘')
  }
  const list = [];
  list.push({
    title: '期間：',
    text: DuringOptions.find((d: any) => d.value === row.rule.during)?.label || (`未知選項:${row.rule.during}`)
  })
  list.push({
    title: '行為：',
    text: conduct.join('、')
  })
  return list;
}

const getTimeDescs = (row: MarketingNotify) => {
  return [{
    frequency: row.frequency?.length >= 7 ? ['每日'] : row.frequency?.map((d: number) => FrequencyOptions.find((f: any) => f.value === d)?.label),
    time: row.action_time
  }]
}

const getTarget = (row: MarketingNotify) => {
  if (row.accept.type === 'membership') {
    if (row.accept.data === 0) {
      return '所有會籍'
    } else {
      return membershipOptions.value.find((d: any) => d.value === row.accept.data)?.label || '未知'
    }
  } else {
    return membershipOptions.value.find((d: any) => d.value === row.accept.type)?.label
  }
}

const initMembershipOptions = async () => {
  const datas = await metaStore.getMembershipList();
  membershipOptions.value = [
    { label: '所有會籍', value: 'membership' },
    ...datas.map((d: any) => {
      return { label: d.title, value: d.id }
    }),
    { label: 'Excel匯入', value: 'import' },
    { label: '自訂', value: 'users' },
  ];
}

const openLink = (url: string) => {
  if (!url) {
    return
  }
  window.open(url, '_blank')
}

const propsfilter = computed(() => {
  return {
    title: filter.text,
    membership: filter.membership,
    enabled: filter.enabled,
    status: filter.status,
    start_date: filter.duration?.from,
    end_date: filter.duration?.to
  }
})

const openDialog = async (id: number) => {
  const [err, res] = await to(getMarketingNotify(id))
  if (err) {
    console.error('get MarketingNotify error:', err)
    return
  }
  doEdit(res.data)
}

onMounted(async () => {
  await initMembershipOptions()
  if (route.query.id) {
    openDialog(Number(route.query.id))
  }
})

</script>

<style lang="scss" scoped></style>
