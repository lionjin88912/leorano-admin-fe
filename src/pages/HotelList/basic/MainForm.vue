<template>
  <div>
    <q-form ref="formRef" class="custom-form row q-col-gutter-x-xl">
      <section class="height-fit q-pt-none col row q-col-gutter-md">
        <div class="col-12">
          <label class="custom-form_label">
            酒店名稱 *
            <span v-if="!tpName" class="q-pl-sm text-grey-6">tp: xxxx</span>
            <span v-else class="q-pl-sm text-grey-6">tp: {{ tpName }}</span>
          </label>
          <q-input v-model="model.name" outlined dense :rules="rules.name" hide-bottom-space />
        </div>
        <div class="col-12">
          <label class="custom-form_label">
            酒店品牌
            <span v-show="model.hotel_group_name" class="text-grey-6"> (集團:{{ model.hotel_group_name }}) </span>
          </label>
          <selectBrand ref="selectBrandRef" @handle-call-back="setBrand" />
        </div>
        <div class="col-6">
          <label class="custom-form_label">Hotel Chain *</label>
          <q-input outlined dense v-model="model.hotelChain" readonly />
        </div>
        <div class="col-6">
          <label class="custom-form_label">TP Hotel Code *</label>
          <q-input outlined dense v-model="model.hotelCode" :rules="rules.hotelCode" :error="!apiRule.isValid" :error-message="apiRule.message" />
        </div>
        <div class="col-12">
          <label class="custom-form_label">酒店描述</label>
          <q-input v-model="model.desc" outlined dense type="textarea" />
        </div>
        <div class="col-6">
          <label class="custom-form_label">當地貨幣</label>
          <q-input v-model="model.localCurrency" readonly outlined dense />
        </div>
        <div class="col-6">
          <label class="custom-form_label column">郵遞區號</label>
          <q-input outlined dense v-model.trim="model.postalCode" />
        </div>
        <div class="col-6">
          <label class="custom-form_label">聯絡電話</label>
          <q-input outlined dense v-model="model.phone" />
        </div>
        <div class="col-6">
          <label class="custom-form_label">傳真電話</label>
          <q-input outlined dense v-model="model.fax" />
        </div>

        <div class="col-12">
          <label class="custom-form_label">
            酒店設施
          </label>
          <div @click="showTagSelect()">
            <q-field class="cursor-pointer" :hide-bottom-space="false" :hide-hint="false" outlined dense>
              <template v-slot:control>
                <q-chip v-for="(tag, index) of model.amenities" :key="index" :label="tag.name" size="sm" color="green-7"
                  text-color="white"></q-chip>
              </template>
            </q-field>
          </div>
        </div>
        <div class="col-12">
          <label class="custom-form_label q-pr-sm">是否為Virtuoso Hotel</label>
          <q-toggle size="lg" color="blue" v-model="model.isVirtuosoHotel" />
        </div>
      </section>
      <section class="q-pt-none height-fit col-6 row q-col-gutter-md">
        <div class="row col-6">
          <label class="col-12 custom-form_label">CheckIn Time</label>
          <time-picker v-model="model.checkInTime" class="col-12" outlined dense />
        </div>
        <div class="row col-6">
          <label class="col-12 custom-form_label">CheckOut Time</label>
          <time-picker v-model="model.checkOutTime" class="col-12" outlined dense />
        </div>
        <div class="col-12">
          <label class="custom-form_label">兒童歲數上限</label>
          <q-input type="number" outlined dense v-model="model.childAge" />
        </div>
        <div class="col-6">
          <label class="custom-form_label" @click="updateSelectOptions">國家 *</label>
          <selectCountry ref="selectCountryRef" @handle-call-back="setCountry" :default="{}" :rules="rules.country"></selectCountry>
        </div>
        <div class="col-6">
          <label class="custom-form_label">城市 *</label>
          <selectCity ref="selectCityRef" @handle-call-back="setCity" :default="{}" :country="model.country" :rules="rules.city">
          </selectCity>
        </div>
        <div class="col-12">
          <label class="custom-form_label column">
            地址 *
            <span v-if="tpAddress" class="q-pl-sm text-grey-6">tp: {{ tpAddress }}</span>
            <span v-else class="q-pl-sm text-grey-6">tp: xxxx</span>
          </label>
          <q-input outlined dense v-model="model.address" :rules="rules.address">
            <template #append>
              <q-spinner v-if="isLocating" color="red-9" size="32px" />
              <q-icon v-else class="cursor-pointer" name="location_on" color="red-9" size="32px" @click.prevent="getGeo" />
              <q-tooltip v-if="!isLocating">定位</q-tooltip>
            </template>
          </q-input>
        </div>
        <div class="col-12 row q-gutter-x-md">
          <label class="col-12 custom-form_label">酒店座標 (可手動輸入或拖曳地圖標記)</label>
          <q-input class="col" outlined dense type="number" v-model.number="model.lat" label="緯度" :rules="rules.lat" hide-bottom-space />
          <q-input class="col" outlined dense type="number" v-model.number="model.lng" label="經度" :rules="rules.lng" hide-bottom-space />
          <div class="col-12 q-mt-md">
            <q-responsive :ratio="16 / 9">
              <LeafletMap
                ref="lmapRef"
                :center="center"
                :zoom="16"
                :markers="markers"
                :draggable-marker="true"
                height="100%"
                class="gmap"
                @click="onMapClick"
                @marker-dragged="onMarkerDragged"
              />
            </q-responsive>
          </div>
        </div>
        <slot name="cover" />
        <slot name="carousel" />
      </section>
      <dialog-amenities v-model="showDialogAmenities" :dataList="['健身房', '游泳池', '商務中心']"
        :tpList="['健身房', '游泳池', '商務中心', '洗衣間']" />
    </q-form>
    <SelectTag ref="selectTagRef" @selected="onTagSelected" :multiple="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import axios from 'axios';
