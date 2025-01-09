<template>
  <div>
    <BreadCrumbs></BreadCrumbs>
    <div class="q-my-lg shadow-1">
      <q-tabs v-model="currentTab" class="text-grey" active-color="primary" indicator-color="primary" align="left"
        narrow-indicator>
        <q-tab v-for="(item, index) in tabList" :key="index" :name="item.name" :label="item.label" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="currentTab" animated>
        <q-tab-panel v-for="(item, index) in tabList" :key="index" :name="item.name" :label="item.label">
          <component :is="currentComponent" :typeList="typeList" :tagList="tagList" @type-reload="onTypeReload"
            @tag-reload="onTagReload"></component>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar';
import { tabList } from './enums'
import { router } from 'src/router';
import TagTypeList from './TagTypeList.vue';
import TagList from './TagList.vue';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import { useMetaStore } from 'src/stores/meta';

const $q = useQuasar();
const metaStore = useMetaStore();
const currentTab = ref(router.currentRoute.value.query.tab || tabList[0].name)
const currentComponent = computed(() => {
  switch (currentTab.value) {
    case 'tag':
      return TagList;
    case 'tag-type':
    default:
      return TagTypeList;
  }
});
const typeList = ref([]);
const tagList = ref([]);

const getTypeList = async (name) => {
  $q.loading.show();
  typeList.value = await metaStore.getTagTypeList(name);
  $q.loading.hide();
}

const getTagList = async (name, typeId) => {
  // console.log('getTagList name:', name, ', typeId:', typeId);
  $q.loading.show();
  tagList.value = await metaStore.getTagList(name, (typeId || typeList.value[0]?.id));
  $q.loading.hide();
}

const onTagReload = ({ name, typeId }) => {
  getTagList(name, typeId);
}

const onTypeReload = ({ name }) => {
  getTypeList(name);
}

watch(currentTab, (newVal) => {
  router.push({ query: { tab: newVal } });
});

onMounted(async () => {
  if (currentTab.value === 'tag') {
    await getTypeList();
    getTagList(router.currentRoute.value.query.keyword, router.currentRoute.value.query.tag_type_id ? parseInt(router.currentRoute.value.query.tag_type_id) : typeList.value[0]?.id);
  } else {
    getTypeList(router.currentRoute.value.query.keyword);
  }
});
</script>
