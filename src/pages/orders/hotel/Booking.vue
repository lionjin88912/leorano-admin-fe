<template>
  <div class="q-gutter-y-md">
    <BreadCrumbs class="q-pb-md"></BreadCrumbs>
    <!-- 載入狀態 -->
    <div v-if="loading" class="q-pa-md text-center">
      <q-spinner size="50px" />
      <div class="q-mt-md">載入飯店詳情...</div>
    </div>
    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="q-pa-md text-center">
      <q-icon name="error" size="50px" color="negative" />
      <div class="q-mt-md text-negative">{{ error }}</div>
    </div>
    <!-- 正常顯示狀態 -->
    <div v-else-if="Object.keys(bookingStore.state).length > 0 && bookingStore.state.hotel" class="row q-col-gutter-xl">
      <div class="col-12 col-md-6">
        <InfoRow title="訂房資訊">
          <div class="info-field">
            <div class="info-field-label">酒店</div>
            <div class="info-field-text">{{ bookingStore.state.hotel?.display_name || 'Unknown Hotel' }}</div>
          </div>
          <div class="info-field">
            <div class="info-field-label">房型</div>
            <div class="info-field-text">
              <p>{{ bookingStore.state.room?.room_name || 'Unknown Room' }}</p>
              <ul class="info-field-list">
                <li v-for="(tag, index) in (bookingStore.state.room?.tags || [])" :key="`room_${index}`">{{ tag.display_note }}</li>
              </ul>
            </div>
          </div>
          <div class="info-field">
            <div class="info-field-label">方案</div>
            <div class="info-field-text">
              <p>{{ bookingStore.state.plan?.display_name || 'Unknown Plan' }}</p>
              <ul class="info-field-list">
                <li v-for="(tag, index) in (bookingStore.state.plan?.tags || [])" :key="`plan_${index}`">{{ tag.display_note }}</li>
              </ul>
            </div>
          </div>
          <div class="info-field">
            <div class="info-field-label">入住日期</div>
            <div class="info-field-text">{{ bookingStore.state.checkinDuration?.from || '' }} ~ {{ bookingStore.state.checkinDuration?.to || '' }} ({{ bookingDays }} 晚)</div>
          </div>
          <div class="info-field">
            <div class="info-field-label">入住人數</div>
            <div class="info-field-text">
              <span>{{ bookingStore.state.adults || 0 }} 大人</span>
              <span v-if="(bookingStore.state.kids || 0) > 0">、{{ bookingStore.state.kids }} 小孩 ({{ kidsAge }})</span>
            </div>
          </div>
        </InfoRow>
      </div>
      <div class="daily-price col-12 col-md-6">
        <InfoRow title="每日房價">
          <div class="info-field" v-for="daily in (bookingStore.state.plan?.daily_rate || [])" :key="daily.date">
            <div class="info-field-label">{{ getDateStringNoTz(daily.date, 'MM DD, YYYY') }}</div>
            <div class="info-field-text flex q-pl-sm">
              <div class="currency q-pr-xs">
                {{ getPriceText(daily.local_price).currency }}
              </div>
              <div class="price">
                ${{ getNumberFormat(getPriceText(daily.local_price).price) }}
              </div>
            </div>
          </div>
          <div class="flex-1 bordered-dash q-mx-lg q-my-xs"></div>
          <div class="info-field">
            <div class="info-field-label">稅金與費用</div>
            <div class="info-field-text flex q-pl-sm">
              <div class="currency q-pr-xs">
                {{ bookingStore.state.plan?.tax ? getPriceText(bookingStore.state.plan.tax).currency : 'TWD' }}
              </div>
              <div class="price">
                ${{ bookingStore.state.plan?.tax ? getNumberFormat(getPriceText(bookingStore.state.plan.tax).price) : 0 }}
              </div>
            </div>
          </div>
          <div class="info-field text-bold text-subtitle1">
            <div class="info-field-label">總金額</div>
            <div class="info-field-text flex q-pl-sm">
              <div class="currency q-pr-xs">
                {{ bookingStore.state.plan?.local_total_price ? getPriceText(bookingStore.state.plan.local_total_price).currency : 'TWD' }}
              </div>
              <div class="price">
                ${{ bookingStore.state.plan?.local_total_price ? getNumberFormat(getPriceText(bookingStore.state.plan.local_total_price).price) : 0 }}
              </div>
            </div>
          </div>
          <div class="info-field">
            <div class="info-field-label">參考貨幣</div>
            <div class="info-field-text flex q-pl-sm">
              <div class="currency q-pr-xs">
                {{ bookingStore.state.plan?.total_price ? getPriceText(bookingStore.state.plan.total_price).currency : 'USD' }}
              </div>
              <div class="price">
                ${{ bookingStore.state.plan?.total_price ? getNumberFormat(getPriceText(bookingStore.state.plan.total_price).price) : 0 }}
              </div>
            </div>
          </div>
        </InfoRow>
      </div>
    </div>
    <InfoRow title="其他資訊">
      <div class="info-field">
        <div class="info-field-label">取消期限</div>
        <div class="info-field-text">{{ bookingStore.state.plan?.cancel_info?.deadline ? getDateStringNoTz(bookingStore.state.plan.cancel_info.deadline, 'HH:mm MM DD, YYYY') : 'N/A' }}</div>
      </div>
      <div v-if="data && data.original_texts && data.original_texts.length > 0" class="info-field">
        <div class="info-field-label">原始方案資訊</div>
        <div class="info-field-text">
          <div class="cursor-pointer q-gutter-x-xs" @click="isShowOriginalPlanInfo = !isShowOriginalPlanInfo">
            <span class="text-underline">查看</span>
            <q-icon name="expand_more" class="transition-300" size="1.5em" :class="{ 'rotate-180': isShowOriginalPlanInfo }" />
          </div>
          <q-slide-transition>
            <div v-show="isShowOriginalPlanInfo">
              <div v-for="original in data.original_texts" :key="`original_${original.type}`" class="info-field">
                <div class="info-field-label text-left">{{ original.type }}</div>
                <div class="info-field-text">
                  <ul class="info-field-list">
                    <li v-for="(text, index) in original.text" :key="`text_${index}`">{{ text }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </q-slide-transition>
        </div>
      </div>
    </InfoRow>
    <!-- 載入、錯誤或無資料時不顯示表單 -->
    <div v-if="!loading && !error && Object.keys(bookingStore.state).length > 0 && bookingStore.state.hotel">
      <q-form ref="formRef" class="q-gutter-y-md">
      <InfoRow title="入住人資訊">
        <div class="q-mt-md">
          <div class="row q-col-gutter-md">
            <q-input v-model="form.firstName" label="名字" placeholder="須與護照相同" class="col-12 col-sm-6 col-md-3 uppercase" :rules="rules.firstName" outlined dense />
            <q-input v-model="form.lastName" label="姓氏" placeholder="須與護照相同" class="col-12 col-sm-6 col-md-3 uppercase" :rules="rules.lastName" outlined dense />
            <q-select v-model="form.title" :options="titleOptions" label="稱謂" class="col-12 col-sm-6 col-md-3" :rules="rules.title" outlined dense />
            <InputPhone v-model="form.phone" class="col-12 col-sm-6 col-md-3" />
            <q-input v-model="form.email" label="電子信箱" class="col-12 col-sm-6 col-md-3" :rules="rules.email" outlined dense />
            <q-select v-model="form.estimated_arrival_time" :options="arrivalTimeOptions" label="預計抵達酒店時間" class="col-12 col-sm-6 col-md-3" outlined dense />
          </div>
        </div>
      </InfoRow>
      <InfoRow title="特殊需求">
        <div class="q-my-md">
          <p class="text-body2 text-grey-7">請勾選符合您所需的特殊需求，恕不保證一定能滿足特別需求或提供無障礙設施。若您沒有收到酒店方面的回覆，請直接與酒店方面聯繫。酒店方面可能針對部分特殊需求收取費用（例如加床...等等）</p>
          <div class="row q-col-gutter-md">
            <q-checkbox v-for="requirement in specialRequirementOptions" :key="requirement.value" v-model="form.special_requests" :label="requirement.label" :val="requirement.value" />
          </div>
        </div>
      </InfoRow>
      <InfoRow title="酒店會員計劃">
        <div class="q-my-md">
          <div class="row q-col-gutter-md">
            <q-input v-model="form.loyalty_number" label="會員編號" class="col-12 col-sm-6 col-md-3" outlined dense />
          </div>
        </div>
      </InfoRow>
      <InfoRow title="信用卡資訊">
        <div class="q-my-md">
          <div class="row q-col-gutter-md">
            <q-input v-model="form.card_holder_name" label="持卡人姓名" placeholder="會員編號" class="col-12 col-sm-6 col-md-3 uppercase" :rules="rules.card_holder_name" outlined dense />
            <q-input v-model="form.card_number" label="信用卡卡號" mask="#### #### #### ####" class="col-12 col-sm-6 col-md-3" :rules="rules.card_number" unmasked-value outlined dense />
            <q-input v-model="form.expired_date" label="有限期限" mask="##/##" class="col-12 col-sm-6 col-md-3" :rules="rules.expired_date" outlined dense />
          </div>
        </div>
      </InfoRow>
      <div class="row justify-end q-gutter-md">
        <q-btn label="預定" color="primary" class="q-px-lg" @click="onSubmit" />
      </div>
    </q-form>
    </div>
    <!-- 無資料狀態 -->
    <div v-else-if="!loading && !error" class="q-pa-md text-center">
      <q-icon name="info" size="50px" color="info" />
      <div class="q-mt-md">沒有可用的飯店資料</div>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar';
import { ref, reactive, computed, onMounted, onBeforeMount } from 'vue'
import { router } from 'src/router';
import InfoRow from '../components/InfoRow.vue'
import { titleOptions, arrivalTimeOptions, specialRequirementOptions } from '../enums'
import { getDateStringNoTz, getNumberFormat } from 'src/utils/helpers'
import { getHotelSearchPlan, createHotelOrder } from 'src/api'
import { messages, isEmpty, isValidEmail } from "src/utils/validators"
import { useBookingStore } from "src/stores/booking"
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import InputPhone from 'src/components/InputPhone.vue'
import DatePicker from 'src/components/DatePicker.vue'
import to from 'await-to-js'

const bookingDays = computed(() => {
  // 用 checkinDuration.from 和 checkinDuration.to 計算出總天數
  if (!bookingStore.state.checkinDuration?.from || !bookingStore.state.checkinDuration?.to) {
    return 0;
  }
  const from = new Date(bookingStore.state.checkinDuration.from)
  const to = new Date(bookingStore.state.checkinDuration.to)
  const diffTime = Math.abs(to - from)
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
})
const kidsAge = computed(() => {
  if (!bookingStore.state.kidsAge || bookingStore.state.kidsAge.length === 0) {
    return '';
  }
  return bookingStore.state.kidsAge.map(age => `${age}歲`).join('、')
})

const data = ref(null)
const loading = ref(false)
const error = ref('')
const bookingStore = useBookingStore()
const isShowOriginalPlanInfo = ref(false);

onBeforeMount(() => {
  if (Object.keys(bookingStore.state).length === 0) {
    router.back();
  }
})

onMounted(async () => {
  console.log("bookingStore.state", bookingStore.state);
  
  // 檢查必要的資料是否存在
  if (!bookingStore.state.hotelName?.id) {
    error.value = '缺少飯店資訊，無法載入詳細資料';
    return;
  }
  
  try {
    loading.value = true;
    error.value = '';
    
    const [err, res] = await to(getHotelSearchPlan(bookingStore.state.hotelName.id, {
      from: bookingStore.state.checkinDuration?.from,
      to: bookingStore.state.checkinDuration?.to,
      num_of_adults: bookingStore.state.adults || 1,
      children: bookingStore.state.kidsAge || [],
      plan_code: bookingStore.state.plan?.plan_code,
      currency: 'TWD',
      lang: 'zh-TW',
      notify: 0
    }));
    
    if (err) {
      console.error('API 調用失敗:', err);
      error.value = '無法載入飯店詳細資料，請稍後再試';
      return;
    }
    
    if (res?.code === 0 && res.data) {
      data.value = res.data;
      // 更新 bookingStore 中的資料以確保一致性
      if (res.data.hotel) {
        bookingStore.state.hotel = { 
          ...bookingStore.state.hotel, 
          ...res.data.hotel 
        };
      }
      if (res.data.plan) {
        bookingStore.state.plan = { 
          ...bookingStore.state.plan, 
          ...res.data.plan 
        };
      }
    } else {
      error.value = res?.message || '資料格式不正確';
    }
  } catch (apiError) {
    console.error('API 調用異常:', apiError);
    error.value = '載入過程中發生錯誤，請稍後再試';
  } finally {
    loading.value = false;
  }
})

const form = reactive({
  title: 'Mr.',
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  estimated_arrival_time: '02:00 ~ 21:00',
  special_requests: [],
  loyalty_number: '',
  card_holder_name: '',
  card_number: '',
  expired_date: ''
})

const rules = computed(() => {
  return {
    firstName: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => /^[A-Za-z]+$/.test(val) || '需為英文不含符號',
    ],
    lastName: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => /^[A-Za-z]+$/.test(val) || '需為英文不含符號',
    ],
    title: [
      val => !isEmpty(val) || messages.requiredInput(),
    ],
    email: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => isValidEmail(val) || messages.email()
    ],
    card_holder_name: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => /^[A-Za-z\s]+$/.test(val) || '需為英文不含符號',
    ],
    card_number: [
      val => !isEmpty(val) || messages.requiredInput(),
    ],
    expired_date: [
      val => !isEmpty(val) || messages.requiredInput(),
      val => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val) || '需為MM/YY格式',
    ],
  };
});

