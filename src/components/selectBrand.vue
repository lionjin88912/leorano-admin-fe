<template>
  <div>
    <q-select dense outlined v-model='model' use-input input-debounce='500' :label='label' option-value="id"
      option-label="name" clearable fill-input hide-selected :options='group_options' :rules="rules"
      @update:modelValue="handleSelection" style="min-width: 150px" @filter="onFilter" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { RequestBrandByName } from 'src/api'
import to from 'await-to-js';
import _ from 'lodash'

const emit = defineEmits(['handleCallBack'])
const props = defineProps({
  handleCallBack: Function,
  multiple: Boolean,
  group: Number,
  default: {
    id: {
      type: Object,
      validator: function (value) {
        // 驗證 value 是否包含指定的鍵和相應的類型
        return (
          value.hasOwnProperty('id') &&
          typeof value.key1 === 'number'
        );
      },
    }
  },
  rules: Array,
  label: {
    type: String,
    default() {
      return '依品牌搜尋'
    }
  }
})

const model = ref(null)
const allOptions = ref([])
const group_options = ref([])

const getRequest = (val) => {
  return RequestBrandByName({
    group_id: props.group,
    lang: 'en',
    name: val,
    limit: 5000,
    orderBy: 'name',
    sort: 'asc'
  })
}

const handleSelection = () => {
  emit('handleCallBack', {
    col: "brand_id",
    val: model.value?.id,
    hotel_group_name: model.value?.hotel_group_name,
    hotel_chain: model.value?.hotel_chain
  })
}

const getOptions = async (val) => {
  const [err, res] = await to(getRequest(val));
  if (res.code != 0) return;

  let newArr = res.data.map((item) => {
    return {
      id: item.id,
      name: item.name,
      hotel_group_name: item.hotel_group_name,
      hotel_chain: item.hotel_chain
    }
  });
  allOptions.value = newArr
  group_options.value = newArr;
}

const onFilter = (val, update, abort) => {
  update(() => {
    if (val) {
      group_options.value = allOptions.value.filter(d => _.toLower(d.name).includes(_.toLower(val)) || _.toLower(d.hotel_group_name).includes(_.toLower(val)))
    } else {
      group_options.value = allOptions.value
    }
  })
}

const updateOptions = () => {
  getOptions();
}
defineExpose({ updateOptions });

onMounted(() => {
  getOptions();
});

watch(() => props.group, (newVal) => {
  getOptions();
});

watch(() => props.default, async (newValue) => {
  if (!newValue.id) return;

  // 還原選取值
  await getOptions();
  model.value = group_options.value.find(d => d.id === newValue.id)
  handleSelection()
});
</script>

<style scoped></style>
