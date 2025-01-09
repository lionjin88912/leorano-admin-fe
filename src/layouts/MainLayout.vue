<template>
  <q-layout view="hHh Lpr lFf" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8 q-py-xs" height-hint="50">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> Le Oràno Console </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="200">
      <div class="q-pa-md" style="max-width: 200px">
        <div class="fixed-bottom flex justify-center text-bold text-grey-6 text-sm q-pb-sm">
          BUILD {{ buildDate }}
        </div>
        <q-list class="rounded-borders" v-for="(item, index) of appMenus" :key="index">
          <q-expansion-item v-if="item.children.length > 0" :label="item.label" :default-opened="isChildOpened(item)" expand-separator
            @show="item.isExpand = true" @hide="item.isExpand = false">
            <q-item v-for="(child, cIdx) of item.children" :key="cIdx" :inset-level="0.5" clickable
              :active="isMenuActive(child)" :to="child.to">
              <q-item-section>{{ child.label }}</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-item v-else clickable :to="item.to">
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>
    <q-page-container>
      <q-page>
        <router-view class="q-pa-lg bg-white" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { LocalStorage } from 'quasar';
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router';
import { menus, Menu, MenuItem } from 'src/pages/enums';
import { getDateStringNoTz } from 'src/utils/helpers';

const route = useRoute();
const leftDrawerOpen = ref(false)
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
const buildDate = getDateStringNoTz(process.env.VUE_APP_BUILD_DATE, 'YYYY-MM-DD HH:mm');
const permissions = ref<any>(LocalStorage.getItem('permissions') || {})
const UN_PERMISSIONS = ['currency']
const appMenus = computed(() => {
  return menus.filter((d: Menu) => (permissions.value.hasOwnProperty(d.module) && permissions.value[d.module]) || UN_PERMISSIONS.includes(d.module))
})

const isChildOpened = computed(() => (menu: Menu) => {
  const child = menu.children.find((d: MenuItem) => {
    return route.path.includes(menu.to)
  });
  if (child instanceof Object) {
    menu.isExpand = true;
    return true;
  }
  return false;
});

const isMenuActive = (item: MenuItem) => {
  return (item.to && route.path.includes(item.to)) || 
         (item.active && route.path.includes(item.active)) || 
         (item.to && route.path.includes(item.to.replace('list', 'edit')));
}

</script>
