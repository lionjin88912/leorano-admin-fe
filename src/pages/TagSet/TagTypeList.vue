<template>
  <div>
    <section class="row justify-between q-mb-lg">
      <q-input v-model="searchText" :debounce="500" style="width: 240px" placeholder="Search" dense outlined>
        <template v-slot:append>
          <q-icon class="cursor-pointer" name="search" @click="doSearch" />
        </template>
      </q-input>
      <q-btn color="primary" label="新增標籤類型" @click="doEdit(null)" />
    </section>
    <q-table class="data-table" :rows="typeList" :columns="typeColumns" :loading="loading"
      :rows-per-page-options="[50, 20, 10]" row-key="name" binary-state-sort>
      <template v-slot:body-cell-name="props">
        <q-td class="link" @click="doEdit(props.row)">
          {{ props.row.name }}
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td>
          <div class="flex no-wrap items-center justify-center q-gutter-sm">
            <q-btn icon="edit" text-color="primary" @click="doEdit(props.row)" rounded dense flat />
            <!-- <q-btn icon="delete" text-color="negative" @click="deleteTag(props.row)" rounded dense flat /> -->
          </div>
        </q-td>
      </template>
    </q-table>
    <TagTypeEditDialog ref="editDialog" @updated="doSearch"></TagTypeEditDialog>
    <Confirm ref="confirmRef" @confirm="onDeleteConfirm"></Confirm>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { typeColumns } from './enums'
import { router } from 'src/router'
import TagTypeEditDialog from './components/TagTypeEditDialog.vue'
import Confirm from 'src/components/dialog/Confirm.vue'

const to = require('await-to-js').default

const editDialog = ref();
const confirmRef = ref();
const loading = ref(false)
const searchText = ref(router.currentRoute.value.query.keyword ? router.currentRoute.value.query.keyword : '');

const emit = defineEmits(['type-reload'])
const props = defineProps({
  typeList: {
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

const deleteTag = (item) => {
  confirmRef.value.show({
    title: '刪除確認',
    message: '確認要刪除嗎？',
    data: item
  });
}

const onDeleteConfirm = (data) => {
  console.log('刪除:', data)
  // TODO:
}

const doSearch = () => {
  const name = searchText.value && searchText.value.trim().length > 0 ? searchText.value : null;
  emit('type-reload', {
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
