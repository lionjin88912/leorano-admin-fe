<template>
  <div>
    <BreadCrumbs />
    <q-form @submit.prevent="submitSearch" class="flex q-gutter-sm q-mt-sm">
      <q-select v-model="filter.hotelName" :options="hotelOptions" :loading="keywordLoading" :rules="rules.hotel" option-label="name" option-value="id" label="酒店或城市" @filter="filterKeyword" input-debounce="500" use-input clearable outlined dense />
      <q-field class="cursor-pointer" style="min-width: 200px;" v-model="filter.checkinDuration" label="入住日期區間"
        :stack-label="filter.checkinDuration ? true : false" :rules="rules.checkinDuration" outlined dense>
        <template #default>
          <DatePicker :date="filter.checkinDuration" :range="true" @updated="(val) => filter.checkinDuration = val">
          </DatePicker>
        </template>
        <template v-slot:control>
          <div v-if="filter.checkinDuration && filter.checkinDuration.from">
            {{ filter.checkinDuration.from }} - {{ filter.checkinDuration.to }}
          </div>
        </template>
      </q-field>
      <InputNumber v-model="filter.adults" label="成人" :min="1" :max="maxAdults" />
      <InputNumber v-model="filter.kids" label="孩童" :min="0" :max="maxKids" @update:modelValue="changeKids" />
      <q-select v-for="(n, index) in filter.kids" :key="index" v-model="filter.kidsAge[index]" label="孩童歲數" :options="[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]" class="kids-age-select" dense outlined />
      <q-btn type="submit" label="送出查詢" color="primary" class="filter-btn" unelevated />
      <q-btn label="清除" color="grey-3" class="text-grey-6 filter-btn" @click="clearFilter" unelevated />
    </q-form>
    <div class="row q-col-gutter-x-lg q-mt-sm">
      <div v-if="hotelList.length > 0" class="col-xs-12 col-md-3 q-gutter-md">
        <q-card v-for="(hotel, index) in hotelList" :key="index" :class="{'bg-blue-1 is-active': selected.hotel === hotel, 'cursor-pointer q-hoverable': selected.hotel !== hotel}" @click="changeHotel(hotel)" :flat="selected.hotel !== hotel" bordered>
          <div v-if="selected.hotel != hotel" class="q-focus-helper"></div>
          <q-card-section>
            <div class="text-overline">{{ hotel.brand }}</div>
            <h5 class="text-subtitle1 text-weight-medium">{{ hotel.display_name }}</h5>
            <div class="text-caption">{{ hotel.name }}</div>
            <ul class="card-tags q-pl-md q-my-md">
              <li v-for="(tag, index) in hotel.tags" :key="index">{{ tag }}</li>
            </ul>
            <div class="text-subtitle2 text-weight-bold">{{ getCurrencyPriceFormat(hotel.local_min_price) }} /晚 起 ({{ getCurrencyPriceFormat(hotel.min_price) }})</div>
          </q-card-section>
        </q-card>
      </div>
      <div v-if="roomList.length > 0" class="col-xs-12 q-gutter-md" :class="{'col-md-9': hotelList.length > 0}">
        <q-card v-for="(room, index) in roomList" :key="index" :class="{'bg-blue-1 is-active': selected.room === room}" @click="changeRoom(room)" :flat="selected.room !== room" bordered>
          <q-expansion-item group="room" expand-icon-class="hidden">
            <template v-slot:header>
              <div class="full-width flex items-end q-px-sm q-py-md">
                <div>
                  <h6>{{ room.room_display_name }}</h6>
                  <div class="text-body2 q-mt-sm">
                    <div v-for="(tag, index) in room.tags" :key="index">{{ tag.display_note }}</div>
                    <div>{{ room.size }} sqm</div>
                  </div>
                </div>
                <div class="col-grow text-right q-mr-md">
                  <div class="text-subtitle1 text-weight-medium">{{ getCurrencyPriceFormat(getMinPricePlan(room.plans).local_total_price) }} /晚 起 ({{ getCurrencyPriceFormat(getMinPricePlan(room.plans).total_price) }})</div>
                </div>
              </div>
            </template>
            <div class="q-pa-lg q-gutter-md">
              <q-card v-for="(plan, pIndex) in planList" :key="pIndex" class="bg-blue-grey-1" flat>
                <q-card-section class="flex items-end q-gutter-x-md">
                  <div>
                    <div class="text-subtitle2">{{ plan.display_name }}</div>
                    <ul class="card-tags q-pl-md q-mt-md">
                      <li v-for="(tag, ptIndex) in plan.tags" :key="ptIndex">{{ tag.display_note }}</li>
                    </ul>
                  </div>
                  <q-space />
                  <div class="text-right">
                    <div>取消期限：{{ getDateStringNoTz(plan.cancel_info.deadline, 'YYYY-MM-DD') }}</div>
                    <div class="text-weight-medium">{{ getCurrencyPriceFormat(plan.local_total_price) }} /晚 起 ({{ getCurrencyPriceFormat(plan.total_price) }})</div>
                  </div>
                  <q-btn label="預定" color="primary" @click.stop="submitBooking(plan)" outline />
                </q-card-section>
              </q-card>
            </div>
          </q-expansion-item>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { router } from 'src/router'
