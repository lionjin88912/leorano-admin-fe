<template>
  <div>
	<BreadCrumbs :parent-path="meta.parentPath" :parent-title="meta.parentTitle" :page-title="isNewOrder ? '新增客製訂單' : model.order_number" />
  <DetailLayout :tabs="tabs" :isFullWidth="isNewOrder">
    <template #buttons>
      <div v-if="!isClose" class="flex q-gutter-sm">
        <q-space />
        <q-btn label="取消" color="primary" class="q-px-lg" @click="cancelEdit" outline />
        <q-btn v-if="isNewOrder" label="新增" color="primary" class="q-px-lg" @click="addOrder" unelevated />
        <q-btn v-else label="儲存" color="primary" class="q-px-lg" @click="saveOrder" unelevated />
      </div>
    </template>
    <template #form>
      <q-form ref="form">
        <InfoRow ref="memberSectionRef" title="訂購人" class="scroll-margin">
          <template v-slot:caption>
            <span class="text-negative q-ml-xs">*</span>
          </template>
          <div class="q-my-md">
            <UserSelector ref="userSelectorRef" v-model="model.member" label="訂購人" :required="true" :disable="isClose" />
          </div>
        </InfoRow>
        <InfoRow ref="mainSectionRef" title="訂單資訊" class="scroll-margin">
          <template v-slot:caption>
            <q-badge :color="booking_way.color" class="q-ml-sm" outline>
              {{ booking_way.label }}
            </q-badge>
          </template>
          <q-card v-if="model.deleted_at" class="bg-amber-1 q-my-md" flat bordered>
            <q-card-section>
              <div class="text-bold">取消資訊</div>
              <div class="q-mt-sm">
                <div class="row q-col-gutter-sm">
                  <q-input v-model="model.deleted_at" label="取消時間" mask="####-##-##" class="col-4" :disable="isClose" dense outlined readonly />
                  <q-input v-model="model.cancel_confirm_code" label="取消編號" class="col-4" :disable="isClose" dense outlined />
                  <InputCurrencyPrice v-model="model.cancel_price" label="退款金額" class="col-4" :disable="isClose" />
                  <q-input type="textarea" v-model="model.cancel_reason" label="取消原因" class="col-12" :disable="isClose" dense outlined autogrow />
                </div>
              </div>
            </q-card-section>
          </q-card>
          <div class="q-my-md">
            <div class="row q-col-gutter-x-sm q-col-gutter-y-md">
              <q-input v-model="model.title" label="" class="col-12" :rules="rules.required" :disable="isClose" hide-bottom-space dense outlined>
                <template v-slot:label>
                  <div class="all-pointer-events">
                    訂單名稱 <span class="text-negative">*</span>
                  </div>
                </template>
              </q-input>
              <q-input v-if="!isNewOrder" v-model="model.created_at" label="訂單日期" mask="####-##-##" class="col-4" dense outlined readonly />
              <q-input v-if="!isNewOrder" v-model="model.order_number" label="訂單編號" class="col-4" dense outlined readonly />
              <q-select v-if="!isNewOrder" v-model="model.status" :options="orderStatusOptions" label="訂單狀態" class="col-4" :disable="isClose" emit-value map-options dense outlined>
                <template v-slot:selected-item="scope">
                  <div :class="`text-${scope.opt.color}`">{{ scope.opt.label }}</div>
                </template>
              </q-select>
              <q-select v-model="model.type" :options="orderTypeOptions" label="訂單類型" class="col-4" @update:model-value="changeOrderType" :disable="isClose" emit-value map-options dense outlined />
              <q-input v-model="model.booking_confirm_code" label="確認編號" class="col-4" :disable="isClose" dense outlined />
            </div>
            <div class="text-bold q-mt-md q-mb-sm">訂單金額</div>
            <div class="row q-col-gutter-sm">
              <InputCurrencyPrice v-model:currency="model.currency" v-model:price="model.price" label="原幣" class="col-4" :disable="isClose" />
              <InputCurrencyPrice v-model:price="model.usd_price" label="美金" class="col-4" :disable="isClose" currencyReadonly />
            </div>
            <div class="text-bold q-mt-md q-mb-sm">旅客行程</div>
            <div class="row q-col-gutter-sm">
              <q-select v-if="!isNewOrder" v-model="model.schedule_status" :options="orderScheduleStatusOptions" label="狀態" class="col-4" :disable="isClose" emit-value map-options dense outlined>
                <template v-slot:selected-item="scope">
                  <div :class="`text-${scope.opt.color}`">{{ scope.opt.label }}</div>
                </template>
              </q-select>
              <q-field class="col-4 cursor-pointer" label="使用日期" :stack-label="duration.from ? true : false" outlined dense>
                <template #default>
                  <DatePicker :date="duration" :range="true" @updated="(val) => {duration.from = val.from; duration.to = val.to}">
                  </DatePicker>
                </template>
                <template v-slot:control>
                  {{ duration.from }}
                </template>
              </q-field>
              <q-field class="col-4 cursor-pointer" label="結束日期" :stack-label="duration.from ? true : false" outlined dense>
                <template #default>
                  <DatePicker :date="duration" :range="true" @updated="(val) => {duration.from = val.from; duration.to = val.to}">
                  </DatePicker>
                </template>
                <template v-slot:control>
                  {{ duration.to }}
                </template>
              </q-field>
            </div>
          </div>
        </InfoRow>
        <InfoRow ref="profitSectionRef" title="利潤" class="scroll-margin">
          <div class="q-mt-md q-mb-lg">
            <div class="flex items-center justify-between q-mt-md q-mb-sm">
              <div class="text-bold">實際利潤</div>
              <div class="flex items-center q-gutter-sm">
                <q-toggle v-if="!isClose" 
                          v-model="autoCalculateMode" 
                          label="自動同步" 
                          color="primary" 
                          size="sm" />
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <InputCurrencyPrice v-model:currency="finalProfitCurrency" 
                                  v-model:price="finalProfitAmount"
                                  label="利潤" 
                                  class="col-4" 
                                  :rules="rules.profit" 
                                  :disable="isClose || autoCalculateMode" />
              <div class="col-8 flex items-center">
                <div class="text-grey-6 q-ml-md">
                  收入/支出小計：{{ getNumberFormat(financeSum) }} USD
                  <span v-if="autoCalculateMode" class="text-primary q-ml-sm">(自動同步)</span>
                </div>
              </div>
            </div>
          </div>
        </InfoRow>
        <InfoRow ref="financeSectionRef" title="收入/支出" class="scroll-margin">
          <div class="finance-list text-bold flex q-col-gutter-sm q-mb-sm q-mt-none">
            <div class="item-badge">項目</div>
            <div class="col">名稱 <span class="text-negative">*</span></div>
            <div class="item-price">金額</div>
            <div class="item-rate">匯率 <span class="text-negative">*</span></div>
            <div class="item-text">金額 USD</div>
            <div v-if="!isClose" class="item-delete text-center">刪除</div>
          </div>
          <div v-for="(finance, index) in model.finance" :key="index" class="finance-list flex items-start no-wrap q-col-gutter-x-sm q-mb-sm">
            <q-select v-model="finance.type" :options="customizedOrderFinanceOptions" class="item-badge" :disable="isClose" emit-value map-options dense outlined>
              <template v-slot:selected-item="scope">
                <q-badge :color="scope.opt.color" class="q-mr-xs" outline>
                  {{ scope.opt.label }}
                </q-badge>
              </template>
            </q-select>
            <q-input v-model="finance.title" class="col" :rules="rules.required" :disable="isClose" dense outlined />
            <InputCurrencyPrice v-model:currency="finance.currency" v-model:price="finance.amount" class="item-price" @update:currency="changeCurrency(finance)" :rules="rules.finance_amount" :disable="isClose" />
            <q-input v-model="finance.exchange_rate" class="item-rate" :rules="rules.exchange_rate" :disable="isClose" dense outlined />
            <q-input v-model="financeUSD[index]" class="item-text" :disable="isClose" dense outlined readonly />
            <div v-if="!isClose" class="item-delete text-center">
              <q-btn icon="delete" color="negative" class="full-height" @click="deleteFinance(index)" flat />
            </div>
          </div>
          <q-separator />
          <div class="finance-list text-bold flex items-center q-col-gutter-x-sm q-mt-sm">
            <div class="col text-right">小計</div>
            <div class="item-text text-h6 text-right">{{ getNumberFormat(financeSum) }}</div>
            <div v-if="!isClose" class="item-delete"></div>
          </div>
          <div v-if="!isClose" class="q-my-md row justify-center">
            <q-btn label="新增收入/支出" color="primary" @click="addFinance" outline />
          </div>
        </InfoRow>
        <InfoRow ref="attachedSectionRef" title="附件" class="scroll-margin">
          <div class="q-my-md">
            <uploader v-if="!isClose" btn-text="新增附件" title="新增附件" :accept="accept" @handleUpload="handleUpload" outline />
            <div class="row items-center q-col-gutter-md q-mt-sm">
              <div v-for="attached in model.attached" :key="attached.url" class="col-12 col-sm-6">
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
                      <q-input v-model="attached.filename" class="bg-white" :disable="isClose" dense outlined />
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
          <div v-for="(question, index) in model.content" :key="index" class="q-mb-md">
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
      </q-form>
    </template>
    <template #aside>
      <div v-if="!isClose" class="q-mb-md">
        <q-btn label="取消訂單" color="warning" @click="doCancel" unelevated />
        <q-btn v-if="!isNewOrder" label="結案" color="teal" class="q-ml-sm" @click="doClose" unelevated />
      </div>
      <q-card class="bg-grey-2" flat bordered>
        <q-card-section>
          <div class="text-subtitle1 text-bold">憑證</div>
          <div class="flex items-center q-mt-xs">
            <q-badge label="發送" class="q-py-xs cursor-pointer q-mr-sm" @click="sendVoucher" />
            <div v-if="model.voucher_send" class="text-grey-7">於 {{ model.voucher_send }} 發送憑證</div>
            <div v-else class="text-grey-6">未發送</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="flex">
            <div class="text-bold text-grey-9 q-mr-sm">訂單名稱</div>
            <div class="text-grey-7">{{ model.title }}</div>
          </div>
          <div class="flex q-mt-sm">
            <div class="text-bold text-grey-9 q-mr-sm">確認編號</div>
            <div class="text-grey-7">{{ model.booking_confirm_code }}</div>
          </div>
          <div class="flex q-mt-sm">
            <div class="text-bold text-grey-9 q-mr-sm">訂單金額</div>
            <div class="text-grey-7">{{ model.currency }} {{ getNumberFormat(model.price) }}</div>
          </div>
          <div v-for="(question, index) in model.content" :key="index" class="flex no-wrap q-mt-sm">
            <div class="text-bold text-grey-9 q-mr-sm">{{ question.column }}</div>
            <div class="text-grey-7">{{ question.value }}</div>
          </div>
        </q-card-section>
      </q-card>
      <q-card v-if="0" class="q-mt-md" flat bordered>
        <q-card-section class="bg-grey-2">
          <div class="text-subtitle1 text-bold">支單</div>
        </q-card-section>
        <q-card-section>
          <div v-for="payment in payments" :key="payment.index" class="flex justify-between items-center q-py-xs">
            <div class="q-mt-xs">
              <span class="text-bold text-grey-9 q-mr-sm">{{ payment.title }}</span>
              <span class="text-grey-7"> USD {{ financeUSD[payment.index] }}</span>
            </div>
            <router-link v-if="financeUSD[payment.index] == 300" :to="`/accounting/payment/${202500001}`" class="text-primary">202500001</router-link>
            <q-badge v-else label="產生支單" class="q-py-xs cursor-pointer q-ml-sm" />
          </div>
        </q-card-section>
      </q-card>
      <q-card class="q-mt-md" flat bordered>
        <q-card-section class="bg-grey-2">
          <div class="flex items-center justify-between">
            <div class="text-subtitle1 text-bold">Le Oràno Rewards 歷程</div>
            <q-btn label="新增 Reward" text-color="primary" @click="addReward" outline />
          </div>
        </q-card-section>
        <q-list separator>
          <q-item v-for="reward in model.rewards" :key="reward.id" class="items-start q-py-md" :disable="reward.operator != '' && reward.apply_time == ''">
            <q-item-section>
              <q-item-label class="text-bold text-grey-9">{{ reward.reason }}</q-item-label>
              <div v-if="reward.button_enable" class="q-mt-sm">
                <q-badge label="發送" class="q-py-xs cursor-pointer" @click="doSendRewards(reward)" />
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
            <q-item v-for="credit in model.credits" :key="credit.id" class="items-start q-py-md" :disable="credit.operator != '' && credit.apply_time == ''">
              <q-item-section>
                <q-item-label class="text-bold text-grey-9">{{ credit.reason }}</q-item-label>
                <div v-if="credit.button_enable" class="q-mt-sm">
                  <q-badge label="使用" class="q-py-xs cursor-pointer" @click="doSendCredits(credit)" />
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
    </template>
  </DetailLayout>
  <CancelOrderDialog ref="cancelOrderRef" @confirm="onCancelConfirm"></CancelOrderDialog>
  <Confirm ref="closeConfirmRef" @confirm="onCloseConfirm"></Confirm>
  <Confirm ref="sendRewardConfirmRef" @confirm="onSendRewardConfirm"></Confirm>
  <Confirm ref="deleteRewardConfirmRef" @confirm="onDeleteRewardConfirm"></Confirm>
  <Confirm ref="sendCreditConfirmRef" @confirm="onSendCreditConfirm"></Confirm>
  <Confirm ref="deleteCreditConfirmRef" @confirm="onDeleteCreditConfirm"></Confirm>
  <AddRewardDialog ref="rewardDialogRef" @updated="updateReward"></AddRewardDialog>
  <AddCreditDialog ref="creditDialogRef" @updated="updateCredit"></AddCreditDialog>
