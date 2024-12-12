<template>
  <q-dialog v-model="state.visible" persistent>
    <q-card class="container">
      <q-card-section class="flex items-center">
        <div class="text-h6">{{ state.title }}</div>
        <q-space></q-space>
        <q-btn icon="close" flat dense rounded v-close-popup />
      </q-card-section>
      <q-card-section class="content">
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
        <div class="full-width">
          <q-scroll-area class="content-scroll" :class="{ wide: wideView }">
            <main-form ref="mainForm" :data="state.model" :hotelData="props.hotelData" @comparing="wideView = true"
              @compared="wideView = false" @update:status="onUpdateStatus"></main-form>
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
import { ref, reactive, watch } from 'vue'
import { useQuasar } from 'quasar';
import { GetHotelPlan, UpdateHotelPlan } from 'src/api';
import { getDateString } from 'src/utils/helpers';
import MainForm from './MainForm.vue';

const to = require('await-to-js').default

const emit = defineEmits(['updated'])
const props = defineProps({
  hotelData: Object
});
const $q = useQuasar();

const mainForm = ref();
const state = reactive({
  visible: false,
  title: '',
  model: {},
});
const wideView = ref(true);

const show = async ({ data }) => {
  state.visible = true;

  if (data) {
    state.title = '編輯方案資料';
    await reloadModel(data.id);
  }
};

const reloadModel = async (id) => {
  const [err, res] = await to(GetHotelPlan(id));
  if (err) {
    console.error('reload model error:', err);
    return;
  }
  state.model = res.data;
}

const doSubmit = async () => {
  if (!await mainForm.value.validate()) {
    console.warn("表單驗證未通過");
    return;
  }
  const data = mainForm.value.getModel();
  $q.loading.show();
  const [err, res] = await to(UpdateHotelPlan(data.id, data));
  $q.loading.hide();

  if (err) {
    console.error('UpdateHotelPlan error:', err);
    return;
  }
  // state.visible = false;
  reloadModel(res.data.id);
  emit('updated');
}

const onUpdateStatus = async (data) => {
  console.log('doUpdateStatus:', data);
  const dataId = mainForm.value.getModel().id;
  $q.loading.show();
  const [err, res] = await to(UpdateHotelPlan(dataId, data));
  $q.loading.hide();

  if (err) {
    console.error('UpdateHotelPlan error:', err);
    return;
  }
  reloadModel(res.data.id);
  emit('updated');
}

watch(() => state.visible, () => {
  wideView.value = true;
})

defineExpose({
  show
});

</script>
<style lang="scss" scoped>
.container {
  padding: 0px 0px 16px;
  min-width: 780px;
  max-width: 100%;
  // overflow: hidden;

  .content {
    &-title {
      font-weight: bold;
      font-size: 18px;
      padding: 8px 8px;
    }

    &-scroll {
      width: 100%;
      height: 780px;
      max-height: calc(90vh - 200px);

      &.wide {
        width: calc(100vw - 200px);
        max-width: 1200px;
      }
    }
  }

  .action-button {
    min-width: 100px !important;
  }
}
</style>
