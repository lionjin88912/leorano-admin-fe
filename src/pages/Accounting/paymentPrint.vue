<template>
  <div class="A4 bg-white q-pa-lg q-mx-auto q-my-md shadow-2">
    <div class="text-caption">2023/3/12 15:42</div>
    <div class="text-h6 text-center">費用支單</div>
    <div class="flex justify-between q-mt-xs">
      <div>
        <div class="text-caption">供應商：ZZTW ZZTW(合格)</div>
        <div class="text-caption">支付對象：雄獅旅行社</div>
        <div class="text-caption">戶名/電匯/銀行：未提供！</div>
      </div>
      <div>
        <div class="text-caption">支出單號：<span class="text-subtitle1 text-bold">202500001</span></div>
        <div class="text-caption">申請人員：LION</div>
      </div>
    </div>
    <q-table :rows="rows" :columns="paymentPrintColumns" row-key="id" class="q-mt-md" hide-bottom flat dense />
    <q-separator />
    <div class="flex justify-between q-mt-md">
      <div class="text-caption">
        付款方式：銀行/匯款<br>
        <span class="text-subtitle2">NTD：19,311</span>
      </div>
      <div class="text-caption">
        總計：<span class="text-subtitle2">19,311.00</span>
      </div>
    </div>
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
    <div class="text-right text-caption">LION 2025/3/12 15:39 TW</div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { paymentPrintColumns } from './enums';

const rows = ref([{
  id: 1,
  detail: '2025-01-10 訂金',
  qty: 1,
  price: '18,391.00920',
  tax: '',
  rate: '1.0000',
  total: '19,311.00'
}]);
onMounted(() => {
  window.print();
});
</script>

<style lang="scss">
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

@media print {
  .A4 {
    margin: 0;
  }
}
</style>