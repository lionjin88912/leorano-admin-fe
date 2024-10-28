<template>
  <q-popup-proxy v-model="visible" @before-show="onBeforeShow">
    <q-date ref="dateRef" v-model="currentDate" default-view="Years" :mask="props.format" :navigation-max-year-month="maxYearMonth" @update:model-value="onSelected" minimal emit-immediately></q-date>
  </q-popup-proxy>
</template>
<script setup>
import { getDateStringNoTz } from 'src/utils/helpers';
import { ref } from 'vue';

const emit = defineEmits(['updated'])
const props = defineProps({
  format: {
    type: String,
    default() {
      return 'YYYY'
    }
  },
  date: {
    type: String,
    default() {
      return new Date().getFullYear()
    }
  }
})
const dateRef = ref();
const visible = ref(false);
const currentDate = ref(null);
const maxYearMonth = new Date().getFullYear() + '/12';

const onSelected = (val) => {
  if (val) {
    emit('updated', val);
    visible.value = false;
  }
}

const onBeforeShow = () => {
  currentDate.value = props.date;
};
</script>
