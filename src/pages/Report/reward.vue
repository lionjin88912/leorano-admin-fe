<template>
  <div>
    <BreadCrumbs />
    <div class="row q-col-gutter-x-md q-my-md">
      <div class="col-4">
        <q-card flat bordered>
          <q-card-section class="row q-col-gutter-xl">
            <div class="col-12">
              <div class="text-subtitle1 text-weight-medium q-mb-xs">總發放點數</div>
              <div class="relative-position">
                <q-inner-loading :showing="isLoading.allSend" />
                <div v-if="!isLoading.allSend" class="text-h3">{{ getNumberFormat(allSendAmount) }}</div>
              </div>
            </div>
            <div class="col-12">
              <div class="text-subtitle1 text-weight-medium q-mb-xs">總發放比例</div>
              <div class="relative-position">
                <q-inner-loading :showing="isLoading.percentSend" />
                <apexchart v-if="!isLoading.percentSend" :options="rewardSendChartOptions" :series="sendSeries" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-8">
        <q-card flat bordered>
          <q-card-section class="row q-col-gutter-xl">
            <div class="col-6">
              <div class="text-subtitle1 text-weight-medium q-mb-xs">總使用點數</div>
              <div class="relative-position">
                <q-inner-loading :showing="isLoading.allUsed" />
                <div v-if="!isLoading.allUsed" class="text-h3">{{ getNumberFormat(Math.abs(allUsedAmount)) }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="text-subtitle1 text-weight-medium q-mb-xs">總過期點數</div>
              <div class="relative-position">
                <q-inner-loading :showing="isLoading.allExpired" />
                <div v-if="!isLoading.allExpired" class="text-h3">{{ getNumberFormat(allExpiredAmount) }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="text-subtitle1 text-weight-medium q-mb-xs">已發放 使用比例</div>
              <div class="relative-position">
                <q-inner-loading :showing="isLoading.percentUsed" />
                <apexchart v-if="!isLoading.percentUsed" :options="rewardUsedChartOptions" :series="usedSeries" />
              </div>
            </div>
            <div class="col-6">
              <div class="text-subtitle1 text-weight-medium q-mb-md">到期點數</div>
              <div class="relative-position">
                <q-inner-loading :showing="isLoading.expired" />
                <q-table v-if="!isLoading.expired" :rows="expiredDatas" :columns="rewardColumns" :pagination="pagination" class="data-table" flat dense hide-pagination />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getRewardAllSend, getRewardAllUsed, getRewardAllExpired, getRewardExpired, getRewardPercentSend, getRewardPercentUsed } from '/src/api'
import { rewardSendChartOptions, rewardUsedChartOptions, rewardColumns } from './enums'
import { getNumberFormat } from 'src/utils/helpers'
import BreadCrumbs from '/src/components/BreadCrumbs.vue'
import apexchart from "vue3-apexcharts"
import to from 'await-to-js'

const isLoading = reactive({
  allSend: true,
  allUsed: true,
  allExpired: true,
  expired: true,
  percentSend: true,
  percentUsed: true
})
onMounted(async () => {
  try {
    getRewardAllSendData()
    getRewardAllUsedData()
    getRewardAllExpiredData()
    getRewardExpiredData()
    getRewardPercentSendData()
    getRewardPercentUsedData()
  } catch (error) {
    console.error(error)
  }
})
/* 總發放點數 Start */
const allSendAmount = ref(0)
const getRewardAllSendData = async () => {
  const [err, res] = await to(getRewardAllSend())
  isLoading.allSend = false
  if (res.code != 0)
    return
  
  allSendAmount.value = res.data.amount
}
/* 總發放點數 End */

/* 總使用點數 Start */
const allUsedAmount = ref(0)
const getRewardAllUsedData = async () => {
  const [err, res] = await to(getRewardAllUsed())
  isLoading.allUsed = false
  if (res.code != 0)
    return
  
  allUsedAmount.value = res.data.amount
}
/* 總使用點數 End */

/* 總過期點數 Start */
const allExpiredAmount = ref(0)
const getRewardAllExpiredData = async () => {
  const [err, res] = await to(getRewardAllExpired())
  isLoading.allExpired = false
  if (res.code != 0)
    return
  
  allExpiredAmount.value = res.data.amount
}
/* 總過期點數 End */

/* 到期點數 Start */
const expiredDatas = ref([])
const pagination = ref({
  rowsPerPage: 0
})
const getRewardExpiredData = async () => {
  const [err, res] = await to(getRewardExpired())
  isLoading.expired = false
  if (res.code != 0)
    return
  
  if (res.data)
    expiredDatas.value = res.data
}
/* 到期點數 End */

/* 總發放點數比例 Start */
const sendSeries = ref([])
const getRewardPercentSendData = async () => {
  const [err, res] = await to(getRewardPercentSend())
  isLoading.percentSend = false
  if (res.code != 0)
    return
  
  sendSeries.value = Object.values(res.data).map((value) => parseFloat(Math.abs(value).toFixed(2)))
}
/* 總發放點數比例 End */

/* 總使用點數比例 Start */
const usedSeries = ref([])
const getRewardPercentUsedData = async () => {
  const [err, res] = await to(getRewardPercentUsed())
  isLoading.percentUsed = false
  if (res.code != 0)
    return
  
  usedSeries.value = Object.values(res.data).map((value) => parseFloat(Math.abs(value).toFixed(2)))
}
/* 總使用點數比例 End */
</script>