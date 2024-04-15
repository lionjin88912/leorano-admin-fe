<template>
  <div class='q-pa-sm'>
    <q-tabs v-model='tab' class="text-grey" :active-color="props.activeColor" :indicator-color="props.indicatorColor"
      :dense="props.dense" :narrow-indicator="props.narrowIndicator" :align="props.align">
      <q-tab v-for='(item, index) in tabItem' :key='index' :name='item.text' :label='item.text'
        @click='onTabClick(item)' />
    </q-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'

const emit = defineEmits(['update:model-value'])
const props = defineProps({
  align: {
    type: String,
    default() {
      return "left"
    }
  },
  indicatorColor: {
    type: String,
    default() {
      return "primary"
    }
  },
  activeColor: {
    type: String,
    default() {
      return "primary"
    }
  },
  narrowIndicator: {
    type: Boolean,
    default() {
      return false
    }
  },
  dense: {
    type: Boolean,
    default() {
      return true
    }
  },
  currentTab: Object,
  tabArr: {
    type: Array,
    required: true
  }
})

const tabItem: any = computed(() => props.tabArr.filter((d: any) => !d.disable));
const tab: any = ref(props.currentTab?.text || tabItem.value[0].text);

const onTabClick = (item: any) => {
  emit('update:model-value', item)
};

watchEffect(() => {
  tab.value = props.currentTab?.text || tabItem.value[0].text;
})

</script>

<style scoped></style>