const getPriceText = priceStr => {
  if (!priceStr || typeof priceStr !== 'string' || priceStr.length < 4) {
    return {
      currency: 'TWD',
      price: '0'
    };
  }
  return {
    currency: priceStr.slice(0, 3),
    price: priceStr.slice(3)
  }
};
const $q = useQuasar();
const formRef = ref();
const onSubmit = () => {
  $q.loading.show();
  formRef.value.validate().then(async success => {
    if (success) {
      const [err, res] = await to(createHotelOrder({
        book_code: data.value.book_code,
        traveller_info: {
          title: form.title,
          first_name: form.firstName.toUpperCase(),
          last_name: form.lastName.toUpperCase(),
          phone: form.phone.trim(),
          email: form.email,
          estimated_arrival_time: form.estimated_arrival_time,
          special_requests: form.special_requests,
          loyalty_number: form.loyalty_number
        },
        credit_card: {
          card_holder_name: form.card_holder_name.toUpperCase(),
          card_number: form.card_number,
          expired_date: form.expired_date
        },
        is_booking_for_other: false
      }));
      router.push({ name: "HotelOrderDetail", params: { orderNumber: res.data.order_id } });
    } else {
      const errorEl = document.querySelector('.q-field--error');
      window.scrollTo({
        top: errorEl.getBoundingClientRect().top + window.pageYOffset - 100,
        behavior: 'smooth'
      });
    }
  })
  $q.loading.hide();
}
</script>

<style scoped>
.text-underline {
  text-decoration: underline;
}
.transition-300 {
  transition: transform 0.3s ease-in-out;
}
.daily-price .currency {
  min-width: 40px;
}
.daily-price .price {
  min-width: 110px;
}
.uppercase {
  text-transform: uppercase;
}
</style>
