<template>
  <div>
    <q-form @submit="handleSubmit" ref="formRef" class="q-gutter-y-lg">
      <div class="flex">
        <div v-if="shareLink" class="flex text-primary cursor-pointer">
          <div class="q-pr-sm">App分享連結</div>
          <q-icon name="content_copy" size="24px" @click.stop="onCopy(shareLink)">
            <q-tooltip>複製</q-tooltip>
          </q-icon>
          <q-popup-proxy class="q-pa-sm">{{ shareLink }}</q-popup-proxy>
        </div>
        <q-space></q-space>
        <div class="text-right q-gutter-y-xs">
          <div class="text-right q-gutter-x-sm">
            <span class="text-bold">更新時間</span>
            <span class="text-grey-7">{{ helpers.getDateString(data.updated_at) }}</span>
          </div>
          <q-btn label="儲存" type="submit" color="primary" />
        </div>
      </div>
      <div class="row q-col-gutter-sm">
        <q-input v-model="lang.name" class="col-12" label="酒店名稱 *" :rules="rules.name" outlined dense />
        <q-input class="col-xs-6 col-md-3" v-model="data.hotel_group_name" label="所屬集團" outlined readonly dense />
        <selectBrand @handle-call-back="setBrand" label="品牌" :default="{ id: data.hotel_brand_id }" class="col-xs-6 col-md-3" />
        <q-input
          class="col-xs-6 col-md-3"
          v-model="data.hotel_chain"
          label="Hotel Chain"
          maxlength="2"
          readonly
          outlined
          dense
          @blur="onHotelChainBlur"
        />
        <q-input
          class="col-xs-6 col-md-3"
          v-model="lang.hotel_code"
          label="TP Hotel Code *"
          :rules="rules.hotelCode"
          outlined
          dense
        />
      </div>
      <q-separator class="q-mt-md q-mb-lg" />
      <div class="row q-col-gutter-lg">
        <div class="col-xs-12 col-sm-7 col-md-8">
          <div class="text-bold text-grey-9">酒店地址</div>
          <div class="row q-col-gutter-sm q-mt-xs">
            <selectCountry
              @handleCallBack="setCountry"
              label="國家 *"
              :default="{ id: data.country_id, name: data.country }"
              :rules="rules.country"
              class="col-6 col-md-4"
            />
            <selectCity
              @handleCallBack="setCity"
              label="城市 *"
              :default="{ id: data.city_id, name: data.city }"
              :country="data.country_id"
              :rules="rules.city"
              class="col-6 col-md-4"
            />
            <q-input class="col-6 col-md-4" v-model="data.postal_code" label="ZIP code" outlined dense />
            <q-input
              class="col-12 col-md-4"
              v-model="lang.address"
              label="酒店地址"
              :rules="rules.address"
              outlined
              dense
              hide-bottom-space
            />
            <q-input class="col-6 col-md-4" outlined dense type="number" step="any" v-model.number="data.lat" label="緯度 *" :rules="rules.lat" hide-bottom-space />
            <q-input class="col-6 col-md-4" outlined dense type="number" step="any" v-model.number="data.lng" label="經度 *" :rules="rules.lng" hide-bottom-space />
            <div class="col-12 flex q-gutter-sm items-center">
              <q-btn dense outline color="primary" icon="search" label="在 Google Maps 找此飯店" @click="openGoogleMapsSearch" />
              <q-btn dense unelevated color="primary" icon="content_paste" label="從剪貼簿貼上座標" @click="pasteCoordsFromClipboard" />
              <span class="text-grey-6 text-caption">在 Google Maps 找到位置後，複製網址再點貼上</span>
            </div>
          </div>
          <LeafletMap 
            ref="lmap" 
            :center="center" 
            :zoom="16" 
            :markers="markers"
            :draggable-marker="true"
            height="400px"
            class="gmap q-mt-md" 
            @click="onMapClick"
            @marker-dragged="onMarkerDragged"
            @marker-click="onMarkerClick"
          />
        </div>
        <div class="col-xs-12 col-sm-5 col-md-4">
          <div class="text-bold text-grey-9">其他資訊</div>
          <div class="row q-col-gutter-sm q-mt-xs">
            <q-input class="col-xs-12 col-md-6" v-model="data.phone" label="聯絡電話" outlined dense />
            <q-input class="col-xs-12 col-md-6" v-model="data.fax" label="傳真" outlined dense />
            <q-input class="col-xs-12 col-md-6" v-model="data.email" label="客服信箱" outlined dense />
            <q-input class="col-xs-12 col-md-6" v-model="data.web_site" label="官方網站" outlined dense />
            <div class="col-12" @click="showTagSelect(hotelBenefitTagType)">
              <q-field
                class="col cursor-pointer"
                label="酒店禮遇標籤"
                :hide-bottom-space="false"
                :hide-hint="false"
                :stack-label="isStackLabel(data.hotelBenefitTags)"
                outlined
                dense
              >
                <template v-slot:control>
                  <q-chip
                    v-for="(tag, index) of data.hotelBenefitTags"
                    :key="index"
                    :label="tag.name"
                    color="green-7"
                    text-color="grey-1"
                    size="sm"
                  ></q-chip>
                </template>
              </q-field>
            </div>
            <div class="col-12" @click="showTagSelect(hotelPlanTagType)">
              <q-field
                class="col cursor-pointer"
                label="酒店方案標籤"
                :hide-bottom-space="false"
                :hide-hint="false"
                :stack-label="isStackLabel(data.hotelPlanTags)"
                outlined
                dense
              >
                <template v-slot:control>
                  <q-chip
                    v-for="(tag, index) of data.hotelPlanTags"
                    :key="index"
                    :label="tag.name"
                    color="green-7"
                    text-color="grey-1"
                    size="sm"
                  ></q-chip>
                </template>
              </q-field>
            </div>
            <q-input type="textarea" label="酒店介紹" v-model="lang.desc" rows="8" class="col-12" outlined dense />
          </div>
        </div>
      </div>
      <div>
        <div class="text-bold text-grey-9">酒店圖片</div>
        <div class="flex q-gutter-md items-center">
          <div class="text-grey-7">最多可選 {{ maxPicAmount }} 張圖片</div>
          <q-btn label="選擇圖片" color="primary" @click="openMedia" outline></q-btn>
        </div>
        <div class="row q-col-gutter-xs q-mt-md">
          <div v-for="(v, key) in chooseMedia" :key="key" class="image-wrap col-xs-3 col-sm-2 col-lg-1" :class="{ 'pick': v.isCover }">
            <q-img
              class="cursor-pointer"
              :class="{ 'cover': v.isCover }"
              :src="releaseUrl(v.src)"
              :ratio="1"
              fit="cover"
              spinner-color="white"
              loading="lazy"
              @click="handleCoverSelect(key)">
              <div v-if="v.isCover" class="absolute-bottom text-subtitle2 text-center">
                封面
              </div>
            </q-img>
          </div>
        </div>
      </div>
      <q-separator class="q-mt-lg q-mb-xs" />
      <div class="flex justify-end">
        <q-btn label="儲存" type="submit" color="primary" />
      </div>
    </q-form>
    <GetMedia
      ref="MediaRef"
      :hotelId="data.id"
      :max-amount="maxPicAmount"
      :propsDefault="chooseMedia"
      @handleMedia="handleMedia"
    />
    <SelectTag ref="selectTagRef" @selected="onTagSelected" :multiple="true" />
  </div>
