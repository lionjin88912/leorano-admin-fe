<template>
  <div>
    <q-select outlined dense use-input input-debounce='500' :label='label' v-model='model' :options='group_options'
      map-options option-value="id" option-label="name" :rules="rules" clearable fill-input hide-selected
      @update:modelValue="handleSelection" style="min-width: 150px" @filter="onFilter" />
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { RequestCountryCodeList } from 'src/api'
import to from 'await-to-js';
import _ from 'lodash'

const emit = defineEmits(["handleCallBack"]);
const props = defineProps({
  multiple: Boolean,
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
  label: {
    type: String,
    default() {
      return '選擇國家'
    }
  }
})

const model = ref(null)
const allOptions = ref([])
const group_options = ref([])

const getRequest = (val) => {
  return RequestCountryCodeList({
    lang: 'en',
    name: val,
    limit: 5000,
    orderBy: 'name',
    sort: 'asc'
  })
}

const handleSelection = () => {
  emit('handleCallBack', (model.value))
}

const getOptions = async (val) => {
  const [err, res] = await to(getRequest(val))
  if (err || res.code !== 0) {
    console.warn('get country error:', err);
    return;
  }

  let newArr = res.data.map((item) => {
    return {
      id: item.id,
      name: item.name,
      currency_name: item.currency_name
    }
  });
  // const all = { id: null, name: '所有國家', currency_name: null };
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

watchEffect(() => {
  if (props.default.id) {
    let item = allOptions.value.find(d => d.id === props.default.id)
    if (item) {
      model.value = { name: item.name, id: props.default.id };
    }
  }
});

const updateOptions = () => {
  getOptions();
}
defineExpose({ updateOptions });

onMounted(() => {
  getOptions();
})
</script>

<style scoped></style>
