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
          <selectBrand @handle-call-back="setBrand" />
        </div>
        <div class="col-6">
          <label class="custom-form_label">Hotel Chain *</label>
          <q-input outlined dense v-model="model.hotelChain" readonly />
        </div>
        <div class="col-6">
          <label class="custom-form_label">TP Hotel Code *</label>
          <q-input outlined dense v-model="model.hotelCode" :rules="rules.hotelCode" />
        </div>
        <div class="col-12">
          <label class="custom-form_label">酒店描述</label>
          <q-input v-model="model.desc" outlined dense type="textarea" />
        </div>
        <div class="col-6">
          <label class="custom-form_label">國家 *</label>
          <selectCountry @handle-call-back="setCountry" :default="{}" :rules="rules.country"></selectCountry>
        </div>
        <div class="col-6">
          <label class="custom-form_label">當地貨幣</label>
          <q-input v-model="model.localCurrency" readonly outlined dense />
        </div>
        <div class="col-6">
          <label class="custom-form_label">城市 *</label>
          <selectCity @handle-call-back="setCity" :default="{}" :country="model.country" :rules="rules.city">
          </selectCity>
        </div>
        <div class="col-6">
          <label class="custom-form_label column">郵遞區號 *</label>
          <q-input outlined dense v-model.trim="model.postalCode" :rules="rules.postalCode" />
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
        <div class="col-12">
          <label class="custom-form_label column">
            地址 *
            <span v-if="tpAddress" class="q-pl-sm text-grey-6">tp: {{ tpAddress }}</span>
            <span v-else class="q-pl-sm text-grey-6">tp: xxxx</span>
          </label>
          <q-input outlined dense v-model="model.address" :rules="rules.address">
            <template #append>
              <q-icon class="cursor-pointer" name="location_on" color="red-9" size="32px" @click.prevent="getGeo" />
              <q-tooltip>定位</q-tooltip>
            </template>
          </q-input>
        </div>
        <div class="col-12 row q-gutter-x-md">
          <label class="col-12 custom-form_label">酒店座標</label>
          <q-input class="col" outlined dense readonly v-model="model.lat" />
          <q-input class="col" outlined dense readonly v-model="model.lng" />
          <div class="col-12 q-mt-md">
            <q-responsive :ratio="16 / 9">
              <GMapMap ref="gmapRef" :center="center" :zoom="16" :options="mapOptions" map-type-id="terrain" class="gmap">
                <GMapMarker :key="index" v-for="(m, index) in markers" :position="m.position" :clickable="true"
                  :draggable="false">
                </GMapMarker>
              </GMapMap>
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
import { isEmpty, messages } from 'src/utils/validators.js';
import DialogAmenities from 'src/components/DialogAmenities.vue';
import selectBrand from 'src/components/selectBrand.vue';
import selectCountry from 'src/components/selectCountry.vue';
import selectCity from 'src/components/selectCity.vue';
import TimePicker from 'components/TimePicker.vue';
import SelectTag from 'src/components/dialog/SelectTag.vue';
import { TagType } from 'src/pages/enums';

const props = defineProps({
  data: {
    type: Object,
    default() {
      return {};
    },
  },
});

const gmapRef = ref();
const formRef = ref();
const selectTagRef = ref();
const showDialogAmenities = ref(false);
const model: any = ref({});
const tpName = ref(null); // inject('tpName')
const tpAddress = ref(null); // inject('tpAddress')
const mapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
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
    postalCode: [(val: any) => !isEmpty(val) || messages.requiredInput()],
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
  model.value.localCurrency = opt.currency_name;
};

const setCity = (opt: any) => {
  if (!opt) {
    return;
  }
  model.value.city = opt.id;
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

const getGeo = async () => {
  const address = model.value.address;

  if (!address) {
    console.warn('stop get map position: no address or no geo data');
    return;
  }
  // &city=${geo.city}&country=${geo.country}
  const [err, res] = await to(
    axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?language=en&address=${address}&key=AIzaSyCkbldNUJ9kFFzQQWm-fVibY2qP7iFVUek`,
    ),
  );

  if (err) {
    console.error('getGeo error:', err);
    return;
  }
  let result = res.data.results[0].geometry.location;
  model.value.lat = result.lat;
  model.value.lng = result.lng;
};

const center = computed(() => {
  return {
    lat: model.value.lat || 0,
    lng: model.value.lng || 0,
  };
});

const markers = computed(() => {
  return [
    {
      position: {
        lat: model.value.lat || 0,
        lng: model.value.lng || 0,
      },
      title: model.value.name,
    },
  ];
});

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
    lat: parseInt(model.value.lat),
    lng: parseInt(model.value.lng),
    check_in_time: model.value.checkInTime,
    check_out_time: model.value.checkOutTime,
    child_age: parseInt(model.value.childAge),
    is_published: false,
    postal_code: model.value.postalCode,
    amenities: model.value.amenities.map((d: any) => d.id),
    is_visible: true,
  };
};

defineExpose({ validate, getModel });
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
