<template>
  <div class="flex-1">
    <q-form ref="form" class="edit-form q-gutter-md" lazy-rules>
      <q-select v-model="currentType" label="Tag Type" :options="typeOptions" @update:model-value="onTypeSelected"
        :readonly="fixedTagType" hide-bottom-space dense outlined></q-select>
      <div class="flex">
        <q-input class="edit-form-field q-mr-md" v-model="model.name" label="Name *" :rules="rules.name"
          :maxlength="maxNameLength" hide-bottom-space lazy-rules dense outlined @blur="doAutoCode"></q-input>
        <q-input class="edit-form-field" v-model="model.code" label="Code *" :rules="rules.code" :readonly="!!model.id"
          hide-bottom-space lazy-rules dense outlined></q-input>
      </div>
      <q-input v-model="model.note" label="Note" type="textarea" dense outlined></q-input>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect, inject } from 'vue'
import { useQuasar } from 'quasar';
import { isEmpty, messages } from 'src/utils/validators';

const fixedTagType = inject('fixed-tag-type', false)
const maxNameLength = inject('max-name-length', null)
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {}
    }
  },
  typeOptions: {
    type: Array,
    default() {
      return []
    }
  },
  tagType: {
    type: Object,
    default() {
      return null;
    }
  }
});

const $q = useQuasar();
const form = ref();
const model = ref({});
const currentType = ref();

const rules = computed(() => {
  return {
    name: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    code: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isValidCode(val) || '只可輸入小寫英文、數字及底線'
    ]
  }
});

const isValidCode = (val) => {
  const result = /^[a-z0-9_]+$/g.test(val);
  console.log('isValidCode:', result, val);
  return result
}

const onTypeSelected = (type) => {
  model.value.tag_type_id = type.id;
}

const doAutoCode = () => {
  if (model.value.code) {
    return;
  }
  model.value.code = _.snakeCase(model.value.name)
}

watchEffect(() => {
  model.value = props.data;
  currentType.value = props.tagType;
})

const validate = async () => {
  return await form.value.validate();
}

const resetValidation = () => {
  form.value.resetValidation()
}

const getModel = () => {
  return model.value;
}

defineExpose({ resetValidation, validate, getModel })

</script>
<style lang="scss" scoped>
.edit-form {
  display: flex;
  flex: 1;
  flex-direction: column;

  // width: 450px;
  &-field {
    display: flex;
    flex: 1;
    // max-width: 300px;

    &.full {
      // cursor: pointer;
      max-width: 100%;
    }
  }
}
</style>
