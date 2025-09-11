<template>
  <div>
    <p class="q-mb-md">昨日會員新增人數：<span class="text-h6">{{ getNumberFormat(yesterDayMember) }}</span> 人</p>
    <h6 class="q-mb-sm">近 7 天入住酒店訂單</h6>
    <q-table 
      :rows="hotelOrderList" 
      :columns="columns" 
      :pagination="pagination" 
      :rows-per-page-options="pagination.perPage" 
      class="data-table"
      binary-state-sort
      no-data-label="無訂單資料">
      <template v-slot:body-cell-order_number="props">
        <q-td class="link" @click="goDetail(props.row.order_number)">
          {{ props.row.order_number }}
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getNumberFormat } from 'src/utils/helpers'
import { getDashboardNewMember, getDashboardHotelOrder } from 'src/api'
import { router } from 'src/router'
import { columns } from './enums'
import TableComponent from 'src/components/TableComponent.vue'
import to from 'await-to-js'

const pagination = ref({
  rowsPerPage: 10,
  perPage: [10, 20, 50],
  sortBy: 'checkin',
  descending: false
})

onMounted(async () => {
  getYesterdayNewMember()
  getHotelOrderLastWeek()
})

/* 昨日會員新增人數 Start */
const yesterDayMember = ref(0)
const getYesterdayNewMember = async () => {
  const year = new Date().getFullYear()
  const month = new Date().getMonth() + 1
  const day = new Date().getDate() - 1
  const [err, res] = await to(getDashboardNewMember(year, month, day))
  if (err) {
    console.error(err)
    return
  }
  yesterDayMember.value = res.data
}
/* 昨日會員新增人數 End */

/* 近 7 天入住酒店訂單 Start */
const hotelOrderList = ref([])
const getHotelOrderLastWeek = async () => {
  const [err, res] = await to(getDashboardHotelOrder(7))
  if (err) {
    console.error(err)
    return
  }
  // 按入住日期排序，越近的日期在最上面
  hotelOrderList.value = res.data.sort((a, b) => {
    const dateA = new Date(a.checkin)
    const dateB = new Date(b.checkin)
    return dateA - dateB // 升序排列，讓越近的日期在最前面
  })
}
/* 近 7 天入住酒店訂單 End */

const goDetail = (orderNumber) => {
  router.push({ name: "HotelOrderDetail", params: { orderNumber } });
}
</script>