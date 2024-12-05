<template>
  <div>
    <div class="flex justify-between">
      <BreadCrumbs>
        <template #currentRoute>
          <q-breadcrumbs-el :label='hotelName' />
          <q-breadcrumbs-el :label='$route.meta.title' />
          <q-select v-model='lang' :options='localeOptions' borderless dense />
        </template>
      </BreadCrumbs>
      <q-toggle v-model='data.is_enabled' label="上架" left-label checked-icon='check' color='green' unchecked-icon='clear'
        @click="setStatus" />
    </div>
    <TabComponent propsStyle='maw-width:400px' :tabArr='editTab' :current-tab="currentTab"
      @update:model-value="handleClick" />
    <div class="shadow-1 q-pa-sm">
      <q-tab-panels v-model='tab' animated>
        <q-tab-panel v-for='(item, id) in editTab' :key='id' :name='item.val'>
          <component :is='currentTabComponent' :propsData='data' :propsLang='langData' @handleUpdate='handleUpdate'>
          </component>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, onBeforeMount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import to from 'await-to-js'
import { RequestHotelByID, RequestUpdateHotel } from 'src/api'
import { editTab } from './enums'
import { localeOptions } from 'src/pages/enums'
import TabComponent from 'src/components/TabComponent.vue'
import tabBasic from './tabBasic.vue';
import tabRule from './tabRule.vue';
import tabBenefits from './tabBenefits.vue'
import tabLang from './tabLang.vue'
import tabRawData from './tabRawData.vue'
import tabMedia from './tabMedia.vue'
import tabRoom from './tabRoom.vue'
import tabRate from './tabRate.vue'
import tabPlan from './tabPlan.vue'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const lang = ref(localeOptions[0])
const createDefaultLangData = () => {
  return {
    hotel_id: '',
    hotel_code: '',
    name: '',
    address: '',
    desc: '',
    lang: lang.value.value,
    check_in_time: '',
    check_out_time: '',
    isPublished: false,
    rawIsUpdated: false,
    is_virtuoso_hotel: false
  }
}
const data = ref<any>({
  is_virtuoso_hotel: false,
  is_enabled: false,
  email: '',
  web_site: '',
  country_id: 0,
  city_id: 0,
  lat: '',
  lng: '',
  phone: '',
  fax: '',
  langs: {}
})
const currentTab = ref<any>(); // 頁籤用
const tab = ref<any>(editTab[0].val);
const langData = ref<any>(createDefaultLangData());
const hotelName = computed(() => data.value ? data.value.name : '')

const readApi = async (id: any) => {
  if (!id) {
    return;
  }
  const [err, res] = await to(RequestHotelByID(id))
  if (err) {
    console.error('readApi error:', err);
    return null;
  }

  if (res.data.id <= 0) {
    $q.notify({
      type: 'negative',
      position: 'top',
      message: '酒店資料不存在',
      timeout: 5000
    })
    router.push({ name: 'HotelList' })
    return
  }

  if (!res.data.hotel_group_name) {
    res.data.hotel_group_name = '獨立酒店';
  }

  // console.log('hotel:', res.data)

  data.value = res.data
  return res.data
}

const currentTabComponent = computed(() => {
  // console.log('currentTab:', tab.value)
  switch (tab.value) {
    case 'basic':
      return tabBasic;
    case 'rule':
      return tabRule;
    case 'benefits':
      return tabBenefits;
    case 'plan':
      return tabPlan;
    case 'room':
      return tabRoom;
    case 'rate':
      return tabRate;
    case 'media':
      return tabMedia;
    case 'lang':
      return tabLang;
    case 'rawData':
      return tabRawData;
    default:
      return null;
  }

})
onMounted(async () => {
  const id = route.params.hotel_id;
  const res = await readApi(id)

  if (res && res.langs[lang.value.value]) {
    langData.value = res.langs[lang.value.value]
  } else {
    langData.value = res
  }
  // console.log('langdata:', langData.value)
  setDefaultFieldValue();

})
onBeforeMount(() => {
  /**
   * 接收querystring
   * 可指定跳轉頁籤 (room/rate/plan)、id，
   * 在此切換顯示頁籤，並在該頁籤內跳轉該筆編輯頁面
   */
  if (route.params.tab) {
    tab.value = route.params.tab
    currentTab.value = editTab.find((d: any) => d.val === tab.value);
  }
})

const setDefaultFieldValue = () => {
  langData.value.name = langData.value.name || data.value.tp_hotel?.name;
  langData.value.hotel_code = langData.value.hotel_code || data.value.hotel_code;
  langData.value.hotel_chain = langData.value.hotel_chain || data.value.hotel_chain;
  langData.value.address = langData.value.address || data.value.address;
}

const handleUpdate = async (val: any) => {
  // console.log('val:', val.lang)
  if (val.key === 'basic') {
    val.lang = Object.assign(val.lang, {
      lang: lang.value.value
    });
  }
  await RequestUpdateHotel(data.value.id, val);
  readApi(data.value.id);
}

const handleClick = (tabItem: any) => {
  tab.value = tabItem.val
  router.push({ params: { tab: tabItem.val } })
}

watch(tab, () => {
  if (!data.value) return
  readApi(data.value.id)
})

watch(lang, () => {
  if (!data.value) return
  const locale = lang.value.value;
  // console.info('切換語系:', locale)
  if (('langs' in data.value) && data.value.langs[locale]) {
    langData.value = data.value['langs'][locale]
  } else {
    langData.value = createDefaultLangData();
  }
  setDefaultFieldValue();
})

const setStatus = async () => {
  handleUpdate({
    key: "enableUpdate",
    hotel: {
      is_enabled: data.value.is_enabled
    }
  })
}
</script>
<style scoped></style>