</div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, watch, onMounted, computed, toValue } from 'vue'
import { router } from 'src/router';
import { orderStatusOptions, orderBookingWayOptions, orderTypeOptions, orderScheduleStatusOptions, defaultQuestions, customizedOrderFinanceOptions} from '../enums';
import { getCustomizedOrder, createCustomizedOrder, updateCustomizedOrder, deleteCustomizedOrder, closeCustomizedOrder, RequestUploadAttachedFile, RequestFile, createCustomizedReward, sendCustomizedReward, deleteCustomizedReward, createCustomizedCredit, sendCustomizedCredit, deleteCustomizedCredit, getCustomizedOrderVoucher } from 'src/api';
import { getDateString, getNumberFormat, GetLocalTime } from 'src/utils/helpers';
import { isEmpty, isNumberDigit, messages } from 'src/utils/validators';
import { useRoute } from 'vue-router';
import { useMetaStore } from "src/stores/meta";
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import DetailLayout from 'src/pages/orders/components/DetailLayout.vue';
import InputCurrencyPrice from 'src/components/InputCurrencyPrice.vue';
import InfoRow from '../components/InfoRow.vue';
import DatePicker from 'src/components/DatePicker.vue';
import UserSelector from '../components/UserSelector.vue';
import selectCurrency from 'src/components/selectCurrency.vue';
import TableComponent from 'src/components/TableComponent.vue';
import uploader from 'components/uploader.vue';
import Alert from 'src/components/dialog/Alert.vue'
import Confirm from 'src/components/dialog/Confirm.vue'
import CancelOrderDialog from '../components/CancelOrderDialog.vue';
import FinanceDialog from '../components/FinanceDialog.vue';
import AddRewardDialog from '../components/AddRewardDialog.vue';
import AddCreditDialog from '../components/AddCreditDialog.vue';
import axios from 'axios'
import to from 'await-to-js';
import _ from 'lodash';

