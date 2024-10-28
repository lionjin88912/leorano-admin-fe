<template>
  <div>
    <BreadCrumbs class="q-pb-md"></BreadCrumbs>
    <div v-if="model">
      <div class="flex justify-between q-pb-md">
        <div class="block">
          <div class="order-status">{{ statusText }}</div>
        </div>
        <q-btn v-if="isCancellable" color="warning" label="取消訂單" @click="onCancelOrder" dense></q-btn>
      </div>
      <InfoRow title="訂單資訊">
        <div class="info-field">
          <div class="info-field-label">訂單編號</div>
          <div class="info-field-text">{{ model.order_number }}</div>
        </div>
        <div v-if="model.status === 2" class="info-field">
          <div class="flex-1 column bg-grey-2 q-pa-sm">
            <div class="flex q-pb-xs">
              <div class="info-field-label">訂單取消時間</div>
              <div class="info-field-text">
                {{ getDateString(model.cancel_data?.cancel_order?.created_at, 'YYYY-MM-DD HH:mm', '-') }}
              </div>
            </div>
            <div class="flex q-pb-xs">
              <div class="info-field-label">訂單取消原因</div>
              <div class="info-field-text wrap">
                {{ model.cancel_data?.cancel_order?.content?.content || '-' }}
              </div>
            </div>
          </div>
        </div>
      </InfoRow>
      <InfoRow title="購買資訊">
        <template v-for="(item, index) of model.Items" :key="index">
          <div class="q-mx-lg">
            <div class="bg-grey-2 q-mb-sm">
              <div class="info-field">
                <div class="info-field-label">商品名稱</div>
                <div class="info-field-text">{{ productName(item) }}</div>
              </div>
              <div class="info-field">
                <div class="info-field-label">商品內容</div>
                <div class="info-field-text">{{ item.desc }}</div>
              </div>
              <div class="info-field">
                <div class="info-field-label">商品定價</div>
                <div class="info-field-text">
                  <div class="info-field-text flex">
                    <div class="q-pr-xs">USD</div>
                    <div class="price">{{ getCurrencyFormat(item.unit_price) }}</div>
                  </div>
                </div>
              </div>
              <div class="info-field">
                <div class="info-field-label">購買數量</div>
                <div class="info-field-text">{{ item.count }}</div>
              </div>
            </div>
            <div class="flex-1 bordered-dash"></div>
          </div>
        </template>
        <div class="info-field q-mx-lg">
          <div class="info-field-label regular">折扣</div>
          <div class="info-field-text flex q-pl-sm">
            <div class="q-pr-xs">USD</div>
            <div class="price">{{ getCurrencyFormat(itemsDiscount) }}</div>
          </div>
        </div>
        <div class="info-field text-bold q-mx-lg">
          <div class="info-field-label">小計</div>
          <div class="info-field-text flex q-pl-sm">
            <div class="q-pr-xs">USD</div>
            <div class="price">{{ getCurrencyFormat(itemsAmount) }}</div>
          </div>
        </div>
        <div class="info-field q-mx-lg">
          <div class="info-field-label regular">稅金與費用</div>
          <div class="info-field-text flex q-pl-sm">
            <div class="q-pr-xs">USD</div>
            <div class="price">{{ getCurrencyFormat(taxAndFee) }}</div>
          </div>
        </div>
        <div class="flex-1 bordered-dash q-mx-lg"></div>
        <div class="info-field text-bold q-mx-lg">
          <div class="info-field-label">總金額</div>
          <div class="info-field-text flex q-pl-sm">
            <div class="q-pr-xs">USD</div>
            <div class="price">{{ getCurrencyFormat(model.amount) }}</div>
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-text text-italic">
            <template v-if="model.cancel_info">
              {{ getDateStringNoTz(model.cancel_info.deadline, "HH:mm MM DD, YYYY", '-') }}
              前可免費取消
            </template>
            <template v-else>
              {{ model.cancellation_texts }}
            </template>
          </div>
        </div>
      </InfoRow>
      <InfoRow title="優惠方案">
        <div class="info-field">
          <div v-if="model.marketing_desc" class="info-field-text">
            <!-- 原始資料
            <RawDataInfo data-name="優惠方案" :raw-datas="model.marketing_desc"></RawDataInfo> -->
            {{ model.marketing_desc }}
          </div>
          <div v-else class="info-field-text">無原始資料</div>
        </div>
      </InfoRow>
      <InfoRow title="訂購人資料">
        <div class="info-field">
          <div class="info-field-label">會員編號</div>
          <div class="info-field-text">
            {{ model.UserProfile.user_number }}
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">姓名</div>
          <div class="info-field-text">
            {{ model.UserProfile.first_name }} {{ model.UserProfile.last_name }}
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">Email</div>
          <div class="info-field-text">{{ model.UserProfile.email }}</div>
        </div>
        <div class="info-field">
          <div class="info-field-label">Phone</div>
          <div class="info-field-text">{{ model.UserProfile.phone }}</div>
        </div>
      </InfoRow>
      <InfoRow title="付款狀態">
        <div class="info-field">
          <div class="info-field-label">付款結果</div>
          <div class="info-field-text">
            {{ paymentText }}
            <span v-if="isRefundable" class="q-px-sm text-primary cursor-pointer" @click="onRefund">申請退款</span>
            <!-- <span v-if="canRequestPayment" class="q-px-sm text-primary cursor-pointer"
              @click="onRequestPayment">重新付款</span> -->
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">付款時間</div>
          <div class="info-field-text">{{ getDateString(model.paided_at, "YYYY-MM-DD", '-') }}</div>
        </div>
        <div v-if="isRefunded" class="info-field">
          <div class="flex-1 column bg-grey-2 q-pa-sm">
            <div class="flex q-pb-xs">
              <div class="info-field-label">退款時間</div>
              <div class="info-field-text">
                {{ getDateString(model.cancel_data?.refund_order?.created_at, 'YYYY-MM-DD HH:mm', '-') }}
              </div>
            </div>
            <div class="flex q-pb-xs">
              <div class="info-field-label">退款金額</div>
              <div class="info-field-text">
                {{ getCurrencyFormat(model.cancel_data?.refund_order?.content?.amount) || '-' }}
              </div>
            </div>
            <div class="flex q-pb-xs">
              <div class="info-field-label">退款編號</div>
              <div class="info-field-text wrap">
                {{ model.cancel_data?.refund_order?.content?.stripeNumber || '-' }}
              </div>
            </div>
            <div class="flex q-pb-xs">
              <div class="info-field-label">退款方式</div>
              <div class="info-field-text wrap">{{ refundMethod }}</div>
            </div>
          </div>
        </div>
      </InfoRow>
    </div>
    <CancelOrderDialog ref="cancelOrderRef" @confirm="onCancelConfirm"></CancelOrderDialog>
    <RefundDialog ref="refundRef" @confirm="onRefundConfirm"></RefundDialog>
  </div>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { getMemberOrder, cancelMemberOrder, refundMemberOrder } from 'src/api'
