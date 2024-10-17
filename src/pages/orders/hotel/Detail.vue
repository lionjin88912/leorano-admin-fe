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
          <div class="info-field-text">
            {{ model.order_number }}
          </div>
          <q-separator vertical class="bg-grey-6 q-mx-sm"></q-separator>
          <div class="info-field-label auto-width">酒店確認編號</div>
          <div class="info-field-text">
            {{ (model.booking_confirm_code || ['-']).join(',') }}
          </div>
        </div>
        <div v-if="isCancelled" class="info-field">
          <div class="flex-1 column bg-grey-2 q-pa-sm">
            <div class="flex q-pb-xs">
              <div class="info-field-label">訂單取消時間</div>
              <div class="info-field-text"> {{ getDateString(model.cancelled_at, 'YYYY-MM-DD HH:mm') }}</div>
            </div>
            <div class="flex q-pb-xs">
              <div class="info-field-label">酒店取消編號</div>
              <div class="info-field-text"> {{ (model.cancel_confirm_code || []).join(',') }}</div>
            </div>
            <div class="flex q-pb-xs">
              <div class="info-field-label">訂單取消原因</div>
              <div class="info-field-text wrap"> {{ model.cancel_order?.content?.content }}</div>
            </div>
          </div>
        </div>
      </InfoRow>
      <InfoRow title="酒店資訊">
        <div class="info-field">
          <div class="info-field-label">酒店名稱</div>
          <div class="info-field-text">{{ model.hotel.name }}</div>
        </div>
        <div class="info-field">
          <div class="info-field-label">地址</div>
          <div class="info-field-text">{{ model.hotel.address }}</div>
        </div>
        <div class="info-field">
          <div class="info-field-label">入住日期</div>
          <div class="info-field-text">{{ getDateStringNoTz(model.check_in, 'YYYY-MM-DD') }}</div>
        </div>
        <div class="info-field">
          <div class="info-field-label">預定 Check-in 時間</div>
          <div class="info-field-text">{{ model.hotel.check_in_time }}</div>
        </div>
        <div class="info-field">
          <div class="info-field-label">退房日期</div>
          <div class="info-field-text">{{ getDateStringNoTz(model.check_out, 'YYYY-MM-DD') }}</div>
        </div>
      </InfoRow>
      <InfoRow title="方案內容">
        <div class="info-field">
          <div class="info-field-label">方案名稱</div>
          <div class="info-field-text">{{ model.book_code.plan.name }}</div>
        </div>
        <div class="info-field">
          <div class="info-field-label">入住人數</div>
          <div class="info-field-text flex">
            <div>{{ `${model.book_code.criteria.num_of_adults} 大人` }}</div>
            <div class="q-pl-sm">{{ `${model.book_code.criteria.children.length} 小孩` }}</div>
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">房型</div>
          <div class="info-field-text">
            {{ model.book_code.plan.room_display_name || 'N/A' }}
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">床型</div>
          <div class="info-field-text">
            {{ model.book_code.plan.bed || 'N/A' }}
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">景觀</div>
          <div class="info-field-text">
            {{ model.book_code.plan.view || 'N/A' }}
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">早餐</div>
          <div class="info-field-text flex items-center">
            <q-icon :name="hasBreakfast ? 'check' : 'close'" :color="hasBreakfast ? 'positive' : 'negative'"
              size="18px"></q-icon>
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">吸菸房</div>
          <div class="info-field-text flex items-center">
            <q-icon :name="isSmokingRoom ? 'check' : 'close'" :color="isSmokingRoom ? 'positive' : 'negative'"
              size="18px"></q-icon>
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">房間大小</div>
          <div class="info-field-text flex items-center">
            {{ model.book_code.plan.size || 'N/A' }}
          </div>
        </div>
      </InfoRow>
      <InfoRow title="優惠方案">
        <div class="info-field">
          <div class="info-field-link">{{ model.book_code.plan.name }}</div>
          <RawDataInfo data-name="Rate" :raw-datas="rateRawData"></RawDataInfo>
        </div>
      </InfoRow>
      <InfoRow title="費用與取消政策">
        <div class="info-field">
          <div class="info-field-label">每日房價</div>
        </div>
        <div class="info-field" v-for="(rate, index) of model.book_code.plan.daily_rate" :key="index">
          <div class="info-field-label">{{ getDateStringNoTz(rate.date, 'MM DD, YYYY') }}</div>
          <div class="info-field-text flex q-pl-sm">
            <div class="q-pr-xs">
              {{ getPriceText(rate.local_price).currency }}
            </div>
            <div class="price">
              ${{ getCurrencyFormat(getPriceText(rate.local_price).price) }}
            </div>
          </div>
        </div>
        <div class="flex-1 bordered-dash q-mx-lg"></div>
        <div class="info-field">
          <div class="info-field-label">稅金與費用</div>
          <div class="info-field-text flex q-pl-sm">
            <div class="q-pr-xs">
              {{ model.book_code.plan.total_price.slice(0, 3) }}
            </div>
            <div class="price">
              ${{ getCurrencyFormat(getTaxAndFee()) }}
            </div>
          </div>
        </div>
        <div class="info-field text-bold">
          <div class="info-field-label">總金額</div>
          <div class="info-field-text flex q-pl-sm">
            <div class="q-pr-xs">
              {{ model.book_code.plan.total_price.slice(0, 3) }}
            </div>
            <div class="price">
              ${{ getCurrencyFormat(model.book_code.plan.total_price.slice(3)) }}
            </div>
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-text text-italic">
            <div>{{ deadline }}</div>
            <div>{{ cancellationText }}</div>
          </div>
        </div>
      </InfoRow>
      <InfoRow title="旅客特殊需求">
        <div class="info-field">
          <div class="info-field-label" v-for="(req, index) of (model.traveler_special_requests || [])" :key="index">
            {{ req }}
          </div>
          <div class="info-field-text"></div>
        </div>
      </InfoRow>
      <InfoRow title="訂購人資料">
        <div class="info-field">
          <div class="info-field-label">姓名</div>
          <div v-if="model.user.first_name" class="info-field-text">
            {{ model.user.first_name }} {{ model.user.last_name }}
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label">Email</div>
          <div class="info-field-text">{{ model.user.email }}</div>
        </div>
        <div class="info-field">
          <div class="info-field-label">Phone</div>
          <div class="info-field-text">{{ model.user.phone }}</div>
        </div>
      </InfoRow>
      <InfoRow title="出行人資料">
        <div class="row items-start q-gutter-lg">
          <div>
            <div class="info-field">
              <div class="info-field-label">姓名</div>
              <div v-if="model.passenger_user.first_name" class="info-field-text">
                {{ model.passenger_user.first_name }} {{ model.passenger_user.last_name }}
              </div>
            </div>
            <div class="info-field">
              <div class="info-field-label">Email</div>
              <div class="info-field-text">{{ model.passenger_user.email }}</div>
            </div>
            <div class="info-field">
              <div class="info-field-label">Phone</div>
              <div class="info-field-text">{{ model.passenger_user.phone }}</div>
            </div>
          </div>
          <q-btn color="primary" label="修改出行人" @click="onUpdateUser" />
        </div>
      </InfoRow>
      <InfoRow title="入住人資料">
        <div class="info-field">
          <div class="info-field-label">姓名</div>
          <div class="info-field-text">{{ model.traveler_firstname }} {{ model.traveler_lastname }}</div>
        </div>
        <div class="info-field">
          <div class="info-field-label">Email</div>
          <div class="info-field-text">{{ model.traveler_email }}</div>
        </div>
        <div class="info-field">
          <div class="info-field-label">Phone</div>
          <div class="info-field-text">{{ model.traveler_phone_number }}</div>
        </div>
      </InfoRow>
      <InfoRow title="付款方式">
        <div class="info-field">
          <div class="info-field-label">{{ model.book_code.guarantee }}</div>
          <div class="info-field-text"></div>
        </div>
        <div class="info-field">
          <div class="info-field-label">付款方式</div>
          <div class="info-field-text">{{ payDescp }}</div>
        </div>
      </InfoRow>
      <InfoRow title="酒店方案原始資料">
        <div class="info-field" v-for="(desc, idxDesc) of model.book_code.detail.RoomRateDescription" :key="idxDesc">
          <div class="info-field-label">{{ desc.Name }}</div>
          <div class="info-field-text">
            <div v-for="(text, idxText) of desc.Text" :key="idxText">{{ text }}</div>
          </div>
        </div>
      </InfoRow>
      <InfoRow title="實際利潤">
        <div class="info-field">
          <div class="info-field-label">利潤</div>
          <div class="info-field-text">{{ getCurrencyPriceFormat(model.final_profit) }}</div>
        </div>
      </InfoRow>
      <InfoRow title="預估利潤">
        <div class="info-field">
          <div class="info-field-label">每日房價</div>
        </div>
        <div class="info-field" v-for="(rate, index) of model.Profit.room_price" :key="index">
          <div class="info-field-label">{{ getDateStringNoTz(rate.EffectiveDate, 'MM DD, YYYY') }}</div>
          <div class="info-field-text flex q-pl-sm">
            <div class="price">
              {{ rate.Base }}
            </div>
          </div>
        </div>
        <div class="info-field">
          <div class="info-field-label q-mt-sm">利潤百分比</div>
          <q-form ref="profitForm" class="flex items-start q-gutter-sm">
            <q-input type="number" placeholder="請輸入利潤百分比" v-model.number="model.Profit.percent" outlined dense min="0" :rules="rules.profit" class="order-profit" />
            <q-btn color="primary" label="設定利潤" @click="onUpdateProfit" />
          </q-form>
        </div>
        <div class="info-field">
          <div class="info-field-label">利潤</div>
          <div class="info-field-text">
            {{ model.Profit.profit }}
          </div>
        </div>
      </InfoRow>
    </div>
    <CancelOrderDialog ref="cancelOrderRef" @confirm="onCancelConfirm"></CancelOrderDialog>
    <UserDialog ref="userDialogRef" @confirm="onUpdateUserConfirm" />
  </div>