import to from 'await-to-js';
import _ from 'lodash';
import { useQuasar } from 'quasar';
import { isEmpty, messages } from 'src/utils/validators.js';
import DialogAmenities from 'src/components/DialogAmenities.vue';
import selectBrand from 'src/components/selectBrand.vue';
import selectCountry from 'src/components/selectCountry.vue';
import selectCity from 'src/components/selectCity.vue';
import TimePicker from 'components/TimePicker.vue';
import SelectTag from 'src/components/dialog/SelectTag.vue';
import LeafletMap from 'src/components/LeafletMap.vue';
import { TagType } from 'src/pages/enums';

const props = defineProps({
  data: {
    type: Object,
    default() {
      return {};
    },
  },
  apiRule: {
    type: Object
  }
});

const $q = useQuasar();
const lmapRef = ref();
const formRef = ref();
const selectTagRef = ref();
const showDialogAmenities = ref(false);
const isLocating = ref(false);
const model: any = ref({});

// 緯度合法且非 0
const isValidLat = (v: any) => {
  const n = parseFloat(v);
  return !isNaN(n) && n !== 0 && n >= -90 && n <= 90;
};
// 經度合法且非 0
const isValidLng = (v: any) => {
  const n = parseFloat(v);
  return !isNaN(n) && n !== 0 && n >= -180 && n <= 180;
};

const rules = computed(() => {
  return {
    name: [(val: any) => !isEmpty(val) || messages.requiredInput()],
    hotelChain: [(val: any) => !isEmpty(val) || messages.requiredInput()],
    hotelCode: [(val: any) => !isEmpty(val) || messages.requiredInput()],
    desc: [(val: any) => !isEmpty(val) || messages.requiredInput()],
    brand: [(val: any) => !isEmpty(val) || messages.requiredInput()],
    country: [(val: any) => !isEmpty(val) || messages.requiredInput()],
    city: [(val: any) => !isEmpty(val) || messages.requiredInput()],
    address: [(val: any) => !isEmpty(val) || messages.requiredInput()],
    lat: [(val: any) => isValidLat(val) || '請設定有效的緯度（點定位、拖曳地圖或手動輸入）'],
    lng: [(val: any) => isValidLng(val) || '請設定有效的經度（點定位、拖曳地圖或手動輸入）'],
    // postalCode: [(val: any) => !isEmpty(val) || messages.requiredInput()],
  };
});

const setBrand = (opt: any) => {
  // console.log('brand:', opt)
  if (!opt) {
    return;
  }
  model.value.brand = opt.val;
  model.value.hotel_group_name = opt.hotel_group_name;
  model.value.hotelChain = opt.hotel_chain;
};

const setCountry = (opt: any) => {
  if (!opt) {
    return;
  }
  model.value.country = opt.id;
  model.value.country_name = opt.name;
  model.value.localCurrency = opt.currency_name;
};

const setCity = (opt: any) => {
  if (!opt) {
    return;
  }
  model.value.city = opt.id;
  model.value.city_name = opt.name;
};

const showTagSelect = () => {
  selectTagRef.value.show({
    tagTypeId: TagType.Amenity.value,
    tagTypeName: TagType.Amenity.label,
    selection: model.value.amenities || [],
  });
};

const onTagSelected = ({ selection }: any) => {
  // console.log('onTagSelected:', selection);
  model.value.amenities = selection;
};

const queryNominatim = async (q: string) => {
  const [err, res] = await to(
    axios.get('https://nominatim.openstreetmap.org/search', {
      params: { format: 'json', q, limit: 1, 'accept-language': 'en' },
      timeout: 10000,
    }),
  );
  if (err) throw err;
  if (!res.data || res.data.length === 0) return null;
  return res.data[0];
};

