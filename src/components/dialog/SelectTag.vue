<template>
  <q-dialog class="common-dialog" v-model="isShow">
    <q-card class="dialog-inner">
      <q-card-section class="sticky-top">
        <div class="flex">
          <div class="text-h6 text-primary">
            {{ `${state.targetTypeName} 標籤選擇` }}
          </div>
          <q-space></q-space>
          <q-btn icon="close" v-close-popup rounded flat dense></q-btn>
        </div>
      </q-card-section>
      <q-card-section class="content row items-center">
        <div class="flex-1 column">
          <div class="flex-1 column q-pb-sm">
            <div class="flex items-center q-pb-xs">
              <q-input v-model="searchData.tagName" label="標籤名稱" :debounce="500" dense autofocus
                @keydown.enter="getList()">
                <template v-slot:append>
                  <q-icon name="search" @click="getList()" class="cursor-pointer" />
                </template>
              </q-input>
              <div class="q-ml-md">
                <q-btn icon="add" color="positive" size="xs" round @click="doAddTag">
                  <q-tooltip>新增標籤</q-tooltip>
                </q-btn>
              </div>
              <q-space></q-space>
              <div v-if="props.multiple" class="flex self-end text-grey-6 q-pb-xs">
                {{ `已選擇標籤數量：${selection.length}` }}
              </div>
            </div>
            <div v-if="props.multiple" class="selection-container">
              <q-chip v-for="(data, index) of selection" :key="index" :removable="isRemovable(data)"
                :color="props.tagColor" :text-color="props.tagTextColor" :label="data.name" size="sm"
                @remove="onRemove(data)"></q-chip>
            </div>
          </div>
        </div>
        <q-table class="full-width data-table" v-model:selected="selection" :rows-per-page-options="[10, 20, 50]"
          :rows="records" :columns="columns" row-key="id" binary-state-sort :hide-no-data="isLoading"
          :hide-selected-banner="true" :loading="isLoading" :selection="selectionType" :virtual-scroll="true"
          :dense="dense" @row-click="onRowClick">
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
          <template v-slot:header-selection="scope">
            <q-checkbox v-model="scope.selected" :checked-icon="checkedIcon" :unchecked-icon="uncheckedIcon"
              :dense="dense" />
          </template>
          <template v-slot:body-selection="scope">
            <q-checkbox v-model="scope.selected" :checked-icon="checkedIcon" :unchecked-icon="uncheckedIcon"
              :dense="dense" />
          </template>
        </q-table>
      </q-card-section>
      <q-card-actions class="sticky-bottom" align="right">
        <q-btn class="dialog-button" label="取消" color="primary" outline v-close-popup />
        <q-btn class="dialog-button" label="確認" color="primary" @click="onSelected" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <tag-edit-dialog ref="tagEditDialogRef" @updated="getList()"></tag-edit-dialog>
</template>
<script setup>
import { ref, reactive, toRefs, watch, computed, provide } from "vue";
import { RequestTagList } from "src/api";
import TagEditDialog from "src/pages/TagSet/components/TagEditDialog.vue";
import { useMetaStore } from "src/stores/meta";

const to = require("await-to-js").default;

const emit = defineEmits(['selected']);
const props = defineProps({
  multiple: { // 是否多選，預設true，日後可調整單選
    type: Boolean,
    default() {
      return true
    }
  },
  tagColor: {
    type: String,
    default() {
      return "green-7"
    }
  },
  tagTextColor: {
    type: String,
    default() {
      return "grey-1"
    }
  },
  maxLength: {
    type: Number,
    default() {
      return null
    }
  },
  dense: {
    type: Boolean,
    default() {
      return true
    }
  }
});
provide('fixed-tag-type', true);
provide('max-name-length', props.maxLength);

const tagEditDialogRef = ref();
const metaStore = useMetaStore();
const isShow = ref(false);
const state = reactive({
  records: [],
  isLoading: false,
  selection: [],
  fixedSelection: [],
  searchData: {
    tagName: null,
  },
  targetTypeId: null,
  targetTypeName: ""
})

const columns = ref([
  {
    name: "name",
    label: "標籤名稱",
    field: "name",
    align: "left",
  },
]);

const getList = async () => {
  state.isLoading = true;
  const [err, res] = await to(RequestTagList({
    tag_type_id: state.targetTypeId,
    name: state.searchData.tagName
  }))

  state.isLoading = false;

  if (err || !res.data) {
    console.error('getTagList error:', err);
    state.records = [];
    return;
  }
  state.records = res.data;
}

const show = ({ tagTypeId, tagTypeName, selection = [], fixedSelection = [] }) => {
  isShow.value = true;
  state.searchData.tagName = null;
  state.targetTypeId = tagTypeId;
  state.targetTypeName = tagTypeName;
  state.selection = [...selection, ...fixedSelection];
  state.fixedSelection = fixedSelection
  getList();
};

const selectionType = computed(() => {
  return props.multiple ? "multiple" : "single";
})

const checkedIcon = computed(() => {
  return props.multiple ? 'check_box' : 'radio_button_checked'
})

const uncheckedIcon = computed(() => {
  return props.multiple ? 'check_box_outline_blank' : 'radio_button_unchecked'
})

const onRowClick = (event, row, index) => {
  const selected = state.selection.find(d => Number(d.id) === Number(row.id));
  if (selected) {
    onRemove(row);
  } else {
    if (!props.multiple) {
      state.selection = [];
    }
    state.selection.push(row);
  }
};

const onSelected = () => {
  let datas = [];
  datas = state.selection.map(d => {
    return {
      id: Number(d.id),
      name: d.name
    }
  })
  emit('selected', {
    selection: datas,
    tagTypeName: state.targetTypeName,
    tagTypeId: state.targetTypeId
  });
};

const onRemove = (data) => {
  // 固定項目不可取消選取
  if (isRemovable(data)) {
    state.selection = state.selection.filter(d => Number(d.id) !== Number(data.id));
  }
};

const isRemovable = (data) => {
  const item = state.fixedSelection.find(d => Number(d.id === Number(data.id)));
  if (item) {
    return false;
  }
  return true;
}

const doAddTag = async () => {
  tagEditDialogRef.value.show({
    type: {
      label: state.targetTypeName,
      value: state.targetTypeId
    },
    typeList: await metaStore.getTagTypeList(),
    hideOnSaved: true,
    // fixedTagType: true
  })
}

watch(
  () => [
    state.searchData.tagName,
  ],
  (_newVal) => {
    getList();
  }
);

const { isLoading, selection, records, searchData } = toRefs(state);
defineExpose({ show });
</script>
<style lang="scss" scoped>
.dialog-inner {
  height: 600px;
  padding-bottom: 0 !important;

  .content {
    padding-top: 0px;
    overflow: hidden;

    .selection-container {
      position: relative;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      height: 60px;
      width: 100%;
      overflow: scroll;
      border: 1px dashed $grey-6;
      border-radius: 6px;
      background-color: $grey-1;
    }
  }
}
@media (min-width: 768px) {
  .dialog-inner {
    min-width: 720px !important;
  }
}
</style>
