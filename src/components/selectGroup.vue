<template>
  <div>
    <q-select dense outlined v-model='model' use-input input-debounce='500' :label='label' option-value="id"
      option-label="name" :options='group_options' clearable fill-input hide-selected @update:modelValue="handleSelection"
      style="min-width: 150px" @filter="onFilter" />
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { RequestGroupByName } from 'src/api'
import to from 'await-to-js';
import _ from 'lodash'

const emit = defineEmits(['handleCallBack'])
const props = defineProps({
  handleCallBack: Function,
  default: {
    type: Object,
    default() {
      return {
        name: String,
        id: String
      }
    }
  },
  label: {
    type: String,
    default() {
      return '依集團搜尋'
    }
  }
})
const model = ref(null)
const allOptions = ref([])
const group_options = ref([])

const getRequest = (val) => {
  return RequestGroupByName({
    lang: 'en',
    name: val,
    limit: 5000,
    orderBy: 'name',
    sort: 'asc'
  })
}

const handleSelection = () => {
  emit('handleCallBack', { col: "group_id", val: model.value ? model.value.id : null })
}

const getOptions = async (val) => {
  const [err, res] = await to(getRequest(val));
  if (res.code != 0) return;

  let newArr = res.data.map((item) => {
    return {
      id: item.id,
      name: item.name,
    }
  });
  // const all = { id: null, name: '所有集團', currency_name: null };
  // group_options.value = [all, ...newArr];
  allOptions.value = newArr;
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

onMounted(() => {
  getOptions();
});
</script>

<style scoped></style>
