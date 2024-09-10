<template>
  <div>
	<BreadCrumbs :page-title="isNewOrder ? '新增客製訂單' : '訂製單詳情'"></BreadCrumbs>
	<div class="q-my-sm">
    <q-form ref="form">
      <InfoRow title="訂購人">
        <div class="q-my-md">
          <q-input v-model="keyword" placeholder="會員姓名、Email、電話" :debounce="500" clearable dense outlined />
          <q-table v-if="keyword" class="data-table q-mt-sm" :columns="customizedMemberColumns" :rows="member.options" :rows-per-page-options="[10]" row-key="name" no-data-label="查無會員資料" v-model:selected="member.selected" selection="single" dense />
          <div v-if="member.selected.length > 0" class="row q-gutter-md q-mt-none">
            <q-input v-for="column in customizedMemberColumns" :key="column.name" v-model="member.selected[0][column.field]" :label="column.label" :rules="rules.member" class="col" dense outlined readonly />
          </div>
        </div>
      </InfoRow>
      <InfoRow title="訂單資訊">
        <div class="q-my-md">
          <div class="row q-col-gutter-md">
            <q-input v-model="data.title" label="訂單名稱" class="col-6" dense outlined />
            <q-input v-model.number="data.price" type="number" label="訂單金額" class="col-3" dense outlined />
            <q-input v-model="data.voucher_number" label="憑證資料" class="col-3" dense outlined />
            <q-select v-model="data.type" label="訂單類型" class="col-3" :options="customizedOrderTypeOptions" @update:modelValue="changeOrderType" emit-value map-options dense outlined />
          </div>
        </div>
      </InfoRow>
      <InfoRow :title="data.type == 'hotel' ? '訂房資訊' : '票卷資訊'">
        <div class="row q-col-gutter-md q-mb-sm">
          <label class="col-3 text-subtitle2">標題</label>
          <div class="col text-subtitle2">資料</div>
        </div>
        <div v-for="(question, index) in data.content" :key="index" class="q-mb-md">
          <div class="row q-col-gutter-md">
            <q-input v-model="question.column" class="col-3" placeholder="請輸入標題" dense outlined />
            <q-input v-model="question.value" class="col" placeholder="請輸入資料" dense outlined></q-input>
            <div class="flex items-center">
              <q-btn dense flat icon="delete" text-color="negative" size="16px" @click="deleteQuestion(index)" />
            </div>
          </div>
        </div>
        <div class="q-my-md row justify-center">
          <q-btn dense flat icon="add" label="新增欄位" text-color="primary" @click="addQuestion" />
        </div>
      </InfoRow>
      <div class="row justify-end q-gutter-md">
        <q-btn label="取消" color="primary" class="q-px-lg" outline @click="cancelEdit" />
        <q-btn v-if="isNewOrder" label="新增" color="primary" class="q-px-lg" @click="addOrder" />
        <q-btn v-else label="儲存" color="primary" class="q-px-lg" @click="saveOrder" />
      </div>
    </q-form>
	</div>
</div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { router } from 'src/router';
import { customizedMemberColumns, customizedOrderTypeOptions, defaultQuestions } from '../enums';
import { getCustomizedOrder, getMemberList, createCustomizedOrder, updateCustomizedOrder } from 'src/api';
import { useRoute } from 'vue-router';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import InfoRow from '../components/InfoRow.vue';
import { isEmpty, messages } from 'src/utils/validators';
import to from 'await-to-js';
import { type } from 'os';

const $q = useQuasar();
let route = useRoute();

const orderNumber = Number(route.params.orderNumber);
const isNewOrder = ref(isNaN(orderNumber));

interface Order {
	member_id: number;
	title: string;
	price: number;
	voucher_number: string;
	type: string;
	content: Array<{ column: string; value: string }>;
}

const data: Order = reactive({
	member_id: 0,
	title: '',
	price: 0,
	voucher_number: '',
	type: 'hotel',
	content: [],
});

const rules = computed(() => {
  return {
    member: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
  }
});

onMounted(async () => {
	changeOrderType();
	if (!isNaN(orderNumber)) {
		let order: any = await getData();
		if (order) {
			data.member_id = order.member.id;
			data.title = order.title;
			data.price = order.price;
			data.voucher_number = order.voucher;
			data.type = order.type;
			data.content = order.content;
			member.selected = [order.member];
		} else {
			isNewOrder.value = true;
		}
	}
});

const getData = async () => {
  $q.loading.show();
  const [err, res]: [any, any] = await to(getCustomizedOrder(orderNumber));
  $q.loading.hide();

  if (err) {
    console.error("getDetail error:", err);
    return;
  }
	return res.data;
}

/* 查詢會員 Start */
const member = reactive({
	options: [],
	selected: [{
    id: '',
    title: '',
    name: '',
    email: '',
  }],
});

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
		member.options = res.data;
	}
}
/* 查詢會員 End */

/* 變更訂購人 Start */
watch(() => member.selected, (newVal, oldVal) => {
	if (newVal !== oldVal) {
		data.member_id = newVal[0].id;
	}
});
/* 變更訂購人 End */

/* 變更訂單類型 Start */
const changeOrderType = () => {
	data.content = [];
	defaultQuestions[data.type].forEach((question: any) => {
		data.content.push({
			column: question,
			value: ''
		});
	});
}
/* 變更訂單類型 End */

/* 編輯訂單問題欄位 Start */
const addQuestion = () => {
	data.content.push({
		column: '',
		value: '',
	});
}

const deleteQuestion = (index: number) => {
	data.content.splice(index, 1);
}
/* 編輯訂單問題欄位 End */

/* 新增/編輯訂單 Start */
const form = ref();
const validate = async () => {
  return await form.value.validate();
}

const cancelEdit = () => {
	router.back();
}
const addOrder = async () => {
	$q.loading.show();
  let valid = await validate();
  if (valid) {
    const [err, res]: [any, any] = await to(createCustomizedOrder(data));
    if (err) {
      $q.notify({
        type: 'negative',
        message: '客製訂單新增失敗'
      });
    }
    if (res) {
      router.push({
        name: 'CustomizedOrderDetail',
        params: { orderNumber: res.data.order_id }
      });
    }
  }
	$q.loading.hide();
}
const saveOrder = async () => {
	$q.loading.show();
	const [err, res]: [any, any] = await to(updateCustomizedOrder(orderNumber, data));
	if (err) {
		$q.notify({
      type: 'negative',
      message: '客製訂單更新失敗'
		});
	}
	$q.loading.hide();
}
/* 新增/編輯訂單 End */
</script>