const $q = useQuasar();
let route = useRoute();

const orderId = Number(route.params.orderNumber);
const isNewOrder = ref(true);
const autoCalculateMode = ref(true);

const filter = reactive({
  member_id: 0
})

interface finance {
  type: string;
  title: string;
  currency: string;
  amount: number|string;
  exchange_rate: number|string;
  updated_at: string;
}

interface point {
  amount: number;
  apply_time: null|string;
  button_enable: boolean;
  created_at: string;
  id: number;
  operator: string;
  reason: string;
}

interface Order {
	attached: Array<{ url: string; filename: string }>;
  booking_confirm_code: string;
  cancel_confirm_code: string;
  cancel_price: number|string;
  cancel_reason: string;
	closed: boolean;
	content: Array<{ column: string; value: string }>;
  created_at: string;
  credits: Array<point>;
  currency: string;
	deleted_at: string|null;
  end_date: string;
  final_profit: string;
	finance: Array<finance>;
  id: number|null;
  member: { email: string; id: number; name: string; title: string };
  order_number: string;
  parent: string;
	price: string|number;
  rewards: Array<point>;
  start_date: string;
  status: string;
  schedule_status: string;
	title: string;
	type: string;
  usd_price: string|number;
  voucher: string;
  voucher_send: string;
}

