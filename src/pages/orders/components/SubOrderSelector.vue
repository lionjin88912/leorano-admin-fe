<template>
  <div>
    <q-input v-model="keyword" placeholder="請輸入訂單編號" :debounce="500" clearable dense outlined />
    <q-table v-if="keyword" class="data-table q-mt-sm" :columns="subOrderSearchColumns" :rows="options" :loading="loading" :rows-per-page-options="pagination.perPage" v-model:pagination="pagination" row-key="id" no-data-label="查無訂單資料" v-model:selected="selected" selection="single" @request="searchSubOrder" dense>
      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <q-badge :color="orderTypeOptions.find(d => d.value == props.row.type).color" :label="orderTypeOptions.find(d => d.value == props.row.type).label" outline />
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { subOrderSearchColumns, orderTypeOptions } from '../enums';
import { getSubOrderList } from 'src/api';
import to from 'await-to-js';

const props = defineProps({
  disabled: {
    type: Array,
    default: () => []
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
	  searchSubOrder();
	}
});

const loading = ref(false)
interface SubOrder {
  id: number;
  order_number: string;
  type: string;
  booking_way: string;
  name: string;
}

const options = ref<SubOrder[]>([])
const searchSubOrder = async () => {
  loading.value = true;
	const [err, res]: [any, any] = await to(getSubOrderList({
    page: pagination.value.page,
    limit: pagination.value.rowsPerPage,
    search: keyword.value,
	}));

	if (res && res.data) {
		options.value = res.data.filter((d: SubOrder) => !props.disabled.includes(d.order_number));
    pagination.value.rowsNumber = res.paging.total_rows; // 無排除 disabled 的總筆數
    selected.value = [];
	}
  loading.value = false;
}

watch(() => props.disabled, (newVal, oldVal) => {
  searchSubOrder();
});

const emit = defineEmits(['select']);
const selected = ref<SubOrder[]>([]);
watch(selected, (newVal: SubOrder[], oldVal: SubOrder[]) => {
  if (newVal.length > 0 && newVal !== oldVal) {
    emit('select', newVal[0]);
  }
});
</script>
