<template>
  <div>
	<BreadCrumbs :page-title="isNewOrder ? '新增客製訂單' : '訂製單詳情'"></BreadCrumbs>
	<div v-if="!isClose" class="row">
		<q-space></q-space>
		<q-btn v-if="!isNewOrder" label="結案" color="warning" @click="doClose" />
	</div>
	<div class="q-my-sm">
    <q-form ref="form">
      <InfoRow title="訂購人">
        <div class="q-my-md">
          <UserSelector v-model="data.member_id" :order-member="member" :required="true" :disable="isClose" />
        </div>
      </InfoRow>
      <InfoRow title="訂單資訊">
        <div class="q-my-md">
          <div class="row q-col-gutter-md">
            <q-input v-model="data.title" label="訂單名稱" class="col-6" :disable="isClose" dense outlined />
            <selectCurrency v-model="data.currency" label="訂單幣別" class="col-3" :default="data.currency" :disable="isClose"></selectCurrency>
            <q-input v-model.number="data.price" type="number" label="訂單金額" class="col-3" :disable="isClose" dense outlined />
            <q-select v-model="data.type" label="訂單類型" class="col-3" :options="customizedOrderTypeOptions" @update:modelValue="changeOrderType" :disable="isClose" emit-value map-options dense outlined />
            <q-select v-model="data.invoice" label="是否寄送發票" class="col-3" :options="customizedInvoiceOptions" :disable="isClose" emit-value map-options dense outlined />
          </div>
        </div>
      </InfoRow>
      <InfoRow v-if="!isNewOrder" title="附件">
        <div class="q-my-md">
          <uploader v-if="!isClose" btn-text="新增附件" title="新增附件" :accept="accept" @handleUpload="handleUpload" />
          <div class="row items-center q-col-gutter-md q-mt-sm">
            <div v-for="attached in data.attached" :key="attached.url" class="col-12 col-sm-6 col-md-4">
              <q-card class="bg-grey-2" flat>
                <q-card-section horizontal>
                  <q-img :src="attached.url" :ratio="1" class="col-3 bg-grey-3">
                    <template v-slot:error>
                      <div class="flex flex-center full-width full-height bg-transparent">
                        <div class="text-blue-grey-3 text-h6">{{ getFileType(attached.url).toUpperCase() }}</div>
                      </div>
                    </template>
                  </q-img>
                  <div class="col q-pa-sm">
                    <q-input v-model="attached.filename" class="bg-white" dense outlined />
                    <div class="row q-mt-sm">
                      <q-space />
                      <q-btn icon="preview" color="primary" @click="previewAttached(attached)" dense flat />
                      <q-btn icon="download" color="primary" @click="downloadAttached(attached)" dense flat />
                      <q-btn v-if="!isClose" icon="delete" color="negative" @click="deleteAttached(attached.url)" dense flat />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </InfoRow>
      <InfoRow :title="data.type == 'hotel' ? '訂房資訊' : '票卷資訊'">
        <div class="row q-col-gutter-md q-mb-sm q-mt-none">
          <label class="col-3 text-subtitle2">標題</label>
          <div class="col text-subtitle2">資料</div>
        </div>
        <div v-for="(question, index) in data.content" :key="index" class="q-mb-md">
          <div class="row q-col-gutter-md">
            <q-input v-model="question.column" class="col-3" placeholder="請輸入標題" :disable="isClose" dense outlined />
            <q-input v-model="question.value" class="col" placeholder="請輸入資料" :disable="isClose" dense outlined />
            <div class="flex items-center">
              <q-btn v-if="!isClose" dense flat icon="delete" text-color="negative" size="16px" @click="deleteQuestion(index)" />
            </div>
          </div>
        </div>
        <div v-if="!isClose" class="q-my-md row justify-center">
          <q-btn label="新增欄位" text-color="primary" @click="addQuestion" outline />
        </div>
      </InfoRow>
      <InfoRow title="收入/支出">
        <div class="q-my-md">
          <q-btn v-if="!isClose" label="新增收入/支出" color="primary" class="q-px-lg q-mb-md" @click="addFinance" />
          <q-table v-if="data.finance.length > 0" :rows="data.finance" :columns="customizedFinancelColumns" :pagination="pagination" class="data-table finance-table" hide-bottom flat bordered>
            <template v-slot:body-cell-type="props">
              <q-td :props="props">
                <div>
                  <q-badge :color="customizedOrderFinanceOptions.find((d) => d.value === props.row.type)?.color" :label="customizedOrderFinanceOptions.find((d) => d.value === props.row.type)?.label" />
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-exchange_rate="props">
              <q-td :props="props">
                <q-input type="number" v-model.number="props.row.exchange_rate" class="exchange-rate" :rules="rules.exchange_rate" :disable="isClose" dense outlined />
              </q-td>
            </template>
            <template v-slot:bottom-row>
              <q-tr>
                <q-td />
                <q-td class="text-right">
                  <span class="text-bold text-dark">小計</span>
                </q-td>
                <q-td>
                  <span class="text-h6 text-dark">USD {{ getNumberFormat(financeSum) }}</span>
                </q-td>
                <q-td />
                <q-td />
              </q-tr>
            </template>
          </q-table>
        </div>
      </InfoRow>
      <div v-if="!isClose" class="row justify-end q-gutter-md">
        <q-btn label="取消" color="primary" class="q-px-lg" outline @click="cancelEdit" />
        <q-btn v-if="isNewOrder" label="新增" color="primary" class="q-px-lg" @click="addOrder" />
        <q-btn v-else label="儲存" color="primary" class="q-px-lg" @click="saveOrder" />
      </div>
    </q-form>
  </div>
  <Confirm ref="closeConfirmRef" @confirm="onCloseConfirm"></Confirm>
  <FinanceDialog ref="financeDialogRef" @updated="updateFinance"></FinanceDialog>