const model = ref<Order>({
	attached: [],
  booking_confirm_code: '',
  cancel_confirm_code: '',
  cancel_price: '',
  cancel_reason: '',
	closed: false,
	content: [],
  created_at: '',
  credits: [],
  currency: 'USD',
	deleted_at: null,
  end_date: '',
  final_profit: 'USD',
	finance: [],
  id: null,
  member: {
    email: '',
    id: 0,
    name: '',
    title: ''
  },
  order_number: '',
  parent: '',
	price: 0,
  rewards: [],
  start_date: '',
  status: '',
  schedule_status: '',
	title: '',
	type: 'hotel',
  usd_price: 0,
  voucher: '',
  voucher_send: '',
});

const meta = reactive({
  parentPath: '',
  parentTitle: '',
})

const rules = computed(() => {
  return {
    required: [
      val => !isEmpty(val) || messages.requiredInput()
    ],
    profit: [
      val => isNumberDigit(val, null, 2) || messages.invalidDecimal(2)
    ],
    finance_amount: [
      val => isNumberDigit(val, null, 2) || messages.invalidDecimal(2)
    ],
    exchange_rate: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isNumberDigit(val, 4) || `${messages.invalidInteger(4)}`
    ]
  }
});

/* tab, section Start */
const memberSectionRef = ref(null)
const mainSectionRef = ref(null)
const profitSectionRef = ref(null)
const financeSectionRef = ref(null)
const attachedSectionRef = ref(null)
const voucherSectionRef = ref(null)
const tabs = ref([
  {
    name: 'member',
    label: '訂購人',
    ref: memberSectionRef
  },
  {
    name: 'main',
    label: '訂單資訊',
    ref: mainSectionRef
  },
  {
    name: 'profit',
    label: '利潤',
    ref: profitSectionRef
  },
  {
    name: 'finance',
    label: '收入/支出',
    ref: financeSectionRef
  },
  {
    name: 'attached',
    label: '附件',
    ref: attachedSectionRef
  },
  {
    name: 'voucher',
    label: '憑證資訊',
    ref: voucherSectionRef
  }
])
/* tab, section End */

