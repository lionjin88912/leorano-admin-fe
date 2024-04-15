<template>
  <q-dialog class="common-dialog" v-model="visible" persistent>
    <q-card class="container">
      <q-card-section class="sticky-top">
        <div class="flex">
          <div class="text-h6">{{ title }}</div>
          <q-space></q-space>
          <q-btn icon="close" flat dense rounded v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="content">
        <div class="full-width">
          <div v-if="isEdit">
            <q-tabs v-model="currentTab" class="text-grey-8" align="justify" active-color="primary"
              indicator-color="primary" narrow-indicator no-caps dense>
              <q-tab content-class="q-px-lg" label="城市基本資料" name="main" />
              <q-tab content-class="q-px-lg" label="語系設定" name="lang" :disable="!isEdit" />
            </q-tabs>
            <q-separator></q-separator>
          </div>
          <q-scroll-area class="content-scroll">
            <q-tab-panels v-model="currentTab" keep-alive animated>
              <q-tab-panel name="main" class="q-px-none">
                <city-main-form ref="mainForm" :data="model" :country-options="countryOptions"
                  :country="currentCountry"></city-main-form>
              </q-tab-panel>
              <q-tab-panel name="lang" class="q-px-none">
                <div class="flex items-center justify-center q-gutter-md q-pb-md">
                  <div class="text-bold text-grey-6">當前編輯語系</div>
                  <q-select v-model="currentLocale" :options="editLocaleOptions" dense borderless></q-select>
                </div>
                <city-lang-form ref="langForm" :main-data="getMainModel" :data="getLangModel"></city-lang-form>
              </q-tab-panel>
            </q-tab-panels>
          </q-scroll-area>
        </div>
      </q-card-section>
      <q-card-actions class="sticky-bottom" align="right">
        <div class="flex-1 items-center justify-end q-gutter-md">
          <q-btn class="dialog-button" outline label="Cancel" color="primary" v-close-popup />
          <q-btn class="dialog-button" type="submit" label="Save" color="primary" @click="doSubmit" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar';
import { EditMode, localeOptions } from 'src/pages/enums';
import { RequestCity, CreateCity, UpdateCity } from 'src/api';
import CityMainForm from './CityMainForm.vue';
import CityLangForm from './CityLangForm.vue';

const to = require('await-to-js').default

const emit = defineEmits(['updated'])
const $q = useQuasar();
const mainForm = ref();
const langForm = ref();

const visible = ref(false)
const title = ref('');
const mode = ref();
const model = ref();
const editLocaleOptions = [...localeOptions.slice(1)];
const currentLocale = ref(editLocaleOptions[0]);
const currentTab = ref('main');
const currentCountry = ref();
const countryOptions = ref([]);

const createEmptyModel = () => {
  return {
    code: null,
    name: null,
    country_id: null,
    tz: null,
    time_offset: null,
    lng: null,
    lat: null,
    // number_of_hotels: 0,
    desc: null,
    langs: []
  }
}

const show = async ({ data, country, countryList }) => {
  visible.value = true;
  currentTab.value = 'main';
  countryOptions.value = countryList;
  if (data) {
    title.value = '編輯城市';
    mode.value = EditMode.Edit;
    currentCountry.value = countryList.find(d => d.value === data.country_id);
    await reloadModel(data.id);
  } else {
    title.value = '新增城市';
    mode.value = EditMode.New;
    model.value = createEmptyModel();
    currentCountry.value = country;
  }
};

const reloadModel = async (id) => {
  const [err, res] = await to(RequestCity(id));
  if (err) {
    console.error('reload model error:', err);
    return {};
  }
  model.value = res.data;
}

const isEdit = computed(() => {
  return mode.value === EditMode.Edit;
})

/**
 * 是否為主語系編輯
 */
const isMainEdit = computed(() => {
  return currentTab.value === "main";
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
  $q.loading.show();
  const api = isEdit.value ? UpdateCity(data.id, { lang: 'en', data }) : CreateCity(data);
  const [err, res] = await to(api);
  $q.loading.hide();

  if (err) {
    console.error('main update error:', err);
    return;
  }
  if (isEdit.value) {
    reloadModel(data.id);
  } else {
    visible.value = false;
  }
  emit('updated');
}

const doLangSubmit = async () => {
  if (!await langForm.value.validate()) {
    console.warn("表單驗證未通過");
    return;
  }
  // TODO:
  $q.loading.show();
  const [err, res] = await to(UpdateCity(model.value.id, {
    lang: currentLocale.value.value,
    data: langForm.value.getModel()
  }));
  $q.loading.hide();

  if (err) {
    console.error('lang update error:', err);
    return;
  }
  reloadModel(model.value.id);
}

const getMainModel = computed(() => {
  return model.value;
})
const getLangModel = computed(() => {
  const langData = (model.value.langs || []).find(d => d.lang === currentLocale.value.value);
  return langData || createEmptyModel();
})

defineExpose({
  show
});

</script>
<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 450px;
  max-width: 100%;

  .content {
    padding-top: 0px;

    &-scroll {
      width: 650px;
      height: 400px;
    }
  }

  // min-height:  50px;
}
</style>
