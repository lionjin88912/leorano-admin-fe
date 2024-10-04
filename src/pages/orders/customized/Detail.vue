<template>
  <div>
	<BreadCrumbs :page-title="isNewOrder ? '新增客製訂單' : '訂製單詳情'"></BreadCrumbs>
	<div class="q-my-sm">
    <q-form ref="form">
      <InfoRow title="訂購人">
        <div class="q-my-md">
          <UserSelector v-model="data.member_id" :order-member="member" :required="true" />
        </div>
      </InfoRow>
      <InfoRow title="訂單資訊">
        <div class="q-my-md">
          <div class="row q-col-gutter-md">
            <q-input v-model="data.title" label="訂單名稱" class="col-6" dense outlined />
            <q-select v-model="data.currency" label="訂單幣別" class="col-3" :options="currencyOptions" use-input hide-selected  fill-input input-debounce="0" @filter="filterCurrency" @input-value="autoCompleteCurrency" dense outlined />
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
import { ref, reactive, watch, onMounted } from 'vue'
import { router } from 'src/router';
import { customizedOrderCurrencyOptions, customizedOrderTypeOptions, defaultQuestions } from '../enums';
import { getCustomizedOrder, createCustomizedOrder, updateCustomizedOrder } from 'src/api';
import { useRoute } from 'vue-router';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import InfoRow from '../components/InfoRow.vue';
import UserSelector from '../components/UserSelector.vue';
import to from 'await-to-js';
import { type } from 'os';

const $q = useQuasar();
let route = useRoute();

const orderNumber = Number(route.params.orderNumber);
const isNewOrder = ref(isNaN(orderNumber));

interface Order {
	member_id: number;
	title: string;
	currency: string;
	price: number;
	voucher_number: string;
	type: string;
	content: Array<{ column: string; value: string }>;
}

const data: Order = reactive({
	member_id: 0,
	title: '',
	currency: 'TWD',
	price: 0,
	voucher_number: '',
	type: 'hotel',
	content: [],
});

const member = ref([]);
onMounted(async () => {
	changeOrderType();
	if (!isNaN(orderNumber)) {
		let order: any = await getData();
		if (order) {
			data.member_id = order.member.id;
			data.title = order.title;
			data.currency = order.currency;
			data.price = order.price;
			data.voucher_number = order.voucher;
			data.type = order.type;
			data.content = order.content;
			member.value = order.member;
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

const currencyOptions = ref(customizedOrderCurrencyOptions)
function filterCurrency (val, update, abort) {
  update(() => {
    const needle = val.toLowerCase()
    currencyOptions.value = customizedOrderCurrencyOptions.filter(v => v.toLowerCase().indexOf(needle) > -1)
  })
}
function autoCompleteCurrency (val) {
  const needle = val.toLowerCase()
  data.currency = customizedOrderCurrencyOptions.filter(v => v.toLowerCase().indexOf(needle) > -1)[0]
}

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
    router.push({ name: "CustomizedOrderDetail", params: { orderNumber: res.data.order_id } });
  } else {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
	$q.loading.hide();
}
const saveOrder = async () => {
	$q.loading.show();
	const [err, res]: [any, any] = await to(updateCustomizedOrder(orderNumber, data));
	$q.loading.hide();
}
/* 新增/編輯訂單 End */
</script>