</template>
<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { getHotelOrder, cancelHotelOrder, updateHotelOrderUser, updateHotelOrderProfit } from 'src/api'
import { isNumberEmpty, isValidDecimal, messages } from 'src/utils/validators';
import InfoRow from '../components/InfoRow.vue';
import RawDataInfo from 'src/pages/HotelList/plan/RawDataInfo.vue';
import CancelOrderDialog from '../components/CancelOrderDialog.vue';
import UserDialog from '../components/UserDialog.vue';
import BreadCrumbs from 'src/components/BreadCrumbs.vue';
import { getDateString, getCurrencyFormat, getCurrencyPriceFormat, getDateStringNoTz, isDateBefore } from 'src/utils/helpers';
import _ from 'lodash';

const to = require('await-to-js').default

const $q = useQuasar();
let route = useRoute();
let router = useRouter();

const model = ref();
const cancelOrderRef = ref();

const getData = async () => {
  $q.loading.show();
  const [err, res] = await to(getHotelOrder(route.params.orderNumber));
  $q.loading.hide();

  if (err) {
    console.error("getDetail error:", err);
    return;
  }
  model.value = res.data;
}

const statusText = computed(() => {
  switch (model.value.status) {
    case 'processing':
      return '預訂中';
    case 'success':
      return '預訂成功';
    case 'failed':
      return '預訂失敗';
    case 'cancelled':
      return '已取消';
    case 'cancel_failed':
      return '取消失敗';
    default:
      return `未知狀態: ${model.value.status}`;
  }
})

