<template>
  <div class="flex-1">
    <q-form ref="form" class="edit-form q-gutter-md">
      <div class="flex-1">
        <q-select class="edit-form-field q-pr-md" v-model="model.country_id" label="國家" :options="filteredCountryOptions" @input-value="onFilterCountry" emit-value map-options use-input hide-bottom-space dense
          outlined></q-select>
      </div>
      <div class="flex-1">
        <q-select class="edit-form-field q-pr-md" v-model="currentTz" :options="filteredTzOptions" label="時區 *"
          :rules="rules.tz" @input-value="onFilterTz" @update:model-value="onTzSelected" use-input hide-bottom-space dense
          outlined></q-select>
        <q-input class="edit-form-field small q-pr-md" v-model="model.time_offset" label="時差 *" suffix="小時" readonly
          hide-bottom-space lazy-rules dense outlined></q-input>
      </div>
      <div class="flex-1 justify-between no-wrap">
        <q-input class="edit-form-field q-pr-md" v-model="model.name" label="城市名稱 *" :rules="rules.name" hide-bottom-space
          lazy-rules dense outlined>
          <template #append>
            <q-icon class="cursor-pointer" name="location_on" color="red-9" size="32px" @click.prevent='getGeo' />
            <q-tooltip>定位</q-tooltip>
          </template>
        </q-input>
        <q-input class="edit-form-field small q-pr-md" v-model="model.code" label="簡碼"
          hide-bottom-space lazy-rules dense outlined></q-input>
      </div>
      <div class="flex">
        <div class="flex-1 block q-mr-md">
          <q-responsive :ratio="16 / 9">
            <GMapMap ref="gmapRef" :center="center" :zoom="16" :options="mapOptions" map-type-id="terrain" class="gmap">
              <GMapMarker :key="index" v-for="(m, index) in markers" :position="m.position" :clickable="true"
                :draggable="false">
              </GMapMarker>
            </GMapMap>
          </q-responsive>
        </div>
        <q-field class="q-pr-md" style="width: 250px;" label='城市座標' stack-label outlined dense readonly hide-hint
          hide-bottom-space>
          <template v-slot:control>
            <div class="flex-1 items-center justify-around q-pt-sm">
              <div class="text-grey-9">
                緯度 <span class="text-grey-6">{{ model.lat }}</span>
              </div>
              <div class="text-grey-9">
                經度 <span class="text-grey-6">{{ model.lng }}</span>
              </div>
            </div>
          </template>
        </q-field>
      </div>
    </q-form>
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, watch, reactive } from 'vue'
import { useQuasar } from 'quasar';
import axios from 'axios'
import to from 'await-to-js';
import { isEmpty, messages } from 'src/utils/validators';
import * as helpers from 'src/utils/helpers';
import _ from 'lodash';

const props = defineProps({
  data: {
    type: Object,
    default() {
      return {}
    }
  },
  countryOptions: {
    type: Array,
    default() {
      return []
    }
  }
});

const $q = useQuasar();
const gmapRef = ref();
const form = ref();
const model = ref({});
const filterCountry = ref(null);
const filterTz = ref(null);
const filteredCountryOptions = computed(() => {
  if (filterCountry.value) {
    return props.countryOptions.filter(d => _.lowerCase(d.label).includes(_.lowerCase(filterCountry.value.trim())))
  } else {
    return props.countryOptions
  }
})
const tzOptions = helpers.getTimeZoneList().map(d => {
  return {
    label: `${d.timezone} (${d.offsetHour >= 0 ? '+' : ''}${d.offsetHour})`,
    value: d.timezone,
    offset: d.offsetHour
  }
});
const filteredTzOptions = computed(() => {
  if (filterTz.value) {
    return tzOptions.filter(d => _.lowerCase(d.label).includes(_.lowerCase(filterTz.value.trim())))
  } else {
    return tzOptions
  }
})
const currentTz = ref();

const mapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
}

const getGeo = async () => {
  const address = `${model.value.country} ${model.value.name || ''}`.trim();

  if (!address) {
    console.warn('stop get map position: no address or no geo data');
    return;
  }
  const [err, res] = await to(axios.get(`https://maps.googleapis.com/maps/api/geocode/json?language=en&address=${address}&key=AIzaSyCkbldNUJ9kFFzQQWm-fVibY2qP7iFVUek`));

  if (err) {
    console.error('getGeo error:', err);
    return;
  }
  if (res.data.results.length <= 0) {
    console.warn(`can not find address location: '${address}'`);
    return;
  }
  let result = res.data.results[0].geometry.location
  model.value.lat = result.lat;
  model.value.lng = result.lng;
}

const center = computed(() => {
  return {
    lat: model.value.lat || 0,
    lng: model.value.lng || 0
  }
})

const markers = computed(() => {
  return [{
    position: {
      lat: model.value.lat || 0,
      lng: model.value.lng || 0
    },
    title: model.value.name
  }]
})

const rules = computed(() => {
  return {
    name: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    tz: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    time_offset: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    number_of_hotels: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isPositiveInteger(val) || messages.inputPositiveInteger()
    ],
  }
});

const onFilterCountry = (val) => {
  filterCountry.value = val;
}

const onFilterTz = (val) => {
  filterTz.value = val;
}

const onTzSelected = (val) => {
  if (!val) {
    model.value.tz = null;
    model.value.time_offset = null;
    return;
  }
  model.value.tz = val.value
  model.value.time_offset = val.offset
}

watch(() => model.value.country_id, (newVal) => {
  getGeo();
})

watchEffect(() => {
  model.value = props.data;
  currentTz.value = tzOptions.find(d => d.value === props.data.tz)
})

// watch(currentTz, (newVal) => {
//   model.value.time_offset = currentTz.value.offset
//   model.value.tz = currentTz.value.value
// })

const validate = async () => {
  return await form.value.validate();
}

const getModel = () => {
  return {
    country_id: model.value.country_id,
    id: model.value.id,
    code: model.value.code,
    name: model.value.name,
    lat: model.value.lat,
    lng: model.value.lng,
    tz: currentTz.value.value,
    time_offset: currentTz.value.offset
  };
}

defineExpose({ validate, getModel })

</script>
<style lang="scss" scoped>
.edit-form {
  display: flex;
  flex: 1;
  flex-direction: column;

  // width: 450px;
  &-field {
    display: flex;
    flex: 1;
    // max-width: 300px;

    &.small {
      max-width: 160px;
    }

    &.full {
      // cursor: pointer;
      max-width: 100%;
    }
  }
}
</style>