import { getDateStringNoTz, getCurrencyPriceFormat } from 'src/utils/helpers'
import { getHotelAutoComplete, getHotelSearchList, getHotelSearchRoomList } from 'src/api'
import { isEmpty, messages } from 'src/utils/validators'
import { useBookingStore } from "src/stores/booking";
import DatePicker from 'src/components/DatePicker.vue'
import BreadCrumbs from 'src/components/BreadCrumbs.vue'
import InputNumber from 'src/components/InputNumber.vue'
import to from 'await-to-js'

/* searchbar查詢 Start */
const rules = computed(() => {
  return {
    hotel: [(val) => !isEmpty(val) || messages.requiredInput()],
    checkinDuration: [(val) => !isEmpty(val) || messages.requiredInput()]
  };
});

const filter = reactive({
  hotelName: null,
  checkinDuration: null,
  adults: 1,
  kids: 0,
  kidsAge: []
});

// 輸入關鍵字，產生下拉選單
const keywordLoading = ref(false)
const hotelOptions = ref([])
const filterKeyword = async (val, update, abort) => {
  if (!val) {
    abort()
    return
  }

  // 開始加載
  keywordLoading.value = true

  try {
    // 使用 update callback 來更新選項
    update(async () => {
      const [err, res] = await to(getHotelAutoComplete({
        lang: 'zh-TW',
        keyword: val
      }));
      if (res && res.code === 0) {
        hotelOptions.value = res.data
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    hotelOptions.value = []
  } finally {
    keywordLoading.value = false
  }
}

// 計算最大成人孩童數量
const TOTAL_PEOPLE = 4;
const maxAdults = computed(() => TOTAL_PEOPLE - filter.kids);
const maxKids = computed(() => TOTAL_PEOPLE - filter.adults);

// 孩童年齡改變
const changeKids = () => {
  if (filter.kidsAge.length > filter.kids) {
    filter.kidsAge.splice(filter.kids, 1)
  } else {
    filter.kidsAge.push(0)
  }
}

// 送出查詢
const hotelList = ref([])
const roomList = ref([])
const submitSearch = async () => {
  clearSelected();
  if (!filter.hotelName || !filter.checkinDuration) {
    return;
  }

  if (filter.hotelName.type === 'city') {
    const [err, res] = await to(getHotelSearchList({
      from: filter.checkinDuration.from,
      to: filter.checkinDuration.to,
      num_of_adults: filter.adults,
      children: filter.kidsAge,
      location_id: filter.hotelName.id
    }));

    if (res?.code === 0) {
      hotelList.value = res.data;
    }
  } else if (filter.hotelName.type === 'hotel') {
    searchHotelRoom(filter.hotelName.id.replace('hotel-', ''));
  }
};

// 清空查詢條件
const clearFilter = () => {
  filter.hotelName = null;
  filter.checkinDuration = null;
  filter.adults = 0;
  filter.kids = 0;
};

// 清空選擇
const clearSelected = () => {
  selected.hotel = null;
  selected.room = null;
  selected.plan = null;
  hotelList.value = [];
  roomList.value = [];
}
/* searchbar查詢 End */

const selected = reactive({
  hotel: null,
  room: null,
  plan: null
})
// 選擇酒店
const changeHotel = (item) => {
  selected.hotel = item
  searchHotelRoom(item.id);
}

// 搜尋房型
const searchHotelRoom = async (hotelId) => {
  const [err, res] = await to(getHotelSearchRoomList(hotelId, {
    from: filter.checkinDuration.from,
    to: filter.checkinDuration.to,
    num_of_adults: filter.adults,
    children: filter.kidsAge,
    currency: 'TWD',
    lang: 'zh-TW'
  }));

  if (res?.code === 0) {
    roomList.value = res.data;
  }
}
// 取得最低價格方案
const getMinPricePlan = (plans) => {
  const prices = plans.map(plan => Number(plan.total_price.slice(3)))
  const minIndex = prices.indexOf(Math.min(...prices))
  return plans[minIndex]
}

// 選擇房型
const planList = ref([])
const changeRoom = (room) => {
  if (selected.room == room) {
    selected.room = null
  } else {
    selected.room = room
    planList.value = room.plans
  }
}

const bookingStore = useBookingStore()
const submitBooking = (plan) => {
  selected.plan = plan
  bookingStore.booking({...filter, ...selected})
  router.push({ name: 'HotelOrderBooking' })
}
</script>

<style lang="scss" scoped>
.filter-btn {
  height: 40px;
}
.kids-age-select {
  width: 115px;
}
.q-card.is-active {
  border-color: $blue-3;
  box-shadow: 0 1px 5px rgba($blue, 0.2), 0 2px 2px rgba($blue, 0.14), 0 3px 1px -2px rgba($blue, 0.12);
  transition: all 0.3s ease;
}
.card-tags {
  list-style: disc;
}
</style>