const isCancelled = computed(() => {
  return model.value.status === 'cancelled';
})

const isCancellable = computed(() => {
  // return !model.value.cancelled_at && ["processing", "success", "cancel_failed"].includes(model.value.status)
  return !model.value.cancelled_at && isDateBefore(new Date(), getDateString(model.value.check_in))
});

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
  // console.log('onCancelConfirm:', data);
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

const userDialogRef = ref();
const onUpdateUser = () => {
  userDialogRef.value.show({
    data: {
      id: model.value.passenger_user_id,
      title: model.value.passenger_user.title,
      name: model.value.passenger_user.first_name + model.value.passenger_user.last_name,
      email: model.value.passenger_user.email
    }
  });
}

const onUpdateUserConfirm = async (data: any) => {
  $q.loading.show();
  if (model.value.user.id !== data) {
    const [err, res] = await to(updateHotelOrderUser(model.value.order_number, {
      user_id: data
    }));
  }
  $q.loading.hide();
  getData();
}
const rules = computed(() => {
  return {
    profit: [
      val => !isNumberEmpty(val) || messages.requiredInput(),
      val => isValidDecimal(val, 1) || messages.invalidDecimal(1)
    ],
  }
})

const profitForm = ref();
const onUpdateProfit = async () => {
  if (await profitForm.value.validate()) {
    $q.loading.show();
      const [err, res] = await to(updateHotelOrderProfit(model.value.order_number, {
        profit_percent: model.value.Profit.percent
      }));
    $q.loading.hide();
    getData();
  }
}

const hasBreakfast = computed(() => {
  return model.value.book_code?.plan?.has_breakfast;
})

const isSmokingRoom = computed(() => {
  return model.value.book_code?.plan?.is_smoking_room;
})

const deadline = computed(() => {
  const cancelInfo = model.value.book_code?.plan?.cancel_info;
  if (cancelInfo && cancelInfo.deadline) {
    return `deadline: ${getDateStringNoTz(cancelInfo.deadline, "HH:mm MM DD, YYYY")}`
  }
  return null
})

const cancellationText = computed(() => {
  return 'cancellation: ' + model.value.book_code?.cancellation_texts.join(' ');
})

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

const rateRawData = computed(() => {
  let datas = <string[]>[];
  let roomRateDescps = model.value.book_code?.detail?.RoomRateDescription || [];
  for (let descp of roomRateDescps) {
    if (_.lowerCase(descp.Name).includes('rate')) {
      datas.push(...descp.Text);
    }
  }
  return datas;
});

const getPriceText = (priceStr: string) => {
  return {
    currency: priceStr.slice(0, 3),
    price: priceStr.slice(3)
  }
};

const getTaxAndFee = () => {
  const totalPrice = Number(model.value.book_code.plan.total_price.slice(3))
  let dailyPrice = 0;
  model.value.book_code.plan.daily_rate.map((d: any) => dailyPrice += Number(d.local_price.slice(3)))
  return totalPrice - dailyPrice;
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
:deep(.order-profit .q-field__control) {
  height: 36px;
  line-height: 36px;
}
</style>
