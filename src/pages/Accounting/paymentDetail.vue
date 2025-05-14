<template>
  <div>
    <BreadCrumbs :pageTitle="paymentNumber == 'ADD' ? '新增支單' : paymentNumber" />
    <div class="flex items-center q-gutter-sm q-my-sm">
      <div>
        <div v-if="model.type == 'cost'" class="text-caption">
          訂單：<router-link :to="{ name: 'AccountingBookingDetail', params: { orderNumber: model.parent } }" class="text-primary cursor-pointer ellipsis">{{ model.parent }}</router-link>
        </div>
        <div class="text-h5 text-bold">{{ titleType }}</div>
      </div>
      <q-space />
      <q-btn v-if="paymentNumber !== 'ADD' && !is_paid" label="作廢" color="warning" class="q-px-lg" unelevated />
      <q-btn v-if="paymentNumber !== 'ADD'" label="列印" color="primary" class="q-px-lg" @click="printPayment('2504180002')" unelevated />
    </div>
    <q-card flat bordered>
      <q-card-section>
        <div class="flex items-center q-gutter-sm">
          <div>
            <div v-if="model.type == 'cost'" class="text-caption">
              子訂單：
              <router-link v-if="model.booking_way == 'customized'" :to="{ name: 'CustomizedOrderDetail', params: { orderNumber: model.order_id } }">{{ model.order_number }}</router-link>
              <router-link v-if="model.booking_way == 'hotel'" :to="{ name: 'HotelOrderDetail', params: { orderNumber: model.order_number } }">{{ model.order_number }}</router-link>
            </div>
            <div class="text-h6">支單資訊</div>
          </div>
          <q-space />
          <q-btn v-if="!is_paid" label="取消" color="primary" class="q-px-lg" @click="cancelEdit" outline />
          <q-btn v-if="!is_paid" label="儲存" color="primary" class="q-px-lg" @click="savePayment" unelevated />
        </div>
        <div class="q-mt-md">
          <div class="row q-col-gutter-x-sm q-col-gutter-y-md">
            <q-input v-model="model.payment_title" label="支單名稱" :class="{'col-6': paymentNumber !== 'ADD', 'col-12': paymentNumber === 'ADD'}" :readonly="model.type == 'cost'" :disable="is_paid" outlined dense />
            <q-input v-if="paymentNumber != 'ADD'" v-model="createdAt" label="建立時間" class="col-2" :disable="is_paid" readonly outlined dense />
            <q-input v-if="paymentNumber != 'ADD'" v-model="model.payment_number" label="支單號" class="col-2" :disable="is_paid" readonly outlined dense />
            <q-input v-if="paymentNumber != 'ADD'" v-model="model.applicant" label="申請人" class="col-2" :disable="is_paid" readonly outlined dense />
            <q-input v-model="model.payer" label="支付對象" class="col-2" :disable="is_paid" readonly outlined dense />
            <q-input v-model="model.supplier" label="供應商" class="col-2" :disable="is_paid" outlined dense />
            <q-input v-model="model.payment_method" label="付款方式" class="col-2" :disable="is_paid" outlined dense />
            <q-input v-model="model.account_name" label="戶名" class="col-2" :disable="is_paid" outlined dense />
            <q-input v-model="model.account_number" label="帳號" class="col-2" :disable="is_paid" outlined dense />
            <q-input v-model="model.bank" label="銀行" class="col-2" :disable="is_paid" outlined dense />
          </div>
        </div>
        <div class="q-mt-lg">
          <FinanceList v-model="model.expense_list" type="expense" :mode="model.type == 'cost' ? 'edit' : ''" :disable="is_paid" />
        </div>
      </q-card-section>
    </q-card>
    <q-card v-if="paymentNumber !== 'ADD'" class="q-mt-md" flat bordered>
      <q-card-section>
        <div class="flex items-center q-gutter-sm">
          <div>
            <div class="text-h6">付款資訊</div>
          </div>
          <q-space />
          <q-btn label="取消" color="primary" class="q-px-lg" @click="cancelEdit" outline />
          <q-btn label="儲存" color="primary" class="q-px-lg" @click="savePayment" unelevated />
        </div>
        <div class="q-mt-md">
          <div class="row q-col-gutter-x-sm q-col-gutter-y-md">
            <q-toggle v-model="model.is_paid" :label="model.is_paid ? '已付款' : '未付款'" color="primary" class="col-2 text-grey-7" :disable="is_paid" />
            <q-field label="付款日期" class="col-2" dense outlined stack-label>
              <template #default>
                <DatePicker :date="model.paid_at" @updated="(val) => model.paid_at = val" />
              </template>
              <template v-slot:control>
                <div>{{ getDateString(model.paid_at, 'YYYY-MM-DD') }}</div>
              </template>
            </q-field>
          </div>
        </div>
        <div class="q-mt-lg">
          <FinanceList v-model="model.paid_list" type="paid" />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { router } from 'src/router'
