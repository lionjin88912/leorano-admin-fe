<template>
  <q-dialog v-model="state.visible" persistent>
    <q-card class="container">
      <q-card-section class="flex items-center">
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
              <q-tab content-class="q-px-lg" label="房價基本資料" name="main" />
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
          <q-btn class="action-button" label="Save" color="primary" @click="doSubmit" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useQuasar } from 'quasar';
import { EditMode, localeOptions } from 'src/pages/enums';
import { GetHotelRate, CreateHotelRate, UpdateHotelRate, UpdateHotelRateLang } from 'src/api';
import MainForm from './MainForm.vue';
import LangForm from './LangForm.vue';
import { getDateString } from 'src/utils/helpers';

const to = require('await-to-js').default

// 支援的語系常數
const SUPPORTED_LANGUAGES = ['zh-TW', 'zh-CN'];

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
    state.title = '編輯房價資料';
    state.mode = EditMode.Edit;
    await reloadModel(data.id);
  } else {
    state.title = '新增房價資料';
    state.mode = EditMode.New;
    state.model = createEmptyModel();
  }
};

const reloadModel = async (id) => {
  const [err, res] = await to(GetHotelRate(id));
  if (err) {
    console.error('reload model error:', err);
    return;
  }
  state.model = res.data;
  state.model.bedType = res.data.tags.find(d => d.tag_type_id === 3);
  state.model.views = res.data.tags.filter(d => d.tag_type_id === 10);
  state.model.amenities = res.data.tags.filter(d => d.tag_type_id === 2);

  // 確保語系資料結構正確並補充缺少的語系
  if (!Array.isArray(state.model.langs)) {
    state.model.langs = [];
  }
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    if (!state.model.langs.find(d => d.lang === lang)) {
      state.model.langs.push({ lang, name: '', desc: '' });
    }
  });
}

const createEmptyModel = () => {
  return {
    name: null,
    code: null,
    hotel_code: null,
    has_breakfast: false,
    startDate: null,
    endDate: null,
    tags: [],
    summary: null,
    desc: null,
    langs: SUPPORTED_LANGUAGES.map(lang => ({ lang, name: '', desc: '' }))
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
  const api = isEdit.value ? UpdateHotelRate(data.id, data) : CreateHotelRate(data);
  const [err, res] = await to(api);
  $q.loading.hide();

  if (err) {
    console.error('CreateHotelRate error:', err);
    return;
  }
  
  // 如果是新建模式，切換到編輯模式並保持對話框開啟，讓用戶可以繼續編輯語系
  if (state.mode === EditMode.New) {
    state.mode = EditMode.Edit;
    state.title = '編輯房價資料';
    await reloadModel(res.data.id);
    $q.notify({
      type: 'positive',
      message: '房價基本資料已保存，現在可以編輯語系設定'
    });
  } else {
    // 編輯模式下保存基本資料後關閉對話框
    state.visible = false;
    reloadModel(res.data.id);
    emit('updated');
  }
}

const doLangSubmit = async () => {
  // 先驗證基本資料表單
  if (!await mainForm.value.validate()) {
    console.warn("房價基本資料表單驗證未通過");
    $q.notify({
      type: 'negative',
      message: '請先完整填寫房價基本資料'
    });
    state.currentTab = 'main'; // 切換到基本資料頁面
    return;
  }
  
  // 再驗證語系表單
  if (!await langForm.value.validate()) {
    console.warn("語系資料表單驗證未通過");
    return;
  }
  
  // 更新當前編輯的語系資料到 model 中
  const currentData = langForm.value.getModel();
  const currentLangIndex = state.model.langs.findIndex(d => d.lang === state.currentLocale.value);
  if (currentLangIndex >= 0) {
    state.model.langs[currentLangIndex] = { ...state.model.langs[currentLangIndex], ...currentData };
  }
  
  $q.loading.show();
  
  try {
    // 1. 先保存基本資料
    const mainData = mainForm.value.getModel();
    const mainApi = isEdit.value ? UpdateHotelRate(mainData.id, mainData) : CreateHotelRate(mainData);
    const [mainErr, mainRes] = await to(mainApi);
    
    if (mainErr) {
      console.error('保存基本資料失敗:', mainErr);
      $q.notify({
        type: 'negative',
        message: '房價基本資料保存失敗'
      });
      return;
    }
    
    // 2. 再保存所有語系資料
    const rateId = mainRes.data.id;
    const langPromises = state.model.langs.map(langData => 
      UpdateHotelRateLang(rateId, langData.lang, langData)
    );
    
    const langResults = await Promise.allSettled(langPromises);
    
    // 檢查語系保存結果
    const langErrors = langResults.filter(result => result.status === 'rejected');
    
    if (langErrors.length > 0) {
      console.error('部分語系資料保存失敗:', langErrors);
      $q.notify({
        type: 'warning',
        message: `基本資料已保存，但語系資料保存失敗 (${langErrors.length}/${langResults.length})`
      });
    } else {
      $q.notify({
        type: 'positive',
        message: '房價基本資料和所有語系資料已成功保存'
      });
    }
    
    state.visible = false;
    reloadModel(rateId);
    emit('updated');
    
  } catch (error) {
    console.error('保存過程發生錯誤:', error);
    $q.notify({
      type: 'negative',
      message: '保存失敗，請重試'
    });
  } finally {
    $q.loading.hide();
  }
}

const getMainModel = computed(() => {
  return state.model;
})
const getLangModel = computed(() => {
  const langData = state.model.langs.find(d => d.lang === state.currentLocale.value);
  return langData || { lang: state.currentLocale.value, name: '', desc: '' };
})

// 監聽語系切換，保存當前編輯的資料
watch(state.currentLocale, (newVal, oldVal) => {
  if (oldVal && langForm.value) {
    // 保存之前語系的編輯資料
    const currentData = langForm.value.getModel();
    const oldLangIndex = state.model.langs.findIndex(d => d.lang === oldVal);
    if (oldLangIndex >= 0) {
      state.model.langs[oldLangIndex] = { ...state.model.langs[oldLangIndex], ...currentData };
    }
  }
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