</div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { router } from 'src/router';
import { customizedOrderTypeOptions, defaultQuestions, customizedInvoiceOptions, customizedOrderFinanceOptions, customizedFinancelColumns } from '../enums';
import { getCustomizedOrder, createCustomizedOrder, updateCustomizedOrder, closeCustomizedOrder, RequestUploadAttachedFile } from 'src/api';
import { getDateString, getNumberFormat } from 'src/utils/helpers';
import { isEmpty, isNumberDigit, messages } from 'src/utils/validators';
import { useRoute } from 'vue-router';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import InfoRow from '../components/InfoRow.vue';
import UserSelector from '../components/UserSelector.vue';
import selectCurrency from 'src/components/selectCurrency.vue';
import TableComponent from 'src/components/TableComponent.vue';
import uploader from 'components/uploader.vue';
import Confirm from 'src/components/dialog/Confirm.vue'
import FinanceDialog from '../components/FinanceDialog.vue';
import axios from 'axios'
import to from 'await-to-js';
import { type } from 'os';

const $q = useQuasar();
let route = useRoute();

const orderNumber = Number(route.params.orderNumber);
const isNewOrder = ref(isNaN(orderNumber));

interface finance {
  type: string;
  title: string;
  currency: string;
  amount: number|string;
  exchange_rate: number|string;
  updated_at: string;
}

interface Order {
	member_id: number;
	closed: boolean;
	title: string;
	currency: string;
	price: number;
	type: string;
	content: Array<{ column: string; value: string }>;
	invoice: boolean;
	attached: Array<{ url: string; filename: string }>;
	deleted_attached: Array<string>;
	finance: Array<finance>;
	deleted_at: string|null;
}

const data: Order = reactive({
	member_id: 0,
	closed: false,
	title: '',
	currency: 'TWD',
	price: 0,
	type: 'hotel',
	content: [],
	invoice: false,
	attached: [],
	deleted_attached: [],
	finance: [],
	deleted_at: null,
});

const rules = computed(() => {
  return {
    exchange_rate: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isNumberDigit(val, 4, 2) || `${messages.invalidInteger(4)}，${messages.invalidDecimal(2)}`
    ]
  }
});

const member = ref([]);
onMounted(async () => {
	changeOrderType();
	if (!isNaN(orderNumber)) {
		let order: any = await getData();
		if (order) {
			data.member_id = order.member.id;
			data.closed = order.closed ?? false;
			data.title = order.title;
			data.currency = order.currency;
			data.price = order.price;
			data.type = order.type;
			data.content = order.content;
			data.invoice = order.invoice;
			data.attached = order.attached ?? [];
			data.finance = order.finance ?? [];
			data.deleted_at = order.deleted_at ?? null;
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

/* 結案 Start */
const closeConfirmRef = ref();
const isClose = computed(() => data.closed || data.deleted_at != null);
const doClose = () => {
  closeConfirmRef.value.show({
    title: '結案確認',
    message: '訂單結案後將該訂單將無法進行任何異動！'
  });
}
const onCloseConfirm = async () => {
  $q.loading.show();
  const [err, res] = await to(closeCustomizedOrder(orderNumber));
  $q.loading.hide();

  if (err) {
    console.error('close order error:', err);
    return;
  }
  getData();
}
/* 結案 End */

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

/* 上傳附件 Start */
const accept = ref(['image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/webp', 'application/pdf']);
const handleUpload = async (files: File[]) => {
  const [err, res] = await to(RequestUploadAttachedFile(orderNumber, files));
  if (err) {
    console.error("handleUpload error:", err);
    return;
  }
  data.attached = data.attached.concat(res.data);
}
const getFileType = (url: string) => {
  return url.split('.').pop();
}
const getFileName = (url: string) => {
  return url.split('/').pop();
}
const getAttachedBlob = async (url: string) => {
  const res = await axios.get(url, { responseType: 'blob' });
  return URL.createObjectURL(res.data);
}
const previewAttached = async (attached: any) => {
  const url = await getAttachedBlob(attached.url);
  window.open(url);
}
const downloadAttached = async (attached: any) => {
  const link = document.createElement('a');
  const filename = attached.filename ? `${attached.filename}.${getFileType(attached.url)}` : getFileName(attached.url);
  link.href = await getAttachedBlob(attached.url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
const deleteAttached = (invoice:string) => {
  data.attached = data.attached.filter((attached) => attached.url !== invoice);
  data.deleted_attached.push(invoice);
}
/* 上傳附件 End */

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

/* 編輯訂單收入支出 Start */
const financeDialogRef = ref();
function addFinance () {
  financeDialogRef.value.show();
}
function updateFinance (finance: finance) {
  data.finance.push({...finance});
}
/* 編輯訂單收入支出 End */

/* 訂單收入支出表格 Start */
const pagination = ref({
  rowsPerPage: 0
})
const financeSum = computed(() => {
  return data.finance.reduce((acc, cur) => {
    if (cur.type === 'revenue') {
      return acc + Number(cur.amount) * Number(cur.exchange_rate);
    } else {
      return acc - Number(cur.amount) * Number(cur.exchange_rate);
    }
  }, 0);
});
/* 訂單收入支出表格 End */

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
	let valid = await validate();
	if (valid) {
		const [err, res]: [any, any] = await to(updateCustomizedOrder(orderNumber, data));
	} else {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}
	$q.loading.hide();
}
/* 新增/編輯訂單 End */
</script>

<style lang="scss" scoped>
.finance-table {
  .exchange-rate {
    width: 100px;
  }
}
</style>