import { getDateString } from 'src/utils/helpers';
import { paymentTitleTypeOptions, paymentTypeOptions } from './enums';
import InputCurrencyPrice from 'src/components/InputCurrencyPrice.vue';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import InfoRow from '../orders/components/InfoRow.vue';
import DatePicker from 'src/components/DatePicker.vue';
import FinanceList from './components/FinanceList.vue';

const expenseCateOptions = [
  { label: '票券成本', value: 'ticket_cost' },
  { label: '酒店成本', value: 'hotel_cost' },
  { label: '刷卡手續費', value: 'credit_card_fee' },
  { label: '匯款手續費', value: 'remittance_fee' },
  { label: '其他', value: 'other' }
]

const model = ref({
  account_name: '',
  account_number: '',
  applicant: 'Selina',
  bank: '',
  booking_way: '',
  created_at: new Date(),
  expense_list: [],
  is_paid: false,
  order_id: null,
  order_number: '',
  paid_at: null,
  paid_list: [],
  parent: '',
  payer: 'LE ORANO, INC.',
  payment_method: '',
  payment_number: '',
  payment_title: '',
  supplier: '',
  type: 'expense',
});

const is_paid = ref(false);
const paymentNumber = router.currentRoute.value.params.paymentNumber.toUpperCase();
onMounted(() => {
  console.log('Payment Number:', paymentNumber);
  if (paymentNumber != 'ADD') {
    model.value = {
      account_name: '',
      account_number: '',
      applicant: 'Selina',
      bank: '',
      booking_way: 'hotel',
      created_at: '2025-04-18T07:59:57.959Z',
      expense_list: [{
        cate: 'hotel_cost',
        currency: 'TWD',
        title: '2025-01-10 訂金',
        exchange_rate: 0.3,
        amount: 19311.02,
      }],
      is_paid: false,
      order_id: 57,
      order_number: 'H24112907185188-uat',
      paid_at: null, // 2025-04-20T07:59:57.959Z
      paid_list: [],
      parent: 'C25032702461510',
      payer: 'LE ORANO, INC.',
      payment_method: '',
      payment_number: '2504180002',
      payment_title: '2025-01-10 訂金',
      supplier: '',
      type: 'cost', // cost: 成本支單, expense: 費用支單
    }
    is_paid.value = model.value.is_paid;
  }
})

const titleType = computed(() => {
  return paymentTitleTypeOptions.find(item => item.value === model.value.type).label;
});
const createdAt = computed(() => {
  return model.value.created_at ? getDateString(model.value.created_at) : '';
});

const printPayment = (paymentNumber) => {
  const route = router.resolve({ 
    name: 'PrintPayment', 
    params: { paymentNumber } 
  });
  window.open(route.href, '_blank');
}

const savePayment = () => {

}

const cancelEdit = () => {

}
</script>

<style lang="scss">
.payment-list {
  .item-delete {
    width: 50px;
  }
}
</style>