</template>

<script setup>
import { watch, ref, reactive, computed, onMounted } from 'vue';
import selectCountry from 'components/selectCountry.vue';
import selectCity from 'components/selectCity.vue';
import axios from 'axios';
import GetMedia from './GetMedia.vue';
import { useQuasar, copyToClipboard } from 'quasar';
import SelectTag from 'src/components/dialog/SelectTag.vue';
import selectBrand from 'src/components/selectBrand.vue';
import { isEmpty, messages } from 'src/utils/validators';
import _ from 'lodash';
import * as helpers from 'src/utils/helpers';

import LeafletMap from 'src/components/LeafletMap.vue';

const to = require('await-to-js').default;

const emit = defineEmits(['handleUpdate']);
const props = defineProps({
  handleUpdate: Function,
  propsLang: Object,
  propsData: Object,
});

const $q = useQuasar();
const lmap = ref();
const formRef = ref();
const MediaRef = ref(null);
const selectTagRef = ref();
const maxPicAmount = ref(5);
const lang = ref({
  hotel_id: '',
  hotel_code: '',
  name: '',
  address: '',
  desc: '',
  check_in_time: '',
  check_out_time: '',
  isPublished: false,
  rawIsUpdated: false,
  lang: '',
});
const data = ref({
  id: 0,
  is_virtuoso_hotel: false,
  email: '',
  web_site: '',
  country_id: 0,
  city_id: 0,
  lat: '',
  lng: '',
  phone: '',
  fax: '',
});