onMounted(async () => {
	changeOrderType();
	if (!isNaN(orderId)) {
		let order: any = await getData();
		if (order) {
			model.value = order;
			setDuration();
			isNewOrder.value = false;
			meta.parentPath = `/orders/booking/${model.value.parent}`;
			meta.parentTitle = model.value.parent;
		}
	}
});

const getData = async () => {
  $q.loading.show();
  const [err, res]: [any, any] = await to(getCustomizedOrder(orderId));
  $q.loading.hide();

  if (err) {
    console.error("getDetail error:", err);
    return;
  }
	return res.data;
}

const booking_way = computed(() => {
  return orderBookingWayOptions.find((d) => d.value === 'offline');
});

/* 使用區間 Start */
const duration = reactive({ from: '', to: '' });
const setDuration = () => {
  duration.from = getDateString(model.value.start_date, 'YYYY-MM-DD');
  duration.to = getDateString(model.value.end_date, 'YYYY-MM-DD');
}

/* 取消 Start */
const cancelOrderRef = ref();
const doCancel = () => {
  cancelOrderRef.value.show({
    title: '取消訂單確認',
    message: `訂單編號：${model.value.order_number}`,
    required: false,
    isConfirmCode: true,
    isCancelPrice: true,
    data: {
      type: 'customized-order',
      orderNumber: orderId
    }
  });
}
const onCancelConfirm = async (data: any) => {
  $q.loading.show();
  const [err, res] = await to(deleteCustomizedOrder(data.orderNumber, {
    confirm_code: data.confirmCode,
    price: data.cancelPrice,
    reason: data.confirmText
  }));
  $q.loading.hide();
  
  if (err) {
    console.error('cancel order error:', err);
    return;
  }
  let order = await getData();
  if (order) {
    model.value = order;
    setDuration();
  }
}
/* 取消 End */