import InfoRow from '../components/InfoRow.vue';
import RawDataInfo from 'src/pages/HotelList/plan/RawDataInfo.vue';
import CancelOrderDialog from '../components/CancelOrderDialog.vue';
import RefundDialog from '../components/RefundDialog.vue';
import { getDateString, getCurrencyFormat, getDateStringNoTz, addDays, isDateAfter } from 'src/utils/helpers';
import _ from 'lodash';
import { memberOrderStatusOptions, paymentStatusOptions, currencyOptions, paymentMethodOptions } from '../enums';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';

const to = require('await-to-js').default

const $q = useQuasar();
let route = useRoute();

const model = ref();
const cancelOrderRef = ref();
const refundRef = ref();

const getData = async () => {
  $q.loading.show();
  const [err, res] = await to(getMemberOrder(route.params.orderNumber));
  $q.loading.hide();

  if (err) {
    console.error("getDetail error:", err);
    return;
  }
  console.log('model:', res.data)
  model.value = res.data;
}

const statusText = computed(() => {
  return memberOrderStatusOptions.find(d => model.value.status === d.value)?.label || "未知狀態"
})

const paymentText = computed(() => {
  return paymentStatusOptions.find(d => model.value.payment === d.value)?.label || "未知狀態"
})

const productName = (item: any) => {
  switch (model.value.order_type) {
    case "membership":
      return `會籍 - ${item.item_name}`
    default:
      return item.item_name
  }
}