// 緯度合法且非 0
const isValidLat = (v) => {
  const n = parseFloat(v);
  return !isNaN(n) && n !== 0 && n >= -90 && n <= 90;
};
// 經度合法且非 0
const isValidLng = (v) => {
  const n = parseFloat(v);
  return !isNaN(n) && n !== 0 && n >= -180 && n <= 180;
};

// 座標未設定/被清空時不要把地圖跳到 (0,0)（大西洋）；維持台北 101 預設
const TAIPEI_DEFAULT = { lat: 25.0330, lng: 121.5654 };

const center = computed(() => {
  if (!isValidLat(data.value.lat) || !isValidLng(data.value.lng)) return TAIPEI_DEFAULT;
  return { lat: parseFloat(data.value.lat), lng: parseFloat(data.value.lng) };
});

const markers = computed(() => {
  if (!isValidLat(data.value.lat) || !isValidLng(data.value.lng)) return [];
  return [{ position: { lat: parseFloat(data.value.lat), lng: parseFloat(data.value.lng) }, title: data.value.name }];
});

const chooseMedia = ref({});
const geo = reactive({
  city: '',
  country: '',
});
const shareLink = ref();
const currentMarkerIndex = ref(null);
const hotelBenefitTagType = {
  // 酒店禮遇標籤
  id: 18,
  name: '酒店禮遇標籤',
};
const hotelPlanTagType = {
  // 酒店方案標籤
  id: 19,
  name: '酒店方案標籤',
};

const setBrand = (opt) => {
  if (!opt) {
    return;
  }
  data.value.hotel_brand_id = opt.val;
  if (opt.val) {
    data.value.hotel_group_name = opt.hotel_group_name || '獨立酒店';
    data.value.hotel_chain = opt.hotel_chain;
  } else {
    data.value.hotel_group_name = null;
    data.value.hotel_chain = null;
  }
};

const onHotelChainBlur = () => {
  data.value.hotel_chain = _.toUpper(data.value.hotel_chain);
};

const showTagSelect = (tagType) => {
  let oldSelection = [];
  if (tagType.id === 18) {
    oldSelection = data.value.hotelBenefitTags;
  } else if (tagType.id === 19) {
    oldSelection = data.value.hotelPlanTags;
  }
  selectTagRef.value.show({
    tagTypeId: tagType.id,
    tagTypeName: tagType.name,
    selection: oldSelection || [],
  });
};

const onTagSelected = ({ selection, tagTypeId }) => {
  // console.log('onTagSelected:', selection);
  // data.value.tags = selection;
  switch (tagTypeId) {
    case hotelBenefitTagType.id:
      data.value.hotelBenefitTags = selection;
      break;
    case hotelPlanTagType.id:
      data.value.hotelPlanTags = selection;
      break;
  }
};

const isStackLabel = (items) => {
  return items && items.length > 0;
};