/* 結案 Start */
const closeConfirmRef = ref();
const isClose = computed(() => model.value.closed || model.value.deleted_at != null);
const doClose = () => {
  closeConfirmRef.value.show({
    title: '結案確認',
    message: '訂單結案後將該訂單將無法進行任何異動！'
  });
}
const onCloseConfirm = async () => {
  $q.loading.show();
  const [err, res] = await to(closeCustomizedOrder(orderId));
  $q.loading.hide();

  if (err) {
    console.error('close order error:', err);
    return;
  }
  let order = await getData();
  if (order) {
    model.value = order;
    setDuration();
  }
}
/* 結案 End */

/* 變更訂單類型 Start */
const changeOrderType = () => {
	model.value.content = [];
	defaultQuestions[model.value.type].forEach((question: any) => {
		model.value.content.push({
			column: question,
			value: ''
		});
	});
}
/* 變更訂單類型 End */

/* 上傳附件 Start */
const accept = ref(['image/jpg', 'image/jpeg', 'image/png', 'image/bmp', 'image/webp', 'application/pdf']);
const handleUpload = async (files: File[]) => {
  const [err, res] = await to(RequestUploadAttachedFile(orderId, files));
  if (err) {
    console.error("handleUpload error:", err);
    return;
  }
  model.value.attached = model.value.attached.concat(res.data);
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
const deleteAttached = (url:string) => {
  model.value.attached = model.value.attached.filter((attached) => attached.url !== url);
}
/* 上傳附件 End */

/* 編輯訂單問題欄位 Start */
const addQuestion = () => {
	model.value.content.push({
		column: '',
		value: '',
	});
}

const deleteQuestion = (index: number) => {
	model.value.content.splice(index, 1);
}
/* 編輯訂單問題欄位 End */

/* 編輯訂單收入支出 Start */
const metaStore = useMetaStore();
const addFinance = async () => {
  model.value.finance.push({
    type: 'revenue',
    title: '',
    currency: 'TWD',
    amount: '',
    exchange_rate: _.round(await metaStore.getExchangeRate('TWD', 'USD'), 2),
    updated_at: GetLocalTime(new Date()),
	});
}
const changeCurrency = async (finance: finance) => {
  finance.exchange_rate = _.round(await metaStore.getExchangeRate(finance.currency, 'USD'), 2);
}
function deleteFinance (index: number) {
  model.value.finance.splice(index, 1);
}
/* 編輯訂單收入支出 End */

/* 訂單收入支出表格 Start */
const financeUSD = computed(() => {
  return model.value.finance.map((d) => {
    return Number(d.amount) * Number(d.exchange_rate);
  });
});
const financeSum = computed(() => {
  return model.value.finance.reduce((acc, cur) => {
    if (cur.type === 'revenue') {
      return acc + Number(cur.amount) * Number(cur.exchange_rate);
    } else {
      return acc - Number(cur.amount) * Number(cur.exchange_rate);
    }
  }, 0);
});
/* 訂單收入支出表格 End */

/* 自動計算利潤 Start */
// 處理利潤的貨幣和金額分離
const finalProfitCurrency = computed({
  get: () => model.value.final_profit ? model.value.final_profit.slice(0, 3) : 'USD',
  set: (val) => {
    const amount = finalProfitAmount.value || '';
    model.value.final_profit = val + amount;
  }
});

const finalProfitAmount = computed({
  get: () => model.value.final_profit ? model.value.final_profit.slice(3) : '',
  set: (val) => {
    const currency = finalProfitCurrency.value || 'USD';
    model.value.final_profit = currency + val;
  }
});

// 監聽自動計算模式和 finance 變化
watch([autoCalculateMode, () => model.value.finance], ([autoMode], [oldAutoMode]) => {
  if (autoMode) {
    finalProfitAmount.value = financeSum.value.toString();
    // 當模式剛被開啟時，顯示提示
    if (!oldAutoMode) {
      $q.notify({
        type: 'info',
        message: '已開啟自動計算模式，利潤將自動同步收入/支出小計',
        position: 'top'
      });
    }
  }
}, { deep: true });
/* 自動計算利潤 End */

/* 支單列表 Start */
const payments = computed(() => {
  return model.value.finance.map((d, index) => ({
    index,
    ...d
  })).filter((d) => d.type === 'expense');
});
/* 支單列表 End */

/* 新增/編輯訂單 Start */
const form = ref();
const userSelectorRef = ref();
const validate = async () => {
  await form.value.validate();
  return  await userSelectorRef.value.validate();
}

const cancelEdit = () => {
	router.go(0);
}
const addOrder = async () => {
	$q.loading.show();
  let valid = await validate();
  if (valid) {
    const [err, res]: [any, any] = await to(createCustomizedOrder({
      attached: model.value.attached,
      booking_confirm_code: model.value.booking_confirm_code,
      content: model.value.content,
      currency: model.value.currency,
      end_date: duration.to,
      final_profit: model.value.final_profit,
      finance: model.value.finance,
      member_id: model.value.member.id,
      price: model.value.price,
      schedule_status: 'pending',
      start_date: duration.from,
      status: 'success',
      title: model.value.title,
      type: model.value.type,
      usd_price: model.value.usd_price,
      voucher_number: model.value.voucher
    }));
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
		const [err, res]: [any, any] = await to(updateCustomizedOrder(orderId, {
      attached: model.value.attached,
      booking_confirm_code: model.value.booking_confirm_code,
      content: model.value.content,
      currency: model.value.currency,
      end_date: duration.to,
      final_profit: model.value.final_profit,
      finance: model.value.finance,
      member_id: model.value.member.id,
      price: model.value.price,
      schedule_status: model.value.schedule_status,
      start_date: duration.from,
      status: model.value.status,
      title: model.value.title,
      type: model.value.type,
      usd_price: model.value.usd_price,
      voucher_number: model.value.voucher
    }));
	} else {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}
	$q.loading.hide();
}
/* 新增/編輯訂單 End */

/* 發送憑證 Start */
const sendVoucher = async () => {
  $q.loading.show();
  const [err, res] = await to(getCustomizedOrderVoucher(model.value.id));
  $q.loading.hide();
};
/* 發送憑證 End */

/* Rewards Start */
const rewardDialogRef = ref();
const addReward = () => {
  rewardDialogRef.value.show();
}
const updateReward = async (data: any) => {
  $q.loading.show();
  const [err, res] = await to(createCustomizedReward(orderId, data));
  $q.loading.hide();

  let order = await getData();
  if (order) {
    model.value.rewards = order.rewards ?? [];
  }
}
const sendRewardConfirmRef = ref();
const doSendRewards = (reward:point) => {
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
  const [err, res] = await to(sendCustomizedReward(orderId, data));
  $q.loading.hide();

  if (err) {
    console.error('send reward error:', err);
    return;
  }

  let order = await getData();
  if (order) {
    model.value.rewards = order.rewards ?? [];
  }
}
const deleteRewardConfirmRef = ref();
const doDeleteRewards = (reward:point) => {
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
  const [err, res] = await to(deleteCustomizedReward(orderId, data));
  $q.loading.hide();

  if (err) {
    console.error('delete reward error:', err);
    return;
  }

  let order = await getData();
  if (order) {
    model.value.rewards = order.rewards ?? [];
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
  const [err, res] = await to(createCustomizedCredit(orderId, data));
  $q.loading.hide();

  let order = await getData();
  if (order) {
     model.value.credits = order.credits ?? [];
  }
}
const sendCreditConfirmRef = ref();
const doSendCredits = (credit:point) => {
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
  const [err, res] = await to(sendCustomizedCredit(orderId, data));
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
    model.value.credits = order.credits ?? [];
  }
}
const deleteCreditConfirmRef = ref();
const doDeleteCredits = (credit:point) => {
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
  const [err, res] = await to(deleteCustomizedCredit(orderId, data));
  $q.loading.hide();

  if (err) {
    console.error('delete credit error:', err);
    return;
  }

  let order = await getData();
  if (order) {
    model.value.credits = order.credits ?? [];
  }
}
/* Credits End */
</script>
<style lang="scss" scoped>
.finance-list {
  .item-badge {
    width: 100px;
  }
  .item-price {
    width: 180px;
  }
  .item-rate {
    width: 100px;
  }
  .item-text {
    width: 90px;
  }
  .item-delete {
    width: 60px;
  }
}
.point-list {
  .point-add-info {
    font-size: 0.8rem;
    letter-spacing: 0.12em;
  }
}
</style>