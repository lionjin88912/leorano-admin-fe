<template>
  <div>
    <section class="row justify-between q-mb-lg">
      <div class="flex q-gutter-sm">
        <q-select v-model="filter.type" label="標籤類型" :options="typeOptions" emit-value map-options dense outlined use-input fill-input
          hide-selected @update:model-value="doSearch" @filter="onFilter"></q-select>
        <q-input v-model="filter.text" :debounce="500" style="width: 240px" placeholder="Search" dense outlined>
          <template v-slot:append>
            <q-icon class="cursor-pointer" name="search" @click="doSearch" />
          </template>
        </q-input>
      </div>
      <q-btn color="primary" label="新增標籤" @click="doEdit(null)" />
    </section>
    <q-table class="data-table" :rows="tagList" :columns="tagColumns" :loading="loading"
      :rows-per-page-options="[50, 20, 10]" binary-state-sort>
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
    <TagEditDialog ref="editDialog" @updated="doSearch"></TagEditDialog>
    <Confirm ref="confirmRef" @confirm="onDeleteConfirm"></Confirm>
    <UpdateRelationDialog ref="relationRef" @updated="doSearch"></UpdateRelationDialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { tagColumns } from './enums'
import { router } from 'src/router'
import _ from "lodash";
import to from 'await-to-js'
import { getTagRelations, deleteTag } from 'src/api'
import TagEditDialog from './components/TagEditDialog.vue'
import Confirm from 'src/components/dialog/Confirm.vue'
import UpdateRelationDialog from './components/UpdateRelationDialog.vue';

const $q = useQuasar();
const editDialog = ref();
const confirmRef = ref();
const relationRef = ref();
const loading = ref(false)
const allOptions = ref([]);
const typeOptions = ref([]);
const searchText = ref();
const filter = reactive({
  type: router.currentRoute.value.query.tag_type_id ? parseInt(router.currentRoute.value.query.tag_type_id) : null,
  text: router.currentRoute.value.query.keyword || null
})

const emit = defineEmits(['tag-reload'])
const props = defineProps({
  typeList: {
    type: Array,
    default() {
      return [];
    }
  },
  tagList: {
    type: Array,
    default() {
      return [];
    }
  }
});

const doEdit = (item) => {
  editDialog.value.show({
    data: item,
    type: filter.type,
    typeList: allOptions.value
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
  // console.log('刪除:', data)
  $q.loading.show({
    message: '檢查標籤使用狀態'
  })

  const [err, res] = await to(getTagRelations(data.id))
  $q.loading.hide()

  if (err) {
    console.error('get tag relations error:', err)
    return
  }

  if (hasRelation(res.data)) {
    console.info('標籤被使用')
    // replace or delete
    relationRef.value.show({
      data: res.data,
      typeList: typeOptions.value
    })
  } else {
    console.info('標籤未被使用')
    $q.loading.show()
    const [err, res] = await to(deleteTag(data.id))
    $q.loading.hide()
    if (err) {
      console.error('delete tag error:', err)
      return
    }
    doSearch()
  }
}

const hasRelation = (data) => {
  const checklist = ['notifies', 'plans', 'rates', 'rooms']
  for (let key of checklist) {
    if (data.hasOwnProperty(key) && data[key].length > 0) {
      return true
    }
  }
  return false
}

const doSearch = () => {
  if (!filter.type) {
    return;
  }
  const data = {
    typeId: filter.type,
    name: filter.text
  };
  // console.log('doSearch data:', data)
  emit('tag-reload', data);
}

// const filteredTypeOptions = computed(() => {
//   if (typeFilterText.value) {
//     return typeOptions.value.filter(d => _.toLower(d.label).includes(_.toLower(typeFilterText.value.trim())))
//   }
//   return typeOptions.value;
// });

// const onFilterType = (val) => {
//   typeFilterText.value = val;
// }
const onFilter = (val, update, abort) => {
  update(() => {
    if (val) {
      typeOptions.value = allOptions.value.filter(d => _.toLower(d.label).includes(_.toLower(val)))
    } else {
      typeOptions.value = allOptions.value
    }
  })
}

watch(filter, (newVal) => {
  let query = { ...router.currentRoute.value.query };
  if (newVal.type) {
    query.tag_type_id = newVal.type;
  } else {
    delete query.tag_type_id;
  }
  if (newVal.text) {
    query.keyword = newVal.text;
  } else {
    delete query.keyword;
  }
  router.push({ query });
});

watch(() => props.typeList, (newVal) => {
  if (newVal.length > 0) {
    allOptions.value = newVal.map(d => {
      return {
        label: d.name,
        value: d.id,
        code: d.code
      }
    });
    typeOptions.value = allOptions.value
    filter.type = router.currentRoute.value.query.tag_type_id ? parseInt(router.currentRoute.value.query.tag_type_id) : allOptions.value[0].value;
  }
})

</script>
