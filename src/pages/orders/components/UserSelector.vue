<template>
  <div>
    <q-input v-model="keyword" placeholder="會員姓名、Email、電話" :debounce="500" clearable dense outlined />
    <q-table v-if="keyword" class="data-table q-mt-sm" :columns="userColumns" :rows="options" :rows-per-page-options="[10]" row-key="name" no-data-label="查無會員資料" v-model:selected="selected" selection="single" dense />
    <div class="row q-gutter-md q-mt-none">
      <q-input v-for="column in userColumns" :key="column.name" v-model="memberInfo[column.field]" :label="column.label" :rules="rules.member" class="col" dense outlined readonly />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { userColumns } from '../enums';
import { getMemberList } from 'src/api';
import { isEmpty, messages } from 'src/utils/validators';
import to from 'await-to-js';
import { on } from 'cluster';

const props = defineProps({
  modelValue: {
    type: Number
  },
  orderMember: {
    type: Object
  },
  required: {
    type: Boolean,
    default: false
  }
});

const memberInfo = ref(props.orderMember);
watch(() => props.orderMember, val => {
  memberInfo.value = val;
})

const rules = computed(() => {
  return {
    member: [
      val => !(props.required && isEmpty(val)) || messages.requiredInput()
    ],
  }
});

const options = ref([]);

const keyword = ref('');
watch(keyword, (newVal, oldVal) => {
	if (newVal !== oldVal) {
	  searchMember();
	}
});

const searchMember = async () => {
	let params = {};
	if (keyword.value !== '') {
		params = {
			keyword: keyword.value,
		};
	}
	const [err, res]: [any, any] = await to(getMemberList(params));

	if (res && res.data.length > 0) {
		options.value = res.data;
	}
}

const emit = defineEmits(['update:modelValue']);
const selected = ref([]);
watch(selected, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    memberInfo.value = newVal[0];
    emit('update:modelValue', newVal[0].id);
  }
});
</script>