const getGeo = async () => {
  if (isLocating.value) return;

  const name = (model.value.name || '').trim();
  const address = (model.value.address || '').trim();
  const cityName = model.value.city_name;
  const countryName = model.value.country_name;

  if (!name && !address) {
    $q.notify({ type: 'warning', position: 'top', timeout: 2500, message: '請先填寫酒店名稱或地址' });
    return;
  }

  // Nominatim 對 POI/地標查詢比街道地址精準很多 → 先用 name，最後 fallback 到 address
  const queries: string[] = [];
  if (name) {
    queries.push(name);
    if (cityName || countryName) {
      queries.push([name, cityName, countryName].filter(Boolean).join(', '));
    }
  }
  if (address) {
    if (cityName || countryName) {
      queries.push([address, cityName, countryName].filter(Boolean).join(', '));
    }
    queries.push(address);
  }

  isLocating.value = true;
  try {
    let hit = null;
    for (const q of queries) {
      try {
        hit = await queryNominatim(q);
        if (hit) break;
      } catch (e) {
        console.error('getGeo error:', e);
        $q.notify({
          type: 'negative',
          position: 'top',
          timeout: 3000,
          message: '定位服務暫無回應，請稍後再試或直接拖曳地圖標記',
        });
        return;
      }
    }

    if (!hit) {
      $q.notify({
        type: 'warning',
        position: 'top',
        timeout: 3000,
        message: '查無此地址座標，請拖曳地圖標記或直接輸入經緯度',
      });
      return;
    }

    model.value.lat = _.round(parseFloat(hit.lat), 7);
    model.value.lng = _.round(parseFloat(hit.lon), 7);
    $q.notify({ type: 'positive', position: 'top', timeout: 1500, message: '定位成功' });
  } finally {
    isLocating.value = false;
  }
};

const onMapClick = (e: any) => {
  if (!e?.latLng) return;
  model.value.lat = _.round(e.latLng.lat(), 7);
  model.value.lng = _.round(e.latLng.lng(), 7);
};

const onMarkerDragged = (e: any) => {
  if (!e?.latLng) return;
  model.value.lat = _.round(e.latLng.lat(), 7);
  model.value.lng = _.round(e.latLng.lng(), 7);
};

// 座標未設定/被清空時不要把地圖跳到 (0,0)（大西洋）；維持 LeafletMap 的台北 101 預設
const TAIPEI_DEFAULT = { lat: 25.0330, lng: 121.5654 };

const center = computed(() => {
  if (!isValidLat(model.value.lat) || !isValidLng(model.value.lng)) return TAIPEI_DEFAULT;
  return { lat: parseFloat(model.value.lat), lng: parseFloat(model.value.lng) };
});

const markers = computed(() => {
  if (!isValidLat(model.value.lat) || !isValidLng(model.value.lng)) return [];
  return [
    {
      position: { lat: parseFloat(model.value.lat), lng: parseFloat(model.value.lng) },
      title: model.value.name,
    },
  ];
});

const selectCountryRef = ref();
const selectCityRef = ref();  
const selectBrandRef = ref();
const updateSelectOptions = async () => {
  await selectCountryRef.value.updateOptions();
  await selectCityRef.value.updateOptions();
  await selectBrandRef.value.updateOptions();
  return true;
}

watchEffect(() => {
  // console.log('data:', props.data);
  model.value = props.data;
});

const validate = async () => {
  return await formRef.value.validate();
};

const getModel = () => {
  return {
    name: model.value.name,
    hotel_brand_id: parseInt(model.value.brand),
    hotel_code: model.value.hotelCode,
    hotel_chain: model.value.hotelChain,
    desc: model.value.desc,
    country_id: parseInt(model.value.country),
    city_id: parseInt(model.value.city),
    address: model.value.address,
    phone: model.value.phone,
    fax: model.value.fax,
    is_virtuoso_hotel: model.value.isVirtuosoHotel,
    lat: _.round(parseFloat(model.value.lat) || 0, 7),
    lng: _.round(parseFloat(model.value.lng) || 0, 7),
    check_in_time: model.value.checkInTime,
    check_out_time: model.value.checkOutTime,
    child_age: parseInt(model.value.childAge),
    is_published: false,
    postal_code: model.value.postalCode,
    amenities: model.value.amenities.map((d: any) => d.id),
    is_visible: true,
  };
};

defineExpose({ validate, getModel, updateSelectOptions });
</script>

<style scoped>
.mode-title {
  height: 66px;
  display: flex;
  align-items: center;
}

.btn-area {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.btn-sub {
  padding: 0;
}
</style>
