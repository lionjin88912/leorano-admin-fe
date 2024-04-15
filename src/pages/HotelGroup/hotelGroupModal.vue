<template>
  <q-dialog class="common-dialog" v-model="visible">
    <q-card class="container">
      <q-form @submit="handleSubmit">
        <q-card-section class="sticky-top">
          <div class="flex">
            <div class="text-h6">{{ title }}</div>
            <q-space></q-space>
            <q-btn icon="close" flat dense rounded v-close-popup />
          </div>
        </q-card-section>
        <q-card-section class="content">
          <q-scroll-area class="content-scroll">
            <q-input label="輸入集團名稱" v-model="row.name" outlined dense />
          </q-scroll-area>
        </q-card-section>
        <q-card-actions class="sticky-bottom" align="right">
          <div class="flex q-gutter-x-md">
            <q-btn class="dialog-button" color="primary" label="取消" outline v-close-popup />
            <q-btn class="dialog-button" color="primary" type="submit" :label="btnLabel" />
          </div>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch, toRefs, reactive } from 'vue'

const emit = defineEmits(['handleCloseModal'])
const props = defineProps({
  isCreate: {
    type: Boolean,
    require: true
  },
  isOpenModal: {
    type: Boolean,
    require: true
  },
  handleCloseModal: Function,
  callback: Function,
  propsRow: {
    type: Object,
    deep: true
  }
})

const visible = ref(props.isOpenModal);
const title = ref('新增酒店集團')
const btnLabel = ref('確定新增')
const row = reactive({ name: '', id: 0 })

const handleSubmit = () => {
  props.callback(row, row.id)

}

watch(() => props.isOpenModal, (newValue) => {
  if (visible.value == newValue) return

  title.value = props.isCreate ? '新增酒店集團' : '編輯酒店集團'
  btnLabel.value = props.isCreate ? '確定新增' : '確定送出'
  visible.value = newValue;
});

watch(visible, () => {
  if (visible.value == false)
    emit('handleCloseModal', false)
});
watch(
  () => toRefs(props.propsRow), // Convert row object to reactive refs
  (newValue) => {
    row.id = newValue.value.value.id
    row.name = newValue.value.value.name; // Update form.name when row.name changes
  },
  { deep: true } // Enable deep watching
);
</script>
<style scoped lang="scss">
.container {
  padding: 0px 16px 16px;
  min-width: 450px;
  max-width: 100%;

  .content {
    &-scroll {
      width: 450px;
      height: 100px;
    }
  }
}
</style>
