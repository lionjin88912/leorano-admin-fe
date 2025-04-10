<template>
  <div>
    <BreadCrumbs pageTitle="202500001" />
    <div class="row q-col-gutter-lg q-mt-none">
      <div class="col-8">
        <q-card flat bordered>
          <q-card-section>
            <div class="flex q-gutter-sm q-mb-md">
              <q-space />
              <q-btn label="取消" color="primary" class="q-px-lg" @click="cancelEdit" outline />
              <q-btn label="儲存" color="primary" class="q-px-lg" @click="saveOrder" unelevated />
            </div>
            <q-form>
              <div>
                <div class="row q-col-gutter-x-sm q-col-gutter-y-md">
                  <q-input class="col-4" v-model="form.created_at" label="建立時間" readonly outlined dense />
                  <q-input class="col-4" v-model="form.payment_no" label="支單號" readonly outlined dense />
                  <q-input class="col-4" v-model="form.applicant" label="申請人" readonly outlined dense />
                  <q-input class="col-8" v-model="form.expense_name" label="支出名稱" readonly outlined dense />
                  <q-input class="col-4" v-model="form.amount" label="金額" readonly outlined dense />
                </div>
                <div class="text-bold q-mt-lg q-mb-sm">付款資訊</div>
                <div class="row q-col-gutter-x-sm q-col-gutter-y-md">
                  <q-input class="col-4" v-model="form.payer" label="支付對象" readonly outlined dense />
                  <q-input class="col-4" v-model="form.supplier" label="供應商" outlined dense />
                  <q-input class="col-4" v-model="form.payment_method" label="付款方式" outlined dense />
                  <q-input class="col-4" v-model="form.account_name" label="戶名" outlined dense />
                  <q-input class="col-4" v-model="form.account_number" label="帳號" outlined dense />
                  <q-input class="col-4" v-model="form.bank" label="銀行" outlined dense />
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">
        <q-btn label="作廢" color="warning" unelevated />
        <q-btn label="列印" color="primary" class="q-ml-sm" @click="printPayment('202500001')" unelevated />
        <q-card class="bg-grey-2 q-mt-md" flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-bold">付款狀態</div>
            <!-- <div class="text-grey-7">於 2025/02/13 已審核</div> -->
            <div v-if="form.review" class="text-grey-7">於 {{ getDateString(form.review) }} 已付款</div>
            <q-toggle v-else v-model="form.review" :false-value="null" label="未付款" color="primary" class="text-grey-7" />
          </q-card-section>
        </q-card>
      </div>
    </div>
    <DetailLayout :tabs="tabs">
      <template #buttons>
        <div v-if="!isClose" class="flex q-gutter-sm">
          <q-space />
        </div>
      </template>
      <template #form>
      </template>
      <template #aside>
        <div class="q-mb-md">
        </div>
      </template>
    </DetailLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { router } from 'src/router'
import { getDateString } from 'src/utils/helpers';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import InfoRow from '../orders/components/InfoRow.vue';

const form = ref({
  account_name: '',
  account_number: '',
  amount: '19311',
  applicant: 'LION',
  bank: '',
  created_at: '2025-03-12 15:42',
  expense_name: '2025-01-10 訂金',
  payer: 'Le Oràno',
  payment_method: '',
  payment_no: '202500001',
  supplier: '',
  review: null // '2025-03-04T08:41:45.965Z'
});

const printPayment = (paymentNumber) => {
  const route = router.resolve({ 
    name: 'PrintPayment', 
    params: { paymentNumber } 
  });
  window.open(route.href, '_blank');
}
</script>