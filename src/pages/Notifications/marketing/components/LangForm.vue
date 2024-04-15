<template>
  <div class="flex-1 q-gutter-sm">
    <div class="edit-form-view q-gutter-sm">
      <q-input v-model="mainModel.content" label="說明" type="textarea" rows="8" input-style="min-height: 120px;"
        hide-bottom-space readonly dense outlined></q-input>
    </div>
    <q-form ref="form" class="edit-form q-gutter-sm">
      <q-input class="edit-form-field full" v-model="model.content" label="說明 *" type="textarea" :rules="rules.required"
        :maxlength="250" rows="8" input-style="min-height: 120px;" hide-bottom-space lazy-rules dense outlined></q-input>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useQuasar } from 'quasar';
import { isEmpty, messages } from 'src/utils/validators';

const props = defineProps({
  mainData: {
    type: Object,
    default() {
      return {}
    }
  },
  data: {
    type: Object,
    default() {
      return {}
    }
  }
});

const $q = useQuasar();
const form = ref();
const mainModel = ref({});
const model = ref({});

const rules = computed(() => {
  return {
    required: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
  }
});

watchEffect(() => {
  if (form.value) {
    form.value.resetValidation();
  }
  mainModel.value = props.mainData;
  model.value = props.data;
})

const validate = async () => {
  return await form.value.validate();
}

const getModel = () => {
  return {
    content: model.value.content
  };
}

defineExpose({ validate, getModel })

</script>
<style lang="scss" scoped>
.edit-form {
  display: flex;
  flex: 1;
  flex-direction: column;

  &-view {
    flex: 0.65;
  }

  // width: 450px;
  &-field {
    max-width: 250px;

    &.full {
      // cursor: pointer;
      max-width: 100%;
    }
  }
}
</style>
