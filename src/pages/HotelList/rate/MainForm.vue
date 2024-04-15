<template>
  <div class="flex-1">
    <q-form ref="form" class="edit-form q-gutter-md">
      <div class="flex-1">
        <q-input class="edit-form-field q-pr-lg" v-model="model.name" label="Name *" :rules="rules.name" hide-bottom-space
          lazy-rules outlined dense @blur="doAutoCode"></q-input>
        <q-input class="edit-form-field" v-model="model.code" label="Code *" :rules="rules.code" hide-bottom-space
          lazy-rules outlined dense></q-input>
      </div>
      <div class="flex-1">
        <q-checkbox class="edit-form-field" v-model="model.has_breakfast" label="是否含早餐"></q-checkbox>
      </div>
      <!-- <div class="flex-1 hidden">
        <q-field class="edit-form-field cursor-pointer q-pr-lg" v-model="model.startDate" label="Start *"
          :rules="rules.startDate" hide-bottom-space :hide-hint="false" outlined>
          <template #default>
            <DatePicker :date="model.startDate" @updated="(val) => model.startDate = val"></DatePicker>
          </template>
          <template v-slot:control>
            <div>{{ model.startDate }}</div>
          </template>
        </q-field>
        <q-field class="edit-form-field cursor-pointer" v-model="model.endDate" label="End *" :rules="rules.endDate"
          hide-bottom-space :hide-hint="false" outlined>
          <template #default>
            <DatePicker :date="model.endDate" @updated="(val) => model.endDate = val"></DatePicker>
          </template>
          <template v-slot:control>
            <div>{{ model.endDate }}</div>
          </template>
        </q-field>
      </div> -->
      <div @click="showTagSelect()">
        <q-field class="edit-form-field cursor-pointer" label="Tags" :hide-bottom-space="false" :hide-hint="false"
          :stack-label="isStackLabel(model.tags)" outlined dense>
          <template v-slot:control>
            <template v-if="model.tags && model.tags.length > 0">
              <div class="tag-list">
                <div v-for="(tag, index) of model.tags" :key="index" class="tag">{{ tag.name }}</div>
              </div>
            </template>
          </template>
        </q-field>
      </div>
      <q-input v-model="model.desc" label="Description" type="textarea" hide-bottom-space lazy-rules outlined autogrow
        dense input-style="min-height: 100px;"></q-input>
    </q-form>
    <SelectTag ref="selectTagRef" @selected="onTagSelected" :multiple="isMultipleTag" />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { useQuasar } from 'quasar';
import _ from "lodash";
import { isEmpty, isValidDateRange, messages } from 'src/utils/validators';
import DatePicker from 'src/components/DatePicker.vue';
import SelectTag from 'src/components/dialog/SelectTag.vue';

const props = defineProps({
  data: {
    type: Object,
    default() {
      return {}
    }
  },
  hotelData: Object
});

const $q = useQuasar();
const form = ref();
const selectTagRef = ref();
const model = ref({});
const hotel = ref();
const isMultipleTag = ref(true);
const tagType = {
  id: 16,
  name: 'Benefit'
}

const isStackLabel = (items) => {
  return items && items.length > 0;
}

const showTagSelect = () => {
  selectTagRef.value.show({
    tagTypeId: tagType.id,
    tagTypeName: tagType.name,
    selection: model.value.tags || []
  });
};

const onTagSelected = ({ selection }) => {
  // console.log('onTagSelected:', selection);
  model.value.tags = selection;
}

const doAutoCode = () => {
  if (model.value.code) {
    return;
  }
  model.value.code = _.snakeCase(model.value.name);
}

const rules = computed(() => {
  return {
    name: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    code: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    startDate: [
      val => !isEmpty(val) || messages.requiredInput(),
    ],
    endDate: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isValidDateRange(model.value.startDate, val) || messages.invalidDateRange()
    ],
    summary: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    desc: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
  }
});

watchEffect(() => {
  hotel.value = props.hotelData;
  model.value = props.data;
  model.value.hotel_code = hotel.value.hotel_code;
})

const validate = async () => {
  return await form.value.validate();
}

const getModel = () => {
  return {
    id: model.value.id,
    name: model.value.name,
    code: model.value.code,
    hotel_code: model.value.hotel_code,
    has_breakfast: model.value.has_breakfast,
    // startDate: null,
    // endDate: null,
    tags: model.value.tags.map(d => d.id),
    // summary: model.value.summary,
    desc: model.value.desc
  }
}

defineExpose({ validate, getModel })

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

.tag-list {
  display: flex;
  flex-wrap: wrap;

  .tag {
    padding: 1px 4px;
    margin: 4px;
    border-radius: 4px;
    background-color: $green-5;
    color: $grey-1;
    font-size: 12px;

    &:hover {
      background-color: $green-7;
    }
  }
}
</style>
