<template>
  <q-popup-proxy v-model="visible" @before-show="onBeforeShow">
    <div class="flex-1 items-center justify-center q-pt-sm q-px-sm">
      <q-btn class="q-mr-sm" icon="event_busy" color="white" text-color="grey-7" @click="onClear" size="sm">清除選取</q-btn>
      <q-btn icon="today" color="primary" @click="goToday" size="sm">回今日</q-btn>
    </div>
    <q-date ref="dateRef" v-model="currentDate" class="shadow-0" :mask="props.format" :range="range" minimal
      @update:model-value="onSelected"></q-date>
  </q-popup-proxy>
</template>
<script setup>
import { getDateStringNoTz } from 'src/utils/helpers';
import { ref } from 'vue';

const emit = defineEmits(['updated'])
const props = defineProps({
  range: {
    type: Boolean,
    default() {
      return false
    }
  },
  format: {
    type: String,
    default() {
      return 'YYYY-MM-DD'
    }
  },
  date: {
    type: [String, Object],
    default() {
      return null
    }
  }
})
const dateRef = ref();
const visible = ref(false);
const currentDate = ref(null);

const onSelected = (val) => {
  if (props.range && typeof val === 'string') {
    // console.warn('設定區間選取，但只選取單天，回傳NULL')
    val = { from: val, to: val };
  }
  if (val) {
    // console.log('onDateSelected:', val);
    emit('updated', val);
    visible.value = false;
  }
}

const onClear = () => {
  currentDate.value = null;
  emit('updated', null);
  visible.value = false;
}

const goToday = () => {
  const date = new Date();
  const year = getDateStringNoTz(date, "YYYY");
  const month = getDateStringNoTz(date, "M");
  dateRef.value.setCalendarTo(year, month);
}

const onBeforeShow = () => {
  currentDate.value = props.date;
};
</script>
<style lang="scss" scoped></style>
