<template>
  <div>
    <q-input v-model="keyword" placeholder="會員姓名、Email、電話" :debounce="500" :disable="disable" clearable dense outlined />
    <q-table v-if="keyword" class="data-table q-mt-sm" :columns="userColumns" :rows="options" :loading="loading" :rows-per-page-options="pagination.perPage" v-model:pagination="pagination" row-key="id" no-data-label="查無會員資料" v-model:selected="selected" selection="single" @request="onRequest" dense />
    <div class="row q-gutter-sm q-mt-none">
      <q-input v-for="column in userColumns" :key="column.name" v-model="model[column.field]" :label="column.label" :rules="column.name == 'id' ? rules.member :[]" class="col-12 col-sm-3" dense outlined readonly hide-bottom-space />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { userColumns } from '../enums';
import { getMemberList } from 'src/api';
import { isEmpty, messages } from 'src/utils/validators';
import to from 'await-to-js';

const props = defineProps({
  required: {
    type: Boolean,
    default: false
  },
  disable: {
    type: Boolean,
    default: false
  }
});

const rules = computed(() => {
  return {
    member: [
      val => !(props.required && isEmpty(val)) || messages.requiredInput()
    ],
  }
});

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
  perPage: [10],
});

const keyword = ref('');
watch(keyword, (newVal, oldVal) => {
	if (newVal && newVal !== oldVal) {
    pagination.value.page = 1;
	  searchMember();
	}
});

const loading = ref(false)
const options = ref([])
const searchMember = async () => {
  loading.value = true;
	const [err, res]: [any, any] = await to(getMemberList({
    page: pagination.value.page,
    limit: pagination.value.rowsPerPage,
    search: keyword.value,
	}));

	if (res && res.data) {
		options.value = res.data;
    pagination.value.rowsNumber = res.paging.total_rows;
	}
  loading.value = false;
}

const onRequest = (props) => {
  pagination.value.page = props.pagination.page;
  searchMember()
}

const model = defineModel();
const selected = ref([]);
watch(selected, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    model.value = newVal[0];
  }
});
</script>
