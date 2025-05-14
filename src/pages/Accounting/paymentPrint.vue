<template>
  <div class="A4 bg-white q-pa-lg q-mx-auto q-my-md shadow-2">
    <div class="text-caption">{{ printTime }}</div>
    <div class="text-h6 text-center">{{ titleType }}</div>
    <div class="flex justify-between q-mt-xs">
      <div>
        <div class="text-caption">供應商：{{ model.supplier }}</div>
        <div class="text-caption">支付對象：{{ model.payer }}</div>
        <div class="text-caption">戶名/帳號/銀行：{{ account }}</div>
      </div>
      <div>
        <div class="text-caption">支出單號：<span class="text-subtitle1 text-bold">{{ model.payment_number }}</span></div>
        <div class="text-caption">申請人員：{{ model.applicant }}</div>
      </div>
    </div>
    <q-table :rows="model.list" :columns="paymentPrintColumns" row-key="id" class="q-mt-md" hide-bottom flat dense>
      <template v-slot:bottom-row>
        <q-tr class="total">
          <q-td colspan="3">
            <div class="text-caption q-mt-xs">
              <div>付款方式：{{ model.payment_method }}</div>
              <div class="text-subtitle2">{{ currency }}：{{ getNumberFormat(sum) }}</div>
            </div>
          </q-td>
          <q-td colspan="2">
            <div class="text-caption q-mt-xs">
              ◆ {{ model.payment_title }}
            </div>
          </q-td>
          <q-td colspan="3" class="text-right">
            <div class="text-caption q-mt-xs">
              總計：<span class="text-subtitle2">{{ getNumberFormat(sumUSD) }}</span>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <div class="row items-end q-col-gutter-x-sm q-mt-lg">
      <div class="col text-caption line-height">
        領款：
      </div>
      <div class="col text-caption line-height">
        會計<br>主管：
      </div>
      <div class="col text-caption line-height">
        會計：
      </div>
      <div class="col text-caption line-height">
        主管：
      </div>
      <div class="col text-caption line-height">
        申請：
      </div>
    </div>
    <div class="text-right text-caption">{{ model.applicant }} {{ getDateString(model.created_at, 'YYYY/MM/DD hh:mm') }} TW</div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { paymentTitleTypeOptions, paymentPrintColumns } from './enums';
import { getDateString, getNumberFormat } from 'src/utils/helpers';

const model = ref({
  account_name: '',
  account_number: '',
  applicant: 'Selina',
  bank: '',
  created_at: '2025-04-18T07:59:57.959Z',
  list: [{
    currency: 'TWD',
    detail: '2025-01-10 訂金',
    exchange_rate: 0.3,
    amount: 19311.02,
    type: 'hotel',
  }],
  order_number: 'C25032702461510',
  payer: 'LE ORANO, INC.',
  payment_method: '銀行/匯款',
  payment_number: '2504180002',
  payment_title: '2025-01-10 訂金',
  paid: false,
  paid_at: null,
  paid_remark: '',
  supplier: 'ZZTW ZZTW(合格)',
  type: 'cost'
})
onMounted(() => {
  model.value.list = model.value.list.map((item, index) => {
    return {
      index: index + 1,
      order_number: model.value.order_number,
      qty: 1,
      ...item,
    }
  })
  // window.print();
});

const printTime = computed(() => {
  let now = new Date();
  return getDateString(now, 'YYYY/MM/DD') + ' ' + now.toLocaleTimeString("zh-TW");
});

const titleType = computed(() => {
  return paymentTitleTypeOptions.find(item => item.value === model.value.type).label;
});

const account = computed(() => {
  const { account_name, account_number, bank } = model.value;
  if (!account_name && !account_number && !bank) {
    return '未提供！';
  }
  return [account_name || '-', account_number || '-', bank || '-'].join('/');
});

const currency = computed(() => {
  return model.value.list[0].currency;
});

const sum = computed(() => {
  return model.value.list.reduce((acc, item) => {
    return acc + item.amount * item.qty;
  }, 0);
});
const sumUSD = computed(() => {
  return model.value.list.reduce((acc, item) => {
    return acc + item.amount * item.qty * item.exchange_rate;
  }, 0);
});
</script>

<style lang="scss" scoped>
body {
  background-color: $grey-4;
}
.A4 {
  width: 210mm;
  height: 297mm;
}
.line-height {
  line-height: 1.3;
}
.absolute {
  right: 0;
}
.total {
  vertical-align: top;
}

@media print {
  .A4 {
    margin: 0;
  }
}
</style>