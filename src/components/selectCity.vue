<template>
  <div>
    <q-select outlined dense :emit-value='false' use-input input-debounce='500' :label='label' v-model='model'
      :options='group_options' map-options option-value="id" option-label="name" clearable fill-input hide-selected
      @update:modelValue="handleSelection" :disable="!hasCountry" :rules="rules" style="min-width: 150px"
      @filter="onFilter" />
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, computed, onMounted } from 'vue'
import { RequestCityCodeList } from 'src/api'
import to from 'await-to-js';
import _ from 'lodash'

const emit = defineEmits(['handleCallBack'])
const props = defineProps({
  multiple: Boolean,
  country: Number,
  default: {
    type: Object,
    default() {
      return {
        name: String,
        id: String
      }
    }
  },
  rules: Array,
  loadOnInit: {
    type: Boolean,
    default() {
      return true
    }
  },
  label: {
    type: String,
    default() {
      return '選擇城市'
    }
  }
})
const model = ref(null)
const allOptions = ref([])
const group_options = ref([])

const getRequest = (val) => {
  return RequestCityCodeList({
    country: props.country,
    lang: 'en',
    name: val,
    limit: 5000,
    orderBy: 'name',
    sort: 'asc'
  })
}

const handleSelection = () => {
  emit('handleCallBack', model.value)
}

const getOptions = async (val) => {
  const [err, res] = await to(getRequest(val));
  if (err || res.code !== 0) {
    console.warn('get city error:', err);
    return;
  }

  let newArr = res.data.map((item) => {
    return {
      id: item.id,
      name: item.name,
    }
  });
  // const all = { id: null, name: '所有城市', currency_name: null };
  // group_options.value = [all, ...newArr];
  allOptions.value = newArr
  group_options.value = newArr;
}

// let timer = null;
// const onTextSearch = (val) => {
//   // if (val.includes('所有')) {
//   //   return
//   // }
//   if (timer) {
//     clearTimeout(timer);
//   }
//   timer = setTimeout(() => {
//     getOptions(val);
//   }, 500);
// };
const onFilter = (val, update, abort) => {
  update(() => {
    if (val) {
      group_options.value = allOptions.value.filter(d => _.toLower(d.name).includes(_.toLower(val)))
    } else {
      group_options.value = allOptions.value
    }
  })
}

watch(() => props.country, async (newValue) => {
  getOptions();
})

watchEffect(() => {
  if (props.default?.id) {
    let item = allOptions.value.find(d => d.id === props.default.id)
    if (item) {
      model.value = { name: item.name, id: props.default.id };
    }
  }
});

const hasCountry = computed(() => {
  return props.country && props.country > 0
})

const updateOptions = () => {
  getOptions();
}
defineExpose({ updateOptions });

onMounted(() => {
  if (props.loadOnInit) {
    getOptions();
  }
})
</script>

<style scoped></style>
