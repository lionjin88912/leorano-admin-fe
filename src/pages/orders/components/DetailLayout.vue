<template>
  <div class="row q-col-gutter-lg q-mt-none">
    <div :class="{'col-8': !isFullWidth, 'col-12': isFullWidth}">
      <q-card flat bordered>
        <q-card-section>
          <div class="tab-scroll bg-white flex justify-between items-center q-py-sm q-mb-md">
            <div class="tab-inner flex q-mr-md">
              <q-tabs v-model="tab" align="left" @update:model-value="scrollToSection">
                <q-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :label="tab.label" />
              </q-tabs>
            </div>
            <slot name="buttons" />
          </div>
          <slot name="form" />
        </q-card-section>
      </q-card>
      <q-scroll-observer @scroll="onScroll" :debounce="300" />
    </div>
    <div v-if="!isFullWidth" class="col-4">
      <slot name="aside" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  tabs: {
    type: Array
  },
  isFullWidth: {
    type: Boolean,
    default: false
  }
})

const tab = ref(props.tabs[0].name);
const isScrolling = ref(false);
// 點擊 tab 滾動到對應 section
const scrollToSection = (tabName) => {
  isScrolling.value = true;
  let tab = props.tabs.find(tab => tab.name === tabName);
  tab.ref.$el.scrollIntoView({ behavior: 'smooth' })
  setTimeout(() => {
    isScrolling.value = false;
  }, 1000);
}
// 取每個 section 相對 root 的 top 位置
const sectionPositionTops = ref([]);
const getSectionPositionTops = () => {
  sectionPositionTops.value = props.tabs.map(tab => tab.ref.$el.offsetTop);
}
// 滾動到不同區塊，切換 tab
const onScroll = async (info) => {
  if (isScrolling.value) return;

  await getSectionPositionTops();
  const currentIndex = props.tabs.reduce((closest, tab, index) => {
    const distance = Math.abs(sectionPositionTops.value[index] - info.position.top)
    if (distance < closest.distance) {
      return { index, distance }
    }
    return closest
  }, { index: 0, distance: Infinity });

  if (tab.value !== props.tabs[currentIndex.index].name) {
    tab.value = props.tabs[currentIndex.index].name
  }
}
</script>

<style lang="scss">
.scroll-margin {
  scroll-margin: 120px;
}
.tab-scroll {
  position: sticky;
  top: 58px;
  z-index: 1;
  .tab-inner {
    flex: 1;
    border-bottom: 1px solid $grey-4;
  }
  .q-tab {
    min-height: 40px;
  }
}
</style>