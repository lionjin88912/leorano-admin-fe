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
              <q-tab content-class="q-px-lg" label="活動基本資料" name="main" />
              <q-tab content-class="q-px-lg" label="語系設定" name="lang" :disable="!isEdit" />
            </q-tabs>
            <q-separator></q-separator>
          </div>
          <q-scroll-area class="content-scroll" :class="{ wide: !isMainEdit }">
            <q-tab-panels v-model="currentTab" keep-alive animated>
              <q-tab-panel name="main" class="q-px-none">
                <main-form ref="mainForm" :data="getMainModel" :is-edit="isEdit"></main-form>
              </q-tab-panel>
              <q-tab-panel name="lang" class="q-px-none">
                <div class="flex items-center justify-center q-gutter-md q-pb-md">
                  <div class="text-bold text-grey-6">當前編輯語系</div>
                  <q-select v-model="currentLocale" :options="editLocaleOptions" dense borderless></q-select>
                </div>
                <lang-form ref="langForm" :main-data="getMainModel" :data="getLangModel"></lang-form>
              </q-tab-panel>
            </q-tab-panels>
          </q-scroll-area>
        </div>
      </q-card-section>
      <q-card-actions class="sticky-bottom" align="center">
        <div class="flex-1 items-center justify-end q-gutter-md">
          <q-btn class="dialog-button" outline label="Cancel" color="primary" v-close-popup />
          <q-btn class="dialog-button" type="submit" label="Save" color="primary" @click="doSubmit" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar';
import { EditMode, localeOptions } from 'src/pages/enums';
import { getPromoMembership, createPromoMembership, updatePromoMembership } from 'src/api';
import MainForm from './MainForm.vue';
import LangForm from './LangForm.vue';
import to from 'await-to-js';
import { getDateString } from 'src/utils/helpers';

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
const currentTab = ref<'main' | 'lang'>('main');

const createEmptyModel = () => {
  return {
    membership: {}
  }
}

const show = async ({ data }: any) => {
  visible.value = true;
  currentTab.value = 'main';
  if (data) {
    title.value = '編輯會籍活動';
    mode.value = EditMode.Edit;
    await reloadModel(data.id);
  } else {
    title.value = '新增會籍活動';
    mode.value = EditMode.New;
    model.value = createEmptyModel();
    model.value.auto_create = false;
  }
};

const reloadModel = async (id: any) => {
  const [err, res] = await to(getPromoMembership(id));
  if (err) {
    console.error('reload model error:', err);
    return {};
  }
  model.value = res.data;
  model.value.start_date = getDateString(res.data.start_date, 'YYYY-MM-DD')
  model.value.end_date = getDateString(res.data.end_date, 'YYYY-MM-DD')
  if (model.value.accept?.type === 'membership') {
    model.value.accept.type = <number>model.value.accept.data
  }
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
  // console.log('main submit:', data)
  $q.loading.show();
  const api = isEdit.value ? updatePromoMembership(data.id, data) : createPromoMembership(data);
  const [err, res] = await to(api);
  $q.loading.hide();

  if (err) {
    console.error('main update error:', err);
    return;
  }
  // reloadModel(data.id);
  visible.value = false;
  emit('updated');
}

const doLangSubmit = async () => {
  if (!await langForm.value.validate()) {
    console.warn("表單驗證未通過");
    return;
  }
  $q.loading.show();
  const data = {
    lang: currentLocale.value.value,
    ...langForm.value.getModel()
  }
  const [err, res] = await to(updatePromoMembership(model.value.id, data));
  $q.loading.hide();

  if (err) {
    console.error('update lang error:', err);
    return;
  }
  reloadModel(model.value.id);
}

const getMainModel = computed(() => {
  return model.value;
})
const getLangModel = computed(() => {
  const langData = model.value.langs[currentLocale.value.value];
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
  overflow: hidden;

  .content {
    padding-top: 0px;

    &-scroll {
      width: 720px;
      height: 480px;

      &.wide {
        width: calc(100vw - 200px);
        max-width: 1024px;
      }
    }
  }

  // min-height:  50px;
}
</style>