/**
 * 是否可請款 (重新付款)
 */
const canRequestPayment = computed(() => {
  return model.value.payment === 4;
})

/**
 * 是否可退款
 */
const isRefundable = computed(() => {
  // 只有已付款才出現申請退款的連結
  return model.value.amount > 0 && model.value.payment === 2;
})

/**
 * 是否已退款
 */
const isRefunded = computed(() => {
  return [5, 6].includes(model.value.payment);
});

const refundMethod = computed(() => {
  const value = model.value.cancel_data?.refund_order?.content?.refundMethod
  return paymentMethodOptions.find(d => d.value === value)?.label || '-'
})

const itemsDiscount = computed(() => {
  let discount = 0;
  model.value.Items.map((d: any) => discount += (d.subtotal - d.unit_price));
  return discount;
});

const itemsAmount = computed(() => {
  let amount = 0;
  model.value.Items.map((d: any) => amount += d.subtotal);
  return amount;
});

const taxAndFee = computed(() => {
  return model.value.amount - itemsAmount.value;
});

/**
 * 取消會藉的取消期限是「通過審核那一天」開始算，也就是會籍生效日的那一天
 */
const isCancellable = computed(() => {
  // 已審核通過(2)的才可取消
  if (model.value.RegisterRecord.verify !== 2) {
    return false;
  }
  // 已結案(order_status:4) + 請款完成(payment_status:2)
  if (model.value.status !== 4 || model.value.payment !== 2) {
    return false;
  }

  const deadline = getDateString(addDays(14, model.value.RegisterRecord.verified_at), "YYYY-MM-DD 23:59:59");
  console.log('取消期限:', deadline);
  return !isDateAfter(new Date(), deadline);
});

const onCancelOrder = () => {
  cancelOrderRef.value.show({
    title: '確定取消酒店訂單',
    message: '酒店訂單取消後將無法復原，重新訂購可能無法取得相同房型、優惠與價格。',
    required: true,
    data: {
      type: 'membership-order',
      orderNumber: model.value.order_number
    }
  });
}

const onRefund = () => {
  refundRef.value.show({
    title: '填寫退款紀錄',
    message: '請於完成退款程序後回填紀錄。',
    data: {
      type: 'membership-refund',
      orderNumber: model.value.order_number,
      maxAmount: model.value.amount
    }
  });
}

const onRequestPayment = () => {
  // TODO:重新付款連結
}

const onCancelConfirm = async (data: any) => {
  $q.loading.show();
  const [err, res] = await to(cancelMemberOrder(data.orderNumber, {
    content: data.confirmText
  }));
  $q.loading.hide();

  if (err) {
    console.error("cancel member order error:", err);
    return;
  }

  getData();
}

const onRefundConfirm = async (data: any) => {
  // TODO: 退款
  console.log('onRefundConfirm:', data);
  $q.loading.show();
  const [err, res] = await to(refundMemberOrder(data.orderNumber, {
    currency: data.currency.value,
    amount: data.amount,
    stripeNumber: data.stripeNumber,
    refundMethod: data.refundMethod
  }));
  $q.loading.hide();

  if (err) {
    console.error("cancel member order error:", err);
    return;
  }

  getData();
}

onMounted(() => {
  getData();
})

</script>
<style lang="scss" scoped>
.order-status {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: $grey-3;
  border-radius: 5px;
  border: 1px solid $grey-5;
  color: $grey-7;
  padding: 2px 12px;
  font-size: 16px;
}
</style>
