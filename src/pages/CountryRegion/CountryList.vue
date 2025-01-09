<template>
  <div>
    <section class="row justify-between q-mb-lg">
      <q-input v-model="searchText" :debounce="500" style="width: 240px" placeholder="國家名稱" dense outlined>
        <template v-slot:append>
          <q-icon class="cursor-pointer" name="search" @click="doSearch" />
        </template>
      </q-input>
      <q-btn color="primary" label="新增國家" @click="doEdit(null)" />
    </section>
    <q-table class="data-table" :rows="countryList" :columns="countryColumns" :loading="loading"
      :rows-per-page-options="[50, 20, 10]">
      <template v-slot:body-cell-name="props">
        <q-td class="link" @click="doEdit(props.row)">
          {{ props.row.name }}
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td>
          <div class="flex no-wrap items-center justify-center q-gutter-sm">
            <q-btn icon="edit" text-color="primary" @click="doEdit(props.row)" rounded dense flat />
            <q-btn icon="delete" text-color="negative" @click="doDelete(props.row)" rounded dense flat />
          </div>
        </q-td>
      </template>
    </q-table>
    <CountryEditDialog ref="editDialog" @updated="doSearch"></CountryEditDialog>
    <Confirm ref="confirmRef" @confirm="onDeleteConfirm"></Confirm>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { countryColumns } from './enums'
import { router } from 'src/router'
import CountryEditDialog from './components/CountryEditDialog.vue'
import Confirm from 'src/components/dialog/Confirm.vue'
import { DeleteCountry } from 'src/api'
import to from 'await-to-js'

const $q = useQuasar();
const editDialog = ref();
const confirmRef = ref();
const loading = ref(false)
const searchText = ref(router.currentRoute.value.query.keyword ? router.currentRoute.value.query.keyword : '');

const emit = defineEmits(['country-reload'])
const props = defineProps({
  countryList: {
    type: Array,
    default() {
      return [];
    }
  }
});

const doEdit = (item) => {
  editDialog.value.show({
    data: item
  });
}

const doDelete = (item) => {
  confirmRef.value.show({
    title: '刪除確認',
    message: '確認要刪除嗎？',
    data: item
  });
}

const onDeleteConfirm = async (data) => {
  $q.loading.show();
  const [err, res] = await to(DeleteCountry(data.id));
  $q.loading.hide();

  if (err) {
    console.error('delete country error:', err);
    return;
  }
  doSearch();
}

const doSearch = () => {
  const name = searchText.value.trim().length > 0 ? searchText.value : null;
  emit('country-reload', {
    name: name
  });
}

watch(searchText, (_newVal) => {
  let query = { ...router.currentRoute.value.query };
  if (_newVal) {
    query.keyword = _newVal;
  } else {
    delete query.keyword;
  }
  router.push({ query });
});

</script>