const onCopy = async (text) => {
  const [err, res] = await to(copyToClipboard(text));
  if (err) {
    return;
  }
  $q.notify({
    position: 'top',
    type: 'positive',
    message: '複製成功',
    timeout: 1500,
  });
};

const getAddress = async (lat, lng) => {
  if (!lat || !lng) {
    return;
  }
  const [err, res] = await to(
    axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { format: 'json', lat, lon: lng, 'accept-language': lang.value.lang || 'zh-TW' },
      timeout: 10000,
    }),
  );

  if (err) {
    console.error('getAddress error:', err);
    return;
  }
  return res.data.display_name;
};

const handleSubmit = async () => {
  const getData = data.value;
  const getLang = lang.value;

  let media = [];
  for (const [key, value] of Object.entries(chooseMedia.value)) {
    media.push({
      id: key,
      isCover: !!value.isCover,
    });
  }
  // emit('handleUpdate',{ key: 'basic',...form})

  emit('handleUpdate', {
    key: 'basic',
    hotel: {
      // is_virtuoso_hotel : getData.is_virtuoso_hotel,
      country_id: getData.country_id,
      city_id: getData.city_id,
      hotel_brand_id: getData.hotel_brand_id,
      // hotel_chain: getData.hotel_chain,
      lat: getData.lat,
      lng: getData.lng,
      phone: getData.phone,
      fax: getData.fax,
      web_site: getData.web_site,
      email: getData.email,
      postal_code: getData.postal_code,
      tags: [...getData.hotelBenefitTags?.map((d) => d.id), ...getData.hotelPlanTags?.map((d) => d.id)],
    },
    media: media,
    lang: {
      address: getLang.address,
      desc: getLang.desc,
      name: getLang.name,
      lang: getLang.lang,
      hotel_code: getLang.hotel_code,
    },
  });
};
const setCountry = (model) => {
  if (!model) {
    data.value.country_id = null;
    data.value.country = null;
    data.value.city_id = null;
    data.value.city = null;
    return;
  }
  geo.country = model.name;
  data.value.country_id = model.id;
  data.value.city_id = null;
};
const setCity = (model) => {
  if (!model) return;
  geo.city = model.name;
  data.value.city_id = model.id;
};

const openMedia = () => {
  MediaRef.value.handleOpenModal();
};

const handleMedia = (val) => {
  chooseMedia.value = val;
};

const handleCoverSelect = (index) => {
  for (let i in chooseMedia.value) {
    chooseMedia.value[i].isCover = i == index;
  }
};

const onMapClick = async (e) => {
  if (!e.latLng) {
    return;
  }
};

const onMarkerClick = async (e, markerIndex) => {
  lmap.value.setCenter({
    lat: e.latLng.lat(),
    lng: e.latLng.lng(),
  });
  currentMarkerIndex.value = String(markerIndex);
};

const onMarkerDragged = async (e) => {
  data.value.lat = _.round(e.latLng.lat(), 7);
  data.value.lng = _.round(e.latLng.lng(), 7);
  const address = await getAddress(e.latLng.lat(), e.latLng.lng());
  if (address) lang.value.address = address;  // 反查失敗時不要清空使用者已輸入的地址
};

