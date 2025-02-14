<template>
  <div>
	<BreadCrumbs :page-title="isNewOrder ? '新增客製訂單' : '訂製單詳情'"></BreadCrumbs>
  <div class="order-operate bg-white row items-center q-col-gutter-x-lg q-py-sm q-my-sm">
    <div class="col-8">
      <q-tabs v-model="tab" align="left" @update:model-value="scrollToSection">
        <q-tab name="main" label="訂單資訊" />
        <q-tab name="member" label="訂購人" />
        <q-tab name="finance" label="收入/支出" />
        <q-tab name="attached" label="附件" />
        <q-tab name="voucher" label="憑證資訊" />
      </q-tabs>
      <q-separator />
    </div>
    <div class="col-4">
      <div v-if="!isClose" class="flex q-gutter-sm">
        <q-btn v-if="!isNewOrder" label="結案" color="warning" class="q-px-lg" @click="doClose" unelevated />
        <q-space />
        <q-btn label="取消" color="primary" class="q-px-lg" outline @click="cancelEdit" />
        <q-btn v-if="isNewOrder" label="新增" color="primary" class="q-px-lg" @click="addOrder" unelevated />
        <q-btn v-else label="儲存" color="primary" class="q-px-lg" @click="saveOrder" unelevated />
      </div>
    </div>
  </div>
  <q-scroll-observer @scroll="onScroll" />
  <q-form ref="form">
    <div class="row q-col-gutter-lg">
      <div :class="{'col-12': isNewOrder, 'col-8': !isNewOrder}">
        <InfoRow ref="mainSectionRef" title="訂單資訊" class="scroll-margin">
          <div class="q-my-md">
            <div class="row q-col-gutter-sm">
              <q-input v-model="data.title" label="訂單名稱" class="col-6" :disable="isClose" dense outlined />
              <selectCurrency v-model="data.currency" label="訂單幣別" class="col-3" :default="data.currency" :disable="isClose"></selectCurrency>
              <q-input v-model.number="data.price" type="number" label="訂單金額" class="col-3" :disable="isClose" dense outlined />
              <q-select v-model="data.type" label="訂單類型" class="col-3" :options="customizedOrderTypeOptions" @update:modelValue="changeOrderType" :disable="isClose" emit-value map-options dense outlined />
              <q-select v-model="data.invoice" label="是否寄送發票" class="col-3" :options="customizedInvoiceOptions" :disable="isClose" emit-value map-options dense outlined />
            </div>
          </div>
        </InfoRow>
        <InfoRow ref="memberSectionRef" title="訂購人" class="scroll-margin">
          <div class="q-my-md">
            <UserSelector v-model="data.member_id" :order-member="member" :required="true" :disable="isClose" />
          </div>
        </InfoRow>
        <InfoRow ref="financeSectionRef" title="收入/支出" class="scroll-margin">
          <div class="q-my-md">
            <q-btn v-if="!isClose" label="新增收入/支出" color="primary" class="q-px-lg q-mb-md" @click="addFinance" outline />
            <q-table v-if="data.finance.length > 0" :rows="data.finance" :columns="customizedFinancelColumns" :pagination="pagination" class="data-table finance-table" hide-bottom flat bordered>
              <template v-slot:body-cell-type="props">
                <q-td :props="props">
                  <div :class="`text-${customizedOrderFinanceOptions.find((d) => d.value === props.row.type)?.color}`">
                    {{ customizedOrderFinanceOptions.find((d) => d.value === props.row.type)?.label }}
                  </div>
                </q-td>
              </template>
              <template v-slot:body-cell-exchange_rate="props">
                <q-td :props="props">
                  <q-input type="number" v-model.number="props.row.exchange_rate" class="exchange-rate" :rules="rules.exchange_rate" :disable="isClose" hide-bottom-space dense outlined />
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
        <InfoRow ref="attachedSectionRef" title="附件" class="scroll-margin">
          <div class="q-my-md">
            <uploader v-if="!isClose" btn-text="新增附件" title="新增附件" :accept="accept" @handleUpload="handleUpload" outline />
            <div class="row items-center q-col-gutter-md q-mt-sm">
              <div v-for="attached in data.attached" :key="attached.url" class="col-12 col-sm-6">
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
        <InfoRow ref="voucherSectionRef" title="憑證資訊" class="scroll-margin">
          <div class="row q-col-gutter-sm q-mb-sm q-mt-none">
            <label class="col-3 text-subtitle2">標題</label>
            <div class="col text-subtitle2">資料</div>
          </div>
          <div v-for="(question, index) in data.content" :key="index" class="q-mb-md">
            <div class="row q-col-gutter-sm">
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
      </div>
      <div v-if="!isNewOrder" class="col-4">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="flex items-center justify-between">
              <div class="text-subtitle1 text-bold">Le Oràno Rewards 歷程</div>
              <q-btn label="新增 Reward" text-color="primary" @click="addReward" outline />
            </div>
          </q-card-section>
            <q-list separator>
              <q-item v-for="reward in rewards" :key="reward.id" class="items-start q-py-md" :disable="reward.operator != '' && reward.apply_time == ''">
                <q-item-section>
                  <q-item-label class="text-bold text-grey-9">{{ reward.reason }}</q-item-label>
                  <div v-if="reward.button_enable" class="q-mt-sm">
                    <q-badge label="發送" icon="send" class="q-py-xs cursor-pointer" @click="doSendRewards(reward)" />
                    <q-badge label="刪除" color="negative" class="q-py-xs cursor-pointer q-ml-sm" @click="doDeleteRewards(reward)" />
                  </div>
                  <div v-else class="text-grey-7 q-mt-sm">
                    {{ reward.operator }}
                    <span v-if="reward.apply_time">於 {{ getDateString(reward.apply_time) }} 發送</span>
                  </div>
                </q-item-section>
                <q-item-section side top>
                  <q-item-label caption>{{ getDateString(reward.created_at) }}</q-item-label>
                  <q-item-label class="text-h5 text-bold">{{ reward.amount }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
        </q-card>
        <q-card flat bordered class="q-mt-md">
          <q-card-section class="bg-grey-2">
            <div class="flex items-center justify-between">
              <div class="text-subtitle1 text-bold">Travel Credits 歷程</div>
              <q-btn label="新增 Credit" text-color="primary" @click="addCredit" outline />
            </div>
          </q-card-section>
            <q-list separator>
              <q-item v-for="credit in credits" :key="credit.id" class="items-start q-py-md" :disable="credit.operator != '' && credit.apply_time == ''">
                <q-item-section>
                  <q-item-label class="text-bold text-grey-9">{{ credit.reason }}</q-item-label>
                  <div v-if="credit.button_enable" class="q-mt-sm">
                    <q-badge label="使用" icon="send" class="q-py-xs cursor-pointer" @click="doSendCredits(credit)" />
                    <q-badge label="刪除" color="negative" class="q-py-xs cursor-pointer q-ml-sm" @click="doDeleteCredits(credit)" />
                  </div>
                  <div v-else class="text-grey-7 q-mt-sm">
                    {{ credit.operator }}
                    <span v-if="credit.apply_time">於 {{ getDateString(credit.apply_time) }} 發送</span>
                  </div>
                </q-item-section>
                <q-item-section side top>
                  <q-item-label caption>{{ getDateString(credit.created_at) }}</q-item-label>
                  <q-item-label class="text-h5 text-bold">{{ credit.amount }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
        </q-card>
      </div>
    </div>
  </q-form>
  <Confirm ref="closeConfirmRef" @confirm="onCloseConfirm"></Confirm>
  <Confirm ref="sendRewardConfirmRef" @confirm="onSendRewardConfirm"></Confirm>
  <Confirm ref="deleteRewardConfirmRef" @confirm="onDeleteRewardConfirm"></Confirm>
  <Confirm ref="sendCreditConfirmRef" @confirm="onSendCreditConfirm"></Confirm>
  <Confirm ref="deleteCreditConfirmRef" @confirm="onDeleteCreditConfirm"></Confirm>
  <FinanceDialog ref="financeDialogRef" @updated="updateFinance"></FinanceDialog>
  <AddRewardDialog ref="rewardDialogRef" @updated="updateReward"></AddRewardDialog>
  <AddCreditDialog ref="creditDialogRef" @updated="updateCredit"></AddCreditDialog>
</div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { router } from 'src/router';
import { customizedOrderTypeOptions, defaultQuestions, customizedInvoiceOptions, customizedOrderFinanceOptions, customizedFinancelColumns } from '../enums';
import { getCustomizedOrder, createCustomizedOrder, updateCustomizedOrder, closeCustomizedOrder, RequestUploadAttachedFile, RequestFile, createCustomizedReward, sendCustomizedReward, deleteCustomizedReward, createCustomizedCredit, sendCustomizedCredit, deleteCustomizedCredit } from 'src/api';
import { getDateString, getNumberFormat } from 'src/utils/helpers';
import { isEmpty, isNumberDigit, messages } from 'src/utils/validators';
import { useRoute } from 'vue-router';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import InfoRow from '../components/InfoRow.vue';
import UserSelector from '../components/UserSelector.vue';
import selectCurrency from 'src/components/selectCurrency.vue';
import TableComponent from 'src/components/TableComponent.vue';
import uploader from 'components/uploader.vue';
import Alert from 'src/components/dialog/Alert.vue'
import Confirm from 'src/components/dialog/Confirm.vue'
import FinanceDialog from '../components/FinanceDialog.vue';
import AddRewardDialog from '../components/AddRewardDialog.vue';
import AddCreditDialog from '../components/AddCreditDialog.vue';
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

/* tab, section Start */
const tab = ref('main');
const isScrolling = ref(false);
// 點擊 tab 滾動到對應 section
const scrollToSection = (tabName:string) => {
  isScrolling.value = true;
  let section = eval(`${tabName}SectionRef.value`);
  section.$el.scrollIntoView({ behavior: 'smooth' })
  setTimeout(() => {
    isScrolling.value = false;
  }, 1000);
}
// 取每個 section 相對 root 的 top 位置
const mainSectionRef = ref(null)
const memberSectionRef = ref(null)
const financeSectionRef = ref(null)
const attachedSectionRef = ref(null)
const voucherSectionRef = ref(null)
const sectionPositionTops = reactive({
  main: 0,
  member: 0,
  finance: 0,
  attached: 0,
  voucher: 0,
});
const getSectionPositionTops = () => {
  Object.keys(sectionPositionTops).forEach(key => {
    let section = eval(`${key}SectionRef.value`);
    if (section) {
      sectionPositionTops[key] = section.$el.offsetTop;
    }
  });
}
// 滾動到不同區塊，切換 tab
const onScroll = async (info:object) => {
  if (isScrolling.value) return;

  await getSectionPositionTops();
  const currentSection = Object.entries(sectionPositionTops).reduce((closest, [section, position]) => {
    const distance = Math.abs(position - info.position.top)
    if (distance < closest.distance) {
      return { section, distance }
    }
    return closest
  }, { section: 'main', distance: Infinity });

  if (tab.value !== currentSection.section) {
    tab.value = currentSection.section
  }
}
/* tab, section End */

const member = ref([]);
const rewards = ref([]);
const credits = ref([]);
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
      rewards.value = order.rewards ?? [];
      credits.value = order.credits ?? [];
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
  let order = await getData();
  if (order) {
    data.closed = true;
  }
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
const CONTENT_TYPE = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'pdf': 'application/pdf'
}
const getAttachedBlob = async (url: string) => {
  const [err, blob] = await to(RequestFile({url}));
  if (err) {
    console.error('getAttachedBlob error:', err);
    return;
  }
  const fileType = getFileType(url);
  if (!fileType || !CONTENT_TYPE[fileType]) {
    console.error('Unsupported file type:', fileType);
    return;
  }
  const blobChangeType = new Blob([blob], { type: CONTENT_TYPE[fileType] });
  return URL.createObjectURL(blobChangeType);
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

/* Rewards Start */
const rewardDialogRef = ref();
const addReward = () => {
  rewardDialogRef.value.show();
}
const updateReward = async (data: any) => {
  $q.loading.show();
  const [err, res] = await to(createCustomizedReward(orderNumber, data));
  $q.loading.hide();

  let order = await getData();
  if (order) {
    rewards.value = order.rewards ?? [];
  }
}
const sendRewardConfirmRef = ref();
const doSendRewards = (reward:object) => {
  sendRewardConfirmRef.value.show({
    title: '發送 Rewards',
    message: '確定後將會發送點數至此訂單的客戶帳號中',
    hint: `發送點數：${reward.amount}`,
    data: {
      record_id: reward.id.toString()
    }
  });
}
const onSendRewardConfirm = async (data:object) => {
  $q.loading.show();
  const [err, res] = await to(sendCustomizedReward(orderNumber, data));
  $q.loading.hide();

  if (err) {
    console.error('send reward error:', err);
    return;
  }

  let order = await getData();
  if (order) {
    rewards.value = order.rewards ?? [];
  }
}
const deleteRewardConfirmRef = ref();
const doDeleteRewards = (reward:object) => {
  deleteRewardConfirmRef.value.show({
    title: '刪除 Rewards 歷程',
    message: '確定刪除此筆 Rewards 歷程？',
    hint: `${reward.reason}：${reward.amount}`,
    data: {
      record_id: reward.id.toString()
    }
  });
}
const onDeleteRewardConfirm = async (data:object) => {
  $q.loading.show();
  const [err, res] = await to(deleteCustomizedReward(orderNumber, data));
  $q.loading.hide();

  if (err) {
    console.error('delete reward error:', err);
    return;
  }

  let order = await getData();
  if (order) {
    rewards.value = order.rewards ?? [];
  }
}
/* Rewards End */
/* Credits Start */
const creditDialogRef = ref();
const addCredit = () => {
  creditDialogRef.value.show();
}
const updateCredit = async (data: any) => {
  $q.loading.show();
  const [err, res] = await to(createCustomizedCredit(orderNumber, data));
  $q.loading.hide();

  let order = await getData();
  if (order) {
    credits.value = order.credits ?? [];
  }
}
const sendCreditConfirmRef = ref();
const doSendCredits = (credit:object) => {
  sendCreditConfirmRef.value.show({
    title: '使用 Credits',
    message: '確定後將會從此訂單的客戶帳號中扣除',
    hint: `使用金額：${credit.amount}`,
    data: {
      record_id: credit.id.toString()
    }
  });
}
const onSendCreditConfirm = async (data:object) => {
  $q.loading.show();
  const [err, res] = await to(sendCustomizedCredit(orderNumber, data));
  $q.loading.hide();

  if (err) {
    if (err.data.code === 11021) {
      $q.notify({
        type: 'negative',
        position: 'top',
        message: '該會員餘額不足',
        timeout: 3000
      })
    }
    console.error('use credit error:', err);
    return;
  }

  let order = await getData();
  if (order) {
    credits.value = order.credits ?? [];
  }
}
const deleteCreditConfirmRef = ref();
const doDeleteCredits = (credit:object) => {
  deleteCreditConfirmRef.value.show({
    title: '刪除 Credits 歷程',
    message: '確定刪除此筆 Credits 歷程？',
    hint: `${credit.reason}：${credit.amount}`,
    data: {
      record_id: credit.id.toString()
    }
  });
}
const onDeleteCreditConfirm = async (data:object) => {
  $q.loading.show();
  const [err, res] = await to(deleteCustomizedCredit(orderNumber, data));
  $q.loading.hide();

  if (err) {
    console.error('delete credit error:', err);
    return;
  }

  let order = await getData();
  if (order) {
    credits.value = order.credits ?? [];
  }
}
/* Credits End */
</script>

<style lang="scss" scoped>
.scroll-margin {
  scroll-margin: 120px;
}
.order-operate {
  position: sticky;
  top: 58px;
  z-index: 1;
  .q-tab {
    min-height: 40px;
  }
}
.finance-table {
  .exchange-rate {
    width: 100px;
  }
}
.point-list {
  .point-add-info {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
  }
}
</style>