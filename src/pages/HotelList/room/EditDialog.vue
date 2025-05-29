<template>
  <q-dialog v-model="state.visible" persistent>
    <q-card class="container">
      <q-card-section class="flex items-center q-pb-none">
        <div class="text-h6">{{ state.title }}</div>
        <q-space></q-space>
        <q-btn icon="close" flat dense rounded v-close-popup />
      </q-card-section>
      <q-card-section class="content">
        <div class="full-width">
          <div v-if="isEdit">
            <div class="flex justify-end q-gutter-x-lg">
              <div class="flex">
                <div class="text-grey-9 q-pr-xs">資料建立日:</div>
                <div class="text-bold text-grey-5">
                  {{ getDateString(state.model.created_at, 'YYYY-MM-DD HH:mm') || '-' }}
                </div>
              </div>
              <div class="flex">
                <div class="text-grey-9 q-pr-xs">最後更新日: </div>
                <div class="text-bold text-grey-5">
                  {{ getDateString(state.model.updated_at, 'YYYY-MM-DD HH:mm') || '-' }}
                </div>
              </div>
            </div>
            <q-tabs v-model="state.currentTab" class="text-grey-8" active-color="primary" indicator-color="primary"
              narrow-indicator no-caps align="left">
              <q-tab content-class="q-px-lg" label="房型基本資料" name="main" />
              <q-tab content-class="q-px-lg" label="語系設定" name="lang" :disable="!isEdit" />
            </q-tabs>
            <q-separator></q-separator>
          </div>
          <q-scroll-area class="content-scroll">
            <q-tab-panels v-model="state.currentTab" keep-alive animated>
              <q-tab-panel name="main" class="q-px-none">
                <main-form ref="mainForm" :data="state.model" :hotelData="props.hotelData"></main-form>
              </q-tab-panel>
              <q-tab-panel name="lang" class="q-px-none">
                <div class="flex items-center justify-center q-gutter-md q-pb-md">
                  <div class="text-bold text-grey-6">當前編輯語系</div>
                  <q-select v-model="state.currentLocale" :options="editLocaleOptions" dense borderless></q-select>
                </div>
                <lang-form ref="langForm" :main-data="getMainModel" :data="getLangModel"></lang-form>
              </q-tab-panel>
            </q-tab-panels>
          </q-scroll-area>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="">
        <div class="flex items-center q-pr-lg q-gutter-lg bg-white">
          <q-btn class="action-button" label="Cancel" color="primary" outline v-close-popup />
          <q-btn class="action-button" label="Save" color="primary" @click="doSubmit" v-close-popup />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useQuasar } from 'quasar';
import { EditMode, localeOptions } from 'src/pages/enums';
import { GetHotelRoom, CreateHotelRoom, UpdateHotelRoom, UpdateHotelRoomLang } from 'src/api';
import MainForm from './MainForm.vue';
import LangForm from './LangForm.vue';
import { getDateString } from 'src/utils/helpers';

const to = require('await-to-js').default

const emit = defineEmits(['updated'])
const props = defineProps({
  hotelData: Object
});
const $q = useQuasar();

const mainForm = ref();
const langForm = ref();
const editLocaleOptions = [...localeOptions.slice(1)];
const state = reactive({
  mode: EditMode.New,
  visible: false,
  title: '',
  currentTab: 'main',
  currentLocale: editLocaleOptions[0],
  model: {},
});

const show = async ({ data }) => {
  state.currentTab = 'main';
  state.visible = true;

  if (data) {
    state.title = '編輯房型資料';
    state.mode = EditMode.Edit;
    await reloadModel(data.id);
  } else {
    state.title = '新增房型資料';
    state.mode = EditMode.New;
    state.model = createEmptyModel();
  }
};

const reloadModel = async (id) => {
  const [err, res] = await to(GetHotelRoom(id));
  if (err) {
    console.error('reload model error:', err);
    return;
  }
  state.model = res.data;
  state.model.bedType = res.data.tags.find(d => d.tag_type_id === 3);
  state.model.views = res.data.tags.filter(d => d.tag_type_id === 10);
  state.model.amenities = res.data.tags.filter(d => d.tag_type_id === 2);

  if (!state.model.langs || state.model.langs.length === 0) {
    // 如果沒有語系資料，則新增一個主語系的空資料
    state.model.langs = [
      { lang: 'zh-TW', name: '', summary: '', desc: '' },
      { lang: 'zh-CN', name: '', summary: '', desc: '' }
    ];
  }
}

const createEmptyModel = () => {
  return {
    name: null,
    code: null,
    hotel_code: null,
    max_guest_number: 1,
    bedType: null,
    size: null,
    views: [],
    amenities: [],
    summary: null,
    desc: null,
    photos: [],
    langs: {}
  }
}

const isEdit = computed(() => {
  return state.mode === EditMode.Edit;
})

/**
 * 是否為主語系編輯
 */
const isMainEdit = computed(() => {
  return state.currentTab === "main";
})

const doSubmit = () => {
  if (isMainEdit.value) {
    doMainSubmit();
  } else {
    doLangSubmit();
  }
}

const doMainSubmit = async () => {
  if (!await mainForm.value.validate()) {
    console.warn("表單驗證未通過");
    return;
  }
  const data = mainForm.value.getModel();
  // console.log("mainSubmit:", data);
  $q.loading.show();

  const api = isEdit.value ? UpdateHotelRoom(data.id, data) : CreateHotelRoom(data);
  const [err, res] = await to(api);
  $q.loading.hide();

  if (err) {
    console.log('CreateHotelRoom error:', err);
    return;
  }
  // state.visible = false;
  reloadModel(res.data.id);
  emit('updated');
}

const doLangSubmit = async () => {
  if (!await langForm.value.validate()) {
    console.warn("表單驗證未通過");
    return;
  }
  const locale = state.currentLocale.value;
  const data = langForm.value.getModel();
  // console.log("langSubmit:", data);
  $q.loading.show();

  const [err, res] = await to(UpdateHotelRoomLang(state.model.id, locale, data));
  $q.loading.hide();

  if (err) {
    console.log('Update Lang error:', err);
    return;
  }
  reloadModel(state.model.id);
  emit('updated');
}

const getMainModel = computed(() => {
  return state.model;
})
const getLangModel = computed(() => {
  const langData = state.model.langs.find(d => d.lang === state.currentLocale.value);
  return langData || createEmptyModel();
})

defineExpose({
  show
});

</script>
<style lang="scss" scoped>
.container {
  padding: 0px 0px 16px;
  min-width: 450px;
  max-width: 100%;
  overflow: hidden;

  .content {
    &-title {
      font-weight: bold;
      font-size: 18px;
      padding: 8px 8px;
    }

    &-scroll {
      width: 720px;
      height: 400px;
    }
  }

  .action-button {
    min-width: 100px !important;
  }
}
</style>