// 從各種 Google Maps URL 格式擷取座標
// 支援: /place/.../@lat,lng,zoom/, /search/.../@lat,lng/, /@lat,lng/, ?ll=lat,lng, ?q=lat,lng
const extractGoogleMapsCoords = (text) => {
  if (!text) return null;
  const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  const llMatch = text.match(/[?&](?:ll|q)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
  return null;
};

const openGoogleMapsSearch = () => {
  // 地址優先：物理位置的精確識別符，比名稱更可靠
  // 名稱（中/英/自訂）可能讓 Google 跑到品牌的其他分店
  const address = (lang.value.address || data.value.address || '').trim();
  const name = (lang.value.name || data.value.name || '').trim();
  const query = address || name;
  if (!query) {
    $q.notify({ type: 'warning', position: 'top', timeout: 2500, message: '請先填寫酒店名稱或地址' });
    return;
  }
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
};

const pasteCoordsFromClipboard = async () => {
  let text;
  try {
    text = await navigator.clipboard.readText();
  } catch (e) {
    $q.notify({
      type: 'warning', position: 'top', timeout: 4000,
      message: '無法讀取剪貼簿，請改用 Cmd+V 貼到緯度欄位手動輸入',
    });
    return;
  }

  if (!text) {
    $q.notify({ type: 'warning', position: 'top', timeout: 2500, message: '剪貼簿是空的，請先複製 Google Maps 網址' });
    return;
  }

  if (/maps\.app\.goo\.gl|goo\.gl\/maps/.test(text)) {
    $q.notify({
      type: 'warning', position: 'top', timeout: 5000,
      message: '短網址無法解析，請從 Google Maps 網址列複製完整網址（網址中要看得到 @數字,數字 那種）',
    });
    return;
  }

  const coords = extractGoogleMapsCoords(text);
  if (!coords) {
    $q.notify({
      type: 'warning', position: 'top', timeout: 4000,
      message: '剪貼簿不是 Google Maps 網址，請先到 Google Maps 找到位置再複製網址',
    });
    return;
  }

  data.value.lat = _.round(coords.lat, 7);
  data.value.lng = _.round(coords.lng, 7);
  $q.notify({ type: 'positive', position: 'top', timeout: 2000, message: `已套用座標 (${data.value.lat}, ${data.value.lng})` });
};

const rules = computed(() => {
  return {
    name: [(val) => !isEmpty(val) || messages.requiredInput()],
    // hotelChain: [(val) => !isEmpty(val) || messages.requiredInput()],
    hotelCode: [(val) => !isEmpty(val) || messages.requiredInput()],
    // desc: [(val) => !isEmpty(val) || messages.requiredInput()],
    // brand: [(val) => !isEmpty(val) || messages.requiredInput()],
    country: [(val) => !isEmpty(val) || messages.requiredInput()],
    city: [(val) => !isEmpty(val) || messages.requiredInput()],
    address: [(val) => !isEmpty(val) || messages.requiredInput()],
    lat: [(val) => isValidLat(val) || '請設定有效的緯度'],
    lng: [(val) => isValidLng(val) || '請設定有效的經度'],
  };
});

onMounted(() => {
  lang.value = props.propsLang;
  data.value = props.propsData;
  data.value.hotelBenefitTags = props.propsData.tags?.filter((d) => d.tag_type_id === hotelBenefitTagType.id) || [];
  data.value.hotelPlanTags = props.propsData.tags?.filter((d) => d.tag_type_id === hotelPlanTagType.id) || [];
});

watch(
  () => props.propsLang,
  () => {
    lang.value = props.propsLang;
  },
);

watch(
  () => props.propsData,
  () => {
    data.value = props.propsData;
    data.value.hotelBenefitTags = props.propsData.tags?.filter((d) => d.tag_type_id === hotelBenefitTagType.id) || [];
    data.value.hotelPlanTags = props.propsData.tags?.filter((d) => d.tag_type_id === hotelPlanTagType.id) || [];
    geo.city = data.value.city;
    geo.country = data.value.country;
    shareLink.value = `https://app.leorano.com/discover/hotel?id=${data.value.hotel_id}&start=14&end=15`;


    for (let key in data.value['media_slider']) {
      const item = data.value['media_slider'][key];
      chooseMedia.value[item.media_id] = {
        src: item.media.url_format,
        isCover: item.is_cover == 1,
      };
    }
  },
);
const releaseUrl = (url) => {
  return url.replace('%s', 'M');
};
</script>

<style lang="scss" scoped>
.image-wrap {
  &.pick .q-img {
    border: 3px solid $positive;
  }
  .text-subtitle2 {
    padding: 5px;
  }
}

.gmap {
  width: 100%;
  height: 20rem;
}

@media (min-width: $breakpoint-md-min) {
  .location-field {
    width: 300px;
  }
}
</style>
