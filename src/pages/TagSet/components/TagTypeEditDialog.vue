<template>
  <q-dialog v-model="visible" persistent>
    <q-card class="container">
      <q-form @submit="doSubmit">
        <q-card-section class="flex items-center">
          <div class="text-h6">{{ title }}</div>
          <q-space></q-space>
          <q-btn icon="close" flat dense rounded v-close-popup />
        </q-card-section>
        <q-card-section class="flex column q-gutter-sm">
          <q-input v-model="model.name" label="Name" :rules="rules.name" lazy-rules dense outlined></q-input>
          <q-input v-model="model.code" label="Code" :rules="rules.code" lazy-rules dense outlined></q-input>
          <q-input v-model="model.note" label="Note" type="textarea" dense outlined></q-input>
        </q-card-section>
        <q-card-actions align="center">
          <div class="flex-1 items-center justify-end q-gutter-md">
            <q-btn class="action-button" outline label="Cancel" color="primary" v-close-popup />
            <q-btn class="action-button" type="submit" label="Save" color="primary" />
          </div>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar';
import { EditMode } from 'src/pages/enums';
import { isEmpty, messages } from 'src/utils/validators';
import { CreateTagType, UpdateTagType } from 'src/api';

const to = require('await-to-js').default

const emit = defineEmits(['updated'])
const $q = useQuasar();
const visible = ref(false)
const title = ref('');
const defaultData = {
  code: null,
  name: null,
  note: null,
};
const model = ref();
const mode = ref();

const rules = computed(() => {
  return {
    name: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    code: [
      val => !isEmpty(val) || messages.requiredInput()
    ]
  }
});

const show = ({ data }) => {
  visible.value = true;
  if (data) {
    title.value = '編輯標籤類型';
    mode.value = EditMode.Edit;
    model.value = Object.assign({}, data);
  } else {
    title.value = '新增標籤類型';
    mode.value = EditMode.New;
    model.value = Object.assign({}, defaultData);
  }
};

const isEdit = computed(() => {
  return mode.value === EditMode.Edit;
})

const doSubmit = async () => {

  $q.loading.show();
  const api = isEdit.value ? UpdateTagType(model.value.id, model.value) : CreateTagType(model.value);
  const [err, res] = await to(api);
  $q.loading.hide();

  if (err) {
    console.log('CreateTagType error:', err);
    return;
  }
  visible.value = false;
  emit('updated');
}

defineExpose({
  show
});

</script>
<style lang="scss" scoped>
.container {
  padding: 0px 16px 16px;
  min-width: 450px;

  // min-height:  50px;
  .action-button {
    min-width: 100px !important;
  }
}
</style>
