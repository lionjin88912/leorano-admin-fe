<template>
  <div>
    <BreadCrumbs />
    <DetailLayout v-if="model" :tabs="tabs">
      <template #buttons>
        <div class="flex q-gutter-sm">
          <q-space />
          <q-btn label="取消" color="primary" class="q-px-lg" @click="cancelEdit" outline />
          <q-btn label="儲存" color="primary" class="q-px-lg" @click="saveOrder" unelevated />
        </div>
      </template>
      <template #form>
        <InfoRow ref="mainSectionRef" title="訂單資訊" class="scroll-margin">
          <template v-slot:caption>
            <q-badge :color="booking_way.color" class="q-ml-sm" outline>
              {{ booking_way.label }}
            </q-badge>
          </template>
          <q-card v-if="isCancelled" class="bg-amber-1 q-my-md" flat bordered>
            <q-card-section>
              <div class="text-bold">取消資訊</div>
              <div class="q-mt-sm">
                <div class="row q-col-gutter-sm">
                  <q-input v-model="cancelInfo.order_cancel_code" label="取消編號" class="col-4" dense outlined readonly />
                  <q-input v-model="model.cancelled_at" label="取消時間" mask="####-##-##" class="col-4" dense outlined readonly />
                  <q-input v-model="cancelInfo.order_cancel_reason" label="取消原因" class="col-12" dense outlined readonly />
                </div>
              </div>
            </q-card-section>
          </q-card>
          <div class="q-mt-md q-mb-lg">
            <div class="row q-col-gutter-x-sm q-col-gutter-y-md">
              <q-input v-model="model.hotel.name" label="訂單名稱" class="col-12" dense outlined readonly />
              <q-input v-model="model.created_at" label="訂單日期" mask="####-##-##" class="col-4" dense outlined readonly />
              <q-input v-model="model.order_number" label="訂單編號" class="col-4" dense outlined readonly />
              <q-input v-model="orderStatus.label" label="訂單狀態" class="col-4" :input-class="`text-${orderStatus.color}`" dense outlined readonly />
              <q-input v-model="orderType.label" label="訂單類型" class="col-4" dense outlined readonly />
              <q-input v-model="bookingConfirmCode" label="確認編號" class="col-4" dense outlined readonly />
            </div>
            <div class="text-bold q-mt-md q-mb-sm">旅客行程</div>
            <div class="row q-col-gutter-sm">
              <q-input v-model="scheduleStatus.label" label="狀態" class="col-4" :input-class="`text-${scheduleStatus.color}`" dense outlined readonly />
              <q-input v-model="model.check_in" label="使用日期" mask="####-##-##" class="col-4" dense outlined readonly />
              <q-input v-model="model.check_out" label="結束日期" mask="####-##-##" class="col-4" dense outlined readonly />
            </div>
          </div>
        </InfoRow>
        <InfoRow ref="profitSectionRef" title="利潤" class="scroll-margin">
          <div class="q-mt-md q-mb-lg">
            <div class="flex justify-between q-mb-sm">
              <div class="text-bold">預估利潤</div>
              <div class="text-grey-7">
                {{ model.Profit.usd_price }} = 
                  {{ model.book_code.plan.base_price.slice(0, 3) }}{{ getNumberFormat(model.book_code.plan.base_price.slice(3)) }}
                  x {{ model.Profit.rate }} 
                  x {{ model.Profit.percent }}%
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <q-input v-model.number="model.Profit.percent" label="利潤百分比" class="col-4" @update:model-value="changeProfitPercent" dense outlined />
              <q-input v-model="model.Profit.rate" label="匯率" class="col-4" dense outlined readonly />
              <InputCurrencyPrice v-model="model.Profit.usd_price" label="利潤" class="col-4" readonly />
            </div>
            <div class="text-bold q-mt-md q-mb-sm">實際利潤</div>
            <div class="row q-col-gutter-sm">
              <InputCurrencyPrice v-model="model.final_profit" label="利潤" class="col-4" />
            </div>
          </div>
        </InfoRow>
        <InfoRow ref="memberSectionRef" title="訂購人" class="scroll-margin">
          <div class="q-mt-md q-mb-lg">
            <UserSelector v-model="user" :required="true" />
          </div>
        </InfoRow>
        <InfoRow ref="travelerSectionRef" title="出行人" class="scroll-margin">
          <div class="q-mt-md q-mb-lg">
            <UserSelector v-model="passenger" :required="true" />
          </div>
        </InfoRow>
      </template>
      <template #aside>
        <q-btn v-if="isCancellable" color="warning" label="取消訂單" class="q-mb-md" @click="onCancelOrder" unelevated></q-btn>
        <q-card class="bg-grey-2" flat bordered>
          <q-card-section class="order-teaser">
            <div class="flex no-wrap">
              <div class="teaser-label">酒店</div>
              <div class="text-grey-7">{{ model.hotel.name }}</div>
            </div>
            <div class="flex no-wrap q-mt-sm">
              <div class="teaser-label">方案</div>
              <div class="text-grey-7">{{ model.book_code.plan.name }}</div>
            </div>
            <div class="flex no-wrap q-mt-sm">
              <div class="teaser-label">房型</div>
              <div class="text-grey-7">{{ model.book_code.plan.room_display_name || 'N/A' }}</div>
            </div>
            <div class="flex no-wrap q-mt-sm">
              <div class="teaser-label">入住日</div>
              <div class="text-grey-7">{{ getDateStringNoTz(model.check_in, 'YYYY-MM-DD') }}</div>
            </div>
            <div class="flex no-wrap q-mt-sm">
              <div class="teaser-label">退房日</div>
              <div class="text-grey-7">{{ getDateStringNoTz(model.check_out, 'YYYY-MM-DD') }}</div>
            </div>
            <div class="flex no-wrap q-mt-sm">
              <div class="teaser-label">入住人</div>
              <div class="text-grey-7">{{ model.traveler_firstname }} {{ model.traveler_lastname }}</div>
            </div>
            <details class="order-detail q-mt-sm">
              <summary class="text-primary">
                旅客特殊需求
                <q-icon name="keyboard_arrow_down" size="1.5em" class="toggle-icon" />
              </summary>
              <ul class="detail-list text-grey-7 q-mt-xs">
                <li v-for="(req, index) of (model.traveler_special_requests || [])" :key="index">
                  {{ req }}
                </li>
              </ul>
            </details>
            <details class="order-detail q-mt-sm">
              <summary class="text-primary">
                付款方式
                <q-icon name="keyboard_arrow_down" size="1.5em" class="toggle-icon" />
              </summary>
              <div class="flex q-mt-xs">
                <div class="text-bold q-mr-sm">{{ model.book_code.guarantee }}</div>
                <div class="text-grey-7">
                  {{ payDescp }}
                </div>
              </div>
            </details>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div class="text-bold">每日房價</div>
            <div v-for="(rate, index) of model.book_code.plan.daily_rate" :key="index" class="flex justify-between q-my-sm">
              <div class="text-bold text-grey-9">{{ getDateStringNoTz(rate.date, 'MM DD, YYYY') }}</div>
              <div class="text-grey-7">
                {{ getPriceText(rate.local_price).currency }} ${{ getNumberFormat(getPriceText(rate.local_price).price) }}
              </div>
            </div>
            <div class="bordered-dash q-my-sm"></div>
            <div class="flex justify-between q-my-xs">
              <div class="text-bold text-grey-9">稅金與費用</div>
              <div class="text-grey-7">
                {{ model.book_code.plan.total_price.slice(0, 3) }} ${{ getNumberFormat(getTaxAndFee()) }}
              </div>
            </div>
            <div class="flex items-end justify-between">
              <div class="text-bold q-mb-xs">總金額</div>
              <div class="text-grey-7 text-h6">
                {{ model.book_code.plan.total_price.slice(0, 3) }} ${{ getNumberFormat(model.book_code.plan.total_price.slice(3)) }}
              </div>
            </div>
            <div class="flex justify-end text-grey-7 text-bold">
              USD ${{ getNumberFormat(parseFloat(model.book_code.plan.total_price.slice(3))*parseFloat(model.Profit.rate)) }}
            </div>
          </q-card-section>
        </q-card>
        <q-card v-if="model.Rewards.amount" class="q-mt-md" flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="flex items-center justify-between">
              <div class="text-subtitle1 text-bold">Le Oràno Rewards</div>
            </div>
          </q-card-section>
          <q-list separator>
            <q-item class="items-start q-py-md">
              <q-item-section>
                <q-item-label class="text-bold text-grey-9">發送點數</q-item-label>
                <div v-if="model.Rewards.real_send_time" class="text-grey-7 q-mt-sm">
                  於 {{ isCancelled ? '-' : getDateString(model.Rewards.real_send_time, 'YYYY-MM-DD') }} 發送
                </div>
                <div v-else>未發送</div>
              </q-item-section>
              <q-item-section side top>
                <q-item-label caption>{{ getDateString(model.Rewards.estimate_send_time, 'YYYY-MM-DD') }}</q-item-label>
                <q-item-label class="text-h5 text-bold">{{ isCancelled ? 0 : getNumberFormat(model.Rewards.amount) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
        <q-card class="q-mt-md" flat bordered>
          <q-card-section>
            <details class="order-detail">
              <summary class="text-subtitle1 text-bold flex items-center justify-between">
                <span>取消政策</span>
                <q-icon name="keyboard_arrow_down" size="1.5em" class="toggle-icon" />
              </summary>
              <div v-if="deadline" class="flex q-mt-sm">
                <div class="text-bold q-mr-sm">Deadline</div>
                <div class="text-grey-7">{{ deadline }}</div>
              </div>
              <div v-if="cancellationText" class="q-mt-sm">
                <div class="text-bold q-mb-xs">Cancellation</div>
                <div class="text-grey-7">{{ cancellationText }}</div>
              </div>
            </details>
          </q-card-section>
        </q-card>
        <q-card class="q-mt-md" flat bordered>
          <q-card-section>
            <details class="order-detail">
              <summary class="text-subtitle1 text-bold flex items-center justify-between">
                <span>酒店方案原始資料</span>
                <q-icon name="keyboard_arrow_down" size="1.5em" class="toggle-icon" />
              </summary>
              <div v-for="(desc, idxDesc) of model.book_code.detail.RoomRateDescription" :key="idxDesc" class="q-mt-sm">
                <div class="text-bold q-mb-xs">{{ desc.Name }}</div>
                <div class="text-grey-7">
                  <div v-for="(text, idxText) of desc.Text" :key="idxText">{{ text }}</div>
                </div>
              </div>
            </details>
          </q-card-section>
        </q-card>
      </template>
    </DetailLayout>
    <CancelOrderDialog ref="cancelOrderRef" @confirm="onCancelConfirm"></CancelOrderDialog>
  </div>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { getHotelOrder, updateHotelOrder, cancelHotelOrder } from 'src/api'
import { orderBookingWayOptions, orderTypeOptions, hotelOrderStatusOptions, orderScheduleStatusOptions } from '../enums';
import { isNumberEmpty, isNumberDigit, messages } from 'src/utils/validators';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import DetailLayout from 'src/pages/orders/components/DetailLayout.vue';
import InfoRow from '../components/InfoRow.vue';
import UserSelector from '../components/UserSelector.vue';
import CancelOrderDialog from '../components/CancelOrderDialog.vue';
import InputCurrencyPrice from 'src/components/InputCurrencyPrice.vue';
import { getDateString, getNumberFormat, getDateStringNoTz, isDateBefore } from 'src/utils/helpers';
import _ from 'lodash';
import { get } from 'http';

const to = require('await-to-js').default

const $q = useQuasar();
let route = useRoute();
let router = useRouter();


const rules = computed(() => {
  return {
    profit: [
      val => !isNumberEmpty(val) || messages.requiredInput(),
      val => isNumberDigit(val, null, 1) || messages.invalidDecimal(1)
    ],
  }
})

/* tab, section Start */
const mainSectionRef = ref(null)
const profitSectionRef = ref(null)
const memberSectionRef = ref(null)
const travelerSectionRef = ref(null)
const tabs = ref([
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
    name: 'member',
    label: '訂購人',
    ref: memberSectionRef
  },
  {
    name: 'traveler',
    label: '出行人',
    ref: travelerSectionRef
  }
])
/* tab, section End */

onMounted(() => {
  getData();
})

const model = ref();
const user = ref();
const passenger = ref();
const getData = async () => {
  $q.loading.show();
  const [err, res] = await to(getHotelOrder(route.params.orderNumber));
  $q.loading.hide();

  if (err) {
    console.error("getDetail error:", err);
    return;
  }
  model.value = res.data;
  user.value = getUser(model.value.user);
  passenger.value = getUser(model.value.passenger_user);
}

const getUser = (person: any) => {
  return {
    id: person.id,
    name: `${person.first_name} ${person.last_name}`,
    email: person.email,
    phone: person.phone
  }
}

const booking_way = computed(() => {
  return orderBookingWayOptions.find((d) => d.value === 'online');
});

// 訂單狀態
const orderStatus = computed(() => {
  let status = hotelOrderStatusOptions.find((d) => d.value === model.value.status);
  return status ? status : { label: '未知狀態', color: 'negative'}
})

// 訂單類型
const orderType = computed(() => {
  return orderTypeOptions.find((d) => d.value === 'hotel');
})

// 確認編號
const bookingConfirmCode = computed(() => {
  return (model.value.booking_confirm_code || ['-']).join(',');
})

// 行程狀態
const scheduleStatus = computed(() => {
  let schedule_status = '';
  if (isDateBefore(new Date(), getDateString(model.value.check_in))) {
    schedule_status = 'pending';
  } else if (isDateBefore(new Date(), getDateString(model.value.check_out))) {
    schedule_status = 'start';
  } else {
    schedule_status = 'done';
  }
  return orderScheduleStatusOptions.find((d) => d.value === schedule_status);
})

// 預估利潤
const changeProfitPercent = (val: string) => {
  model.value.Profit.usd_price = `USD${(parseFloat(model.value.book_code.plan.base_price.slice(3)) * parseFloat(model.value.Profit.rate) * parseFloat(val) / 100).toFixed(2)}`;
}

// 付款方式描述
const payDescp = computed(() => {
  switch (_.lowerCase(model.value.book_code.guarantee)) {
    case 'guarantee':
      return '預留信用卡資料，入住時付款'
    case 'deposit':
      return '需要預先付部份訂金'
    case 'prepayment':
      return '需要預先付全部份房價'
    default:
      return 'N/A';
  }
});

// 金額格式化
const getPriceText = (priceStr: string) => {
  return {
    currency: priceStr.slice(0, 3),
    price: priceStr.slice(3)
  }
};

// 稅金與費用
const getTaxAndFee = () => {
  const totalPrice = Number(model.value.book_code.plan.total_price.slice(3))
  let dailyPrice = 0;
  model.value.book_code.plan.daily_rate.map((d: any) => dailyPrice += Number(d.local_price.slice(3)))
  return totalPrice - dailyPrice;
}

/* 取消政策 Start */
const deadline = computed(() => {
  const cancelInfo = model.value.book_code?.plan?.cancel_info;
  if (cancelInfo && cancelInfo.deadline) {
    return `${getDateStringNoTz(cancelInfo.deadline, "HH:mm MM DD, YYYY")}`
  }
  return null
})

const cancelEdit = () => {
	router.go(0);
}
const saveOrder = async () => {
	$q.loading.show();
  const [err, res] = await to(updateHotelOrder(model.value.order_number, {
    final_profit: model.value.final_profit,
    member_id: user.value.id,
    passenger_id: passenger.value.id,
    profit_percent: model.value.Profit.percent
  }));
  $q.loading.hide();
}

const cancellationText = computed(() => {
  if (model.value.book_code && model.value.book_code.cancellation_texts) {
    return model.value.book_code.cancellation_texts.join(' ');
  }
  return '';
})
/* 取消政策 End */

/* 取消訂單 Start */
const cancelInfo = computed(() => {
  return {
    order_cancel_code: (model.value.cancel_confirm_code || []).join(','),
    order_cancel_reason: model.value.cancel_order?.content?.content
  }
})

const isCancelled = computed(() => {
  return model.value.status === 'cancelled';
})

const isCancellable = computed(() => {
  // return !model.value.cancelled_at && ["processing", "success", "cancel_failed"].includes(model.value.status)
  return !model.value.cancelled_at && isDateBefore(new Date(), getDateString(model.value.check_in))
});

const cancelOrderRef = ref();
const onCancelOrder = () => {
  cancelOrderRef.value.show({
    title: '確定取消酒店訂單',
    message: '酒店訂單取消後將無法復原，重新訂購可能無法取得相同房型、優惠與價格。',
    required: true,
    data: {
      type: 'hotel-order',
      orderNumber: model.value.order_number
    }
  });
}

const onCancelConfirm = async (data: any) => {
  // 取消訂單
  $q.loading.show();
  const [err, res] = await to(cancelHotelOrder(data.orderNumber, {
    content: data.confirmText
  }));
  $q.loading.hide();

  if (err) {
    console.error("cancel hotel order error:", err);
    return;
  }
  getData();
}
/* 取消訂單 End */
</script>
<style lang="scss" scoped>
.order-teaser {
  .teaser-label {
    flex: 0 0 45px;
    text-align: right;
    font-weight: bold;
    margin-right: 8px;
  }
}
.order-detail {
  cursor: pointer;
  .toggle-icon {
    transition: transform 0.3s ease;
  }
  &[open]{
    .toggle-icon {
      transform: rotate(-180deg);
    }
  }
  .detail-list {
    list-style: disc;
    padding-left: 16px;
  }
  .detail-label {
    flex: 0 0 60px;
    text-align: right;
    font-weight: bold;
    margin-right: 8px;
  }
}
:deep(.order-profit .q-field__control) {
  height: 36px;
  line-height: 36px;
}
</style>
